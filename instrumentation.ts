import * as Sentry from '@sentry/nextjs';
import { scrubSentryPii } from '@/lib/sentry-scrub-pii';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      debug: false,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        scrubSentryPii(event);
        if (event.request?.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      debug: false,
      environment: process.env.NODE_ENV,
      beforeSend(event) {
        return scrubSentryPii(event);
      },
    });
  }
}

// Instrument request errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;

