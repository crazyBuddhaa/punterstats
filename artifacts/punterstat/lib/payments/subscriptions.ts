// ============================================================
// PunterStat — Subscription Upsert Helper
// Writes payment provider data into the public.subscriptions
// table using the Supabase admin client (service-role key).
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionUpsertPayload } from "./types";

/**
 * Upsert (insert or update) a user's subscription row with idempotency guard.
 *
 * The update is skipped if the row's current_period_end is already later than
 * the incoming period_end — this prevents out-of-order or replayed webhook
 * events from rolling back a more recent renewal or upgrade.
 *
 * Exception: "cancelled" and "expired" status changes always win (they are
 * terminal states and must not be suppressed by a stale active event).
 */
export async function upsertSubscription(payload: SubscriptionUpsertPayload): Promise<void> {
  const admin = createAdminClient();
  const isTerminal = payload.status === "cancelled" || payload.status === "expired";

  // ── Idempotency: skip stale active/trialing updates ────────────────────────
  if (!isTerminal) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("current_period_end, status")
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (existing) {
      const existingEnd  = new Date(existing.current_period_end).getTime();
      const incomingEnd  = payload.currentPeriodEnd.getTime();
      const existingIsTerminal =
        existing.status === "cancelled" || existing.status === "expired";

      // Skip if existing period ends later (newer renewal already recorded)
      // and existing status is not terminal (terminal → active upgrades allowed)
      if (!existingIsTerminal && incomingEnd < existingEnd) {
        return;
      }
    }
  }

  // ── Upsert ─────────────────────────────────────────────────────────────────
  const row = {
    user_id:                   payload.userId,
    plan:                      payload.plan,
    status:                    payload.status,
    payment_provider:          payload.provider,
    currency:                  payload.currency,
    current_period_start:      payload.currentPeriodStart.toISOString(),
    current_period_end:        payload.currentPeriodEnd.toISOString(),
    cancelled_at:              payload.cancelledAt?.toISOString() ?? null,
    updated_at:                new Date().toISOString(),
    // Provider-specific IDs (undefined = don't overwrite existing values)
    ...(payload.stripeCustomerId         !== undefined && { stripe_customer_id:           payload.stripeCustomerId }),
    ...(payload.stripeSubscriptionId     !== undefined && { stripe_subscription_id:       payload.stripeSubscriptionId }),
    ...(payload.paystackCustomerCode     !== undefined && { paystack_customer_code:       payload.paystackCustomerCode }),
    ...(payload.paystackSubscriptionCode !== undefined && { paystack_subscription_code:  payload.paystackSubscriptionCode }),
    ...(payload.remitaRrr                !== undefined && { remita_rrr:                  payload.remitaRrr }),
    ...(payload.remitaOrderId            !== undefined && { remita_order_id:             payload.remitaOrderId }),
  };

  const { error } = await admin
    .from("subscriptions")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    throw new Error(`[subscriptions] upsert failed: ${error.message}`);
  }
}

/**
 * Fetch a subscription row by a Stripe subscription ID.
 * Used inside webhook handlers where we only have the provider ID.
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<{ userId: string; plan: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .single();
  if (!data) return null;
  return { userId: data.user_id, plan: data.plan };
}

/**
 * Fetch a subscription row by Stripe customer ID.
 * Needed when Stripe sends events with customer_id but no sub metadata.
 */
export async function getSubscriptionByStripeCustomer(
  stripeCustomerId: string
): Promise<{ userId: string; plan: string; stripeSubscriptionId: string | null } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id, plan, stripe_subscription_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .single();
  if (!data) return null;
  return {
    userId: data.user_id,
    plan: data.plan,
    stripeSubscriptionId: data.stripe_subscription_id ?? null,
  };
}

/**
 * Fetch a subscription row by Paystack subscription code.
 */
export async function getSubscriptionByPaystackCode(
  subscriptionCode: string
): Promise<{ userId: string; plan: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("paystack_subscription_code", subscriptionCode)
    .single();
  if (!data) return null;
  return { userId: data.user_id, plan: data.plan };
}

/**
 * Fetch a subscription row by Remita RRR.
 */
export async function getSubscriptionByRemitaRrr(
  rrr: string
): Promise<{ userId: string; plan: string } | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id, plan")
    .eq("remita_rrr", rrr)
    .single();
  if (!data) return null;
  return { userId: data.user_id, plan: data.plan };
}

/**
 * Fetch the full subscription row for a user (including provider fields).
 * Used in the dashboard and checkout flow.
 */
export async function getFullSubscription(userId: string): Promise<{
  plan: string;
  status: string;
  paymentProvider: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  paystackCustomerCode: string | null;
  remitaRrr: string | null;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select(
      "plan, status, payment_provider, stripe_customer_id, stripe_subscription_id, paystack_customer_code, remita_rrr"
    )
    .eq("user_id", userId)
    .single();
  if (!data) return null;
  return {
    plan: data.plan,
    status: data.status,
    paymentProvider: data.payment_provider ?? null,
    stripeCustomerId: data.stripe_customer_id ?? null,
    stripeSubscriptionId: data.stripe_subscription_id ?? null,
    paystackCustomerCode: data.paystack_customer_code ?? null,
    remitaRrr: data.remita_rrr ?? null,
  };
}
