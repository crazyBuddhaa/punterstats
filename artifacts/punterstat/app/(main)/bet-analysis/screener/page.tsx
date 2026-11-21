import type { Metadata } from "next";
import { SlidersHorizontal } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import {
  ResponsibleGamblingNote,
  ResponsibleGamblingStrip,
} from "@/components/bet-assist/responsible-gambling";
import { MatchScreener } from "@/components/screener/match-screener";

export const metadata: Metadata = {
  title: "Daily Match Screener — PunterStat",
  description:
    "Filter upcoming football fixtures by model probabilities: clean favorites, Over 2.5, BTTS, Draw Hunters, and Acca Anchors — then send picks straight to the Bet Slip Checker.",
};

export default async function MatchScreenerPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
        <>
          <ToolHero
            icon={SlidersHorizontal}
            eyebrow="Bet Analysis"
            title="Daily Match Screener"
            description="Filter upcoming fixtures by model probabilities — pick clean favorites, Over 2.5, BTTS, Draw Hunters, or Acca Anchors and send them straight to the Bet Slip Checker."
            backHref="/bet-analysis"
            backLabel="Bet Analysis"
          />
          <ResponsibleGamblingStrip />
        </>
      )}
      <div className={isLoggedIn ? "space-y-6 py-2" : "container mx-auto max-w-5xl space-y-10 px-4 py-10"}>
        {isLoggedIn && (
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Daily Match Screener</h1>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              Filter upcoming matches by favorites, goals, BTTS, Draw Hunters, or Acca Anchors and send picks straight to Slip Checker.
            </p>
          </div>
        )}
        <MatchScreener />
        {!isLoggedIn && <ResponsibleGamblingNote />}
      </div>
    </div>
  );
}
