"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetProps {
  id: string;
  title: string;
  onRemove: (id: string) => void;
  onDragPointerDown: (e: React.PointerEvent) => void;
  children: React.ReactNode;
}

export default function Widget({ id, title, onRemove, onDragPointerDown, children }: WidgetProps) {
  return (
    <div className="relative h-full flex flex-col rounded-[10px] overflow-hidden border border-[var(--border)] bg-[var(--bg3)] hover:border-[var(--border2)] transition-colors group">
      {/* Header — drag handle */}
      <div
        className="flex items-center justify-between px-3.5 pt-3 pb-0 select-none cursor-grab active:cursor-grabbing shrink-0"
        onPointerDown={onDragPointerDown}
      >
        <span className="text-[12px] font-medium text-[var(--text2)] uppercase tracking-[0.07em]">
          {title}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="danger"
            className="w-[22px] h-[22px] rounded-[5px]"
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Remove"
          >
            <X size="0.86rem" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 pb-3 pt-2.5 flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
