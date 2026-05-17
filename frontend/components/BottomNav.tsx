"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, Utensils, ClipboardList, FolderOpen, UserCircle } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",   path: "/dashboard",   icon: LayoutDashboard, nav: "Dashboard"   },
  { label: "Nutrition",   path: "/nutrition",   icon: Utensils,        nav: "Nutrition"   },
  { label: "Assessments", path: "/assessments", icon: ClipboardList,   nav: "Assessments" },
  { label: "Projects",    path: "/projects",    icon: FolderOpen,      nav: "Projects"    },
] as const;

interface BottomNavProps {
  activeNav: string;
  onProfileClick: () => void;
}

function NavButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
      style={{ color: active ? "var(--blue)" : "var(--text3)" }}
    >
      <div
        className="flex items-center justify-center transition-all"
        style={{
          borderRadius: 99,
          background: active ? "rgba(59,130,246,0.12)" : "transparent",
          padding: active ? "5px 16px" : "5px 8px",
        }}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 1.5} />
      </div>
      <span className="text-[9px] font-semibold tracking-wide uppercase">{label}</span>
    </button>
  );
}

export default function BottomNav({ activeNav, onProfileClick }: BottomNavProps) {
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 flex items-stretch border-t border-[var(--border)]"
      style={{
        background: "var(--bg2)",
        height: "4rem",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map(({ label, path, icon, nav }) => (
        <NavButton
          key={path}
          label={label}
          icon={icon}
          active={activeNav === nav}
          onClick={() => router.push(path)}
        />
      ))}

      <NavButton
        label="Profile"
        icon={UserCircle}
        active={false}
        onClick={onProfileClick}
      />
    </nav>
  );
}
