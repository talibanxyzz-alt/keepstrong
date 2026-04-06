# Performance Optimization Examples

Practical examples showing how to implement performance optimizations in your components.

## 🖼️ Image Optimization Examples

### Before: Regular `<img>` Tag
```typescript
// ❌ BAD: No optimization, no lazy loading, no compression
<img src={photo.url} alt="Progress photo" />
```

### After: Optimized Image Component
```typescript
// ✅ GOOD: Automatic optimization, lazy loading, blur placeholder
import { OptimizedImage } from '@/components/optimized/OptimizedImage';

<OptimizedImage
  src={photo.url}
  alt="Progress photo"
  width={400}
  height={533}
  quality={85}
/>
```

### Progress Photos with Compression
```typescript
'use client';

import { useState } from 'react';
import { compressImage } from '@/lib/utils/image';
import { ProgressPhoto } from '@/components/optimized/OptimizedImage';

export function PhotoUpload() {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    
    try {
      // Compress before upload
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });
      
      // Upload compressed image
      const url = await uploadToSupabase(compressed);
      
      // Save to database
      await savePhoto(url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((photo) => (
        <ProgressPhoto
          key={photo.id}
          src={photo.url}
          angle={photo.angle}
          takenAt={photo.taken_at}
        />
      ))}
    </div>
  );
}
```

## 📊 Data Fetching with SWR

### Before: useEffect with fetch
```typescript
// ❌ BAD: No caching, no revalidation, manual loading state
'use client';

import { useEffect, useState } from 'react';

export function ProteinLogs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/protein')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

### After: SWR with Caching
```typescript
// ✅ GOOD: Automatic caching, revalidation, built-in loading state
'use client';

import useSWR from 'swr';
import { SWR_CONFIGS } from '@/lib/swr/config';
import { swrFetcher } from '@/lib/data/fetchers';
import { ProteinLogsSkeleton } from '@/components/ui/skeletons';

export function ProteinLogs({ userId, date }: { userId: string; date: string }) {
  const { data, isLoading, error, mutate } = useSWR(
    `/api/protein/${userId}?date=${date}`,
    swrFetcher,
    SWR_CONFIGS.realtime // Auto-refreshes every 30s
  );

  if (error) return <ErrorState message="Failed to load protein logs" />;
  if (isLoading) return <ProteinLogsSkeleton />;

  return (
    <div>
      {data.map((log) => (
        <ProteinLogItem key={log.id} log={log} onUpdate={mutate} />
      ))}
    </div>
  );
}
```

## ⚡ Code Splitting with Dynamic Imports

### Before: Direct Import
```typescript
// ❌ BAD: Chart library loaded immediately, even if not visible
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export function ProteinChart({ data }) {
  return (
    <BarChart data={data}>
      <Bar dataKey="protein" />
      <XAxis dataKey="date" />
      <YAxis />
    </BarChart>
  );
}
```

### After: Lazy Loading
```typescript
// ✅ GOOD: Chart library loaded only when component renders
import { BarChart, Bar, XAxis, YAxis } from '@/components/optimized/LazyChart';

export function ProteinChart({ data }: { data: any[] }) {
  return (
    <BarChart data={data}>
      <Bar dataKey="protein" fill="#059669" />
      <XAxis dataKey="date" />
      <YAxis />
    </BarChart>
  );
}
```

### Lazy Modal
```typescript
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeletons';

// Modal loaded only when opened
const EditProteinModal = dynamic(
  () => import('@/components/features/EditProteinLogModal'),
  {
    loading: () => <Skeleton className="h-96 w-full" />,
    ssr: false,
  }
);

