"use client";

import { Bell, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onAddWidget?: () => void;
  title?: string;
  subtitle?: string;
  isMobile?: boolean;
  userName?: string;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function Header({
  onAddWidget,
  title = "Daily Overview",
  subtitle = "Today",
  isMobile,
  userName,
}: HeaderProps) {
  const showGreeting = isMobile && Boolean(userName);

  return (
    <header
      className="flex items-center justify-between gap-3"
      style={{
        gridRow: "1",
        gridColumn: isMobile ? "1" : "2",
        height: "3.86rem",
        background: "var(--bg2)",
        borderBottom: "0.5px solid var(--border)",
        padding: isMobile ? "0 1.1rem" : "0 1.5rem",
      }}
    >
      {/* Left: greeting (mobile) or title (desktop) */}
      <div className="flex flex-col justify-center min-w-0">
        {showGreeting ? (
          <>
            <span className="text-[11px] font-medium text-[var(--text3)] leading-none">
              {formatDate()}
            </span>
            <span className="text-[1.05rem] font-semibold tracking-tight truncate leading-snug mt-0.5">
              {getGreeting()}, {userName.split(" ")[0]}
            </span>
          </>
        ) : (
          <>
            <span className="text-[1.07rem] font-semibold tracking-tight truncate">{title}</span>
            <span className="text-[0.78rem] text-[var(--text3)] mt-px truncate">{subtitle}</span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {!isMobile && (
          <>
            <Badge variant="green">Active week</Badge>
            <Badge variant="blue">Workout 1:30 pm</Badge>
            <Badge variant="amber">-480 kcal deficit</Badge>
          </>
        )}

        <Button variant="icon" title="Notifications">
          <Bell size="1.07rem" />
        </Button>

        {onAddWidget && (
          <Button variant="primary" onClick={onAddWidget}>
            <Plus size="0.93rem" />
            {!isMobile && "Widget"}
          </Button>
        )}
      </div>
    </header>
  );
}
