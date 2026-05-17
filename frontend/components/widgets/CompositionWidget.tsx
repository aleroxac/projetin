"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Lean Mass (70.4kg)", value: 70.4 },
  { name: "Fat (13.8kg)", value: 13.8 },
];

const COLORS = ["#3b82f6", "#f59e0b"];

export default function CompositionWidget() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={75}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(v: number) => [`${v}kg`]}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: "#71717a", paddingTop: 4 }}
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
