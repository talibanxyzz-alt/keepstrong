# Complete Setup Checklist

Use this checklist to set up the GLP-1 Fitness Tracker app from scratch.

## 📋 Initial Setup

### 1. Install Dependencies
- [ ] Run `npm install`
- [ ] Verify all packages installed successfully

### 2. Supabase Setup

#### Create Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Choose organization
- [ ] Name: "glp-1-fitness-tracker"
- [ ] Database password: (save securely)
- [ ] Region: Choose closest to your users
- [ ] Wait for project to be created

#### Get API Keys
- [ ] Go to Settings > API
- [ ] Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

#### Run Migrations
- [ ] Go to SQL Editor in Supabase Dashboard
- [ ] Create new query
- [ ] Copy contents of `supabase/migrations/001_initial_schema.sql`
- [ ] Run query
- [ ] Repeat for `002_add_current_program.sql`
- [ ] Repeat for `003_add_subscription_fields.sql`
- [ ] Verify tables created in Table Editor

#### Set up Storage
- [ ] Go to Storage in Supabase Dashboard
- [ ] Click "New Bucket"
- [ ] Name: `progress-photos`
- [ ] Public bucket: Yes
- [ ] File size limit: 5 MB
- [ ] Allowed MIME types: `image/jpeg,image/jpg,image/png`
- [ ] Click Create
- [ ] Go to SQL Editor
- [ ] Run `supabase/migrations/004_storage_policies.sql`
- [ ] Verify 4 policies created (see query output)

#### Set up Auth
- [ ] Go to Authentication > Providers
- [ ] Ensure Email is enabled
- [ ] Configure email templates (optional)
- [ ] Set redirect URLs:
  - Site URL: `http://localhost:3000`
  - Additional Redirect URLs: `http://localhost:3000/auth/callback`

### 3. Stripe Setup

#### Create Account
- [ ] Go to https://stripe.com
- [ ] Sign up for account
- [ ] Complete business verification (can skip for test mode)

#### Get API Keys
- [ ] Go to Developers > API Keys
- [ ] Toggle "Test mode" on (top right)
- [ ] Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Reveal "Secret key" → `STRIPE_SECRET_KEY` (⚠️ Keep secret!)

#### Create Products

**Core Plan:**
- [ ] Go to Products > Add Product
- [ ] Name: `GLP-1 Fitness Tracker - Core`
- [ ] Description: `Core subscription with structured workouts`
- [ ] Add pricing:
  - [ ] Model: Recurring
  - [ ] Price: $19
  - [ ] Billing period: Monthly
  - [ ] Currency: USD
- [ ] Save product
- [ ] Copy Price ID (starts with `price_`) → `STRIPE_CORE_PRICE_ID`

**Premium Plan:**
- [ ] Go to Products > Add Product
- [ ] Name: `GLP-1 Fitness Tracker - Premium`
- [ ] Description: `Premium subscription with AI features`
- [ ] Add pricing:
  - [ ] Model: Recurring
  - [ ] Price: $29
  - [ ] Billing period: Monthly
  - [ ] Currency: USD
- [ ] Save product
- [ ] Copy Price ID → `STRIPE_PREMIUM_PRICE_ID`

#### Install Stripe CLI
- [ ] Download from https://stripe.com/docs/stripe-cli
- [ ] Install: `brew install stripe/stripe-cli/stripe` (Mac)
- [ ] Or: `scoop install stripe` (Windows)
- [ ] Or: Download binary for Linux
- [ ] Login: `stripe login`
- [ ] Confirm login in browser

#### Configure Customer Portal
- [ ] Go to Settings > Billing > Customer portal
- [ ] Click "Activate test link"
- [ ] Configure settings:
  - [ ] Products: Select your Core and Premium products
  - [ ] Business information: Add your business name
  - [ ] Cancellation: Allow customers to cancel subscriptions
  - [ ] Payment methods: Allow customers to update
  - [ ] Invoice history: Enable
- [ ] Save settings

### 4. Environment Variables

- [ ] Create `.env.local` file in project root
- [ ] Copy all variables from `.env.example`
- [ ] Fill in all values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from next step)
STRIPE_CORE_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Webhook Setup

