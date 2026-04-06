import { endOfDay, format, parseISO, startOfDay, subDays } from "date-fns";
import { createAdminClient } from "@/lib/supabase/server";
import { localDateString } from "@/lib/utils/localDate";

export type WeeklyStats = {
  userId: string;
  userName: string;
  userEmail: string;
  weekStart: string; // ISO date
  weekEnd: string; // ISO date

  // Protein
  proteinGoal: number;
  proteinDaysHit: number; // days where total >= goal
  proteinAvgG: number;
  proteinTotalG: number;

  // Workouts
  workoutsCompleted: number;
  workoutMinutes: number;

  // Weight
  weightStart: number | null; // first log of the week
  weightEnd: number | null; // last log of the week
  weightChange: number | null; // negative = loss

  // Hydration (if table has data)
  hydrationAvgMl: number | null;
  hydrationGoalMl: number | null;

  // Streak
  currentProteinStreak: number;

  // Subscription
  subscriptionPlan: string;
};

function sumProteinByDay(
  rows: { protein_grams: number | null; date: string }[] | null
): Record<string, number> {
  const byDay: Record<string, number> = {};
  for (const log of rows ?? []) {
    const day = log.date;
    byDay[day] = (byDay[day] ?? 0) + (log.protein_grams ?? 0);
  }
  return byDay;
}

export async function getWeeklyStats(userId: string): Promise<WeeklyStats | null> {
  const now = new Date();
  const weekStartLocal = startOfDay(subDays(now, 7));
  const weekEndLocal = endOfDay(now);
  const weekStartStr = format(weekStartLocal, "yyyy-MM-dd");
  const weekEndStr = localDateString(now);

  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, daily_protein_target_g, subscription_plan, daily_water_goal_ml"
    )
    .eq("id", userId)
    .single();

  if (profileError || !profile?.email) return null;

  const { data: proteinLogs } = await supabase
    .from("protein_logs")
    .select("protein_grams, date")
    .eq("user_id", userId)
    .gte("date", weekStartStr)
    .lte("date", weekEndStr);

  const proteinByDay = sumProteinByDay(proteinLogs);

  const goal = profile.daily_protein_target_g ?? 100;
  const daysHit = Object.values(proteinByDay).filter((total) => total >= goal).length;
  const totalProtein = Object.values(proteinByDay).reduce((a, b) => a + b, 0);
  const dayKeys = Object.keys(proteinByDay);
  const avgProtein =
    dayKeys.length > 0 ? Math.round(totalProtein / dayKeys.length) : 0;

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, duration_minutes, created_at")
    .eq("user_id", userId)
    .gte("created_at", weekStartLocal.toISOString())
    .lte("created_at", weekEndLocal.toISOString());

  const workoutsCompleted = sessions?.length ?? 0;
  const workoutMinutes =
    sessions?.reduce((sum, s) => sum + (s.duration_minutes ?? 0), 0) ?? 0;

  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("weight_kg, logged_at")
    .eq("user_id", userId)
    .gte("logged_at", weekStartLocal.toISOString())
    .lte("logged_at", weekEndLocal.toISOString())
    .order("logged_at", { ascending: true });

  const weightStart =
    weightLogs?.[0]?.weight_kg != null ? Number(weightLogs[0].weight_kg) : null;
  const weightEnd =
    weightLogs && weightLogs.length > 0 && weightLogs[weightLogs.length - 1].weight_kg != null
      ? Number(weightLogs[weightLogs.length - 1].weight_kg)
      : null;
  const weightChange =
    weightStart != null && weightEnd != null ? weightEnd - weightStart : null;

  let hydrationAvgMl: number | null = null;
  const hydrationGoalMl = profile.daily_water_goal_ml ?? 2500;

  const { data: hydrationLogs, error: hydrationError } = await supabase
    .from("hydration_logs")
    .select("amount_ml, logged_at")
    .eq("user_id", userId)
    .gte("logged_at", weekStartLocal.toISOString())
    .lte("logged_at", weekEndLocal.toISOString());

  if (!hydrationError && hydrationLogs && hydrationLogs.length > 0) {
    const hydByDay: Record<string, number> = {};
    for (const log of hydrationLogs) {
      if (!log.logged_at) continue;
      const day = format(parseISO(log.logged_at), "yyyy-MM-dd");
      hydByDay[day] = (hydByDay[day] ?? 0) + (log.amount_ml ?? 0);
    }
    const hydDays = Object.keys(hydByDay);
    if (hydDays.length > 0) {
      hydrationAvgMl = Math.round(
        Object.values(hydByDay).reduce((a, b) => a + b, 0) / hydDays.length
      );
    }
  }

  const streakStartStr = format(startOfDay(subDays(now, 40)), "yyyy-MM-dd");

  const { data: streakProteinLogs } = await supabase
    .from("protein_logs")
    .select("protein_grams, date")
    .eq("user_id", userId)
    .gte("date", streakStartStr)
    .lte("date", weekEndStr);

  const streakByDay = sumProteinByDay(streakProteinLogs);

  let streak = 0;
  const yesterday = subDays(now, 1);
  for (let i = 0; i < 30; i++) {
    const dStr = format(subDays(yesterday, i), "yyyy-MM-dd");
    if ((streakByDay[dStr] ?? 0) >= goal) {
      streak++;
    } else {
      break;
    }
  }

  const plan = profile.subscription_plan;
  const subscriptionPlan =
    plan === "core" || plan === "premium" ? plan : "free";

  return {
    userId,
    userName: profile.full_name ?? "there",
    userEmail: profile.email,
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    proteinGoal: goal,
    proteinDaysHit: daysHit,
    proteinAvgG: avgProtein,
    proteinTotalG: Math.round(totalProtein),
    workoutsCompleted,
    workoutMinutes,
    weightStart,
    weightEnd,
    weightChange,
    hydrationAvgMl,
    hydrationGoalMl,
    currentProteinStreak: streak,
    subscriptionPlan,
  };
}
