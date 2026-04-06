import Stripe from 'stripe';

// Initialize Stripe with secret key (lazy initialization for better dev experience)
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not set. ' +
        'Please add it to your .env.local file and restart the dev server. ' +
        'Get your key from: https://dashboard.stripe.com/test/apikeys'
      );
    }
    
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }
  
  return stripeInstance;
}

// Export for backwards compatibility (but will throw error if not configured)
export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    return getStripe()[prop as keyof Stripe];
  },
});

// Subscription plan price IDs
// These should match your Stripe product price IDs
export const STRIPE_PLANS = {
  FREE: {
    id: null,
    name: 'Free',
    price: 0,
    features: [
      'Basic protein tracking',
      'Manual workout logging',
      'Weight tracking',
      'Basic progress photos',
    ],
  },
  CORE: {
    id: process.env.STRIPE_CORE_PRICE_ID!,
    name: 'Core',
    price: 19,
    priceId: process.env.STRIPE_CORE_PRICE_ID!,
    features: [
      'Everything in Free',
      'Structured workout programs',
      'Advanced nutrition insights',
      'Weekly progress reports',
      'Priority support',
    ],
  },
  PREMIUM: {
    id: process.env.STRIPE_PREMIUM_PRICE_ID!,
    name: 'Premium',
    price: 29,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      'Everything in Core',
      'AI-powered meal suggestions',
      'Custom workout builder',
      'Video exercise library',
      'Body composition tracking',
      'Personal coaching (monthly)',
    ],
  },
} as const;

export type PlanType = 'free' | 'core' | 'premium';

// Helper to get plan details
export function getPlanDetails(plan: PlanType) {
  switch (plan) {
    case 'core':
      return STRIPE_PLANS.CORE;
    case 'premium':
      return STRIPE_PLANS.PREMIUM;
    default:
      return STRIPE_PLANS.FREE;
  }
}

// Helper to check if user has access to a feature based on plan
export function hasFeatureAccess(userPlan: PlanType, requiredPlan: PlanType): boolean {
  const planHierarchy: PlanType[] = ['free', 'core', 'premium'];
  const userPlanIndex = planHierarchy.indexOf(userPlan);
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
  return userPlanIndex >= requiredPlanIndex;
}

