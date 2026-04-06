/** Rough session length from sets + prescribed rest (warm-up not included). */
export function estimateWorkoutMinutes(
  exercises: { target_sets: number | null; rest_seconds: number | null }[]
): number {
  let seconds = 0;
  for (const e of exercises) {
    const sets = e.target_sets ?? 0;
    const rest = e.rest_seconds ?? 60;
    seconds += sets * 45;
    seconds += Math.max(0, sets - 1) * rest;
  }
  return Math.max(1, Math.round(seconds / 60));
}
