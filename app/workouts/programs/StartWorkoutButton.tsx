"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Workout {
  id: string;
  name: string;
  order_in_program: number;
}

interface Props {
  programId: string;
  userId: string;
  workouts: Workout[];
  isCurrentProgram?: boolean;
}

export default function StartWorkoutButton({
  programId,
  userId,
  workouts,
  isCurrentProgram = false,
}: Props) {
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleStart = async () => {
    if (workouts.length === 0) {
      toast.error("No workouts in this program yet.");
      return;
    }
    setIsStarting(true);

    // Set as current program
    await supabase
      .from("profiles")
      .update({ current_program_id: programId })
      .eq("id", userId);

    // Pick first workout by order
    const firstWorkout = [...workouts].sort(
      (a, b) => a.order_in_program - b.order_in_program
    )[0];

    // Start a workout session
    const { data: session, error } = await supabase
      .from("workout_sessions")
      .insert({
        user_id: userId,
        workout_id: firstWorkout.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !session) {
      toast.error("Could not start workout. Try again.");
      setIsStarting(false);
      return;
    }

    router.push("/workouts/active");
  };

  const label = isCurrentProgram ? "Start workout" : "Select program & begin";

  return (
    <button
      type="button"
      onClick={handleStart}
      disabled={isStarting}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-charcoal py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isStarting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Starting…
        </>
      ) : (
        <>
          <Play className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
}
