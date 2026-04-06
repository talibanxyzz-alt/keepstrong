# KeepStrong — project status

**Last reviewed:** April 2026  

This file is a **high-level snapshot**, not a full spec. For setup steps see `README.md`.

## Health checks (local)

- `npm run type-check` — TypeScript  
- `npm run lint` — ESLint  
- `npm run test` — Vitest  
- `npm run build` — production build (requires env; see `.env.example`)

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, and build with placeholder env vars.

## Environment

- **Development:** Core Supabase + `NEXT_PUBLIC_APP_URL` are required at startup. Stripe/billing vars are optional for UI-only work.  
- **Production:** All variables in `lib/env.ts` must be set, including Stripe price IDs and (recommended) `CRON_SECRET` for scheduled email routes.

## Security notes

- **Stripe checkout** only accepts `priceId` values matching `STRIPE_CORE_PRICE_ID` / `STRIPE_PREMIUM_PRICE_ID`.  
- **Cron email routes** (`/api/emails/cron/*`) require `Authorization: Bearer <CRON_SECRET>` in production; without `CRON_SECRET` in prod they return 503.  
- **Stripe webhook** verifies signatures with `STRIPE_WEBHOOK_SECRET`.

## Trust / legal

- App pages (`MainLayout`) include a short **medical disclaimer** and links to Privacy/Terms.  
- Full policies live at `/privacy` and `/terms`.

## Product areas

- **Subscriptions:** Stripe Checkout + Customer Portal + webhook updates `profiles` subscription fields.  
- **Email:** Day-2 and weekly digests respect opt-in; preview routes are dev-only where noted.  
- **Push:** Expo token registration via `/api/account/push-token` (see migrations `022`/`023`).
