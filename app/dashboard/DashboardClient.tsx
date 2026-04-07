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
  UtensilsCrossed,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuickAddFood from "@/components/features/QuickAddFood";
import MealTimingAlert from "@/components/features/MealTimingAlert";
import { DoseDayBanner } from "@/components/features/DoseDayBanner";
import { DoseNudgeBanner } from "@/components/features/DoseNudgeBanner";
import { getDoseStatus } from "@/lib/dose/getDoseStatus";
import { getDaysSinceDose } from "@/lib/utils/dose-day";
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
  const todayDow = new Date().getDay();
  const dosePhaseBannerVisible =
    profile.dose_day_of_week !== null &&
    getDaysSinceDose({
      doseDay: profile.dose_day_of_week,
      todayDayOfWeek: todayDow,
    }) <= 2;
  const showDoseNudge = doseStatus !== "normal" && !dosePhaseBannerVisible;

  const lastMealLog = todayProteinLogs[0];
  const lastMealTime =
    lastMealLog?.logged_at != null
      ? format(new Date(lastMealLog.logged_at), "h:mm a")
      : null;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

        {/* Header — editorial, no decorative blurs */}
        <header className="border-b border-line/80 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal sm:text-3xl">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          {lastMealTime ? (
            <p className="mt-2 text-xs text-slate/80">Last meal logged at {lastMealTime}</p>
          ) : null}
        </header>

        {showDoseNudge ? (
          <DoseNudgeBanner status={doseStatus} medicationName={medicationLabel} />
        ) : null}

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

        {/* Single “this week at a glance” strip — both streaks, one surface */}
        <section
          className="rounded-xl border border-line bg-surface px-4 py-5 sm:px-6"
          aria-label="Streaks and weekly summary"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate">This week at a glance</p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-0">
            <div className="flex flex-1 items-start gap-3 sm:pr-6">
              <Flame className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate">Protein streak</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-charcoal">
                  {streaks.proteinStreak}{" "}
                  <span className="text-base font-normal text-slate">
                    {streaks.proteinStreak === 1 ? "day" : "days"}
                  </span>
                </p>
                {streaks.proteinStreak > 0 && streaks.proteinStreak < 7 && (
                  <p className="mt-1 text-xs text-slate/70">{7 - streaks.proteinStreak} to 7-day milestone</p>
                )}
                {streaks.proteinStreak >= 7 && (
                  <p className="mt-1 text-xs text-slate/70">Best run: {streaks.proteinBestStreak} days</p>
                )}
              </div>
            </div>
            <div className="hidden w-px shrink-0 bg-line sm:block" aria-hidden />
            <div className="flex flex-1 items-start gap-3 sm:pl-6">
              <Dumbbell className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate">Workout streak</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-charcoal">
                  {streaks.workoutStreak}{" "}
                  <span className="text-base font-normal text-slate">
                    {streaks.workoutStreak === 1 ? "week" : "weeks"}
                  </span>
                </p>
                {streaks.workoutStreak > 0 && streaks.workoutStreak < 4 && (
                  <p className="mt-1 text-xs text-slate/70">{4 - streaks.workoutStreak} to 4-week milestone</p>
                )}
                {streaks.workoutStreak >= 4 && (
                  <p className="mt-1 text-xs text-slate/70">Best run: {streaks.workoutBestStreak} weeks</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line/70 pt-4 text-sm">
            {streaks.proteinStreak === 0 && (
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="font-medium text-primary hover:text-primary-hover"
              >
                Log protein to start
              </button>
            )}
            {streaks.workoutStreak === 0 && (
              <Link href="/workouts" className="font-medium text-primary hover:text-primary-hover">
                Start a workout
              </Link>
            )}
            <Link href="/progress" className="text-slate hover:text-charcoal">
              Full progress →
            </Link>
          </div>
        </section>

        {/* Plain coach note — no icon tile */}
        <aside className="rounded-lg border-l-4 border-l-charcoal/20 bg-surface px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-slate">Note for today</p>
          <p className="mt-1 text-sm leading-relaxed text-charcoal/90">{dailyTip}</p>
        </aside>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Protein card — spans 2 cols */}
          <div className="rounded-2xl border border-line/90 bg-surface p-6 shadow-card md:col-span-2 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <Apple className="mt-0.5 h-5 w-5 shrink-0 text-charcoal/70" aria-hidden />
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
                  className="h-full rounded-full bg-primary transition-all duration-500"
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
                <Dumbbell className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <h2 className="font-semibold text-charcoal">Workouts</h2>
              </div>
              <div className="mb-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums text-charcoal">{weekWorkouts.length}</span>
                <span className="text-sm text-slate">this week</span>
              </div>
              <p className="mb-4 text-xs text-slate">Target: 3 sessions</p>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-cloud ring-1 ring-line/60">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
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

        {/* Quick actions — compact row, less “card grid” */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate">Shortcuts</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-charcoal transition hover:border-charcoal/20 hover:bg-cloud/50"
            >
              <Apple className="h-4 w-4 text-charcoal/70" aria-hidden />
              Log meal
            </button>
            <button
              type="button"
              onClick={() => router.push("/workouts")}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-charcoal transition hover:border-charcoal/20 hover:bg-cloud/50"
            >
              <Dumbbell className="h-4 w-4 text-primary" aria-hidden />
              Workout
            </button>
            <button
              type="button"
              onClick={() => router.push("/progress")}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-charcoal transition hover:border-charcoal/20 hover:bg-cloud/50"
            >
              <Scale className="h-4 w-4 text-slate" aria-hidden />
              Weight
            </button>
            <button
              type="button"
              onClick={() => router.push("/photos")}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-charcoal transition hover:border-charcoal/20 hover:bg-cloud/50"
            >
              <Camera className="h-4 w-4 text-slate" aria-hidden />
              Photo
            </button>
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
