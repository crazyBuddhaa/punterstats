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
} from "@/lib/payments/subscriptions";
import { createAdminClient } from "@/lib/supabase/admin";
import { addOneMonth } from "@/lib/payments";
import type { PlanId } from "@/lib/payments/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody  = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // ── Verify signature ───────────────────────────────────────────────────────
  if (!verifyPaystackWebhook(rawBody, signature)) {
    console.warn("[webhook/paystack] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let body: PaystackWebhookEvent;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  try {
    switch (body.event) {

      // ── Successful payment (first charge + monthly renewals) ───────────────
      case "charge.success": {
        const data = body.data as PaystackChargeData;

        // Only handle subscription charges (has a plan attached)
        if (!data.plan?.plan_code) break;

        // Resolve plan from Paystack plan name → PunterStat plan
        const planId = resolvePlanFromName(data.plan.name);
        if (!planId) {
          console.warn("[webhook/paystack] unknown plan:", data.plan.name);
          break;
        }

        // Prefer userId from metadata (set during initializeTransaction)
        let userId: string | null =
          (data.metadata as Record<string, string> | undefined)?.userId ?? null;

        // Fallback: look up user by email
        if (!userId) {
          userId = await getUserIdByEmail(data.customer.email);
        }

        if (!userId) {
          console.warn("[webhook/paystack] cannot resolve userId for", data.customer.email);
          break;
        }

        const now = new Date(data.paid_at);
        await upsertSubscription({
          userId,
          plan:    planId,
          provider: "paystack",
          status:  "active",
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
        if (!row) {
          console.warn("[webhook/paystack] unknown subscription_code:", data.subscription_code);
          break;
        }

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
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error(`[webhook/paystack] error handling ${body?.event}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Map Paystack plan name → PunterStat PlanId (case-insensitive) */
function resolvePlanFromName(name: string): PlanId | null {
  const lower = name.toLowerCase();
  if (lower.includes("premium")) return "premium";
  if (lower.includes("pro"))     return "pro";
  return null;
}

/** Look up a Supabase auth user ID by email using the admin client */
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    // Query the profiles table (email is on auth.users, not public.profiles)
    // Use admin RPC or auth admin — filter by email on auth.users is not possible
    // via the Supabase JS admin client directly, so we fall back to the profiles table
    // which mirrors the userId.
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const match = data?.users.find((u) => u.email === email);
    return match?.id ?? null;
  } catch {
    return null;
  }
}
