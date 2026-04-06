"use client";

import { Play, Info } from "lucide-react";
import { useState } from "react";

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

export default function ExerciseListItem({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  const [showDescription, setShowDescription] = useState(false);

  // Format rest time
  const formatRestTime = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}:${remainingSeconds.toString().padStart(2, "0")} min`
        : `${minutes} min`;
    }
    return `${seconds} sec`;
  };

  // Format reps
  const repsDisplay =
    exercise.target_reps_min === exercise.target_reps_max
      ? exercise.target_reps_min
      : `${exercise.target_reps_min}-${exercise.target_reps_max}`;

  return (
    <div className={`p-6 ${index % 2 === 0 ? "bg-surface" : "bg-cloud"}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold text-primary">
              {index + 1}
            </span>
            <div>
              <h4 className="text-lg font-semibold text-charcoal">
                {exercise.name}
              </h4>
              <div className="mt-1 flex items-center gap-4 text-sm">
                <span className="font-mono font-semibold text-primary">
                  {exercise.target_sets} × {repsDisplay}
                </span>
                <span className="text-slate">
                  Rest: <span className="font-mono">{formatRestTime(exercise.rest_seconds)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Description (expandable) */}
          {exercise.description && (
            <div className="ml-11 mt-3">
              {showDescription ? (
                <div>
                  <p className="text-sm text-slate">{exercise.description}</p>
                  <button
                    onClick={() => setShowDescription(false)}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    Hide details
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
        </div>

        {/* Video Link */}
        {exercise.video_url && (
          <a
            href={exercise.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Play className="h-4 w-4" />
            Video
          </a>
        )}
      </div>
    </div>
  );
}

