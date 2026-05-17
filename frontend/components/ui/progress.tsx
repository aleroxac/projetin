import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: string;
}

function Progress({ value, color = "var(--blue)", className, ...props }: ProgressProps) {
  return (
    <div
      className={cn("h-[5px] bg-[var(--bg4)] rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export { Progress };
