import type { Metadata } from "next";
import {
  Activity,
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
  title: "Bet Assist — Slip Checker, Cash-Out Evaluator, Tracker & Report Card — PunterStat",
  description:
    "Check your slips, evaluate bookmaker cash-out offers, log singles & accumulators in ₦, and audit your results with the Betting Report Card.",
};

const TOOLS = [
  {
    href: "/bet-assist/slip-checker",
    title: "Bet Slip Checker & Cash-Out Evaluator",
    description:
      "Decode booking codes or enter legs to check true win probability, find better picks, and evaluate live bookmaker cash-out offers.",
    icon: ClipboardCheck,
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
