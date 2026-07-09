// ============================================================
// PunterStat — Payments: Plan Configuration & Exports
// ============================================================

import type { PlanConfig, PlanId } from "./types";

export * from "./types";

// ── Plan prices ────────────────────────────────────────────────────────────
// GBP is the canonical currency (Stripe).
// NGN rates are approximate — update quarterly.
// 1 GBP ≈ 1,900 NGN as of 2025-Q3

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  premium: {
    id: "premium",
    name: "Premium",
    gbpPence: 900,           // £9.00
    ngnKobo: 1_500_000,     // ₦15,000
    displayGbp: "£9",
    displayNgn: "₦15,000",
    description: "Full platform access with progress tracking and match analysis.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    gbpPence: 1_900,         // £19.00
    ngnKobo: 3_200_000,     // ₦32,000
    displayGbp: "£19",
    displayNgn: "₦32,000",
    description: "Everything in Premium plus priority support and early feature access.",
  },
};

export function getPlanConfig(planId: string): PlanConfig | null {
  return PLAN_CONFIG[planId as PlanId] ?? null;
}

/** Compute the period end given a monthly subscription start */
export function addOneMonth(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}
