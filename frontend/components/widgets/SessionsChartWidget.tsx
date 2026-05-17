"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "Week 1", done: 5, goal: 6 },
  { week: "Week 2", done: 4, goal: 6 },
  { week: "Week 3", done: 6, goal: 6 },
  { week: "Week 4", done: 5, goal: 6 },
];

const tickStyle = { fill: "#52525b", fontSize: 10, fontFamily: "var(--font-dm-mono)" };

export default function SessionsChartWidget() {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={16} barGap={4}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="week" tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} domain={[0, 7]} />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          cursor={{ fill: "rgba(255,255,255,.03)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: "#52525b", paddingTop: 8 }}
          iconSize={8}
        />
        <Bar dataKey="done" name="Done" fill="#6366f1" radius={[5, 5, 0, 0]} />
        <Bar dataKey="goal" name="Goal" fill="#27272a" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
