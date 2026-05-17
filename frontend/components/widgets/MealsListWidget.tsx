"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMealLogs, type MealLog } from "@/lib/api";
import { toast } from "sonner";

export default function MealsListWidget() {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("projetin:user:id");
    if (!userId) {
      toast.error("Select a profile to view meals");
      setLoading(false);
      return;
    }
    fetchMealLogs(userId)
      .then((data) => setMeals(data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load meal logs");
      })
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => meals.reduce((sum, m) => sum + (m.calories ?? 0), 0),
    [meals]
  );

  if (loading) return <p className="text-[16px] text-[var(--text2)]">Loading meals…</p>;
  if (!meals.length) return <p className="text-[16px] text-[var(--text2)]">No meals yet.</p>;

  return (
    <div>
      {meals.map((m, i) => (
        <div
          key={m.id}
          className="flex justify-between items-start py-3"
          style={{
            borderBottom: i < meals.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="text-[18px] font-semibold text-[var(--text)] truncate">
              {m.mealTitle || "Meal"}
            </div>
            {m.mealDescription && (
              <div className="text-[14px] text-[var(--text2)] mt-0.5 truncate">
                {m.mealDescription}
              </div>
            )}
            <div className="text-[14px] text-[var(--text2)] mt-1">
              P <span className="text-green-400 font-medium">{Math.round(m.protein)}g</span>
              {" · "}
              C <span className="text-amber-400 font-medium">{Math.round(m.carbs)}g</span>
              {" · "}
              F <span className="text-blue-400 font-medium">{Math.round(m.fat)}g</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[22px] font-bold text-[var(--text)]">
              {Math.round(m.calories)}
            </div>
            <div className="text-[13px] text-[var(--text2)]">kcal</div>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-baseline mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-[15px] text-[var(--text2)] font-medium">Total</span>
        <span className="text-[22px] font-bold text-[var(--text)]">
          {Math.round(total)} <span className="text-[15px] font-normal text-[var(--text2)]">kcal</span>
        </span>
      </div>
    </div>
  );
}
