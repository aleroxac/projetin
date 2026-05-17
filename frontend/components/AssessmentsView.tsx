"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, TrendingUp, Scale, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  fetchAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  fetchAssessmentHistory,
  type Assessment,
  type AssessmentHistoryEntry,
} from "@/lib/api";

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary (desk job, no exercise)" },
  { value: "lightly_active", label: "Lightly active (1–3 days/week)" },
  { value: "moderately_active", label: "Moderately active (3–5 days/week)" },
  { value: "very_active", label: "Very active (6–7 days/week)" },
  { value: "extremely_active", label: "Extremely active (2× daily)" },
];

const ACTIVITY_LABELS: Record<string, string> = Object.fromEntries(
  ACTIVITY_OPTIONS.map((o) => [o.value, o.label])
);

// ─── Form state ─────────────────────────────────────────────────────────────────

interface FormState {
  weight: string;
  height: string;
  bodyFat: string;
  activityLevel: string;
}

const EMPTY_FORM: FormState = {
  weight: "",
  height: "",
  bodyFat: "",
  activityLevel: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 1) {
  return v > 0 ? v.toFixed(decimals) : "—";
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtDateShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-[var(--border2)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--blue)] transition-colors";
const labelCls = "text-xs uppercase tracking-[0.15em] text-[var(--text3)]";

