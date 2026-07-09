/**
 * POST /api/checkout/paystack
 * Initialises a Paystack transaction for Premium or Pro subscription.
 * Returns { redirectUrl } — the browser redirects to Paystack's hosted page.
 * On success Paystack redirects to /checkout/success?provider=paystack.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/payments/paystack";
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

  // ── Initialise transaction ─────────────────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site";
  const callbackUrl = `${baseUrl}/checkout/success?provider=paystack`;

  try {
    const result = await initializePaystackTransaction({
      email: user.email!,
      planId: planId as PlanId,
      userId: user.id,
      callbackUrl,
    });

    return NextResponse.json({ redirectUrl: result.authorizationUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Paystack error";
    console.error("[checkout/paystack]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
