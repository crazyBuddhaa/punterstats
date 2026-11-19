// ============================================================
// PunterStat — Payments: Plan Configuration & Exports
// ============================================================

import type { PlanConfig, PlanId } from "./types";

export * from "./types";

// ── Plan prices ────────────────────────────────────────────────────────────
// NGN prices are locally calibrated for Nigerian punters (Paystack / Remita).
// GBP prices apply to UK / International card checkout (Stripe).

export const PLAN_CONFIG: Record<PlanId, PlanConfig> = {
  pro: {
    id: "pro",
    name: "Pro",
    gbpPence: 400,           // £4.00
    ngnKobo: 70_000,         // ₦700
    displayGbp: "£4",
    displayNgn: "₦700",
    description: "Full Match Breakdown Analyzer, Bet Tracker, and Simulation History.",
  },
  premium: {
    id: "premium",
    name: "Premium",
    gbpPence: 900,           // £9.00
    ngnKobo: 150_000,        // ₦1,500
    displayGbp: "£9",
    displayNgn: "₦1,500",
    description: "Everything in Pro plus full Betting Report Card (CLV, calibration & leak detection) and priority support.",
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
