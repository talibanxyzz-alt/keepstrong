# Performance Optimization Guide

Complete guide to the performance optimizations implemented in the GLP-1 Fitness Tracker.

## 🎯 Performance Goals

Target metrics:
- ✅ Lighthouse Performance Score: >90
- ✅ Time to Interactive (TTI): <3s
- ✅ First Contentful Paint (FCP): <1.5s
- ✅ Largest Contentful Paint (LCP): <2.5s
- ✅ Cumulative Layout Shift (CLS): <0.1

## 📊 Performance Monitoring

### 1. Performance Monitor (`/lib/performance/monitoring.ts`)

Tracks:
- Page load times
- API response times
- Database query times
- Core Web Vitals (FCP, LCP, CLS, FID)

**Usage:**
```typescript
import { performanceMonitor } from '@/lib/performance/monitoring';

// Track page load
performanceMonitor.trackPageLoad('/dashboard');

// Track API call
const startTime = performance.now();
await fetchData();
performanceMonitor.trackAPICall('/api/protein', startTime, true);

// View summary
performanceMonitor.logSummary();
```

**Alerts:**
- Warns if page load >3s
- Warns if API call >1s
- Warns if database query >1s

### 2. Vercel Analytics

Integrated with `@vercel/analytics` for production monitoring.

## 🖼️ Image Optimization

### 1. Next.js Image Component

Automatic optimizations:
- WebP/AVIF format conversion
- Responsive sizing
- Lazy loading
- Blur placeholders

**Configuration** (`next.config.js`):
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

### 2. Progress Photo Optimization

**Before upload:**
- Resize to max 1920×1920
- Compress to 80% quality
- Convert to JPEG

**Usage:**
```typescript
import { compressImage } from '@/lib/utils/image';

const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
});
```

### 3. Optimized Image Components

Use these instead of `<img>`:
```typescript
import { OptimizedImage, ProgressPhoto, Avatar } from '@/components/optimized/OptimizedImage';

<OptimizedImage
  src="/photo.jpg"
  alt="Progress photo"
  width={400}
  height={533}
  quality={85}
/>
```

## ⚡ Code Splitting

### 1. Dynamic Imports

Heavy components loaded only when needed:

**Charts:**
```typescript
import { BarChart, LineChart } from '@/components/optimized/LazyChart';

// Recharts is loaded only when chart renders
<BarChart data={data}>...</BarChart>
```

**Modals:**
```typescript
const EditModal = dynamic(() => import('./EditModal'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 2. Route-based Splitting

Next.js automatically splits by route. Each page is a separate bundle.

## 🔄 Data Fetching & Caching

### 1. SWR Configuration (`/lib/swr/config.ts`)

Stale-while-revalidate strategy with intelligent caching.

**Configurations:**
- **Realtime** (30s refresh): Protein logs, workout sessions
- **Standard** (2min refresh): User profile, progress
- **Static** (1hr refresh): Workout programs, settings
- **Manual**: No auto-refresh

**Usage:**
```typescript
import { useProteinLogs, useWorkoutPrograms } from '@/lib/swr/config';

// Realtime data
const { data, isLoading } = useProteinLogs(userId, date);

// Cached data
const { data: programs } = useWorkoutPrograms();
```

### 2. Optimistic Updates

Update UI immediately, sync in background:
```typescript
import { optimisticUpdate } from '@/lib/swr/config';

optimisticUpdate(
  '/api/protein',
  (current) => [...current, newLog],
  revalidate
);
```

### 3. Prefetching

Prefetch data on link hover:
```typescript
import { prefetchData } from '@/lib/swr/config';

<Link 
  href="/dashboard"
  onMouseEnter={() => prefetchData('/api/dashboard')}
>
```

### 4. Client-side Cache (`/lib/performance/cache.ts`)

Manual caching for expensive calculations:
```typescript
import { cacheManager, CACHE_KEYS, CACHE_TTL } from '@/lib/performance/cache';

// Get from cache
const cached = cacheManager.get(CACHE_KEYS.WORKOUT_PROGRAMS);

// Set in cache
cacheManager.set(
  CACHE_KEYS.WORKOUT_PROGRAMS,
  data,
  CACHE_TTL.WORKOUT_PROGRAMS
);
```

## 🗄️ Database Optimization

### 1. Indexes (`/supabase/migrations/005_performance_indexes.sql`)

Added indexes on:
- `protein_logs(user_id, date)`
- `workout_sessions(user_id, started_at)`
- `weight_logs(user_id, logged_at)`
- `progress_photos(user_id, taken_at)`

**Run migration:**
```bash
# In Supabase SQL Editor
Run: supabase/migrations/005_performance_indexes.sql
```

### 2. Select Only Needed Columns

**Bad:**
```typescript
const { data } = await supabase.from('profiles').select('*');
```

**Good:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, daily_protein_target_g');
```

### 3. Batch Queries

