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

export function MeasurementSiteLineChart({
  data,
  label,
}: {
  data: { dateLabel: string; value: number }[];
  label: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="dateLabel" tick={{ fill: "#64748B", fontSize: 12 }} />
        <YAxis tick={{ fill: "#64748B", fontSize: 12 }} domain={["dataMin - 1", "dataMax + 1"]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${value.toFixed(1)} cm`, label]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0C4A6E"
          strokeWidth={3}
          dot={{ fill: "#0C4A6E", r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
