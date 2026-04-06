"use client";

import { AlertTriangle, Zap, Calendar } from "lucide-react";
import type { DoseStatus } from "@/lib/dose/getDoseStatus";

type Props = {
  status: DoseStatus;
  medicationName?: string | null;
};

const NUDGE_CONFIG = {
  injection_day: {
    icon: Calendar,
    iconColor: "text-purple-500",
    bg: "bg-purple-50 border-purple-100",
    title: "Injection day",
    message:
      "Today is your dose day. A lighter workout or rest is a great choice — your body is adjusting.",
    workoutSuggestion:
      "Consider: walking, light stretching, or a low-intensity mobility session.",
  },
  day_after: {
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    bg: "bg-amber-50 border-amber-100",
    title: "Day after injection",
    message:
      "Many GLP-1 users feel lowest energy today. Your body is working hard — training lighter is smart, not weak.",
    workoutSuggestion:
      "Consider: a shorter session, reduced weight (−20%), or a full rest day.",
  },
  two_days_after: {
    icon: Zap,
    iconColor: "text-blue-500",
    bg: "bg-blue-50 border-blue-100",
    title: "Recovery day",
    message:
      "Energy typically improves today. You can train normally — listen to your body.",
    workoutSuggestion: null as string | null,
  },
  normal: null,
} as const;

export function DoseNudgeBanner({ status, medicationName }: Props) {
  const config = NUDGE_CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`${config.bg} border rounded-2xl p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        <div>
          <p className="font-semibold text-gray-900 text-sm">{config.title}</p>
          {medicationName ? (
            <p className="text-xs text-gray-500 mt-0.5">{medicationName}</p>
          ) : null}
          <p className="text-sm text-gray-600 mt-0.5">{config.message}</p>
          {config.workoutSuggestion ? (
            <p className="text-xs text-gray-500 mt-1 italic">{config.workoutSuggestion}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
