"use client";

import { useState, useEffect } from "react";
import { X, Play } from "lucide-react";

interface RestTimerProps {
  seconds: number;
  onComplete: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onSkip}
          className="absolute right-4 top-4 rounded-md p-2 text-slate transition-colors hover:bg-cloud"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-charcoal">Rest Time</h2>
          <p className="mb-8 text-sm text-slate">Take a break before your next set</p>

          {/* Timer Display */}
          <div className="relative mb-8">
            {/* Circular Progress */}
            <svg className="mx-auto h-48 w-48 -rotate-90 transform">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#E2E8F0"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#059669"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="font-mono text-6xl font-bold text-charcoal">
                  {formatTime(timeLeft)}
                </div>
                <div className="mt-2 text-sm text-slate">remaining</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 rounded-md border border-line-strong px-4 py-3 font-medium text-charcoal transition-colors hover:bg-cloud"
            >
              Skip Rest
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-all hover:bg-primary/90"
            >
              {isActive ? (
                <>
                  <div className="h-3 w-3 rounded-sm bg-surface" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

