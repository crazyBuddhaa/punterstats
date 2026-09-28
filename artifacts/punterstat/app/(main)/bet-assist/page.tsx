import type { Metadata } from "next";
import { Calculator, ClipboardCheck, LifeBuoy, NotebookPen, Target } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Assist — Picks, Slip Checker, Calculators & Tracker — PunterStat",
  description:
    "Data-driven football picks with model probabilities, a bet slip checker, Kelly and accumulator calculators, and a personal bet tracker for ROI and bankroll.",
};

const TOOLS = [
  {
    href: "/bet-assist/picks",
    title: "Data-Driven Picks",
    description:
      "Model probabilities for upcoming fixtures from bookmaker consensus and team form, with value flags where the best price beats fair odds.",
    icon: Target,
    badge: "New",
  },
  {
    href: "/bet-assist/slip-checker",
    title: "Bet Slip Checker",
    description:
      "Paste in your single or accumulator and see the true chance it lands, the margin you're paying, and the red flags.",
    icon: ClipboardCheck,
  },
  {
    href: "/bet-assist/calculators",
    title: "Betting Calculators",
    description: "Kelly stake, expected value, accumulator returns, bookmaker margin, fair odds, odds converter and arbitrage.",
    icon: Calculator,
  },
  {
    href: "/dashboard/bet-tracker",
    title: "Bet Tracker",
    description: "Log every bet you place, then track profit, ROI, strike rate, closing-line value and your bankroll curve.",
    icon: NotebookPen,
  },
  {
    href: "/responsible-gambling",
    title: "Stay in Control",
    description: "Bankroll rules, warning signs and where to get help if betting stops being fun.",
    icon: LifeBuoy,
  },
];

export default function BetAssistPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={Target}
        eyebrow="Pillar 3"
        title="Bet Assist"
        description="Tools that sit beside you when you bet: what to back, what it's really worth, how much to stake, and whether your approach is actually working."
        backHref="/"
        backLabel="Home"
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        <PillarGrid items={TOOLS} />
        <ResponsibleGamblingNote />
      </div>
    </div>
  );
}
