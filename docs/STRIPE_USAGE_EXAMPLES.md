# Stripe Integration Usage Examples

This document shows how to use the Stripe integration throughout the app.

## Table of Contents
1. [Checking User's Subscription](#checking-users-subscription)
2. [Gating Features by Plan](#gating-features-by-plan)
3. [Subscribe to a Plan](#subscribe-to-a-plan)
4. [Manage Subscription](#manage-subscription)
5. [Display Plan-Specific UI](#display-plan-specific-ui)

---

## Checking User's Subscription

### In Server Components

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export default async function MyPage() {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status')
    .eq('id', user.id)
    .single();

  const userPlan = profile?.subscription_plan || 'free';
  const isActive = profile?.subscription_status === 'active';

  return (
    <div>
      <p>Plan: {userPlan}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
}
```

### In Client Components

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function MyComponent() {
  const [userPlan, setUserPlan] = useState<'free' | 'core' | 'premium'>('free');
  const supabase = createBrowserClient();

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_plan')
          .eq('id', user.id)
          .single();

        setUserPlan(profile?.subscription_plan || 'free');
      }
    }

    fetchPlan();
  }, []);

  return <div>Your plan: {userPlan}</div>;
}
```

---

## Gating Features by Plan

### Using the SubscriptionGate Component

```typescript
'use client';

import SubscriptionGate from '@/components/features/SubscriptionGate';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
}

export default function MyFeature({ userPlan }: Props) {
  return (
    <SubscriptionGate
      userPlan={userPlan}
      requiredPlan="premium"
    >
      {/* This content only shows for Premium users */}
      <div className="premium-feature">
        <h2>AI Meal Suggestions</h2>
        <p>Get personalized meal recommendations...</p>
      </div>
    </SubscriptionGate>
  );
}
```

### Custom Fallback UI

```typescript
<SubscriptionGate
  userPlan={userPlan}
  requiredPlan="core"
  fallback={
    <div className="upgrade-prompt">
      <p>This feature requires Core or Premium</p>
      <a href="/pricing">Upgrade Now</a>
    </div>
  }
>
  <AdvancedAnalytics />
</SubscriptionGate>
```

### Using the Hook

```typescript
'use client';

import { useSubscription } from '@/components/features/SubscriptionGate';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
}

export default function Dashboard({ userPlan }: Props) {
  const { hasCore, hasPremium, promptUpgrade } = useSubscription(userPlan);

  const handlePremiumFeature = () => {
    if (!hasPremium) {
      promptUpgrade('premium');
      return;
    }
    // Access premium feature
  };

  return (
    <div>
      {hasCore && <CoreFeatureSection />}
      {hasPremium && <PremiumFeatureSection />}
      
      <button onClick={handlePremiumFeature}>
        Use Premium Feature
      </button>
    </div>
  );
}
```

### Manual Check with Helper Function

```typescript
import { hasFeatureAccess } from '@/lib/stripe/config';

const userPlan = 'core'; // from database

// Check if user can access Core features
if (hasFeatureAccess(userPlan, 'core')) {
  // Show Core feature
}

// Check if user can access Premium features
if (hasFeatureAccess(userPlan, 'premium')) {
  // Show Premium feature
}
```

---

## Subscribe to a Plan

### Redirect to Checkout

```typescript
'use client';

import { useState } from 'react';
import { STRIPE_PLANS } from '@/lib/stripe/config';

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: STRIPE_PLANS.CORE.priceId,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert('Failed to start checkout');
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Loading...' : 'Subscribe to Core'}
    </button>
  );
}
```

---

## Manage Subscription

### Open Customer Portal

```typescript
'use client';

import { useState } from 'react';

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleManage = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const { url, error } = await response.json();

      if (error) {
        alert('Failed to open billing portal');
        return;
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="btn-secondary"
    >
      {loading ? 'Loading...' : 'Manage Subscription'}
    </button>
  );
}
```

---

## Display Plan-Specific UI

### Show Different UI Based on Plan

```typescript
'use client';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
}

export default function ProgressPage({ userPlan }: Props) {
  return (
    <div>
      {/* Free users */}
      {userPlan === 'free' && (
        <div className="upgrade-banner">
          <p>Upgrade to Core for advanced analytics!</p>
          <a href="/pricing">View Plans</a>
        </div>
      )}

      {/* Core users */}
      {userPlan === 'core' && (
        <div className="info-banner">
          <p>💡 Upgrade to Premium for AI-powered insights</p>
        </div>
      )}

      {/* Premium users */}
      {userPlan === 'premium' && (
        <div className="premium-badge">
          <span>⭐ Premium Member</span>
        </div>
      )}

      {/* Content for all users */}
      <BasicProgressCharts />

      {/* Content only for Core+ users */}
      {(userPlan === 'core' || userPlan === 'premium') && (
        <AdvancedProgressCharts />
      )}

      {/* Content only for Premium users */}
      {userPlan === 'premium' && (
        <AIInsights />
      )}
    </div>
  );
}
```

### Conditional Features in Settings

```typescript
'use client';

import { hasFeatureAccess } from '@/lib/stripe/config';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
}

export default function SettingsPage({ userPlan }: Props) {
  const canExportData = hasFeatureAccess(userPlan, 'core');
  const canCustomizeWorkouts = hasFeatureAccess(userPlan, 'premium');

  return (
    <div>
      {/* Export data (Core+) */}
      {canExportData ? (
        <button>Export My Data</button>
      ) : (
        <button disabled>
          Export My Data (Requires Core)
        </button>
      )}

      {/* Custom workouts (Premium) */}
      {canCustomizeWorkouts ? (
        <button>Create Custom Workout</button>
      ) : (
        <button disabled>
          Create Custom Workout (Requires Premium)
        </button>
      )}
    </div>
  );
}
```

### Feature Limits

```typescript
'use client';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
  photoCount: number;
}

export default function PhotoUpload({ userPlan, photoCount }: Props) {
  // Define limits per plan
  const photoLimits = {
    free: 4,
    core: 20,
    premium: Infinity,
  };

  const limit = photoLimits[userPlan];
  const canUploadMore = photoCount < limit;

  return (
    <div>
      <p>
        Photos: {photoCount} / {limit === Infinity ? '∞' : limit}
      </p>

      {canUploadMore ? (
        <button>Upload Photo</button>
      ) : (
        <div>
          <p>You've reached your photo limit</p>
          <a href="/pricing">Upgrade for more storage</a>
        </div>
      )}
    </div>
  );
}
```

---

## Real-World Examples

### Dashboard with Plan-Aware Features

```typescript
// app/dashboard/page.tsx (Server Component)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(/* ... */);

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', user.id)
    .single();

  const userPlan = profile?.subscription_plan || 'free';

  return <DashboardClient userPlan={userPlan} />;
}
```

```typescript
// app/dashboard/DashboardClient.tsx (Client Component)
'use client';

import SubscriptionGate from '@/components/features/SubscriptionGate';

interface Props {
  userPlan: 'free' | 'core' | 'premium';
}

export default function DashboardClient({ userPlan }: Props) {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Basic features (all users) */}
      <TodaysSummary />
      <QuickAddFood />

      {/* Advanced analytics (Core+) */}
      <SubscriptionGate userPlan={userPlan} requiredPlan="core">
        <WeeklyTrendsChart />
        <NutritionInsights />
      </SubscriptionGate>

      {/* AI features (Premium) */}
      <SubscriptionGate userPlan={userPlan} requiredPlan="premium">
        <AIMealSuggestions />
        <PersonalizedRecommendations />
      </SubscriptionGate>
    </div>
  );
}
```

### Workout Programs with Plan Restrictions

```typescript
// app/workouts/programs/page.tsx
import { createServerClient } from '@supabase/ssr';
import ProgramsClient from './ProgramsClient';

export default async function ProgramsPage() {
  const supabase = createServerClient(/* ... */);

  // Fetch all programs
  const { data: programs } = await supabase
    .from('workout_programs')
    .select('*');

  // Fetch user plan
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan')
    .eq('id', user.id)
    .single();

  return (
    <ProgramsClient
      programs={programs}
      userPlan={profile?.subscription_plan || 'free'}
    />
  );
}
```

```typescript
// app/workouts/programs/ProgramsClient.tsx
'use client';

import { hasFeatureAccess } from '@/lib/stripe/config';

interface Props {
  programs: Program[];
  userPlan: 'free' | 'core' | 'premium';
}

export default function ProgramsClient({ programs, userPlan }: Props) {
  return (
    <div className="grid gap-6">
      {programs.map((program) => {
        // Determine if program is locked
        const requiredPlan = program.difficulty_level === 'advanced' ? 'premium' : 'core';
        const hasAccess = hasFeatureAccess(userPlan, requiredPlan);

        return (
          <div key={program.id} className="card">
            <h3>{program.name}</h3>
            
            {hasAccess ? (
              <button onClick={() => startProgram(program.id)}>
                Start Program
              </button>
            ) : (
              <div className="locked">
                <span>🔒 {requiredPlan === 'premium' ? 'Premium' : 'Core'} required</span>
                <a href="/pricing">Upgrade</a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

---

## Tips

1. **Always check on the server side** when possible for security
2. **Cache the user's plan** in client state to avoid repeated fetches
3. **Use the SubscriptionGate component** for declarative gating
4. **Show value before gating** - let users see what they're missing
5. **Make upgrades easy** - always link to `/pricing` page
6. **Handle expired subscriptions** - check `subscription_status === 'active'`

