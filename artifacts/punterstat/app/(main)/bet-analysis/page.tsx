import type { Metadata } from "next";
import { BarChart3, FlaskConical, History, Search, Swords, Zap } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid, type PillarItem } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Analysis — Match Analysis, Value & Stats — PunterStat",
  description:
    "Analyse football matches and betting markets with data: model match probabilities, value vs live odds, Monte Carlo simulations, historical results and head-to-head records.",
};

const ITEMS: PillarItem[] = [
  {
    href: "/match-breakdown",
    title: "Match Analysis",
    description: "Turn form, head-to-head, goals and home advantage into win/draw/win, goals and BTTS probabilities.",
    icon: Search,
  },
  {
    href: "/spot-the-value",
    title: "Spot The Value",
    description: "Compare your probabilities with live, margin-free market odds to see where value sits.",
    icon: Zap,
  },
  {
    href: "/simulation-engine",
    title: "Simulation Engine",
    description: "Simulate thousands of bets or matches to see variance, drawdowns and long-run results.",
    icon: FlaskConical,
  },
  {
    href: "/stats/results",
    title: "Results Browser",
    description: "Filter historical results by league, season and team across Europe's top divisions.",
    icon: History,
  },
  {
    href: "/stats/head-to-head",
    title: "Head-to-Head",
    description: "Every past meeting between two teams, with goals, results and trends.",
    icon: Swords,
  },
  {
    href: "/bet-assist/picks",
    title: "Data-Driven Picks",
    description: "Our model's probabilities for upcoming fixtures and where the best price beats them.",
    icon: BarChart3,
    badge: "New",
  },
];

export default function BetAnalysisPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={BarChart3}
        eyebrow="Pillar 1"
        title="Bet Analysis"
        description="Break down any match or market with data before you bet: probabilities, prices, history and simulations."
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
