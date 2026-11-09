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

export type PillarKey =
  | "matches"
  | "analysis"
  | "learning"
  | "teams-players"
  | "statistics"
  | "assist";

export interface Pillar {
  key: PillarKey;
  label: string;
  href: string;
  tagline: string;
  links: PillarLink[];
}

export const PILLARS: Pillar[] = [
  {
    key: "matches",
    label: "Matches",
    href: "/match-breakdown",
    tagline: "Dedicated 11-dimension Match Centre for every fixture.",
    links: [
      { href: "/match-breakdown", label: "Match Centre", description: "11-factor analytical breakdown" },
      { href: "/stats/results", label: "Results Browser", description: "Recently completed fixtures" },
      { href: "/stats/head-to-head", label: "Head-to-Head", description: "Historical meeting patterns" },
    ],
  },
  {
    key: "analysis",
    label: "Analysis",
    href: "/bet-analysis",
    tagline: "Tactical patterns, team profilers and quantitative engines.",
    links: [
      { href: "/match-breakdown", label: "Interactive Analyzer", description: "6-factor weighting tool" },
      { href: "/spot-the-value", label: "Spot The Value", description: "Your probabilities vs live market odds" },
      { href: "/simulation-engine", label: "Simulation Engine", description: "Monte Carlo & Poisson simulators" },
    ],
  },
  {
    key: "learning",
    label: "Learning",
    href: "/bet-learning",
    tagline: "10-category football analytics university & knowledge quizzes.",
    links: [
      { href: "/betting-academy", label: "Betting Academy", description: "Odds, value, and probability" },
      { href: "/sports-university", label: "Sports University", description: "Formations, tactics, and statistics" },
      { href: "/betting-academy/option-glossary", label: "Markets Glossary", description: "Every bet type explained" },
      { href: "/league-glossary", label: "League Profiles", description: "Leagues and competition formats" },
      { href: "/blog", label: "Case Studies & Blog", description: "Tactical and statistical guides" },
    ],
  },
  {
    key: "teams-players",
    label: "Teams & Players",
    href: "/stats/head-to-head",
    tagline: "Club profiles, athlete dossiers and comparative radar matrices.",
    links: [
      { href: "/stats/head-to-head", label: "Club Dossiers", description: "Tactical styles and squad metrics" },
      { href: "/stats/results", label: "Player Profiles", description: "Shooting efficiency and radar data" },
    ],
  },
  {
    key: "statistics",
    label: "Statistics",
    href: "/stats",
    tagline: "Independent statistical explorer across top European leagues.",
    links: [
      { href: "/stats", label: "Statistical Explorer", description: "Scoring, defense and corner leaderboards" },
      { href: "/stats/results", label: "League Comparisons", description: "Cross-league statistical averages" },
    ],
  },
  {
    key: "assist",
    label: "Bet Assist",
    href: "/bet-assist",
    tagline: "Tools to check your slips, run calculators and track every bet.",
    links: [
      { href: "/bet-assist/slip-checker", label: "Bet Slip Checker", description: "See what your slip implies" },
      { href: "/bet-assist/calculators", label: "Betting Calculators", description: "Illustrative Kelly, accas, margin, arbitrage" },
      { href: "/dashboard/bet-tracker", label: "Bet Tracker", description: "Log bets, track ROI and bankroll" },
    ],
  },
];
