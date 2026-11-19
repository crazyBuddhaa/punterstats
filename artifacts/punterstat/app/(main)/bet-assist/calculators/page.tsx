import type { Metadata } from "next";
import { Calculator } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { BetCalculators } from "@/components/bet-assist/calculators";

export const metadata: Metadata = {
  title: "Betting Calculators — Kelly, Accumulator, Cash-Out, Margin, Arbitrage — PunterStat",
  description:
    "Free educational betting calculators: illustrative Kelly criterion and expected value, accumulator bonus vs margin, cash-out evaluator, bookmaker margin, odds converter and arbitrage.",
};

export default async function CalculatorsPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
        <>
          <ToolHero
            icon={Calculator}
            title="Betting Calculators"
            description="Explore the maths of expected value, illustrative Kelly fractions, accumulator bonuses vs compounded margin, cash-out haircuts, and bookmaker overround."
          />
          <ResponsibleGamblingStrip />
        </>
      )}
      <div className={isLoggedIn ? "space-y-6 py-2" : "container mx-auto max-w-5xl space-y-10 px-4 py-10"}>
        {isLoggedIn && (
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Betting Calculators</h1>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              EV &amp; Kelly, accumulator bonus vs margin, cash-out evaluator, fair odds, and arbitrage.
            </p>
          </div>
        )}
        <BetCalculators />
        {!isLoggedIn && <ResponsibleGamblingNote />}
      </div>
    </div>
  );
}
