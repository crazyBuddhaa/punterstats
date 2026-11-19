import type { Metadata } from "next";
import { BarChart3, FlaskConical, History, LineChart, Search, Swords, Zap } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid, type PillarItem } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Analysis — Match Breakdown, Value, Stats & Simulations — PunterStat",
  description:
    "Analyse football matches and betting markets with data: Quick 1-Page & 6-Step model probabilities, Spot The Value, 1,000-trial Monte Carlo simulations, historical league benchmarks and H2H records.",
};

const ITEMS: PillarItem[] = [
  {
    href: "/match-breakdown",
    title: "Match Breakdown",
    description:
      "Quick 1-Page or 6-Step mode: turn form, H2H, goals and home advantage into 1X2, Over/Under and BTTS probabilities with live odds comparison.",
    icon: Search,
  },
  {
    href: "/spot-the-value",
    title: "Spot The Value",
    description:
      "Compare your probabilities against live market odds (EPL, UCL, Europa League, Championship & NBA) or use the Manual Odds Checker.",
    icon: Zap,
  },
  {
    href: "/simulation-engine",
    title: "Simulation Engine",
    description:
      "Run 1,000-trial Monte Carlo bankroll simulations with Nigerian stake presets and virtual-balance bet testing.",
    icon: FlaskConical,
  },
  {
    href: "/stats",
    title: "Historical Stats Explorer",
    description:
      "Compare Top 5 European league benchmarks — goals per match, home win %, BTTS and Over 2.5 trends across seasons.",
    icon: LineChart,
  },
  {
    href: "/stats/results",
    title: "Results Browser",
    description:
      "Filter historical results by league, season and team with instant BTTS, Over 2.5 and scoring summaries.",
    icon: History,
  },
  {
    href: "/stats/head-to-head",
    title: "Head-to-Head",
    description:
      "Search any two clubs to inspect past meetings, goals, BTTS, Over 1.5/2.5 and corner trends.",
    icon: Swords,
  },
];

export default function BetAnalysisPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={BarChart3}
        eyebrow="Pillar 1"
        title="Bet Analysis"
        description="Break down any match or market with data before you stake: probabilities, fair prices, historical benchmarks and Monte Carlo simulations."
        backHref="/"
        backLabel="Home"
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <PillarGrid items={ITEMS} />
      </div>
    </div>
  );
}
