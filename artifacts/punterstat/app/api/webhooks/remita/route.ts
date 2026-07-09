/**
 * POST /api/webhooks/remita
 * Receives Remita payment notifications and activates subscriptions.
 *
 * Remita sends a payment notification to this URL when a user pays
 * their RRR at a bank, via USSD, or through Remita's payment portal.
 *
 * We verify the payment by re-fetching its status from Remita's API
 * (Remita does not sign webhook payloads with a secret).
 */

import { NextResponse } from "next/server";
import { verifyRemitaPayment, isRemitaPaymentSuccessful } from "@/lib/payments/remita";
import {
  upsertSubscription,
  getSubscriptionByRemitaRrr,
} from "@/lib/payments/subscriptions";
import { addOneMonth } from "@/lib/payments";
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

  const rrr = body.RRR ?? body.rrr;
  if (!rrr) {
    return NextResponse.json({ error: "Missing RRR" }, { status: 400 });
  }

  // ── Verify payment status with Remita ──────────────────────────────────────
  // Never trust the notification payload alone — always re-verify.
  try {
    const status = await verifyRemitaPayment(rrr);

    if (!isRemitaPaymentSuccessful(status.status)) {
      console.info("[webhook/remita] payment not yet successful for RRR", rrr, "status:", status.status);
      // Acknowledge receipt — Remita may retry
      return NextResponse.json({ received: true, activated: false });
    }

    // ── Link RRR → user ────────────────────────────────────────────────────
    const row = await getSubscriptionByRemitaRrr(rrr);
    if (!row) {
      console.warn("[webhook/remita] no subscription row for RRR", rrr);
      return NextResponse.json({ received: true, activated: false });
    }

    const now = new Date();
    await upsertSubscription({
      userId:        row.userId,
      plan:          row.plan as PlanId,
      provider:      "remita",
      status:        "active",
      currency:      "NGN",
      currentPeriodStart: now,
      currentPeriodEnd:   addOneMonth(now),
      remitaRrr:     rrr,
      remitaOrderId: status.orderId ?? body.orderId,
    });

    return NextResponse.json({ received: true, activated: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error("[webhook/remita] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
