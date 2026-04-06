import { describe, it, expect } from 'vitest';
import {
  isFeatureAvailable,
  getPlanLevel,
  isPlanAtLeast,
  getRequiredPlan,
  getPlanFeatures,
  getLockedFeatures,
  formatFeatureName,
  getPlanDisplayName,
  getPlanPrice,
  isSubscriptionActive,
  needsAttention,
  getStatusDisplayText,
  getStatusColor,
  type Plan,
  type Feature,
} from '@/lib/subscription-utils';

describe('getPlanLevel', () => {
  it('assigns correct hierarchy levels', () => {
    expect(getPlanLevel('free')).toBe(0);
    expect(getPlanLevel('core')).toBe(1);
    expect(getPlanLevel('premium')).toBe(2);
  });
});

describe('isPlanAtLeast', () => {
  it('returns true when plans are equal', () => {
    expect(isPlanAtLeast('free', 'free')).toBe(true);
    expect(isPlanAtLeast('core', 'core')).toBe(true);
    expect(isPlanAtLeast('premium', 'premium')).toBe(true);
  });

  it('returns true when planA is higher than planB', () => {
    expect(isPlanAtLeast('premium', 'core')).toBe(true);
    expect(isPlanAtLeast('premium', 'free')).toBe(true);
    expect(isPlanAtLeast('core', 'free')).toBe(true);
  });

  it('returns false when planA is lower than planB', () => {
    expect(isPlanAtLeast('free', 'core')).toBe(false);
    expect(isPlanAtLeast('free', 'premium')).toBe(false);
    expect(isPlanAtLeast('core', 'premium')).toBe(false);
  });
});

describe('isFeatureAvailable', () => {
  it('free features are available to all plans', () => {
    const freeFeatures: Feature[] = ['basic_protein_tracking', 'basic_workouts', 'progress_photos'];
    const plans: Plan[] = ['free', 'core', 'premium'];

    for (const feature of freeFeatures) {
      for (const plan of plans) {
        expect(isFeatureAvailable(plan, feature)).toBe(true);
      }
    }
  });

  it('core features are not available on free', () => {
    const coreFeatures: Feature[] = ['advanced_analytics', 'all_workout_programs', 'weekly_reports', 'export_data'];
    for (const feature of coreFeatures) {
      expect(isFeatureAvailable('free', feature)).toBe(false);
    }
  });

  it('core features are available on core and premium', () => {
    const coreFeatures: Feature[] = ['advanced_analytics', 'all_workout_programs', 'weekly_reports', 'export_data'];
    for (const feature of coreFeatures) {
      expect(isFeatureAvailable('core', feature)).toBe(true);
      expect(isFeatureAvailable('premium', feature)).toBe(true);
    }
  });

  it('premium features are only available on premium', () => {
    const premiumFeatures: Feature[] = ['custom_workout_programs', 'meal_planning', 'priority_support', 'early_access'];
    for (const feature of premiumFeatures) {
      expect(isFeatureAvailable('free', feature)).toBe(false);
      expect(isFeatureAvailable('core', feature)).toBe(false);
      expect(isFeatureAvailable('premium', feature)).toBe(true);
    }
  });
});

describe('getRequiredPlan', () => {
  it('returns free for free-tier features', () => {
    expect(getRequiredPlan('basic_protein_tracking')).toBe('free');
    expect(getRequiredPlan('basic_workouts')).toBe('free');
    expect(getRequiredPlan('progress_photos')).toBe('free');
  });

  it('returns core for core-tier features', () => {
    expect(getRequiredPlan('advanced_analytics')).toBe('core');
    expect(getRequiredPlan('weekly_reports')).toBe('core');
    expect(getRequiredPlan('export_data')).toBe('core');
  });

  it('returns premium for premium-only features', () => {
    expect(getRequiredPlan('custom_workout_programs')).toBe('premium');
    expect(getRequiredPlan('meal_planning')).toBe('premium');
    expect(getRequiredPlan('priority_support')).toBe('premium');
  });
});

