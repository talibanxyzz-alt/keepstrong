/**
 * Days since the most recent weekly dose on or before `loggedDate` (YYYY-MM-DD).
 * `doseDayOfWeek`: 0 = Sunday … 6 = Saturday (matches `profiles.dose_day_of_week`).
 */
export function getDaysSinceDose(
  loggedDate: string,
  doseDayOfWeek: number | null
): number | null {
  if (doseDayOfWeek === null) return null;
  const [y, m, d] = loggedDate.split("-").map(Number);
  const local = new Date(y, m - 1, d);
  const dow = local.getDay();
  return (dow - doseDayOfWeek + 7) % 7;
}
