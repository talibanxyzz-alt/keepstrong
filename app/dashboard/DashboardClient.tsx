"use client";

import { format } from "date-fns";
import {
  Plus,
  Dumbbell,
  X,
  Flame,
  Apple,
  Scale,
  ChevronRight,
  Camera,
  Lightbulb,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuickAddFood from "@/components/features/QuickAddFood";
import MealTimingAlert from "@/components/features/MealTimingAlert";
import { DoseDayBanner } from "@/components/features/DoseDayBanner";
import { DoseNudgeBanner } from "@/components/features/DoseNudgeBanner";
import { getDoseStatus } from "@/lib/dose/getDoseStatus";
import { HydrationTracker } from "@/components/features/HydrationTracker";
import { SideEffectCheckIn } from "@/components/features/SideEffectCheckIn";
import { usePostMealPrompts } from "@/hooks/usePostMealPrompts";
import { checkAchievements, Achievement } from "@/lib/utils/achievements";
import dynamic from "next/dynamic";

const PostMealRatingPrompt = dynamic(
  () => import("@/components/features/PostMealRatingPrompt").then((mod) => mod.PostMealRatingPrompt),
  { ssr: false }
);

const AchievementUnlocked = dynamic(
  () => import("@/components/features/AchievementUnlocked").then((mod) => mod.AchievementUnlocked),
  { ssr: false }
);
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import Link from "next/link";

interface DashboardData {
  profile: {
    full_name: string | null;
    daily_protein_target_g: number;
    current_weight_kg: number;
    dose_day_of_week: number | null;
    id?: string;
    medication_type?: string | null;
    glp1_medication?: string | null;
  };
  todayProteinLogs: Array<{
    id: string;
    food_name: string;
    protein_grams: number;
    meal_type: string | null;
    logged_at: string | null;
  }>;
  weekProteinLogs: Array<{
    date: string;
    protein_grams: number;
  }>;
  weekWorkouts: Array<{
    id: string;
    completed_at: string | null;
  }>;
  latestWeights: Array<{
    weight_kg: number;
    logged_at: string | null;
  }>;
  mealTiming: {
    hoursSinceLastMeal: number;
    showAlert: boolean;
    preferences: {
      enabled: boolean;
      thresholdHours: number;
    };
  };
  streaks: {
    proteinStreak: number;
    workoutStreak: number;
    proteinBestStreak: number;
    workoutBestStreak: number;
  };
  hitGoalToday: boolean;
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { profile, todayProteinLogs, weekProteinLogs, weekWorkouts, latestWeights, mealTiming, streaks, hitGoalToday } = data;
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [showMealAlert, setShowMealAlert] = useState(mealTiming.showAlert);
  const router = useRouter();

  const { pendingPrompts } = usePostMealPrompts();

  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [shownAchievements, setShownAchievements] = useState<string[]>([]);
  const supabase = createClient();

  const tips = [
    "The 48-72 hours after your injection tend to be the roughest — keep protein high even if you're not hungry. Small meals count.",
    "Days 6 and 7 of your dose cycle are usually your best training days. That's when most people feel strongest.",
    "0.8g of protein per pound of bodyweight is the floor, not the ceiling. Aim higher if you can manage it.",
    "When you can hit 3 sets of 12 with good form, bump the weight up slightly. That's how you keep making progress.",
    "GLP-1 meds blunt thirst as much as hunger. Set a reminder to drink — don't wait until you feel thirsty.",
  ];
  const dailyTip = tips[new Date().getDate() % tips.length];

  useEffect(() => {
    async function checkForNewAchievements() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', user.id);

        const list = (userAchievements ?? []) as { achievement_id: string }[];
        const previouslyShown = list.map((a) => a.achievement_id);
        setShownAchievements(previouslyShown);

        const stats = {
          proteinStreak: streaks.proteinStreak,
          workoutCount: weekWorkouts.length,
          workoutStreak: streaks.workoutStreak,
          photoCount: 0,
          weightLogCount: latestWeights.length,
          strengthGains: 0,
        };

        const unlocked = checkAchievements(stats);
        if (!Array.isArray(unlocked)) return;

        const newAchievement = unlocked.find(a => !previouslyShown.includes(a.id));
        if (newAchievement) setUnlockedAchievement(newAchievement);
      } catch (error) {
        logger.error('Error checking achievements:', error);
      }
    }
    checkForNewAchievements();
  }, [streaks, weekWorkouts.length, latestWeights.length, supabase]);

  const handleAchievementClose = async () => {
    if (!unlockedAchievement) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      type UARow = { id: string };
      type UAInsert = { user_id: string; achievement_id: string; id?: string };

      // @ts-expect-error: postgrest-js v2.x type inference incompatibility
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', unlockedAchievement.id)
        .maybeSingle() as Promise<{ data: UARow | null; error: unknown }>;

      if (!existing) {
        const newRow = { user_id: user.id, achievement_id: unlockedAchievement.id } satisfies UAInsert;
        await supabase.from('user_achievements').insert(newRow);
      }

      setShownAchievements([...shownAchievements, unlockedAchievement.id]);
      setUnlockedAchievement(null);
    } catch (error) {
      logger.error('Error saving achievement:', error);
    }
  };

  const todayTotal = todayProteinLogs.reduce((sum, log) => sum + log.protein_grams, 0);

  const weeklyProteinByDay = weekProteinLogs.reduce((acc, log) => {
    acc[log.date] = (acc[log.date] || 0) + log.protein_grams;
    return acc;
  }, {} as Record<string, number>);

  const daysWithProtein = Object.keys(weeklyProteinByDay).length;
  const weeklyAvgProtein = daysWithProtein > 0
    ? Math.round(Object.values(weeklyProteinByDay).reduce((a, b) => a + b, 0) / daysWithProtein)
    : 0;

  const currentWeight = latestWeights[0]?.weight_kg || profile.current_weight_kg;
  const previousWeight = latestWeights[1]?.weight_kg;
  const weightChange = previousWeight ? currentWeight - previousWeight : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile.full_name?.split(" ")[0] || "there";

  const proteinPct = Math.min(Math.round((todayTotal / profile.daily_protein_target_g) * 100), 100);
  const remaining = profile.daily_protein_target_g - todayTotal;

  const doseStatus = getDoseStatus(profile.dose_day_of_week ?? null);
  const medicationLabel = profile.medication_type ?? profile.glp1_medication ?? undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200/40 via-canvas to-cloud">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface p-6 shadow-card sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/[0.07] blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-warning/[0.08] blur-xl" />
          <div className="relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Today
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-charcoal sm:text-3xl">
                {greeting}, {firstName}
              </h1>
              <p className="mt-1 text-sm text-slate">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
        </div>

        <DoseNudgeBanner status={doseStatus} medicationName={medicationLabel} />

        {/* Alerts */}
        {showMealAlert && mealTiming.hoursSinceLastMeal > 0 && profile.id && (
          <MealTimingAlert
            userId={profile.id}
            hoursSinceLastMeal={mealTiming.hoursSinceLastMeal}
            onDismiss={() => setShowMealAlert(false)}
          />
        )}

        {streaks.proteinStreak > 0 && !hitGoalToday && (
          <div className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-charcoal">
            You have a {streaks.proteinStreak}-day protein streak — log today to keep it going.
          </div>
        )}

        {profile.dose_day_of_week !== null && (
          <DoseDayBanner
            doseDay={profile.dose_day_of_week}
            proteinGoal={profile.daily_protein_target_g}
          />
        )}

        {/* Streak row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15">
                <Flame className="h-4 w-4 text-warning" />
              </div>
              <span className="text-sm font-medium text-slate">Protein streak</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-charcoal">{streaks.proteinStreak}</span>
              <span className="text-slate">{streaks.proteinStreak === 1 ? 'day' : 'days'}</span>
            </div>
            {streaks.proteinStreak > 0 && streaks.proteinStreak < 7 && (
              <p className="text-xs text-slate/60 mt-2">{7 - streaks.proteinStreak} days to 7-day milestone</p>
            )}
            {streaks.proteinStreak >= 7 && (
              <p className="text-xs text-slate/60 mt-2">Best: {streaks.proteinBestStreak} days</p>
            )}
            {streaks.proteinStreak === 0 && (
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="mt-3 text-xs font-semibold text-primary hover:text-primary-hover"
              >
                Log protein to start →
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-slate">Workout streak</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-charcoal">{streaks.workoutStreak}</span>
              <span className="text-slate">{streaks.workoutStreak === 1 ? 'week' : 'weeks'}</span>
            </div>
            {streaks.workoutStreak > 0 && streaks.workoutStreak < 4 && (
              <p className="text-xs text-slate/60 mt-2">{4 - streaks.workoutStreak} weeks to 4-week milestone</p>
            )}
            {streaks.workoutStreak >= 4 && (
              <p className="text-xs text-slate/60 mt-2">Best: {streaks.workoutBestStreak} weeks</p>
            )}
            {streaks.workoutStreak === 0 && (
              <Link
                href="/workouts"
                className="mt-3 inline-block text-xs font-semibold text-primary hover:text-primary-hover"
              >
                Start a workout →
              </Link>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Protein card — spans 2 cols */}
          <div className="rounded-2xl border border-line/90 bg-surface p-6 shadow-card md:col-span-2 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-charcoal text-white shadow-sm">
                  <Apple className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">Today&apos;s protein</h2>
                  <p className="text-xs text-slate">Stay ahead of muscle loss on GLP-1</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-charcoal/90"
              >
                {isQuickAddOpen ? (
                  <>
                    <X className="h-4 w-4" /> Close
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add meal
                  </>
                )}
              </button>
            </div>

            {isQuickAddOpen && (
              <div className="mb-6 rounded-2xl border border-line bg-cloud/80 p-4 sm:p-5">
                <QuickAddFood onSuccess={() => setIsQuickAddOpen(false)} />
              </div>
            )}

            <div className="mb-6">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-5xl font-bold tabular-nums text-charcoal sm:text-6xl">{todayTotal}</span>
                <span className="text-lg text-slate sm:text-xl">/ {profile.daily_protein_target_g}g</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-cloud ring-1 ring-line/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-charcoal transition-all duration-500"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
              <p className="mt-3 text-sm font-medium text-slate">
                {todayTotal >= profile.daily_protein_target_g ? (
                  <span className="text-success">Goal reached today — great work.</span>
                ) : (
                  <>{remaining}g to go</>
                )}
              </p>
            </div>

            <div className="border-t border-line/70 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-charcoal">Today&apos;s meals</span>
                <Link
                  href="/dashboard/protein"
                  className="flex items-center gap-0.5 text-xs font-medium text-slate transition hover:text-primary"
                >
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {todayProteinLogs.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-line-strong bg-cloud/40 px-4 py-10 text-center sm:py-12">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-line">
                    <UtensilsCrossed className="h-6 w-6 text-slate" aria-hidden />
                  </div>
                  <p className="text-sm font-medium text-charcoal">Nothing logged yet today</p>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-slate">
                    Log meals as you go — small wins add up for your protein target.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQuickAddOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
                  >
                    <Plus className="h-4 w-4" />
                    Log your first meal
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayProteinLogs.slice(0, 3).map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between rounded-xl border border-line/80 bg-cloud/30 px-3 py-2.5 transition hover:bg-cloud/60"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate text-sm font-medium text-charcoal">{meal.food_name}</p>
                        <p className="text-xs text-slate/70">
                          {meal.meal_type ?? 'snack'} ·{' '}
                          {new Date(meal.logged_at ?? meal.id).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums text-charcoal">{meal.protein_grams}g</span>
                    </div>
                  ))}
                  {todayProteinLogs.length > 3 && (
                    <Link href="/dashboard/protein" className="block pt-1 text-xs text-slate hover:text-charcoal">
                      +{todayProteinLogs.length - 3} more meals
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* Workout card */}
            <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Dumbbell className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-semibold text-charcoal">Workouts</h2>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums text-charcoal">{weekWorkouts.length}</span>
                <span className="text-sm text-slate">this week</span>
              </div>
              <p className="mb-4 text-xs text-slate">Target: 3 sessions</p>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-cloud ring-1 ring-line/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                  style={{ width: `${Math.min((weekWorkouts.length / 3) * 100, 100)}%` }}
                />
              </div>
              <Link
                href="/workouts"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
              >
                Start workout
              </Link>
            </div>

            {profile.id && <HydrationTracker userId={profile.id} />}

            {profile.id && <SideEffectCheckIn userId={profile.id} />}

            {/* This week stats */}
            <div className="rounded-2xl border border-line/90 bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold text-charcoal">This week</h2>
                <Link href="/progress" className="text-xs font-medium text-slate transition hover:text-primary">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
                  <span className="text-sm text-slate">Avg protein</span>
                  <span className="text-sm font-bold tabular-nums text-charcoal">{weeklyAvgProtein}g / day</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate">Weight</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-charcoal">{currentWeight.toFixed(1)} kg</span>
                    {weightChange !== 0 && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                          weightChange < 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                        }`}
                      >
                        {weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate">Quick actions</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line/90 bg-surface px-3 py-4 text-center shadow-card transition hover:border-primary/25 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-charcoal text-white transition group-hover:scale-105">
                <Apple className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-charcoal">Log meal</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/workouts")}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line/90 bg-surface px-3 py-4 text-center shadow-card transition hover:border-primary/25 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:scale-105">
                <Dumbbell className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-charcoal">Start workout</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/progress")}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line/90 bg-surface px-3 py-4 text-center shadow-card transition hover:border-primary/25 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cloud text-charcoal ring-1 ring-line transition group-hover:scale-105">
                <Scale className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-charcoal">Log weight</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/photos")}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line/90 bg-surface px-3 py-4 text-center shadow-card transition hover:border-primary/25 hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/15 text-warning transition group-hover:scale-105">
                <Camera className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-charcoal">Add photo</span>
            </button>
          </div>
        </div>

        {/* Coach tip */}
        <div className="flex gap-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-5 shadow-sm sm:p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Today&apos;s tip</p>
            <p className="mt-1.5 text-sm leading-relaxed text-charcoal/90">{dailyTip}</p>
          </div>
        </div>

      </div>

      {pendingPrompts.length > 0 && (
        <PostMealRatingPrompt
          proteinLogId={pendingPrompts[0].proteinLogId}
          foodName={pendingPrompts[0].foodName}
          loggedAt={pendingPrompts[0].loggedAt}
        />
      )}

      {unlockedAchievement && (
        <AchievementUnlocked
          achievement={unlockedAchievement}
          onClose={handleAchievementClose}
        />
      )}
    </div>
  );
}
