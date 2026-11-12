/**
 * POST /api/webhooks/remita
 * Receives Remita payment notifications and activates subscriptions.
 *
 * Remita sends a payment notification to this URL when a user pays
 * their RRR at a bank, via USSD, or through Remita's payment portal.
 *
 * We verify the payment by re-fetching its status from Remita's API
 * (Remita does not sign webhook payloads with a secret), verify that
 * the RRR and paid amount match the stored subscription row, and ensure
 * activation is idempotent by event ID and subscription status.
 */

import { NextResponse } from "next/server";
import { verifyRemitaPayment, isRemitaPaymentSuccessful } from "@/lib/payments/remita";
import {
  upsertSubscription,
  getSubscriptionByRemitaRrr,
  claimWebhookEvent,
  releaseWebhookEvent,
} from "@/lib/payments/subscriptions";
import { addOneMonth, getPlanConfig } from "@/lib/payments";
import type { PlanId } from "@/lib/payments/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    // Remita sends form-encoded or JSON depending on configuration
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = Object.fromEntries(new URLSearchParams(text));
    }
  } catch {
    return NextResponse.json({ error: "Bad request body" }, { status: 400 });
  }

  const rrr = String(body.RRR ?? body.rrr ?? "").trim();
  if (!rrr) {
    return NextResponse.json({ error: "Missing RRR" }, { status: 400 });
  }

  let claimedEventId: string | null = null;

  try {
    // ── Link RRR → stored row & check idempotency before activating ────────
    const row = await getSubscriptionByRemitaRrr(rrr);
    if (!row || !row.remitaRrr || row.remitaRrr !== rrr) {
      return NextResponse.json({ received: true, activated: false });
    }

    // If this RRR has already activated the subscription, do not extend again
    if (row.status === "active" && row.remitaRrr === rrr) {
      return NextResponse.json({ received: true, activated: false, duplicate: true });
    }

    // ── Verify payment status with Remita ────────────────────────────────────
    // Never trust the notification payload alone — always re-verify.
    const status = await verifyRemitaPayment(rrr);

    if (!isRemitaPaymentSuccessful(status.status)) {
      return NextResponse.json({ received: true, activated: false });
    }

    // Verify that the returned RRR and orderId belong to the stored row
    const verifiedRrr = String(
      (status as { RRR?: string; rrr?: string }).RRR ?? status.rrr ?? rrr
    ).trim();
    if (verifiedRrr !== row.remitaRrr) {
      return NextResponse.json({ error: "RRR mismatch" }, { status: 400 });
    }

    if (row.remitaOrderId && status.orderId && row.remitaOrderId !== status.orderId) {
      return NextResponse.json({ error: "Order ID mismatch" }, { status: 400 });
    }

    // Verify that the paid amount matches the expected plan amount (in NGN)
    const planConfig = getPlanConfig(row.plan);
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 });
    }

    const expectedAmountNgn = Math.round(planConfig.ngnKobo / 100);
    const paidAmountNgn = Number(status.amount);
    if (!Number.isFinite(paidAmountNgn) || Math.round(paidAmountNgn) !== expectedAmountNgn) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Event-id idempotency guard
    const eventId = `charge.success:${rrr}:${status.orderId ?? row.remitaOrderId ?? ""}`;
    const claimed = await claimWebhookEvent("remita", eventId);
    if (!claimed) {
      return NextResponse.json({ received: true, activated: false, duplicate: true });
    }
    claimedEventId = eventId;

    const now = new Date();
    await upsertSubscription({
      userId:             row.userId,
      plan:               row.plan as PlanId,
      provider:           "remita",
      status:             "active",
      currency:           "NGN",
      currentPeriodStart: now,
      currentPeriodEnd:   addOneMonth(now),
      remitaRrr:          rrr,
      remitaOrderId:      status.orderId ?? row.remitaOrderId ?? body.orderId,
    });

    return NextResponse.json({ received: true, activated: true });
  } catch (err) {
    if (claimedEventId) {
      await releaseWebhookEvent("remita", claimedEventId);
    }
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error("[webhook/remita] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
