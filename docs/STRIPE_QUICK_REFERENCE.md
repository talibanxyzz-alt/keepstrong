# Stripe Integration Quick Reference

Quick reference for common Stripe integration tasks.

---

## 📋 Checklist: Setting Up Stripe

- [ ] Install dependencies: `npm install stripe @stripe/stripe-js`
- [ ] Create Stripe account at https://stripe.com
- [ ] Get test API keys from Stripe Dashboard
- [ ] Add keys to `.env.local`
- [ ] Create products and prices in Stripe Dashboard
- [ ] Add price IDs to `.env.local`
- [ ] Run database migration `003_add_subscription_fields.sql`
- [ ] Set up webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Test checkout flow with test card `4242 4242 4242 4242`
- [ ] Verify subscription created in database

---

## 🔑 Environment Variables

```bash
# API Keys (test mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_CORE_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 💳 Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0027 6000 3184` | 3D Secure required |

Use any future expiry, any 3-digit CVC, any postal code.

---

## 🎯 Plans

| Plan | Price | Key |
|------|-------|-----|
| Free | $0/mo | `free` |
| Core | $19/mo | `core` |
| Premium | $29/mo | `premium` |

---

## 🔧 Common Code Snippets

### Get User's Plan (Server)

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_plan, subscription_status')
  .eq('id', user.id)
  .single();

const userPlan = profile?.subscription_plan || 'free';
```

### Check Feature Access

```typescript
import { hasFeatureAccess } from '@/lib/stripe/config';

if (hasFeatureAccess(userPlan, 'premium')) {
  // Show premium feature
}
```

### Subscribe Button

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: STRIPE_PLANS.CORE.priceId }),
});
const { url } = await response.json();
window.location.href = url;
```

### Manage Subscription Button

```typescript
const response = await fetch('/api/stripe/portal', { method: 'POST' });
const { url } = await response.json();
window.location.href = url;
```

### Gate a Feature

```typescript
<SubscriptionGate userPlan={userPlan} requiredPlan="premium">
  <PremiumFeature />
</SubscriptionGate>
```

---

## 📊 Subscription Statuses

| Status | Meaning |
|--------|---------|
| `active` | ✅ Subscription is active and paid |
| `trialing` | 🆓 In free trial period |
| `past_due` | ⚠️ Payment failed, still has access |
| `canceled` | ❌ Subscription canceled |
| `incomplete` | 🔄 Initial payment not completed |
| `unpaid` | 🚫 Payment failed, access revoked |

---

## 🧪 Testing Workflow

1. Start dev server: `npm run dev`
2. Start webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Go to http://localhost:3000/pricing
4. Click "Subscribe to Core"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify redirect to dashboard
8. Check database: `subscription_plan` should be `'core'`
9. Check webhook logs in terminal

---

## 🚨 Common Issues

### Webhook not receiving events
- Check Stripe CLI is running
- Verify webhook secret in `.env.local`
- Check terminal for webhook logs

### Subscription not saving to database
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check webhook handler logs
- Ensure migration was run

### Can't create checkout session
- Verify price IDs are correct
- Check API keys are valid
- Ensure user is authenticated

### Customer portal fails
- User must have `stripe_customer_id`
- User must have subscribed at least once
- Check API keys

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `/lib/stripe/config.ts` | Stripe client & plan config |
| `/app/api/stripe/checkout/route.ts` | Create checkout session |
| `/app/api/stripe/webhook/route.ts` | Handle Stripe webhooks |
| `/app/api/stripe/portal/route.ts` | Customer portal access |
| `/app/pricing/page.tsx` | Pricing page (server) |
| `/app/pricing/PricingClient.tsx` | Pricing page (client) |
| `/components/features/SubscriptionGate.tsx` | Feature gating component |
| `/supabase/migrations/003_add_subscription_fields.sql` | Database schema |

---

## 🔗 Useful Links

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs
- **Stripe API**: https://stripe.com/docs/api
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli

---

## 🚀 Going to Production

1. Switch to live mode in Stripe Dashboard
2. Create live products and prices
3. Get live API keys
4. Update `.env.local` with live keys
5. Set up production webhook endpoint
6. Update `NEXT_PUBLIC_APP_URL` to production domain
7. Test with real payment (small amount)
8. Set up monitoring and alerts

---

## 💡 Pro Tips

- Always use webhook events as source of truth
- Store minimal payment data (let Stripe handle it)
- Show value before gating features
- Make upgrade flow seamless (1-2 clicks)
- Handle all subscription states gracefully
- Test cancellation and reactivation flows
- Monitor failed payments
- Set up Stripe billing alerts

