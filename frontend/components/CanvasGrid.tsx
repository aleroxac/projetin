"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WIDGET_REGISTRY } from "@/lib/widgetData";
import Widget from "@/components/Widget";
import { WidgetContent, useDietData } from "@/components/WidgetContent";
import type { WidgetLayout } from "@/lib/types";

// ── Grid constants ────────────────────────────────────────────────────────────
const COLS    = 6;
const SNAP_T  = 0.4;
const EXTRA_R = 3;

function dynRowH(containerWidth: number) { return Math.max(100, Math.round(containerWidth / 9)); }
function dynGap(containerWidth: number)  { return Math.max(10,  Math.round(containerWidth / 85)); }

// ── Grid math ─────────────────────────────────────────────────────────────────
function colW(containerWidth: number, gap: number) {
  return Math.floor((containerWidth - (COLS - 1) * gap) / COLS);
}
function toPxX(gx: number, cw: number, gap: number)          { return gx * (cw + gap); }
function toPxY(gy: number, rowH: number, gap: number)        { return gy * (rowH + gap); }
function toPxW(gw: number, cw: number, gap: number)          { return gw * cw + (gw - 1) * gap; }
function toPxH(gh: number, rowH: number, gap: number)        { return gh * rowH + (gh - 1) * gap; }
function toGridW(pxW: number, cw: number, gap: number)       { return Math.round((pxW + gap) / (cw + gap)); }
function toGridH(pxH: number, rowH: number, gap: number)     { return Math.round((pxH + gap) / (rowH + gap)); }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ── Grid snap ─────────────────────────────────────────────────────────────────
function snapToGrid(
  rawX: number, rawY: number, w: number, h: number,
  id: string, layouts: WidgetLayout[]
): { x: number; y: number } {
  let sx = Math.round(rawX);
  let sy = Math.round(rawY);

  for (const o of layouts) {
    if (o.id === id) continue;
    for (const t of [o.x, o.x + o.w]) {
      if (Math.abs(rawX - t) < SNAP_T)     sx = t;
      if (Math.abs(rawX + w - t) < SNAP_T) sx = t - w;
    }
    for (const t of [o.y, o.y + o.h]) {
      if (Math.abs(rawY - t) < SNAP_T)     sy = t;
      if (Math.abs(rawY + h - t) < SNAP_T) sy = t - h;
    }
  }

  return { x: clamp(sx, 0, COLS - w), y: Math.max(0, sy) };
}

// ── Auto-push: after a drop, push any overlapping widget downward ─────────────
function resolveOverlaps(layouts: WidgetLayout[], movedId: string): WidgetLayout[] {
  const moved = layouts.find(l => l.id === movedId);
  if (!moved) return layouts;

  // Process other widgets top-to-bottom; each is pushed down until it clears
  // every already-placed widget.  The moved widget has positional priority.
  const others = layouts
    .filter(l => l.id !== movedId)
    .sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x));

  const placed: WidgetLayout[] = [moved];

  for (const w of others) {
    let widget = { ...w };
    while (
      placed.some(
        p =>
          widget.x < p.x + p.w &&
          widget.x + widget.w > p.x &&
          widget.y < p.y + p.h &&
          widget.y + widget.h > p.y,
      )
    ) {
      widget = { ...widget, y: widget.y + 1 };
    }
    placed.push(widget);
  }

  return placed;
}

