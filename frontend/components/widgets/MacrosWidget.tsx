import { Progress } from "@/components/ui/progress";

interface Props {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  targets?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    calories?: number;
  };
}

const MACROS = [
  { key: "protein"  as const, label: "Protein",  unit: "g",    color: "var(--macro-protein)",  bg: "rgba(34,197,94,0.10)"  },
  { key: "carbs"    as const, label: "Carbs",    unit: "g",    color: "var(--macro-carbs)",    bg: "rgba(245,158,11,0.10)" },
  { key: "fat"      as const, label: "Fat",       unit: "g",    color: "var(--macro-fat)",      bg: "rgba(59,130,246,0.10)" },
];

function MacroCard({
  label, unit, color, bg, current, target,
}: {
  label: string; unit: string; color: string; bg: string; current: number; target?: number;
}) {
  const over    = target != null && current > target;
  const fill    = over ? "var(--red)" : color;
  const fillBg  = over ? "rgba(239,68,68,0.10)" : bg;
  const pct     = target != null ? Math.min((current / target) * 100, 100) : 100;

  return (
    <div
      className="flex flex-col gap-2 p-3 flex-1"
      style={{ background: fillBg, borderRadius: "var(--radius-md)" }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: fill }}>
        {label}
      </span>
      <div className="flex items-baseline gap-[3px]">
        <span className="text-[20px] font-bold leading-none" style={{ color: "var(--text)" }}>
          {Math.round(current)}
        </span>
        <span className="text-[11px] font-medium" style={{ color: "var(--text2)" }}>{unit}</span>
      </div>
      {target != null && (
        <span className="text-[10px]" style={{ color: "var(--text3)" }}>
          / {Math.round(target)} {unit}
        </span>
      )}
      <div className="h-[4px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: fill }} />
      </div>
    </div>
  );
}

export default function MacrosWidget({ protein, carbs, fat, calories, targets }: Props) {
  const calTarget = targets?.calories;
  const calOver   = calTarget != null && calories > calTarget;
  const calFill   = calOver ? "var(--red)" : "var(--macro-calories)";
  const calPct    = calTarget != null ? Math.min((calories / calTarget) * 100, 100) : 100;

  return (
    <div className="flex flex-col gap-4">
      {/* Calories — prominent row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-[var(--text2)]">Calories</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-bold leading-none" style={{ color: calFill }}>
              {Math.round(calories)}
            </span>
            {calTarget != null && (
              <span className="text-[12px] text-[var(--text3)]">/ {Math.round(calTarget)} kcal</span>
            )}
          </div>
        </div>
        <Progress value={calPct} color={calOver ? "#ef4444" : "#8b5cf6"} className="h-[6px]" />
        {calTarget != null && (
          <span className="text-[11px] text-[var(--text3)] self-end">
            {Math.round((calories / calTarget) * 100)}%
          </span>
        )}
      </div>

      {/* Macro mini-cards */}
      <div className="flex gap-2">
        {MACROS.map(({ key, label, unit, color, bg }) => (
          <MacroCard
            key={key}
            label={label}
            unit={unit}
            color={color}
            bg={bg}
            current={key === "protein" ? protein : key === "carbs" ? carbs : fat}
            target={targets?.[key]}
          />
        ))}
      </div>
    </div>
  );
}
