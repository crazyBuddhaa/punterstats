import type { Metadata } from "next";
import { Calculator, ClipboardCheck, LifeBuoy, NotebookPen, Target } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Assist — Slip Checker, Calculators & Tracker — PunterStat",
  description:
    "Check your slips with a bet slip checker, run illustrative expected value and Kelly calculators, and log your bets in a personal bet tracker. We don't take bets and we don't give tips.",
};

const TOOLS = [
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
    description: "Illustrative Kelly and expected value calculators (not advice), accumulator returns, bookmaker margin, fair odds, odds converter and arbitrage.",
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
        description="Check your slips with calculators and a tracker: see what a price implies, how much bookmaker margin is built in, and whether your approach holds up over time. We don't take bets and we don't give tips."
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
