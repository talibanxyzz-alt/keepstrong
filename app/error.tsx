'use client';

import { useEffect } from 'react';
import { logError } from '@/lib/errors/handler';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    logError(error, {
      action: 'global_error',
      metadata: {
        digest: error.digest,
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud p-4">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-danger-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            Something went wrong!
          </h1>
          <p className="text-slate">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-danger-muted rounded-lg text-left">
            <p className="text-xs font-semibold text-danger mb-1">Error Details (Dev Only):</p>
            <p className="text-sm font-mono text-danger break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-danger mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Try Again
          </button>
          <a
            href="/dashboard"
            className="flex-1 px-6 py-3 border-2 border-line-strong text-charcoal rounded-lg font-semibold hover:bg-cloud transition text-center"
          >
            Go Home
          </a>
        </div>

        <p className="mt-6 text-sm text-slate">
          If this problem persists, please{' '}
          <a href="mailto:support@keepstrong.app" className="text-primary hover:underline">
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}

