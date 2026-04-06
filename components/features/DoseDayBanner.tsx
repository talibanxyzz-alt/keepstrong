'use client';

import { getDaysSinceDose, getDoseDayMessage, getAdjustedProteinGoal } from '@/lib/utils/dose-day';

interface DoseDayBannerProps {
  doseDay: number;
  proteinGoal: number;
}

export function DoseDayBanner({ doseDay, proteinGoal }: DoseDayBannerProps) {
  const today = new Date().getDay(); // 0-6
  const daysSinceDose = getDaysSinceDose({ doseDay, todayDayOfWeek: today });
  const { title, message, color } = getDoseDayMessage(daysSinceDose);
  const adjustedGoal = getAdjustedProteinGoal(proteinGoal, daysSinceDose);
  
  // Only show if dose day or day after (hide on normal days to reduce noise)
  if (daysSinceDose > 2) return null;
  
  const colorClasses = {
    amber: "bg-warning/10 border-warning/25 text-charcoal",
    blue: "bg-primary/5 border-primary/20 text-charcoal",
    emerald: "bg-success/10 border-success/25 text-charcoal",
  };
  
  return (
    <div className={`rounded-lg border p-4 mb-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-sm opacity-90">{message}</p>
          
          {adjustedGoal < proteinGoal && (
            <div className="mt-3 text-sm">
              <p>
                <strong>Today's adjusted protein goal:</strong>{' '}
                <span className="font-mono">{adjustedGoal}g</span>
                <span className="opacity-70"> (normally {proteinGoal}g)</span>
              </p>
              <p className="text-xs mt-1 opacity-75">
                It's okay to aim lower on dose days. Consistency matters more than perfection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

