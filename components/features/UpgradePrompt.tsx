'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, Lock } from 'lucide-react';
import { getPlanDisplayName, type Plan } from '@/lib/subscription';

interface UpgradePromptProps {
  requiredPlan: Exclude<Plan, 'free'>;
  featureName: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
}

export default function UpgradePrompt({
  requiredPlan,
  featureName,
  description,
  size = 'md',
  inline = false,
}: UpgradePromptProps) {
  const router = useRouter();

  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const buttonSizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  if (inline) {
    return (
      <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-charcoal">{featureName}</p>
            <p className="text-xs text-slate">
              Requires {getPlanDisplayName(requiredPlan)}
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 text-center ${sizeClasses[size]}`}>
      <div className="flex flex-col items-center">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <Lock className={`text-primary ${iconSizes[size]}`} />
        </div>

        <h3 className="mb-2 font-bold text-charcoal">
          {getPlanDisplayName(requiredPlan)} Feature
        </h3>

        <p className="mb-1 font-semibold text-charcoal">
          {featureName}
        </p>

        {description && (
          <p className="mb-6 text-slate max-w-md">
            {description}
          </p>
        )}

        {!description && (
          <p className="mb-6 text-slate">
            {featureName} {requiredPlan === 'premium' ? 'is' : 'are'} available on the {getPlanDisplayName(requiredPlan)} plan
          </p>
        )}

        <button
          onClick={() => router.push('/pricing')}
          className={`flex items-center gap-2 rounded-lg bg-primary font-semibold text-white hover:bg-primary/90 hover:scale-105 transition-all ${buttonSizes[size]}`}
        >
          <TrendingUp className="h-5 w-5" />
          Upgrade to {getPlanDisplayName(requiredPlan)}
        </button>

        <p className="mt-4 text-xs text-slate">
          Cancel anytime • 7-day money-back guarantee
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for small spaces
 */
export function UpgradePromptCompact({
  requiredPlan,
  featureName,
}: {
  requiredPlan: Exclude<Plan, 'free'>;
  featureName: string;
}) {
  const router = useRouter();

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center">
      <p className="mb-2 text-sm text-slate">
        <Lock className="inline h-4 w-4 mr-1 -mt-0.5" />
        <span className="font-semibold">{featureName}</span> requires {getPlanDisplayName(requiredPlan)}
      </p>
      <button
        onClick={() => router.push('/pricing')}
        className="text-sm font-semibold text-primary hover:text-primary/80 underline"
      >
        Upgrade now →
      </button>
    </div>
  );
}

/**
 * Banner version for page-wide notices
 */
export function UpgradePromptBanner({
  requiredPlan,
  message,
}: {
  requiredPlan: Exclude<Plan, 'free'>;
  message: string;
}) {
  const router = useRouter();

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/20 p-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-charcoal">
              Unlock {getPlanDisplayName(requiredPlan)} Features
            </p>
            <p className="text-sm text-slate">{message}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 hover:scale-105 transition-all whitespace-nowrap"
        >
          <TrendingUp className="h-5 w-5" />
          Upgrade
        </button>
      </div>
    </div>
  );
}

