# Performance Optimization Checklist

Use this checklist before deploying to production.

## 📋 Pre-Deployment Checklist

### 🗄️ Database Performance
- [ ] Run performance indexes migration (`005_performance_indexes.sql`)
- [ ] Verify all queries use `select('specific, columns')` instead of `select('*')`
- [ ] Check that frequently queried columns are indexed
- [ ] Test query performance in production-like data volumes
- [ ] Enable RLS policies for security (doesn't slow down queries with proper indexes)

### 🖼️ Image Optimization
- [ ] Replace all `<img>` tags with `OptimizedImage` component
- [ ] Compress progress photos before upload (use `compressImage()`)
- [ ] Add blur placeholders to all images
- [ ] Set appropriate image sizes and quality levels
- [ ] Enable WebP/AVIF formats in `next.config.js`
- [ ] Lazy load images below the fold

### ⚡ Code Splitting
- [ ] Use `LazyChart` for all Recharts components
- [ ] Dynamically import modals and heavy components
- [ ] Lazy load features only used by premium users
- [ ] Check bundle size with `npm run build`
- [ ] Verify main bundle is <200KB gzipped

### 🔄 Data Fetching & Caching
- [ ] Replace `useEffect` + `fetch` with SWR hooks
- [ ] Configure appropriate cache TTLs for different data types
- [ ] Implement optimistic updates for instant UI feedback
- [ ] Prefetch data on link hover
- [ ] Use initial data from Server Components
- [ ] Set up revalidation strategies

### 🎨 Loading States
- [ ] Add `loading.tsx` to all route segments
- [ ] Show skeleton loaders while data loads
- [ ] Implement progressive loading (critical → secondary → nice-to-have)
- [ ] Add Suspense boundaries where appropriate
- [ ] Never show blank screens or spinners

### 📱 Mobile Performance
- [ ] Test on slow 3G network
- [ ] Test on low-end Android device
- [ ] Verify touch targets are ≥44×44px
- [ ] Remove hover-dependent features
- [ ] Optimize for mobile-first

### 🚀 Next.js Optimizations
- [ ] Enable `font-display: swap` for custom fonts
- [ ] Use Server Components by default
- [ ] Add `'use client'` only when necessary
- [ ] Implement parallel data fetching in Server Components
- [ ] Set appropriate cache headers
- [ ] Enable SWC minification

### 📊 Monitoring
- [ ] Add Vercel Analytics to `layout.tsx`
- [ ] Implement performance monitoring in key pages
- [ ] Track Core Web Vitals
- [ ] Set up error tracking (Sentry)
- [ ] Monitor slow queries in production
- [ ] Create performance dashboard

### 🔍 Lighthouse Audit
- [ ] Run Lighthouse on all major pages
- [ ] Achieve Performance score >90
- [ ] Fix all Accessibility issues
- [ ] Address Best Practices warnings
- [ ] Optimize SEO score
- [ ] Check PWA readiness (optional)

### 📦 Bundle Size
- [ ] Run `npm run analyze` to check bundle
- [ ] Remove unused dependencies
- [ ] Verify tree-shaking works correctly
- [ ] Check for duplicate packages
- [ ] Minimize third-party scripts

### 🔐 Security & Performance
- [ ] Enable compression (Gzip/Brotli)
- [ ] Set cache headers correctly
- [ ] Use CDN for static assets
- [ ] Enable HTTP/2
- [ ] Add security headers

## 🎯 Performance Metrics Targets

| Metric | Target | Critical |
|--------|--------|----------|
| **Lighthouse Performance** | >90 | >70 |
| **First Contentful Paint (FCP)** | <1.5s | <2.5s |
| **Largest Contentful Paint (LCP)** | <2.5s | <4.0s |
| **Time to Interactive (TTI)** | <3.0s | <5.0s |
| **Total Blocking Time (TBT)** | <300ms | <600ms |
| **Cumulative Layout Shift (CLS)** | <0.1 | <0.25 |
| **First Input Delay (FID)** | <100ms | <300ms |
| **Bundle Size (main)** | <200KB | <400KB |
| **API Response Time** | <500ms | <1000ms |
| **Database Query Time** | <300ms | <1000ms |

## 📝 Page-Specific Checklist

### Landing Page (/)
- [ ] Optimize hero image
- [ ] Lazy load testimonials
- [ ] Prefetch signup page
- [ ] Add structured data (SEO)
- [ ] Optimize for Core Web Vitals

### Dashboard (/dashboard)
- [ ] Load critical data first (protein today)
- [ ] Lazy load charts
- [ ] Show skeleton immediately
- [ ] Cache user profile
- [ ] Prefetch protein tracking page

### Protein Tracker (/dashboard/protein)
- [ ] Use SWR with realtime config
- [ ] Implement optimistic updates
- [ ] Lazy load chart
- [ ] Compress timeline view
- [ ] Cache today's date

### Workout Pages (/workouts/*)
- [ ] Cache workout programs (static)
- [ ] Prefetch program details on hover
- [ ] Lazy load exercise videos
- [ ] Optimize rest timer (use CSS)
- [ ] Store session state locally

### Progress Page (/progress)
- [ ] Lazy load all charts
- [ ] Compress progress photos
- [ ] Use progressive loading
- [ ] Cache weight logs
- [ ] Optimize photo grid

### Settings Page (/settings)
- [ ] Load in sections
- [ ] Debounce save operations
- [ ] Cache profile data
- [ ] Optimize form validation
- [ ] Use optimistic updates

## 🛠️ Tools to Use

```bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze

# Performance monitoring
# Check browser DevTools > Performance tab

# Network throttling
# Use Chrome DevTools > Network > Slow 3G

# Check Core Web Vitals
# Visit https://pagespeed.web.dev/

# Monitor production
# Use Vercel Analytics dashboard
```

## 🔄 Continuous Monitoring

Set up alerts for:
- Lighthouse score drops below 90
- Bundle size increases >10%
- API response time >1s
- Error rate increases
- Core Web Vitals degradation

## ✅ Sign-off

Before deploying to production:

```
[ ] Database indexes applied
[ ] All images optimized
[ ] Code splitting implemented
[ ] SWR caching configured
[ ] Loading states added
[ ] Lighthouse score >90
[ ] Bundle size checked
[ ] Mobile tested
[ ] Error tracking enabled
[ ] Performance monitoring active
```

**Deployed by:** _______________  
**Date:** _______________  
**Lighthouse Score:** _______________  
**Bundle Size:** _______________

---

**Remember: Performance is a feature, not an afterthought!** 🚀

