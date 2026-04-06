export default function SettingsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse max-w-2xl">
      <div className="h-8 w-32 bg-line rounded-lg" />

      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border bg-surface p-6 space-y-4">
          <div className="h-5 w-40 bg-line rounded" />
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="space-y-1">
                <div className="h-3 w-24 bg-line rounded" />
                <div className="h-10 w-full bg-cloud rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
