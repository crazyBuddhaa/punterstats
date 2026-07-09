---
name: Payment integration
description: Three-provider payment system (Stripe/Paystack/Remita) in PunterStat; env vars, plan prices, and webhook URLs.
---

## Providers
- **Stripe** — GBP card payments (UK/International). Checkout Session → webhook → `subscriptions` table.
- **Paystack** — NGN (Africa). `initializeTransaction` with `plan` param → HMAC-SHA512 webhook → `subscriptions`.
- **Remita** — NGN (Nigeria bank transfer). Generate RRR → display in-app → webhook re-verifies before activating.

## Plan prices
- Premium: £9 GBP / ₦15,000 NGN
- Pro: £19 GBP / ₦32,000 NGN

## Migration
- `supabase/migrations/048_payment_providers.sql` — adds provider columns to `public.subscriptions`
- Columns: `payment_provider`, `currency`, `stripe_customer_id`, `stripe_subscription_id`, `paystack_customer_code`, `paystack_subscription_code`, `remita_rrr`, `remita_order_id`

## Key files
- `lib/payments/` — types, index (plan config), stripe, paystack, remita, subscriptions (upsert helper)
- `app/api/checkout/{stripe,paystack,remita}/` — auth-protected POST routes
- `app/api/webhooks/{stripe,paystack,remita}/` — signature-verified webhook handlers
- `app/api/portal/stripe/` — Stripe Customer Portal session
- `app/checkout/` — checkout page + CheckoutClient (provider selector)

## Required env vars
```
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PREMIUM_PRICE_ID, STRIPE_PRO_PRICE_ID
PAYSTACK_SECRET_KEY, PAYSTACK_PREMIUM_PLAN_CODE, PAYSTACK_PRO_PLAN_CODE
REMITA_MERCHANT_ID, REMITA_API_KEY, REMITA_SERVICE_TYPE_ID, REMITA_BASE_URL
```

## Webhook URLs (register in each provider dashboard)
- Stripe: `https://punterstat.site/api/webhooks/stripe`
- Paystack: `https://punterstat.site/api/webhooks/paystack`
- Remita: `https://punterstat.site/api/webhooks/remita`

## Stripe SDK
- Installed: stripe ^22.3.0 (in artifacts/punterstat/package.json)
- Required apiVersion: `"2026-06-24.dahlia"` — NOT "2025-05-28.basil"

## Idempotency
`upsertSubscription` skips stale active/trialing updates where `incoming period_end < existing period_end`. Terminal status (cancelled/expired) always wins.

**Why:** Out-of-order or replayed webhooks from all three providers can arrive stale. Without this guard, an old "active" event overwrites a newer cancellation.
