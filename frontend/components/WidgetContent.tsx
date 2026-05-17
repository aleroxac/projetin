"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import MetricWidget from "@/components/widgets/MetricWidget";
import MacrosWidget from "@/components/widgets/MacrosWidget";
import ShapeProgressWidget from "@/components/widgets/ShapeProgressWidget";
import InsightsWidget from "@/components/widgets/InsightsWidget";
import MeasurementsWidget from "@/components/widgets/MeasurementsWidget";
import SessionsListWidget from "@/components/widgets/SessionsListWidget";
import MealsListWidget from "@/components/widgets/MealsListWidget";
import VolumeChartWidget from "@/components/widgets/VolumeChartWidget";
import SessionsChartWidget from "@/components/widgets/SessionsChartWidget";
import CaloriesChartWidget from "@/components/widgets/CaloriesChartWidget";
import MacroRingsWidget from "@/components/widgets/MacroRingsWidget";
import WeightChartWidget from "@/components/widgets/WeightChartWidget";
import CompositionWidget from "@/components/widgets/CompositionWidget";
import {
  fetchMealLogHistory,
  fetchDietPlanAdherence,
  type MealLogDay,
  type DietPlanAdherence,
} from "@/lib/api";

// ── Diet data hook ────────────────────────────────────────────────────────────

export function useDietData() {
  const [history, setHistory] = useState<MealLogDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [adherence, setAdherence] = useState<DietPlanAdherence | null>(null);

  function loadAdherence(dietPlanId: string) {
    const userId = localStorage.getItem("projetin:user:id");
    if (!dietPlanId || !userId) { setAdherence(null); return; }
    fetchDietPlanAdherence(dietPlanId, userId)
      .then(setAdherence)
      .catch(() => setAdherence(null));
  }

  useEffect(() => {
    const userId = localStorage.getItem("projetin:user:id");
    if (!userId) { setLoading(false); return; }
    fetchMealLogHistory(userId)
      .then(setHistory)
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load diet data");
      })
      .finally(() => setLoading(false));

    const savedPlanId = localStorage.getItem("projetin:diet:dietPlanId") ?? "";
    loadAdherence(savedPlanId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onPlanChanged(e: CustomEvent<string>) {
      loadAdherence(e.detail);
    }
    window.addEventListener("projetin:diet-plan-changed", onPlanChanged as EventListener);
    return () => window.removeEventListener("projetin:diet-plan-changed", onPlanChanged as EventListener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return history.find((d) => d.date.startsWith(todayStr));
  }, [history]);

  const last7 = useMemo(() => {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-7);
  }, [history]);

  const weeklyAvg =
    last7.length > 0
      ? last7.reduce((sum, d) => sum + d.totalCalories, 0) / last7.length
      : 0;

  return { loading, today, last7, weeklyAvg, adherence };
}

// ── Widget content switch ─────────────────────────────────────────────────────

