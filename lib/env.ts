const coreRequired = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

/** Needed for billing; enforced in production so revenue paths don’t run misconfigured. */
const billingRequired = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CORE_PRICE_ID',
  'STRIPE_PREMIUM_PRICE_ID',
] as const;

export function validateEnv() {
  const missingCore = coreRequired.filter((key) => !process.env[key]);
  if (missingCore.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingCore.map((k) => `  - ${k}`).join('\n')}\n\nCheck your .env.local file.`
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const missingBilling = billingRequired.filter((key) => !process.env[key]);
    if (missingBilling.length > 0) {
      throw new Error(
        `Missing billing environment variables (required in production):\n${missingBilling.map((k) => `  - ${k}`).join('\n')}`
      );
    }
    if (!process.env.CRON_SECRET) {
      console.warn(
        '[KeepStrong] CRON_SECRET is not set — /api/emails/cron/* will return 503 until configured.'
      );
    }
  }
}
