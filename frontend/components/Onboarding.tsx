"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Dumbbell,
  Apple,
  BarChart3,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createUser,
  updateUser,
  createAssessment,
  updateAssessment,
  createProject,
  createGoal,
  createProtocol,
  createDietPlan,
  type ApiUser,
} from "@/lib/api";

// ─── Step definitions ──────────────────────────────────────────────────────────

type StepId =
  | "app-brief"
  | "user"
  | "assessment"
  | "project"
  | "goal"
  | "protocol"
  | "diet-plan"
  | "show-feats";

const ALL_STEPS: StepId[] = [
  "app-brief",
  "user",
  "assessment",
  "project",
  "goal",
  "protocol",
  "diet-plan",
  "show-feats",
];

const STEP_LABELS: Record<StepId, string> = {
  "app-brief": "Welcome",
  user: "Profile",
  assessment: "Assessment",
  project: "Project",
  goal: "Goal",
  protocol: "Protocol",
  "diet-plan": "Diet Plan",
  "show-feats": "Features",
};

// ─── Persisted state ───────────────────────────────────────────────────────────

interface FormValues {
  // user
  name: string;
  email: string;
  birthDate: string;
  biologicalSex: string;
  // assessment
  height: string;
  weight: string;
  bodyFat: string;
  activityLevel: string;
  // project
  projectName: string;
  // goal
  goalName: string;
  strategyType: string;
  // protocol
  protocolName: string;
  // diet plan
  calorieIntensity: string;
  proteinIntensity: string;
  fatIntensity: string;
}

const DEFAULT_FORM: FormValues = {
  name: "", email: "", birthDate: "", biologicalSex: "",
  height: "", weight: "", bodyFat: "", activityLevel: "",
  projectName: "",
  goalName: "", strategyType: "",
  protocolName: "",
  calorieIntensity: "", proteinIntensity: "", fatIntensity: "",
};

interface SavedIds {
  userId: string;
  assessmentId: string;
  projectId: string;
  goalId: string;
  protocolId: string;
  dietPlanId: string;
}

const DEFAULT_IDS: SavedIds = {
  userId: "", assessmentId: "", projectId: "", goalId: "", protocolId: "", dietPlanId: "",
};

interface OnboardingProgress {
  allStepsIndex: number;
  form: FormValues;
  ids: SavedIds;
}

const PROGRESS_KEY = "projetin:onboarding:progress";

function loadProgress(): OnboardingProgress | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(PROGRESS_KEY) : null;
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveProgress(p: OnboardingProgress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

function clearProgress() {
  try { localStorage.removeItem(PROGRESS_KEY); } catch { /* ignore */ }
}

// ─── Shared field primitives ───────────────────────────────────────────────────

function Field({
  label, children, hint,
}: {
  label: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs uppercase tracking-[0.15em] text-[var(--text3)]">{label}</label>
      {children}
      {hint && <p className="text-[0.79rem] text-[var(--text3)]">{hint}</p>}
    </div>
  );
}

function Input({
  value, onChange, type = "text", placeholder,
}: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--blue)] transition-colors"
    />
  );
}

function Select({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--blue)] transition-colors"
    >
      <option value="" disabled>Select…</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── Step components (all controlled — form values from parent) ─────────────────

function AppBriefStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--blue)] mb-3">ProjetIn</div>
        <h1 className="text-3xl font-semibold text-[var(--text)] mb-3">
          Your AI-powered fitness hub
        </h1>
        <p className="text-[var(--text2)] text-sm max-w-sm leading-relaxed">
          Track workouts, plan nutrition, and monitor your body composition —
          all in one intelligent dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {[
          { icon: <Dumbbell size="1.29rem" />, title: "Workout tracking",    desc: "Log sessions & volume" },
          { icon: <Apple    size="1.29rem" />, title: "Nutrition planning",  desc: "Diet plans & meal logs" },
          { icon: <BarChart3 size="1.29rem" />, title: "Body analytics",     desc: "Assessments & trends" },
          { icon: <Layers   size="1.29rem" />, title: "Widgets",             desc: "Drag-and-drop dashboard" },
        ].map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg3)] p-4 text-left"
          >
            <div className="text-[var(--blue)]">{f.icon}</div>
            <div className="text-sm font-medium text-[var(--text)]">{f.title}</div>
            <div className="text-[0.79rem] text-[var(--text3)]">{f.desc}</div>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={onNext} className="px-8">
        Get started
        <ChevronRight size="1.14rem" className="ml-1" />
      </Button>
    </div>
  );
}

