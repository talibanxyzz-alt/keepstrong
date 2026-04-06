import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAllowedSubscriptionPriceId } from '@/lib/stripe/allowed-prices';

describe('isAllowedSubscriptionPriceId', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true only for configured core and premium price ids', () => {
    vi.stubEnv('STRIPE_CORE_PRICE_ID', 'price_core_abc');
    vi.stubEnv('STRIPE_PREMIUM_PRICE_ID', 'price_premium_xyz');

    expect(isAllowedSubscriptionPriceId('price_core_abc')).toBe(true);
    expect(isAllowedSubscriptionPriceId('price_premium_xyz')).toBe(true);
    expect(isAllowedSubscriptionPriceId('price_attacker')).toBe(false);
  });
});
