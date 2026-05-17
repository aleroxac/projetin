import type { WidgetMeta, WidgetLayout, TabId } from "./types";

export const WIDGET_REGISTRY: Record<string, WidgetMeta> = {
  // ── Workout ────────────────────────────────────────────────────────────────
  "w-vol": {
    id: "w-vol", title: "Weekly Volume", tab: "workout", icon: "📊",
    description: "Total tonnage", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "w-sess": {
    id: "w-sess", title: "Sessions", tab: "workout", icon: "🗓",
    description: "Weekly count", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "w-pr": {
    id: "w-pr", title: "Personal Records", tab: "workout", icon: "🏆",
    description: "PRs this week", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "w-dur": {
    id: "w-dur", title: "Avg Duration", tab: "workout", icon: "⏱",
    description: "Time per session", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "w-vol-chart": {
    id: "w-vol-chart", title: "Volume by Muscle Group", tab: "workout", icon: "📈",
    description: "Bar chart", span: 4, minSpan: 2, maxSpan: 6, defaultH: 2, minH: 2,
  },
  "w-sessoes": {
    id: "w-sessoes", title: "This Week's Sessions", tab: "workout", icon: "📋",
    description: "Session log", span: 6, minSpan: 3, maxSpan: 6, defaultH: 3, minH: 2,
  },
  "w-treino-chart": {
    id: "w-treino-chart", title: "Completed Sessions — 4 Weeks", tab: "workout", icon: "📉",
    description: "4-week history", span: 6, minSpan: 3, maxSpan: 6, defaultH: 2, minH: 2,
  },

  // ── Diet ──────────────────────────────────────────────────────────────────
  "d-kcal": {
    id: "d-kcal", title: "Today's Calories", tab: "diet", icon: "🔥",
    description: "Intake vs target", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-prot": {
    id: "d-prot", title: "Protein", tab: "diet", icon: "💪",
    description: "Daily goal", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-carb": {
    id: "d-carb", title: "Carbohydrates", tab: "diet", icon: "🌾",
    description: "Daily goal", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-fat": {
    id: "d-fat", title: "Fat", tab: "diet", icon: "🧈",
    description: "Daily goal", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-deficit": {
    id: "d-deficit", title: "Avg Deficit", tab: "diet", icon: "⚖️",
    description: "Weekly average", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-adherence": {
    id: "d-adherence", title: "Global Adherence", tab: "diet", icon: "🎯",
    description: "Plan adherence %", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "d-macros": {
    id: "d-macros", title: "Today's Macros", tab: "diet", icon: "📊",
    description: "Progress bars", span: 1, minSpan: 1, maxSpan: 4, defaultH: 2, minH: 1,
  },
  "d-macro-rings": {
    id: "d-macro-rings", title: "Macro Rings — vs Plan", tab: "diet", icon: "🎯",
    description: "Consumed vs target per macro", span: 6, minSpan: 4, maxSpan: 6, defaultH: 2, minH: 2,
  },
  "d-cal-chart": {
    id: "d-cal-chart", title: "Calories — Last 7 Days", tab: "diet", icon: "📈",
    description: "Weekly history", span: 6, minSpan: 3, maxSpan: 6, defaultH: 2, minH: 2,
  },
  "d-refeicoes": {
    id: "d-refeicoes", title: "Today's Meals", tab: "diet", icon: "🍽",
    description: "Meal log", span: 6, minSpan: 3, maxSpan: 6, defaultH: 3, minH: 2,
  },

  // ── Shape ─────────────────────────────────────────────────────────────────
  "s-peso": {
    id: "s-peso", title: "Current Weight", tab: "shape", icon: "⚖️",
    description: "Weekly record", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "s-bf": {
    id: "s-bf", title: "Est. BF%", tab: "shape", icon: "📐",
    description: "Body fat", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "s-magra": {
    id: "s-magra", title: "Lean Mass", tab: "shape", icon: "💪",
    description: "Retained muscle", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "s-semanas": {
    id: "s-semanas", title: "Weeks to Goal", tab: "shape", icon: "🎯",
    description: "ETA forecast", span: 1, minSpan: 1, maxSpan: 3, defaultH: 1, minH: 1,
  },
  "s-peso-chart": {
    id: "s-peso-chart", title: "Weight Progress — 8 Weeks", tab: "shape", icon: "📉",
    description: "8-week chart", span: 4, minSpan: 2, maxSpan: 6, defaultH: 2, minH: 2,
  },
  "s-comp": {
    id: "s-comp", title: "Body Composition", tab: "shape", icon: "🥧",
    description: "Fat vs lean", span: 2, minSpan: 1, maxSpan: 4, defaultH: 2, minH: 1,
  },
  "s-medidas": {
    id: "s-medidas", title: "Measurements", tab: "shape", icon: "📏",
    description: "Circumferences", span: 2, minSpan: 1, maxSpan: 4, defaultH: 2, minH: 2,
  },
  "s-prog": {
    id: "s-prog", title: "Shape Progress", tab: "shape", icon: "🏁",
    description: "Goal bars", span: 2, minSpan: 1, maxSpan: 4, defaultH: 2, minH: 1,
  },
  "s-insights": {
    id: "s-insights", title: "Insights", tab: "shape", icon: "💡",
    description: "Auto analysis", span: 2, minSpan: 2, maxSpan: 4, defaultH: 2, minH: 2,
  },
};

export const DEFAULT_LAYOUTS: Record<TabId, WidgetLayout[]> = {
  workout: [
    { id: "w-vol",          x: 0, y: 0, w: 1, h: 1 },
    { id: "w-sess",         x: 1, y: 0, w: 1, h: 1 },
    { id: "w-pr",           x: 2, y: 0, w: 1, h: 1 },
    { id: "w-dur",          x: 3, y: 0, w: 1, h: 1 },
    { id: "w-vol-chart",    x: 0, y: 1, w: 4, h: 2 },
    { id: "w-sessoes",      x: 0, y: 3, w: 6, h: 3 },
    { id: "w-treino-chart", x: 0, y: 6, w: 6, h: 2 },
  ],
  diet: [
    { id: "d-kcal",        x: 0, y: 0, w: 1, h: 1 },
    { id: "d-prot",        x: 1, y: 0, w: 1, h: 1 },
    { id: "d-carb",        x: 2, y: 0, w: 1, h: 1 },
    { id: "d-fat",         x: 3, y: 0, w: 1, h: 1 },
    { id: "d-deficit",     x: 4, y: 0, w: 1, h: 1 },
    { id: "d-adherence",   x: 5, y: 0, w: 1, h: 1 },
    { id: "d-macros",      x: 0, y: 1, w: 2, h: 2 },
    { id: "d-macro-rings", x: 2, y: 1, w: 4, h: 2 },
    { id: "d-cal-chart",   x: 0, y: 3, w: 6, h: 2 },
    { id: "d-refeicoes",   x: 0, y: 5, w: 6, h: 3 },
  ],
  shape: [
    { id: "s-peso",        x: 0, y: 0, w: 1, h: 1 },
    { id: "s-bf",          x: 1, y: 0, w: 1, h: 1 },
    { id: "s-magra",       x: 2, y: 0, w: 1, h: 1 },
    { id: "s-semanas",     x: 3, y: 0, w: 1, h: 1 },
    { id: "s-peso-chart",  x: 0, y: 1, w: 4, h: 2 },
    { id: "s-comp",        x: 4, y: 1, w: 2, h: 2 },
    { id: "s-medidas",     x: 0, y: 3, w: 2, h: 2 },
    { id: "s-prog",        x: 2, y: 3, w: 2, h: 2 },
    { id: "s-insights",    x: 4, y: 3, w: 2, h: 2 },
  ],
};
