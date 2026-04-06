"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import ProgressSubNav from "@/app/progress/ProgressSubNav";

const MeasurementSiteLineChart = dynamic(
  () =>
    import("@/components/features/MeasurementSiteLineChart").then((m) => ({
      default: m.MeasurementSiteLineChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center rounded-lg bg-cloud">
        <p className="text-slate">Loading chart…</p>
      </div>
    ),
  }
);

type BodyMeasurementRow = Database["public"]["Tables"]["body_measurements"]["Row"];

const MEASUREMENT_KEYS = [
  "waist_cm",
  "chest_cm",
  "hips_cm",
  "left_arm_cm",
  "right_arm_cm",
  "left_thigh_cm",
  "right_thigh_cm",
] as const;

type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

const LABELS: Record<MeasurementKey, string> = {
  waist_cm: "Waist",
  chest_cm: "Chest",
  hips_cm: "Hips",
  left_arm_cm: "Left Arm",
  right_arm_cm: "Right Arm",
  left_thigh_cm: "Left Thigh",
  right_thigh_cm: "Right Thigh",
};

type DeltaKind = "shrink-good" | "grow-good" | "neutral";

function deltaKindForKey(key: MeasurementKey): DeltaKind {
  if (key === "left_arm_cm" || key === "right_arm_cm") return "grow-good";
  if (key === "chest_cm") return "neutral";
  return "shrink-good";
}

function DeltaArrow({
  current,
  previous,
  kind,
}: {
  current: number | null;
  previous: number | null;
  kind: DeltaKind;
}) {
  if (current === null || previous === null) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return null;

  if (kind === "neutral") {
    return (
      <span className="ml-1 text-xs text-slate" title={`${diff > 0 ? "+" : ""}${diff.toFixed(1)} cm`}>
        {diff > 0 ? "↑" : "↓"}
      </span>
    );
  }

  if (kind === "shrink-good") {
    if (diff < 0) {
      return (
        <span className="ml-1 text-xs text-success" title={`${diff.toFixed(1)} cm`}>
          ↓
        </span>
      );
    }
    return (
      <span className="ml-1 text-xs text-danger" title={`+${diff.toFixed(1)} cm`}>
        ↑
      </span>
    );
  }

  // grow-good (arms)
  if (diff > 0) {
    return (
      <span className="ml-1 text-xs text-success" title={`+${diff.toFixed(1)} cm`}>
        ↑
      </span>
    );
  }
  return (
    <span className="ml-1 text-xs text-danger" title={`${diff.toFixed(1)} cm`}>
      ↓
    </span>
  );
}

function formatCm(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return `${Number(v).toFixed(1)}`;
}

export default function MeasurementsPageClient({
  userId,
  initialRows,
}: {
  userId: string;
  initialRows: BodyMeasurementRow[];
}) {
  const supabase = createClient();
  const [rows, setRows] = useState<BodyMeasurementRow[]>(initialRows);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    measured_at: format(new Date(), "yyyy-MM-dd"),
    waist_cm: "",
    chest_cm: "",
    hips_cm: "",
    left_arm_cm: "",
    right_arm_cm: "",
    left_thigh_cm: "",
    right_thigh_cm: "",
    notes: "",
  });

  const refetch = async () => {
    const { data, error } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", userId)
      .order("measured_at", { ascending: false })
      .limit(12);
    if (!error && data) setRows(data as BodyMeasurementRow[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("body_measurements").insert({
      user_id: userId,
      measured_at: form.measured_at,
      waist_cm: form.waist_cm ? parseFloat(form.waist_cm) : null,
      chest_cm: form.chest_cm ? parseFloat(form.chest_cm) : null,
      hips_cm: form.hips_cm ? parseFloat(form.hips_cm) : null,
      left_arm_cm: form.left_arm_cm ? parseFloat(form.left_arm_cm) : null,
      right_arm_cm: form.right_arm_cm ? parseFloat(form.right_arm_cm) : null,
      left_thigh_cm: form.left_thigh_cm ? parseFloat(form.left_thigh_cm) : null,
      right_thigh_cm: form.right_thigh_cm ? parseFloat(form.right_thigh_cm) : null,
      notes: form.notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to save measurements");
      return;
    }
    toast.success("Measurements saved");
    setForm((f) => ({
      ...f,
      waist_cm: "",
      chest_cm: "",
      hips_cm: "",
      left_arm_cm: "",
      right_arm_cm: "",
      left_thigh_cm: "",
      right_thigh_cm: "",
      notes: "",
    }));
    await refetch();
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black";

  const chartSections = useMemo(() => {
    const chronological = [...rows].sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );
    return MEASUREMENT_KEYS.map((key) => {
      const points = chronological
        .filter((r) => r[key] !== null && r[key] !== undefined)
        .slice(-12)
        .map((r) => ({
          dateLabel: format(new Date(r.measured_at + "T12:00:00"), "MMM d"),
          value: r[key] as number,
        }));
      return { key, label: LABELS[key], data: points, count: points.length };
    });
  }, [rows]);

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal"
          >
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-charcoal">Body Measurements</h1>
        </div>

        <ProgressSubNav />

        <div className="mb-10 rounded-lg border border-line bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-charcoal">Log measurement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="measured_at">
                Date
              </label>
              <input
                id="measured_at"
                type="date"
                required
                value={form.measured_at}
                onChange={(e) => setForm((f) => ({ ...f, measured_at: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="waist_cm">
                  Waist
                </label>
                <input
                  id="waist_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.waist_cm}
                  onChange={(e) => setForm((f) => ({ ...f, waist_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="chest_cm">
                  Chest
                </label>
                <input
                  id="chest_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.chest_cm}
                  onChange={(e) => setForm((f) => ({ ...f, chest_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="hips_cm">
                  Hips
                </label>
                <input
                  id="hips_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.hips_cm}
                  onChange={(e) => setForm((f) => ({ ...f, hips_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="hidden sm:block" aria-hidden />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="left_arm_cm">
                  Left arm
                </label>
                <input
                  id="left_arm_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.left_arm_cm}
                  onChange={(e) => setForm((f) => ({ ...f, left_arm_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="right_arm_cm">
                  Right arm
                </label>
                <input
                  id="right_arm_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.right_arm_cm}
                  onChange={(e) => setForm((f) => ({ ...f, right_arm_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="left_thigh_cm">
                  Left thigh
                </label>
                <input
                  id="left_thigh_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.left_thigh_cm}
                  onChange={(e) => setForm((f) => ({ ...f, left_thigh_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="right_thigh_cm">
                  Right thigh
                </label>
                <input
                  id="right_thigh_cm"
                  type="number"
                  step="0.1"
                  min={1}
                  max={300}
                  placeholder="cm"
                  value={form.right_thigh_cm}
                  onChange={(e) => setForm((f) => ({ ...f, right_thigh_cm: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal" htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-black text-white rounded-xl px-6 py-3 font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        <div className="mb-10 overflow-x-auto rounded-lg border border-line bg-surface">
          <h2 className="border-b border-line px-6 py-4 text-lg font-semibold text-charcoal">History</h2>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-cloud/50 text-slate">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Waist</th>
                <th className="px-4 py-3 font-medium">Chest</th>
                <th className="px-4 py-3 font-medium">Hips</th>
                <th className="px-4 py-3 font-medium">Arms</th>
                <th className="px-4 py-3 font-medium">Thighs</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate">
                    No measurements yet.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const older = rows[i + 1];
                  return (
                    <tr key={row.id} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-charcoal">
                        {format(new Date(row.measured_at + "T12:00:00"), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3 font-mono text-charcoal">
                        {formatCm(row.waist_cm)}
                        <DeltaArrow
                          current={row.waist_cm}
                          previous={older?.waist_cm ?? null}
                          kind={deltaKindForKey("waist_cm")}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-charcoal">
                        {formatCm(row.chest_cm)}
                        <DeltaArrow
                          current={row.chest_cm}
                          previous={older?.chest_cm ?? null}
                          kind={deltaKindForKey("chest_cm")}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-charcoal">
                        {formatCm(row.hips_cm)}
                        <DeltaArrow
                          current={row.hips_cm}
                          previous={older?.hips_cm ?? null}
                          kind={deltaKindForKey("hips_cm")}
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-charcoal">
                        <span>
                          {formatCm(row.left_arm_cm)} / {formatCm(row.right_arm_cm)}
                        </span>
                        <span className="inline-flex gap-1">
                          <DeltaArrow
                            current={row.left_arm_cm}
                            previous={older?.left_arm_cm ?? null}
                            kind={deltaKindForKey("left_arm_cm")}
                          />
                          <DeltaArrow
                            current={row.right_arm_cm}
                            previous={older?.right_arm_cm ?? null}
                            kind={deltaKindForKey("right_arm_cm")}
                          />
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-charcoal">
                        <span>
                          {formatCm(row.left_thigh_cm)} / {formatCm(row.right_thigh_cm)}
                        </span>
                        <span className="inline-flex gap-1">
                          <DeltaArrow
                            current={row.left_thigh_cm}
                            previous={older?.left_thigh_cm ?? null}
                            kind={deltaKindForKey("left_thigh_cm")}
                          />
                          <DeltaArrow
                            current={row.right_thigh_cm}
                            previous={older?.right_thigh_cm ?? null}
                            kind={deltaKindForKey("right_thigh_cm")}
                          />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-charcoal">Trends</h2>
          {chartSections.map(({ key, label, data, count }) => {
            if (count < 2) return null;
            return (
              <div key={key} className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-4 text-base font-semibold text-charcoal">{label}</h3>
                <MeasurementSiteLineChart data={data} label={label} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
