import { endOfDay, format, startOfDay } from "date-fns";

/**
 * Local calendar date YYYY-MM-DD (matches `date` / `logged_date` columns).
 * Do not use `new Date().toISOString().split("T")[0]` — that is UTC midnight and can
 * shift the calendar day for users not in UTC.
 */
export function localDateString(d: Date = new Date()): string {
  return format(d, "yyyy-MM-dd");
}

/** Query range for `timestamptz` columns for the user's local calendar day. */
export function localDayUtcRange(d: Date = new Date()): { start: string; end: string } {
  return {
    start: startOfDay(d).toISOString(),
    end: endOfDay(d).toISOString(),
  };
}

/** `protein_logs.protein_grams` is INTEGER — round and clamp for storage. */
export function roundProteinGrams(g: number): number {
  if (!Number.isFinite(g)) return 0;
  return Math.round(Math.min(10000, Math.max(0, g)));
}
