"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ChevronLeft, TrendingDown, TrendingUp, Target, Dumbbell, Flame, Ruler } from "lucide-react";
import Link from "next/link";
import { format, subDays, startOfWeek, endOfWeek, isAfter, isBefore } from "date-fns";
import WeightLogger from "@/components/features/WeightLogger";
import PhotoUpload from "@/components/features/PhotoUpload";
import ProgressSubNav from "@/app/progress/ProgressSubNav";
import type { Database } from "@/types/database.types";

type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
type ProteinLog = Database["public"]["Tables"]["protein_logs"]["Row"];
type WorkoutSession = Database["public"]["Tables"]["workout_sessions"]["Row"];
type ExerciseSet = Database["public"]["Tables"]["exercise_sets"]["Row"] & {
  exercises?: { name: string } | null;
};
type ProgressPhoto = Database["public"]["Tables"]["progress_photos"]["Row"];

// Lazy load Recharts to improve initial page load
const WeightChart = dynamic(
  () => import("@/components/features/WeightChart").then((mod) => mod.WeightChart),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center bg-cloud rounded-lg">
        <p className="text-slate">Loading chart...</p>
      </div>
    )
  }
);

interface ProgressData {
  profile: { daily_protein_target_g: number | null } | null;
  weightLogs: WeightLog[];
  proteinLogs: ProteinLog[];
  workoutSessions: WorkoutSession[];
  exerciseSets: ExerciseSet[];
  progressPhotos: ProgressPhoto[];
  bodyMeasurements: { measured_at: string; waist_cm: number | null }[];
  mealTimingAnalytics: {
    avgMealsPerDay: number;
    maxGapHours: number;
    daysWithEnoughMeals: number;
    daysTracked: number;
    status: 'good' | 'warning' | 'poor';
    message: string;
    isOnTarget: boolean;
  };
  userId: string;
}

type TabType = "weekly" | "monthly" | "alltime";

