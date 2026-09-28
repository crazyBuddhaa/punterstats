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

export interface Pillar {
  key: "analysis" | "learning" | "assist";
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
    tagline: "Break down matches and markets with data before you bet.",
    links: [
      { href: "/match-breakdown", label: "Match Analysis", description: "Model-based probabilities for any fixture" },
      { href: "/spot-the-value", label: "Spot The Value", description: "Your probabilities vs live market odds" },
      { href: "/simulation-engine", label: "Simulation Engine", description: "Monte Carlo bet and probability simulators" },
      { href: "/stats/results", label: "Results Browser", description: "Historical results across top leagues" },
      { href: "/stats/head-to-head", label: "Head-to-Head", description: "Full meeting history between two teams" },
    ],
  },
  {
    key: "learning",
    label: "Bet Learning",
    href: "/bet-learning",
    tagline: "Learn the maths, markets and mindset behind winning bettors.",
    links: [
      { href: "/betting-academy", label: "Betting Academy", description: "Odds, value, bet types and bankroll" },
      { href: "/sports-university", label: "Sports University", description: "How football, basketball and tennis work" },
      { href: "/betting-academy/option-glossary", label: "Betting Markets Glossary", description: "Every bet type explained" },
      { href: "/league-glossary", label: "League Glossary", description: "Leagues, teams and competition formats" },
      { href: "/blog", label: "Blog", description: "Analysis, guides and news" },
    ],
  },
  {
    key: "assist",
    label: "Bet Assist",
    href: "/bet-assist",
    tagline: "Tools that help you pick, price, stake and track every bet.",
    links: [
      { href: "/bet-assist/picks", label: "Data-Driven Picks", description: "Model probabilities and value flags" },
      { href: "/bet-assist/slip-checker", label: "Bet Slip Checker", description: "See what your slip really implies" },
      { href: "/bet-assist/calculators", label: "Betting Calculators", description: "Kelly, accas, margin, arbitrage" },
      { href: "/dashboard/bet-tracker", label: "Bet Tracker", description: "Log bets, track ROI and bankroll" },
    ],
  },
];
