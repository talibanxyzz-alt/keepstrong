# Subscription System Usage Guide

This guide shows you how to implement feature gating and subscription management throughout your app.

## Table of Contents
1. [Checking User's Plan](#checking-users-plan)
2. [Feature Gating](#feature-gating)
3. [Upgrade Prompts](#upgrade-prompts)
4. [Middleware Protection](#middleware-protection)
5. [Common Patterns](#common-patterns)

---

## Checking User's Plan

### Server Components

```typescript
import { getCurrentPlan, isFeatureAvailable } from '@/lib/subscription';

export default async function MyPage() {
  const { data: { user } } = await supabase.auth.getUser();
  const plan = await getCurrentPlan(user.id);

  const hasAdvancedAnalytics = isFeatureAvailable(plan, 'advanced_analytics');

  return (
    <div>
      <p>Your plan: {plan}</p>
      {hasAdvancedAnalytics && <AdvancedAnalytics />}
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { getCurrentPlanClient, isFeatureAvailable } from '@/lib/subscription';
import { useEffect, useState } from 'react';

export default function MyComponent({ userId }: { userId: string }) {
  const [plan, setPlan] = useState<'free' | 'core' | 'premium'>('free');

  useEffect(() => {
    getCurrentPlanClient(userId).then(setPlan);
  }, [userId]);

  const hasCustomPrograms = isFeatureAvailable(plan, 'custom_workout_programs');

  return <div>{hasCustomPrograms && <CustomPrograms />}</div>;
}
```

---

## Feature Gating

### Method 1: Using SubscriptionGate Component

The simplest way to gate features:

```typescript
import SubscriptionGate from '@/components/features/SubscriptionGate';

<SubscriptionGate userPlan={plan} requiredPlan="premium">
  <PremiumFeature />
</SubscriptionGate>
```

With custom fallback:

```typescript
<SubscriptionGate
  userPlan={plan}
  requiredPlan="core"
  fallback={<UpgradePrompt requiredPlan="core" featureName="Advanced Analytics" />}
>
  <AdvancedAnalytics />
</SubscriptionGate>
```

### Method 2: Using Upgrade Prompt Components

Full-size upgrade prompt:

```typescript
import UpgradePrompt from '@/components/features/UpgradePrompt';

{!hasAccess && (
  <UpgradePrompt
    requiredPlan="premium"
    featureName="Custom Workout Programs"
    description="Create unlimited custom workout programs tailored to your goals"
    size="lg"
  />
)}
```

Inline upgrade prompt:

```typescript
<UpgradePrompt
  requiredPlan="core"
  featureName="Advanced Analytics"
  inline
/>
```

Compact version:

```typescript
import { UpgradePromptCompact } from '@/components/features/UpgradePrompt';

<UpgradePromptCompact
  requiredPlan="core"
  featureName="Weekly Reports"
/>
```

Banner version:

```typescript
import { UpgradePromptBanner } from '@/components/features/UpgradePrompt';

<UpgradePromptBanner
  requiredPlan="premium"
  message="Get AI-powered meal suggestions and custom workout programs"
/>
```

### Method 3: Conditional Rendering

```typescript
import { getCurrentPlan, isFeatureAvailable } from '@/lib/subscription';

export default async function ProgressPage() {
  const { data: { user } } = await supabase.auth.getUser();
  const plan = await getCurrentPlan(user.id);

  return (
    <div>
      {/* Always show basic features */}
      <BasicProgressChart />

      {/* Show advanced features or upgrade prompt */}
      {isFeatureAvailable(plan, 'advanced_analytics') ? (
        <AdvancedAnalytics />
      ) : (
        <UpgradePrompt
          requiredPlan="core"
          featureName="Advanced Analytics"
        />
      )}

      {/* Premium features */}
      {isFeatureAvailable(plan, 'meal_planning') ? (
        <MealPlanning />
      ) : (
        <UpgradePrompt
          requiredPlan="premium"
          featureName="Meal Planning"
        />
      )}
    </div>
  );
}
```

---

## Upgrade Prompts

### In Lists/Grids

When showing a list of programs where some are locked:

```typescript
{programs.map((program) => {
  const isLocked = program.difficulty === 'advanced' && plan !== 'premium';

  return (
    <div key={program.id} className="card">
      <h3>{program.name}</h3>
      
      {isLocked ? (
        <UpgradePrompt
          requiredPlan="premium"
          featureName={program.name}
          size="sm"
          inline
        />
      ) : (
        <button onClick={() => startProgram(program.id)}>
          Start Program
        </button>
      )}
    </div>
  );
})}
```

### On Click/Interaction

Prompt when user tries to access a locked feature:

```typescript
'use client';

import { useRouter } from 'next/navigation';

function handleExportData() {
  if (!isFeatureAvailable(plan, 'export_data')) {
    // Show modal or redirect to pricing
    router.push('/pricing');
    return;
  }

  // Export data
  exportData();
}

<button onClick={handleExportData}>
  Export Data {!isFeatureAvailable(plan, 'export_data') && '🔒'}
</button>
```

### Full-Page Lock

For entire pages that require a plan:

```typescript
import { getCurrentPlan, isFeatureAvailable } from '@/lib/subscription';
import UpgradePrompt from '@/components/features/UpgradePrompt';

export default async function CustomProgramsPage() {
  const { data: { user } } = await supabase.auth.getUser();
  const plan = await getCurrentPlan(user.id);

  if (!isFeatureAvailable(plan, 'custom_workout_programs')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <UpgradePrompt
          requiredPlan="premium"
          featureName="Custom Workout Programs"
          description="Create unlimited custom workout programs tailored to your specific goals and preferences"
          size="lg"
        />
      </div>
    );
  }

  return <CustomProgramsBuilder />;
}
```

---

## Middleware Protection

Protect routes in middleware (optional):

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ... auth checks ...

  // Check subscription for premium routes
  if (request.nextUrl.pathname.startsWith('/custom-programs')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_plan !== 'premium') {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
  }

  return response;
}
```

---

## Common Patterns

### Pattern 1: Progressive Feature Display

Show features based on plan, with clear upgrade path:

```typescript
export default async function DashboardPage() {
  const plan = await getCurrentPlan(user.id);

  return (
    <div className="space-y-8">
      {/* Free features */}
      <TodaysSummary />
      <QuickAddFood />

      {/* Core features */}
      {isFeatureAvailable(plan, 'advanced_analytics') ? (
        <AdvancedAnalytics />
      ) : (
        <UpgradePromptBanner
          requiredPlan="core"
          message="Get detailed insights into your protein intake and workout performance"
        />
      )}

      {/* Premium features */}
      {isFeatureAvailable(plan, 'meal_planning') ? (
        <MealPlanning />
      ) : plan === 'core' ? (
        <UpgradePromptBanner
          requiredPlan="premium"
          message="Get AI-powered meal suggestions optimized for GLP-1 medication"
        />
      ) : null}
    </div>
  );
}
```

### Pattern 2: Feature Limits

Limit usage based on plan:

```typescript
export default function PhotoUpload({ plan, photoCount }: Props) {
  const limits = {
    free: 4,
    core: 20,
    premium: Infinity,
  };

  const limit = limits[plan];
  const canUpload = photoCount < limit;

  return (
    <div>
      <p>Photos: {photoCount} / {limit === Infinity ? '∞' : limit}</p>

      {canUpload ? (
        <button onClick={uploadPhoto}>Upload Photo</button>
      ) : (
        <UpgradePrompt
          requiredPlan={plan === 'free' ? 'core' : 'premium'}
          featureName="More Photo Storage"
          description={`You've reached your limit of ${limit} photos. Upgrade to store more progress photos.`}
        />
      )}
    </div>
  );
}
```

### Pattern 3: Badge/Tag on Features

Show locked state inline:

```typescript
<div className="flex items-center gap-2">
  <h3>Advanced Analytics</h3>
  {!isFeatureAvailable(plan, 'advanced_analytics') && (
    <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded">
      Core
    </span>
  )}
</div>
```

### Pattern 4: Settings Page Management

Already implemented in `/app/settings/page.tsx` - shows:
- Current plan and status
- Billing information
- Manage subscription button
- Upgrade/downgrade options
- Reactivation for canceled subscriptions

---

## Available Features

| Feature | Free | Core | Premium |
|---------|------|------|---------|
| `basic_protein_tracking` | ✓ | ✓ | ✓ |
| `basic_workouts` | ✓ | ✓ | ✓ |
| `progress_photos` | ✓ | ✓ | ✓ |
| `advanced_analytics` | - | ✓ | ✓ |
| `all_workout_programs` | - | ✓ | ✓ |
| `weekly_reports` | - | ✓ | ✓ |
| `export_data` | - | ✓ | ✓ |
| `custom_workout_programs` | - | - | ✓ |
| `meal_planning` | - | - | ✓ |
| `priority_support` | - | - | ✓ |
| `early_access` | - | - | ✓ |

---

## Utility Functions

### `getCurrentPlan(userId)`
Get user's current plan (server-side)

### `getCurrentPlanClient(userId)`
Get user's current plan (client-side)

### `isFeatureAvailable(plan, feature)`
Check if a plan has access to a feature

### `hasAccess(userId, feature)`
Check if user has access to a feature (server-side)

### `hasAccessClient(userId, feature)`
Check if user has access to a feature (client-side)

### `getPlanDisplayName(plan)`
Get formatted plan name ("Free", "Core", "Premium")

### `getPlanPrice(plan)`
Get plan price (0, 19, 29)

### `getStatusDisplayText(status)`
Get formatted status text

### `isSubscriptionActive(status)`
Check if subscription is active

---

## Best Practices

1. **Show value before gating** - Let users see what they're missing
2. **Be clear about requirements** - Always state which plan is needed
3. **Make upgrades easy** - One-click path to pricing page
4. **Don't hide free features** - Free users should see what they have
5. **Use progressive disclosure** - Show upgrade prompts contextually
6. **Test downgrade flows** - Ensure users who downgrade see gates correctly
7. **Cache plan checks** - Avoid repeated database queries

---

## Testing

```typescript
// Test with different plans
const testPlans = ['free', 'core', 'premium'] as const;

testPlans.forEach(plan => {
  console.log(`Testing as ${plan} user`);
  
  // Check feature access
  console.log('Advanced Analytics:', isFeatureAvailable(plan, 'advanced_analytics'));
  console.log('Meal Planning:', isFeatureAvailable(plan, 'meal_planning'));
});
```

---

## Support

For issues or questions about the subscription system:
- Check `/docs/STRIPE_SETUP.md` for payment setup
- Check `/docs/STRIPE_USAGE_EXAMPLES.md` for Stripe integration examples
- Review `/ components/features/SubscriptionGate.tsx` for gating examples

