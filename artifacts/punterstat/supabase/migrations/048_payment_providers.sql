-- ============================================================
-- Migration 041: Payment Provider Columns
-- Adds provider-specific identifiers to the subscriptions table
-- to support Stripe, Paystack, and Remita payment integrations.
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_provider text
    CHECK (payment_provider IN ('stripe', 'paystack', 'remita')),
  ADD COLUMN IF NOT EXISTS currency         text NOT NULL DEFAULT 'GBP',
  -- Stripe
  ADD COLUMN IF NOT EXISTS stripe_customer_id      text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id  text,
  -- Paystack
  ADD COLUMN IF NOT EXISTS paystack_customer_code  text,
  ADD COLUMN IF NOT EXISTS paystack_subscription_code text,
  -- Remita
  ADD COLUMN IF NOT EXISTS remita_rrr              text,
  ADD COLUMN IF NOT EXISTS remita_order_id         text;

-- Partial indexes for fast provider look-ups
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_sub_id_idx
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_paystack_sub_code_idx
  ON public.subscriptions (paystack_subscription_code)
  WHERE paystack_subscription_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_idx
  ON public.subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_paystack_customer_idx
  ON public.subscriptions (paystack_customer_code)
  WHERE paystack_customer_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_remita_rrr_idx
  ON public.subscriptions (remita_rrr)
  WHERE remita_rrr IS NOT NULL;
