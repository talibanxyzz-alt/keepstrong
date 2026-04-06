import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import ProgramCard from "./ProgramCard";
import { DoseNudgeBanner } from "@/components/features/DoseNudgeBanner";
import { getDoseStatus } from "@/lib/dose/getDoseStatus";

export const metadata = { title: "Workout Programs | KeepStrong" };

const LIGHT_SESSIONS = [
  {
    name: "Gentle Mobility Flow",
    duration: "15 min",
    intensity: "Very light",
    tag: "Recommended",
  },
  {
    name: "Easy Walk",
    duration: "20–30 min",
    intensity: "Low intensity",
    tag: "Recommended",
  },
  {
    name: "Upper Body Light",
    duration: "25 min",
    intensity: "Light weights only",
    tag: "Optional",
  },
  {
    name: "Full Rest Day",
    duration: "—",
    intensity: "Recovery",
    tag: "Valid choice",
  },
] as const;

type ExerciseRow = {
  id: string;
  name: string;
  target_sets: number | null;
  rest_seconds: number | null;
  order_in_workout: number | null;
  image_url: string | null;
};

type WorkoutRow = {
  id: string;
  name: string;
  description: string | null;
  order_in_program: number;
  exercises: ExerciseRow[];
};

export default async function ProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: programs } = await supabase
    .from("workout_programs")
    .select(
      `
      id, name, description, difficulty_level, workouts_per_week,
      workouts(
        id, name, description, order_in_program,
        exercises(
          id, name, target_sets, rest_seconds, order_in_workout, image_url
        )
      )
    `
    )
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_program_id, dose_day_of_week, medication_type, glp1_medication")
    .eq("id", user.id)
    .single();

  const { data: activeSession } = await supabase
    .from("workout_sessions")
    .select("id, started_at")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const doseStatus = getDoseStatus(profile?.dose_day_of_week ?? null);
  const medicationLabel =
    profile?.medication_type ?? profile?.glp1_medication ?? undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-6 lg:max-w-5xl lg:space-y-8">
      <div className="space-y-1">
        <Link
          href="/dashboard"
          className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-slate transition-colors hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-charcoal sm:text-3xl sm:font-bold">
          Workout programs
        </h1>
        <p className="max-w-xl text-sm text-slate sm:text-base">
          Pick a plan that matches your level. Each program is built for GLP-1 users who want to
          keep muscle while losing fat — with clear sessions and exercise lists.
        </p>
      </div>

      <DoseNudgeBanner status={doseStatus} medicationName={medicationLabel} />

      {(doseStatus === "injection_day" || doseStatus === "day_after") && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Suggested for today</h3>
          <div className="space-y-2">
            {LIGHT_SESSIONS.map((session) => (
              <div
                key={session.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-900 text-sm">{session.name}</p>
                  <p className="text-xs text-gray-500">
                    {session.duration} · {session.intensity}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1 font-medium">
                  {session.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSession && (
        <div className="flex flex-col gap-3 rounded-lg border border-warning/25 bg-warning/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="font-semibold text-charcoal">You have a workout in progress</p>
            <p className="mt-0.5 text-sm text-slate">
              Resume to keep logging sets — starting a new program from here begins a fresh session.
            </p>
          </div>
          <Link
            href="/workouts/active"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-charcoal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90"
          >
            <Play className="h-4 w-4" />
            Resume workout
          </Link>
        </div>
      )}

      {!programs || programs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line-strong bg-surface p-12 text-center sm:p-16">
            <p className="text-charcoal font-medium mb-1">No programs yet</p>
            <p className="text-sm text-slate max-w-md mx-auto">
              Run the workout seed SQL in Supabase (migration{" "}
              <code className="text-xs bg-cloud px-1.5 py-0.5 rounded">015_workout_programs_seed.sql</code>)
              to load beginner, intermediate, and advanced plans.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-1 lg:gap-8">
            {programs.map((program) => {
              const workouts = (program.workouts as WorkoutRow[]) || [];
              const isCurrent = profile?.current_program_id === program.id;

              return (
                <ProgramCard
                  key={program.id}
                  program={{
                    id: program.id,
                    name: program.name,
                    description: program.description,
                    difficulty_level: program.difficulty_level,
                    workouts_per_week: program.workouts_per_week,
                  }}
                  workouts={workouts}
                  isCurrent={isCurrent}
                  userId={user.id}
                />
              );
            })}
          </div>
        )}
    </div>
  );
}
