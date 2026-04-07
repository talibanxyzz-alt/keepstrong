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
    iconColor: "text-primary",
    panel: "border-primary/20 bg-primary/5",
    title: "Injection day",
    message:
      "Today is your dose day. A lighter workout or rest is a great choice — your body is adjusting.",
    workoutSuggestion:
      "Consider: walking, light stretching, or a low-intensity mobility session.",
  },
  day_after: {
    icon: AlertTriangle,
    iconColor: "text-warning",
    panel: "border-warning/25 bg-warning/10",
    title: "Day after injection",
    message:
      "Many GLP-1 users feel lowest energy today. Your body is working hard — training lighter is smart, not weak.",
    workoutSuggestion:
      "Consider: a shorter session, reduced weight (−20%), or a full rest day.",
  },
  two_days_after: {
    icon: Zap,
    iconColor: "text-success",
    panel: "border-success/25 bg-success/10",
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
    <div className={`rounded-xl border p-4 ${config.panel}`}>
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} aria-hidden />
        <div>
          <p className="text-sm font-semibold text-charcoal">{config.title}</p>
          {medicationName ? (
            <p className="mt-0.5 text-xs text-slate">{medicationName}</p>
          ) : null}
          <p className="mt-0.5 text-sm leading-relaxed text-charcoal/90">{config.message}</p>
          {config.workoutSuggestion ? (
            <p className="mt-1 text-xs text-slate italic">{config.workoutSuggestion}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
