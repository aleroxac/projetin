"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  RefreshCw,
  BookmarkPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  estimateMacros,
  listMacroEstimations,
  deleteMacroEstimation,
  createMealLog,
  fetchMealLogHistory,
  updateMealLog,
  deleteMealLog,
  type MacroEstimation,
  type MealLogDay,
  type MealLogHistoryEntry,
} from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type FormMode = "estimate" | "log";
type HistoryTab = "meals" | "estimations";

// ── Constants ──────────────────────────────────────────────────────────────────

const MEAL_TITLE_OPTIONS = [
  "breakfast",
  "lunch",
  "snack",
  "dessert",
  "dinner",
  "supper",
  "pre-workout",
  "intra-workout",
  "post-workout",
  "custom",
] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(v: number) {
  return v > 0 ? v.toFixed(1) : "0";
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function parseMealTitle(description: string): { title: string; body: string } {
  const match = description.match(/^\[([^\]]+)\]\s*([\s\S]*)/);
  if (match) return { title: match[1], body: match[2] };
  return { title: "", body: description };
}

// ── Shared sub-component ───────────────────────────────────────────────────────

function MacroChip({
  label,
  value,
  unit = "g",
  color,
}: {
  label: string;
  value: number;
  unit?: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[0.71rem] text-[var(--text3)] uppercase tracking-wider">{label}</span>
      <span className="text-[1.07rem] font-semibold" style={{ color }}>
        {fmt(value)}
        <span className="text-[0.79rem] font-normal text-[var(--text3)] ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function MacroRow({
  protein,
  carbs,
  fat,
  calories,
}: {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}) {
  return (
    <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: "0.5px solid var(--border)" }}>
      <MacroChip label="Protein" value={protein} color="var(--macro-protein, #86efac)" />
      <MacroChip label="Carbs" value={carbs} color="var(--macro-carbs, #fcd34d)" />
      <MacroChip label="Fat" value={fat} color="var(--macro-fat, #f9a8d4)" />
      <MacroChip label="Calories" value={calories} unit="kcal" color="var(--text)" />
    </div>
  );
}

// ── Estimation card (in history) ───────────────────────────────────────────────

