/**
 * Client-safe subscription utility functions
 * These can be imported in both client and server components
 */

export type Plan = 'free' | 'core' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired' | 'unpaid' | null;

export type Feature = 
  | 'basic_protein_tracking'
  | 'basic_workouts'
  | 'progress_photos'
  | 'advanced_analytics'
  | 'all_workout_programs'
  | 'weekly_reports'
  | 'export_data'
  | 'custom_workout_programs'
  | 'meal_planning'
  | 'priority_support'
  | 'early_access';

// Feature access matrix
const FEATURE_ACCESS: Record<Feature, Plan[]> = {
  // Free features
  basic_protein_tracking: ['free', 'core', 'premium'],
  basic_workouts: ['free', 'core', 'premium'],
  progress_photos: ['free', 'core', 'premium'],
  
  // Core features
  advanced_analytics: ['core', 'premium'],
  all_workout_programs: ['core', 'premium'],
  weekly_reports: ['core', 'premium'],
  export_data: ['core', 'premium'],
  
  // Premium features
  custom_workout_programs: ['premium'],
  meal_planning: ['premium'],
  priority_support: ['premium'],
  early_access: ['premium'],
};

/**
 * Check if a plan has access to a feature
 */
export function isFeatureAvailable(plan: Plan, feature: Feature): boolean {
  const allowedPlans = FEATURE_ACCESS[feature];
  return allowedPlans.includes(plan);
}

/**
 * Get plan hierarchy level (for comparison)
 */
export function getPlanLevel(plan: Plan): number {
  const levels: Record<Plan, number> = {
    free: 0,
    core: 1,
    premium: 2,
  };
  return levels[plan];
}

/**
 * Check if planA is higher than or equal to planB
 */
export function isPlanAtLeast(planA: Plan, planB: Plan): boolean {
  return getPlanLevel(planA) >= getPlanLevel(planB);
}

/**
 * Get required plan for a feature
 */
export function getRequiredPlan(feature: Feature): Plan {
  const allowedPlans = FEATURE_ACCESS[feature];
  
  // Return the lowest tier that has access
  if (allowedPlans.includes('free')) return 'free';
  if (allowedPlans.includes('core')) return 'core';
  return 'premium';
}

/**
 * Get all features for a plan
 */
export function getPlanFeatures(plan: Plan): Feature[] {
  return (Object.keys(FEATURE_ACCESS) as Feature[]).filter(feature =>
    isFeatureAvailable(plan, feature)
  );
}

/**
 * Get features locked for a plan
 */
export function getLockedFeatures(plan: Plan): Feature[] {
  return (Object.keys(FEATURE_ACCESS) as Feature[]).filter(feature =>
    !isFeatureAvailable(plan, feature)
  );
}

/**
 * Format feature name for display
 */
export function formatFeatureName(feature: Feature): string {
  const names: Record<Feature, string> = {
    basic_protein_tracking: 'Basic Protein Tracking',
    basic_workouts: 'Basic Workouts',
    progress_photos: 'Progress Photos',
    advanced_analytics: 'Advanced Analytics',
    all_workout_programs: 'All Workout Programs',
    weekly_reports: 'Weekly Reports',
    export_data: 'Export Data',
    custom_workout_programs: 'Custom Workout Programs',
    meal_planning: 'Meal Planning',
    priority_support: 'Priority Support',
    early_access: 'Early Access to Features',
  };
  return names[feature];
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: Plan): string {
  const names: Record<Plan, string> = {
    free: 'Free',
    core: 'Core',
    premium: 'Premium',
  };
  return names[plan];
}

/**
 * Get plan price
 */
export function getPlanPrice(plan: Plan): number {
  const prices: Record<Plan, number> = {
    free: 0,
    core: 19,
    premium: 29,
  };
  return prices[plan];
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Check if subscription needs attention
 */
export function needsAttention(status: SubscriptionStatus): boolean {
  return status === 'past_due' || status === 'incomplete' || status === 'unpaid';
}

/**
 * Get status display text
 */
export function getStatusDisplayText(status: SubscriptionStatus): string {
  if (!status) return 'No subscription';
  
  const texts: Record<NonNullable<SubscriptionStatus>, string> = {
    active: 'Active',
    canceled: 'Canceled',
    past_due: 'Past Due',
    trialing: 'Trial',
    incomplete: 'Incomplete',
    incomplete_expired: 'Expired',
    unpaid: 'Unpaid',
  };
  return texts[status];
}

/**
 * Get status color class
 */
export function getStatusColor(status: SubscriptionStatus): string {
  if (!status) return 'text-gray-500';
  
  const colors: Record<NonNullable<SubscriptionStatus>, string> = {
    active: 'text-success',
    trialing: 'text-primary',
    canceled: 'text-warning',
    past_due: 'text-warning',
    incomplete: 'text-warning',
    incomplete_expired: 'text-red-500',
    unpaid: 'text-red-500',
  };
  return colors[status];
}