export function WidgetContent({
  id,
  diet,
}: {
  id: string;
  diet: ReturnType<typeof useDietData>;
}) {
  if (diet.loading) {
    return <div className="text-[var(--text3)] text-[12px]">Loading…</div>;
  }
  switch (id) {
    case "w-vol":
      return <MetricWidget value="18.4" unit="t" sub="↑ 12% vs last week" trend="up" />;
    case "w-sess":
      return (
        <MetricWidget
          value="5"
          unit="/6"
          badge={{ label: "1 remaining today", variant: "amber" }}
        />
      );
    case "w-pr":
      return <MetricWidget value="3" sub="Bench Press · Squat · Row" />;
    case "w-dur":
      return <MetricWidget value="67" unit="min" sub="↑ Goal: 60 min" trend="up" />;
    case "w-vol-chart":
      return <VolumeChartWidget />;
    case "w-sessoes":
      return <SessionsListWidget />;
    case "w-treino-chart":
      return <SessionsChartWidget />;

    case "d-kcal": {
      const consumed = Math.round(diet.adherence?.calories.consumed ?? diet.today?.totalCalories ?? 0);
      const target   = Math.round(diet.adherence?.calories.target ?? 0);
      const over     = target > 0 && consumed > target;
      return (
        <MetricWidget
          value={consumed} unit="kcal"
          sub={target ? `/ ${target} meta` : `${diet.last7.length} days tracked`}
          trend={over ? "down" : "neutral"}
          color={over ? "#ef4444" : "#8b5cf6"}
        />
      );
    }
    case "d-prot": {
      const consumed = Math.round(diet.adherence?.protein.consumed ?? diet.today?.totalProtein ?? 0);
      const target   = Math.round(diet.adherence?.protein.target ?? 0);
      const met      = target > 0 && consumed >= target;
      return (
        <MetricWidget
          value={consumed} unit="g"
          sub={target ? `/ ${target}g meta` : "Protein today"}
          trend={met ? "up" : "neutral"}
          color={met ? "#4ade80" : "#22c55e"}
        />
      );
    }
    case "d-carb": {
      const consumed = Math.round(diet.adherence?.carbs.consumed ?? diet.today?.totalCarbs ?? 0);
      const target   = Math.round(diet.adherence?.carbs.target ?? 0);
      const over     = target > 0 && consumed > target;
      return (
        <MetricWidget
          value={consumed} unit="g"
          sub={target ? `/ ${target}g meta` : "Carbs today"}
          trend={over ? "down" : "neutral"}
          color={over ? "#ef4444" : "#f59e0b"}
        />
      );
    }
    case "d-fat": {
      const consumed = Math.round(diet.adherence?.fat.consumed ?? diet.today?.totalFat ?? 0);
      const target   = Math.round(diet.adherence?.fat.target ?? 0);
      const over     = target > 0 && consumed > target;
      return (
        <MetricWidget
          value={consumed} unit="g"
          sub={target ? `/ ${target}g meta` : "Fat today"}
          trend={over ? "down" : "neutral"}
          color={over ? "#ef4444" : "#3b82f6"}
        />
      );
    }
    case "d-deficit": {
      const target    = diet.adherence?.calories.target ?? 0;
      const consumed  = diet.adherence?.calories.consumed ?? diet.weeklyAvg;
      const deficit   = Math.round(target - consumed);
      const hasTarget = !!diet.adherence;
      const inDeficit = deficit >= 0;
      return (
        <MetricWidget
          value={hasTarget ? Math.abs(deficit) : Math.round(diet.weeklyAvg)}
          unit="kcal"
          sub={hasTarget ? (inDeficit ? "deficit hoje" : "surplus hoje") : "7-day average intake"}
          trend={hasTarget ? (inDeficit ? "up" : "down") : "neutral"}
          color={hasTarget ? (inDeficit ? "#4ade80" : "#ef4444") : "#a1a1aa"}
        />
      );
    }
    case "d-adherence": {
      const pct     = diet.adherence ? Math.round(diet.adherence.globalAdherence * 100) : null;
      const over    = pct !== null && pct > 110;
      const onTrack = pct !== null && pct > 85;
      return (
        <MetricWidget
          value={pct ?? "—"}
          unit={pct !== null ? "%" : undefined}
          sub={pct === null ? "no plan selected" : over ? "above target" : onTrack ? "on track" : "below target"}
          trend={pct === null ? "neutral" : over ? "down" : onTrack ? "up" : "neutral"}
          color={pct === null ? "var(--text3)" : over ? "#ef4444" : onTrack ? "#22c55e" : "#f59e0b"}
        />
      );
    }
    case "d-macros":
      return (
        <MacrosWidget
          protein={diet.today?.totalProtein ?? 0}
          carbs={diet.today?.totalCarbs ?? 0}
          fat={diet.today?.totalFat ?? 0}
          calories={diet.today?.totalCalories ?? 0}
        />
      );
    case "d-cal-chart":
      return (
        <CaloriesChartWidget
          data={diet.last7.map((d) => ({
            day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
            calories: d.totalCalories,
          }))}
        />
      );
    case "d-macro-rings":
      return <MacroRingsWidget />;
    case "d-refeicoes":
      return <MealsListWidget />;

    case "s-peso":
      return <MetricWidget value="84.2" unit="kg" sub="↓ 0.6kg this week" trend="up" />;
    case "s-bf":
      return <MetricWidget value="16.4" unit="%" sub="Goal: 12%" />;
    case "s-magra":
      return <MetricWidget value="70.4" unit="kg" sub="↑ +0.3kg during cut" trend="up" />;
    case "s-semanas":
      return <MetricWidget value="~11" unit=" wk" sub="At 0.5kg/wk · Goal: 78kg 12%BF" />;
    case "s-peso-chart":
      return <WeightChartWidget />;
    case "s-comp":
      return <CompositionWidget />;
    case "s-medidas":
      return <MeasurementsWidget />;
    case "s-prog":
      return <ShapeProgressWidget />;
    case "s-insights":
      return <InsightsWidget />;

    default:
      return <div className="text-[var(--text3)] text-[12px]">Widget not found</div>;
  }
}