// ── Resize bounds (prevent resize from eating into adjacent widgets) ──────────
function computeResizeBounds(
  layout: WidgetLayout, maxSpan: number, minH: number, layouts: WidgetLayout[]
): { maxW: number; maxH: number } {
  let maxW = Math.min(maxSpan, COLS - layout.x);
  let maxH = 20;

  for (const o of layouts) {
    if (o.id === layout.id) continue;
    const rowOvlp = o.y < layout.y + layout.h && o.y + o.h > layout.y;
    if (rowOvlp && o.x >= layout.x + layout.w) maxW = Math.min(maxW, o.x - layout.x);
    const colOvlp = o.x < layout.x + layout.w && o.x + o.w > layout.x;
    if (colOvlp && o.y >= layout.y + layout.h) maxH = Math.min(maxH, o.y - layout.y);
  }

  return { maxW: Math.max(maxW, 1), maxH: Math.max(maxH, minH) };
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface DragState {
  id: string; el: HTMLDivElement;
  startX: number; startY: number;
  startGX: number; startGY: number;
  w: number; h: number;
  pendingX: number; pendingY: number;
  pointerId: number;
}
interface ResizeState {
  id: string; el: HTMLDivElement;
  type: "e" | "s" | "se";
  startX: number; startY: number;
  startGW: number; startGH: number;
  minW: number; minH: number; maxW: number; maxH: number;
  pendingW: number; pendingH: number;
  pointerId: number;
}

interface CanvasGridProps {
  layouts: WidgetLayout[];
  onChange: (layouts: WidgetLayout[]) => void;
  onRemove: (id: string) => void;
}

export default function CanvasGrid({ layouts, onChange, onRemove }: CanvasGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRef    = useRef<HTMLDivElement>(null);
  const widgetEls    = useRef<Record<string, HTMLDivElement | null>>({});
  const drag         = useRef<DragState | null>(null);
  const resize       = useRef<ResizeState | null>(null);
  const cwRef        = useRef(0);
  const rowHRef      = useRef(130);
  const gapRef       = useRef(14);

  // Refs so native document listeners always see current values without stale closures
  const layoutsRef  = useRef(layouts);
  const onChangeRef = useRef(onChange);
  layoutsRef.current  = layouts;
  onChangeRef.current = onChange;

  const [containerW, setContainerW] = useState(0);
  const [rowH, setRowH] = useState(130);
  const [gap, setGap]   = useState(14);

  // ── ResizeObserver ─────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const rh = dynRowH(w);
      const g  = dynGap(w);
      setContainerW(w);
      setRowH(rh);
      setGap(g);
      cwRef.current  = colW(w, g);
      rowHRef.current = rh;
      gapRef.current  = g;
    });
    ro.observe(el);
    const initial = el.clientWidth;
    const rh0 = dynRowH(initial);
    const g0  = dynGap(initial);
    setContainerW(initial);
    setRowH(rh0);
    setGap(g0);
    cwRef.current  = colW(initial, g0);
    rowHRef.current = rh0;
    gapRef.current  = g0;
    return () => ro.disconnect();
  }, []);

  // ── Native document listeners ──────────────────────────────────────────────
  // Using native events (not React synthetic) is the only reliable way to catch
  // pointermove/pointerup regardless of which element has pointer capture.
  useEffect(() => {
    function showShadow(x: number, y: number, w: number, h: number) {
      const el = shadowRef.current;
      const cw = cwRef.current;
      const rh = rowHRef.current;
      const g  = gapRef.current;
      if (!el || cw === 0) return;
      el.style.display    = "block";
      el.style.left       = `${toPxX(x, cw, g)}px`;
      el.style.top        = `${toPxY(y, rh, g)}px`;
      el.style.width      = `${toPxW(w, cw, g)}px`;
      el.style.height     = `${toPxH(h, rh, g)}px`;
      el.style.border     = "2px dashed var(--blue)";
      el.style.background = "rgba(59,130,246,0.06)";
    }
    function hideShadow() {
      if (shadowRef.current) shadowRef.current.style.display = "none";
    }

    function onMove(e: PointerEvent) {
      const cw = cwRef.current;

      const dr = drag.current;
      if (dr && e.pointerId === dr.pointerId) {
        const dx = e.clientX - dr.startX;
        const dy = e.clientY - dr.startY;
        dr.el.style.transform = `translate(${dx}px,${dy}px)`;

        const g  = gapRef.current;
        const rh = rowHRef.current;
        const rawGX = dr.startGX + dx / (cw + g);
        const rawGY = dr.startGY + dy / (rh + g);
        const snapped = snapToGrid(rawGX, rawGY, dr.w, dr.h, dr.id, layoutsRef.current);

        // Always accept: auto-push handles collisions on drop
        dr.pendingX = snapped.x;
        dr.pendingY = snapped.y;
        showShadow(snapped.x, snapped.y, dr.w, dr.h);
        return;
      }

      const rr = resize.current;
      if (rr && e.pointerId === rr.pointerId) {
        const dx = e.clientX - rr.startX;
        const dy = e.clientY - rr.startY;
        const g  = gapRef.current;
        const rh = rowHRef.current;
        const rawPxW = toPxW(rr.startGW, cw, g) + dx;
        const rawPxH = toPxH(rr.startGH, rh, g) + dy;

        const snapW = (rr.type === "e" || rr.type === "se")
          ? clamp(toGridW(rawPxW, cw, g), rr.minW, rr.maxW)
          : rr.startGW;
        const snapH = (rr.type === "s" || rr.type === "se")
          ? clamp(toGridH(rawPxH, rh, g), rr.minH, rr.maxH)
          : rr.startGH;

        rr.pendingW = snapW;
        rr.pendingH = snapH;

        if (rr.type === "e" || rr.type === "se") rr.el.style.width  = `${toPxW(snapW, cw, g)}px`;
        if (rr.type === "s" || rr.type === "se") rr.el.style.height = `${toPxH(snapH, rh, g)}px`;

        const layout = layoutsRef.current.find(l => l.id === rr.id);
        if (layout) showShadow(layout.x, layout.y, snapW, snapH);
      }
    }

    function onUp(e: PointerEvent) {
      const dr = drag.current;
      if (dr && e.pointerId === dr.pointerId) {
        dr.el.style.transform = "";
        dr.el.style.zIndex    = "";
        hideShadow();
        drag.current = null;

        const next = layoutsRef.current.map(l =>
          l.id === dr.id ? { ...l, x: dr.pendingX, y: dr.pendingY } : l,
        );
        onChangeRef.current(resolveOverlaps(next, dr.id));
        return;
      }

      const rr = resize.current;
      if (rr && e.pointerId === rr.pointerId) {
        rr.el.style.width  = "";
        rr.el.style.height = "";
        rr.el.style.zIndex = "";
        hideShadow();
        resize.current = null;

        // Only emit if size actually changed
        if (rr.pendingW !== rr.startGW || rr.pendingH !== rr.startGH) {
          onChangeRef.current(
            layoutsRef.current.map(l =>
              l.id === rr.id ? { ...l, w: rr.pendingW, h: rr.pendingH } : l,
            ),
          );
        }
      }
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup",   onUp);
    document.addEventListener("pointercancel", onUp);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup",   onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []); // empty deps – all mutable state is in refs

  const cw = containerW > 0 ? colW(containerW, gap) : 0;

  const containerH = useMemo(() => {
    const maxRow = layouts.reduce((m, l) => Math.max(m, l.y + l.h), 0);
    return toPxY(maxRow + EXTRA_R, rowH, gap);
  }, [layouts, rowH, gap]);

  // ── Drag start ────────────────────────────────────────────────────────────
  function onDragPointerDown(id: string, e: React.PointerEvent) {
    e.preventDefault();
    const layout = layoutsRef.current.find(l => l.id === id);
    const el = widgetEls.current[id];
    if (!layout || !el) return;

    el.setPointerCapture(e.pointerId); // keep events on this element during drag
    el.style.zIndex = "1000";

    drag.current = {
      id, el,
      startX: e.clientX, startY: e.clientY,
      startGX: layout.x, startGY: layout.y,
      w: layout.w, h: layout.h,
      pendingX: layout.x, pendingY: layout.y,
      pointerId: e.pointerId,
    };
  }

  // ── Resize start ──────────────────────────────────────────────────────────
  function onResizePointerDown(id: string, type: "e" | "s" | "se", e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const layout = layoutsRef.current.find(l => l.id === id);
    const el = widgetEls.current[id];
    if (!layout || !el || cwRef.current === 0) return;

    const meta   = WIDGET_REGISTRY[id];
    const minW   = meta?.minSpan ?? 1;
    const minH   = meta?.minH    ?? 1;
    const bounds = computeResizeBounds(layout, meta?.maxSpan ?? COLS, minH, layoutsRef.current);

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    el.style.zIndex = "1000";

    resize.current = {
      id, el, type,
      startX: e.clientX, startY: e.clientY,
      startGW: layout.w, startGH: layout.h,
      minW, minH, maxW: bounds.maxW, maxH: bounds.maxH,
      pendingW: layout.w, pendingH: layout.h,
      pointerId: e.pointerId,
    };
  }

  const diet = useDietData();

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{ height: containerH, touchAction: "none" }}
    >
      {/* Drop-target shadow */}
      <div
        ref={shadowRef}
        className="absolute pointer-events-none rounded-[10px]"
        style={{ display: "none", zIndex: 998 }}
      />

      {cw > 0 && layouts.map(layout => {
        const meta = WIDGET_REGISTRY[layout.id];
        if (!meta) return null;

        return (
          <div
            key={layout.id}
            ref={el => { widgetEls.current[layout.id] = el; }}
            className="absolute group/ci"
            style={{
              left:   toPxX(layout.x, cw, gap),
              top:    toPxY(layout.y, rowH, gap),
              width:  toPxW(layout.w, cw, gap),
              height: toPxH(layout.h, rowH, gap),
              zIndex: 1,
            }}
          >
            <Widget
              id={layout.id}
              title={meta.title}
              onRemove={onRemove}
              onDragPointerDown={e => onDragPointerDown(layout.id, e)}
            >
              <WidgetContent id={layout.id} diet={diet} />
            </Widget>

            {/* East resize handle */}
            <div
              className="absolute top-0 bottom-0 right-[-6px] w-4 z-20 cursor-col-resize opacity-0 group-hover/ci:opacity-100 transition-opacity flex items-center justify-center select-none"
              onPointerDown={e => onResizePointerDown(layout.id, "e", e)}
            >
              <div className="flex flex-col gap-[3px]">
                {[0,1,2,3].map(i => <div key={i} className="w-[2px] h-[2px] rounded-full bg-[var(--text3)]" />)}
              </div>
            </div>

            {/* South resize handle */}
            <div
              className="absolute left-0 right-0 bottom-[-6px] h-4 z-20 cursor-row-resize opacity-0 group-hover/ci:opacity-100 transition-opacity flex items-end justify-center select-none"
              onPointerDown={e => onResizePointerDown(layout.id, "s", e)}
            >
              <div className="flex flex-row gap-[3px] pb-[2px]">
                {[0,1,2,3].map(i => <div key={i} className="w-[2px] h-[2px] rounded-full bg-[var(--text3)]" />)}
              </div>
            </div>

            {/* SE corner handle */}
            <div
              className="absolute bottom-[-6px] right-[-6px] w-5 h-5 z-30 cursor-se-resize opacity-0 group-hover/ci:opacity-100 transition-opacity select-none"
              onPointerDown={e => onResizePointerDown(layout.id, "se", e)}
            />
          </div>
        );
      })}
    </div>
  );
}
