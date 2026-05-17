import { Progress } from "@/components/ui/progress";

const progressRows = [
  {
    label: "BF% reduced",
    value: 38,
    display: "38%",
    color: "#22c55e",
    textColor: "#86efac",
  },
  {
    label: "Weight lost",
    value: 38,
    display: "3.8 / 10kg",
    color: "#3b82f6",
    textColor: "#93c5fd",
  },
  {
    label: "Waist",
    value: 30,
    display: "82 / 76cm",
    color: "#f59e0b",
    textColor: "#fcd34d",
  },
];

export default function ShapeProgressWidget() {
  return (
    <div className="flex flex-col gap-2.5">
      {progressRows.map((row, i) => (
        <div key={row.label} className={i === progressRows.length - 1 ? "mb-0" : ""}>
          <div className="flex justify-between text-[11px] mb-1 text-[var(--text2)]">
            <span>{row.label}</span>
            <span style={{ color: row.textColor }}>{row.display}</span>
          </div>
          <Progress value={row.value} color={row.color} />
        </div>
      ))}
    </div>
  );
}
