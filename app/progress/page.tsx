import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { subDays, subMonths, startOfWeek, endOfWeek, format } from "date-fns";
import ProgressClient from "./ProgressClient";
import { getMealTimingAnalytics } from "@/lib/utils/meal-timing";

async function getProgressData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const today = new Date();

  // Get profile for protein target
  const { data: profile } = await supabase
    .from("profiles")
    .select("daily_protein_target_g")
    .eq("id", user.id)
    .single();

  // Fetch all weight logs
  const { data: weightLogs } = await supabase
    .from("weight_logs")
    .select("id, user_id, weight_kg, logged_at, notes, created_at")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true });

  // Fetch all protein logs
  const { data: proteinLogs } = await supabase
    .from("protein_logs")
    .select("id, user_id, date, food_name, protein_grams, meal_type, logged_at, created_at, notes")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  // Fetch all workout sessions
  const { data: workoutSessions } = await supabase
    .from("workout_sessions")
    .select("id, user_id, workout_id, started_at, completed_at, notes, duration_minutes, energy_level, nausea_level, overall_feeling, is_dose_day, dose_day_offset, created_at, workouts(name)")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: true });

  // Fetch exercise sets for strength tracking
  const { data: exerciseSets } = await supabase
    .from("exercise_sets")
    .select(`
      *,
      exercises(name),
      workout_sessions!inner(user_id)
    `)
    .eq("workout_sessions.user_id", user.id)
    .order("created_at", { ascending: true });

  // Fetch progress photos
  const { data: progressPhotos } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: false });

  // Body measurements (waist trend + last date)
  const { data: bodyMeasurements } = await supabase
    .from("body_measurements")
    .select("measured_at, waist_cm")
    .eq("user_id", user.id)
    .order("measured_at", { ascending: true });

  // Fetch meal timing analytics
  const mealTimingAnalytics = await getMealTimingAnalytics(supabase, user.id, 7);

  return {
    profile,
    weightLogs: weightLogs || [],
    proteinLogs: proteinLogs || [],
    workoutSessions: workoutSessions || [],
    exerciseSets: exerciseSets || [],
    progressPhotos: progressPhotos || [],
    bodyMeasurements: bodyMeasurements || [],
    mealTimingAnalytics,
    userId: user.id,
  };
}

export default async function ProgressPage() {
  const data = await getProgressData();

  return <ProgressClient data={data} />;
}

