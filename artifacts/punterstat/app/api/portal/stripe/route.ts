/**
 * POST /api/portal/stripe
 * Creates a Stripe Customer Portal session for self-serve billing management
 * (cancel, update payment method, view invoice history).
 * Returns { redirectUrl } — redirect the browser there.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStripePortalSession } from "@/lib/payments/stripe";
import { getFullSubscription } from "@/lib/payments/subscriptions";

export async function POST() {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Get Stripe customer ID ─────────────────────────────────────────────────
  const subscription = await getFullSubscription(user.id);

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No Stripe subscription found. Please subscribe via the pricing page." },
      { status: 404 }
    );
  }

  // ── Create portal session ──────────────────────────────────────────────────
  try {
    const session = await createStripePortalSession(subscription.stripeCustomerId);
    return NextResponse.json({ redirectUrl: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe portal error";
    console.error("[portal/stripe]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
