import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export type LastSetData = {
  exercise_id: string;
  sets: {
    set_number: number;
    reps: number;
    weight_kg: number;
  }[];
  session_date: string;
};

type SetRow = {
  exercise_id: string | null;
  set_number: number;
  reps_completed: number;
  weight_kg: number;
  session_id: string | null;
  workout_sessions: { user_id: string; completed_at: string | null } | null;
};

function sessionCompletedAt(row: SetRow): string | null {
  const ws = row.workout_sessions;
  if (ws && typeof ws === "object" && ws.completed_at) return ws.completed_at;
  return null;
}

export async function getLastSessionSets(
  userId: string,
  exerciseIds: string[]
): Promise<Record<string, LastSetData>> {
  const result: Record<string, LastSetData> = {};
  if (exerciseIds.length === 0) return result;

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("exercise_sets")
    .select(
      `
      exercise_id,
      set_number,
      reps_completed,
      weight_kg,
      session_id,
      workout_sessions!inner(user_id, completed_at)
    `
    )
    .in("exercise_id", exerciseIds)
    .eq("workout_sessions.user_id", userId);

  if (error || !data?.length) {
    if (error) console.error("getLastSessionSets:", error.message);
    return result;
  }

  const rows = (data as SetRow[]).filter(
    (r) => r.exercise_id && r.session_id && sessionCompletedAt(r)
  );

  for (const exerciseId of exerciseIds) {
    const forExercise = rows.filter((r) => r.exercise_id === exerciseId);
    if (forExercise.length === 0) continue;

    forExercise.sort(
      (a, b) =>
        new Date(sessionCompletedAt(b)!).getTime() -
        new Date(sessionCompletedAt(a)!).getTime()
    );

    const latestSessionId = forExercise[0]!.session_id!;
    const sessionDate = sessionCompletedAt(forExercise[0]!)!;
    const setsForLatest = forExercise
      .filter((r) => r.session_id === latestSessionId)
      .sort((a, b) => a.set_number - b.set_number)
      .map((s) => ({
        set_number: s.set_number,
        reps: s.reps_completed,
        weight_kg: s.weight_kg,
      }));

    result[exerciseId] = {
      exercise_id: exerciseId,
      sets: setsForLatest,
      session_date: sessionDate,
    };
  }

  return result;
}
