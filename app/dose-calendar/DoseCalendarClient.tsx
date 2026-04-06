'use client';

import { useState } from 'react';
import { Syringe, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  medication_type: string | null;
  dose_day_of_week: number | null;
  dose_time: string | null;
  started_medication_at: string | null;
}

export default function DoseCalendarClient({ profile }: { profile: Profile | null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!profile?.medication_type || profile.dose_day_of_week === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-charcoal mb-1">Dose Calendar</h1>
        <p className="text-sm text-slate mb-8">Track your weekly GLP-1 medication schedule</p>

        <div className="bg-surface rounded-lg border border-dashed border-line-strong p-12 text-center">
          <Syringe className="w-8 h-8 text-slate/50 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-2">No medication schedule set</h2>
          <p className="text-sm text-slate mb-6">
            Configure your GLP-1 medication schedule in settings to see your dose calendar.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors text-sm font-medium"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isDoseDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.getDay() === profile.dose_day_of_week;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < today;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const doseDayName = dayNames[profile.dose_day_of_week];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const previousMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">Dose Calendar</h1>
        <p className="text-sm text-slate mt-0.5">Your weekly {profile.medication_type} schedule</p>
      </div>

      {/* Medication Info */}
      <div className="bg-surface rounded-lg border border-line p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 text-sm text-charcoal">
            <p className="font-medium text-charcoal mb-2">Medication Schedule</p>
            <div className="flex items-center gap-2">
              <span className="text-slate">Medication:</span>
              <span>{profile.medication_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate">Dose Day:</span>
              <span>Every {doseDayName}</span>
            </div>
            {profile.dose_time && (
              <div className="flex items-center gap-2">
                <span className="text-slate">Time:</span>
                <span>{profile.dose_time}</span>
              </div>
            )}
            {profile.started_medication_at && (
              <div className="flex items-center gap-2">
                <span className="text-slate">Started:</span>
                <span>
                  {new Date(profile.started_medication_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
          <Link href="/settings" className="text-sm text-slate hover:text-charcoal">
            Edit
          </Link>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-surface rounded-lg border border-line overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <button
            onClick={previousMonth}
            className="p-1.5 hover:bg-cloud rounded-md transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-slate" />
          </button>

          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-charcoal">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button
              onClick={goToToday}
              className="text-xs text-slate hover:text-charcoal"
            >
              Today
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-cloud rounded-md transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-slate" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-5">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate/60 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const doseDay = isDoseDay(day);
              const today = isToday(day);
              const past = isPastDay(day);

              return (
                <div
                  key={day}
                  className={`
                    aspect-square rounded-md flex items-center justify-center
                    text-sm font-medium relative
                    ${
                      doseDay && today
                        ? 'bg-charcoal text-white ring-2 ring-charcoal ring-offset-2'
                        : doseDay && !past
                        ? 'bg-charcoal text-white'
                        : doseDay && past
                        ? "bg-primary/75 text-white"
                        : today
                        ? 'bg-cloud text-charcoal ring-1 ring-slate/40'
                        : past
                        ? 'text-slate/50'
                        : 'text-charcoal hover:bg-cloud'
                    }
                  `}
                >
                  {day}
                  {doseDay && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <Syringe className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 bg-cloud border-t border-line flex items-center gap-5 text-xs text-slate">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-charcoal rounded flex items-center justify-center">
              <Syringe className="w-3 h-3 text-white" />
            </div>
            Dose Day
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-primary/75 rounded" />
            Past Dose
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-cloud rounded ring-1 ring-slate/40" />
            Today
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-surface rounded-lg border border-line p-5">
        <h3 className="font-medium text-charcoal mb-3">Dose Day Tips</h3>
        <ul className="space-y-2 text-sm text-slate">
          {[
            'Take your dose at the same time each week for consistency.',
            'Protein needs may be higher 48–72 hours after your injection.',
            'Stay hydrated and eat smaller, more frequent meals.',
            'Track how you feel after each dose to optimise your routine.',
            'Light exercise on dose day can help reduce side effects.',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-slate/50 mt-0.5">—</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
