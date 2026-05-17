import { Progress } from "@/components/ui/progress";

interface MacroRow {
  label: string;
  current: number;
  target?: number;
  unit: string;
  color: string;
  textColor: string;
}

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

export default function MacrosWidget({ protein, carbs, fat, calories, targets }: Props) {
  const macros: MacroRow[] = [
    { label: "Protein",    current: protein,  target: targets?.protein,  unit: "g",    color: "#22c55e", textColor: "#4ade80" },
    { label: "Carbs",      current: carbs,    target: targets?.carbs,    unit: "g",    color: "#f59e0b", textColor: "#fbbf24" },
    { label: "Fat",        current: fat,      target: targets?.fat,      unit: "g",    color: "#3b82f6", textColor: "#60a5fa" },
    { label: "Calories",   current: calories, target: targets?.calories, unit: "kcal", color: "#8b5cf6", textColor: "#a78bfa" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {macros.map((m) => (
        <div key={m.label}>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[15px] font-medium text-[var(--text)]">{m.label}</span>
            <span className="text-[16px] font-semibold" style={{ color: m.textColor }}>
              {Math.round(m.current)}
              {m.target ? (
                <span className="text-[14px] font-normal text-[var(--text2)]">
                  {" "}/ {Math.round(m.target)} {m.unit}
                </span>
              ) : (
                <span className="text-[14px] font-normal text-[var(--text2)]"> {m.unit}</span>
              )}
            </span>
          </div>
          <Progress
            value={m.target ? (m.current / m.target) * 100 : 100}
            color={m.color}
            className="h-[8px]"
          />
        </div>
      ))}
    </div>
  );
}
