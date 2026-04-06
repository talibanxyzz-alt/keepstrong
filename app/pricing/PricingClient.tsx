'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
interface PricingClientProps {
  isAuthenticated: boolean;
  currentPlan: 'free' | 'core' | 'premium';
  subscriptionStatus: string | null;
  /** From the server: `STRIPE_*_PRICE_ID` is not available in the client bundle (only NEXT_PUBLIC_* is), so pass IDs here to avoid SSR/client drift on CTA buttons. */
  stripePriceIds?: { core: string; premium: string };
}

export default function PricingClient({
  isAuthenticated,
  currentPlan,
  subscriptionStatus,
  stripePriceIds: stripePriceIdsProp,
}: PricingClientProps) {
  const stripePriceIds = {
    core: stripePriceIdsProp?.core ?? '',
    premium: stripePriceIdsProp?.premium ?? '',
  };

  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setShowCheckoutSuccess(q.get('success') !== null);
  }, []);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!isAuthenticated) {
      router.push('/auth/signup');
      return;
    }

    setLoadingPlan(planName);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Failed to start checkout: ${data.error}`);
        return;
      }

      if (!data.url) {
        alert('Failed to get checkout URL. Please try again.');
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      alert(`Failed to start checkout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPlan('portal');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const { url, error } = await response.json();

      if (error) {
        alert('Failed to open billing portal. Please try again.');
        return;
      }

      window.location.href = url;
    } catch {
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleDowngrade = () => {
    setShowDowngradeModal(true);
  };

  const confirmDowngrade = () => {
    // Open customer portal for downgrade
    handleManageSubscription();
    setShowDowngradeModal(false);
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      key: 'free' as const,
      popular: false,
      tagline: 'Forever free',
      features: [
        { text: 'Basic protein tracking', included: true },
        { text: '1 workout program', included: true },
        { text: 'Progress photos', included: true },
        { text: 'Advanced analytics', included: false },
        { text: 'Custom programs', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      name: 'Core',
      price: 19,
      priceId: stripePriceIds.core,
      key: 'core' as const,
      popular: true,
      tagline: 'Best value',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'All 3 workout programs', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Weekly reports', included: true },
        { text: 'Export data', included: true },
      ],
    },
    {
      name: 'Premium',
      price: 29,
      priceId: stripePriceIds.premium,
      key: 'premium' as const,
      popular: false,
      tagline: 'For serious lifters',
      features: [
        { text: 'Everything in Core', included: true },
        { text: 'Custom workout programs', included: true },
        { text: 'Meal planning suggestions', included: true },
        { text: '📸 AI Meal Photo Logging — snap a photo, get instant protein estimates', included: true },
        { text: 'Priority support', included: true },
        { text: 'Early access to features', included: true },
      ],
    },
  ];

  const getButtonText = (plan: typeof plans[0]) => {
    const isCurrentPlan = currentPlan === plan.key;
    
    if (isCurrentPlan) {
      return 'Current Plan';
    }
    
    if (plan.key === 'free') {
      if (currentPlan !== 'free') {
        return 'Downgrade';
      }
      return isAuthenticated ? 'Current Plan' : 'Get Started';
    }
    
    // Upgrading
    return `Upgrade to ${plan.name}`;
  };

  const getButtonAction = (plan: typeof plans[0]) => {
    const isCurrentPlan = currentPlan === plan.key;
    
    if (isCurrentPlan) {
      return null; // Disabled
    }
    
    if (plan.key === 'free' && currentPlan !== 'free') {
      return handleDowngrade;
    }
    
    if (!isAuthenticated) {
      return () => router.push('/auth/signup');
    }
    
    if (plan.priceId) {
      return () => handleSubscribe(plan.priceId!, plan.key);
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-charcoal mb-4">
            Simple Pricing
          </h1>
          <p className="text-2xl text-slate max-w-2xl mx-auto">
            Stay strong while you lose weight
          </p>
        </div>

        {/* Success message */}
        {showCheckoutSuccess && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-success/10 border border-success text-success px-6 py-4 rounded-lg">
              <p className="font-semibold">🎉 Subscription activated!</p>
              <p className="text-sm mt-1">You now have access to all premium features.</p>
            </div>
          </div>
        )}

        {/* Social proof */}
        <div className="text-center mb-12">
          <p className="text-slate text-lg">
            Join <span className="font-bold text-primary">2,847 people</span> staying strong on GLP-1
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.key;
            const buttonAction = getButtonAction(plan);

            return (
              <div
                key={plan.key}
                className={`relative bg-surface rounded-lg p-8 border ${
                  plan.popular ? 'border-charcoal' : 'border-line'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-charcoal text-white text-xs font-medium px-3 py-1 rounded">
                      Popular
                    </span>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && !plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-cloud text-charcoal text-xs font-medium px-3 py-1 rounded border border-line">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-2xl font-bold text-charcoal mb-1">
                  {plan.name}
                </h3>

                {/* Tagline */}
                <p className="text-sm text-slate mb-4">{plan.tagline}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-5xl font-bold text-charcoal font-mono">
                    ${plan.price}
                  </span>
                  <span className="text-slate ml-2">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.included ? (
                        <svg
                          className="w-5 h-5 text-success mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-slate/50 mr-3 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span className={feature.included ? 'text-charcoal' : 'text-slate/60'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <button
                  onClick={buttonAction || undefined}
                  disabled={!buttonAction || loadingPlan === plan.key}
                  className={`w-full py-2.5 px-6 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isCurrentPlan
                      ? 'bg-cloud text-slate/60 cursor-not-allowed'
                      : plan.key === 'free' && currentPlan !== 'free'
                      ? 'border border-line-strong text-charcoal hover:bg-cloud'
                      : 'bg-charcoal text-white hover:bg-charcoal/90'
                  }`}
                >
                  {loadingPlan === plan.key ? 'Loading...' : getButtonText(plan)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Manage subscription link */}
        {isAuthenticated && currentPlan !== 'free' && (
          <div className="text-center mb-16">
            <button
              onClick={handleManageSubscription}
              disabled={loadingPlan === 'portal'}
              className="text-primary hover:text-primary/80 font-semibold underline"
            >
              {loadingPlan === 'portal'
                ? 'Loading...'
                : 'Manage billing and subscription →'}
            </button>
          </div>
        )}

        {/* FAQ section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-charcoal text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6 bg-surface rounded-xl p-8 border border-line">
            <div>
              <h3 className="font-semibold text-charcoal mb-2 text-lg">
                Can I cancel anytime?
              </h3>
              <p className="text-slate">
                Yes, no questions asked. You can cancel your subscription at any time from your settings page, and you'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="border-t border-line/60 pt-6">
              <h3 className="font-semibold text-charcoal mb-2 text-lg">
                What payment methods do you accept?
              </h3>
              <p className="text-slate">
                All major credit cards including Visa, Mastercard, and American Express through our secure payment processor, Stripe.
              </p>
            </div>
            <div className="border-t border-line/60 pt-6">
              <h3 className="font-semibold text-charcoal mb-2 text-lg">
                Do you offer refunds?
              </h3>
              <p className="text-slate">
                Yes! We offer a 7-day money-back guarantee. If you're not satisfied within the first 7 days, we'll give you a full refund, no questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Downgrade confirmation modal */}
        {showDowngradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-charcoal mb-4">
                Downgrade to Free Plan?
              </h3>
              <p className="text-slate mb-6">
                You'll lose access to premium features at the end of your current billing period. Are you sure you want to downgrade?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDowngradeModal(false)}
                  className="flex-1 py-2 px-4 border-2 border-line-strong rounded-lg font-semibold text-charcoal hover:bg-cloud transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDowngrade}
                  className="flex-1 py-2 px-4 bg-warning text-white rounded-lg font-semibold hover:bg-warning/90 transition"
                >
                  Confirm Downgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

