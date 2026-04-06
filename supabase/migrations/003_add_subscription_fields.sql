-- Add Stripe subscription fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  ADD COLUMN subscription_plan TEXT CHECK (subscription_plan IN ('core', 'premium'));

-- Add indexes for faster lookups
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);

-- Add comment
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'Current subscription plan (null = free, core = $19/mo, premium = $29/mo)';

