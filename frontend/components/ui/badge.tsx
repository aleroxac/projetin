import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium",
  {
    variants: {
      variant: {
        green: "bg-green-500/12 text-green-300",
        blue: "bg-blue-500/12 text-blue-300",
        amber: "bg-amber-500/12 text-amber-300",
        red: "bg-red-500/12 text-red-300",
        muted: "bg-[var(--bg4)] text-[var(--text3)]",
      },
    },
    defaultVariants: {
      variant: "muted",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
