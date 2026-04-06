export default function AchievementsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-8 w-44 bg-line rounded-lg" />

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-5 space-y-2">
            <div className="h-4 w-24 bg-line rounded" />
            <div className="h-10 w-16 bg-line rounded" />
          </div>
        ))}
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-4 space-y-2">
            <div className="h-10 w-10 bg-line rounded-full mx-auto" />
            <div className="h-4 w-24 bg-line rounded mx-auto" />
            <div className="h-3 w-full bg-cloud rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
