# Stripe Setup - Quick Reference

## The Error You Saw

```
Error: Neither apiKey nor config.authenticator provided
```

**Cause:** Stripe environment variables not loaded or dev server not restarted.

## Quick Fix (5 minutes)

### 1. Get Stripe Test Keys

Visit: https://dashboard.stripe.com/test/apikeys

Copy:
- **Secret key** (sk_test_...) - Click "Reveal test key"
- **Publishable key** (pk_test_...)

### 2. Add to .env.local

```bash
# Replace with your actual keys
echo "STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY" >> .env.local
echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY" >> .env.local

# Placeholders for now (create products later)
echo "STRIPE_CORE_PRICE_ID=price_placeholder" >> .env.local
echo "STRIPE_PREMIUM_PRICE_ID=price_placeholder" >> .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_placeholder" >> .env.local
```

### 3. Restart Dev Server ⚠️ IMPORTANT

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. Test

Visit: http://localhost:3000/pricing

Should now work! ✅

## For Later: Create Real Products

When you're ready to test checkout:

1. **Create Products in Stripe:**
   - Go to: https://dashboard.stripe.com/test/products
   - Click "Add product"
   
2. **Core Plan:**
   - Name: "Core Plan"
   - Price: $19
   - Billing period: Monthly
   - Click "Add product"
   - Copy the **price ID** (starts with `price_`)

3. **Premium Plan:**
   - Name: "Premium Plan"
   - Price: $29
   - Billing period: Monthly
   - Click "Add product"
   - Copy the **price ID** (starts with `price_`)

4. **Update .env.local:**
   ```bash
   # Replace placeholders with real price IDs
   STRIPE_CORE_PRICE_ID=price_xxx_from_dashboard
   STRIPE_PREMIUM_PRICE_ID=price_yyy_from_dashboard
   ```

5. **Restart dev server** (again)

## Troubleshooting

### Problem: Still seeing the error

**Solution:** Make sure you **restarted the dev server** after adding keys.
Environment variables are only loaded when the server starts!

### Problem: Checkout not working

**Solution:** You need real price IDs from Stripe products (see "For Later" above).

### Problem: Keys not showing in Stripe Dashboard

**Solution:** Make sure you're in **Test mode** (toggle in top-right of Stripe Dashboard).

### Problem: Want to test without Stripe

**Solution:** Use placeholder values (pricing page will show but checkout won't work):
```bash
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
```

## Key Points

- ✅ **Always restart** dev server after changing .env.local
- ✅ Use **test keys** (sk_test_, pk_test_) for development
- ✅ Never commit .env.local to git (it's in .gitignore)
- ✅ Pricing page will **display** with placeholders
- ✅ Checkout **requires real** product price IDs

## Complete Documentation

For full Stripe setup guide, see:
- `docs/STRIPE_SETUP.md` - Complete setup instructions
- `docs/STRIPE_USAGE_EXAMPLES.md` - Code examples

---

**Quick Checklist:**
- [ ] Got keys from Stripe Dashboard
- [ ] Added to .env.local
- [ ] Restarted dev server
- [ ] Pricing page works
- [ ] (Optional) Created products for checkout

