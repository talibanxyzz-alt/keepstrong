import { Resend } from 'resend';

let resendSingleton: Resend | null = null;

/** Lazy init so `next build` can succeed if RESEND is only set at runtime (e.g. Vercel). */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (!resendSingleton) {
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

export const SENDER_EMAIL = 'hello@keepstrong.app'; // Update with your verified domain
export const SENDER_NAME = 'KeepStrong Team';

