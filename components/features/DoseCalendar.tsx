'use client';

import { getDaysSinceDose, getDoseImpactLevel } from '@/lib/utils/dose-day';

interface DoseCalendarProps {
  doseDay: number; // 0-6
}

export function DoseCalendar({ doseDay }: DoseCalendarProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  
  return (
    <div className="bg-surface rounded-lg border p-6">
      <h3 className="font-semibold mb-4">Your Week at a Glance</h3>
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const daysSinceDose = getDaysSinceDose({ 
            doseDay, 
            todayDayOfWeek: index 
          });
          const impact = getDoseImpactLevel(daysSinceDose);
          const isToday = index === today;
          const isDoseDay = index === doseDay;
          
          const bgColor = {
            high: "bg-warning/15 border-warning/30",
            medium: "bg-primary/10 border-primary/25",
            low: "bg-cloud border-line",
            none: "bg-cloud border-line",
          }[impact];
          
          return (
            <div
              key={day}
              className={`
                p-2 rounded-lg border text-center
                ${bgColor}
                ${isToday ? "ring-2 ring-primary" : ""}
              `}
            >
              <div className="text-xs font-medium text-slate">
                {day}
              </div>
              {isDoseDay && (
                <div className="text-lg">💉</div>
              )}
              {impact === 'high' && !isDoseDay && (
                <div className="text-xs mt-1">⚠️</div>
              )}
              {impact === 'none' && (
                <div className="text-xs mt-1">✨</div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 space-y-2 text-xs text-slate">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-warning/15 border border-warning/30 rounded" />
          <span>Dose day / Day after (expect side effects)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/10 border border-primary/25 rounded"></div>
          <span>Recovery (side effects easing)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cloud border border-line rounded"></div>
          <span>Good days (typically feel best)</span>
        </div>
      </div>
    </div>
  );
}

// Add to settings or progress page for full week view

