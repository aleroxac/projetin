"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createUser,
  deleteUser,
  getUser,
  updateUser,
  type ApiUser,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  Coffee,
  Dumbbell,
  LineChart,
  Radio,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeNav: string;
  onNavChange?: (label: string) => void;
}

interface SavedUser {
  name: string;
  email?: string;
}

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size="1.14rem" />, badge: undefined, color: undefined },
      { label: "Assessments", icon: <ClipboardList size="1.14rem" />, badge: 3, color: undefined },
      { label: "Projects", icon: <Clock size="1.14rem" />, badge: undefined, color: undefined },
    ],
  },
  {
    label: "Health",
    items: [
      { label: "Nutrition", icon: <Coffee size="1.14rem" />, badge: undefined, color: "#86efac" },
      { label: "Workouts", icon: <Dumbbell size="1.14rem" />, badge: undefined, color: "#c4b5fd" },
      { label: "Analytics", icon: <LineChart size="1.14rem" />, badge: undefined, color: undefined },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Utils", icon: <Radio size="1.14rem" />, badge: undefined, color: undefined },
      { label: "Settings", icon: <Settings size="1.14rem" />, badge: undefined, color: undefined },
    ],
  },
];

export default function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const [user, setUser] = useState<SavedUser>({ name: "Loading..." });
  const router = useRouter();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiUser | null>(null);
  const [mode, setMode] = useState<"edit" | "create">("edit");
  const [saving, setSaving] = useState(false);

  const routeNav = useMemo(() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/assessments") return "Assessments";
    if (pathname === "/projects") return "Projects";
    if (pathname === "/nutrition") return "Nutrition";
    return null;
  }, [pathname]);

  useEffect(() => {
        const name = localStorage.getItem("projetin:user:name") || "Guest";
        const email = localStorage.getItem("projetin:user:email") || undefined;
        setUser({ name, email });
  }, []);

  useEffect(() => {
    if (!modalOpen || mode !== "edit") return;
    const id = localStorage.getItem("projetin:user:id");
    if (!id) return;
    getUser(id)
      .then((u) =>
        setEditing({
          id: u.id,
          name: u.name,
          email: u.email,
          birthDate: normalizeBirthDate(u.birthDate),
          biologicalSex: u.biologicalSex,
        })
      )
      .catch((err) => {
        console.error(err);
        toast.error("Could not load user");
      });
  }, [modalOpen, mode]);

  function normalizeBirthDate(value?: string) {
    if (!value) return "";
    return value.split("T")[0]; // mantém somente YYYY-MM-DD
  }

  function handleLogout() {
    localStorage.removeItem("projetin:user:id");
    localStorage.removeItem("projetin:user:name");
    localStorage.removeItem("projetin:user:email");
    router.replace("/");
  }

  const initials = useMemo(() => {
    if (!user.name) return "??";
    return user.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user.name]);

  async function handleSave() {
    if (!editing) return;
    try {
      setSaving(true);
      if (mode === "edit") {
        await updateUser(editing.id, editing);
        localStorage.setItem("projetin:user:name", editing.name);
        if (editing.email) localStorage.setItem("projetin:user:email", editing.email);
        setUser({ name: editing.name, email: editing.email });
        toast.success("Profile updated");
      } else {
        const created = await createUser(editing);
        localStorage.setItem("projetin:user:id", created.id);
        localStorage.setItem("projetin:user:name", created.name);
        if (created.email) localStorage.setItem("projetin:user:email", created.email);
        setUser({ name: created.name, email: created.email });
        setMode("edit");
        toast.success("Usuário criado e selecionado");
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const id = localStorage.getItem("projetin:user:id");
    if (!id) return;
    const ok = window.confirm("Delete this user? This cannot be undone.");
    if (!ok) return;
    try {
      setSaving(true);
      await deleteUser(id);
      localStorage.removeItem("projetin:user:id");
      localStorage.removeItem("projetin:user:name");
      localStorage.removeItem("projetin:user:email");
        toast.success("User deleted");
      router.replace("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setSaving(false);
    }
  }

  function startCreate() {
    setMode("create");
    setEditing({
      id: "",
      name: "",
      email: "",
      birthDate: "",
      biologicalSex: "",
    });
    setModalOpen(true);
  }

  function openEdit() {
    setMode("edit");
    setModalOpen(true);
  }

  function handleNavItemClick(label: string) {
    if (label === "Dashboard") {
      router.push("/dashboard");
      return;
    }
    if (label === "Assessments") {
      router.push("/assessments");
      return;
    }
    if (label === "Projects") {
      router.push("/projects");
      return;
    }
    if (label === "Nutrition") {
      router.push("/nutrition");
      return;
    }
    onNavChange?.(label);
  }

  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        gridRow: "1 / 4",
        gridColumn: "1",
        background: "var(--bg2)",
        borderRight: "0.5px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-[1.29rem] flex-shrink-0"
        style={{
          height: "3.86rem",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-medium text-[12px] tracking-tight flex-shrink-0"
          style={{ background: "var(--blue)" }}
        >
          PI
        </div>
        <span className="text-[1.07rem] font-medium tracking-tight">ProjetIn</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-0.5">
        {NAV_SECTIONS.map((section) => (
          <React.Fragment key={section.label}>
            <div className="text-[0.71rem] text-[var(--text3)] uppercase tracking-widest px-2 py-2.5 pt-3">
              {section.label}
            </div>
            {section.items.map((item) => {
              const isActive = routeNav ? routeNav === item.label : activeNav === item.label;
              return (
              <button
                key={item.label}
                onClick={() => handleNavItemClick(item.label)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-[7px] cursor-pointer text-[0.93rem] transition-all border-none bg-transparent w-full text-left",
                  isActive
                    ? "bg-[var(--bg4)] text-[var(--text)]"
                    : "text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]"
                )}
                style={item.color ? { color: item.color } : undefined}
              >
                <span
                  className={cn(
                    "flex-shrink-0",
                    isActive ? "opacity-100" : "opacity-70"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-auto text-[0.71rem] px-1.5 py-px rounded-full bg-[var(--blue)] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
              );
            })}
          </React.Fragment>
        ))}
      </nav>

      {/* User */}
      <div
        className="flex-shrink-0 p-3 px-3.5"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <div className="flex items-center gap-2.5">
            <DialogTrigger asChild>
              <button
                onClick={openEdit}
                className="w-[2.14rem] h-[2.14rem] rounded-full flex-shrink-0 flex items-center justify-center text-[0.79rem] font-semibold border border-[var(--border2)] bg-[var(--bg3)] text-white hover:border-[var(--border)]"
                title="Editar perfil"
              >
                {initials}
              </button>
            </DialogTrigger>
            <div className="flex-1 min-w-0">
              <div className="text-[0.86rem] font-medium truncate">{user.name}</div>
              <div className="text-[0.79rem] text-[var(--text3)] truncate">
                {user.email ?? "Selected profile"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-[0.71rem] px-2 py-1 rounded-[6px] border border-[var(--border2)] text-[var(--text3)] hover:text-[var(--text)] hover:border-[var(--border)] bg-transparent cursor-pointer"
              style={{ flexShrink: 0 }}
              title="Trocar de conta"
            >
              Sair
            </button>
          </div>

          <DialogContent className="bg-[var(--bg2)] text-[var(--text)] border border-[var(--border2)]">
            <DialogHeader>
                <DialogTitle>
                  {mode === "edit" ? "Edit user" : "Create user"}
                </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-3">
              <label className="text-[12px] flex flex-col gap-1">
                Name
                <input
                  className="w-full rounded-md bg-[var(--bg)] border border-[var(--border2)] px-3 py-2 text-[13px]"
                  value={editing?.name ?? ""}
                  onChange={(e) => setEditing((prev) => prev && { ...prev, name: e.target.value })}
                />
              </label>
              <label className="text-[12px] flex flex-col gap-1">
                Email
                <input
                  className="w-full rounded-md bg-[var(--bg)] border border-[var(--border2)] px-3 py-2 text-[13px]"
                  value={editing?.email ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, email: e.target.value })
                  }
                />
              </label>
              <label className="text-[12px] flex flex-col gap-1">
                Birth date
                <input
                  type="date"
                  className="w-full rounded-md bg-[var(--bg)] border border-[var(--border2)] px-3 py-2 text-[13px]"
                  value={editing?.birthDate ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, birthDate: e.target.value })
                  }
                />
              </label>
              <label className="text-[12px] flex flex-col gap-1">
                Biological sex
                <input
                  className="w-full rounded-md bg-[var(--bg)] border border-[var(--border2)] px-3 py-2 text-[13px]"
                  placeholder="M / F"
                  value={editing?.biologicalSex ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => prev && { ...prev, biologicalSex: e.target.value })
                  }
                />
              </label>
            </div>

            <DialogFooter className="flex justify-between gap-2 mt-4">
              <div className="flex gap-2">
                <Button variant="ghost" onClick={startCreate}>
                  New user
                </Button>
                {mode === "edit" && (
                  <Button variant="danger" onClick={handleDelete} disabled={saving}>
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
}
