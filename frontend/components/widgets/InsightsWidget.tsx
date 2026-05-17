import { cn } from "@/lib/utils";

interface Insight {
  title: string;
  body: string;
  color: "green" | "amber" | "blue";
}

const insights: Insight[] = [
  {
    title: "Muscle Retention",
    body: "Lean mass stable during the cut.",
    color: "green",
  },
  {
    title: "Loss Rate",
    body: "0.6kg/week above ideal. Adjust deficit.",
    color: "amber",
  },
  {
    title: "Forecast",
    body: "Goal achievable by June 12, 2026.",
    color: "blue",
  },
];

const colorStyles = {
  green: {
    wrapper: "bg-green-500/7 border-green-500/20",
    title: "text-green-300",
  },
  amber: {
    wrapper: "bg-amber-500/7 border-amber-500/20",
    title: "text-amber-300",
  },
  blue: {
    wrapper: "bg-blue-500/7 border-blue-500/20",
    title: "text-blue-300",
  },
};

export default function InsightsWidget() {
  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => (
        <div
          key={insight.title}
          className={cn(
            "px-3 py-2.5 rounded-lg border",
            colorStyles[insight.color].wrapper
          )}
          style={{
            background:
              insight.color === "green"
                ? "rgba(34, 197, 94, 0.07)"
                : insight.color === "amber"
                  ? "rgba(245, 158, 11, 0.07)"
                  : "rgba(59, 130, 246, 0.07)",
            borderColor:
              insight.color === "green"
                ? "rgba(34, 197, 94, 0.2)"
                : insight.color === "amber"
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(59, 130, 246, 0.2)",
          }}
        >
          <div
            className={cn("text-[12px] font-medium mb-0.5", colorStyles[insight.color].title)}
          >
            {insight.title}
          </div>
          <div className="text-[11px] text-[var(--text3)]">{insight.body}</div>
        </div>
      ))}
    </div>
  );
}
