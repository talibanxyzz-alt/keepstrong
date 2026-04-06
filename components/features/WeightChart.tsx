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

interface WeightChartProps {
  data: Array<{
    day: string;
    weight: number;
    fullDate?: string;
  }>;
}

export function WeightChart({ data }: WeightChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="day" tick={{ fill: "#64748B", fontSize: 14 }} />
        <YAxis tick={{ fill: "#64748B", fontSize: 14 }} domain={["dataMin - 1", "dataMax + 1"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
          labelFormatter={(label, payload) => {
            if (payload && payload[0]) {
              return payload[0].payload.fullDate;
            }
            return label;
          }}
          formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
        />
        <Line type="monotone" dataKey="weight" stroke="#0C4A6E" strokeWidth={3} dot={{ fill: "#0C4A6E", r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