Fetch related data in one query:
```typescript
const { data } = await supabase
  .from('workout_sessions')
  .select(`
    id,
    started_at,
    workout:workouts(name),
    sets:exercise_sets(weight_kg, reps)
  `);
```

## 📦 Bundle Size Optimization

### 1. Analyze Bundle

```bash
npm run build
```

Check `.next/analyze/` for bundle report.

### 2. Tree Shaking

Import only what you need:

**Bad:**
```typescript
import * as Recharts from 'recharts';
```

**Good:**
```typescript
import { BarChart, Bar, XAxis } from 'recharts';
```

### 3. Remove Unused Dependencies

```bash
npm uninstall unused-package
```

### 4. Optimize Package Imports

Configured in `next.config.js`:
```javascript
experimental: {
  optimizePackageImports: [
    'recharts',
    'lucide-react',
    '@supabase/supabase-js',
  ],
}
```

## 🎨 Loading States

### 1. Skeleton Loaders

Show immediately (no waiting):
```typescript
import { DashboardSkeleton } from '@/components/ui/skeletons';

{isLoading ? <DashboardSkeleton /> : <Dashboard data={data} />}
```

### 2. Suspense Boundaries

```typescript
import { Suspense } from 'react';

<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### 3. Progressive Loading

Load critical data first, then secondary:
```typescript
// Load profile first
const { data: profile } = useUserProfile(userId);

// Then load workouts
const { data: workouts } = useRecentWorkouts(userId);
```

## 🚀 Next.js Optimizations

### 1. Font Optimization

Using `font-display: swap`:
```typescript
const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Shows fallback until font loads
});
```

### 2. Server Components

Use Server Components by default, Client Components only when needed:

**Server Component** (default):
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData(); // Direct DB access
  return <DashboardClient data={data} />;
}
```

**Client Component** (when needed):
```typescript
'use client'; // Only add when you need interactivity
```

### 3. Parallel Data Fetching

Fetch multiple queries in parallel:
```typescript
const [profile, logs, sessions] = await Promise.all([
  fetchProfile(),
  fetchProteinLogs(),
  fetchWorkoutSessions(),
]);
```

### 4. Static Generation

For pages that don't change often:
```typescript
export const revalidate = 3600; // Revalidate every hour
```

## 📱 Mobile Optimization

### 1. Reduce JavaScript

- Use CSS for animations (not JS)
- Minimize event listeners
- Debounce/throttle scroll events

### 2. Lazy Load Below Fold

```typescript
<div className="lazy-load">
  {isVisible && <HeavyComponent />}
</div>
```

### 3. Touch Optimization

- Large touch targets (min 44×44px)
- No hover-dependent features
- Fast tap response (<100ms)

## 🔍 Lighthouse Audit

### Run Audit

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Mobile" + "Performance"
4. Click "Analyze page load"

### Fix Common Issues

**Eliminate render-blocking resources:**
- Use `font-display: swap`
- Inline critical CSS
- Defer non-critical JS

**Reduce unused JavaScript:**
- Use dynamic imports
- Remove unused dependencies

**Properly size images:**
- Use Next.js Image component
- Compress images before upload

**Minimize main-thread work:**
- Use Web Workers for heavy calculations
- Debounce expensive operations

**Avoid enormous network payloads:**
- Enable compression
- Cache API responses
- Paginate large lists

## 📈 Monitoring in Production

### 1. Vercel Analytics

Automatically tracks:
- Real User Metrics (RUM)
- Core Web Vitals
- Page load performance

### 2. Custom Metrics

Track custom events:
```typescript
import { performanceMonitor } from '@/lib/performance/monitoring';

performanceMonitor.trackCustom('workout_completed', duration, {
  exercises: count,
});
```

### 3. Error Tracking

Integrate Sentry for production errors:
```typescript
// lib/errors/handler.ts
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error);
}
```

## 🎯 Performance Checklist

Before deploying:

- [ ] Run Lighthouse audit (score >90)
- [ ] Check bundle size (`npm run build`)
- [ ] Test on slow 3G network
- [ ] Test on low-end mobile device
- [ ] Verify images are optimized
- [ ] Check for unused dependencies
- [ ] Enable compression
- [ ] Set up caching headers
- [ ] Add loading states everywhere
- [ ] Test error states
- [ ] Verify Core Web Vitals

## 🔧 Quick Wins

Easy performance improvements:

1. **Add `loading.tsx` to all routes**
   ```bash
   touch app/dashboard/loading.tsx
   ```

2. **Use dynamic imports for charts**
   ```typescript
   const Chart = dynamic(() => import('./Chart'));
   ```

3. **Compress images before upload**
   ```typescript
   const compressed = await compressImage(file);
   ```

4. **Enable SWR caching**
   ```typescript
   const { data } = useSWR('/api/data', fetcher);
   ```

5. **Add database indexes**
   ```sql
   CREATE INDEX idx_name ON table(column);
   ```

## 📚 Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals](https://web.dev/vitals/)
- [SWR Documentation](https://swr.vercel.app/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Performance is a feature!** Keep monitoring and optimizing. 🚀

