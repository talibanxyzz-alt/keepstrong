export default function PhotosLoading() {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-line rounded-lg" />
        <div className="h-10 w-32 bg-line rounded-lg" />
      </div>

      {/* Photo angle buttons */}
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-line rounded-xl" />
        ))}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-line rounded-xl" />
        ))}
      </div>
    </div>
  );
}
