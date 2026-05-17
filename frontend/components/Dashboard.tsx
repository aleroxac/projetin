"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppShell } from "@/components/AppShellContext";
import CanvasGrid from "@/components/CanvasGrid";
import WidgetPalette from "@/components/WidgetPalette";
import DietPlanView from "@/components/DietPlanView";
import { DEFAULT_LAYOUTS, WIDGET_REGISTRY } from "@/lib/widgetData";
import type { TabId, WidgetLayout } from "@/lib/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "projetin:dashboard:layouts:v1";

const TABS: { id: TabId; label: string; disabled?: boolean }[] = [
  { id: "diet",    label: "Diet" },
  { id: "workout", label: "Workout", disabled: true },
  { id: "shape",   label: "Shape",   disabled: true },
];

function loadLayouts(): Record<TabId, WidgetLayout[]> {
  try {
    const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<TabId, WidgetLayout[]>;
  } catch {
    // ignore
  }
  return {
    diet:    [...DEFAULT_LAYOUTS.diet],
    workout: [...DEFAULT_LAYOUTS.workout],
    shape:   [...DEFAULT_LAYOUTS.shape],
  };
}

function saveLayouts(layouts: Record<TabId, WidgetLayout[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // ignore
  }
}

export default function Dashboard() {
  const { setHeaderAction } = useAppShell();
  const [activeTab, setActiveTab]   = useState<TabId>("diet");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [layouts, setLayouts]       = useState<Record<TabId, WidgetLayout[]>>(DEFAULT_LAYOUTS);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setLayouts(loadLayouts());
  }, []);

  function handleLayoutChange(tab: TabId, newLayouts: WidgetLayout[]) {
    const next = { ...layouts, [tab]: newLayouts };
    setLayouts(next);
    saveLayouts(next);
  }

  function handleRemove(id: string) {
    handleLayoutChange(activeTab, layouts[activeTab].filter((l) => l.id !== id));
    toast("Widget removed");
  }

  function handleAdd(id: string) {
    const meta = WIDGET_REGISTRY[id];
    const current = layouts[activeTab];
    const maxRow = current.reduce((m, l) => Math.max(m, l.y + l.h), 0);
    const newLayout: WidgetLayout = {
      id,
      x: 0,
      y: maxRow,
      w: meta?.minSpan ?? meta?.span ?? 1,
      h: meta?.defaultH ?? 1,
    };
    handleLayoutChange(activeTab, [...current, newLayout]);
    toast("Widget added");
  }

  const handleAddWidget = useCallback(() => {
    const activeIds = layouts[activeTab].map((l) => l.id);
    const available = Object.values(WIDGET_REGISTRY).filter(
      (w) => w.tab === activeTab && !activeIds.includes(w.id)
    );
    if (available.length === 0) {
      toast("All widgets are already on the dashboard");
      return;
    }
    setPaletteOpen(true);
  }, [activeTab, layouts]);

  useEffect(() => {
    setHeaderAction(() => handleAddWidget);
    return () => setHeaderAction(null);
  }, [handleAddWidget, setHeaderAction]);

  const activeWidgetIds = layouts[activeTab].map((l) => l.id);

  return (
    <>
      <div
        className="flex gap-1 p-1 w-fit mb-5"
        style={{ background: "var(--bg3)", borderRadius: "var(--radius-xl)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2 text-[13px] font-semibold transition-all border-none cursor-pointer",
              activeTab === tab.id
                ? "bg-[var(--bg)] text-[var(--text)] shadow-sm"
                : "bg-transparent text-[var(--text3)] hover:text-[var(--text2)]"
            )}
            disabled={tab.disabled}
            style={{
              borderRadius: "var(--radius-lg)",
              ...(tab.disabled ? { opacity: 0.35, cursor: "not-allowed" } : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "diet" && (
        <div className="mb-5">
          <DietPlanView />
        </div>
      )}

      <CanvasGrid
        layouts={layouts[activeTab]}
        onChange={(newLayouts) => handleLayoutChange(activeTab, newLayouts)}
        onRemove={handleRemove}
      />

      <WidgetPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        currentTab={activeTab}
        activeWidgets={activeWidgetIds}
        onAdd={(id) => { handleAdd(id); setPaletteOpen(false); }}
      />
    </>
  );
}
