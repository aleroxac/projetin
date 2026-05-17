import { Bell, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAddWidget?: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({ onAddWidget, title = "Daily Overview", subtitle = "Today" }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-6 gap-4"
      style={{
        gridRow: "1",
        gridColumn: "2",
        height: "3.86rem",
        background: "var(--bg2)",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <div className="flex flex-col">
        <span className="text-[1.14rem] font-medium tracking-tight">{title}</span>
        <span className="text-[0.79rem] text-[var(--text3)] mt-px">{subtitle}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <Badge variant="green">Active week</Badge>
        <Badge variant="blue">Workout 1:30 pm</Badge>
        <Badge variant="amber">-480 kcal deficit</Badge>

        <Button variant="icon" title="Notifications">
          <Bell size="1.07rem" />
        </Button>

        {onAddWidget && (
          <Button variant="primary" onClick={onAddWidget}>
            <Plus size="0.93rem" />
            Widget
          </Button>
        )}
      </div>
    </header>
  );
}
