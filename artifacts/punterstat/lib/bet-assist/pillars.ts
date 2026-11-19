/**
 * Site information architecture: the three pillars PunterStat is organised
 * around. Used by the navbar, footer, homepage and pillar hub pages so the
 * structure is defined once.
 */

export interface PillarLink {
  href: string;
  label: string;
  description: string;
}

export type PillarKey = "analysis" | "learning" | "assist";

export interface Pillar {
  key: PillarKey;
  label: string;
  href: string;
  tagline: string;
  links: PillarLink[];
}

export const PILLARS: Pillar[] = [
  {
    key: "analysis",
    label: "Bet Analysis",
    href: "/bet-analysis",
    tagline: "Match probabilities, historical stats, value scanning and Monte Carlo simulations.",
    links: [
      {
        href: "/match-breakdown",
        label: "Match Breakdown",
        description: "Quick 1-Page & 6-Step model probabilities with odds comparison",
      },
      {
        href: "/spot-the-value",
        label: "Spot The Value",
        description: "Compare your probabilities against live or manual bookmaker odds",
      },
      {
        href: "/simulation-engine",
        label: "Simulation Engine",
        description: "1,000-trial Monte Carlo bankroll & Poisson match simulators",
      },
      {
        href: "/stats",
        label: "Historical Stats Explorer",
        description: "Top 5 European league benchmarks, results and H2H trends",
      },
      {
        href: "/stats/head-to-head",
        label: "Head-to-Head Lookup",
        description: "Past meetings with BTTS, Over 2.5 and corners trends",
      },
    ],
  },
  {
    key: "learning",
    label: "Bet Learning",
    href: "/bet-learning",
    tagline: "Structured probability, bankroll and sports-analytics education.",
    links: [
      {
        href: "/betting-academy",
        label: "Betting Academy",
        description: "Odds, margins, value, bankroll management and psychology",
      },
      {
        href: "/sports-university",
        label: "Sports University",
        description: "Football, basketball and tennis tactics and statistical drivers",
      },
      {
        href: "/betting-academy/option-glossary",
        label: "Option Glossary",
        description: "Every market explained — search by GG, DNB, 1X, HC and more",
      },
      {
        href: "/league-glossary",
        label: "League Profiles",
        description: "Competition formats, club lists and historical benchmarks",
      },
    ],
  },
  {
    key: "assist",
    label: "Bet Assist",
    href: "/bet-assist",
    tagline: "Pre-bet reality checks, calculators, bet tracking and performance diagnostics.",
    links: [
      {
        href: "/bet-assist/slip-checker",
        label: "Bet Slip Checker",
        description: "Quick-paste odds to see fair probability, margin and acca bonus reality",
      },
      {
        href: "/bet-assist/calculators",
        label: "Betting Calculators",
        description: "Cash-Out Evaluator, Acca Bonus vs Margin, Kelly, EV and margin",
      },
      {
        href: "/dashboard/bet-tracker",
        label: "Bet Tracker",
        description: "Log singles & accumulators in ₦ with ROI and bankroll curves",
      },
      {
        href: "/dashboard/report-card",
        label: "Betting Report Card",
        description: "Closing-line value, calibration score and leak diagnostics",
      },
      {
        href: "/dashboard/calibration",
        label: "Calibration Trainer",
        description: "5-match Brier score drill to sharpen probability judgement",
      },
    ],
  },
];
