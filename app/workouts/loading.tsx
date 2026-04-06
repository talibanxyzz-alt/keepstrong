export default function WorkoutsLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      <div className="h-8 w-40 bg-line rounded-lg" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-surface p-5 space-y-3">
            <div className="h-5 w-32 bg-line rounded" />
            <div className="h-4 w-full bg-cloud rounded" />
            <div className="h-4 w-3/4 bg-cloud rounded" />
            <div className="flex gap-2 pt-2">
              <div className="h-8 w-20 bg-line rounded-lg" />
              <div className="h-8 w-20 bg-cloud rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
