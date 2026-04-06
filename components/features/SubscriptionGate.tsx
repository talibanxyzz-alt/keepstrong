'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { hasFeatureAccess, type PlanType } from '@/lib/stripe/config';

interface SubscriptionGateProps {
  userPlan: PlanType;
  requiredPlan: PlanType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gate component that shows content only if user has required plan
 * Otherwise shows upgrade prompt
 */
export default function SubscriptionGate({
  userPlan,
  requiredPlan,
  children,
  fallback,
}: SubscriptionGateProps) {
  const router = useRouter();
  const hasAccess = hasFeatureAccess(userPlan, requiredPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-stone-200/80 text-stone-700">
        <Lock className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-stone-900">
        {requiredPlan === 'premium' ? 'Premium' : 'Core'} only
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        This is included on the {requiredPlan === 'premium' ? 'Premium' : 'Core'} plan. You can change plans anytime.
      </p>
      <button
        type="button"
        onClick={() => router.push('/pricing')}
        className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        View plans
      </button>
    </div>
  );
}

/**
 * Hook to check feature access
 */
export function useSubscription(userPlan: PlanType) {
  const router = useRouter();

  const checkAccess = (requiredPlan: PlanType): boolean => {
    return hasFeatureAccess(userPlan, requiredPlan);
  };

  const promptUpgrade = (requiredPlan: PlanType) => {
    if (!checkAccess(requiredPlan)) {
      router.push('/pricing');
    }
  };

  return {
    plan: userPlan,
    hasCore: checkAccess('core'),
    hasPremium: checkAccess('premium'),
    checkAccess,
    promptUpgrade,
  };
}

