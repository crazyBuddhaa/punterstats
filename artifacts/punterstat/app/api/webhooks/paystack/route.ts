/**
 * POST /api/webhooks/paystack
 * Receives Paystack webhook events and keeps the subscriptions table in sync.
 *
 * Events handled:
 *   charge.success       — successful payment (first charge + renewals)
 *   subscription.disable — subscription cancelled / non-renewing
 *
 * Paystack signs each request with HMAC-SHA512 using your secret key.
 * The signature is in the x-paystack-signature header.
 */

import { NextResponse } from "next/server";
import {
  verifyPaystackWebhook,
  paystackStatusToSubscriptionStatus,
  type PaystackWebhookEvent,
  type PaystackChargeData,
  type PaystackSubscriptionData,
} from "@/lib/payments/paystack";
import {
  upsertSubscription,
  getSubscriptionByPaystackCode,
  claimWebhookEvent,
  releaseWebhookEvent,
} from "@/lib/payments/subscriptions";
import { addOneMonth, getPlanConfig } from "@/lib/payments";
import type { PlanId } from "@/lib/payments/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody   = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // ── Verify signature (timing-safe) ─────────────────────────────────────────
  if (!verifyPaystackWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: PaystackWebhookEvent;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const eventId = derivePaystackEventId(body);
  if (eventId) {
    const claimed = await claimWebhookEvent("paystack", eventId);
    if (!claimed) {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

  try {
    switch (body.event) {

      // ── Successful payment (first charge + monthly renewals) ───────────────
      case "charge.success": {
        const data = body.data as PaystackChargeData;

        if (data.status !== "success") break;

        // Only handle subscription charges (has a plan attached)
        if (!data.plan?.plan_code) break;

        // Resolve plan from metadata or Paystack plan name
        const planId =
          resolvePlanId(data.metadata?.plan) ?? resolvePlanFromName(data.plan.name);
        if (!planId) break;

        const planConfig = getPlanConfig(planId);
        if (!planConfig) break;

        // Verify currency and paid amount match the plan before activating
        const currency = (data.currency ?? "").toUpperCase();
        const paidKobo = Number(data.amount);
        if (currency !== "NGN" || !Number.isFinite(paidKobo) || paidKobo !== planConfig.ngnKobo) {
          break;
        }

        // Require metadata.userId (no unverified email lookup fallback)
        const userId =
          typeof data.metadata?.userId === "string" && data.metadata.userId.trim()
            ? data.metadata.userId.trim()
            : null;

        if (!userId) break;

        const paidAt = data.paid_at ? new Date(data.paid_at) : new Date();
        const now = Number.isNaN(paidAt.getTime()) ? new Date() : paidAt;

        await upsertSubscription({
          userId,
          plan:     planId,
          provider: "paystack",
          status:   "active",
          currency: "NGN",
          currentPeriodStart:       now,
          currentPeriodEnd:         addOneMonth(now),
          paystackCustomerCode:     data.customer.customer_code,
          paystackSubscriptionCode: data.subscription_code,
        });
        break;
      }

      // ── Subscription cancelled / disabled ─────────────────────────────────
      case "subscription.disable": {
        const data = body.data as PaystackSubscriptionData;

        const row = await getSubscriptionByPaystackCode(data.subscription_code);
        if (!row) break;

        await upsertSubscription({
          userId:   row.userId,
          plan:     row.plan as PlanId,
          provider: "paystack",
          status:   paystackStatusToSubscriptionStatus(data.status),
          currency: "NGN",
          currentPeriodStart: new Date(data.created_at),
          currentPeriodEnd:   new Date(data.next_payment_date),
          cancelledAt:        new Date(),
          paystackSubscriptionCode: data.subscription_code,
          paystackCustomerCode:     data.customer.customer_code,
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    if (eventId) {
      await releaseWebhookEvent("paystack", eventId);
    }
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error(`[webhook/paystack] error handling ${body?.event}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function resolvePlanId(raw?: string): PlanId | null {
  if (raw === "premium" || raw === "pro") return raw;
  return null;
}

/** Map Paystack plan name → PunterStat PlanId (case-insensitive) */
function resolvePlanFromName(name?: string): PlanId | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes("premium")) return "premium";
  if (lower.includes("pro"))     return "pro";
  return null;
}

/** Build a deterministic event identifier for Paystack webhook deduplication */
function derivePaystackEventId(body: PaystackWebhookEvent): string | null {
  if (!body?.event || !body.data || typeof body.data !== "object") return null;
  const data = body.data as Record<string, unknown>;
  if (typeof data.id === "number" || typeof data.id === "string") {
    return `${body.event}:${data.id}`;
  }
  if (typeof data.reference === "string" && data.reference) {
    return `${body.event}:${data.reference}`;
  }
  if (typeof data.subscription_code === "string" && data.subscription_code) {
    const status = typeof data.status === "string" ? data.status : "";
    const nextPayment = typeof data.next_payment_date === "string" ? data.next_payment_date : "";
    return `${body.event}:${data.subscription_code}:${status}:${nextPayment}`;
  }
  return null;
}
