# Priority Fixes - Quick Reference

**Last Updated:** February 6, 2026  
**Status:** Action Required

---

## 🔴 P0 - CRITICAL (Do These First)

### 1. Remove Build Suppressions (2-3 days)

**File:** `next.config.js`

**Current (BAD):**
```javascript
// Lines 36-43
eslint: {
  ignoreDuringBuilds: true, // ❌ Remove this
},
typescript: {
  ignoreBuildErrors: true,   // ❌ Remove this
},
```

**Fixed (GOOD):**
```javascript
// Remove both suppressions entirely
// Let the build fail if there are errors
```

**Why:** These hide real bugs that could crash your app in production.

---

### 2. Fix TypeScript Errors (3-4 days)

**Run this to see all errors:**
```bash
npm run type-check
```

**30+ errors found. Main issues:**

#### Issue A: Database Query Types

**Current (BAD):**
```typescript
const { data: allProteinLogs } = await supabase
  .from("protein_logs")
  .select("*")
  .eq("user_id", user.id);

// allProteinLogs is typed as 'never[]' ❌
```

**Fixed (GOOD):**
```typescript
const { data: allProteinLogs } = await supabase
  .from("protein_logs")
  .select<"*", Database["public"]["Tables"]["protein_logs"]["Row"]>("*")
  .eq("user_id", user.id);

// Now properly typed ✅
```

#### Issue B: Missing Properties

**File:** `app/dashboard/page.tsx:187`

**Current (BAD):**
```typescript
return {
  profile: {
    id: user.id,
    full_name: profile.full_name,
    daily_protein_target_g: profile.daily_protein_target_g,
    current_weight_kg: profile.current_weight_kg,
    // Missing: dose_day_of_week ❌
  },
  // ...
};
```

**Fixed (GOOD):**
```typescript
return {
  profile: {
    id: user.id,
    full_name: profile.full_name,
    daily_protein_target_g: profile.daily_protein_target_g,
    current_weight_kg: profile.current_weight_kg,
    dose_day_of_week: profile.dose_day_of_week, // ✅ Added
  },
  // ...
};
```

#### Issue C: Stripe API Version

**File:** `app/api/stripe/webhook/route.ts:9`

**Current (BAD):**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // ❌ Wrong version
});
```

**Fixed (GOOD):**
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia', // ✅ Current version
});
```

---

### 3. Add Database Indexes (1 day)

**Create new migration:**
```bash
cd supabase
npx supabase migration new add_performance_indexes
```

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_performance_indexes.sql`

```sql
-- Performance indexes for common queries

-- 1. Protein logs by user and date (dashboard, protein page)
CREATE INDEX IF NOT EXISTS idx_protein_logs_user_date 
  ON protein_logs(user_id, date DESC, logged_at DESC);

-- 2. Workout sessions by user and completion (dashboard, workouts)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_completed 
  ON workout_sessions(user_id, completed_at DESC) 
  WHERE completed_at IS NOT NULL;

-- 3. Active workout sessions (workouts/active page)
CREATE INDEX IF NOT EXISTS idx_workout_sessions_active 
  ON workout_sessions(user_id, started_at DESC) 
  WHERE completed_at IS NULL;

-- 4. User achievements - unviewed (notification badges)
CREATE INDEX IF NOT EXISTS idx_user_achievements_unviewed 
  ON user_achievements(user_id, viewed_at) 
  WHERE viewed_at IS NULL;

-- 5. Weight logs by user (progress page)
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date 
  ON weight_logs(user_id, logged_at DESC);

-- 6. Workout sets by session (workout tracking)
CREATE INDEX IF NOT EXISTS idx_workout_sets_session 
  ON workout_sets(session_id, set_number);

-- 7. Meal rating prompts (post-meal feature)
CREATE INDEX IF NOT EXISTS idx_meal_rating_prompts_user 
  ON meal_rating_prompts(user_id, protein_log_id, dismissed_at);

-- 8. Food ratings by user (food tolerance tracking)
CREATE INDEX IF NOT EXISTS idx_food_ratings_user 
  ON food_ratings(user_id, food_name);

-- Add comments for documentation
COMMENT ON INDEX idx_protein_logs_user_date IS 
  'Optimizes protein log queries by user and date range';
COMMENT ON INDEX idx_workout_sessions_user_completed IS 
  'Optimizes completed workout queries for streaks and history';
COMMENT ON INDEX idx_user_achievements_unviewed IS 
  'Optimizes notification badge counts for unviewed achievements';
```

**Deploy:**
```bash
npx supabase db push
```

**Test Performance:**
```sql
-- Before: ~500ms with 100k records
-- After: ~5ms with 100k records

EXPLAIN ANALYZE
SELECT * FROM protein_logs 
WHERE user_id = 'some-uuid' 
  AND date >= '2026-02-01' 
  AND date <= '2026-02-06'
ORDER BY logged_at DESC;
```

---

## 🟡 P1 - IMPORTANT (Do These Next)

### 4. Add Error Boundaries (2 days)

**Create reusable error boundary:**

**File:** `components/layout/RouteErrorBoundary.tsx`
```typescript
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Route Error:', error, errorInfo);
    // Send to Sentry
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Wrap all major routes:**

