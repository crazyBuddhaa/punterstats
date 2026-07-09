/**
 * POST /api/checkout/stripe
 * Creates a Stripe Checkout Session for Premium or Pro subscription.
 * Returns { redirectUrl } — the browser redirects to Stripe's hosted page.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { getFullSubscription } from "@/lib/payments/subscriptions";
import { getPlanConfig } from "@/lib/payments";
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

  // ── Input validation ───────────────────────────────────────────────────────
  const body = await req.json().catch(() => ({}));
  const planId = body?.planId as string | undefined;

  if (!planId || !getPlanConfig(planId)) {
    return NextResponse.json(
      { error: "Invalid plan. Must be 'premium' or 'pro'." },
      { status: 400 }
    );
  }

  // ── Existing Stripe customer ───────────────────────────────────────────────
  const existing = await getFullSubscription(user.id);
  const stripeCustomerId = existing?.stripeCustomerId ?? null;

  // ── Create session ─────────────────────────────────────────────────────────
  try {
    const session = await createStripeCheckoutSession({
      userId: user.id,
      email: user.email!,
      planId: planId as PlanId,
      stripeCustomerId,
    });

    return NextResponse.json({ redirectUrl: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[checkout/stripe]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