export function ProteinLogItem({ log }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <button onClick={() => setIsEditing(true)}>Edit</button>
      
      {isEditing && (
        <EditProteinModal
          log={log}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
```

## 🔄 Optimistic Updates

### Before: Wait for Server
```typescript
// ❌ BAD: UI waits for server response
async function deleteLog(id: string) {
  setLoading(true);
  await fetch(`/api/protein/${id}`, { method: 'DELETE' });
  await refetch(); // Wait for fresh data
  setLoading(false);
}
```

### After: Optimistic Update
```typescript
// ✅ GOOD: UI updates immediately, syncs in background
import { optimisticUpdate } from '@/lib/swr/config';

async function deleteLog(id: string) {
  // Update UI immediately
  optimisticUpdate(
    `/api/protein/${userId}`,
    (current) => current.filter((log) => log.id !== id),
    async () => {
      // Then sync with server
      await fetch(`/api/protein/${id}`, { method: 'DELETE' });
    }
  );
  
  toast.success('Protein log deleted');
}
```

## 🗄️ Database Query Optimization

### Before: Select All Columns
```typescript
// ❌ BAD: Fetches unnecessary data
export async function fetchUserProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return data;
}
```

### After: Select Specific Columns
```typescript
// ✅ GOOD: Fetches only needed data
export async function fetchUserProfile(userId: string) {
  const startTime = performance.now();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, daily_protein_target_g, current_weight_kg')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  
  // Track query performance
  performanceMonitor.trackQuery('fetch_user_profile', startTime);
  
  return data;
}
```

### Batch Related Queries
```typescript
// ✅ EXCELLENT: Fetch related data in one query
export async function fetchWorkoutSession(sessionId: string) {
  const { data } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      completed_at,
      workout:workouts (
        name,
        description,
        exercises (
          id,
          name,
          target_sets,
          target_reps_min,
          target_reps_max
        )
      ),
      sets:exercise_sets (
        weight_kg,
        reps_completed,
        exercise_id
      )
    `)
    .eq('id', sessionId)
    .single();
  
  return data;
}
```

## 📈 Performance Monitoring

### Track Page Load
```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/monitoring';

export default function DashboardPage() {
  useEffect(() => {
    performanceMonitor.trackPageLoad('/dashboard');
    performanceMonitor.getCoreWebVitals();
  }, []);

  return <Dashboard />;
}
```

### Track API Calls
```typescript
// Custom hook for tracking
import { performanceMonitor } from '@/lib/performance/monitoring';

export async function fetchProteinLogs(userId: string, date: string) {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`/api/protein/${userId}?date=${date}`);
    const data = await response.json();
    
    performanceMonitor.trackAPICall(
      `/api/protein/${userId}`,
      startTime,
      response.ok
    );
    
    return data;
  } catch (error) {
    performanceMonitor.trackAPICall(
      `/api/protein/${userId}`,
      startTime,
      false
    );
    throw error;
  }
}
```

### View Performance Summary
```typescript
// Add to development tools
if (process.env.NODE_ENV === 'development') {
  // Log performance summary on page unload
  window.addEventListener('beforeunload', () => {
    performanceMonitor.logSummary();
  });
  
  // Or add a keyboard shortcut
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      performanceMonitor.logSummary();
    }
  });
}
```

## 🎨 Loading States

### Skeleton for Lists
```typescript
import { ProteinLogsSkeleton } from '@/components/ui/skeletons';

export function ProteinTimeline({ userId, date }) {
  const { data, isLoading } = useProteinLogs(userId, date);

  if (isLoading) {
    return <ProteinLogsSkeleton count={3} />;
  }

  return (
    <div className="space-y-2">
      {data.map((log) => (
        <ProteinLogCard key={log.id} log={log} />
      ))}
    </div>
  );
}
```

### Progressive Loading
```typescript
'use client';

import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Load critical data first */}
      <Suspense fallback={<CardSkeleton />}>
        <TodayProtein />
      </Suspense>
      
      {/* Then load secondary data */}
      <Suspense fallback={<CardSkeleton />}>
        <NextWorkout />
      </Suspense>
      
      {/* Load heavy charts last */}
      <Suspense fallback={<ChartSkeleton />}>
        <WeeklySummary />
      </Suspense>
    </div>
  );
}
```

## 🔍 Prefetching

### Prefetch on Hover
```typescript
'use client';

import Link from 'next/link';
import { prefetchData } from '@/lib/swr/config';

export function WorkoutCard({ workout }) {
  return (
    <Link
      href={`/workouts/${workout.id}`}
      onMouseEnter={() => {
        // Prefetch workout data when user hovers
        prefetchData(`/api/workouts/${workout.id}`);
      }}
    >
      <div className="card">
        <h3>{workout.name}</h3>
        <p>{workout.description}</p>
      </div>
    </Link>
  );
}
```

### Prefetch Next Page
```typescript
'use client';

import { useEffect } from 'react';
import { prefetchData } from '@/lib/swr/config';

export function ProgressPage({ week }) {
  useEffect(() => {
    // Prefetch next/previous weeks
    prefetchData(`/api/progress?week=${week + 1}`);
    prefetchData(`/api/progress?week=${week - 1}`);
  }, [week]);

  return <ProgressView week={week} />;
}
```

## 📦 Bundle Size Reduction

### Tree-shakable Imports
```typescript
// ❌ BAD: Imports everything
import * as Icons from 'lucide-react';

// ✅ GOOD: Import only what you need
import { Dumbbell, TrendingUp, Camera } from 'lucide-react';
```

### Conditional Imports
```typescript
// Load heavy feature only for premium users
'use client';

export function MealPlanner({ isPremium }) {
  if (!isPremium) {
    return <UpgradePrompt feature="meal_planning" />;
  }

  // Import only loaded for premium users
  const MealPlanningModule = lazy(() => import('./MealPlanningModule'));

  return (
    <Suspense fallback={<Skeleton />}>
      <MealPlanningModule />
    </Suspense>
  );
}
```

## 🚀 Complete Example: Optimized Dashboard

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { DashboardClient } from './DashboardClient';
import { DashboardSkeleton } from '@/components/ui/skeletons';

// Server Component - fetch data
export default async function DashboardPage() {
  // Fetch critical data in parallel
  const [profile, todayLogs] = await Promise.all([
    fetchUserProfile(),
    fetchTodayProteinLogs(),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient 
        initialProfile={profile}
        initialLogs={todayLogs}
      />
    </Suspense>
  );
}

// app/dashboard/DashboardClient.tsx
'use client';

import { useEffect } from 'react';
import useSWR from 'swr';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { SWR_CONFIGS } from '@/lib/swr/config';
import { BarChart } from '@/components/optimized/LazyChart';
import { OptimizedImage } from '@/components/optimized/OptimizedImage';

export function DashboardClient({ initialProfile, initialLogs }) {
  // Track page load
  useEffect(() => {
    performanceMonitor.trackPageLoad('/dashboard');
    performanceMonitor.getCoreWebVitals();
  }, []);

  // Use SWR with initial data for instant display
  const { data: profile } = useSWR(
    '/api/profile',
    null,
    {
      ...SWR_CONFIGS.standard,
      fallbackData: initialProfile,
    }
  );

  const { data: logs } = useSWR(
    '/api/protein/today',
    null,
    {
      ...SWR_CONFIGS.realtime,
      fallbackData: initialLogs,
    }
  );

  return (
    <div className="space-y-6">
      {/* Protein card with optimized rendering */}
      <TodayProteinCard logs={logs} target={profile.daily_protein_target_g} />
      
      {/* Chart loaded lazily */}
      <BarChart data={logs} />
      
      {/* Images optimized */}
      {profile.avatar_url && (
        <OptimizedImage
          src={profile.avatar_url}
          alt={profile.full_name}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
    </div>
  );
}
```

---

These examples demonstrate real-world usage of all performance optimizations! 🚀

