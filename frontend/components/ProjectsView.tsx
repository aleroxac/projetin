"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  GitBranch,
  Lock,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  createDietPlan,
  createGoal,
  createProject,
  createProtocol,
  deleteDietPlan,
  deleteGoal,
  deleteProject,
  deleteProtocol,
  fetchDietPlans,
  fetchGoals,
  fetchProjects,
  fetchProtocols,
  updateDietPlan,
  updateGoal,
  updateProject,
  updateProtocol,
  type DietPlan,
  type Goal,
  type Project,
  type Protocol,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectViewTab = "overview" | "projects" | "goals" | "protocols" | "diet-plans";

interface ProjectFormState {
  name: string;
  isActive: boolean;
}

interface GoalFormState {
  name: string;
  strategyType: string;
  isActive: boolean;
}

interface ProtocolFormState {
  name: string;
  isActive: boolean;
}

interface DietPlanFormState {
  calorieIntensity: string;
  proteinIntensity: string;
  fatIntensity: string;
  isActive: boolean;
}

const EMPTY_PROJECT_FORM: ProjectFormState = {
  name: "",
  isActive: true,
};

const EMPTY_GOAL_FORM: GoalFormState = {
  name: "",
  strategyType: "recomposition",
  isActive: true,
};

const EMPTY_PROTOCOL_FORM: ProtocolFormState = {
  name: "",
  isActive: true,
};

const INTENSITY_OPTIONS = [
  { value: "mild",     label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "strict",   label: "Strict" },
  { value: "extreme",  label: "Extreme" },
];

const EMPTY_DIET_PLAN_FORM: DietPlanFormState = {
  calorieIntensity: "moderate",
  proteinIntensity: "moderate",
  fatIntensity:     "moderate",
  isActive: true,
};

const VIEW_TABS: { id: ProjectViewTab; label: string; disabled?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "goals", label: "Goals" },
  { id: "protocols", label: "Protocols" },
  { id: "diet-plans", label: "Diet Plans" },
];

const STRATEGY_OPTIONS = [
  { value: "recomposition", label: "Recomposition" },
  { value: "cut", label: "Cut" },
  { value: "bulk", label: "Bulk" },
  { value: "maintain", label: "Maintain" },
];

const inputCls =
  "w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--blue)] transition-colors";
const labelCls = "text-xs uppercase tracking-[0.15em] text-[var(--text3)]";

function getPinnedKey(userId: string) {
  return `projetin:projects:pinned:${userId}`;
}

function byPinnedFirst(a: Project, b: Project, pinnedId: string | null) {
  if (pinnedId && a.id === pinnedId && b.id !== pinnedId) return -1;
  if (pinnedId && b.id === pinnedId && a.id !== pinnedId) return 1;
  return a.name.localeCompare(b.name);
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded-full border",
        isActive
          ? "text-[var(--green)] border-[var(--green)]/30 bg-[var(--green)]/10"
          : "text-[var(--text3)] border-[var(--border2)] bg-[var(--bg3)]"
      )}
    >
      {isActive ? "active" : "inactive"}
    </span>
  );
}

