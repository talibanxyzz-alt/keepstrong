# Performance Quick Reference

Quick commands and code snippets for performance optimization.

## 🚀 Quick Commands

```bash
# Build and analyze bundle
npm run build

# Run Lighthouse audit
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Check bundle size
npx @next/bundle-analyzer

# Profile rendering
npm run dev -- --profile

# Apply database indexes
# (Run in Supabase SQL Editor)
supabase/migrations/005_performance_indexes.sql
```

## 📸 Image Optimization

```typescript
// Use optimized image component
import { OptimizedImage } from '@/components/optimized/OptimizedImage';

<OptimizedImage
  src={url}
  alt="Description"
  width={400}
  height={300}
  quality={85}
/>

// Compress before upload
import { compressImage } from '@/lib/utils/image';
const blob = await compressImage(file, { maxWidth: 1920, quality: 0.8 });
```

## 📊 Data Fetching

```typescript
// Use SWR for caching
import { useProteinLogs } from '@/lib/swr/config';
const { data, isLoading, error } = useProteinLogs(userId, date);

// Optimistic updates
import { optimisticUpdate } from '@/lib/swr/config';
optimisticUpdate(key, (current) => [...current, newItem], revalidate);

// Prefetch on hover
import { prefetchData } from '@/lib/swr/config';
<Link onMouseEnter={() => prefetchData('/api/data')}>
```

## ⚡ Code Splitting

```typescript
// Dynamic import
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
});

// Lazy charts
import { BarChart } from '@/components/optimized/LazyChart';
```

## 🗄️ Database

```typescript
// Select specific columns
const { data } = await supabase
  .from('table')
  .select('id, name, value') // Not '*'
  .eq('user_id', userId);

// Use indexes (already created in migration)
// - protein_logs(user_id, date)
// - workout_sessions(user_id, started_at)
// - weight_logs(user_id, logged_at)

// Batch queries
const { data } = await supabase
  .from('sessions')
  .select('id, workout:workouts(name)');
```

## 📈 Monitoring

```typescript
// Track page load
import { performanceMonitor } from '@/lib/performance/monitoring';
performanceMonitor.trackPageLoad('/dashboard');

// Track API call
const start = performance.now();
await fetch('/api/data');
performanceMonitor.trackAPICall('/api/data', start, true);

// View summary
performanceMonitor.logSummary();
```

## 🎨 Loading States

```typescript
// Use skeletons
import { DashboardSkeleton } from '@/components/ui/skeletons';
{isLoading ? <DashboardSkeleton /> : <Content />}

// Suspense boundary
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

## 🔧 Configuration

**next.config.js:**
```javascript
experimental: {
  optimizePackageImports: ['recharts', 'lucide-react'],
}
```

**Font optimization:**
```typescript
const inter = Inter({ display: 'swap' });
```

## 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | <1.5s | Check Lighthouse |
| LCP | <2.5s | Check Lighthouse |
| TTI | <3.0s | Check Lighthouse |
| CLS | <0.1 | Check Lighthouse |
| Score | >90 | Check Lighthouse |

## 🔍 Debug Slow Queries

```typescript
// Console warns automatically for:
// - Page loads >3s
// - API calls >1s
// - DB queries >1s

// Check Network tab in DevTools
// Look for:
// - Slow requests (>1s)
// - Large payloads (>500KB)
// - Many requests (>50)
```

## 📦 Bundle Optimization

```bash
# Remove unused dependencies
npm uninstall package-name

# Update dependencies
npm update

# Check for duplicates
npm dedupe
```

## 🚀 Quick Wins

1. ✅ Add indexes to database
2. ✅ Use OptimizedImage for all images
3. ✅ Enable SWR caching
4. ✅ Add loading skeletons
5. ✅ Use dynamic imports for charts
6. ✅ Compress images before upload
7. ✅ Select specific columns from DB
8. ✅ Enable Vercel Analytics

## 📱 Mobile Testing

```bash
# Chrome DevTools
# 1. Open DevTools (F12)
# 2. Toggle device toolbar (Ctrl+Shift+M)
# 3. Select "Slow 3G" network
# 4. Test performance
```

## 🔄 Cache Strategy

| Data Type | Strategy | TTL |
|-----------|----------|-----|
| Protein logs | Realtime | 30s |
| User profile | Standard | 2min |
| Workout programs | Static | 1hr |
| Progress photos | Standard | 15min |

---

**Keep this handy while coding!** 🚀

