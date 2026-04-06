"use client";

type Props = {
  lastSets: {
    set_number: number;
    reps: number;
    weight_kg: number;
  }[];
  sessionDate: string;
};

export function LastSessionBanner({ lastSets, sessionDate }: Props) {
  if (!lastSets || lastSets.length === 0) return null;

  const dateLabel = new Date(sessionDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const summary = lastSets.map((s) => `${s.reps} reps @ ${s.weight_kg}kg`).join(", ");

  return (
    <div className="mb-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-amber-600">Last session ({dateLabel}):</span>
        <span className="text-sm text-amber-700">{summary}</span>
      </div>
      <p className="mt-0.5 text-xs text-amber-500">Beat it today 💪</p>
    </div>
  );
}
