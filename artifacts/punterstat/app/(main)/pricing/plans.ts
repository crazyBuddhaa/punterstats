// Shared plan data — single source of truth imported by /pricing,
// PricingCurrencyToggle.tsx, and /dashboard/subscription.
// Must live outside page.tsx because Next.js forbids arbitrary named exports from page files.

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanRow {
  id: "free" | "pro" | "premium";
  name: string;
  tierTag: "Free" | "Pro" | "Premium";
  gbp: string | null;
  ngn: string | null;
  period: string;
  badge: string | null;
  description: string;
  cta: string;
  ctaHref: string;
  ctaVariant: "outline" | "default";
  features: PlanFeature[];
}

export const PLAN_ROWS: PlanRow[] = [
  {
    id: "free",
    name: "Free",
    tierTag: "Free",
    gbp: null,
    ngn: null,
    period: "/month",
    badge: "Free forever",
    description: "Learn the mechanics and check your slips at zero cost.",
    cta: "Get started free",
    ctaHref: "/register",
    ctaVariant: "outline",
    features: [
      { label: "Sports University & Betting Academy lessons", included: true },
      { label: "Bet Slip Checker & Betting Calculators", included: true },
      { label: "Bet Tracker / Journal & basic ROI summary", included: true },
      { label: "Historical Football Stats & H2H Explorer", included: true },
      { label: "Lesson bookmarks & progress tracking", included: true },
      { label: "Match Breakdown Analyzer & saved history", included: false },
      { label: "Simulation Engine history & Spot The Value", included: false },
      { label: "Full Betting Report Card (CLV, calibration & leaks)", included: false },
      { label: "Calibration Trainer & behavioural flags", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tierTag: "Pro",
    gbp: "£4",
    ngn: "₦700",
    period: "/month",
    badge: "Most popular",
    description: "For regular punters who want matchday analysis tools and saved history.",
    cta: "Start Pro",
    ctaHref: "/checkout?plan=pro",
    ctaVariant: "default",
    features: [
      { label: "Sports University & Betting Academy lessons", included: true },
      { label: "Bet Slip Checker & Betting Calculators", included: true },
      { label: "Bet Tracker / Journal & basic ROI summary", included: true },
      { label: "Historical Football Stats & H2H Explorer", included: true },
      { label: "Lesson bookmarks & progress tracking", included: true },
      { label: "Match Breakdown Analyzer & saved history", included: true },
      { label: "Simulation Engine history & Spot The Value", included: true },
      { label: "Full Betting Report Card (CLV, calibration & leaks)", included: false },
      { label: "Calibration Trainer & behavioural flags", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tierTag: "Premium",
    gbp: "£9",
    ngn: "₦1,500",
    period: "/month",
    badge: "Best value",
    description: "Full diagnostic analytics — spot leaks, track CLV, and sharpen calibration.",
    cta: "Start Premium",
    ctaHref: "/checkout?plan=premium",
    ctaVariant: "default",
    features: [
      { label: "Sports University & Betting Academy lessons", included: true },
      { label: "Bet Slip Checker & Betting Calculators", included: true },
      { label: "Bet Tracker / Journal & basic ROI summary", included: true },
      { label: "Historical Football Stats & H2H Explorer", included: true },
      { label: "Lesson bookmarks & progress tracking", included: true },
      { label: "Match Breakdown Analyzer & saved history", included: true },
      { label: "Simulation Engine history & Spot The Value", included: true },
      { label: "Full Betting Report Card (CLV, calibration & leaks)", included: true },
      { label: "Calibration Trainer & behavioural flags", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export function getPlanRow(planId: string): PlanRow {
  return PLAN_ROWS.find((p) => p.id === planId) ?? PLAN_ROWS[0];
}