function EstimationCard({
  estimation,
  onDelete,
  onLogAsMeal,
}: {
  estimation: MacroEstimation;
  onDelete: (id: string) => void;
  onLogAsMeal: (estimation: MacroEstimation, title: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [logging, setLogging] = useState(false);
  const [logTitle, setLogTitle] = useState<string>("breakfast");
  const [logCustom, setLogCustom] = useState("");
  const [logPending, setLogPending] = useState(false);
  const { title, body } = parseMealTitle(estimation.mealDescription);

  async function handleLog() {
    const t = logTitle === "custom" ? logCustom.trim() : logTitle;
    if (!t) { toast.error("Enter a custom meal type"); return; }
    try {
      setLogPending(true);
      await onLogAsMeal(estimation, t);
      setLogging(false);
    } finally {
      setLogPending(false);
    }
  }

  return (
    <div className="rounded-[10px] border border-[var(--border)] p-4" style={{ background: "var(--bg2)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {title && (
            <span
              className="inline-block text-[0.71rem] font-medium px-2 py-0.5 rounded-full mb-1.5 capitalize"
              style={{ background: "var(--bg3)", color: "var(--text2)" }}
            >
              {title}
            </span>
          )}
          <p className="text-[0.86rem] text-[var(--text2)] truncate" title={body}>{body}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-colors"
            title={expanded ? "Collapse" : "Expand items"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setLogging((v) => !v)}
            className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--blue)] hover:bg-[var(--bg3)] transition-colors"
            title="Log as meal"
          >
            <BookmarkPlus size={14} />
          </button>
          <button
            onClick={() => onDelete(estimation.id)}
            className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-red-400 hover:bg-[var(--bg3)] transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <MacroRow
        protein={estimation.protein}
        carbs={estimation.carbs}
        fat={estimation.fat}
        calories={estimation.calories}
      />

      {/* Log as meal inline form */}
      {logging && (
        <div
          className="mt-3 pt-3 flex flex-col gap-2"
          style={{ borderTop: "0.5px solid var(--border)" }}
        >
          <span className="text-[0.79rem] text-[var(--text3)]">Log as meal — pick a type:</span>
          <div className="flex gap-2">
            <select
              value={logTitle}
              onChange={(e) => setLogTitle(e.target.value)}
              className="flex-1 rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-1.5 text-[0.86rem] text-[var(--text)] capitalize cursor-pointer"
            >
              {MEAL_TITLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="capitalize">{opt}</option>
              ))}
            </select>
            {logTitle === "custom" && (
              <input
                value={logCustom}
                onChange={(e) => setLogCustom(e.target.value)}
                placeholder="Label…"
                className="flex-1 rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-1.5 text-[0.86rem] text-[var(--text)]"
              />
            )}
            <button
              onClick={handleLog}
              disabled={logPending}
              className="px-3 py-1.5 rounded-[8px] bg-[var(--blue)] text-white text-[0.79rem] font-medium disabled:opacity-50 flex items-center gap-1"
            >
              <Check size={12} /> {logPending ? "Saving…" : "Log"}
            </button>
            <button
              onClick={() => setLogging(false)}
              className="p-1.5 rounded-[8px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Meal items breakdown */}
      {expanded && estimation.mealItems.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: "0.5px solid var(--border)" }}>
          <table className="w-full text-[0.79rem]">
            <thead>
              <tr className="text-[var(--text3)] text-left">
                <th className="pb-1.5 font-medium">Item</th>
                <th className="pb-1.5 font-medium text-right">Qty</th>
                <th className="pb-1.5 font-medium text-right">P</th>
                <th className="pb-1.5 font-medium text-right">C</th>
                <th className="pb-1.5 font-medium text-right">F</th>
                <th className="pb-1.5 font-medium text-right">kcal</th>
              </tr>
            </thead>
            <tbody>
              {estimation.mealItems.map((item, i) => (
                <tr key={i} style={{ borderTop: "0.5px solid var(--border)" }}>
                  <td className="py-1 pr-2 text-[var(--text)]">{item.item}</td>
                  <td className="py-1 text-right text-[var(--text2)]">
                    {item.quantity}<span className="text-[var(--text3)] ml-0.5">{item.unit}</span>
                  </td>
                  <td className="py-1 text-right text-[var(--text2)]">{fmt(item.protein)}g</td>
                  <td className="py-1 text-right text-[var(--text2)]">{fmt(item.carbs)}g</td>
                  <td className="py-1 text-right text-[var(--text2)]">{fmt(item.fat)}g</td>
                  <td className="py-1 text-right text-[var(--text2)]">{fmt(item.calories)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Meal log entry card (in history) ──────────────────────────────────────────

function MealEntryCard({
  entry,
  onDelete,
  onUpdate,
}: {
  entry: MealLogHistoryEntry;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(entry.mealTitle);
  const [editDesc, setEditDesc] = useState(entry.mealDescription);
  const [saving, setSaving] = useState(false);
  const [reEstimating, setReEstimating] = useState(false);

  async function handleSave() {
    if (!editTitle.trim() || !editDesc.trim()) return;
    try {
      setSaving(true);
      await onUpdate(entry.id, editTitle.trim(), editDesc.trim());
      setEditing(false);
      setExpanded(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleReEstimate() {
    try {
      setReEstimating(true);
      await onUpdate(entry.id, entry.mealTitle, entry.mealDescription);
      setExpanded(true);
    } finally {
      setReEstimating(false);
    }
  }

  function handleCancel() {
    setEditTitle(entry.mealTitle);
    setEditDesc(entry.mealDescription);
    setEditing(false);
  }

  return (
    <div className="rounded-[10px] border border-[var(--border)] p-4" style={{ background: "var(--bg2)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-1.5 text-[0.86rem] text-[var(--text)] capitalize cursor-pointer"
                >
                  {MEAL_TITLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">{opt}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)] resize-none"
              />
              <p className="text-[0.71rem] text-[var(--text3)]">
                Saving will re-run the AI estimation with the new description.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="inline-block text-[0.71rem] font-medium px-2 py-0.5 rounded-full capitalize"
                  style={{ background: "var(--bg3)", color: "var(--text2)" }}
                >
                  {entry.mealTitle}
                </span>
                <span className="text-[0.71rem] text-[var(--text3)]">{fmtTime(entry.loggedAt)}</span>
              </div>
              <p className="text-[0.86rem] text-[var(--text2)] truncate" title={entry.mealDescription}>
                {entry.mealDescription}
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-green-400 hover:bg-[var(--bg3)] transition-colors"
                title={saving ? "Saving & re-estimating…" : "Save & re-estimate"}
              >
                <Check size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-colors"
                title={expanded ? "Hide macros" : "Show macros"}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                onClick={handleReEstimate}
                disabled={reEstimating}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--blue)] hover:bg-[var(--bg3)] transition-colors disabled:opacity-40"
                title={reEstimating ? "Re-estimating…" : "Re-estimate macros"}
              >
                <RefreshCw size={14} className={reEstimating ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-colors"
                title="Edit description & re-estimate"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-red-400 hover:bg-[var(--bg3)] transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {expanded && (
        <MacroRow
          protein={entry.protein}
          carbs={entry.carbs}
          fat={entry.fat}
          calories={entry.calories}
        />
      )}
    </div>
  );
}

// ── Day section (meals history) ───────────────────────────────────────────────

function DaySection({
  day,
  onDelete,
  onUpdate,
}: {
  day: MealLogDay;
  onDelete: (id: string) => void;
  onUpdate: (id: string, title: string, description: string) => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[0.86rem] font-medium text-[var(--text2)]">{fmtDate(day.date)}</span>
        <div className="flex gap-3 text-[0.79rem] text-[var(--text3)]">
          <span>
            <span style={{ color: "var(--macro-protein, #86efac)" }}>{fmt(day.totalProtein)}g</span> P
          </span>
          <span>
            <span style={{ color: "var(--macro-carbs, #fcd34d)" }}>{fmt(day.totalCarbs)}g</span> C
          </span>
          <span>
            <span style={{ color: "var(--macro-fat, #f9a8d4)" }}>{fmt(day.totalFat)}g</span> F
          </span>
          <span className="text-[var(--text2)] font-medium">{fmt(day.totalCalories)} kcal</span>
        </div>
      </div>
      {day.meals.map((entry) => (
        <MealEntryCard key={entry.id} entry={entry} onDelete={onDelete} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

// ── Result card (shown after an action) ───────────────────────────────────────

function ResultCard({
  result,
  kind,
}: {
  result: MacroEstimation | { mealTitle: string; protein: number; carbs: number; fat: number; calories: number };
  kind: "estimation" | "meal-log";
}) {
  const label = "mealTitle" in result ? result.mealTitle : parseMealTitle((result as MacroEstimation).mealDescription).title;
  const tag = kind === "estimation" ? "Estimated" : "Logged";
  const tagColor = kind === "estimation" ? "var(--blue)" : "var(--macro-protein, #86efac)";

  return (
    <div
      className="rounded-[12px] border border-[var(--border)] p-4"
      style={{ background: "var(--bg2)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[0.71rem] font-medium px-2 py-0.5 rounded-full"
          style={{ background: "var(--bg3)", color: tagColor }}
        >
          {tag}
        </span>
        {label && (
          <span
            className="text-[0.71rem] font-medium px-2 py-0.5 rounded-full capitalize"
            style={{ background: "var(--bg3)", color: "var(--text2)" }}
          >
            {label}
          </span>
        )}
      </div>
      <MacroRow
        protein={result.protein}
        carbs={result.carbs}
        fat={result.fat}
        calories={result.calories}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NutritionView() {
  // Form state
  const [formMode, setFormMode] = useState<FormMode>("estimate");
  const [mealTitle, setMealTitle] = useState<string>("breakfast");
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [alsoLog, setAlsoLog] = useState(false);
  const [estimateOnLog, setEstimateOnLog] = useState(true);
  const [loading, setLoading] = useState(false);

  // Result of the latest action
  const [lastResult, setLastResult] = useState<{
    data: MacroEstimation | { mealTitle: string; protein: number; carbs: number; fat: number; calories: number };
    kind: "estimation" | "meal-log";
  } | null>(null);

  // History
  const [historyTab, setHistoryTab] = useState<HistoryTab>("meals");
  const [mealHistory, setMealHistory] = useState<MealLogDay[]>([]);
  const [estimations, setEstimations] = useState<MacroEstimation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("projetin:user:id") ?? ""
      : "";

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setHistoryLoading(true);
      const [meals, ests] = await Promise.all([
        fetchMealLogHistory(userId),
        listMacroEstimations(userId),
      ]);
      setMealHistory(meals);
      setEstimations(ests);
    } catch {
      // non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleEstimate() {
    if (!userId) { toast.error("No user selected"); return; }
    if (!description.trim()) { toast.error("Describe your meal"); return; }

    const title = mealTitle === "custom" ? customTitle.trim() : mealTitle;

    if (alsoLog) {
      // Estimate via meal-log (avoids double AI call)
      if (!title) { toast.error("Enter a custom meal type"); return; }
      try {
        setLoading(true);
        const logged = await createMealLog({
          user_id: userId,
          meal_title: title,
          meal_description: description.trim(),
        });
        setLastResult({ data: { mealTitle: logged.mealTitle, protein: logged.protein, carbs: logged.carbs, fat: logged.fat, calories: logged.calories }, kind: "meal-log" });
        setDescription("");
        setAlsoLog(false);
        toast.success("Macros estimated and meal logged!");
        await loadHistory();
      } catch (err) {
        toast.error("Failed to estimate and log");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // Estimate only
      try {
        setLoading(true);
        const result = await estimateMacros(userId, title, description.trim());
        setLastResult({ data: result, kind: "estimation" });
        setDescription("");
        toast.success("Macros estimated!");
        await loadHistory();
      } catch (err) {
        toast.error("Failed to estimate macros");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleLog() {
    if (!userId) { toast.error("No user selected"); return; }
    const title = mealTitle === "custom" ? customTitle.trim() : mealTitle;
    if (!title) { toast.error("Enter a custom meal type"); return; }
    if (!description.trim()) { toast.error("Describe your meal"); return; }

    try {
      setLoading(true);
      const logged = await createMealLog({
        user_id: userId,
        meal_title: title,
        meal_description: description.trim(),
      });
      if (estimateOnLog) {
        setLastResult({ data: { mealTitle: logged.mealTitle, protein: logged.protein, carbs: logged.carbs, fat: logged.fat, calories: logged.calories }, kind: "meal-log" });
      } else {
        setLastResult(null);
      }
      setDescription("");
      toast.success(estimateOnLog ? "Meal logged with macros!" : "Meal logged!");
      await loadHistory();
    } catch (err) {
      toast.error("Failed to log meal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteEstimation(id: string) {
    try {
      await deleteMacroEstimation(id);
      setEstimations((prev) => prev.filter((e) => e.id !== id));
      toast.success("Estimation deleted");
    } catch {
      toast.error("Failed to delete estimation");
    }
  }

  async function handleLogEstimation(estimation: MacroEstimation, title: string) {
    try {
      const { body } = parseMealTitle(estimation.mealDescription);
      await createMealLog({
        user_id: userId,
        meal_title: title,
        meal_description: body || estimation.mealDescription,
      });
      toast.success("Meal logged!");
      await loadHistory();
      setHistoryTab("meals");
    } catch {
      toast.error("Failed to log meal");
      throw new Error("log failed");
    }
  }

  async function handleDeleteMealLog(id: string) {
    try {
      await deleteMealLog(id);
      setMealHistory((prev) =>
        prev
          .map((day) => ({ ...day, meals: day.meals.filter((m) => m.id !== id) }))
          .filter((day) => day.meals.length > 0)
      );
      toast.success("Meal deleted");
    } catch {
      toast.error("Failed to delete meal");
    }
  }

  async function handleUpdateMealLog(id: string, title: string, desc: string) {
    try {
      const updated = await updateMealLog(id, {
        meal_title: title,
        meal_description: desc,
      });
      setMealHistory((prev) =>
        prev.map((day) => ({
          ...day,
          meals: day.meals.map((m) =>
            m.id === id
              ? {
                  ...m,
                  mealTitle: updated.mealTitle,
                  mealDescription: updated.mealDescription,
                  protein: updated.protein,
                  carbs: updated.carbs,
                  fat: updated.fat,
                  calories: updated.calories,
                }
              : m
          ),
        }))
      );
      toast.success("Meal updated & re-estimated!");
    } catch {
      toast.error("Failed to update meal");
      throw new Error("update failed");
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const effectiveTitle = mealTitle === "custom" ? customTitle.trim() : mealTitle;
  const canSubmit = !loading && !!description.trim() && (formMode === "estimate" ? (!alsoLog || !!effectiveTitle) : !!effectiveTitle);
  const totalMeals = mealHistory.reduce((acc, d) => acc + d.meals.length, 0);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[1.29rem] font-semibold tracking-tight">Nutrition</h1>
        <p className="text-[0.86rem] text-[var(--text3)] mt-0.5">
          Estimate macros with AI, log your meals, and track daily intake.
        </p>
      </div>

      {/* Form */}
      <div
        className="rounded-[12px] border border-[var(--border)] p-5"
        style={{ background: "var(--bg2)" }}
      >
        {/* Mode toggle */}
        <div
          className="flex gap-0.5 p-0.5 rounded-[8px] mb-4 w-fit"
          style={{ background: "var(--bg3)" }}
        >
          {(["estimate", "log"] as FormMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setFormMode(mode); setLastResult(null); }}
              className="px-3 py-1 rounded-[6px] text-[0.86rem] font-medium transition-colors capitalize"
              style={
                formMode === mode
                  ? { background: "var(--bg)", color: "var(--text)" }
                  : { color: "var(--text3)" }
              }
            >
              {mode === "estimate" ? "Estimate" : "Log Meal"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {/* Meal type — always shown in Log mode; shown in Estimate only when alsoLog is checked */}
          {(formMode === "log" || alsoLog) && (
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[0.79rem] text-[var(--text3)]">Meal type</label>
                <select
                  value={mealTitle}
                  onChange={(e) => setMealTitle(e.target.value)}
                  className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)] capitalize cursor-pointer"
                >
                  {MEAL_TITLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">{opt}</option>
                  ))}
                </select>
              </div>
              {mealTitle === "custom" && (
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-[0.79rem] text-[var(--text3)]">Custom label</label>
                  <input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. midnight snack"
                    className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)]"
                  />
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[0.79rem] text-[var(--text3)]">Meal description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  formMode === "estimate" ? handleEstimate() : handleLog();
                }
              }}
              placeholder={
                formMode === "estimate"
                  ? "e.g. grilled chicken breast 150g, white rice 200g, broccoli 100g, olive oil 1 tbsp"
                  : "e.g. grilled chicken 150g, rice 200g, salad"
              }
              rows={3}
              className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)] resize-none placeholder:text-[var(--text3)]"
            />
            <span className="text-[0.71rem] text-[var(--text3)]">Tip: Ctrl+Enter to submit</span>
          </div>

          {/* Estimate mode: "Also log" checkbox */}
          {formMode === "estimate" && (
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={alsoLog}
                onChange={(e) => setAlsoLog(e.target.checked)}
                className="accent-[var(--blue)] w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[0.86rem] text-[var(--text2)]">Also log this meal</span>
            </label>
          )}

          {/* Log mode: "Estimate macros" checkbox */}
          {formMode === "log" && (
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={estimateOnLog}
                onChange={(e) => setEstimateOnLog(e.target.checked)}
                className="accent-[var(--blue)] w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[0.86rem] text-[var(--text2)]">Estimate macros (AI)</span>
            </label>
          )}

          {/* Submit button */}
          <Button
            variant="primary"
            onClick={formMode === "estimate" ? handleEstimate : handleLog}
            disabled={!canSubmit}
            className="self-start flex items-center gap-1.5"
          >
            {formMode === "estimate" ? (
              <>
                <Sparkles size={14} />
                {loading ? "Estimating…" : alsoLog ? "Estimate & Log" : "Estimate macros"}
              </>
            ) : (
              <>
                <Plus size={14} />
                {loading ? "Logging…" : "Log meal"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Latest result */}
      {lastResult && (
        <div>
          <h2 className="text-[0.93rem] font-medium mb-3">Latest result</h2>
          <ResultCard result={lastResult.data} kind={lastResult.kind} />
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[0.93rem] font-medium">History</h2>
          {/* Tab switcher */}
          <div className="flex gap-0.5 p-0.5 rounded-[8px]" style={{ background: "var(--bg3)" }}>
            <button
              onClick={() => setHistoryTab("meals")}
              className="px-3 py-1 rounded-[6px] text-[0.79rem] font-medium transition-colors"
              style={
                historyTab === "meals"
                  ? { background: "var(--bg)", color: "var(--text)" }
                  : { color: "var(--text3)" }
              }
            >
              Meals
              {totalMeals > 0 && (
                <span className="ml-1.5 text-[0.71rem] text-[var(--text3)]">{totalMeals}</span>
              )}
            </button>
            <button
              onClick={() => setHistoryTab("estimations")}
              className="px-3 py-1 rounded-[6px] text-[0.79rem] font-medium transition-colors"
              style={
                historyTab === "estimations"
                  ? { background: "var(--bg)", color: "var(--text)" }
                  : { color: "var(--text3)" }
              }
            >
              Estimations
              {estimations.length > 0 && (
                <span className="ml-1.5 text-[0.71rem] text-[var(--text3)]">{estimations.length}</span>
              )}
            </button>
          </div>
        </div>

        {historyLoading ? (
          <p className="text-[0.86rem] text-[var(--text3)]">Loading…</p>
        ) : historyTab === "meals" ? (
          mealHistory.length === 0 ? (
            <p className="text-[0.86rem] text-[var(--text3)]">
              No meals logged yet. Use the form above to start tracking.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {mealHistory.map((day) => (
                <DaySection
                  key={day.date}
                  day={day}
                  onDelete={handleDeleteMealLog}
                  onUpdate={handleUpdateMealLog}
                />
              ))}
            </div>
          )
        ) : estimations.length === 0 ? (
          <p className="text-[0.86rem] text-[var(--text3)]">
            No estimations yet. Switch to Estimate mode and describe a meal.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {estimations.map((e) => (
              <EstimationCard
                key={e.id}
                estimation={e}
                onDelete={handleDeleteEstimation}
                onLogAsMeal={handleLogEstimation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
