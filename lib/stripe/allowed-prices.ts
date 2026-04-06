/**
 * Only allow checkout for prices configured in the environment (prevents arbitrary priceId abuse).
 */
export function isAllowedSubscriptionPriceId(priceId: string): boolean {
  const allowed = [process.env.STRIPE_CORE_PRICE_ID, process.env.STRIPE_PREMIUM_PRICE_ID].filter(
    (id): id is string => typeof id === 'string' && id.length > 0
  );
  return allowed.includes(priceId);
}
