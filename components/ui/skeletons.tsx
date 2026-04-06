import React from "react";

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-line ${className}`}
      style={{
        animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ...style,
      }}
    />
  );
}

// ============================================================================
// 1. CARD SKELETON
// ============================================================================

interface CardSkeletonProps {
  className?: string;
  height?: string;
}

export function CardSkeleton({ className = "", height = "h-48" }: CardSkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-6 shadow-sm ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <Skeleton className="h-6 w-1/3" />
        
        {/* Content */}
        <div className="space-y-3">
          <Skeleton className={`${height} w-full`} />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. TEXT SKELETON
// ============================================================================

type TextWidth = "sm" | "md" | "lg" | "xl" | "full";

interface TextSkeletonProps {
  width?: TextWidth | string;
  height?: string;
  className?: string;
}

const widthPresets: Record<TextWidth, string> = {
  sm: "w-20",
  md: "w-32",
  lg: "w-48",
  xl: "w-64",
  full: "w-full",
};

export function TextSkeleton({
  width = "md",
  height = "h-4",
  className = "",
}: TextSkeletonProps) {
  const widthClass = width in widthPresets ? widthPresets[width as TextWidth] : width;
  
  return <Skeleton className={`${height} ${widthClass} ${className}`} />;
}

// ============================================================================
// 3. CHART SKELETON
// ============================================================================

interface ChartSkeletonProps {
  bars?: number;
  height?: string;
  className?: string;
}

export function ChartSkeleton({
  bars = 7,
  height = "h-64",
  className = "",
}: ChartSkeletonProps) {
  return (
    <div className={`${height} ${className}`}>
      <div className="flex h-full items-end justify-around gap-2 rounded-lg border border-line bg-surface p-6">
        {Array.from({ length: bars }).map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{
              height: `${40 + ((i * 17) % 45)}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 4. LIST SKELETON
// ============================================================================

interface ListSkeletonProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListSkeleton({
  rows = 5,
  showAvatar = false,
  className = "",
}: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-line bg-surface p-4"
        >
          {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 5. AVATAR SKELETON
// ============================================================================

interface AvatarSkeletonProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function AvatarSkeleton({ size = "md", className = "" }: AvatarSkeletonProps) {
  return <Skeleton className={`rounded-full ${avatarSizes[size]} ${className}`} />;
}

// ============================================================================
// 6. BUTTON SKELETON
// ============================================================================

interface ButtonSkeletonProps {
  width?: string;
  className?: string;
}

export function ButtonSkeleton({ width = "w-24", className = "" }: ButtonSkeletonProps) {
  return <Skeleton className={`h-10 rounded-md ${width} ${className}`} />;
}

// ============================================================================
// COMPOSED SKELETONS FOR COMMON LAYOUTS
// ============================================================================

// Dashboard Skeleton (3 cards)
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Large (2 columns) */}
          <div className="rounded-xl border border-line bg-surface p-6 shadow-sm md:col-span-2">
            <Skeleton className="mb-4 h-6 w-1/3" />
            <div className="mb-6">
              <Skeleton className="mb-2 h-8 w-2/3" />
              <Skeleton className="mb-4 h-6 w-full" />
            </div>
            <div className="space-y-3">
              <ListSkeleton rows={3} />
            </div>
          </div>

          {/* Card 2 */}
          <CardSkeleton height="h-64" />

          {/* Card 3 */}
          <CardSkeleton height="h-48" className="md:col-span-1" />

          {/* Card 4 */}
          <CardSkeleton height="h-48" className="md:col-span-2" />
        </div>
      </div>
    </div>
  );
}

// Protein Page Skeleton (tracker + timeline + chart)
export function ProteinPageSkeleton() {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Progress Card */}
        <div className="mb-8 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Skeleton className="mb-4 h-12 w-1/2" />
          <Skeleton className="mb-2 h-6 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>

        {/* Quick Add Section */}
        <div className="mb-8 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-1/4" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-8 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-1/4" />
          <ListSkeleton rows={5} showAvatar />
        </div>

        {/* Chart Section */}
        <div className="rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Skeleton className="mb-4 h-6 w-1/4" />
          <ChartSkeleton bars={7} height="h-80" />
        </div>
      </div>
    </div>
  );
}

// Workout Skeleton (exercise list)
export function WorkoutSkeleton() {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>

        {/* Workout Info */}
        <div className="mb-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
          <Skeleton className="mb-4 h-8 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Program List Skeleton
export function ProgramListSkeleton() {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Program Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-line bg-surface p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mb-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mb-4 flex gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="mt-4 h-10 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress Page Skeleton
export function ProgressPageSkeleton() {
  return (
    <div className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-8 border-b border-line">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-[-2px] h-8 w-24" />
          ))}
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} height="h-32" />
          ))}
        </div>

        {/* Chart */}
        <div className="mb-8">
          <ChartSkeleton bars={7} height="h-80" />
        </div>

        {/* Additional Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardSkeleton height="h-48" />
          <CardSkeleton height="h-48" />
        </div>
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {/* Header */}
      <div className="flex gap-4 border-b border-line bg-cloud p-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-line p-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}

// Form Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

// Photo Grid Skeleton
export function PhotoGridSkeleton({ photos = 8 }: { photos?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: photos }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
      ))}
    </div>
  );
}

