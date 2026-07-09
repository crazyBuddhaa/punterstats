// ============================================================
// PunterStat — Payment Types
// Shared across Stripe, Paystack, and Remita integrations.
// ============================================================

export type PaymentProvider = "stripe" | "paystack" | "remita";
export type PlanId = "premium" | "pro";

// ── Plan configuration ─────────────────────────────────────────────────────

export interface PlanConfig {
  id: PlanId;
  name: string;
  /** GBP pence — used by Stripe */
  gbpPence: number;
  /** Nigerian Kobo — used by Paystack and Remita */
  ngnKobo: number;
  /** Display price in GBP */
  displayGbp: string;
  /** Display price in NGN */
  displayNgn: string;
  description: string;
}

// ── Checkout ───────────────────────────────────────────────────────────────

export interface CheckoutRequest {
  planId: PlanId;
  provider: PaymentProvider;
}

/** Returned by each /api/checkout/* route */
export interface CheckoutResponse {
  provider: PaymentProvider;
  /** Stripe / Paystack: redirect the browser here */
  redirectUrl?: string;
  /** Remita: display this RRR in-app for bank payment */
  rrr?: string;
  orderId?: string;
  /** Amount in the provider's minor unit (pence / kobo) */
  amount?: number;
  currency?: string;
}

// ── Subscription upsert ────────────────────────────────────────────────────

export interface SubscriptionUpsertPayload {
  userId: string;
  plan: PlanId;
  provider: PaymentProvider;
  status: "active" | "cancelled" | "expired" | "trialing";
  currency: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date | null;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paystackCustomerCode?: string;
  paystackSubscriptionCode?: string;
  remitaRrr?: string;
  remitaOrderId?: string;
}
