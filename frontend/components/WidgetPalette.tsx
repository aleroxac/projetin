import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { WIDGET_REGISTRY } from "@/lib/widgetData";
import type { TabId } from "@/lib/types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetPaletteProps {
  open: boolean;
  onClose: () => void;
  currentTab: TabId;
  activeWidgets: string[];
  onAdd: (id: string) => void;
}

export default function WidgetPalette({
  open,
  onClose,
  currentTab,
  activeWidgets,
  onAdd,
}: WidgetPaletteProps) {
  const available = Object.values(WIDGET_REGISTRY).filter(
    (w) => w.tab === currentTab && !activeWidgets.includes(w.id)
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle>Add widget</DialogTitle>
            <DialogDescription>
              Click to add to the current dashboard
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" className="w-6 h-6 p-0 text-[var(--text3)]">
              <X size="1.14rem" />
            </Button>
          </DialogClose>
        </DialogHeader>

        {available.length === 0 ? (
          <p className="text-[12px] text-[var(--text3)] py-4 text-center">
            All widgets are already on the dashboard.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 mt-1">
            {available.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onAdd(w.id);
                  onClose();
                }}
                className="p-3.5 rounded-[10px] text-left cursor-pointer transition-all"
                style={{
                  border: "0.5px solid var(--border)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--blue)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <div className="text-[20px] mb-1.5">{w.icon}</div>
                <div className="text-[12px] font-medium">{w.title}</div>
                <div className="text-[11px] text-[var(--text3)] mt-0.5">
                  {w.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
