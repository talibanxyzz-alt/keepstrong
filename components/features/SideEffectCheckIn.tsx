"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { localDateString } from "@/lib/utils/localDate";

type SideEffectCheckInProps = {
  userId: string;
};

export function SideEffectCheckIn({ userId }: SideEffectCheckInProps) {
  const supabase = createClient();
  const [todayLog, setTodayLog] = useState<{
    nausea_level: number;
    energy_level: number;
    appetite_level: number;
    notes?: string;
  } | null>(null);
  const [form, setForm] = useState({ nausea: 0, energy: 3, appetite: 3, notes: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadToday = useCallback(async () => {
    setLoading(true);
    const today = localDateString();
    const { data, error } = await supabase
      .from("side_effect_logs")
      .select("nausea_level, energy_level, appetite_level, notes")
      .eq("user_id", userId)
      .eq("logged_date", today)
      .maybeSingle();

    if (error) {
      toast.error("Could not load today’s wellbeing log");
      setTodayLog(null);
    } else {
      setTodayLog(
        data
          ? {
              nausea_level: data.nausea_level ?? 0,
              energy_level: data.energy_level ?? 0,
              appetite_level: data.appetite_level ?? 0,
              notes: data.notes ?? undefined,
            }
          : null
      );
    }
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    void loadToday();
  }, [loadToday]);

  const handleSave = async () => {
    setSaving(true);
    const today = localDateString();
    const { error } = await supabase.from("side_effect_logs").upsert(
      {
        user_id: userId,
        logged_date: today,
        nausea_level: form.nausea,
        energy_level: form.energy,
        appetite_level: form.appetite,
        notes: form.notes || null,
      },
      { onConflict: "user_id,logged_date" }
    );

    if (error) {
      toast.error("Failed to save");
    } else {
      toast.success("Logged!");
      setTodayLog({
        nausea_level: form.nausea,
        energy_level: form.energy,
        appetite_level: form.appetite,
        notes: form.notes || undefined,
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-line/90 bg-surface p-6 shadow-card">
        <div className="mb-4 h-5 w-48 rounded bg-cloud" />
        <div className="h-24 rounded-xl bg-cloud" />
      </div>
    );
  }

  if (todayLog) {
    return (
      <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-charcoal">Today&apos;s wellbeing</h3>
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            Logged
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-cloud/80 py-3 ring-1 ring-line/50">
            <p className="mb-1 text-xs font-medium text-slate">Nausea</p>
            <p className="text-2xl font-bold tabular-nums text-charcoal">{todayLog.nausea_level}/5</p>
          </div>
          <div className="rounded-xl bg-cloud/80 py-3 ring-1 ring-line/50">
            <p className="mb-1 text-xs font-medium text-slate">Energy</p>
            <p className="text-2xl font-bold tabular-nums text-charcoal">{todayLog.energy_level}/5</p>
          </div>
          <div className="rounded-xl bg-cloud/80 py-3 ring-1 ring-line/50">
            <p className="mb-1 text-xs font-medium text-slate">Appetite</p>
            <p className="text-2xl font-bold tabular-nums text-charcoal">{todayLog.appetite_level}/5</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card sm:p-6">
      <h3 className="mb-4 font-semibold text-charcoal">How are you feeling today?</h3>
      <div className="space-y-5">
        <Scale
          label="Nausea"
          value={form.nausea}
          onChange={(v) => setForm((f) => ({ ...f, nausea: v }))}
          lowLabel="None"
          highLabel="Severe"
          lowColor="bg-green-400"
          highColor="bg-red-400"
        />
        <Scale
          label="Energy"
          value={form.energy}
          onChange={(v) => setForm((f) => ({ ...f, energy: v }))}
          lowLabel="Exhausted"
          highLabel="Great"
          lowColor="bg-red-400"
          highColor="bg-green-400"
        />
        <Scale
          label="Appetite"
          value={form.appetite}
          onChange={(v) => setForm((f) => ({ ...f, appetite: v }))}
          lowLabel="None"
          highLabel="Normal"
          lowColor="bg-amber-400"
          highColor="bg-green-400"
        />
        <textarea
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any notes? (optional)"
          rows={2}
          className="w-full resize-none rounded-xl border border-line/90 bg-canvas px-4 py-3 text-sm text-charcoal placeholder:text-slate/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Log how I feel"}
        </button>
      </div>
    </div>
  );
}

type ScaleProps = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
  lowColor: string;
  highColor: string;
};

function Scale({ label, value, onChange, lowLabel, highLabel, lowColor, highColor }: ScaleProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        <span className="text-sm tabular-nums text-slate">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-9 rounded-lg transition-all ring-1 ring-line/40 hover:opacity-90 ${
              n <= value
                ? n <= 2
                  ? lowColor
                  : n >= 4
                    ? highColor
                    : "bg-amber-300"
                : "bg-cloud"
            }`}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between">
        <span className="text-xs text-slate">{lowLabel}</span>
        <span className="text-xs text-slate">{highLabel}</span>
      </div>
    </div>
  );
}
