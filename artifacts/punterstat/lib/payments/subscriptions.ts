// ============================================================
// PunterStat — Subscription Upsert & Webhook Idempotency Helpers
// Writes payment provider data into the public.subscriptions
// table using the Supabase admin client (service-role key).
// ============================================================

import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentProvider, SubscriptionUpsertPayload } from "./types";

// In-memory fast-path cache for webhook event deduplication within the same worker
const processedWebhookEvents = new Set<string>();
const MAX_MEMORY_WEBHOOK_EVENTS = 2_000;

function rememberWebhookKey(key: string): void {
  if (processedWebhookEvents.size >= MAX_MEMORY_WEBHOOK_EVENTS) {
    const oldest = processedWebhookEvents.values().next().value;
    if (oldest) processedWebhookEvents.delete(oldest);
  }
  processedWebhookEvents.add(key);
}

/**
 * Claim a webhook event for processing (idempotent across retries).
 *
 * Returns `true` if this is the first time `(provider, eventId)` has been seen,
 * or `false` if the event was already processed.
 *
 * Uses `public.webhook_events` (from migration 054) as the primary persistent
 * store, falling back to `public.audit_logs` if migration 054 has not been
 * applied yet, plus an in-memory Set.
 */
export async function claimWebhookEvent(
  provider: PaymentProvider,
  eventId: string
): Promise<boolean> {
  const cleanId = eventId.trim();
  if (!cleanId) return true;

  const memKey = `${provider}:${cleanId}`;
  if (processedWebhookEvents.has(memKey)) {
    return false;
  }

  const admin = createAdminClient();

  // Primary path: atomic insert into public.webhook_events
  const { error } = await admin
    .from("webhook_events")
    .insert({ provider, event_id: cleanId });

  if (!error) {
    rememberWebhookKey(memKey);
    return true;
  }

  // 23505 = unique_violation → event already processed
  if (error.code === "23505") {
    rememberWebhookKey(memKey);
    return false;
  }

  // Fallback if migration 054 (webhook_events table) hasn't been applied yet
  const { data: existingAudit } = await admin
    .from("audit_logs")
    .select("id")
    .eq("action", "webhook_processed")
    .eq("entity_type", provider)
    .contains("metadata", { event_id: cleanId })
    .limit(1)
    .maybeSingle();

  if (existingAudit) {
    rememberWebhookKey(memKey);
    return false;
  }

  await admin.from("audit_logs").insert({
    action: "webhook_processed",
    entity_type: provider,
    metadata: { event_id: cleanId },
  });

  rememberWebhookKey(memKey);
  return true;
}

/**
 * Release a previously claimed webhook event if the handler threw an error,
 * allowing the payment provider's retry to run cleanly.
 */
export async function releaseWebhookEvent(
  provider: PaymentProvider,
  eventId: string
): Promise<void> {
  const cleanId = eventId.trim();
  if (!cleanId) return;

  processedWebhookEvents.delete(`${provider}:${cleanId}`);

  try {
    const admin = createAdminClient();
    await admin
      .from("webhook_events")
      .delete()
      .eq("provider", provider)
      .eq("event_id", cleanId);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Upsert (insert or update) a user's subscription row with idempotency guard.
 *
 * The update is skipped if the row's current_period_end is already equal to or
 * later than the incoming period_end — this prevents out-of-order or replayed
 * webhook events from rolling back or double-extending a period.
 *
 * Exception: "cancelled" and "expired" status changes always win (they are
 * terminal states and must not be suppressed by a stale active event).
 */
export async function upsertSubscription(payload: SubscriptionUpsertPayload): Promise<void> {
  const admin = createAdminClient();
  const isTerminal = payload.status === "cancelled" || payload.status === "expired";

  // ── Idempotency: skip stale or duplicate active/trialing updates ───────────
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
      const existingIsActive = existing.status === "active";

      // Skip if existing active subscription period ends at or after incoming period
      if (!existingIsTerminal && existingIsActive && incomingEnd <= existingEnd) {
        return;
      }
      // For trialing rows, skip if incoming period is strictly older
      if (!existingIsTerminal && !existingIsActive && incomingEnd < existingEnd) {
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
 * Fetch a subscription row by Remita RRR, including status and stored RRR/orderId
 * so the webhook can verify ownership and idempotency.
 */
export async function getSubscriptionByRemitaRrr(
  rrr: string
): Promise<{
  userId: string;
  plan: string;
  status: string;
  remitaRrr: string | null;
  remitaOrderId: string | null;
  currentPeriodEnd: string;
} | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id, plan, status, remita_rrr, remita_order_id, current_period_end")
    .eq("remita_rrr", rrr)
    .single();
  if (!data) return null;
  return {
    userId: data.user_id,
    plan: data.plan,
    status: data.status,
    remitaRrr: data.remita_rrr ?? null,
    remitaOrderId: data.remita_order_id ?? null,
    currentPeriodEnd: data.current_period_end,
  };
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
