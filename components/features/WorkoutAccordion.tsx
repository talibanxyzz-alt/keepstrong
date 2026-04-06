"use client";

import { useState } from "react";
import { ChevronDown, Clock, Target } from "lucide-react";
import ExerciseListItem from "@/components/features/ExerciseListItem";

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  video_url: string | null;
  order_in_workout: number;
}

interface Workout {
  id: string;
  name: string;
  description: string | null;
  order_in_program: number;
  exercises: Exercise[];
}

export default function WorkoutAccordion({
  workout,
  index,
}: {
  workout: Workout;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First workout open by default

  // Calculate estimated time (rough: 3-4 min per set)
  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.target_sets,
    0
  );
  const estimatedMinutes = Math.round(totalSets * 3.5);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      {/* Workout Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-cloud"
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold text-charcoal">{workout.name}</h3>
          {workout.description && (
            <p className="mt-1 text-sm text-slate">{workout.description}</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate">
              <Target className="h-4 w-4" />
              <span>
                <span className="font-mono font-semibold text-charcoal">
                  {workout.exercises.length}
                </span>{" "}
                exercises
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate">
              <Clock className="h-4 w-4" />
              <span>
                ~<span className="font-mono font-semibold text-charcoal">
                  {estimatedMinutes}
                </span>{" "}
                min
              </span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={`h-6 w-6 text-slate transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Exercise List */}
      {isExpanded && (
        <div className="border-t border-line/60">
          <div className="divide-y divide-line/60">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                index={exerciseIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

