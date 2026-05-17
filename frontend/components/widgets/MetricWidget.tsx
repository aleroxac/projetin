import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MetricWidgetProps {
  value: string | number;
  unit?: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  badge?: { label: string; variant: BadgeProps["variant"] };
  color?: string;
}

export default function MetricWidget({
  value,
  unit,
  sub,
  trend,
  badge,
  color,
}: MetricWidgetProps) {
  return (
    <div className="flex flex-col justify-center py-2">
      <div
        className="font-mono font-bold leading-none tracking-tight"
        style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}
      >
        <span style={color ? { color } : undefined}>{value}</span>
        {unit && (
          <span
            className="font-medium ml-1.5"
            style={{ fontSize: "clamp(13px, 1.4vw, 20px)", color: color ?? "var(--text2)" }}
          >
            {unit}
          </span>
        )}
      </div>

      <div className="mt-2 text-[16px] text-[var(--text2)]">
        {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        {sub && !badge && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              trend === "up"      && "text-green-400",
              trend === "down"    && "text-red-400",
              trend === "neutral" && "text-[var(--text2)]",
            )}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}