describe('getPlanFeatures / getLockedFeatures', () => {
  it('free plan has 3 features and 8 locked', () => {
    expect(getPlanFeatures('free')).toHaveLength(3);
    expect(getLockedFeatures('free')).toHaveLength(8);
  });

  it('premium plan has all 11 features and none locked', () => {
    expect(getPlanFeatures('premium')).toHaveLength(11);
    expect(getLockedFeatures('premium')).toHaveLength(0);
  });

  it('features and locked features are mutually exclusive', () => {
    const plans: Plan[] = ['free', 'core', 'premium'];
    for (const plan of plans) {
      const available = new Set(getPlanFeatures(plan));
      const locked = new Set(getLockedFeatures(plan));
      // No overlap
      for (const f of available) {
        expect(locked.has(f)).toBe(false);
      }
    }
  });
});

describe('getPlanPrice', () => {
  it('free plan costs 0', () => expect(getPlanPrice('free')).toBe(0));
  it('core plan costs 19', () => expect(getPlanPrice('core')).toBe(19));
  it('premium plan costs 29', () => expect(getPlanPrice('premium')).toBe(29));
});

describe('getPlanDisplayName / formatFeatureName', () => {
  it('returns proper display names for plans', () => {
    expect(getPlanDisplayName('free')).toBe('Free');
    expect(getPlanDisplayName('core')).toBe('Core');
    expect(getPlanDisplayName('premium')).toBe('Premium');
  });

  it('formats all feature names without throwing', () => {
    const features: Feature[] = [
      'basic_protein_tracking', 'basic_workouts', 'progress_photos',
      'advanced_analytics', 'all_workout_programs', 'weekly_reports', 'export_data',
      'custom_workout_programs', 'meal_planning', 'priority_support', 'early_access',
    ];
    for (const f of features) {
      expect(formatFeatureName(f).length).toBeGreaterThan(0);
    }
  });
});

describe('isSubscriptionActive', () => {
  it('returns true for active and trialing', () => {
    expect(isSubscriptionActive('active')).toBe(true);
    expect(isSubscriptionActive('trialing')).toBe(true);
  });

  it('returns false for all other statuses', () => {
    expect(isSubscriptionActive('canceled')).toBe(false);
    expect(isSubscriptionActive('past_due')).toBe(false);
    expect(isSubscriptionActive('incomplete')).toBe(false);
    expect(isSubscriptionActive('incomplete_expired')).toBe(false);
    expect(isSubscriptionActive('unpaid')).toBe(false);
    expect(isSubscriptionActive(null)).toBe(false);
  });
});

describe('needsAttention', () => {
  it('returns true for past_due, incomplete, unpaid', () => {
    expect(needsAttention('past_due')).toBe(true);
    expect(needsAttention('incomplete')).toBe(true);
    expect(needsAttention('unpaid')).toBe(true);
  });

  it('returns false for all other statuses', () => {
    expect(needsAttention('active')).toBe(false);
    expect(needsAttention('trialing')).toBe(false);
    expect(needsAttention('canceled')).toBe(false);
    expect(needsAttention('incomplete_expired')).toBe(false);
    expect(needsAttention(null)).toBe(false);
  });
});

describe('getStatusDisplayText', () => {
  it('returns "No subscription" for null', () => {
    expect(getStatusDisplayText(null)).toBe('No subscription');
  });

  it('returns human-readable text for all statuses', () => {
    expect(getStatusDisplayText('active')).toBe('Active');
    expect(getStatusDisplayText('canceled')).toBe('Canceled');
    expect(getStatusDisplayText('past_due')).toBe('Past Due');
    expect(getStatusDisplayText('trialing')).toBe('Trial');
    expect(getStatusDisplayText('incomplete')).toBe('Incomplete');
    expect(getStatusDisplayText('incomplete_expired')).toBe('Expired');
    expect(getStatusDisplayText('unpaid')).toBe('Unpaid');
  });
});

describe('getStatusColor', () => {
  it('returns gray for null', () => {
    expect(getStatusColor(null)).toBe('text-gray-500');
  });

  it('returns color strings for all statuses', () => {
    const statuses = ['active', 'trialing', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'unpaid'] as const;
    for (const s of statuses) {
      expect(getStatusColor(s)).toMatch(/^text-/);
    }
  });
});
