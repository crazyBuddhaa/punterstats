import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { BetCalculators } from "@/components/bet-assist/calculators";

export const metadata: Metadata = {
  title: "Betting Calculators — Kelly, Accumulator, Margin, Arbitrage — PunterStat",
  description:
    "Free betting calculators: Kelly criterion stake, expected value, accumulator returns, bookmaker margin and fair odds, odds converter and arbitrage.",
};

export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={Calculator}
        title="Betting Calculators"
        description="Work out your edge, the right stake, what an accumulator really pays and how much margin the bookmaker is taking."
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        <BetCalculators />
        <ResponsibleGamblingNote />
      </div>
    </div>
  );
}
