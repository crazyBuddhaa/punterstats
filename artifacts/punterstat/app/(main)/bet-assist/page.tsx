import type { Metadata } from "next";
import {
  Activity,
  Calculator,
  ClipboardCheck,
  FileBarChart2,
  LifeBuoy,
  NotebookPen,
  Target,
} from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { PillarGrid } from "@/components/bet-assist/pillar-grid";

export const metadata: Metadata = {
  title: "Bet Assist — Slip Checker, Calculators, Tracker & Report Card — PunterStat",
  description:
    "Check your slips with Quick Paste, run Cash-Out, Acca Bonus and Kelly calculators, log singles & accumulators in ₦, and audit your edge with the Betting Report Card.",
};

const TOOLS = [
  {
    href: "/bet-assist/slip-checker",
    title: "Bet Slip Checker",
    description:
      "Quick-paste your single or accumulator odds to see true fair probability, bookmaker margin, acca bonus reality and red flags.",
    icon: ClipboardCheck,
  },
  {
    href: "/bet-assist/calculators",
    title: "Betting Calculators",
    description:
      "Cash-Out Evaluator, Acca Bonus vs Margin, illustrative Kelly & EV, accumulator returns, bookmaker margin, fair odds and arbitrage.",
    icon: Calculator,
  },
  {
    href: "/dashboard/bet-tracker",
    title: "Bet Tracker",
    description:
      "Log singles and multi-leg accumulators in ₦ across SportyBet, Bet9ja, BetKing or 1xBet, then track ROI, strike rate and bankroll curves.",
    icon: NotebookPen,
  },
  {
    href: "/dashboard/report-card",
    title: "Betting Report Card",
    description:
      "Diagnose where money leaks — Closing-Line Value (CLV), probability calibration, accumulator drag and stake-sizing discipline.",
    icon: FileBarChart2,
  },
  {
    href: "/dashboard/calibration",
    title: "Calibration Trainer",
    description:
      "Run 5-match probability drills and score your judgement with Brier calibration ratings before staking real money.",
    icon: Activity,
  },
  {
    href: "/responsible-gambling",
    title: "Stay in Control",
    description:
      "Bankroll rules, warning signs and Nigerian & international support resources if betting stops being fun.",
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
        description="Check your slips, run calculators, log every wager in ₦ and diagnose leaks with your Betting Report Card. We don't take bets and we don't give tips."
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
