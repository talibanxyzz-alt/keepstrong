"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getDaysSinceDose } from "@/lib/dose/getDaysSinceDose";

export type SideEffectLogRow = {
  id: string;
  user_id: string;
  logged_date: string;
  nausea_level: number | null;
  energy_level: number | null;
  appetite_level: number | null;
  notes: string | null;
  created_at: string;
};

type SideEffectsPageClientProps = {
  doseDayOfWeek: number | null;
  logs30: SideEffectLogRow[];
  logs90: SideEffectLogRow[];
};

function buildChartRows(logs: SideEffectLogRow[]) {
  const byDate = new Map(
    logs.map((l) => [
      l.logged_date,
      {
        nausea: l.nausea_level,
        energy: l.energy_level,
        appetite: l.appetite_level,
      },
    ])
  );

  const rows: Array<{
    dateKey: string;
    label: string;
    nausea: number | null;
    energy: number | null;
    appetite: number | null;
  }> = [];

  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateKey = format(d, "yyyy-MM-dd");
    const entry = byDate.get(dateKey);
    rows.push({
      dateKey,
      label: format(d, "MMM d"),
      nausea: entry?.nausea ?? null,
      energy: entry?.energy ?? null,
      appetite: entry?.appetite ?? null,
    });
  }

  return rows;
}

function computeDosePattern(logs: SideEffectLogRow[], doseDayOfWeek: number | null) {
  if (doseDayOfWeek === null || logs.length < 14) return null;

  const doseRelative = logs.map((log) => ({
    ...log,
    daysSinceDose: getDaysSinceDose(log.logged_date, doseDayOfWeek),
  }));

  const valid = doseRelative.filter((r) => r.daysSinceDose !== null);
  const doseDays = valid.filter((r) => r.daysSinceDose === 0);
  const otherDays = valid.filter((r) => r.daysSinceDose! > 0);

  const doseNausea = doseDays.filter((r) => r.nausea_level !== null);
  const otherNausea = otherDays.filter((r) => r.nausea_level !== null);
  const doseEnergy = doseDays.filter((r) => r.energy_level !== null);
  const otherEnergy = otherDays.filter((r) => r.energy_level !== null);

  if (
    doseNausea.length === 0 ||
    otherNausea.length === 0 ||
    doseEnergy.length === 0 ||
    otherEnergy.length === 0
  ) {
    return null;
  }

  const avgNauseaDose =
    doseNausea.reduce((s, r) => s + (r.nausea_level ?? 0), 0) / doseNausea.length;
  const avgNauseaOther =
    otherNausea.reduce((s, r) => s + (r.nausea_level ?? 0), 0) / otherNausea.length;
  const avgEnergyDose =
    doseEnergy.reduce((s, r) => s + (r.energy_level ?? 0), 0) / doseEnergy.length;
  const avgEnergyOther =
    otherEnergy.reduce((s, r) => s + (r.energy_level ?? 0), 0) / otherEnergy.length;

  let nauseaPct: number | null = null;
  if (avgNauseaOther > 0) {
    nauseaPct = ((avgNauseaDose - avgNauseaOther) / avgNauseaOther) * 100;
  } else if (avgNauseaDose > 0) {
    nauseaPct = 100;
  }

  let energyPct: number | null = null;
  if (avgEnergyOther > 0) {
    energyPct = ((avgEnergyOther - avgEnergyDose) / avgEnergyOther) * 100;
  } else if (avgEnergyDose > 0) {
    energyPct = -100;
  }

  if (nauseaPct === null && energyPct === null) return null;

  return {
    avgNauseaDose,
    avgNauseaOther,
    avgEnergyDose,
    avgEnergyOther,
    nauseaPct,
    energyPct,
  };
}

export default function SideEffectsPageClient({
  doseDayOfWeek,
  logs30,
  logs90,
}: SideEffectsPageClientProps) {
  const chartData = buildChartRows(logs30);
  const pattern = computeDosePattern(logs30, doseDayOfWeek);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link
          href="/dose-calendar"
          className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-charcoal mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Dose calendar
        </Link>
        <h1 className="text-2xl font-semibold text-charcoal mb-1">Side effect log</h1>
        <p className="text-sm text-slate">
          Track nausea, energy, and appetite against your weekly dose rhythm.
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-line p-5">
        <h2 className="font-medium text-charcoal mb-4">Last 30 days</h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 5]} tick={{ fill: "#64748B", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                }}
                labelFormatter={(label, payload) => {
                  const p = payload?.[0]?.payload as { dateKey?: string } | undefined;
                  if (p?.dateKey) {
                    return format(new Date(p.dateKey + "T12:00:00"), "MMM d, yyyy");
                  }
                  return String(label);
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="nausea"
                name="Nausea"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Energy"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="appetite"
                name="Appetite"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {pattern && doseDayOfWeek !== null && (
        <div className="bg-surface rounded-lg border border-line p-5 space-y-3">
          <h2 className="font-medium text-charcoal">Pattern insight</h2>
          <div className="text-sm text-slate leading-relaxed space-y-2">
            {pattern.nauseaPct !== null && (
              <p>
                You typically feel{" "}
                <span className="font-semibold text-charcoal">
                  {Math.abs(Math.round(pattern.nauseaPct))}%
                </span>{" "}
                {pattern.nauseaPct >= 0 ? "more" : "less"} nausea on injection day vs other days.
              </p>
            )}
            {pattern.energyPct !== null && (
              <p>
                You typically feel{" "}
                <span className="font-semibold text-charcoal">
                  {Math.abs(Math.round(pattern.energyPct))}%
                </span>{" "}
                {pattern.energyPct >= 0 ? "less" : "more"} energy on injection day vs other days.
              </p>
            )}
          </div>
        </div>
      )}

      {doseDayOfWeek === null && (
        <p className="text-sm text-slate">
          Set your dose day in{" "}
          <Link href="/settings" className="text-charcoal underline underline-offset-2">
            settings
          </Link>{" "}
          to see dose-day vs other-day comparisons.
        </p>
      )}

      <div className="bg-surface rounded-lg border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-medium text-charcoal">Full history</h2>
          <p className="text-xs text-slate mt-1">Most recent first (up to 90 entries)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-cloud/50 text-left text-xs text-slate uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-center">Nausea</th>
                <th className="px-4 py-3 font-medium text-center">Energy</th>
                <th className="px-4 py-3 font-medium text-center">Appetite</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs90.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate">
                    No entries yet. Log from the dashboard.
                  </td>
                </tr>
              ) : (
                logs90.map((row) => (
                  <tr key={row.id} className="border-b border-line/80 hover:bg-cloud/30">
                    <td className="px-4 py-3 text-charcoal whitespace-nowrap">
                      {format(new Date(row.logged_date + "T12:00:00"), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">{row.nausea_level ?? "—"}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{row.energy_level ?? "—"}</td>
                    <td className="px-4 py-3 text-center tabular-nums">{row.appetite_level ?? "—"}</td>
                    <td className="px-4 py-3 text-slate max-w-[200px] truncate" title={row.notes ?? ""}>
                      {row.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
