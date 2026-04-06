export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-line rounded-lg" />
        <div className="h-8 w-24 bg-line rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-4 space-y-3">
            <div className="h-4 w-20 bg-line rounded" />
            <div className="h-8 w-16 bg-line rounded" />
            <div className="h-3 w-24 bg-cloud rounded" />
          </div>
        ))}
      </div>

      {/* Protein progress bar */}
      <div className="rounded-xl border bg-surface p-5 space-y-3">
        <div className="h-5 w-40 bg-line rounded" />
        <div className="h-4 w-full bg-cloud rounded-full" />
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-cloud rounded" />
          <div className="h-3 w-16 bg-cloud rounded" />
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-5 space-y-3">
            <div className="h-5 w-32 bg-line rounded" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="h-12 w-full bg-cloud rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
