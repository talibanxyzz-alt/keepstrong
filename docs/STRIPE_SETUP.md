# Stripe Integration Setup Guide

This guide explains how to set up Stripe for subscription payments in the GLP-1 Fitness Tracker app.

## Overview

The app supports three subscription tiers:
- **Free**: $0/month - Basic features
- **Core**: $19/month - Advanced features
- **Premium**: $29/month - All features + coaching

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe API Keys (use test keys for development)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_CORE_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# App URL (for redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Stripe Dashboard Setup

### 1. Create Products and Prices

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**

**Core Plan:**
- Name: `GLP-1 Fitness Tracker - Core`
- Description: `Core subscription with structured workouts and advanced nutrition tracking`
- Pricing: `$19.00 USD / month`
- Recurring: `Monthly`
- Copy the **Price ID** (starts with `price_`) and add to `.env.local` as `STRIPE_CORE_PRICE_ID`

**Premium Plan:**
- Name: `GLP-1 Fitness Tracker - Premium`
- Description: `Premium subscription with AI features and personal coaching`
- Pricing: `$29.00 USD / month`
- Recurring: `Monthly`
- Copy the **Price ID** and add to `.env.local` as `STRIPE_PREMIUM_PRICE_ID`

### 2. Set Up Webhooks

Webhooks allow Stripe to notify your app about subscription changes.

#### Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### Production

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** to your production environment variables

### 3. Configure Customer Portal

The Customer Portal allows users to manage their subscriptions (update payment methods, cancel, etc.)

1. Go to **Settings > Billing > Customer portal** in Stripe Dashboard
2. Configure settings:
   - **Cancellation**: Allow customers to cancel subscriptions
   - **Update payment method**: Enabled
   - **Invoice history**: Enabled
3. Save changes

## Database Migration

Run the subscription fields migration:

```bash
# In Supabase SQL Editor, run:
# supabase/migrations/003_add_subscription_fields.sql
```

This adds the following columns to the `profiles` table:
- `stripe_customer_id` - Stripe customer ID
- `stripe_subscription_id` - Active subscription ID
- `subscription_status` - Status (active, canceled, past_due, etc.)
- `subscription_plan` - Plan type (core, premium, or null for free)

## API Endpoints

### 1. Create Checkout Session

**Endpoint:** `POST /api/stripe/checkout`

**Request:**
```json
{
  "priceId": "price_1234..."
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

**Usage:**
```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ priceId: STRIPE_PLANS.CORE.priceId }),
});
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Checkout
```

### 2. Webhook Handler

**Endpoint:** `POST /api/stripe/webhook`

Automatically handles these events:
- `checkout.session.completed` - Creates subscription in database
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_failed` - Marks subscription as past_due

### 3. Customer Portal

**Endpoint:** `POST /api/stripe/portal`

**Response:**
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

**Usage:**
```typescript
const response = await fetch('/api/stripe/portal', { method: 'POST' });
const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Customer Portal
```

## Testing

### Test Cards

Use these test cards in development:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Test Workflow

1. Start your dev server: `npm run dev`
2. Start Stripe webhook forwarding: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Navigate to pricing page (you'll create this)
4. Click "Subscribe to Core"
5. Use test card `4242 4242 4242 4242`
6. Complete checkout
7. Check your database - `profiles.subscription_plan` should be `'core'`
8. Check webhook logs in terminal

## Plan Feature Access

Use the helper function to check feature access:

```typescript
import { hasFeatureAccess } from '@/lib/stripe/config';

// In your component
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_plan')
  .single();

const userPlan = profile?.subscription_plan || 'free';

// Check if user can access a premium feature
if (hasFeatureAccess(userPlan, 'premium')) {
  // Show premium feature
} else {
  // Show upgrade prompt
}
```

## Subscription States

- `active` - Subscription is active and paid
- `trialing` - In free trial period
- `past_due` - Payment failed, subscription still active
- `canceled` - Subscription canceled, may still have access until period end
- `incomplete` - Initial payment not completed
- `incomplete_expired` - Payment not completed within 23 hours
- `unpaid` - Payment failed, access revoked

## Going to Production

1. Switch from test keys to live keys in Stripe Dashboard
2. Update environment variables with live keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
3. Create live products and prices (same as test mode)
4. Set up production webhook endpoint
5. Update `NEXT_PUBLIC_APP_URL` to your production domain

## Security Notes

- **Never** expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` on the client
- Always verify webhook signatures
- Use HTTPS in production
- Keep Stripe API version updated

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe API Reference: https://stripe.com/docs/api
- Test your integration: https://stripe.com/docs/testing

