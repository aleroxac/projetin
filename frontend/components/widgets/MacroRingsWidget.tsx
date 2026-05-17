"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import { fetchDietPlanAdherence, type MacroAdherence } from "@/lib/api";

const MACRO_CONFIG = [
  { key: "calories", label: "Calories", unit: "kcal", color: "#8b5cf6" },
  { key: "protein",  label: "Protein",  unit: "g",    color: "#22c55e" },
  { key: "carbs",    label: "Carbs",    unit: "g",    color: "#f59e0b" },
  { key: "fat",      label: "Fat",      unit: "g",    color: "#3b82f6" },
] as const;

const RING = 180;
const INNER = 56;
const OUTER = 80;
const CX = RING / 2 - 2;

function RingChart({
  label, unit, color, consumed, target,
}: {
  label: string; unit: string; color: string;
  consumed: number; target: number;
}) {
  const over   = target > 0 && consumed > target;
  const filled = target > 0 ? Math.min(consumed / target, 1) : 0;
  const data   = [{ value: filled }, { value: Math.max(0, 1 - filled) }];
  const fill   = over ? "#ef4444" : color;
  const pct    = target > 0 ? Math.round((consumed / target) * 100) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: RING, height: RING }}>
        <PieChart width={RING} height={RING}>
          <Pie
            data={data}
            cx={CX} cy={CX}
            innerRadius={INNER} outerRadius={OUTER}
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
          <span
            className="font-bold leading-none"
            style={{ fontSize: 32, color: fill }}
          >
            {Math.round(consumed)}
          </span>
          <span className="text-[14px] text-[var(--text2)] mt-1">{unit}</span>
        </div>
      </div>

      <span className="text-[16px] font-semibold text-[var(--text)]">{label}</span>
      <span className="text-[14px] text-[var(--text2)]">meta {Math.round(target)} {unit}</span>
      {pct !== null && (
        <span
          className="text-[14px] font-semibold px-3 py-1 rounded-full"
          style={{
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

export default function MacroRingsWidget() {
  const [macros, setMacros] = useState<Record<string, MacroAdherence> | null>(null);
  const [loading, setLoading] = useState(false);

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
    return <p className="text-[16px] text-[var(--text2)]">Carregando…</p>;
  }

  if (!macros) {
    return (
      <p className="text-[16px] text-[var(--text2)]">
        Selecione um diet plan para ver a comparação.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-6 py-2">
      {MACRO_CONFIG.map(({ key, label, unit, color }) => (
        <RingChart
          key={key}
          label={label}
          unit={unit}
          color={color}
          consumed={macros[key].consumed}
          target={macros[key].target}
        />
      ))}
    </div>
  );
}
