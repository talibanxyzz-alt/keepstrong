"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LastSetData } from "@/lib/workouts/getLastSessionSets";
import { LastSessionBanner } from "./LastSessionBanner";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
}

interface LoggedSet {
  id: string;
  exercise_id: string | null;
  set_number: number;
  weight_kg: number;
  reps_completed: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  sessionId: string;
  isCompleted: boolean;
  isCurrent: boolean;
  setsLogged: LoggedSet[];
  onSetLogged: (set: LoggedSet) => void;
  onSelect: () => void;
  lastSession?: LastSetData;
}

export default function ExerciseCard({
  exercise,
  sessionId,
  isCompleted,
  isCurrent,
  setsLogged,
  onSetLogged,
  onSelect,
  lastSession,
}: ExerciseCardProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const supabase = createClient();

  const nextSetNumber = setsLogged.length + 1;
  const setsRemaining = exercise.target_sets - setsLogged.length;

  const handleLogSet = async (e: React.FormEvent) => {
    e.preventDefault();

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (!weight || !reps || isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
      toast.error("Please enter valid weight and reps");
      return;
    }

    setIsLogging(true);

    try {
      const { data: newSet, error } = await supabase
        .from("exercise_sets")
        .insert({
          session_id: sessionId,
          exercise_id: exercise.id,
          set_number: nextSetNumber,
          weight_kg: weightNum,
          reps_completed: repsNum,
        })
        .select()
        .single();

      if (error) {
        toast.error(`Failed to log set: ${error.message}`);
        setIsLogging(false);
        return;
      }

      onSetLogged(newSet);

      const setIndex = nextSetNumber - 1;
      const prior = lastSession?.sets[setIndex];
      if (prior && (repsNum > prior.reps || weightNum > prior.weight_kg)) {
        toast.success("New personal best! 🏆");
      } else {
        toast.success(`Set ${nextSetNumber} logged!`);
      }

      // Clear inputs for next set
      setWeight("");
      setReps("");
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLogging(false);
    }
  };

  const repsDisplay =
    exercise.target_reps_min === exercise.target_reps_max
      ? exercise.target_reps_min
      : `${exercise.target_reps_min}-${exercise.target_reps_max}`;

  return (
    <div
      className={`overflow-hidden rounded-lg border shadow-sm transition-all ${
        isCompleted
          ? "border-success bg-success/5"
          : isCurrent
            ? "border-primary bg-surface shadow-md ring-1 ring-primary/15"
            : "border-line bg-surface"
      }`}
    >
      {/* Header */}
      <button
        onClick={onSelect}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-cloud/50"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
                <Check className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
                {nextSetNumber}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-charcoal">{exercise.name}</h3>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="font-mono font-semibold text-primary">
                  {exercise.target_sets} × {repsDisplay}
                </span>
                <span className="text-slate">
                  {setsLogged.length}/{exercise.target_sets} sets
                </span>
              </div>
            </div>
          </div>
        </div>

        <ChevronDown
          className={`h-6 w-6 text-slate transition-transform ${
            isCurrent ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded Content */}
      {isCurrent && !isCompleted && (
        <div className="border-t border-line bg-surface p-6">
          {lastSession && lastSession.sets.length > 0 ? (
            <LastSessionBanner lastSets={lastSession.sets} sessionDate={lastSession.session_date} />
          ) : null}

          {/* Exercise Visual */}
          {exercise.image_url && (
            <div className="relative mb-5 h-44 w-full overflow-hidden rounded-xl">
              <Image
                src={exercise.image_url}
                alt={`${exercise.name} demonstration`}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover object-center"
              />
            </div>
          )}

          {/* Description */}
          {exercise.description && (
            <div className="mb-6">
              {showDescription ? (
                <div className="rounded-lg bg-primary/5 border border-primary/15 p-4">
                  <p className="text-sm text-slate leading-relaxed">{exercise.description}</p>
                  <button
                    onClick={() => setShowDescription(false)}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    Hide form tips
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDescription(true)}
                  className="flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80"
                >
                  <Info className="h-4 w-4" />
                  Show form tips
                </button>
              )}
            </div>
          )}

          {/* Logged Sets */}
          {setsLogged.length > 0 && (
            <div className="mb-6">
              <h4 className="mb-2 text-sm font-semibold text-charcoal">
                Completed Sets
              </h4>
              <div className="space-y-2">
                {setsLogged.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between rounded-lg bg-cloud px-4 py-2"
                  >
                    <span className="text-sm text-slate">Set {set.set_number}</span>
                    <span className="font-mono text-sm font-semibold text-charcoal">
                      {set.weight_kg}kg × {set.reps_completed} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Log Set Form */}
          {setsRemaining > 0 && (
            <form onSubmit={handleLogSet} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-charcoal">
                  Set {nextSetNumber} of {exercise.target_sets}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-slate">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-md border border-line-strong bg-surface px-4 py-3 text-lg font-mono font-semibold text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                      placeholder="20"
                      disabled={isLogging}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate">Reps</label>
                    <input
                      type="number"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full rounded-md border border-line-strong bg-surface px-4 py-3 text-lg font-mono font-semibold text-charcoal placeholder:text-slate/60 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                      placeholder={repsDisplay.toString()}
                      disabled={isLogging}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLogging}
                className="w-full rounded-lg bg-charcoal px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
              >
                {isLogging ? "Logging..." : "Log Set"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Completed State */}
      {isCompleted && isCurrent && (
        <div className="border-t border-success/20 bg-success/5 p-6 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-success" />
          <p className="font-semibold text-success">Exercise completed!</p>
        </div>
      )}
    </div>
  );
}

