import Image from "next/image";
import { Calendar, ChevronRight, Dumbbell, Sparkles, Timer } from "lucide-react";
import StartWorkoutButton from "./StartWorkoutButton";
import { estimateWorkoutMinutes } from "@/lib/utils/workout-estimates";

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

/** Difficulty accents use the same palette as the rest of the app (success / warning / primary). */
const DIFFICULTY_STYLES: Record<
  string,
  { label: string; className: string; bar: string }
> = {
  beginner: {
    label: "Beginner",
    className: "bg-success/10 text-success ring-success/25",
    bar: "from-success to-teal-600",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-warning/10 text-warning ring-warning/25",
    bar: "from-warning to-amber-700",
  },
  advanced: {
    label: "Advanced",
    className: "bg-primary/10 text-primary ring-primary/20",
    bar: "from-primary to-sky-900",
  },
};

const FALLBACK_HERO: Record<string, string> = {
  beginner: "/images/exercises/squat.jpg",
  intermediate: "/images/exercises/bench.jpg",
  advanced: "/images/exercises/deadlift.jpg",
};

function heroForProgram(
  difficulty: string | null,
  workouts: WorkoutRow[]
): string {
  const sorted = [...workouts].sort(
    (a, b) => a.order_in_program - b.order_in_program
  );
  const first = sorted[0];
  if (first?.exercises?.length) {
    const ex = [...first.exercises].sort(
      (a, b) => (a.order_in_workout ?? 0) - (b.order_in_workout ?? 0)
    );
    const withImg = ex.find((e) => e.image_url);
    if (withImg?.image_url) return withImg.image_url;
  }
  const key = (difficulty ?? "beginner").toLowerCase();
  return FALLBACK_HERO[key] ?? FALLBACK_HERO.beginner;
}

interface ProgramCardProps {
  program: {
    id: string;
    name: string;
    description: string | null;
    difficulty_level: string | null;
    workouts_per_week: number | null;
  };
  workouts: WorkoutRow[];
  isCurrent: boolean;
  userId: string;
}

export default function ProgramCard({
  program,
  workouts,
  isCurrent,
  userId,
}: ProgramCardProps) {
  const difficultyKey = (program.difficulty_level ?? "beginner").toLowerCase();
  const diff = DIFFICULTY_STYLES[difficultyKey] ?? DIFFICULTY_STYLES.beginner;

  const sortedWorkouts = [...workouts].sort(
    (a, b) => a.order_in_program - b.order_in_program
  );

  const totalExercises = sortedWorkouts.reduce(
    (n, w) => n + w.exercises.length,
    0
  );

  const perSessionMins = sortedWorkouts.map((w) =>
    estimateWorkoutMinutes(w.exercises)
  );
  const avgSessionMin =
    perSessionMins.length > 0
      ? Math.round(
          perSessionMins.reduce((a, b) => a + b, 0) / perSessionMins.length
        )
      : 0;

  const weeklyMin =
    program.workouts_per_week && avgSessionMin
      ? program.workouts_per_week * avgSessionMin
      : null;

  const heroSrc = heroForProgram(program.difficulty_level, sortedWorkouts);

  return (
    <article
      className={`group overflow-hidden rounded-lg border border-line bg-surface shadow-sm transition-shadow hover:shadow-md ${
        isCurrent ? "ring-2 ring-primary/25" : ""
      }`}
    >
      <div className="relative h-44 sm:h-52 w-full bg-charcoal">
        <Image
          src={heroSrc}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 896px"
          priority={isCurrent}
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${diff.bar} opacity-55 mix-blend-multiply`}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${diff.className}`}
            >
              {diff.label}
            </span>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-white/80">
                <Sparkles className="h-3 w-3" />
                Your program
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
            {program.name}
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {program.description && (
          <p className="text-sm text-slate leading-relaxed">{program.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cloud px-3 py-1.5 text-xs font-medium text-charcoal">
            <Dumbbell className="h-3.5 w-3.5 text-primary" />
            {sortedWorkouts.length} session
            {sortedWorkouts.length !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cloud px-3 py-1.5 text-xs font-medium text-charcoal">
            <Timer className="h-3.5 w-3.5 text-primary" />
            ~{avgSessionMin} min / workout
          </span>
          {program.workouts_per_week != null && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-cloud px-3 py-1.5 text-xs font-medium text-charcoal">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {program.workouts_per_week}× / week
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cloud px-3 py-1.5 text-xs font-medium text-charcoal">
            {totalExercises} exercise{totalExercises !== 1 ? "s" : ""} total
          </span>
          {weeklyMin != null && weeklyMin > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              ~{weeklyMin} min training / week
            </span>
          )}
        </div>

        <div className="rounded-xl border border-line/60 bg-cloud/50 overflow-hidden">
          <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate border-b border-line/60 bg-surface/80">
            What&apos;s inside
          </p>
          <ul className="divide-y divide-line/60">
            {sortedWorkouts.map((w, idx) => {
              const exSorted = [...w.exercises].sort(
                (a, b) =>
                  (a.order_in_workout ?? 0) - (b.order_in_workout ?? 0)
              );
              const mins = estimateWorkoutMinutes(w.exercises);
              const preview = exSorted.slice(0, 5);
              const rest = exSorted.length - preview.length;

              return (
                <li key={w.id}>
                  <details className="group open:bg-surface">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-left hover:bg-surface/90 transition-colors [&::-webkit-details-marker]:hidden">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-charcoal text-sm">
                          {w.name}
                        </p>
                        <p className="text-xs text-slate mt-0.5">
                          {exSorted.length} exercises · ~{mins} min
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 pb-4 pt-0 border-t border-line/60 bg-surface">
                      {w.description && (
                        <p className="text-xs text-slate py-3 border-b border-line/40">
                          {w.description}
                        </p>
                      )}
                      <ol className="mt-2 space-y-1.5">
                        {preview.map((ex, i) => (
                          <li
                            key={ex.id}
                            className="flex items-center gap-2 text-sm text-charcoal"
                          >
                            <span className="text-xs text-slate w-5 tabular-nums">
                              {i + 1}.
                            </span>
                            <span className="flex-1">{ex.name}</span>
                            <span className="text-xs text-slate tabular-nums">
                              {ex.target_sets ?? 0} sets
                            </span>
                          </li>
                        ))}
                        {rest > 0 && (
                          <li className="text-xs text-slate pl-7 pt-1">
                            +{rest} more…
                          </li>
                        )}
                      </ol>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>

        <StartWorkoutButton
          programId={program.id}
          userId={userId}
          workouts={sortedWorkouts}
          isCurrentProgram={isCurrent}
        />
      </div>
    </article>
  );
}
