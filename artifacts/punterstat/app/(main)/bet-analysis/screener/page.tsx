import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import {
  ResponsibleGamblingNote,
  ResponsibleGamblingStrip,
} from "@/components/bet-assist/responsible-gambling";
import { MatchScreener } from "@/components/screener/match-screener";

export const metadata: Metadata = {
  title: "Daily Match Screener — PunterStat",
  description:
    "Filter upcoming football fixtures by calibrated Dixon-Coles probabilities: clean favorites, Over 2.5, BTTS, and Acca Anchors — then send picks straight to the Bet Slip Checker.",
};

export default function MatchScreenerPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={SlidersHorizontal}
        eyebrow="Bet Analysis"
        title="Daily Match Screener"
        description="Filter upcoming fixtures by calibrated probabilities — not raw win-streak hype. Pick clean favorites, Over 2.5, BTTS, or Acca Anchors and send them straight to the Bet Slip Checker."
        backHref="/bet-analysis"
        backLabel="Bet Analysis"
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        <MatchScreener />
        <ResponsibleGamblingNote />
      </div>
    </div>
  );
}
