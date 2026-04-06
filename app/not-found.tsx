'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cloud p-4">
      <div className="max-w-md w-full bg-surface rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-primary mb-4 font-mono">404</div>
          <h1 className="text-2xl font-bold text-charcoal mb-2">
            Page Not Found
          </h1>
          <p className="text-slate">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mb-6">
          <svg
            className="mx-auto w-32 h-32 text-slate/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition text-center"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-6 py-3 border-2 border-line-strong text-charcoal rounded-lg font-semibold hover:bg-cloud transition"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-line">
          <p className="text-sm text-slate mb-3">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-primary hover:underline">
              Dashboard
            </Link>
            <Link href="/workouts/programs" className="text-primary hover:underline">
              Workouts
            </Link>
            <Link href="/progress" className="text-primary hover:underline">
              Progress
            </Link>
            <Link href="/settings" className="text-primary hover:underline">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

