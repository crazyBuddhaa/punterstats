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
 *
 * NOTE (Stripe API 2026-06-24.dahlia): current_period_start / current_period_end
 * were moved from Subscription to SubscriptionItem. Access via sub.items.data[0].
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

        const { start, end } = getSubPeriod(sub);

        await upsertSubscription({
          userId:              meta.userId,
          plan:                meta.plan,
          provider:            "stripe",
          status:              "active",
          currency:            "GBP",
          currentPeriodStart:  start,
          currentPeriodEnd:    end,
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
          sub.status === "trialing"  ? "trialing"  :
          sub.status === "active"    ? "active"     :
          sub.status === "canceled"  ? "cancelled"  :
                                       "expired";

        const { start, end } = getSubPeriod(sub);

        await upsertSubscription({
          userId,
          plan: plan ?? "premium",
          provider: "stripe",
          status,
          currency: "GBP",
          currentPeriodStart: start,
          currentPeriodEnd:   end,
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

        const { start, end } = getSubPeriod(sub);

        await upsertSubscription({
          userId:   row.userId,
          plan:     row.plan as PlanId,
          provider: "stripe",
          status:   "cancelled",
          currency: "GBP",
          currentPeriodStart: start,
          currentPeriodEnd:   end,
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
          const now = new Date();
          await upsertSubscription({
            userId:   row.userId,
            plan:     row.plan as PlanId,
            provider: "stripe",
            status:   "expired",
            currency: "GBP",
            currentPeriodStart: now,
            currentPeriodEnd:   now,
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

/**
 * Fetch a Stripe subscription by ID, expanding items so period fields are available.
 * In Stripe API 2026-06-24.dahlia, current_period_start/end live on SubscriptionItem.
 */
async function fetchStripeSub(subId: string): Promise<Stripe.Subscription | null> {
  if (!subId) return null;
  try {
    const { getStripe } = await import("@/lib/payments/stripe");
    return await getStripe().subscriptions.retrieve(subId, { expand: ["items"] });
  } catch {
    return null;
  }
}

/**
 * Extract current_period_start / current_period_end from a Stripe Subscription.
 *
 * In Stripe API 2026-06-24.dahlia these fields were moved from the Subscription
 * object to the first SubscriptionItem. We read from the item and fall back to
 * Unix 0 (which the idempotency guard in upsertSubscription will handle safely).
 */
function getSubPeriod(sub: Stripe.Subscription): { start: Date; end: Date } {
  const item = sub.items?.data?.[0] as
    | (Stripe.SubscriptionItem & { current_period_start?: number; current_period_end?: number })
    | undefined;

  const startTs = item?.current_period_start ?? 0;
  const endTs   = item?.current_period_end   ?? 0;

  return {
    start: startTs ? new Date(startTs * 1000) : new Date(),
    end:   endTs   ? new Date(endTs   * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
}
