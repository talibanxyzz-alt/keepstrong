import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import WorkoutTracker from "@/components/features/WorkoutTracker";
import Link from "next/link";

export const metadata = { title: "Active Workout | KeepStrong" };

export default async function ActiveWorkoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Get active (incomplete) session
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id, workout_id, started_at, timer_started_at")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-12 text-center sm:min-h-[50vh] sm:py-20">
        <div className="w-full rounded-lg border border-dashed border-line-strong bg-surface p-10 shadow-sm sm:p-12">
          <p className="font-semibold text-charcoal">No active workout</p>
          <p className="mt-1 text-sm text-slate">Choose a program and start a session to log sets here.</p>
          <Link
            href="/workouts/programs"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-charcoal px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90"
          >
            Browse programs
          </Link>
        </div>
      </div>
    );
  }

  // Get the workout + exercises
  const { data: workout } = await supabase
    .from("workouts")
    .select(`
      id, name,
      exercises(
        id, name, description, image_url, target_sets, target_reps_min, target_reps_max,
        rest_seconds, order_in_workout
      )
    `)
    .eq("id", session.workout_id!)
    .single();

  if (!workout) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center py-16">
        <p className="text-sm text-danger">Could not load workout data.</p>
      </div>
    );
  }

  // Get sets already logged this session
  const { data: loggedSets } = await supabase
    .from("exercise_sets")
    .select("id, exercise_id, set_number, weight_kg, reps_completed")
    .eq("session_id", session.id);

  return (
    <div className="mx-auto max-w-5xl">
      <WorkoutTracker
        session={{
          ...session,
          workout_id: session.workout_id!,
          started_at: session.started_at!,
          timer_started_at: session.timer_started_at,
        }}
        workout={workout as { id: string; name: string; exercises: { id: string; name: string; description: string | null; image_url: string | null; target_sets: number; target_reps_min: number; target_reps_max: number; rest_seconds: number; order_in_workout: number }[] }}
        loggedSets={loggedSets || []}
        userId={user.id}
      />
    </div>
  );
}
