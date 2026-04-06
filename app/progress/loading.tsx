export default function ProgressLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-8 w-40 bg-line rounded-lg" />

      {/* Tab bar */}
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-line rounded-lg" />
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-xl border bg-surface p-5 space-y-4">
        <div className="h-5 w-32 bg-line rounded" />
        <div className="h-48 w-full bg-cloud rounded-lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-4 space-y-2">
            <div className="h-4 w-16 bg-line rounded" />
            <div className="h-7 w-20 bg-line rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