export default function ProjectsView() {
  const [activeView, setActiveView] = useState<ProjectViewTab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editProjectTarget, setEditProjectTarget] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectFormState>(EMPTY_PROJECT_FORM);
  const [projectSaving, setProjectSaving] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [selectedGoalProjectId, setSelectedGoalProjectId] = useState("");

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editGoalTarget, setEditGoalTarget] = useState<Goal | null>(null);
  const [goalForm, setGoalForm] = useState<GoalFormState>(EMPTY_GOAL_FORM);
  const [goalSaving, setGoalSaving] = useState(false);

  const [protocolGoalOptions, setProtocolGoalOptions] = useState<Goal[]>([]);
  const [protocolGoalOptionsLoading, setProtocolGoalOptionsLoading] = useState(false);
  const [protocolGoalOptionsError, setProtocolGoalOptionsError] = useState<string | null>(null);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [protocolsLoading, setProtocolsLoading] = useState(false);
  const [protocolsError, setProtocolsError] = useState<string | null>(null);
  const [selectedProtocolProjectId, setSelectedProtocolProjectId] = useState("");
  const [selectedProtocolGoalId, setSelectedProtocolGoalId] = useState("");

  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [editProtocolTarget, setEditProtocolTarget] = useState<Protocol | null>(null);
  const [protocolForm, setProtocolForm] = useState<ProtocolFormState>(EMPTY_PROTOCOL_FORM);
  const [protocolSaving, setProtocolSaving] = useState(false);

  const [selectedDietPlanProjectId, setSelectedDietPlanProjectId] = useState("");
  const [selectedDietPlanGoalId, setSelectedDietPlanGoalId] = useState("");
  const [selectedDietPlanProtocolId, setSelectedDietPlanProtocolId] = useState("");
  const [dietPlanGoalOptions, setDietPlanGoalOptions] = useState<Goal[]>([]);
  const [dietPlanGoalOptionsLoading, setDietPlanGoalOptionsLoading] = useState(false);
  const [dietPlanGoalOptionsError, setDietPlanGoalOptionsError] = useState<string | null>(null);
  const [dietPlanProtocolOptions, setDietPlanProtocolOptions] = useState<Protocol[]>([]);
  const [dietPlanProtocolOptionsLoading, setDietPlanProtocolOptionsLoading] = useState(false);
  const [dietPlanProtocolOptionsError, setDietPlanProtocolOptionsError] = useState<string | null>(null);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [dietPlansLoading, setDietPlansLoading] = useState(false);
  const [dietPlansError, setDietPlansError] = useState<string | null>(null);

  const [dietPlanDialogOpen, setDietPlanDialogOpen] = useState(false);
  const [editDietPlanTarget, setEditDietPlanTarget] = useState<DietPlan | null>(null);
  const [dietPlanForm, setDietPlanForm] = useState<DietPlanFormState>(EMPTY_DIET_PLAN_FORM);
  const [dietPlanSaving, setDietPlanSaving] = useState(false);

  const [pinnedProjectId, setPinnedProjectId] = useState<string | null>(null);

  const [overviewExpandedIds, setOverviewExpandedIds] = useState<Set<string>>(new Set());
  const [overviewProjectData, setOverviewProjectData] = useState<
    Record<string, {
      goals: Goal[];
      loading: boolean;
      goalData: Record<string, { protocolCount: number; dietPlanCount: number }>;
      countsLoading: boolean;
    }>
  >({});
  const [pinnedSummary, setPinnedSummary] = useState<{
    goalCount: number;
    protocolCount: number;
    dietPlanCount: number;
  } | null>(null);
  const [pinnedSummaryLoading, setPinnedSummaryLoading] = useState(false);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("projetin:user:id") ?? "" : "";

  const pinnedProject = useMemo(
    () => projects.find((project) => project.id === pinnedProjectId) ?? null,
    [projects, pinnedProjectId]
  );

  const selectedGoalProject = useMemo(
    () => projects.find((project) => project.id === selectedGoalProjectId) ?? null,
    [projects, selectedGoalProjectId]
  );

  const selectedProtocolProject = useMemo(
    () => projects.find((project) => project.id === selectedProtocolProjectId) ?? null,
    [projects, selectedProtocolProjectId]
  );

  const selectedProtocolGoal = useMemo(
    () => protocolGoalOptions.find((goal) => goal.id === selectedProtocolGoalId) ?? null,
    [protocolGoalOptions, selectedProtocolGoalId]
  );

  const selectedDietPlanProject = useMemo(
    () => projects.find((p) => p.id === selectedDietPlanProjectId) ?? null,
    [projects, selectedDietPlanProjectId]
  );

  const selectedDietPlanGoal = useMemo(
    () => dietPlanGoalOptions.find((g) => g.id === selectedDietPlanGoalId) ?? null,
    [dietPlanGoalOptions, selectedDietPlanGoalId]
  );

  const selectedDietPlanProtocol = useMemo(
    () => dietPlanProtocolOptions.find((p) => p.id === selectedDietPlanProtocolId) ?? null,
    [dietPlanProtocolOptions, selectedDietPlanProtocolId]
  );

  const sortedDietPlanGoalOptions = useMemo(
    () => [...dietPlanGoalOptions].sort((a, b) => a.name.localeCompare(b.name)),
    [dietPlanGoalOptions]
  );

  const sortedDietPlanProtocolOptions = useMemo(
    () => [...dietPlanProtocolOptions].sort((a, b) => a.name.localeCompare(b.name)),
    [dietPlanProtocolOptions]
  );

  const sortedDietPlans = useMemo(
    () => [...dietPlans].sort((a, b) => a.calorieIntensity.localeCompare(b.calorieIntensity)),
    [dietPlans]
  );

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => byPinnedFirst(a, b, pinnedProjectId)),
    [projects, pinnedProjectId]
  );

  const sortedGoals = useMemo(
    () => [...goals].sort((a, b) => a.name.localeCompare(b.name)),
    [goals]
  );

  const sortedProtocolGoalOptions = useMemo(
    () => [...protocolGoalOptions].sort((a, b) => a.name.localeCompare(b.name)),
    [protocolGoalOptions]
  );

  const sortedProtocols = useMemo(
    () => [...protocols].sort((a, b) => a.name.localeCompare(b.name)),
    [protocols]
  );

  const loadProjects = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects(userId);
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError("Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadGoals = useCallback(async (projectId: string) => {
    if (!projectId) {
      setGoals([]);
      setGoalsError(null);
      return;
    }

    setGoalsLoading(true);
    setGoalsError(null);
    try {
      const data = await fetchGoals(projectId);
      setGoals(data);
    } catch (err) {
      console.error(err);
      setGoalsError("Could not load goals.");
    } finally {
      setGoalsLoading(false);
    }
  }, []);

  const loadProtocolGoals = useCallback(async (projectId: string) => {
    if (!projectId) {
      setProtocolGoalOptions([]);
      setProtocolGoalOptionsError(null);
      setSelectedProtocolGoalId("");
      setProtocols([]);
      setProtocolsError(null);
      return;
    }

    setProtocolGoalOptionsLoading(true);
    setProtocolGoalOptionsError(null);
    setProtocols([]);
    setProtocolsError(null);
    try {
      const data = await fetchGoals(projectId);
      setProtocolGoalOptions(data);
    } catch (err) {
      console.error(err);
      setProtocolGoalOptionsError("Could not load goals for this project.");
      setProtocolGoalOptions([]);
    } finally {
      setProtocolGoalOptionsLoading(false);
    }
  }, []);

  const loadProtocols = useCallback(async (goalId: string) => {
    if (!goalId) {
      setProtocols([]);
      setProtocolsError(null);
      return;
    }

    setProtocolsLoading(true);
    setProtocolsError(null);
    try {
      const data = await fetchProtocols(goalId);
      setProtocols(data);
    } catch (err) {
      console.error(err);
      setProtocolsError("Could not load protocols.");
    } finally {
      setProtocolsLoading(false);
    }
  }, []);

  const loadDietPlanGoals = useCallback(async (projectId: string) => {
    if (!projectId) {
      setDietPlanGoalOptions([]);
      setDietPlanGoalOptionsError(null);
      setSelectedDietPlanGoalId("");
      setDietPlanProtocolOptions([]);
      setSelectedDietPlanProtocolId("");
      setDietPlans([]);
      return;
    }
    setDietPlanGoalOptionsLoading(true);
    setDietPlanGoalOptionsError(null);
    setDietPlanProtocolOptions([]);
    setSelectedDietPlanGoalId("");
    setSelectedDietPlanProtocolId("");
    setDietPlans([]);
    try {
      const data = await fetchGoals(projectId);
      setDietPlanGoalOptions(data);
    } catch (err) {
      console.error(err);
      setDietPlanGoalOptionsError("Could not load goals for this project.");
    } finally {
      setDietPlanGoalOptionsLoading(false);
    }
  }, []);

  const loadDietPlanProtocols = useCallback(async (goalId: string) => {
    if (!goalId) {
      setDietPlanProtocolOptions([]);
      setDietPlanProtocolOptionsError(null);
      setSelectedDietPlanProtocolId("");
      setDietPlans([]);
      return;
    }
    setDietPlanProtocolOptionsLoading(true);
    setDietPlanProtocolOptionsError(null);
    setSelectedDietPlanProtocolId("");
    setDietPlans([]);
    try {
      const data = await fetchProtocols(goalId);
      setDietPlanProtocolOptions(data);
    } catch (err) {
      console.error(err);
      setDietPlanProtocolOptionsError("Could not load protocols for this goal.");
    } finally {
      setDietPlanProtocolOptionsLoading(false);
    }
  }, []);

  const loadDietPlans = useCallback(async (protocolId: string) => {
    if (!protocolId) {
      setDietPlans([]);
      setDietPlansError(null);
      return;
    }
    setDietPlansLoading(true);
    setDietPlansError(null);
    try {
      const data = await fetchDietPlans(protocolId);
      setDietPlans(data);
    } catch (err) {
      console.error(err);
      setDietPlansError("Could not load diet plans.");
    } finally {
      setDietPlansLoading(false);
    }
  }, []);

  const loadPinnedSummary = useCallback(async (projectId: string) => {
    setPinnedSummaryLoading(true);
    setPinnedSummary(null);
    try {
      const goals = await fetchGoals(projectId);
      const protocolResults = await Promise.all(goals.map((g) => fetchProtocols(g.id)));
      const allProtocols = protocolResults.flat();
      const dietPlanResults = await Promise.all(allProtocols.map((p) => fetchDietPlans(p.id)));
      setPinnedSummary({
        goalCount: goals.length,
        protocolCount: allProtocols.length,
        dietPlanCount: dietPlanResults.flat().length,
      });
    } catch {
      // silent fail — cards will show "—"
    } finally {
      setPinnedSummaryLoading(false);
    }
  }, []);

  const loadOverviewProject = useCallback(async (projectId: string) => {
    setOverviewProjectData((prev) => ({
      ...prev,
      [projectId]: { goals: [], loading: true, goalData: {}, countsLoading: false },
    }));
    try {
      const goals = await fetchGoals(projectId);
      setOverviewProjectData((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], goals, loading: false, countsLoading: true },
      }));
      const protocolResults = await Promise.all(
        goals.map(async (goal) => {
          const protocols = await fetchProtocols(goal.id);
          return { goalId: goal.id, protocols };
        })
      );
      const dietPlanResults = await Promise.all(
        protocolResults.flatMap(({ goalId, protocols }) =>
          protocols.map(async (protocol) => {
            const plans = await fetchDietPlans(protocol.id);
            return { goalId, count: plans.length };
          })
        )
      );
      const dietPlanCountByGoal: Record<string, number> = {};
      for (const { goalId, count } of dietPlanResults) {
        dietPlanCountByGoal[goalId] = (dietPlanCountByGoal[goalId] ?? 0) + count;
      }
      const goalData: Record<string, { protocolCount: number; dietPlanCount: number }> = {};
      for (const { goalId, protocols } of protocolResults) {
        goalData[goalId] = {
          protocolCount: protocols.length,
          dietPlanCount: dietPlanCountByGoal[goalId] ?? 0,
        };
      }
      setOverviewProjectData((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], goalData, countsLoading: false },
      }));
    } catch {
      setOverviewProjectData((prev) => ({
        ...prev,
        [projectId]: { ...prev[projectId], loading: false, countsLoading: false },
      }));
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    try {
      const saved = localStorage.getItem(getPinnedKey(userId));
      setPinnedProjectId(saved || null);
    } catch {
      // ignore storage errors
    }
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (!projects.length) {
      setSelectedGoalProjectId("");
      return;
    }

    setSelectedGoalProjectId((current) => {
      if (current && projects.some((project) => project.id === current)) {
        return current;
      }
      if (pinnedProjectId && projects.some((project) => project.id === pinnedProjectId)) {
        return pinnedProjectId;
      }
      return projects[0]?.id ?? "";
    });
  }, [projects, pinnedProjectId]);

  useEffect(() => {
    if (!projects.length) {
      setSelectedProtocolProjectId("");
      return;
    }

    setSelectedProtocolProjectId((current) => {
      if (current && projects.some((project) => project.id === current)) {
        return current;
      }
      if (pinnedProjectId && projects.some((project) => project.id === pinnedProjectId)) {
        return pinnedProjectId;
      }
      return projects[0]?.id ?? "";
    });
  }, [projects, pinnedProjectId]);

  useEffect(() => {
    if (!userId || !pinnedProjectId) return;
    const stillExists = projects.some((project) => project.id === pinnedProjectId);
    if (stillExists) return;
    setPinnedProjectId(null);
    try {
      localStorage.removeItem(getPinnedKey(userId));
    } catch {
      // ignore storage errors
    }
  }, [projects, pinnedProjectId, userId]);

  useEffect(() => {
    if (activeView !== "overview") return;
    if (!pinnedProjectId) {
      setPinnedSummary(null);
      return;
    }
    loadPinnedSummary(pinnedProjectId);
  }, [activeView, pinnedProjectId, loadPinnedSummary]);

  useEffect(() => {
    if (activeView !== "goals") return;
    loadGoals(selectedGoalProjectId);
  }, [activeView, selectedGoalProjectId, loadGoals]);

  useEffect(() => {
    if (activeView !== "protocols") return;
    loadProtocolGoals(selectedProtocolProjectId);
  }, [activeView, selectedProtocolProjectId, loadProtocolGoals]);

  useEffect(() => {
    if (!protocolGoalOptions.length) {
      setSelectedProtocolGoalId("");
      return;
    }

    setSelectedProtocolGoalId((current) => {
      if (current && protocolGoalOptions.some((goal) => goal.id === current)) {
        return current;
      }
      return protocolGoalOptions[0]?.id ?? "";
    });
  }, [protocolGoalOptions]);

  useEffect(() => {
    if (activeView !== "protocols") return;
    loadProtocols(selectedProtocolGoalId);
  }, [activeView, selectedProtocolGoalId, loadProtocols]);

  useEffect(() => {
    if (!projects.length) {
      setSelectedDietPlanProjectId("");
      return;
    }
    setSelectedDietPlanProjectId((current) => {
      if (current && projects.some((p) => p.id === current)) return current;
      if (pinnedProjectId && projects.some((p) => p.id === pinnedProjectId)) return pinnedProjectId;
      return projects[0]?.id ?? "";
    });
  }, [projects, pinnedProjectId]);

  useEffect(() => {
    if (activeView !== "diet-plans") return;
    loadDietPlanGoals(selectedDietPlanProjectId);
  }, [activeView, selectedDietPlanProjectId, loadDietPlanGoals]);

  useEffect(() => {
    if (!dietPlanGoalOptions.length) {
      setSelectedDietPlanGoalId("");
      return;
    }
    setSelectedDietPlanGoalId((current) => {
      if (current && dietPlanGoalOptions.some((g) => g.id === current)) return current;
      return dietPlanGoalOptions[0]?.id ?? "";
    });
  }, [dietPlanGoalOptions]);

  useEffect(() => {
    if (activeView !== "diet-plans") return;
    loadDietPlanProtocols(selectedDietPlanGoalId);
  }, [activeView, selectedDietPlanGoalId, loadDietPlanProtocols]);

  useEffect(() => {
    if (!dietPlanProtocolOptions.length) {
      setSelectedDietPlanProtocolId("");
      return;
    }
    setSelectedDietPlanProtocolId((current) => {
      if (current && dietPlanProtocolOptions.some((p) => p.id === current)) return current;
      return dietPlanProtocolOptions[0]?.id ?? "";
    });
  }, [dietPlanProtocolOptions]);

  useEffect(() => {
    if (activeView !== "diet-plans") return;
    loadDietPlans(selectedDietPlanProtocolId);
  }, [activeView, selectedDietPlanProtocolId, loadDietPlans]);

  function openCreateProject() {
    setEditProjectTarget(null);
    setProjectForm(EMPTY_PROJECT_FORM);
    setProjectDialogOpen(true);
  }

  function openEditProject(project: Project) {
    setEditProjectTarget(project);
    setProjectForm({
      name: project.name,
      isActive: project.isActive,
    });
    setProjectDialogOpen(true);
  }

  function openCreateGoal() {
    if (!selectedGoalProjectId) {
      toast.error("Select a project first.");
      return;
    }
    setEditGoalTarget(null);
    setGoalForm(EMPTY_GOAL_FORM);
    setGoalDialogOpen(true);
  }

  function openEditGoal(goal: Goal) {
    setEditGoalTarget(goal);
    setGoalForm({
      name: goal.name,
      strategyType: goal.strategyType,
      isActive: goal.isActive,
    });
    setGoalDialogOpen(true);
  }

  function openCreateDietPlan() {
    if (!selectedDietPlanProtocolId) {
      toast.error("Select a protocol first.");
      return;
    }
    setEditDietPlanTarget(null);
    setDietPlanForm(EMPTY_DIET_PLAN_FORM);
    setDietPlanDialogOpen(true);
  }

  function openEditDietPlan(plan: DietPlan) {
    setEditDietPlanTarget(plan);
    setDietPlanForm({
      calorieIntensity: plan.calorieIntensity,
      proteinIntensity: plan.proteinIntensity,
      fatIntensity: plan.fatIntensity,
      isActive: plan.isActive,
    });
    setDietPlanDialogOpen(true);
  }

  function openCreateProtocol() {
    if (!selectedProtocolGoalId) {
      toast.error("Select a goal first.");
      return;
    }
    setEditProtocolTarget(null);
    setProtocolForm(EMPTY_PROTOCOL_FORM);
    setProtocolDialogOpen(true);
  }

  function openEditProtocol(protocol: Protocol) {
    setEditProtocolTarget(protocol);
    setProtocolForm({
      name: protocol.name,
      isActive: protocol.isActive,
    });
    setProtocolDialogOpen(true);
  }

  async function handleProjectSave() {
    if (!userId) {
      toast.error("No active user selected.");
      return;
    }
    if (!projectForm.name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setProjectSaving(true);
    try {
      if (editProjectTarget) {
        await updateProject(editProjectTarget.id, {
          name: projectForm.name.trim(),
          is_active: projectForm.isActive,
        });
        toast.success("Project updated");
      } else {
        await createProject({
          name: projectForm.name.trim(),
          user_id: userId,
        });
        toast.success("Project created");
      }
      setProjectDialogOpen(false);
      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save project.");
    } finally {
      setProjectSaving(false);
    }
  }

  async function handleGoalSave() {
    if (!selectedGoalProjectId) {
      toast.error("Select a project first.");
      return;
    }
    if (!goalForm.name.trim()) {
      toast.error("Goal name is required.");
      return;
    }

    setGoalSaving(true);
    try {
      if (editGoalTarget) {
        await updateGoal(editGoalTarget.id, {
          name: goalForm.name.trim(),
          strategy_type: goalForm.strategyType,
          is_active: goalForm.isActive,
        });
        toast.success("Goal updated");
      } else {
        await createGoal({
          name: goalForm.name.trim(),
          project_id: selectedGoalProjectId,
          strategy_type: goalForm.strategyType,
        });
        toast.success("Goal created");
      }
      setGoalDialogOpen(false);
      await loadGoals(selectedGoalProjectId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save goal.");
    } finally {
      setGoalSaving(false);
    }
  }

  async function handleDeleteProject(project: Project) {
    const ok = window.confirm("Delete this project? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteProject(project.id);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((item) => item.id !== project.id));

      if (project.id === pinnedProjectId && userId) {
        setPinnedProjectId(null);
        try {
          localStorage.removeItem(getPinnedKey(userId));
        } catch {
          // ignore storage errors
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete project.");
    }
  }

  async function handleDeleteGoal(goal: Goal) {
    const ok = window.confirm("Delete this goal? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteGoal(goal.id);
      toast.success("Goal deleted");
      setGoals((prev) => prev.filter((item) => item.id !== goal.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete goal.");
    }
  }

  async function handleProtocolSave() {
    if (!selectedProtocolGoalId) {
      toast.error("Select a goal first.");
      return;
    }
    if (!protocolForm.name.trim()) {
      toast.error("Protocol name is required.");
      return;
    }

    setProtocolSaving(true);
    try {
      if (editProtocolTarget) {
        await updateProtocol(editProtocolTarget.id, {
          name: protocolForm.name.trim(),
          is_active: protocolForm.isActive,
        });
        toast.success("Protocol updated");
      } else {
        await createProtocol({
          name: protocolForm.name.trim(),
          goal_id: selectedProtocolGoalId,
        });
        toast.success("Protocol created");
      }
      setProtocolDialogOpen(false);
      await loadProtocols(selectedProtocolGoalId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save protocol.");
    } finally {
      setProtocolSaving(false);
    }
  }

  async function handleDietPlanSave() {
    if (!selectedDietPlanProtocolId) {
      toast.error("Select a protocol first.");
      return;
    }

    setDietPlanSaving(true);
    try {
      if (editDietPlanTarget) {
        await updateDietPlan(editDietPlanTarget.id, {
          calorie_intensity: dietPlanForm.calorieIntensity,
          protein_intensity: dietPlanForm.proteinIntensity,
          fat_intensity: dietPlanForm.fatIntensity,
          is_active: dietPlanForm.isActive,
        });
        toast.success("Diet plan updated");
      } else {
        await createDietPlan({
          protocol_id: selectedDietPlanProtocolId,
          calorie_intensity: dietPlanForm.calorieIntensity,
          protein_intensity: dietPlanForm.proteinIntensity,
          fat_intensity: dietPlanForm.fatIntensity,
        });
        toast.success("Diet plan created");
      }
      setDietPlanDialogOpen(false);
      await loadDietPlans(selectedDietPlanProtocolId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save diet plan.");
    } finally {
      setDietPlanSaving(false);
    }
  }

  async function handleDeleteDietPlan(plan: DietPlan) {
    const ok = window.confirm("Delete this diet plan? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteDietPlan(plan.id);
      toast.success("Diet plan deleted");
      setDietPlans((prev) => prev.filter((item) => item.id !== plan.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete diet plan.");
    }
  }

  async function handleDeleteProtocol(protocol: Protocol) {
    const ok = window.confirm("Delete this protocol? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteProtocol(protocol.id);
      toast.success("Protocol deleted");
      setProtocols((prev) => prev.filter((item) => item.id !== protocol.id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete protocol.");
    }
  }

  function handleTogglePin(project: Project) {
    if (!userId) {
      toast.error("No active user selected.");
      return;
    }

    const nextPinned = pinnedProjectId === project.id ? null : project.id;
    setPinnedProjectId(nextPinned);

    try {
      if (nextPinned) {
        localStorage.setItem(getPinnedKey(userId), nextPinned);
        toast.success(`Pinned project: ${project.name}`);
      } else {
        localStorage.removeItem(getPinnedKey(userId));
        toast.success("Pinned project cleared");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not persist pinned project.");
    }
  }

  function handleToggleOverviewProject(projectId: string) {
    setOverviewExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
    if (!overviewProjectData[projectId]) {
      loadOverviewProject(projectId);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-[16px] font-semibold">Projects</h1>
        <p className="text-[12px] text-[var(--text3)] mt-0.5">
          Manage your training structure, goals, and pin your active project
        </p>
      </div>

      <div
        className="flex gap-1 p-1 rounded-[10px] w-fit"
        style={{ background: "var(--bg3)" }}
      >
        {VIEW_TABS.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveView(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "px-4 py-1.5 rounded-[7px] text-[12px] font-medium transition-all border-none",
                tab.disabled ? "cursor-not-allowed" : "cursor-pointer",
                isActive
                  ? "bg-[var(--bg)] text-[var(--text)]"
                  : "bg-transparent text-[var(--text3)] hover:text-[var(--text2)]"
              )}
              style={tab.disabled ? { opacity: 0.5 } : undefined}
            >
              <span className="inline-flex items-center gap-1.5">
                {tab.label}
                {tab.disabled && <Lock size="0.75rem" />}
              </span>
            </button>
          );
        })}
      </div>

      {activeView === "projects" && (
        <>
          {pinnedProject && (
            <div
              className="rounded-xl border border-[var(--border)] p-4"
              style={{ background: "var(--bg2)" }}
            >
              <div className="text-[11px] text-[var(--text3)] uppercase tracking-widest mb-2">
                Pinned project
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Pin size="0.93rem" className="text-[var(--amber)]" />
                  <span className="text-[13px] font-medium">{pinnedProject.name}</span>
                  <StatusPill isActive={pinnedProject.isActive} />
                </div>
                <Button variant="ghost" onClick={() => handleTogglePin(pinnedProject)} className="gap-1.5">
                  <PinOff size="0.86rem" />
                  Unpin
                </Button>
              </div>
            </div>
          )}

          <div
            className="rounded-xl border border-[var(--border)] overflow-hidden"
            style={{ background: "var(--bg2)" }}
          >
            <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-[12px] font-medium">All projects</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text3)]">
                  {projects.length} project{projects.length !== 1 ? "s" : ""}
                </span>
                <Button variant="primary" onClick={openCreateProject} className="gap-1.5 text-[12px]">
                  <Plus size="1rem" />
                  New project
                </Button>
              </div>
            </div>

            {loading && (
              <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading...</div>
            )}

            {error && <div className="px-4 py-8 text-center text-[12px] text-[var(--red)]">{error}</div>}

            {!loading && !error && projects.length === 0 && (
              <div className="px-4 py-12 flex flex-col items-center gap-3 text-[var(--text3)]">
                <FolderKanban size="2rem" className="opacity-40" />
                <p className="text-[12px]">No projects yet.</p>
                <Button variant="ghost" onClick={openCreateProject} className="text-[12px] gap-1.5">
                  <Plus size="0.93rem" />
                  Add your first project
                </Button>
              </div>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                      {["", "Name", "Status", "Actions"].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProjects.map((project) => {
                      const isPinned = pinnedProjectId === project.id;
                      return (
                        <tr
                          key={project.id}
                          className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                          style={isPinned ? { background: "var(--bg3)" } : undefined}
                        >
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePin(project)}
                              className={cn(
                                "p-1.5 rounded-md transition-colors",
                                isPinned
                                  ? "text-[var(--amber)] hover:bg-[var(--bg4)]"
                                  : "text-[var(--text3)] hover:text-[var(--amber)] hover:bg-[var(--bg4)]"
                              )}
                              title={isPinned ? "Unpin project" : "Pin project"}
                            >
                              <Pin size="0.9rem" fill={isPinned ? "currentColor" : "none"} />
                            </button>
                          </td>
                          <td className="px-4 py-2.5 font-medium">{project.name}</td>
                          <td className="px-4 py-2.5">
                            <StatusPill isActive={project.isActive} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditProject(project)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg4)] transition-colors"
                                title="Edit"
                              >
                                <Pencil size="0.93rem" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--red)] hover:bg-[var(--bg4)] transition-colors"
                                title="Delete"
                              >
                                <Trash2 size="0.93rem" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === "goals" && (
        <>
          <div
            className="rounded-xl border border-[var(--border)] p-4"
            style={{ background: "var(--bg2)" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-1.5 min-w-[220px]">
                <label className={labelCls}>Project context</label>
                <select
                  className={inputCls}
                  value={selectedGoalProjectId}
                  onChange={(e) => setSelectedGoalProjectId(e.target.value)}
                  disabled={loading || projects.length === 0}
                >
                  {projects.length === 0 ? (
                    <option value="">No projects available</option>
                  ) : (
                    sortedProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                        {pinnedProjectId === project.id ? " (pinned)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedGoalProject && <StatusPill isActive={selectedGoalProject.isActive} />}
                {selectedGoalProject && pinnedProjectId === selectedGoalProject.id && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[var(--amber)]">
                    <Pin size="0.8rem" />
                    pinned project
                  </span>
                )}
                <Button
                  variant="primary"
                  onClick={openCreateGoal}
                  className="gap-1.5 text-[12px]"
                  disabled={!selectedGoalProjectId}
                >
                  <Plus size="1rem" />
                  New goal
                </Button>
              </div>
            </div>

            {selectedGoalProject && (
              <p className="text-[12px] text-[var(--text3)] mt-3">
                Managing goals for <span className="text-[var(--text)] font-medium">{selectedGoalProject.name}</span>
              </p>
            )}
          </div>

          {!loading && projects.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a project first before adding goals.
            </div>
          )}

          {projects.length > 0 && (
            <div
              className="rounded-xl border border-[var(--border)] overflow-hidden"
              style={{ background: "var(--bg2)" }}
            >
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[12px] font-medium">Goals</span>
                <span className="text-[11px] text-[var(--text3)]">
                  {goals.length} goal{goals.length !== 1 ? "s" : ""}
                </span>
              </div>

              {goalsLoading && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading...</div>
              )}

              {goalsError && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--red)]">{goalsError}</div>
              )}

              {!goalsLoading && !goalsError && goals.length === 0 && (
                <div className="px-4 py-12 flex flex-col items-center gap-3 text-[var(--text3)]">
                  <GitBranch size="2rem" className="opacity-40" />
                  <p className="text-[12px]">No goals yet for this project.</p>
                  <Button variant="ghost" onClick={openCreateGoal} className="text-[12px] gap-1.5">
                    <Plus size="0.93rem" />
                    Add your first goal
                  </Button>
                </div>
              )}

              {!goalsLoading && !goalsError && goals.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                        {["Name", "Strategy", "Status", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGoals.map((goal) => (
                        <tr
                          key={goal.id}
                          className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium">{goal.name}</td>
                          <td className="px-4 py-2.5 text-[var(--text2)]">
                            {STRATEGY_OPTIONS.find((option) => option.value === goal.strategyType)?.label ?? goal.strategyType}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusPill isActive={goal.isActive} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditGoal(goal)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg4)] transition-colors"
                                title="Edit"
                              >
                                <Pencil size="0.93rem" />
                              </button>
                              <button
                                onClick={() => handleDeleteGoal(goal)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--red)] hover:bg-[var(--bg4)] transition-colors"
                                title="Delete"
                              >
                                <Trash2 size="0.93rem" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === "protocols" && (
        <>
          <div
            className="rounded-xl border border-[var(--border)] p-4"
            style={{ background: "var(--bg2)" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-4 md:grid-cols-2 flex-1">
                <div className="flex flex-col gap-1.5 min-w-[220px]">
                  <label className={labelCls}>Project context</label>
                  <select
                    className={inputCls}
                    value={selectedProtocolProjectId}
                    onChange={(e) => setSelectedProtocolProjectId(e.target.value)}
                    disabled={loading || projects.length === 0}
                  >
                    {projects.length === 0 ? (
                      <option value="">No projects available</option>
                    ) : (
                      sortedProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                          {pinnedProjectId === project.id ? " (pinned)" : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[220px]">
                  <label className={labelCls}>Goal context</label>
                  <select
                    className={inputCls}
                    value={selectedProtocolGoalId}
                    onChange={(e) => setSelectedProtocolGoalId(e.target.value)}
                    disabled={
                      !selectedProtocolProjectId ||
                      protocolGoalOptionsLoading ||
                      sortedProtocolGoalOptions.length === 0
                    }
                  >
                    {!selectedProtocolProjectId ? (
                      <option value="">Select a project first</option>
                    ) : sortedProtocolGoalOptions.length === 0 ? (
                      <option value="">No goals available</option>
                    ) : (
                      sortedProtocolGoalOptions.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedProtocolProject && <StatusPill isActive={selectedProtocolProject.isActive} />}
                {selectedProtocolGoal && <StatusPill isActive={selectedProtocolGoal.isActive} />}
                <Button
                  variant="primary"
                  onClick={openCreateProtocol}
                  className="gap-1.5 text-[12px]"
                  disabled={!selectedProtocolGoalId}
                >
                  <Plus size="1rem" />
                  New protocol
                </Button>
              </div>
            </div>

            {selectedProtocolProject && selectedProtocolGoal && (
              <p className="text-[12px] text-[var(--text3)] mt-3">
                Managing protocols for <span className="text-[var(--text)] font-medium">{selectedProtocolGoal.name}</span> in <span className="text-[var(--text)] font-medium">{selectedProtocolProject.name}</span>
              </p>
            )}

            {protocolGoalOptionsError && (
              <p className="text-[12px] text-[var(--red)] mt-3">{protocolGoalOptionsError}</p>
            )}
          </div>

          {!loading && projects.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a project first before adding protocols.
            </div>
          )}

          {!loading && projects.length > 0 && !protocolGoalOptionsLoading && sortedProtocolGoalOptions.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a goal first before adding protocols.
            </div>
          )}

          {projects.length > 0 && selectedProtocolProjectId && sortedProtocolGoalOptions.length > 0 && (
            <div
              className="rounded-xl border border-[var(--border)] overflow-hidden"
              style={{ background: "var(--bg2)" }}
            >
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[12px] font-medium">Protocols</span>
                <span className="text-[11px] text-[var(--text3)]">
                  {protocols.length} protocol{protocols.length !== 1 ? "s" : ""}
                </span>
              </div>

              {protocolGoalOptionsLoading && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading goals...</div>
              )}

              {protocolsLoading && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading...</div>
              )}

              {protocolsError && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--red)]">{protocolsError}</div>
              )}

              {!protocolsLoading && !protocolsError && protocols.length === 0 && (
                <div className="px-4 py-12 flex flex-col items-center gap-3 text-[var(--text3)]">
                  <GitBranch size="2rem" className="opacity-40" />
                  <p className="text-[12px]">No protocols yet for this goal.</p>
                  <Button variant="ghost" onClick={openCreateProtocol} className="text-[12px] gap-1.5">
                    <Plus size="0.93rem" />
                    Add your first protocol
                  </Button>
                </div>
              )}

              {!protocolsLoading && !protocolsError && protocols.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                        {["Name", "Status", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProtocols.map((protocol) => (
                        <tr
                          key={protocol.id}
                          className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium">{protocol.name}</td>
                          <td className="px-4 py-2.5">
                            <StatusPill isActive={protocol.isActive} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditProtocol(protocol)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg4)] transition-colors"
                                title="Edit"
                              >
                                <Pencil size="0.93rem" />
                              </button>
                              <button
                                onClick={() => handleDeleteProtocol(protocol)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--red)] hover:bg-[var(--bg4)] transition-colors"
                                title="Delete"
                              >
                                <Trash2 size="0.93rem" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === "diet-plans" && (
        <>
          <div
            className="rounded-xl border border-[var(--border)] p-4"
            style={{ background: "var(--bg2)" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="grid gap-4 md:grid-cols-3 flex-1">
                <div className="flex flex-col gap-1.5 min-w-[180px]">
                  <label className={labelCls}>Project context</label>
                  <select
                    className={inputCls}
                    value={selectedDietPlanProjectId}
                    onChange={(e) => setSelectedDietPlanProjectId(e.target.value)}
                    disabled={loading || projects.length === 0}
                  >
                    {projects.length === 0 ? (
                      <option value="">No projects available</option>
                    ) : (
                      sortedProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                          {pinnedProjectId === project.id ? " (pinned)" : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[180px]">
                  <label className={labelCls}>Goal context</label>
                  <select
                    className={inputCls}
                    value={selectedDietPlanGoalId}
                    onChange={(e) => setSelectedDietPlanGoalId(e.target.value)}
                    disabled={
                      !selectedDietPlanProjectId ||
                      dietPlanGoalOptionsLoading ||
                      sortedDietPlanGoalOptions.length === 0
                    }
                  >
                    {!selectedDietPlanProjectId ? (
                      <option value="">Select a project first</option>
                    ) : sortedDietPlanGoalOptions.length === 0 ? (
                      <option value="">No goals available</option>
                    ) : (
                      sortedDietPlanGoalOptions.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 min-w-[180px]">
                  <label className={labelCls}>Protocol context</label>
                  <select
                    className={inputCls}
                    value={selectedDietPlanProtocolId}
                    onChange={(e) => setSelectedDietPlanProtocolId(e.target.value)}
                    disabled={
                      !selectedDietPlanGoalId ||
                      dietPlanProtocolOptionsLoading ||
                      sortedDietPlanProtocolOptions.length === 0
                    }
                  >
                    {!selectedDietPlanGoalId ? (
                      <option value="">Select a goal first</option>
                    ) : sortedDietPlanProtocolOptions.length === 0 ? (
                      <option value="">No protocols available</option>
                    ) : (
                      sortedDietPlanProtocolOptions.map((protocol) => (
                        <option key={protocol.id} value={protocol.id}>
                          {protocol.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedDietPlanProject && <StatusPill isActive={selectedDietPlanProject.isActive} />}
                {selectedDietPlanGoal && <StatusPill isActive={selectedDietPlanGoal.isActive} />}
                {selectedDietPlanProtocol && <StatusPill isActive={selectedDietPlanProtocol.isActive} />}
                <Button
                  variant="primary"
                  onClick={openCreateDietPlan}
                  className="gap-1.5 text-[12px]"
                  disabled={!selectedDietPlanProtocolId}
                >
                  <Plus size="1rem" />
                  New diet plan
                </Button>
              </div>
            </div>

            {selectedDietPlanProject && selectedDietPlanProtocol && (
              <p className="text-[12px] text-[var(--text3)] mt-3">
                Managing diet plans for <span className="text-[var(--text)] font-medium">{selectedDietPlanProtocol.name}</span> in <span className="text-[var(--text)] font-medium">{selectedDietPlanProject.name}</span>
              </p>
            )}

            {dietPlanGoalOptionsError && (
              <p className="text-[12px] text-[var(--red)] mt-3">{dietPlanGoalOptionsError}</p>
            )}
            {dietPlanProtocolOptionsError && (
              <p className="text-[12px] text-[var(--red)] mt-3">{dietPlanProtocolOptionsError}</p>
            )}
          </div>

          {!loading && projects.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a project first before adding diet plans.
            </div>
          )}

          {!loading && projects.length > 0 && !dietPlanGoalOptionsLoading && sortedDietPlanGoalOptions.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a goal first before adding diet plans.
            </div>
          )}

          {!loading && projects.length > 0 && sortedDietPlanGoalOptions.length > 0 && !dietPlanProtocolOptionsLoading && sortedDietPlanProtocolOptions.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              Create a protocol first before adding diet plans.
            </div>
          )}

          {projects.length > 0 && selectedDietPlanProtocolId && sortedDietPlanProtocolOptions.length > 0 && (
            <div
              className="rounded-xl border border-[var(--border)] overflow-hidden"
              style={{ background: "var(--bg2)" }}
            >
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <span className="text-[12px] font-medium">Diet Plans</span>
                <span className="text-[11px] text-[var(--text3)]">
                  {dietPlans.length} plan{dietPlans.length !== 1 ? "s" : ""}
                </span>
              </div>

              {dietPlansLoading && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading...</div>
              )}

              {dietPlansError && (
                <div className="px-4 py-8 text-center text-[12px] text-[var(--red)]">{dietPlansError}</div>
              )}

              {!dietPlansLoading && !dietPlansError && dietPlans.length === 0 && (
                <div className="px-4 py-12 flex flex-col items-center gap-3 text-[var(--text3)]">
                  <UtensilsCrossed size="2rem" className="opacity-40" />
                  <p className="text-[12px]">No diet plans yet for this protocol.</p>
                  <Button variant="ghost" onClick={openCreateDietPlan} className="text-[12px] gap-1.5">
                    <Plus size="0.93rem" />
                    Add your first diet plan
                  </Button>
                </div>
              )}

              {!dietPlansLoading && !dietPlansError && dietPlans.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                        {["Calorie", "Protein", "Fat", "Kcal", "Protein (g)", "Carbs (g)", "Fat (g)", "Water (L)", "Status", "Actions"].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDietPlans.map((plan) => (
                        <tr
                          key={plan.id}
                          className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                        >
                          <td className="px-4 py-2.5 capitalize text-[var(--text2)]">{plan.calorieIntensity}</td>
                          <td className="px-4 py-2.5 capitalize text-[var(--text2)]">{plan.proteinIntensity}</td>
                          <td className="px-4 py-2.5 capitalize text-[var(--text2)]">{plan.fatIntensity}</td>
                          <td className="px-4 py-2.5 font-medium">{Math.round(plan.calories)}</td>
                          <td className="px-4 py-2.5">{plan.protein.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{plan.carbs.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{plan.fat.toFixed(1)}</td>
                          <td className="px-4 py-2.5">{plan.water.toFixed(1)}</td>
                          <td className="px-4 py-2.5">
                            <StatusPill isActive={plan.isActive} />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditDietPlan(plan)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg4)] transition-colors"
                                title="Edit"
                              >
                                <Pencil size="0.93rem" />
                              </button>
                              <button
                                onClick={() => handleDeleteDietPlan(plan)}
                                className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--red)] hover:bg-[var(--bg4)] transition-colors"
                                title="Delete"
                              >
                                <Trash2 size="0.93rem" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeView === "overview" && (
        <>
          {loading && (
            <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">Loading…</div>
          )}

          {!loading && projects.length === 0 && (
            <div
              className="rounded-xl border border-[var(--border)] p-12 flex flex-col items-center gap-3 text-[var(--text3)]"
              style={{ background: "var(--bg2)" }}
            >
              <FolderKanban size="2.5rem" className="opacity-40" />
              <p className="text-[13px] font-medium text-[var(--text2)]">No projects yet</p>
              <p className="text-[12px]">Create your first project to get started.</p>
              <Button
                variant="primary"
                onClick={() => setActiveView("projects")}
                className="mt-2 gap-1.5 text-[12px]"
              >
                <Plus size="0.93rem" />
                Go to Projects
              </Button>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <>
              {pinnedProject ? (
                <div
                  className="rounded-xl border border-[var(--amber)]/30 p-4"
                  style={{ background: "var(--bg2)" }}
                >
                  <div className="text-[11px] text-[var(--text3)] uppercase tracking-widest mb-2">
                    Pinned project
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Pin size="0.93rem" className="text-[var(--amber)] shrink-0" />
                      <span className="text-[14px] font-semibold truncate">{pinnedProject.name}</span>
                      <StatusPill isActive={pinnedProject.isActive} />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView("projects")}
                      className="gap-1.5 text-[12px] shrink-0"
                    >
                      <FolderKanban size="0.86rem" />
                      Manage
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl border border-[var(--border)] p-4 flex items-center justify-between gap-3"
                  style={{ background: "var(--bg2)" }}
                >
                  <div>
                    <p className="text-[13px] font-medium">No pinned project</p>
                    <p className="text-[12px] text-[var(--text3)] mt-0.5">
                      Pin a project to see its summary here.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveView("projects")}
                    className="gap-1.5 text-[12px] shrink-0"
                  >
                    <Pin size="0.86rem" />
                    Pin a project
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    label: "Projects",
                    value: projects.length as React.ReactNode,
                    icon: <FolderKanban size="1rem" />,
                    color: "var(--blue)",
                    sub: null as string | null,
                  },
                  {
                    label: "Goals",
                    value: pinnedSummaryLoading ? "…" : pinnedSummary ? pinnedSummary.goalCount : "—",
                    icon: <GitBranch size="1rem" />,
                    color: "var(--green)",
                    sub: pinnedProject ? pinnedProject.name : "pin a project to see",
                  },
                  {
                    label: "Protocols",
                    value: pinnedSummaryLoading ? "…" : pinnedSummary ? pinnedSummary.protocolCount : "—",
                    icon: <GitBranch size="1rem" />,
                    color: "var(--amber)",
                    sub: pinnedProject ? pinnedProject.name : "pin a project to see",
                  },
                  {
                    label: "Diet Plans",
                    value: pinnedSummaryLoading ? "…" : pinnedSummary ? pinnedSummary.dietPlanCount : "—",
                    icon: <UtensilsCrossed size="1rem" />,
                    color: "var(--red)",
                    sub: pinnedProject ? pinnedProject.name : "pin a project to see",
                  },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="rounded-xl border border-[var(--border)] p-4"
                    style={{ background: "var(--bg2)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span style={{ color: card.color }}>{card.icon}</span>
                      <span className={labelCls}>{card.label}</span>
                    </div>
                    <div className="text-[22px] font-bold leading-none mb-1">{card.value}</div>
                    {card.sub && (
                      <div className="text-[10px] text-[var(--text3)] truncate" title={card.sub}>
                        {card.sub}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl border border-[var(--border)] overflow-hidden"
                style={{ background: "var(--bg2)" }}
              >
                <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
                  <span className="text-[12px] font-medium">All Projects</span>
                  <span className="text-[11px] text-[var(--text3)]">
                    {projects.length} project{projects.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {sortedProjects.map((project) => {
                  const isExpanded = overviewExpandedIds.has(project.id);
                  const data = overviewProjectData[project.id];
                  const isPinned = pinnedProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      className={cn(
                        "border-b border-[var(--border)] last:border-0",
                        isPinned && "bg-[var(--bg3)]"
                      )}
                    >
                      <button
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg3)] transition-colors cursor-pointer"
                        onClick={() => handleToggleOverviewProject(project.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown size="0.9rem" className="text-[var(--text3)] shrink-0" />
                        ) : (
                          <ChevronRight size="0.9rem" className="text-[var(--text3)] shrink-0" />
                        )}
                        <span className="text-[13px] font-medium flex-1 text-left">
                          {project.name}
                        </span>
                        {isPinned && (
                          <Pin size="0.8rem" className="text-[var(--amber)] shrink-0" />
                        )}
                        <StatusPill isActive={project.isActive} />
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3">
                          {(!data || data.loading) && (
                            <p className="text-[12px] text-[var(--text3)] py-2 pl-6">Loading…</p>
                          )}
                          {data && !data.loading && data.goals.length === 0 && (
                            <p className="text-[12px] text-[var(--text3)] py-2 pl-6">
                              No goals for this project.
                            </p>
                          )}
                          {data && !data.loading && data.goals.length > 0 && (
                            <div className="ml-6 mt-1 rounded-lg border border-[var(--border)] overflow-hidden">
                              <table className="w-full text-[12px]">
                                <thead>
                                  <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                                    {["Goal", "Strategy", "Status", "Protocols", "Diet Plans"].map(
                                      (h) => (
                                        <th
                                          key={h}
                                          className="px-3 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                                        >
                                          {h}
                                        </th>
                                      )
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.goals.map((goal) => {
                                    const gd = data.goalData[goal.id];
                                    return (
                                      <tr
                                        key={goal.id}
                                        className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                                      >
                                        <td className="px-3 py-2.5 font-medium">{goal.name}</td>
                                        <td className="px-3 py-2.5 text-[var(--text2)] capitalize">
                                          {STRATEGY_OPTIONS.find((o) => o.value === goal.strategyType)?.label ?? goal.strategyType}
                                        </td>
                                        <td className="px-3 py-2.5">
                                          <StatusPill isActive={goal.isActive} />
                                        </td>
                                        <td className="px-3 py-2.5 text-[var(--text2)]">
                                          {data.countsLoading && !gd ? (
                                            <span className="text-[var(--text3)]">…</span>
                                          ) : (
                                            gd?.protocolCount ?? 0
                                          )}
                                        </td>
                                        <td className="px-3 py-2.5 text-[var(--text2)]">
                                          {data.countsLoading && !gd ? (
                                            <span className="text-[var(--text3)]">…</span>
                                          ) : (
                                            gd?.dietPlanCount ?? 0
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProjectTarget ? "Edit project" : "New project"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Project name *</label>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. Lean Mass Phase"
                value={projectForm.name}
                onChange={(e) => setProjectForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {editProjectTarget && (
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text2)]">
                <input
                  type="checkbox"
                  checked={projectForm.isActive}
                  onChange={(e) => setProjectForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active project
              </label>
            )}
          </div>

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={() => setProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleProjectSave} disabled={projectSaving}>
              {projectSaving ? "Saving..." : editProjectTarget ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editGoalTarget ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Goal name *</label>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. Summer Recomp"
                value={goalForm.name}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Strategy type *</label>
              <select
                className={inputCls}
                value={goalForm.strategyType}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, strategyType: e.target.value }))}
              >
                {STRATEGY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {editGoalTarget && (
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text2)]">
                <input
                  type="checkbox"
                  checked={goalForm.isActive}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active goal
              </label>
            )}
          </div>

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={() => setGoalDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGoalSave} disabled={goalSaving}>
              {goalSaving ? "Saving..." : editGoalTarget ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={protocolDialogOpen} onOpenChange={setProtocolDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProtocolTarget ? "Edit protocol" : "New protocol"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Protocol name *</label>
              <input
                className={inputCls}
                type="text"
                placeholder="e.g. Progressive overload"
                value={protocolForm.name}
                onChange={(e) => setProtocolForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {editProtocolTarget && (
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text2)]">
                <input
                  type="checkbox"
                  checked={protocolForm.isActive}
                  onChange={(e) => setProtocolForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active protocol
              </label>
            )}
          </div>

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={() => setProtocolDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleProtocolSave} disabled={protocolSaving}>
              {protocolSaving ? "Saving..." : editProtocolTarget ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dietPlanDialogOpen} onOpenChange={setDietPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDietPlanTarget ? "Edit diet plan" : "New diet plan"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Calorie intensity *</label>
              <select
                className={inputCls}
                value={dietPlanForm.calorieIntensity}
                onChange={(e) => setDietPlanForm((prev) => ({ ...prev, calorieIntensity: e.target.value }))}
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Protein intensity *</label>
              <select
                className={inputCls}
                value={dietPlanForm.proteinIntensity}
                onChange={(e) => setDietPlanForm((prev) => ({ ...prev, proteinIntensity: e.target.value }))}
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Fat intensity *</label>
              <select
                className={inputCls}
                value={dietPlanForm.fatIntensity}
                onChange={(e) => setDietPlanForm((prev) => ({ ...prev, fatIntensity: e.target.value }))}
              >
                {INTENSITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {editDietPlanTarget && (
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text2)]">
                <input
                  type="checkbox"
                  checked={dietPlanForm.isActive}
                  onChange={(e) => setDietPlanForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Active diet plan
              </label>
            )}
          </div>

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={() => setDietPlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDietPlanSave} disabled={dietPlanSaving}>
              {dietPlanSaving ? "Saving..." : editDietPlanTarget ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
