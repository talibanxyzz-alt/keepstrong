'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-cloud px-4">
          <div className="w-full max-w-md rounded-lg bg-surface p-8 shadow-lg">
            <h1 className="mb-4 text-2xl font-bold text-charcoal">
              Something went wrong!
            </h1>
            <p className="mb-6 text-slate">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-white transition-all hover:scale-[1.02] hover:shadow-md"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

