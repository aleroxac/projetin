import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-[7px] text-[12px] font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--blue)] text-white border-none hover:opacity-85 px-3.5 py-1.5",
        icon: "w-8 h-8 border border-[var(--border2)] bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]",
        ghost:
          "bg-transparent text-[var(--text3)] hover:bg-[var(--bg4)] hover:text-[var(--text)]",
        danger:
          "bg-transparent text-[var(--text3)] hover:bg-red-500/15 hover:text-[var(--red)]",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
