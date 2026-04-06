import * as Sentry from '@sentry/nextjs';
import { scrubSentryPii } from '@/lib/sentry-scrub-pii';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional SDK configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  environment: process.env.NODE_ENV,

  beforeSend(event) {
    return scrubSentryPii(event);
  },

  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Network errors
    'NetworkError',
    'Failed to fetch',
    // Cancelled requests
    'The operation was aborted',
  ],
});

// Instrument router transitions for better navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

