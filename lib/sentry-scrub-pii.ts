import type { Event } from '@sentry/core';

const SENSITIVE_KEYS = [
  'weight',
  'protein',
  'medication',
  'dose',
  'dob',
  'date_of_birth',
  'daily_protein_target_g',
  'glp1_medication',
  'glp1_dose_mg',
  'glp1_dose_day',
  'glp1_dose_time',
  'photo',
  'progress_photo',
] as const;

/**
 * Remove PII and health-adjacent fields from Sentry events before send.
 */
export function scrubSentryPii<T extends Event>(event: T): T {
  if (event.user) {
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
  }

  const data = event.request?.data;
  if (data !== undefined && data !== null && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of SENSITIVE_KEYS) {
      if (key in record) {
        record[key] = '[Filtered]';
      }
    }
  }

  return event;
}
