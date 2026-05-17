"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WidgetProps {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  onDragPointerDown: (e: React.PointerEvent) => void;
  children: React.ReactNode;
  isMobile?: boolean;
}

export default function Widget({ id, title, onRemove, onDragPointerDown, children, isMobile }: WidgetProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col border border-[var(--border)] bg-[var(--bg3)] transition-colors group",
        !isMobile && "h-full overflow-hidden hover:border-[var(--border2)]",
      )}
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-5 pt-4 pb-0 select-none shrink-0",
          !isMobile && "cursor-grab active:cursor-grabbing",
        )}
        onPointerDown={isMobile ? undefined : onDragPointerDown}
      >
        <span className="text-[11px] font-semibold text-[var(--text3)] uppercase tracking-[0.1em]">
          {title}
        </span>
        <div className={isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"}>
          <Button
            variant="danger"
            className="w-[22px] h-[22px] rounded-[6px]"
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Remove"
          >
            <X size="0.86rem" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className={cn(
        "px-5 pb-5 pt-3",
        !isMobile && "flex-1 min-h-0 overflow-hidden",
      )}>
        {children}
      </div>
    </div>
  );
}
