import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";
import DashboardClient from "./DashboardClient";
import { 
  getHoursSinceLastMeal, 
  shouldShowMealAlert,
  getMealTimingPreferences 
} from "@/lib/utils/meal-timing";
import { calculateStreaks } from "@/lib/utils/streaks";
import { logger } from "@/lib/logger";

async function getDashboardData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    logger.error("Profile error:", profileError);
    return null;
  }

  const userProfile = { 
    ...profile as {
      full_name: string | null;
      daily_protein_target_g: number;
      current_weight_kg: number;
      dose_day_of_week: number | null;
      medication_type?: string | null;
      glp1_medication?: string | null;
      [key: string]: unknown;
    },
    id: user.id 
  };

  // Check if onboarding is completed
  if (!userProfile.daily_protein_target_g) {
    redirect("/onboarding");
  }

  // Get date ranges
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Parallelize all database queries for faster loading
  const [
    { data: todayProteinLogs, error: proteinError },
    { data: weekProteinLogs, error: weekProteinError },
    { data: weekWorkouts, error: weekWorkoutsError },
    { data: latestWeight, error: weightError },
    { data: allProteinLogs },
    { data: allWorkouts },
    mealTimingPrefs,
    hoursSinceLastMeal,
  ] = await Promise.all([
    // Today's protein logs
    supabase
      .from("protein_logs")
      .select("id, food_name, protein_grams, meal_type, logged_at, date")
      .eq("user_id", user.id)
      .gte("date", format(todayStart, "yyyy-MM-dd"))
      .lte("date", format(todayEnd, "yyyy-MM-dd"))
      .order("logged_at", { ascending: false }),
    
    // This week's protein logs (only need date + protein for chart)
    supabase
      .from("protein_logs")
      .select("date, protein_grams")
      .eq("user_id", user.id)
      .gte("date", format(weekStart, "yyyy-MM-dd"))
      .lte("date", format(weekEnd, "yyyy-MM-dd")),
    
    // This week's workouts (only need timestamps + workout name)
    supabase
      .from("workout_sessions")
      .select("id, started_at, completed_at, workout_id")
      .eq("user_id", user.id)
      .gte("started_at", weekStart.toISOString())
      .lte("started_at", weekEnd.toISOString())
      .not("completed_at", "is", null),
    
    // Latest weight logs
    supabase
      .from("weight_logs")
      .select("id, weight_kg, logged_at, notes")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(2),
    
    // All protein logs for streaks
    supabase
      .from("protein_logs")
      .select("date, protein_grams")
      .eq("user_id", user.id)
      .order("date", { ascending: true }),
    
    // All workouts for streaks
    supabase
      .from("workout_sessions")
      .select("completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: true }),
    
    // Meal timing preferences
    getMealTimingPreferences(supabase, user.id),
    
    // Hours since last meal
    getHoursSinceLastMeal(supabase, user.id),
  ]);

  // Log errors (non-blocking)
  if (proteinError?.message) logger.error("Protein logs error:", proteinError.message);
  if (weekProteinError?.message) logger.error("Week protein logs error:", weekProteinError.message);
  if (weekWorkoutsError?.message) logger.error("Week workouts error:", weekWorkoutsError.message);
  if (weightError?.message) logger.error("Weight error:", weightError.message);

  // Check meal alert (depends on preferences and hours)
  const showMealAlert = mealTimingPrefs.enabled && 
    shouldShowMealAlert(hoursSinceLastMeal, mealTimingPrefs.thresholdHours);

  // Calculate streaks (pure computation — no extra DB calls)
  const streaks = calculateStreaks({
    userId: user.id,
    proteinLogs: (allProteinLogs || []).map((log: { date: string; protein_grams: number }) => ({
      date: log.date.slice(0, 10),
      proteinGrams: log.protein_grams,
    })),
    proteinGoal: userProfile.daily_protein_target_g,
    workoutSessions: (allWorkouts || []).map((workout: { completed_at: string | null }) => ({
      completedAt: new Date(workout.completed_at!),
    })),
  });

  // Check if hit goal today
  const todayTotal = (todayProteinLogs || []).reduce(
    (sum, log: { protein_grams: number }) => sum + log.protein_grams,
    0
  );
  const hitGoalToday = todayTotal >= userProfile.daily_protein_target_g;

  return {
    profile: {
      id: userProfile.id,
      full_name: userProfile.full_name,
      daily_protein_target_g: userProfile.daily_protein_target_g,
      current_weight_kg: userProfile.current_weight_kg,
      dose_day_of_week: userProfile.dose_day_of_week,
      medication_type: userProfile.medication_type ?? null,
      glp1_medication: userProfile.glp1_medication ?? null,
    },
    todayProteinLogs: todayProteinLogs || [],
    weekProteinLogs: weekProteinLogs || [],
    weekWorkouts: weekWorkouts || [],
    latestWeights: latestWeight || [],
    mealTiming: {
      hoursSinceLastMeal,
      showAlert: showMealAlert,
      preferences: mealTimingPrefs,
    },
    streaks,
    hitGoalToday,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-danger">Error loading dashboard data</p>
      </div>
    );
  }

  return <DashboardClient data={data} />;
}
