/**
 * Server-side subscription functions
 * DO NOT import this file in client components!
 * For client-safe utilities, import from './subscription-utils'
 */

import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Plan, SubscriptionStatus, Feature } from './subscription-utils';
import { isFeatureAvailable } from './subscription-utils';

// Re-export types and utilities for convenience
export * from './subscription-utils';

/**
 * Get current plan for a user (server-side)
 */
export async function getCurrentPlan(userId: string): Promise<Plan> {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status')
    .eq('id', userId)
    .single();

  // If no active subscription, return free
  if (!profile?.subscription_plan || profile.subscription_status !== 'active') {
    return 'free';
  }

  return profile.subscription_plan as Plan;
}

/**
 * Get current plan for a user (client-side)
 */
export async function getCurrentPlanClient(userId: string): Promise<Plan> {
  const supabase = createBrowserClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status')
    .eq('id', userId)
    .single();

  // If no active subscription, return free
  if (!profile?.subscription_plan || profile.subscription_status !== 'active') {
    return 'free';
  }

  return profile.subscription_plan as Plan;
}

/**
 * Get full subscription details (server-side)
 */
export async function getSubscriptionDetails(userId: string) {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, stripe_subscription_id')
    .eq('id', userId)
    .single();

  if (!profile) {
    return null;
  }

  return {
    plan: (profile.subscription_plan as Plan) || 'free',
    status: profile.subscription_status as SubscriptionStatus,
    stripeSubscriptionId: profile.stripe_subscription_id,
  };
}

/**
 * Check if user has access to a feature (server-side)
 */
export async function hasAccess(userId: string, feature: Feature): Promise<boolean> {
  const plan = await getCurrentPlan(userId);
  return isFeatureAvailable(plan, feature);
}

/**
 * Check if user has access to a feature (client-side)
 */
export async function hasAccessClient(userId: string, feature: Feature): Promise<boolean> {
  const plan = await getCurrentPlanClient(userId);
  return isFeatureAvailable(plan, feature);
}
