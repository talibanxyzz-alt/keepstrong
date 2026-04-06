/**
 * Small pill used to label Premium-only features (matches pricing / upgrade styling).
 */
export function PremiumFeatureBadge() {
  return (
    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-xs font-medium text-purple-700">
      ✨ Premium feature
    </div>
  );
}
