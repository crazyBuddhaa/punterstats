/**
 * POST /api/checkout/remita
 * Generates a Remita RRR (Remittance Retrieval Reference).
 * Returns { rrr, orderId, amountNgn, paymentUrl } — the RRR is displayed
 * in-app; the user pays via any Nigerian bank, USSD, or internet banking.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateRemitaRrr } from "@/lib/payments/remita";
import { getPlanConfig } from "@/lib/payments";
import { upsertSubscription } from "@/lib/payments/subscriptions";
import { addOneMonth } from "@/lib/payments";
import type { PlanId } from "@/lib/payments/types";

export async function POST(req: Request) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Profile (for display name) ─────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .single();

  const payerName = profile?.display_name ?? user.email ?? "PunterStat User";

  // ── Input validation ───────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const planId = body?.planId as string | undefined;

  if (!planId || !getPlanConfig(planId)) {
    return NextResponse.json(
      { error: "Invalid plan. Must be 'premium' or 'pro'." },
      { status: 400 }
    );
  }

  // ── Generate RRR ───────────────────────────────────────────────────────────
  try {
    const result = await generateRemitaRrr({
      planId: planId as PlanId,
      userId: user.id,
      payerName,
      payerEmail: user.email!,
    });

    // Pre-create a "trialing" subscription row so we can link the RRR to the
    // user. Status moves to "active" when the Remita webhook confirms payment.
    const now = new Date();
    await upsertSubscription({
      userId:          user.id,
      plan:            planId as PlanId,
      provider:        "remita",
      status:          "trialing",
      currency:        "NGN",
      currentPeriodStart: now,
      currentPeriodEnd:   addOneMonth(now),
      remitaRrr:       result.rrr,
      remitaOrderId:   result.orderId,
    });

    return NextResponse.json({
      rrr:        result.rrr,
      orderId:    result.orderId,
      amountNgn:  result.amountNgn,
      paymentUrl: result.paymentUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Remita error";
    console.error("[checkout/remita]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
