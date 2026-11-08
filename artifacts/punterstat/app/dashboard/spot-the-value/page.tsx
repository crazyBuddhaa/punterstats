import type { Metadata } from "next";
import Link from "next/link";
import { Zap, BookOpen, TrendingUp, BarChart2 } from "lucide-react";
import { getOdds } from "@/lib/odds/client";
import { computeValueFromOddsEvent } from "@/lib/spot-the-value/calculator";
import { ValueAnalyzer } from "@/components/spot-the-value/value-analyzer";

export const metadata: Metadata = {
  title: "Spot The Value — Dashboard | PunterStat",
  description:
    "Compare your model's predicted probabilities against market-implied probabilities for upcoming football fixtures inside your dashboard.",
};

export default async function DashboardSpotTheValuePage() {
  const result = await getOdds("soccer_epl");
  const initialMatches = result.success
    ? result.events
        .map((e) => computeValueFromOddsEvent(e))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .slice(0, 15)
    : [];
  const fromCache = result.success ? result.fromCache : false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-[#0f172a]">Spot The Value</h1>
          </div>
          <p className="mt-1 text-sm text-[#1e293b]/60">
            Compare model probabilities against market-implied odds to uncover mathematical +EV opportunities.
          </p>
        </div>
      </div>

      <ValueAnalyzer
        initialMatches={initialMatches}
        initialSport="soccer_epl"
        fromCache={fromCache}
      />

      {/* Educational context */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: BarChart2,
            title: "Bookmaker Overround",
            desc: "Bookmakers price all outcomes so probabilities sum to >100%. Stripping this surplus gives fair baseline odds.",
          },
          {
            icon: TrendingUp,
            title: "Fair Implied Chance",
            desc: "The true consensus probability stripped of the house edge — your objective reference benchmark.",
          },
          {
            icon: Zap,
            title: "Value Edge (+EV)",
            desc: "When model probability exceeds fair market probability, you hold positive mathematical expectation.",
          },
          {
            icon: BookOpen,
            title: "Disciplined Staking",
            desc: "Log your spots in the Bet Tracker to observe edge realization across multi-hundred wager samples.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <item.icon className="h-4 w-4 text-[#3D2DFF] mb-2" />
            <h3 className="text-xs font-bold text-[#0f172a]">{item.title}</h3>
            <p className="mt-1 text-xs text-[#1e293b]/60 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
