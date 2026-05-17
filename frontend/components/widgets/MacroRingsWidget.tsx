"use client";

import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { fetchDietPlanAdherence, type MacroAdherence } from "@/lib/api";

const MACRO_CONFIG = [
  { key: "calories", label: "Calories", unit: "kcal", color: "#8b5cf6" },
  { key: "protein",  label: "Protein",  unit: "g",    color: "#22c55e" },
  { key: "carbs",    label: "Carbs",    unit: "g",    color: "#f59e0b" },
  { key: "fat",      label: "Fat",      unit: "g",    color: "#3b82f6" },
] as const;

const BASE_RING  = 180;
const BASE_INNER = 56;
const BASE_OUTER = 80;

function RingChart({
  label, unit, color, consumed, target, size,
}: {
  label: string; unit: string; color: string;
  consumed: number; target: number; size: number;
}) {
  const ratio  = size / BASE_RING;
  const inner  = Math.round(BASE_INNER * ratio);
  const outer  = Math.round(BASE_OUTER * ratio);
  const cx     = size / 2 - 2;
  const numSz  = Math.max(16, Math.round(32 * ratio));
  const lblSz  = Math.max(10, Math.round(16 * ratio));
  const metaSz = Math.max(9, Math.round(14 * ratio));

  const over   = target > 0 && consumed > target;
  const filled = target > 0 ? Math.min(consumed / target, 1) : 0;
  const data   = [{ value: filled }, { value: Math.max(0, 1 - filled) }];
  const fill   = over ? "#ef4444" : color;
  const pct    = target > 0 ? Math.round((consumed / target) * 100) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <PieChart width={size} height={size}>
          <Pie
            data={data}
            cx={cx} cy={cx}
            innerRadius={inner} outerRadius={outer}
            startAngle={90} endAngle={-270}
            dataKey="value"
            strokeWidth={0}
            isAnimationActive={false}
          >
            <Cell fill={fill} />
            <Cell fill="#27272a" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-bold leading-none" style={{ fontSize: numSz, color: fill }}>
            {Math.round(consumed)}
          </span>
          <span style={{ fontSize: metaSz, color: "var(--text2)", marginTop: 4 }}>{unit}</span>
        </div>
      </div>

      <span style={{ fontSize: lblSz }} className="font-semibold text-[var(--text)]">{label}</span>
      <span style={{ fontSize: metaSz }} className="text-[var(--text2)]">meta {Math.round(target)} {unit}</span>
      {pct !== null && (
        <span
          style={{
            fontSize: metaSz,
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: 999,
            background: over ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.07)",
            color: over ? "#ef4444" : fill,
          }}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}

function MacroBar({ label, unit, color, consumed, target }: {
  label: string; unit: string; color: string; consumed: number; target: number;
}) {
  const over   = target > 0 && consumed > target;
  const filled = target > 0 ? Math.min(consumed / target, 1) : 0;
  const fill   = over ? "#ef4444" : color;
  const pct    = target > 0 ? Math.round((consumed / target) * 100) : null;

  return (
    <div className="flex flex-col gap-[5px]">
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-semibold text-[var(--text)]">{label}</span>
        <span className="text-[12px] font-bold tabular-nums" style={{ color: fill }}>
          {Math.round(consumed)}
          <span className="text-[10px] text-[var(--text2)] ml-[3px]">{unit}</span>
        </span>
      </div>
      <div className="h-[5px] rounded-full overflow-hidden" style={{ background: "#27272a" }}>
        <div className="h-full rounded-full" style={{ width: `${filled * 100}%`, background: fill }} />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-[var(--text2)]">meta {Math.round(target)} {unit}</span>
        {pct !== null && (
          <span className="text-[10px] font-semibold" style={{ color: over ? "#ef4444" : fill }}>
            {pct}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function MacroRingsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);
  const [macros, setMacros] = useState<Record<string, MacroAdherence> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  function load(dietPlanId: string, userId: string) {
    setLoading(true);
    fetchDietPlanAdherence(dietPlanId, userId)
      .then((adh) =>
        setMacros({
          calories: adh.calories,
          protein:  adh.protein,
          carbs:    adh.carbs,
          fat:      adh.fat,
        })
      )
      .catch(() => toast.error("Erro ao carregar aderência"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const dietPlanId = localStorage.getItem("projetin:diet:dietPlanId");
    const userId     = localStorage.getItem("projetin:user:id");
    if (dietPlanId && userId) load(dietPlanId, userId);
  }, []);

  useEffect(() => {
    function onPlanChanged(e: CustomEvent<string>) {
      const userId = localStorage.getItem("projetin:user:id");
      if (e.detail && userId) load(e.detail, userId);
      else setMacros(null);
    }
    window.addEventListener("projetin:diet-plan-changed", onPlanChanged as EventListener);
    return () => window.removeEventListener("projetin:diet-plan-changed", onPlanChanged as EventListener);
  }, []);

  if (loading) {
    return <div ref={containerRef} className="w-full"><p className="text-[16px] text-[var(--text2)]">Carregando…</p></div>;
  }

  if (!macros) {
    return (
      <div ref={containerRef} className="w-full">
        <p className="text-[16px] text-[var(--text2)]">Selecione um diet plan para ver a comparação.</p>
      </div>
    );
  }

  const isMobile = containerW > 0 && containerW < 600;

  // Mobile: large calories ring (left) + macro bars for protein/carbs/fat (right)
  if (isMobile) {
    const ringSize = Math.max(100, Math.min(150, Math.round(containerW * 0.38)));
    const [cal, ...rest] = MACRO_CONFIG;

    return (
      <div ref={containerRef} className="w-full flex gap-4 items-center py-1">
        <div className="shrink-0">
          <RingChart
            label={cal.label}
            unit={cal.unit}
            color={cal.color}
            consumed={macros[cal.key].consumed}
            target={macros[cal.key].target}
            size={ringSize}
          />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {rest.map(({ key, label, unit, color }) => (
            <MacroBar
              key={key}
              label={label}
              unit={unit}
              color={color}
              consumed={macros[key].consumed}
              target={macros[key].target}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop: 4-ring grid
  const gapPx    = 3 * 24;
  const cellW    = containerW > 0 ? Math.floor((containerW - gapPx) / 4) : BASE_RING;
  const ringSize = Math.max(80, Math.min(BASE_RING, cellW));

  return (
    <div ref={containerRef} className="grid grid-cols-4 gap-6 py-2">
      {MACRO_CONFIG.map(({ key, label, unit, color }) => (
        <RingChart
          key={key}
          label={label}
          unit={unit}
          color={color}
          consumed={macros[key].consumed}
          target={macros[key].target}
          size={ringSize}
        />
      ))}
    </div>
  );
}