export default function ProgressClient({ data }: { data: ProgressData }) {
  const [activeTab, setActiveTab] = useState<TabType>("weekly");
  const router = useRouter();
  const { profile, weightLogs, proteinLogs, workoutSessions, exerciseSets, mealTimingAnalytics, bodyMeasurements } =
    data;

  const measurementsSummary = useMemo(() => {
    const bm = bodyMeasurements;
    if (!bm.length) {
      return { latestDate: null as string | null, waistLine: null as string | null };
    }
    const latestDate = bm[bm.length - 1]?.measured_at ?? null;
    const firstWaist = bm.find((r) => r.waist_cm != null)?.waist_cm ?? null;
    const lastWaist = [...bm].reverse().find((r) => r.waist_cm != null)?.waist_cm ?? null;
    let waistLine: string | null = null;
    if (firstWaist != null && lastWaist != null) {
      const diff = firstWaist - lastWaist;
      if (Math.abs(diff) < 0.05) {
        waistLine = "No waist change yet";
      } else if (diff > 0) {
        waistLine = `−${diff.toFixed(1)} cm since start`;
      } else {
        waistLine = `+${Math.abs(diff).toFixed(1)} cm since start`;
      }
    } else if (lastWaist == null) {
      waistLine = "Log waist to see trend";
    }
    return { latestDate, waistLine };
  }, [bodyMeasurements]);

  const proteinTarget = profile?.daily_protein_target_g || 150;

  // Calculate weekly data
  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    // Weight data
    const weekWeights = weightLogs.filter((log) => {
      if (!log.logged_at) return false;
      const date = new Date(log.logged_at);
      return isAfter(date, weekStart) && isBefore(date, weekEnd);
    });

    const currentWeight = weightLogs[weightLogs.length - 1]?.weight_kg;
    const previousWeight = weightLogs[weightLogs.length - 2]?.weight_kg;
    const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : 0;

    // Protein data
    const weekProtein = proteinLogs.filter((log) => {
      if (!log.date) return false;
      const date = new Date(log.date);
      return isAfter(date, weekStart) && isBefore(date, weekEnd);
    });

    const proteinByDay = weekProtein.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = 0;
      acc[log.date] += log.protein_grams;
      return acc;
    }, {} as Record<string, number>);

    const daysWithProtein = Object.keys(proteinByDay);
    const avgProtein = daysWithProtein.length > 0
      ? Math.round(Object.values(proteinByDay).reduce((a: number, b: number) => a + b, 0) / daysWithProtein.length)
      : 0;

    const daysHitGoal = Object.values(proteinByDay).filter((total) => total >= proteinTarget).length;

    // Workout data
    const weekWorkouts = workoutSessions.filter((session) => {
      if (!session.started_at) return false;
      const date = new Date(session.started_at);
      return isAfter(date, weekStart) && isBefore(date, weekEnd);
    });

    // Weight chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayStr = format(day, "yyyy-MM-dd");
      const dayWeights = weightLogs.filter((log) => 
        log.logged_at && format(new Date(log.logged_at), "yyyy-MM-dd") === dayStr
      );
      const weight = dayWeights[dayWeights.length - 1]?.weight_kg;

      if (weight) {
        chartData.push({
          day: format(day, "EEE")[0],
          weight: weight,
          fullDate: format(day, "MMM d"),
        });
      }
    }

    return {
      dateRange: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
      currentWeight,
      weightChange,
      avgProtein,
      proteinPercentage: Math.round((avgProtein / proteinTarget) * 100),
      workoutsCompleted: weekWorkouts.length,
      daysHitGoal,
      totalDays: 7,
      chartData,
    };
  };

  // Calculate monthly data
  const getMonthlyData = () => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthProtein = proteinLogs.filter((log) => {
      if (!log.date) return false;
      const date = new Date(log.date);
      return isAfter(date, monthStart) && isBefore(date, monthEnd);
    });

    const proteinByDay = monthProtein.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = 0;
      acc[log.date] += log.protein_grams;
      return acc;
    }, {} as Record<string, number>);

    const daysWithProtein = Object.keys(proteinByDay);
    const avgProtein = daysWithProtein.length > 0
      ? Math.round(Object.values(proteinByDay).reduce((a: number, b: number) => a + b, 0) / daysWithProtein.length)
      : 0;

    const daysHitGoal = Object.values(proteinByDay).filter((total) => total >= proteinTarget).length;

    const monthWorkouts = workoutSessions.filter((session) => {
      if (!session.started_at) return false;
      const date = new Date(session.started_at);
      return isAfter(date, monthStart) && isBefore(date, monthEnd);
    });

    const currentWeight = weightLogs[weightLogs.length - 1]?.weight_kg;
    const monthStartWeight = weightLogs.find((log) => {
      if (!log.logged_at) return false;
      const date = new Date(log.logged_at);
      return isAfter(date, monthStart);
    })?.weight_kg;
    const weightChange = currentWeight && monthStartWeight ? currentWeight - monthStartWeight : 0;

    return {
      dateRange: format(monthStart, "MMMM yyyy"),
      currentWeight,
      weightChange,
      avgProtein,
      proteinPercentage: Math.round((avgProtein / proteinTarget) * 100),
      workoutsCompleted: monthWorkouts.length,
      daysHitGoal,
      totalDays: monthEnd.getDate(),
    };
  };

  // Calculate all-time data
  const getAllTimeData = () => {
    const firstWeight = weightLogs[0]?.weight_kg;
    const currentWeight = weightLogs[weightLogs.length - 1]?.weight_kg;
    const totalWeightLost = firstWeight && currentWeight ? firstWeight - currentWeight : 0;

    const proteinByDay = proteinLogs.reduce((acc, log) => {
      if (!acc[log.date]) acc[log.date] = 0;
      acc[log.date] += log.protein_grams;
      return acc;
    }, {} as Record<string, number>);

    const daysWithProtein = Object.keys(proteinByDay);
    const avgProtein = daysWithProtein.length > 0
      ? Math.round(Object.values(proteinByDay).reduce((a: number, b: number) => a + b, 0) / daysWithProtein.length)
      : 0;

    // Calculate longest streak
    let currentStreak = 0;
    let longestStreak = 0;
    const sortedDays = daysWithProtein.sort();

    sortedDays.forEach((day, index) => {
      const dailyTotal = proteinByDay[day];
      if (dailyTotal >= proteinTarget) {
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }
    });

    // Get PRs (personal records) - highest weight for each exercise
    const exercisePRs: Record<string, { weight: number; reps: number }> = {};
    exerciseSets.forEach((set: ExerciseSet) => {
      const exerciseName = set.exercises?.name;
      if (!exerciseName) return;

      if (!exercisePRs[exerciseName] || set.weight_kg > exercisePRs[exerciseName].weight) {
        exercisePRs[exerciseName] = {
          weight: set.weight_kg,
          reps: set.reps_completed,
        };
      }
    });

    return {
      totalWeightLost,
      totalWorkouts: workoutSessions.length,
      totalProteinLogs: proteinLogs.length,
      avgProtein,
      longestStreak,
      exercisePRs,
    };
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  const allTimeData = getAllTimeData();

  const currentData = activeTab === "weekly" ? weeklyData : activeTab === "monthly" ? monthlyData : null;

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate hover:text-charcoal"
          >
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-charcoal">Progress</h1>
        </div>

        <ProgressSubNav />

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-line">
          <nav className="-mb-px flex gap-8">
            {[
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "alltime", label: "All Time" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-charcoal text-charcoal"
                    : "border-transparent text-slate hover:border-line-strong hover:text-charcoal"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Weight + body measurements */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <WeightLogger
            userId={data.userId}
            initialLogs={weightLogs.slice(0, 7).reverse()}
            onUpdate={() => {
              // Optionally trigger a re-fetch or use router.refresh()
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          />
          <div className="rounded-lg border border-line bg-surface p-5">
            <div className="mb-3 flex items-center gap-2">
              <Ruler className="h-5 w-5 text-slate/60" />
              <h3 className="text-sm font-medium text-slate">Body Measurements</h3>
            </div>
            <p className="mb-1 text-xs text-slate">Last logged</p>
            <p className="mb-4 font-mono text-lg font-semibold text-charcoal">
              {measurementsSummary.latestDate
                ? format(new Date(measurementsSummary.latestDate + "T12:00:00"), "MMM d, yyyy")
                : "—"}
            </p>
            <p className="mb-1 text-xs text-slate">Waist</p>
            <p className="mb-6 font-mono text-lg font-semibold text-charcoal">
              {measurementsSummary.waistLine ?? "—"}
            </p>
            <button
              type="button"
              onClick={() => router.push("/progress/measurements")}
              className="w-full bg-black text-white rounded-xl px-6 py-3 font-semibold hover:bg-gray-900 transition-colors sm:w-auto"
            >
              Log Measurements
            </button>
          </div>
        </div>

        {/* Weekly/Monthly View */}
        {(activeTab === "weekly" || activeTab === "monthly") && currentData && (
          <div>
            {/* Date Range Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-charcoal">{currentData.dateRange}</h2>
            </div>

            {/* Summary Cards */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Current Weight */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Current Weight</h3>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {currentData.currentWeight?.toFixed(1) || "N/A"}
                    <span className="text-lg text-slate">kg</span>
                  </span>
                  {currentData.weightChange !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-slate`}
                    >
                      {currentData.weightChange < 0 ? (
                        <TrendingDown className="h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                      <span className="font-mono text-lg font-semibold">
                        {Math.abs(currentData.weightChange).toFixed(1)}kg
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Avg Protein */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Avg Protein</h3>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {currentData.avgProtein}
                    <span className="text-lg text-slate">g/day</span>
                  </span>
                  <span className="font-mono text-lg font-semibold text-charcoal">
                    {currentData.proteinPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-charcoal"
                    style={{ width: `${Math.min(currentData.proteinPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Workouts */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Workouts</h3>
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-6 w-6 text-slate/60" />
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {currentData.workoutsCompleted}
                  </span>
                </div>
              </div>

              {/* Meal Consistency (Weekly only) */}
              {activeTab === "weekly" && (
                <div className="rounded-lg border border-line bg-surface p-5">
                  <h3 className="mb-4 text-sm font-semibold text-charcoal">Meal Consistency</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate">Avg meals per day</span>
                        <span className="font-mono font-semibold text-charcoal">
                          {mealTimingAnalytics.avgMealsPerDay.toFixed(1)}
                        </span>
                      </div>
                      <div className="text-xs text-slate">
                        Target: 3-4 meals/day
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate">Longest gap</span>
                        <span className="font-mono font-semibold text-charcoal">
                          {mealTimingAnalytics.maxGapHours}h
                        </span>
                      </div>
                      <div className="text-xs text-slate">
                        Keep gaps under 6h when awake
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate">Days with 3+ meals</span>
                        <span className="font-mono font-semibold text-charcoal">
                          {mealTimingAnalytics.daysWithEnoughMeals}/7
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {mealTimingAnalytics.daysWithEnoughMeals < 5 && (
                    <p className="mt-3 text-xs text-slate border-t border-line/60 pt-3">
                      More frequent, smaller meals help preserve muscle during weight loss. Aim for 3–4 protein-rich meals per day.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Weight Chart (Weekly only) */}
            {activeTab === "weekly" && weeklyData.chartData.length > 0 && (
              <div className="mb-8 rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-4 text-lg font-semibold text-charcoal">Weight Trend</h3>
                <WeightChart data={weeklyData.chartData} />
              </div>
            )}

            {/* Protein Consistency */}
            <div className="mb-8 rounded-lg border border-line bg-surface p-5">
              <h3 className="mb-4 text-lg font-semibold text-charcoal">Protein Consistency</h3>
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate">Days hit goal</span>
                  <span className="font-mono font-semibold text-charcoal">
                    {currentData.daysHitGoal} / {currentData.totalDays}
                  </span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-charcoal"
                    style={{
                      width: `${(currentData.daysHitGoal / currentData.totalDays) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Time View */}
        {activeTab === "alltime" && (
          <div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Total Weight Lost */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Total Weight Lost</h3>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-6 w-6 text-slate/60" />
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {allTimeData.totalWeightLost.toFixed(1)}
                    <span className="text-lg text-slate">kg</span>
                  </span>
                </div>
              </div>

              {/* Total Workouts */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Total Workouts</h3>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-slate/60" />
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {allTimeData.totalWorkouts}
                  </span>
                </div>
              </div>

              {/* Avg Protein */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Avg Protein/Day</h3>
                <div className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-slate/60" />
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {allTimeData.avgProtein}
                    <span className="text-lg text-slate">g</span>
                  </span>
                </div>
              </div>

              {/* Longest Streak */}
              <div className="rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-2 text-sm font-medium text-slate">Longest Streak</h3>
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-slate/60" />
                  <span className="font-mono text-3xl font-bold text-charcoal">
                    {allTimeData.longestStreak}
                    <span className="text-lg text-slate"> days</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Records */}
            {Object.keys(allTimeData.exercisePRs).length > 0 && (
              <div className="mt-8 rounded-lg border border-line bg-surface p-5">
                <h3 className="mb-4 text-lg font-semibold text-charcoal">Personal Records</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(allTimeData.exercisePRs).map(([exercise, pr]) => (
                    <div
                      key={exercise}
                      className="flex items-center justify-between py-2.5 border-b border-line/60 last:border-0"
                    >
                      <span className="font-medium text-charcoal">{exercise}</span>
                      <span className="font-mono text-lg font-bold text-charcoal">
                        {pr.weight}kg × {pr.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Photos Section (visible on all tabs) */}
        <div className="mt-12 border-t border-line pt-8">
          <PhotoUpload userId={data.userId} existingPhotos={data.progressPhotos} />
        </div>
      </div>
    </div>
  );
}

