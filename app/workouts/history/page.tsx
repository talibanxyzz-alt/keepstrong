import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowDown, ArrowLeft, ArrowUp, Clock, Dumbbell, LayoutDashboard, LayoutGrid } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Workout History | KeepStrong" };

export default async function WorkoutHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select(
      `
      id, workout_id, started_at, timer_started_at, completed_at, duration_minutes, energy_level, notes,
      workouts(name)
    `
    )
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(50);

  const sessionIds = (sessions || []).map((s) => s.id);
  const { data: setCounts } = sessionIds.length
    ? await supabase.from("exercise_sets").select("session_id, weight_kg").in("session_id", sessionIds)
    : { data: [] };

  const setsPerSession: Record<string, number> = {};
  const weightAgg: Record<string, { sum: number; n: number }> = {};
  for (const row of setCounts || []) {
    if (row.session_id) {
      setsPerSession[row.session_id] = (setsPerSession[row.session_id] ?? 0) + 1;
      const w = row.weight_kg;
      if (typeof w === "number" && !Number.isNaN(w)) {
        const cur = weightAgg[row.session_id] ?? { sum: 0, n: 0 };
        cur.sum += w;
        cur.n += 1;
        weightAgg[row.session_id] = cur;
      }
    }
  }

  const avgWeightBySession: Record<string, number> = {};
  for (const [sid, { sum, n }] of Object.entries(weightAgg)) {
    if (n > 0) avgWeightBySession[sid] = sum / n;
  }

  const energyLabel = (level: number | null) => {
    if (!level) return null;
    const labels: Record<number, string> = {
      1: "Low",
      2: "OK",
      3: "Good",
      4: "Great",
      5: "Excellent",
    };
    return labels[level];
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/workouts/programs"
            className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-slate transition-colors hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" />
            Programs
          </Link>
          <h1 className="text-2xl font-semibold text-charcoal sm:text-3xl sm:font-bold">
            Workout history
          </h1>
          <p className="text-sm text-slate sm:text-base">
            {(sessions || []).length} completed session
            {(sessions || []).length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-colors hover:border-line-strong hover:bg-cloud/50"
          >
            <LayoutDashboard className="h-4 w-4 text-slate" />
            Home
          </Link>
          <Link
            href="/workouts/programs"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-colors hover:border-line-strong hover:bg-cloud/50"
          >
            <LayoutGrid className="h-4 w-4 text-slate" />
            Programs
          </Link>
        </div>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface p-12 text-center">
          <Dumbbell className="mx-auto mb-3 h-10 w-10 text-slate/50" />
          <p className="font-medium text-charcoal">No completed workouts yet</p>
          <p className="mt-1 text-sm text-slate">Start a program and finish a session to see it here.</p>
          <Link
            href="/workouts/programs"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-charcoal px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90"
          >
            Browse programs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session, sessionIndex) => {
            const workout = session.workouts as { name: string } | null;
            const durationStart =
              session.timer_started_at ?? session.started_at;
            const duration = session.duration_minutes
              ? `${session.duration_minutes} min`
              : session.completed_at && durationStart
                ? `${Math.round(
                    (new Date(session.completed_at).getTime() -
                      new Date(durationStart).getTime()) /
                      60000
                  )} min`
                : null;

            const wid = session.workout_id;
            let vsPrev: "first" | "up" | "down" | null = null;
            if (wid) {
              const prevSameWorkout = sessions.slice(sessionIndex + 1).find((s) => s.workout_id === wid);
              if (!prevSameWorkout) {
                vsPrev = "first";
              } else {
                const curAvg = avgWeightBySession[session.id];
                const prevAvg = avgWeightBySession[prevSameWorkout.id];
                if (curAvg != null && prevAvg != null) {
                  if (curAvg > prevAvg) vsPrev = "up";
                  else if (curAvg < prevAvg) vsPrev = "down";
                }
              }
            }

            return (
              <div
                key={session.id}
                className="rounded-lg border border-line bg-surface p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-charcoal">{workout?.name ?? "Workout"}</p>
                      {vsPrev === "first" ? (
                        <span className="rounded-md bg-cloud px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate">
                          First session
                        </span>
                      ) : vsPrev === "up" ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                          <ArrowUp className="h-3.5 w-3.5" /> vs previous
                        </span>
                      ) : vsPrev === "down" ? (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                          <ArrowDown className="h-3.5 w-3.5" /> vs previous
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate">
                      {session.completed_at
                        ? formatDistanceToNow(new Date(session.completed_at), { addSuffix: true })
                        : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-slate/70">
                    {session.completed_at
                      ? format(new Date(session.completed_at), "MMM d, yyyy")
                      : ""}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate">
                  {duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {duration}
                    </span>
                  )}
                  {setsPerSession[session.id] ? (
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5" /> {setsPerSession[session.id]} sets
                    </span>
                  ) : null}
                  {session.energy_level ? <span>{energyLabel(session.energy_level)}</span> : null}
                </div>

                {session.notes ? (
                  <p className="mt-3 rounded-lg bg-cloud px-3 py-2 text-sm italic text-slate">
                    &ldquo;{session.notes}&rdquo;
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
