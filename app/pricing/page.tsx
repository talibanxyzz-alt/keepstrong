import { redirect } from 'next/navigation';
import PricingClient from './PricingClient';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Pricing - GLP-1 Fitness Tracker',
  description: 'Choose the plan that fits your fitness journey',
};

export default async function PricingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch current subscription if user is logged in
  let currentPlan: 'free' | 'core' | 'premium' = 'free';
  let subscriptionStatus: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status')
      .eq('id', user.id)
      .single();

    if (profile) {
      const profileData = profile as { subscription_plan?: string | null; subscription_status?: string | null };
      currentPlan = (profileData.subscription_plan as 'core' | 'premium') || 'free';
      subscriptionStatus = profileData.subscription_status || null;
    }
  }

  const stripePriceIds = {
    core: process.env.STRIPE_CORE_PRICE_ID ?? '',
    premium: process.env.STRIPE_PREMIUM_PRICE_ID ?? '',
  };

  return (
    <PricingClient
      isAuthenticated={!!user}
      currentPlan={currentPlan}
      subscriptionStatus={subscriptionStatus}
      stripePriceIds={stripePriceIds}
    />
  );
}

