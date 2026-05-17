"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { week: "W1", actual: 88.0, target: 88.0 },
  { week: "W2", actual: 87.4, target: 87.5 },
  { week: "W3", actual: 86.8, target: 87.0 },
  { week: "W4", actual: 86.2, target: 86.5 },
  { week: "W5", actual: 85.7, target: 86.0 },
  { week: "W6", actual: 85.1, target: 85.5 },
  { week: "W7", actual: 84.6, target: 85.0 },
  { week: "W8", actual: 84.2, target: 84.5 },
];

const tickStyle = { fill: "#52525b", fontSize: 10, fontFamily: "var(--font-dm-mono)" };

export default function WeightChartWidget() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="week" tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis
          tick={tickStyle}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
          tickFormatter={(v) => `${v}kg`}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(v: number) => [`${v}kg`]}
          cursor={{ stroke: "rgba(255,255,255,.1)" }}
        />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#27272a"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          name="Target"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e", r: 3 }}
          activeDot={{ r: 4 }}
          name="Actual"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
