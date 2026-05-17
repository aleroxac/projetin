"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchProjects,
  fetchGoals,
  fetchProtocols,
  fetchDietPlans,
  type Project,
  type Goal,
  type Protocol,
  type DietPlan,
} from "@/lib/api";

// ─── Cascading select ─────────────────────────────────────────────────────────

const selectClass =
  "bg-[var(--bg3)] border border-[var(--border)] text-[var(--text)] rounded-[8px] px-3 py-1.5 text-[13px] outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity";

const LS_KEYS = {
  project:  "projetin:diet:projectId",
  goal:     "projetin:diet:goalId",
  protocol: "projetin:diet:protocolId",
  dietPlan: "projetin:diet:dietPlanId",
} as const;

// ─── Main component ───────────────────────────────────────────────────────────

export default function DietPlanView() {
  const [userId, setUserId] = useState<string | null>(null);

  // cascade lists
  const [projects, setProjects]   = useState<Project[]>([]);
  const [goals, setGoals]         = useState<Goal[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  // selections
  const [projectId, setProjectId]   = useState("");
  const [goalId, setGoalId]         = useState("");
  const [protocolId, setProtocolId] = useState("");
  const [dietPlanId, setDietPlanId] = useState("");

  // ── Init: restore saved selections or load projects fresh ──────────────────
  useEffect(() => {
    const uid = localStorage.getItem("projetin:user:id");
    setUserId(uid);
    if (!uid) return;

    const saved = {
      projectId:  localStorage.getItem(LS_KEYS.project)  ?? "",
      goalId:     localStorage.getItem(LS_KEYS.goal)     ?? "",
      protocolId: localStorage.getItem(LS_KEYS.protocol) ?? "",
      dietPlanId: localStorage.getItem(LS_KEYS.dietPlan) ?? "",
    };

    if (!saved.projectId) {
      fetchProjects(uid)
        .then(setProjects)
        .catch(() => toast.error("Failed to load projects"));
      return;
    }

    // Fetch everything needed to restore the full cascade in parallel
    const promises: [
      Promise<Project[]>,
      Promise<Goal[]>,
      Promise<Protocol[]>,
      Promise<DietPlan[]>,
    ] = [
      fetchProjects(uid),
      fetchGoals(saved.projectId),
      saved.goalId     ? fetchProtocols(saved.goalId)     : Promise.resolve([]),
      saved.protocolId ? fetchDietPlans(saved.protocolId) : Promise.resolve([]),
    ];

    Promise.all(promises)
      .then(([proj, goal, proto, plans]) => {
        // Validate saved IDs against fetched data to detect stale localStorage
        const validProject  = proj.some((p) => p.id === saved.projectId);
        const validGoal     = goal.some((g) => g.id === saved.goalId);
        const validProtocol = proto.some((p) => p.id === saved.protocolId);
        const validDietPlan = plans.some((d) => d.id === saved.dietPlanId);

        if (!validProject) {
          Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
          setProjects(proj);
          return;
        }

        setProjects(proj);
        setProjectId(saved.projectId);

        if (!validGoal) {
          localStorage.removeItem(LS_KEYS.goal);
          localStorage.removeItem(LS_KEYS.protocol);
          localStorage.removeItem(LS_KEYS.dietPlan);
          setGoals(goal);
          return;
        }

        setGoals(goal);
        setGoalId(saved.goalId);

        if (!validProtocol) {
          localStorage.removeItem(LS_KEYS.protocol);
          localStorage.removeItem(LS_KEYS.dietPlan);
          setProtocols(proto);
          return;
        }

        setProtocols(proto);
        setProtocolId(saved.protocolId);

        if (!validDietPlan) {
          localStorage.removeItem(LS_KEYS.dietPlan);
          setDietPlans(plans);
          return;
        }

        setDietPlans(plans);
        setDietPlanId(saved.dietPlanId);
        if (saved.dietPlanId) {
          window.dispatchEvent(
            new CustomEvent("projetin:diet-plan-changed", { detail: saved.dietPlanId })
          );
        }
      })
      .catch(() => toast.error("Failed to restore selection"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cascade handlers (called on manual select change) ─────────────────────

  function notifyPlanChange(id: string) {
    window.dispatchEvent(
      new CustomEvent("projetin:diet-plan-changed", { detail: id })
    );
  }

  function handleProjectChange(id: string) {
    setProjectId(id);
    setGoalId(""); setGoals([]);
    setProtocolId(""); setProtocols([]);
    setDietPlanId(""); setDietPlans([]);
    localStorage.setItem(LS_KEYS.project, id);
    localStorage.removeItem(LS_KEYS.goal);
    localStorage.removeItem(LS_KEYS.protocol);
    localStorage.removeItem(LS_KEYS.dietPlan);
    notifyPlanChange("");
    if (id) fetchGoals(id).then(setGoals).catch(() => toast.error("Failed to load goals"));
  }

  function handleGoalChange(id: string) {
    setGoalId(id);
    setProtocolId(""); setProtocols([]);
    setDietPlanId(""); setDietPlans([]);
    localStorage.setItem(LS_KEYS.goal, id);
    localStorage.removeItem(LS_KEYS.protocol);
    localStorage.removeItem(LS_KEYS.dietPlan);
    notifyPlanChange("");
    if (id) fetchProtocols(id).then(setProtocols).catch(() => toast.error("Failed to load protocols"));
  }

  function handleProtocolChange(id: string) {
    setProtocolId(id);
    setDietPlanId(""); setDietPlans([]);
    localStorage.setItem(LS_KEYS.protocol, id);
    localStorage.removeItem(LS_KEYS.dietPlan);
    notifyPlanChange("");
    if (id) fetchDietPlans(id).then(setDietPlans).catch(() => toast.error("Failed to load diet plans"));
  }

  function handleDietPlanChange(id: string) {
    setDietPlanId(id);
    localStorage.setItem(LS_KEYS.dietPlan, id);
    notifyPlanChange(id);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Selector bar ── */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-[12px]"
        style={{ background: "var(--surface)" }}
      >
        <span className="text-[13px] font-medium text-[var(--text2)] mr-1">Plan</span>

        <select
          className={selectClass}
          value={projectId}
          onChange={(e) => handleProjectChange(e.target.value)}
          disabled={!userId || projects.length === 0}
        >
          <option value="">Project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <span className="text-[var(--text2)] text-[13px]">/</span>

        <select
          className={selectClass}
          value={goalId}
          onChange={(e) => handleGoalChange(e.target.value)}
          disabled={!projectId || goals.length === 0}
        >
          <option value="">Goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <span className="text-[var(--text2)] text-[13px]">/</span>

        <select
          className={selectClass}
          value={protocolId}
          onChange={(e) => handleProtocolChange(e.target.value)}
          disabled={!goalId || protocols.length === 0}
        >
          <option value="">Protocol</option>
          {protocols.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <span className="text-[var(--text2)] text-[13px]">/</span>

        <select
          className={selectClass}
          value={dietPlanId}
          onChange={(e) => handleDietPlanChange(e.target.value)}
          disabled={!protocolId || dietPlans.length === 0}
        >
          <option value="">Diet Plan</option>
          {dietPlans.map((d) => (
            <option key={d.id} value={d.id}>
              {d.calorieIntensity ? `${d.calorieIntensity} · ` : ""}{Math.round(d.calories)} kcal
            </option>
          ))}
        </select>
      </div>

      {/* empty state */}
      {!dietPlanId && (
        <p className="text-[12px] text-[var(--text3)] px-1">
          Select a diet plan to view the daily comparison.
        </p>
      )}
    </div>
  );
}
