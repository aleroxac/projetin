"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const tickStyle = { fill: "#a1a1aa", fontSize: 12, fontFamily: "var(--font-dm-mono)" };

export interface CaloriesChartPoint {
  day: string;
  calories: number | null;
}

interface Props {
  data: CaloriesChartPoint[];
  target?: number;
}

export default function CaloriesChartWidget({ data, target }: Props) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="day" tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={{ stroke: "#27272a" }} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: 8,
            fontSize: 12,
            color: "#fafafa",
          }}
          cursor={{ stroke: "rgba(255,255,255,.1)" }}
        />
        {target ? <ReferenceLine y={target} stroke="#27272a" strokeDasharray="4 3" /> : null}
        <Line
          type="monotone"
          dataKey="calories"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: "#6366f1", r: 3 }}
          activeDot={{ r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