- [ ] Open terminal in project directory
- [ ] Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Copy webhook signing secret (starts with `whsec_`)
- [ ] Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`
- [ ] Keep this terminal running during development

### 6. Seed Database

- [ ] Run: `npm run seed:workouts`
- [ ] Verify workout programs created in Supabase Table Editor
- [ ] Should see 3 programs:
  - Beginner Full Body
  - Intermediate Push/Pull/Legs
  - Advanced Upper/Lower

### 7. Start Development Server

- [ ] Run: `npm run dev`
- [ ] Visit: http://localhost:3000
- [ ] Should see landing page

---

## ✅ Test the App

### 8. Test Authentication Flow

- [ ] Click "Get Started"
- [ ] Sign up with test email
- [ ] Complete onboarding form
- [ ] Redirect to dashboard
- [ ] Log out
- [ ] Log back in
- [ ] Verify profile data persisted

### 9. Test Core Features

**Protein Tracking:**
- [ ] Click "+ Quick Add Food"
- [ ] Add a protein entry
- [ ] See protein bar update
- [ ] Go to "Food Tracker"
- [ ] See entry in timeline
- [ ] Edit entry
- [ ] Delete entry

**Workout Programs:**
- [ ] Go to "Workouts" > "Programs"
- [ ] See 3 workout programs
- [ ] Click "View Program"
- [ ] See workout details
- [ ] Click "Start This Program"
- [ ] Redirect to active workout page

**Active Workout:**
- [ ] Select a workout to start
- [ ] See exercises listed
- [ ] Log sets for exercises
- [ ] See rest timer
- [ ] Complete all exercises
- [ ] Click "Finish Workout"
- [ ] Verify session saved

**Progress Tracking:**
- [ ] Go to "Progress"
- [ ] Click "Log Weight"
- [ ] Enter weight
- [ ] See weight in chart
- [ ] Upload progress photo (test with any image)
- [ ] See photo in grid

**Settings:**
- [ ] Go to Settings
- [ ] Update profile info
- [ ] Change protein target
- [ ] Verify changes saved

### 10. Test Subscription Flow

**Subscribe:**
- [ ] Go to "Pricing" (add link to nav or go to `/pricing`)
- [ ] Click "Subscribe to Core"
- [ ] Redirects to Stripe Checkout
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Complete checkout
- [ ] Redirect back to dashboard
- [ ] See success message

**Verify Subscription:**
- [ ] Check webhook logs in terminal (should see events)
- [ ] Check Supabase profiles table:
  - [ ] `subscription_plan` = `'core'`
  - [ ] `subscription_status` = `'active'`
  - [ ] `stripe_customer_id` populated
  - [ ] `stripe_subscription_id` populated

**Manage Subscription:**
- [ ] Go back to `/pricing`
- [ ] Click "Manage Subscription"
- [ ] Redirect to Stripe Customer Portal
- [ ] Update payment method (test with different test card)
- [ ] View invoices
- [ ] Cancel subscription
- [ ] Check webhook logs (should see `customer.subscription.deleted`)
- [ ] Check database:
  - [ ] `subscription_status` = `'canceled'`
  - [ ] `subscription_plan` = `null`

**Feature Gating (if implemented):**
- [ ] Try accessing a premium feature as free user
- [ ] See upgrade prompt
- [ ] Subscribe to plan
- [ ] Feature unlocks

---

## 🚀 Production Setup (When Ready)

### 11. Stripe Production

- [ ] Switch Stripe to Live mode
- [ ] Create live products and prices
- [ ] Get live API keys
- [ ] Set up live webhook:
  - [ ] Go to Developers > Webhooks
  - [ ] Add endpoint: `https://yourdomain.com/api/stripe/webhook`
  - [ ] Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
  - [ ] Copy webhook secret

### 12. Deploy to Production

- [ ] Build: `npm run build`
- [ ] Deploy to Vercel/hosting
- [ ] Add environment variables (production values)
- [ ] Update Supabase:
  - [ ] Add production redirect URLs
  - [ ] Update site URL
  - [ ] Run migrations on production database
- [ ] Test with real payment (small amount)
- [ ] Monitor webhooks in Stripe Dashboard

### 13. Final Checks

- [ ] HTTPS enabled
- [ ] Domain configured
- [ ] Email sending works
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Support email configured

---

## 🎉 You're Done!

Your GLP-1 Fitness Tracker is now fully set up and ready to use!

### Next Steps:
1. Customize branding and colors
2. Add more workout programs
3. Implement premium features
4. Set up email notifications
5. Add social features
6. Build mobile app

### Need Help?
- Check documentation in `/docs`
- Review code examples
- Test with Stripe test mode
- Check Supabase logs
- Review webhook events in Stripe Dashboard

---

## 📊 Verification

Use this quick check to ensure everything is working:

```bash
✅ npm run dev - server starts
✅ Can sign up and log in
✅ Onboarding flow works
✅ Dashboard loads with data
✅ Can log protein
✅ Can view workout programs
✅ Can start workout session
✅ Can log weight and photos
✅ Settings page works
✅ Pricing page loads
✅ Stripe checkout works
✅ Webhooks received
✅ Subscription saves to DB
✅ Customer portal works
```

If all boxes are checked, you're ready to go! 🚀

