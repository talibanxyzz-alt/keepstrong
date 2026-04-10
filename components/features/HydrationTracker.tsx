"use client";

import { useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { localDayUtcRange } from "@/lib/utils/localDate";
import { logger } from "@/lib/logger";

type HydrationTrackerProps = {
  userId: string;
};

export function HydrationTracker({ userId }: HydrationTrackerProps) {
  const supabase = createClient();
  const [todayTotal, setTodayTotal] = useState(0);
  const [goal, setGoal] = useState(2500);
  const [loading, setLoading] = useState(true);
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const client = createClient();

    async function loadData() {
      setLoading(true);

      // After signup / OAuth redirect the SSR page can render before the browser
      // session cookie is readable — wait briefly so RLS sees auth.uid().
      for (let attempt = 0; attempt < 6; attempt++) {
        const {
          data: { session },
        } = await client.auth.getSession();
        if (session?.user?.id === userId) break;
        if (attempt === 5) {
          if (!cancelled) {
            setTodayTotal(0);
            setLoading(false);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
      }

      const { start: dayStart, end: dayEnd } = localDayUtcRange();

      const [{ data: logs, error: logsError }, { data: profile, error: profileError }] =
        await Promise.all([
          client
            .from("hydration_logs")
            .select("amount_ml")
            .eq("user_id", userId)
            .gte("logged_at", dayStart)
            .lte("logged_at", dayEnd),
          client
            .from("profiles")
            .select("daily_water_goal_ml")
            .eq("id", userId)
            .maybeSingle(),
        ]);

      if (cancelled) return;

      if (logsError) {
        const err = logsError as { message?: string; code?: string };
        logger.error("HydrationTracker: failed to load logs", {
          code: err.code,
          message: err.message,
          userId,
        });
        const missingRelation =
          /schema cache|does not exist|relation.*hydration/i.test(err.message ?? "") ||
          err.code === "PGRST205" ||
          err.code === "42P01";
        if (missingRelation) {
          logger.error("HydrationTracker: hydration_logs missing or not exposed — apply 018_hydration_logs.sql", {
            userId,
          });
        }
        toast.error(
          missingRelation
            ? "Hydration isn’t available yet. If you’re the app owner, apply the hydration_logs migration in Supabase."
            : "Could not load hydration logs"
        );
      } else {
        const total = logs?.reduce((sum, l) => sum + l.amount_ml, 0) ?? 0;
        setTodayTotal(total);
      }

      if (!profileError) {
        setGoal(profile?.daily_water_goal_ml ?? 2500);
      }

      setLoading(false);
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleLog = async (amount: number) => {
    setLogging(true);
    const { error } = await supabase
      .from("hydration_logs")
      .insert({ user_id: userId, amount_ml: amount });

    if (error) {
      toast.error("Failed to log water intake");
    } else {
      setTodayTotal((prev) => prev + amount);
      toast.success(`+${amount}ml logged`);
    }
    setLogging(false);
  };

  const safeGoal = goal > 0 ? goal : 2500;
  const pct = Math.min((todayTotal / safeGoal) * 100, 100);

  return (
    <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Droplets className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-charcoal">Hydration</h3>
        </div>
        <span className="text-sm font-medium tabular-nums text-slate">
          {loading ? "…" : `${todayTotal} / ${safeGoal} ml`}
        </span>
      </div>

      <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-cloud ring-1 ring-line/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500"
          style={{ width: `${loading ? 0 : pct}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[150, 250, 350, 500].map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => void handleLog(amount)}
            disabled={logging || loading}
            className="rounded-xl bg-primary/[0.08] py-2.5 text-xs font-semibold text-primary transition hover:bg-primary/15 disabled:opacity-50 sm:text-sm"
          >
            +{amount}ml
          </button>
        ))}
      </div>

      {!loading && todayTotal >= safeGoal && (
        <p className="mt-3 text-center text-sm font-semibold text-success">Daily goal reached</p>
      )}
    </div>
  );
}