function UserStep({
  userId, form, onChange, onNext,
}: {
  userId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (userId: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!userId;

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!form.biologicalSex) { toast.error("Biological sex is required for BMR calculation."); return; }
    setLoading(true);
    try {
      if (isEdit) {
        await updateUser(userId, {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          birthDate: form.birthDate || undefined,
          biologicalSex: form.biologicalSex,
        });
        localStorage.setItem("projetin:user:name", form.name.trim());
        if (form.email) localStorage.setItem("projetin:user:email", form.email.trim());
        onNext(userId);
      } else {
        const user: ApiUser = await createUser({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          birthDate: form.birthDate || undefined,
          biologicalSex: form.biologicalSex,
        });
        localStorage.setItem("projetin:user:id", user.id);
        localStorage.setItem("projetin:user:name", user.name);
        if (user.email) localStorage.setItem("projetin:user:email", user.email);
        onNext(user.id);
      }
    } catch (err) {
      toast.error("Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">
          {isEdit ? "Edit your profile" : "Create your profile"}
        </h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          Tell us a bit about yourself so we can personalise your experience.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full name" hint="Required">
          <Input value={form.name} onChange={(v) => onChange({ name: v })} placeholder="e.g. Alex Costa" />
        </Field>
        <Field label="Email" hint="Optional">
          <Input value={form.email} onChange={(v) => onChange({ email: v })} type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Date of birth" hint="Used for BMR calculation">
          <Input value={form.birthDate} onChange={(v) => onChange({ birthDate: v })} type="date" />
        </Field>
        <Field label="Biological sex" hint="Required for BMR calculation">
          <Select
            value={form.biologicalSex}
            onChange={(v) => onChange({ biologicalSex: v })}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Update & continue" : "Create profile"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function AssessmentStep({
  userId, assessmentId, form, onChange, onNext, onBack, canGoBack,
}: {
  userId: string;
  assessmentId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (assessmentId: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!assessmentId;

  async function handleSubmit() {
    if (!form.height || !form.weight || !form.activityLevel) {
      toast.error("Height, weight and activity level are required.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateAssessment(assessmentId, {
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
          body_fat: form.bodyFat ? parseFloat(form.bodyFat) : 0,
          activity_level: form.activityLevel,
        });
        onNext(assessmentId);
      } else {
        const a = await createAssessment({
          user_id: userId,
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
          body_fat: form.bodyFat ? parseFloat(form.bodyFat) : 0,
          activity_level: form.activityLevel,
        });
        onNext(a.id);
      }
    } catch (err) {
      toast.error("Failed to save assessment. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Body assessment</h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          Your current body metrics. Used to calculate your BMR and TDEE.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Height (cm)" hint="Required">
          <Input value={form.height} onChange={(v) => onChange({ height: v })} type="number" placeholder="175" />
        </Field>
        <Field label="Weight (kg)" hint="Required">
          <Input value={form.weight} onChange={(v) => onChange({ weight: v })} type="number" placeholder="75" />
        </Field>
        <Field label="Body fat (%)" hint="Optional — leave blank to skip">
          <Input value={form.bodyFat} onChange={(v) => onChange({ bodyFat: v })} type="number" placeholder="18" />
        </Field>
        <Field label="Activity level" hint="Required">
          <Select
            value={form.activityLevel}
            onChange={(v) => onChange({ activityLevel: v })}
            options={[
              { value: "sedentary",          label: "Sedentary (desk job, no exercise)" },
              { value: "lightly_active",     label: "Lightly active (1–3 days/week)" },
              { value: "moderately_active",  label: "Moderately active (3–5 days/week)" },
              { value: "very_active",        label: "Very active (6–7 days/week)" },
              { value: "extremely_active",   label: "Extremely active (2× daily)" },
            ]}
          />
        </Field>
      </div>

      <div className="flex justify-between">
        {canGoBack ? (
          <Button variant="ghost" onClick={onBack}>
            <ChevronLeft size="1.14rem" className="mr-1" /> Back
          </Button>
        ) : <div />}
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving…" : isEdit ? "Update & continue" : "Next"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function ProjectStep({
  userId, projectId, form, onChange, onNext, onBack,
}: {
  userId: string;
  projectId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (projectId: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.projectName.trim()) { toast.error("Project name is required."); return; }
    // Already created — just advance without re-creating
    if (projectId) { onNext(projectId); return; }
    setLoading(true);
    try {
      const p = await createProject({ name: form.projectName.trim(), user_id: userId });
      onNext(p.id);
    } catch (err) {
      toast.error("Failed to create project. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Create a project</h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          A project groups your fitness goals. Think of it as a training block or season.
        </p>
      </div>

      <Field label="Project name" hint={'Required — e.g. "Summer Cut 2026"'}>
        <Input value={form.projectName} onChange={(v) => onChange({ projectName: v })} placeholder="My Fitness Project" />
      </Field>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft size="1.14rem" className="mr-1" /> Back
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Next"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function GoalStep({
  projectId, goalId, form, onChange, onNext, onBack,
}: {
  projectId: string;
  goalId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (goalId: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.goalName.trim() || !form.strategyType) {
      toast.error("Goal name and strategy type are required.");
      return;
    }
    if (goalId) { onNext(goalId); return; }
    setLoading(true);
    try {
      const g = await createGoal({
        name: form.goalName.trim(),
        project_id: projectId,
        strategy_type: form.strategyType,
      });
      onNext(g.id);
    } catch (err) {
      toast.error("Failed to create goal. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Set your goal</h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          Define what you want to achieve and the strategy to get there.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Goal name" hint={'Required — e.g. "Lose 5kg"'}>
          <Input value={form.goalName} onChange={(v) => onChange({ goalName: v })} placeholder="My Goal" />
        </Field>
        <Field label="Strategy" hint="Required">
          <Select
            value={form.strategyType}
            onChange={(v) => onChange({ strategyType: v })}
            options={[
              { value: "cut",           label: "Cut — lose body fat" },
              { value: "bulk",          label: "Bulk — gain muscle mass" },
              { value: "maintain",      label: "Maintain — keep current weight" },
              { value: "recomposition", label: "Recomposition — lose fat & gain muscle" },
            ]}
          />
        </Field>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft size="1.14rem" className="mr-1" /> Back
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Next"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function ProtocolStep({
  goalId, protocolId, form, onChange, onNext, onBack,
}: {
  goalId: string;
  protocolId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (protocolId: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.protocolName.trim()) { toast.error("Protocol name is required."); return; }
    if (protocolId) { onNext(protocolId); return; }
    setLoading(true);
    try {
      const p = await createProtocol({ name: form.protocolName.trim(), goal_id: goalId });
      onNext(p.id);
    } catch (err) {
      toast.error("Failed to create protocol. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Create a protocol</h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          A protocol defines the nutritional rules for your goal — e.g. a specific week or phase.
        </p>
      </div>

      <Field label="Protocol name" hint={'Required — e.g. "Week 1" or "Phase A"'}>
        <Input value={form.protocolName} onChange={(v) => onChange({ protocolName: v })} placeholder="My Protocol" />
      </Field>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft size="1.14rem" className="mr-1" /> Back
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Next"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

const INTENSITY_OPTIONS = [
  { value: "mild",     label: "Mild — small deficit / lowest macros" },
  { value: "moderate", label: "Moderate — balanced approach" },
  { value: "strict",   label: "Strict — aggressive deficit" },
  { value: "extreme",  label: "Extreme — maximum deficit" },
];

function DietPlanStep({
  protocolId, dietPlanId, form, onChange, onNext, onBack,
}: {
  protocolId: string;
  dietPlanId: string;
  form: FormValues;
  onChange: (patch: Partial<FormValues>) => void;
  onNext: (dietPlanId: string) => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.calorieIntensity || !form.proteinIntensity || !form.fatIntensity) {
      toast.error("All intensity fields are required.");
      return;
    }
    if (dietPlanId) { onNext(dietPlanId); return; }
    setLoading(true);
    try {
      const p = await createDietPlan({
        protocol_id: protocolId,
        calorie_intensity: form.calorieIntensity,
        protein_intensity: form.proteinIntensity,
        fat_intensity: form.fatIntensity,
      });
      onNext(p.id);
    } catch (err) {
      toast.error("Failed to create diet plan. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text)]">Configure your diet plan</h2>
        <p className="text-sm text-[var(--text2)] mt-1">
          Set the intensity for each macro. The backend will calculate exact targets from your assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Calorie intensity" hint="Required">
          <Select value={form.calorieIntensity} onChange={(v) => onChange({ calorieIntensity: v })} options={INTENSITY_OPTIONS} />
        </Field>
        <Field label="Protein intensity" hint="Required">
          <Select value={form.proteinIntensity} onChange={(v) => onChange({ proteinIntensity: v })} options={INTENSITY_OPTIONS} />
        </Field>
        <Field label="Fat intensity" hint="Required">
          <Select value={form.fatIntensity} onChange={(v) => onChange({ fatIntensity: v })} options={INTENSITY_OPTIONS} />
        </Field>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft size="1.14rem" className="mr-1" /> Back
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Next"}
          {!loading && <ChevronRight size="1.14rem" className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function ShowFeatsStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-8">
      <div>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--bg3)] border border-[var(--border2)] mb-4">
          <CheckCircle2 size="2rem" className="text-[var(--blue)]" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--text)]">You're all set!</h2>
        <p className="text-sm text-[var(--text2)] mt-2 max-w-sm leading-relaxed">
          Your profile, assessment and first diet plan are ready. Here's what you can do in the
          dashboard:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md text-left">
        {[
          { title: "Drag-and-drop widgets",  desc: "Rearrange your dashboard to focus on what matters to you." },
          { title: "Log meals with AI",       desc: "Describe a meal in plain language and get macro estimations instantly." },
          { title: "Track body metrics",      desc: "Record assessments over time and visualise your progress." },
          { title: "Diet plan adherence",     desc: "See how today's intake compares to your targets at a glance." },
        ].map((f) => (
          <div
            key={f.title}
            className="flex flex-col gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg3)] p-4"
          >
            <div className="text-sm font-medium text-[var(--text)]">{f.title}</div>
            <div className="text-[0.79rem] text-[var(--text3)] leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <Button variant="primary" onClick={onFinish} className="px-10">
        Go to dashboard
        <ChevronRight size="1.14rem" className="ml-1" />
      </Button>
    </div>
  );
}

// ─── Progress indicator ────────────────────────────────────────────────────────

function StepProgress({
  steps,
  currentIndex,
}: {
  steps: StepId[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((s, i) => {
        const done   = i < currentIndex;
        const active = i === currentIndex;
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className={[
                  "flex items-center justify-center rounded-full text-[0.71rem] font-semibold transition-all",
                  active
                    ? "w-6 h-6 bg-[var(--blue)] text-white"
                    : done
                    ? "w-5 h-5 bg-[var(--blue)]/30 text-[var(--blue)]"
                    : "w-5 h-5 bg-[var(--bg4)] text-[var(--text3)]",
                ].join(" ")}
              >
                {done ? <CheckCircle2 size="0.86rem" /> : i + 1}
              </div>
              <span
                className={[
                  "text-[0.71rem] uppercase tracking-[0.1em] transition-colors hidden sm:block",
                  active ? "text-[var(--text)]" : done ? "text-[var(--blue)]" : "text-[var(--text3)]",
                ].join(" ")}
              >
                {STEP_LABELS[s]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "flex-1 min-w-[0.5rem] h-px mx-1.5 transition-colors",
                  i < currentIndex ? "bg-[var(--blue)]/40" : "bg-[var(--border)]",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const mode        = searchParams.get("mode");

  const steps: StepId[] =
    mode === "new-user"
      ? ALL_STEPS.filter((s) => s !== "app-brief" && s !== "user")
      : ALL_STEPS;

  const [hydrated,   setHydrated]  = useState(false);
  const [stepIndex,  setStepIndex] = useState(0);
  const [form,       setForm]      = useState<FormValues>(DEFAULT_FORM);
  const [ids,        setIds]       = useState<SavedIds>(DEFAULT_IDS);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setForm(saved.form);
      setIds(saved.ids);
      // Map the saved ALL_STEPS index back to the active steps array
      const savedStepId = ALL_STEPS[saved.allStepsIndex];
      const idx = steps.indexOf(savedStepId);
      if (idx !== -1) setStepIndex(idx);
    } else if (mode === "new-user") {
      // Pre-populate user info from localStorage (set by Login)
      const userId = localStorage.getItem("projetin:user:id") ?? "";
      const name   = localStorage.getItem("projetin:user:name") ?? "";
      const email  = localStorage.getItem("projetin:user:email") ?? "";
      setIds((prev) => ({ ...prev, userId }));
      setForm((prev) => ({ ...prev, name, email }));
    }
    setHydrated(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist progress on every state change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveProgress({
      allStepsIndex: ALL_STEPS.indexOf(steps[stepIndex]),
      form,
      ids,
    });
  }, [stepIndex, form, ids, hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to login if new-user mode but no userId
  useEffect(() => {
    if (mode === "new-user" && hydrated) {
      const id = localStorage.getItem("projetin:user:id");
      if (!id) router.replace("/");
    }
  }, [mode, router, hydrated]);

  function patchForm(patch: Partial<FormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function patchIds(patch: Partial<SavedIds>) {
    setIds((prev) => ({ ...prev, ...patch }));
  }

  function next() { setStepIndex((i) => Math.min(i + 1, steps.length - 1)); }
  function back() { setStepIndex((i) => Math.max(i - 1, 0)); }

  function finish() {
    clearProgress();
    toast.success(`Welcome, ${form.name || "there"}!`);
    router.push("/dashboard");
  }

  const currentStep = steps[stepIndex];

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)] px-4 py-12">
      <div
        className="w-full max-w-6xl rounded-2xl border border-[var(--border2)] p-8 shadow-xl"
        style={{ background: "var(--bg2)" }}
      >
        <StepProgress steps={steps} currentIndex={stepIndex} />

        {currentStep === "app-brief" && <AppBriefStep onNext={next} />}

        {currentStep === "user" && (
          <UserStep
            userId={ids.userId}
            form={form}
            onChange={patchForm}
            onNext={(userId) => { patchIds({ userId }); next(); }}
          />
        )}

        {currentStep === "assessment" && (
          <AssessmentStep
            userId={ids.userId}
            assessmentId={ids.assessmentId}
            form={form}
            onChange={patchForm}
            onNext={(assessmentId) => { patchIds({ assessmentId }); next(); }}
            onBack={back}
            canGoBack={stepIndex > 0}
          />
        )}

        {currentStep === "project" && (
          <ProjectStep
            userId={ids.userId}
            projectId={ids.projectId}
            form={form}
            onChange={patchForm}
            onNext={(projectId) => { patchIds({ projectId }); next(); }}
            onBack={back}
          />
        )}

        {currentStep === "goal" && (
          <GoalStep
            projectId={ids.projectId}
            goalId={ids.goalId}
            form={form}
            onChange={patchForm}
            onNext={(goalId) => { patchIds({ goalId }); next(); }}
            onBack={back}
          />
        )}

        {currentStep === "protocol" && (
          <ProtocolStep
            goalId={ids.goalId}
            protocolId={ids.protocolId}
            form={form}
            onChange={patchForm}
            onNext={(protocolId) => { patchIds({ protocolId }); next(); }}
            onBack={back}
          />
        )}

        {currentStep === "diet-plan" && (
          <DietPlanStep
            protocolId={ids.protocolId}
            dietPlanId={ids.dietPlanId}
            form={form}
            onChange={patchForm}
            onNext={(dietPlanId) => { patchIds({ dietPlanId }); next(); }}
            onBack={back}
          />
        )}

        {currentStep === "show-feats" && <ShowFeatsStep onFinish={finish} />}
      </div>
    </div>
  );
}
