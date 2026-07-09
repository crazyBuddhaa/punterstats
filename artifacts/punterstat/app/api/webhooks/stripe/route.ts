/**
 * POST /api/webhooks/stripe
 * Receives Stripe webhook events and keeps the subscriptions table in sync.
 *
 * Events handled:
 *   checkout.session.completed       — first payment: activate subscription
 *   customer.subscription.updated    — plan change / renewal
 *   customer.subscription.deleted    — cancellation
 *   invoice.payment_failed           — mark expired after failed renewal
 *
 * Raw body must not be parsed by Next.js — we use req.text() for sig verification.
 */

import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructStripeWebhookEvent, extractStripeMetadata } from "@/lib/payments/stripe";
import {
  upsertSubscription,
  getSubscriptionByStripeId,
  getSubscriptionByStripeCustomer,
} from "@/lib/payments/subscriptions";
import type { PlanId } from "@/lib/payments/types";

// Required: opt out of the body-parser so we get raw bytes for signature check
export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody  = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  // ── Verify signature ───────────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(rawBody, signature);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    console.error("[webhook/stripe] signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // ── Handle events ──────────────────────────────────────────────────────────
  try {
    switch (event.type) {

      // ── First successful payment ──────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const meta = extractStripeMetadata(session.metadata);
        if (!meta) {
          console.warn("[webhook/stripe] checkout.session.completed: missing metadata");
          break;
        }

        const sub = await fetchStripeSub(session.subscription as string);
        if (!sub) break;

        await upsertSubscription({
          userId:              meta.userId,
          plan:                meta.plan,
          provider:            "stripe",
          status:              "active",
          currency:            "GBP",
          currentPeriodStart:  new Date(sub.current_period_start * 1000),
          currentPeriodEnd:    new Date(sub.current_period_end   * 1000),
          stripeCustomerId:    session.customer as string,
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      // ── Renewal / plan change ─────────────────────────────────────────────
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const meta = extractStripeMetadata(sub.metadata);

        // Fall back to DB look-up if metadata is missing (e.g. manual update)
        const userId = meta?.userId ?? (await getSubscriptionByStripeId(sub.id))?.userId;
        if (!userId) {
          console.warn("[webhook/stripe] customer.subscription.updated: no userId for sub", sub.id);
          break;
        }

        const plan = (meta?.plan ??
          (await getSubscriptionByStripeId(sub.id))?.plan) as PlanId | undefined;

        const status =
          sub.status === "active" || sub.status === "trialing"
            ? sub.status === "trialing" ? "trialing" : "active"
            : sub.status === "canceled"
            ? "cancelled"
            : "expired";

        await upsertSubscription({
          userId,
          plan: plan ?? "premium",
          provider: "stripe",
          status,
          currency: "GBP",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
          cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer as string,
        });
        break;
      }

      // ── Cancellation ──────────────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const row = await getSubscriptionByStripeId(sub.id)
          ?? await getSubscriptionByStripeCustomer(sub.customer as string);

        if (!row) {
          console.warn("[webhook/stripe] customer.subscription.deleted: unknown sub", sub.id);
          break;
        }

        await upsertSubscription({
          userId:   row.userId,
          plan:     row.plan as PlanId,
          provider: "stripe",
          status:   "cancelled",
          currency: "GBP",
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd:   new Date(sub.current_period_end   * 1000),
          cancelledAt: new Date(),
          stripeSubscriptionId: sub.id,
          stripeCustomerId:     sub.customer as string,
        });
        break;
      }

      // ── Failed renewal ────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (!subId) break;

        const row = await getSubscriptionByStripeId(subId);
        if (!row) break;

        // Don't expire immediately on first failure — Stripe retries.
        // Only mark expired if Stripe has exhausted all retries (billing_reason = subscription_cycle).
        const typedInvoice = invoice as Stripe.Invoice & { billing_reason?: string };
        if (typedInvoice.billing_reason === "subscription_cycle") {
          await upsertSubscription({
            userId:   row.userId,
            plan:     row.plan as PlanId,
            provider: "stripe",
            status:   "expired",
            currency: "GBP",
            currentPeriodStart: new Date(),
            currentPeriodEnd:   new Date(),
            stripeSubscriptionId: subId,
          });
        }
        break;
      }

      default:
        // Unhandled event — acknowledged but not acted on
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error(`[webhook/stripe] error handling ${event.type}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchStripeSub(subId: string): Promise<Stripe.Subscription | null> {
  if (!subId) return null;
  try {
    const { getStripe } = await import("@/lib/payments/stripe");
    return await getStripe().subscriptions.retrieve(subId);
  } catch {
    return null;
  }
}
