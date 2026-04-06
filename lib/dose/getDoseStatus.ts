export type DoseStatus =
  | "injection_day"
  | "day_after"
  | "two_days_after"
  | "normal";

/**
 * Maps profile dose schedule to today's workout-relevant phase.
 * `doseDayOfWeek`: 0 = Sunday … 6 = Saturday (matches `profiles.dose_day_of_week`).
 * `doseDate`: optional ISO date for last/specific injection when using date-based tracking.
 */
export function getDoseStatus(
  doseDayOfWeek: number | null,
  doseDate?: string | null
): DoseStatus {
  if (doseDayOfWeek === null && !doseDate) return "normal";

  const today = new Date();
  const todayDow = today.getDay();

  if (doseDayOfWeek !== null) {
    if (todayDow === doseDayOfWeek) return "injection_day";
    if (todayDow === (doseDayOfWeek + 1) % 7) return "day_after";
    if (todayDow === (doseDayOfWeek + 2) % 7) return "two_days_after";
  }

  if (doseDate) {
    const dose = new Date(doseDate);
    const diffDays = Math.floor(
      (today.getTime() - dose.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "injection_day";
    if (diffDays === 1) return "day_after";
    if (diffDays === 2) return "two_days_after";
  }

  return "normal";
}
