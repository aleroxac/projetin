"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, ChevronRight, X } from "lucide-react";
import { fetchUsers, createUser, type ApiUser } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Login() {
  const router = useRouter();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // New-user inline form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newSex, setNewSex] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    router.prefetch("/dashboard");
    router.prefetch("/assessments");
    router.prefetch("/projects");

    fetchUsers()
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setError(null);
        // No users at all → send straight to full onboarding
        if (data.length === 0) {
          router.replace("/onboarding");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setError("Não foi possível carregar os usuários.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [router]);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedId),
    [users, selectedId]
  );

  function handleConfirm() {
    if (!selectedUser) return;
    localStorage.setItem("projetin:user:id", selectedUser.id);
    localStorage.setItem("projetin:user:name", selectedUser.name);
    if (selectedUser.email) {
      localStorage.setItem("projetin:user:email", selectedUser.email);
    }
    toast.success(`Welcome back, ${selectedUser.name}!`);

    try {
      const raw = localStorage.getItem("projetin:onboarding:progress");
      if (raw) {
        const progress = JSON.parse(raw);
        if (progress.ids?.userId === selectedUser.id) {
          router.push("/onboarding?mode=new-user");
          return;
        }
      }
    } catch { /* ignore */ }

    router.push("/dashboard");
  }

  async function handleCreateNew() {
    if (!newName.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!newSex) {
      toast.error("Biological sex is required for BMR calculation.");
      return;
    }
    setCreating(true);
    try {
      const user = await createUser({
        name: newName.trim(),
        email: newEmail.trim() || undefined,
        birthDate: newBirthDate || undefined,
        biologicalSex: newSex,
      });
      localStorage.setItem("projetin:user:id", user.id);
      localStorage.setItem("projetin:user:name", user.name);
      if (user.email) localStorage.setItem("projetin:user:email", user.email);
      // Skip the user creation step in onboarding since we just created the user
      router.push("/onboarding?mode=new-user");
    } catch (err) {
      toast.error("Failed to create profile. Please try again.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  function resetNewForm() {
    setNewName("");
    setNewEmail("");
    setNewBirthDate("");
    setNewSex("");
    setShowNewForm(false);
  }

  const inputCls =
    "w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--blue)] transition-colors";
  const labelCls = "text-xs uppercase tracking-[0.15em] text-[var(--text3)]";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-4">
      <div
        className="w-full max-w-4xl rounded-2xl border border-[var(--border2)] p-8 shadow-xl"
        style={{ background: "var(--bg2)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-sm text-[var(--text3)] uppercase tracking-[0.2em]">ProjetIn</div>
            <h1 className="text-2xl font-semibold mt-1">Choose your profile</h1>
            <p className="text-[var(--text2)] text-sm mt-1">
              Pick an existing profile or create a new one.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!showNewForm && (
              <Button
                variant="ghost"
                onClick={() => setShowNewForm(true)}
                className="gap-1.5"
              >
                <UserPlus size="1.07rem" />
                New profile
              </Button>
            )}
            <Button variant="primary" disabled={!selectedUser || showNewForm} onClick={handleConfirm}>
              Continue
              <ChevronRight size="1.07rem" className="ml-1" />
            </Button>
          </div>
        </div>

        {/* New user inline form */}
        {showNewForm && (
          <div className="mb-6 rounded-xl border border-[var(--border2)] bg-[var(--bg3)] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-[var(--text)]">Create new profile</p>
              <button
                onClick={resetNewForm}
                className="text-[var(--text3)] hover:text-[var(--text)] transition-colors"
              >
                <X size="1.14rem" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Full name *</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Alex Costa"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls}
                  type="email"
                  placeholder="you@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Date of birth</label>
                <input
                  className={inputCls}
                  type="date"
                  value={newBirthDate}
                  onChange={(e) => setNewBirthDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Biological sex *</label>
                <select
                  className={inputCls}
                  value={newSex}
                  onChange={(e) => setNewSex(e.target.value)}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetNewForm}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateNew} disabled={creating}>
                {creating ? "Creating…" : "Create & continue setup"}
                {!creating && <ChevronRight size="1.07rem" className="ml-1" />}
              </Button>
            </div>
          </div>
        )}

        {/* Loading / error / empty states */}
        {loading && <div className="text-[var(--text2)]">Loading users…</div>}
        {error && (
          <div className="text-[var(--red)] text-sm mb-4">
            {error} Make sure the backend is running at{" "}
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1"}.
          </div>
        )}

        {/* User grid */}
        {!loading && !error && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => {
              const isActive = selectedId === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedId(user.id);
                    setShowNewForm(false);
                  }}
                  className={[
                    "flex items-center gap-3 rounded-xl p-4 text-left transition-all border",
                    isActive
                      ? "border-[var(--blue)] bg-[var(--bg3)]"
                      : "border-[var(--border)] hover:border-[var(--border2)] bg-[var(--bg)]",
                  ].join(" ")}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, var(--blue), var(--purple))"
                        : "var(--bg3)",
                    }}
                  >
                    {user.name
                      ?.split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.name}</div>
                    <div className="text-[12px] text-[var(--text3)] truncate">{user.email}</div>
                    {user.birthDate && (
                      <div className="text-[11px] text-[var(--text3)]">
                        Birth date: {user.birthDate}
                      </div>
                    )}
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: isActive ? "var(--blue)" : "var(--bg4)" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
