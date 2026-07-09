// ============================================================
// PunterStat — Stripe Integration
// Handles checkout sessions, customer portal, and webhooks.
// ============================================================

import Stripe from "stripe";
import type { PlanId } from "./types";

// ── Stripe client (lazy singleton) ────────────────────────────────────────

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

// ── Price ID resolution ────────────────────────────────────────────────────

export function getStripePriceId(planId: PlanId): string {
  const env =
    planId === "premium"
      ? process.env.STRIPE_PREMIUM_PRICE_ID
      : process.env.STRIPE_PRO_PRICE_ID;

  if (!env) {
    throw new Error(
      `Stripe Price ID not configured: STRIPE_${planId.toUpperCase()}_PRICE_ID`
    );
  }
  return env;
}

// ── Checkout Session ───────────────────────────────────────────────────────

export interface CreateCheckoutSessionParams {
  userId: string;
  email: string;
  planId: PlanId;
  /** Existing Stripe customer ID if the user has paid before */
  stripeCustomerId?: string | null;
}

export async function createStripeCheckoutSession({
  userId,
  email,
  planId,
  stripeCustomerId,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const priceId = getStripePriceId(planId);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/checkout/success?provider=stripe`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { userId, plan: planId },
    subscription_data: {
      metadata: { userId, plan: planId },
    },
    allow_promotion_codes: true,
  };

  // Re-use existing customer if possible
  if (stripeCustomerId) {
    sessionParams.customer = stripeCustomerId;
  } else {
    sessionParams.customer_email = email;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

// ── Customer Portal ────────────────────────────────────────────────────────

export async function createStripePortalSession(
  stripeCustomerId: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";

  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/dashboard/subscription`,
  });
}

// ── Webhook event construction ─────────────────────────────────────────────

export function constructStripeWebhookEvent(
  rawBody: string,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Extract userId and plan from a Stripe object's metadata (subscription or session). */
export function extractStripeMetadata(
  metadata: Stripe.Metadata | null
): { userId: string; plan: PlanId } | null {
  const userId = metadata?.userId;
  const plan = metadata?.plan as PlanId | undefined;
  if (!userId || !plan || !["premium", "pro"].includes(plan)) return null;
  return { userId, plan };
}
