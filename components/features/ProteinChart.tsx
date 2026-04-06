"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface ProteinChartProps {
  data: Array<{
    day: string;
    protein: number;
    fullDate?: string;
  }>;
  target: number;
}

export function ProteinChart({ data, target }: ProteinChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis
          dataKey="day"
          tick={{ fill: "#64748B", fontSize: 14 }}
          axisLine={{ stroke: "#E2E8F0" }}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 14 }}
          axisLine={{ stroke: "#E2E8F0" }}
        />
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
          formatter={(value: number) => [`${value}g protein`, ""]}
        />
        <ReferenceLine
          y={target}
          stroke="#64748B"
          strokeDasharray="5 5"
          label={{
            value: "Goal",
            position: "right",
            fill: "#64748B",
            fontSize: 12,
          }}
        />
        <Bar dataKey="protein" fill="#059669" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