function AssessmentForm({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (f: FormState) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Weight (kg) *</label>
        <input
          className={inputCls}
          type="number"
          placeholder="75"
          value={form.weight}
          onChange={(e) => onChange({ ...form, weight: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Height (cm) *</label>
        <input
          className={inputCls}
          type="number"
          placeholder="175"
          value={form.height}
          onChange={(e) => onChange({ ...form, height: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Body fat (%)</label>
        <input
          className={inputCls}
          type="number"
          placeholder="18"
          value={form.bodyFat}
          onChange={(e) => onChange({ ...form, bodyFat: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5 col-span-2">
        <label className={labelCls}>Activity level *</label>
        <select
          className={inputCls}
          value={form.activityLevel}
          onChange={(e) => onChange({ ...form, activityLevel: e.target.value })}
        >
          <option value="" disabled>
            Select…
          </option>
          {ACTIVITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div
      className="flex flex-col gap-0.5 px-3 py-2 rounded-lg border border-[var(--border)]"
      style={{ background: "var(--bg3)" }}
    >
      <span className="text-[10px] uppercase tracking-widest text-[var(--text3)]">{label}</span>
      <span className="text-sm font-semibold" style={color ? { color } : undefined}>
        {value}
        {unit && <span className="text-[11px] text-[var(--text3)] ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function AssessmentsView() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [history, setHistory] = useState<AssessmentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Assessment | null>(null); // null = create
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("projetin:user:id") ?? "" : "";

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAssessments(userId);
      setAssessments(data);
    } catch (err) {
      console.error(err);
      setError("Could not load assessments.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const data = await fetchAssessmentHistory(userId);
      setHistory(data);
    } catch {
      // history is best-effort, don't show error
    } finally {
      setHistoryLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
    loadHistory();
  }, [load, loadHistory]);

  function openCreate() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(a: Assessment) {
    setEditTarget(a);
    setForm({
      weight: a.weight > 0 ? String(a.weight) : "",
      height: a.height > 0 ? String(a.height) : "",
      bodyFat: a.bodyFat > 0 ? String(a.bodyFat) : "",
      activityLevel: a.activityLevel,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.weight || !form.height || !form.activityLevel) {
      toast.error("Weight, height and activity level are required.");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await updateAssessment(editTarget.id, {
          weight: parseFloat(form.weight),
          height: parseFloat(form.height),
          body_fat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
          activity_level: form.activityLevel,
        });
        toast.success("Assessment updated");
      } else {
        await createAssessment({
          user_id: userId,
          weight: parseFloat(form.weight),
          height: parseFloat(form.height),
          body_fat: form.bodyFat ? parseFloat(form.bodyFat) : 0,
          activity_level: form.activityLevel,
        });
        toast.success("Assessment created");
      }
      setDialogOpen(false);
      load();
      loadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save assessment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Assessment) {
    const ok = window.confirm("Delete this assessment? This cannot be undone.");
    if (!ok) return;
    try {
      await deleteAssessment(a.id);
      toast.success("Assessment deleted");
      setAssessments((prev) => prev.filter((x) => x.id !== a.id));
      loadHistory();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete assessment.");
    }
  }

  // Chart data
  const chartData = history
    .slice()
    .sort((a, b) => (a.recordedAt > b.recordedAt ? 1 : -1))
    .map((h) => ({
      date: fmtDateShort(h.recordedAt),
      weight: h.weight,
      bodyFat: h.bodyFat,
      bmi: parseFloat(h.bmi.toFixed(1)),
    }));

  const latest = assessments[0] ?? null;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-semibold">Assessments</h1>
          <p className="text-[12px] text-[var(--text3)] mt-0.5">
            Track your body metrics over time
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="gap-1.5 text-[12px]">
          <Plus size="1rem" />
          New assessment
        </Button>
      </div>

      {/* Latest summary */}
      {latest && (
        <div
          className="rounded-xl border border-[var(--border)] p-4"
          style={{ background: "var(--bg2)" }}
        >
          <div className="text-[11px] text-[var(--text3)] uppercase tracking-widest mb-3">
            Latest — {fmtDate(latest.recordedAt)}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <StatBadge label="Weight" value={fmt(latest.weight)} unit="kg" color="var(--blue)" />
            <StatBadge label="Height" value={fmt(latest.height, 0)} unit="cm" />
            <StatBadge
              label="Body fat"
              value={latest.bodyFat > 0 ? fmt(latest.bodyFat) : "—"}
              unit={latest.bodyFat > 0 ? "%" : undefined}
              color="var(--amber)"
            />
            <StatBadge label="BMI" value={fmt(latest.bmi)} color="var(--green)" />
            <StatBadge label="BMR" value={fmt(latest.bmr, 0)} unit="kcal" />
            <StatBadge label="TDEE" value={fmt(latest.tdee, 0)} unit="kcal" color="var(--purple)" />
          </div>
        </div>
      )}

      {/* History chart */}
      {chartData.length >= 2 && (
        <div
          className="rounded-xl border border-[var(--border)] p-4"
          style={{ background: "var(--bg2)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size="1rem" className="text-[var(--blue)]" />
            <span className="text-[12px] font-medium">Progress over time</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--text3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "var(--text3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "var(--text3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border2)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                name="Weight (kg)"
                stroke="var(--blue)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFat"
                name="Body fat (%)"
                stroke="var(--amber)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bmi"
                name="BMI"
                stroke="var(--green)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assessments list */}
      <div
        className="rounded-xl border border-[var(--border)] overflow-hidden"
        style={{ background: "var(--bg2)" }}
      >
        <div
          className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between"
        >
          <span className="text-[12px] font-medium">All assessments</span>
          <span className="text-[11px] text-[var(--text3)]">{assessments.length} record{assessments.length !== 1 ? "s" : ""}</span>
        </div>

        {loading && (
          <div className="px-4 py-8 text-center text-[12px] text-[var(--text3)]">
            Loading…
          </div>
        )}

        {error && (
          <div className="px-4 py-8 text-center text-[12px] text-[var(--red)]">{error}</div>
        )}

        {!loading && !error && assessments.length === 0 && (
          <div className="px-4 py-12 flex flex-col items-center gap-3 text-[var(--text3)]">
            <Scale size="2rem" className="opacity-40" />
            <p className="text-[12px]">No assessments yet.</p>
            <Button variant="ghost" onClick={openCreate} className="text-[12px] gap-1.5">
              <Plus size="0.93rem" />
              Add your first assessment
            </Button>
          </div>
        )}

        {!loading && !error && assessments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[var(--text3)] border-b border-[var(--border)]">
                  {["Date", "Weight", "Height", "Body fat", "Activity level", "BMI", "BMR", "TDEE", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-left font-normal text-[10px] uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {assessments.map((a, i) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] transition-colors"
                    style={i === 0 ? { background: "var(--bg3)" } : undefined}
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-[var(--text2)]">
                      {fmtDate(a.recordedAt)}
                      {i === 0 && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--blue)]/20 text-[var(--blue)]">
                          latest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-medium">
                      {fmt(a.weight)} <span className="text-[var(--text3)]">kg</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {fmt(a.height, 0)} <span className="text-[var(--text3)]">cm</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {a.bodyFat > 0 ? (
                        <>
                          {fmt(a.bodyFat)} <span className="text-[var(--text3)]">%</span>
                        </>
                      ) : (
                        <span className="text-[var(--text3)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--text2)] max-w-[160px] truncate">
                      {ACTIVITY_LABELS[a.activityLevel] ?? a.activityLevel}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--green)]">
                      {fmt(a.bmi)}
                    </td>
                    <td className="px-4 py-2.5">
                      {fmt(a.bmr, 0)} <span className="text-[var(--text3)]">kcal</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-[var(--purple)]">
                      {fmt(a.tdee, 0)} <span className="text-[11px] text-[var(--text3)]">kcal</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-md text-[var(--text3)] hover:text-[var(--text)] hover:bg-[var(--bg4)] transition-colors"
                          title="Edit"
                        >
                          <Pencil size="0.93rem" />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit assessment" : "New assessment"}
            </DialogTitle>
          </DialogHeader>

          {editTarget && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatBadge label="BMI" value={fmt(editTarget.bmi)} color="var(--green)" />
              <StatBadge label="BMR" value={fmt(editTarget.bmr, 0)} unit="kcal" />
              <StatBadge
                label="TDEE"
                value={fmt(editTarget.tdee, 0)}
                unit="kcal"
                color="var(--purple)"
              />
            </div>
          )}

          <AssessmentForm form={form} onChange={setForm} />

          {!editTarget && (
            <p className="text-[11px] text-[var(--text3)] mt-2 flex items-center gap-1">
              <Percent size="0.79rem" />
              BMI, BMR and TDEE will be calculated automatically by the backend.
            </p>
          )}

          <DialogFooter className="mt-5">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editTarget ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