**File:** `app/dashboard/page.tsx`
```typescript
import { RouteErrorBoundary } from '@/components/layout/RouteErrorBoundary';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <RouteErrorBoundary>
      <DashboardClient data={data} />
    </RouteErrorBoundary>
  );
}
```

**Do the same for:**
- `app/workouts/programs/page.tsx`
- `app/workouts/active/page.tsx`
- `app/progress/page.tsx`
- `app/settings/page.tsx`
- `app/dashboard/protein/page.tsx`

---

### 5. Improve Accessibility (3-4 days)

**Add ARIA labels to icon buttons:**

**Before:**
```typescript
<button onClick={handleDelete}>
  <X className="h-4 w-4" />
</button>
```

**After:**
```typescript
<button 
  onClick={handleDelete}
  aria-label="Delete protein log entry"
  title="Delete"
>
  <X className="h-4 w-4" />
</button>
```

**Add keyboard navigation:**

**File:** `components/layout/Sidebar.tsx`
```typescript
// Already has keyboard shortcuts ✅
// Add focus management for mobile menu

<button
  onClick={() => setIsMobileMenuOpen(true)}
  aria-label="Open navigation menu"
  aria-expanded={isMobileMenuOpen}
  aria-controls="mobile-menu"
>
  <Menu className="h-6 w-6" />
</button>

<div
  id="mobile-menu"
  role="dialog"
  aria-modal="true"
  aria-label="Navigation menu"
>
  {/* Menu content */}
</div>
```

**Add focus trap in modals:**

```bash
npm install focus-trap-react
```

```typescript
import FocusTrap from 'focus-trap-react';

<FocusTrap>
  <div role="dialog" aria-modal="true">
    {/* Modal content */}
  </div>
</FocusTrap>
```

**Add skip to content link:**

**File:** `app/layout.tsx`
```typescript
<body>
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
  >
    Skip to main content
  </a>
  
  <Sidebar />
  <MainLayout>
    <main id="main-content">
      {children}
    </main>
  </MainLayout>
</body>
```

---

### 6. Add Unit Tests (1-2 weeks)

**Install testing dependencies:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Create test config:**

**File:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**File:** `tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

**Example test:**

**File:** `components/features/QuickAddFood.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickAddFood from './QuickAddFood';

describe('QuickAddFood', () => {
  it('renders quick add buttons', () => {
    render(<QuickAddFood onAdd={vi.fn()} />);
    
    expect(screen.getByText('Greek Yogurt')).toBeInTheDocument();
    expect(screen.getByText('Chicken Breast')).toBeInTheDocument();
    expect(screen.getByText('Protein Shake')).toBeInTheDocument();
  });

  it('calls onAdd with correct data when button clicked', () => {
    const onAdd = vi.fn();
    render(<QuickAddFood onAdd={onAdd} />);
    
    fireEvent.click(screen.getByText('Greek Yogurt'));
    
    expect(onAdd).toHaveBeenCalledWith({
      food_name: 'Greek Yogurt',
      protein_grams: 20,
      meal_type: 'snack',
    });
  });
});
```

**Add test script:**

**File:** `package.json`
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Run tests:**
```bash
npm test
```

---

## Testing Checklist

After making these fixes, test:

### Build Test
```bash
npm run build
# Should pass with no errors
```

### Type Check
```bash
npm run type-check
# Should show 0 errors
```

### Lint Check
```bash
npm run lint
# Should show 0 errors
```

### Unit Tests
```bash
npm test
# Should pass all tests
```

### E2E Tests
```bash
npm run test:e2e
# Should pass all tests
```

### Performance Test
```bash
# Check query performance in Supabase dashboard
# All queries should be <50ms
```

---

## Estimated Timeline

**Week 1:**
- Day 1-2: Remove suppressions, start fixing TypeScript errors
- Day 3-4: Finish TypeScript errors
- Day 5: Add database indexes, test performance

**Week 2:**
- Day 1-2: Add error boundaries
- Day 3-4: Improve accessibility
- Day 5: Set up unit testing framework

**Week 3:**
- Day 1-5: Write unit tests (aim for 50% coverage)

**Total: 3 weeks to fix all P0 + P1 issues**

---

## Success Criteria

✅ Build passes without suppressions  
✅ 0 TypeScript errors  
✅ 0 ESLint errors  
✅ All queries <50ms  
✅ Error boundaries on all routes  
✅ ARIA labels on all interactive elements  
✅ 50%+ unit test coverage  
✅ All E2E tests passing  

---

## Questions?

If you need help with any of these fixes, refer to:
- `PROJECT_FEEDBACK.md` - Full detailed review
- `COMPLETE_APP_REVIEW.md` - App overview
- TypeScript docs: https://www.typescriptlang.org/docs/
- Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Accessibility: https://www.a11yproject.com/

---

**Next Step:** Start with P0-1 (Remove Build Suppressions)

