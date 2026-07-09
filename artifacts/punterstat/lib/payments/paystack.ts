// ============================================================
// PunterStat — Paystack Integration
// REST API calls (no official Node SDK needed).
// Handles checkout initialisation and webhook verification.
// ============================================================

import crypto from "crypto";
import type { PlanId } from "./types";
import { PLAN_CONFIG } from "./index";

const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

// ── Plan code resolution ───────────────────────────────────────────────────

export function getPaystackPlanCode(planId: PlanId): string {
  const env =
    planId === "premium"
      ? process.env.PAYSTACK_PREMIUM_PLAN_CODE
      : process.env.PAYSTACK_PRO_PLAN_CODE;

  if (!env) {
    throw new Error(
      `Paystack plan code not configured: PAYSTACK_${planId.toUpperCase()}_PLAN_CODE`
    );
  }
  return env;
}

// ── Initialize transaction ─────────────────────────────────────────────────
// Initialising with a `plan` param causes Paystack to:
//   1. Charge the card immediately (first month)
//   2. Create a recurring subscription
// The user is redirected to authorization_url to complete card entry.

export interface PaystackInitParams {
  email: string;
  planId: PlanId;
  userId: string;
  callbackUrl: string;
}

export interface PaystackInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializePaystackTransaction({
  email,
  planId,
  userId,
  callbackUrl,
}: PaystackInitParams): Promise<PaystackInitResult> {
  const plan = PLAN_CONFIG[planId];
  const planCode = getPaystackPlanCode(planId);
  const reference = `PS-${planId}-${userId.slice(0, 8)}-${Date.now()}`;

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: plan.ngnKobo,       // Paystack expects kobo
      currency: "NGN",
      plan: planCode,
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId,
        plan: planId,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://punterstat.site"}/pricing`,
      },
    }),
  });

  const json = (await response.json()) as {
    status: boolean;
    message: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };

  if (!json.status || !json.data) {
    throw new Error(`Paystack init failed: ${json.message}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

// ── Verify transaction ─────────────────────────────────────────────────────

export interface PaystackTransactionData {
  reference: string;
  status: string;           // "success" | "failed" | ...
  amount: number;           // kobo
  currency: string;
  customer: { email: string; customer_code: string };
  plan?: { plan_code: string; name: string };
  subscription_code?: string;
  paid_at: string;
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackTransactionData> {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
    }
  );
  const json = (await response.json()) as {
    status: boolean;
    message: string;
    data?: PaystackTransactionData;
  };
  if (!json.status || !json.data) {
    throw new Error(`Paystack verify failed: ${json.message}`);
  }
  return json.data;
}

// ── Webhook signature verification ────────────────────────────────────────

export function verifyPaystackWebhook(rawBody: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

// ── Webhook event types ────────────────────────────────────────────────────

export interface PaystackWebhookEvent<T = unknown> {
  event: string;
  data: T;
}

export interface PaystackSubscriptionData {
  subscription_code: string;
  status: "active" | "non-renewing" | "cancelled" | "completed" | "attention";
  plan: { plan_code: string; name: string; interval: string };
  customer: { email: string; customer_code: string };
  next_payment_date: string;
  created_at: string;
  amount: number;
}

export interface PaystackChargeData {
  reference: string;
  amount: number;
  currency: string;
  status: "success" | "failed";
  paid_at: string;
  customer: { email: string; customer_code: string };
  plan?: { plan_code: string; name: string };
  subscription_code?: string;
  metadata?: { userId?: string; plan?: string };
}

/** Map Paystack status → PunterStat subscription status */
export function paystackStatusToSubscriptionStatus(
  paystackStatus: string
): "active" | "cancelled" | "expired" | "trialing" {
  switch (paystackStatus) {
    case "active":
      return "active";
    case "non-renewing":
    case "cancelled":
      return "cancelled";
    case "completed":
    case "attention":
      return "expired";
    default:
      return "expired";
  }
}
