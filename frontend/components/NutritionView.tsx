"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  estimateMacros,
  listMacroEstimations,
  deleteMacroEstimation,
  type MacroEstimation,
} from "@/lib/api";

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

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function parseMealTitle(description: string): { title: string; body: string } {
  const match = description.match(/^\[([^\]]+)\]\s*([\s\S]*)/);
  if (match) return { title: match[1], body: match[2] };
  return { title: "", body: description };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function EstimationCard({
  estimation,
  onDelete,
}: {
  estimation: MacroEstimation;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { title, body } = parseMealTitle(estimation.mealDescription);

  return (
    <div
      className="rounded-[10px] border border-[var(--border)] p-4"
      style={{ background: "var(--bg2)" }}
    >
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
          <p className="text-[0.86rem] text-[var(--text2)] truncate" title={body}>
            {body}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-[6px] text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg3)] transition-colors"
            title={expanded ? "Collapse" : "Expand items"}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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

      <div
        className="flex gap-4 mt-3 pt-3"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        <MacroChip label="Protein" value={estimation.protein} color="var(--macro-protein, #86efac)" />
        <MacroChip label="Carbs" value={estimation.carbs} color="var(--macro-carbs, #fcd34d)" />
        <MacroChip label="Fat" value={estimation.fat} color="var(--macro-fat, #f9a8d4)" />
        <MacroChip label="Calories" value={estimation.calories} unit="kcal" color="var(--text)" />
      </div>

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
                    {item.quantity}
                    <span className="text-[var(--text3)] ml-0.5">{item.unit}</span>
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

// ── Main component ─────────────────────────────────────────────────────────────

export default function NutritionView() {
  const [mealTitle, setMealTitle] = useState<string>("breakfast");
  const [customTitle, setCustomTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState<MacroEstimation | null>(null);
  const [history, setHistory] = useState<MacroEstimation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("projetin:user:id") ?? ""
      : "";

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      setHistoryLoading(true);
      const data = await listMacroEstimations(userId);
      setHistory(data);
    } catch {
      // silently fail — history is non-critical
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleEstimate() {
    if (!userId) {
      toast.error("No user selected");
      return;
    }
    const title = mealTitle === "custom" ? customTitle.trim() : mealTitle;
    if (!title) {
      toast.error("Enter a custom meal type");
      return;
    }
    if (!description.trim()) {
      toast.error("Describe your meal");
      return;
    }

    try {
      setLoading(true);
      const result = await estimateMacros(userId, title, description.trim());
      setLatestResult(result);
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

  async function handleDelete(id: string) {
    try {
      await deleteMacroEstimation(id);
      if (latestResult?.id === id) setLatestResult(null);
      setHistory((prev) => prev.filter((e) => e.id !== id));
      toast.success("Estimation deleted");
    } catch {
      toast.error("Failed to delete estimation");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[1.29rem] font-semibold tracking-tight">Nutrition</h1>
        <p className="text-[0.86rem] text-[var(--text3)] mt-0.5">
          Describe a meal and get an instant macro breakdown powered by AI.
        </p>
      </div>

      {/* Form */}
      <div
        className="rounded-[12px] border border-[var(--border)] p-5"
        style={{ background: "var(--bg2)" }}
      >
        <h2 className="text-[0.93rem] font-medium mb-4">Estimate macros</h2>

        <div className="flex flex-col gap-3">
          {/* Meal title */}
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[0.79rem] text-[var(--text3)]">Meal type</label>
              <select
                value={mealTitle}
                onChange={(e) => setMealTitle(e.target.value)}
                className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)] capitalize cursor-pointer"
              >
                {MEAL_TITLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="capitalize">
                    {opt}
                  </option>
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

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-[0.79rem] text-[var(--text3)]">Meal description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleEstimate();
              }}
              placeholder="e.g. grilled chicken breast 150g, white rice 200g, broccoli 100g, olive oil 1 tbsp"
              rows={3}
              className="w-full rounded-[8px] border border-[var(--border2)] bg-[var(--bg)] px-3 py-2 text-[0.86rem] text-[var(--text)] resize-none placeholder:text-[var(--text3)]"
            />
            <span className="text-[0.71rem] text-[var(--text3)]">Tip: Ctrl+Enter to estimate</span>
          </div>

          <Button
            variant="primary"
            onClick={handleEstimate}
            disabled={loading || !description.trim()}
            className="self-start flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            {loading ? "Estimating…" : "Estimate macros"}
          </Button>
        </div>
      </div>

      {/* Latest result */}
      {latestResult && (
        <div>
          <h2 className="text-[0.93rem] font-medium mb-3">Latest result</h2>
          <EstimationCard estimation={latestResult} onDelete={handleDelete} />
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-[0.93rem] font-medium mb-3">
          History
          {history.length > 0 && (
            <span className="ml-2 text-[0.79rem] font-normal text-[var(--text3)]">
              {history.length} estimation{history.length !== 1 ? "s" : ""}
            </span>
          )}
        </h2>

        {historyLoading ? (
          <p className="text-[0.86rem] text-[var(--text3)]">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-[0.86rem] text-[var(--text3)]">
            No estimations yet. Try estimating a meal above.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((e) => (
              <EstimationCard key={e.id} estimation={e} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
