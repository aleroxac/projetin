"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { group: "Chest", volume: 3200 },
  { group: "Back", volume: 4100 },
  { group: "Legs", volume: 5400 },
  { group: "Shoulder", volume: 2800 },
  { group: "Biceps", volume: 1900 },
  { group: "Triceps", volume: 2200 },
];

const tickStyle = { fill: "#52525b", fontSize: 10, fontFamily: "var(--font-dm-mono)" };

export default function VolumeChartWidget() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={20}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="group" tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis
          tick={tickStyle}
          axisLine={{ stroke: "#27272a" }}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(1)}t`}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          formatter={(v: number) => [`${(v / 1000).toFixed(1)}t`, "Volume"]}
          cursor={{ fill: "rgba(255,255,255,.03)" }}
        />
        <Bar dataKey="volume" fill="#3b82f6" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
