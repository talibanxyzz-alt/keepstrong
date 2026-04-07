"use client";

import { useState, useEffect } from "react";
import { X, Check, Timer, Trophy, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getLastSessionSets, type LastSetData } from "@/lib/workouts/getLastSessionSets";
import ExerciseCard from "./ExerciseCard";
import RestTimer from "./RestTimer";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  order_in_workout: number;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutSession {
  id: string;
  workout_id: string;
  started_at: string;
  timer_started_at: string | null;
}

interface LoggedSet {
  id: string;
  exercise_id: string | null;
  set_number: number;
  weight_kg: number;
  reps_completed: number;
}

interface WorkoutTrackerProps {
  session: WorkoutSession;
  workout: Workout;
  loggedSets: LoggedSet[];
  userId: string;
}

export default function WorkoutTracker({
  session,
  workout,
  loggedSets: initialLoggedSets,
  userId,
}: WorkoutTrackerProps) {
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>(initialLoggedSets);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [lastSets, setLastSets] = useState<Record<string, LastSetData>>({});
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(session.timer_started_at);
  const [isStartingTimer, setIsStartingTimer] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const exercises = workout.exercises.sort((a, b) => a.order_in_workout - b.order_in_workout);

  useEffect(() => {
    if (exercises.length > 0 && userId) {
      getLastSessionSets(userId, exercises.map((e) => e.id))
        .then(setLastSets)
        .catch(() => setLastSets({}));
    }
  }, [exercises, userId]);
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    setTimerStartedAt(session.timer_started_at);
  }, [session.timer_started_at]);

  // Elapsed workout time (only after user taps Start workout on this screen)
  useEffect(() => {
    if (!timerStartedAt) {
      setElapsedTime(0);
      return;
    }
    const startTime = new Date(timerStartedAt).getTime();
    const tick = () => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerStartedAt]);

  const handleStartWorkoutTimer = async () => {
    setIsStartingTimer(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("workout_sessions")
      .update({ timer_started_at: now })
      .eq("id", session.id);

    if (error) {
      toast.error(`Could not start timer: ${error.message}`);
      setIsStartingTimer(false);
      return;
    }

    setTimerStartedAt(now);
    setIsStartingTimer(false);
    toast.success("Timer started — good workout!");
  };

  // Get sets logged for an exercise
  const getSetsForExercise = (exerciseId: string) => {
    return loggedSets.filter((set) => set.exercise_id === exerciseId);
  };

  // Check if exercise is completed
  const isExerciseCompleted = (exercise: Exercise) => {
    const sets = getSetsForExercise(exercise.id);
    return sets.length >= exercise.target_sets;
  };

  // Check if all exercises are completed
  const allExercisesCompleted = exercises.every((ex) => isExerciseCompleted(ex));

  // Handle logging a set
  const handleSetLogged = (newSet: LoggedSet) => {
    setLoggedSets([...loggedSets, newSet]);

    // Check if this exercise is now complete
    const setsForCurrentExercise = [...loggedSets, newSet].filter(
      (set) => set.exercise_id === currentExercise.id
    );

    if (setsForCurrentExercise.length >= currentExercise.target_sets) {
      // Move to next exercise if available
      if (currentExerciseIndex < exercises.length - 1) {
        // Show rest timer
        setRestSeconds(currentExercise.rest_seconds);
        setShowRestTimer(true);
      }
    } else {
      // Start rest timer for next set
      setRestSeconds(currentExercise.rest_seconds);
      setShowRestTimer(true);
    }
  };

  // Handle rest timer completion
  const handleRestComplete = () => {
    setShowRestTimer(false);

    // Check if current exercise is completed
    if (isExerciseCompleted(currentExercise) && currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  // Handle cancelling workout
  const handleCancelWorkout = async () => {
    if (!confirm("Are you sure you want to cancel this workout? Your progress will be lost.")) return;

    setIsCancelling(true);

    try {
      // Delete the workout session and all logged sets
      const { error } = await supabase
        .from("workout_sessions")
        .delete()
        .eq("id", session.id);

      if (error) {
        toast.error(`Failed to cancel workout: ${error.message}`);
        setIsCancelling(false);
        return;
      }

      toast.success("Workout cancelled");
      router.push("/workouts/active");
      router.refresh();
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      setIsCancelling(false);
    }
  };

  // Handle finishing workout
  const handleFinishWorkout = async () => {
    if (!confirm("Are you sure you want to finish this workout?")) return;

    setIsFinishing(true);

    try {
      const durationMinutes = Math.max(1, Math.ceil(elapsedTime / 60));
      const { error } = await supabase
        .from("workout_sessions")
        .update({
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
        })
        .eq("id", session.id);

      if (error) {
        toast.error(`Failed to complete workout: ${error.message}`);
        setIsFinishing(false);
        return;
      }

      setShowSuccessScreen(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 3000);
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
      setIsFinishing(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress
  const totalSets = exercises.reduce((sum, ex) => sum + ex.target_sets, 0);
  const completedSets = loggedSets.length;
  const progressPercentage = Math.round((completedSets / totalSets) * 100);

  // Success screen
  if (showSuccessScreen) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <div className="rounded-lg border border-line bg-surface px-8 py-10 text-center shadow-sm sm:px-12">
          <Trophy className="mx-auto mb-4 h-14 w-14 text-charcoal" />
          <h1 className="text-2xl font-semibold text-charcoal">Workout complete</h1>
          <p className="mt-2 text-slate">Finished in {formatTime(elapsedTime)}</p>
          <p className="mt-1 text-sm text-slate/70">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-surface px-4 shadow-sm md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="py-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-charcoal sm:text-xl">{workout.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm" title={timerStartedAt ? undefined : "Timer starts after you tap Start workout"}>
                <Timer className="h-4 w-4 text-slate" />
                <span className="font-mono font-semibold text-charcoal">
                  {timerStartedAt ? formatTime(elapsedTime) : "0:00"}
                </span>
              </div>
              <button
                onClick={handleCancelWorkout}
                disabled={isCancelling}
                className="rounded-md p-2 text-slate transition-colors hover:bg-cloud hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Cancel workout"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate">
              <span>
                {completedSets} / {totalSets} sets
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-cloud">
              <div
                className="h-full rounded-full bg-charcoal transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {!timerStartedAt && (
        <div className="mx-4 mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-5 shadow-sm md:mx-6 lg:mx-8">
          <p className="text-center text-sm text-slate">
            Set your weights and equipment. When you&apos;re ready, start the session timer — setup time won&apos;t count.
          </p>
          <button
            type="button"
            onClick={handleStartWorkoutTimer}
            disabled={isStartingTimer}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Start workout timer"
          >
            {isStartingTimer ? (
              <>Starting…</>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start workout
              </>
            )}
          </button>
        </div>
      )}

      {/* Exercise List */}
      <div className="py-6">
        <div className="space-y-4">
          {exercises.map((exercise, index) => {
            const isCompleted = isExerciseCompleted(exercise);
            const isCurrent = index === currentExerciseIndex;
            const setsLogged = getSetsForExercise(exercise.id);

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                sessionId={session.id}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                setsLogged={setsLogged}
                onSetLogged={handleSetLogged}
                onSelect={() => setCurrentExerciseIndex(index)}
                lastSession={lastSets[exercise.id]}
                loggingLocked={!timerStartedAt}
              />
            );
          })}
        </div>

        {/* Finish Workout Button */}
        {allExercisesCompleted && (
          <div className="fixed bottom-[calc(var(--app-mobile-tabbar-offset)+0.75rem)] left-0 right-0 z-20 flex justify-center px-4 lg:bottom-8">
            <button
              onClick={handleFinishWorkout}
              disabled={isFinishing}
              className="flex items-center gap-2 rounded-lg bg-charcoal px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-6 w-6" />
              {isFinishing ? "Finishing..." : "Finish Workout"}
            </button>
          </div>
        )}
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer && (
        <RestTimer
          seconds={restSeconds}
          onComplete={handleRestComplete}
          onSkip={handleRestComplete}
        />
      )}
    </div>
  );
}

