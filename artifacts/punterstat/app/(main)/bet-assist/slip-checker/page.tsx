import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { SlipChecker } from "@/components/bet-assist/slip-checker";

export const metadata: Metadata = {
  title: "Bet Slip Checker — PunterStat",
  description:
    "Check any single or accumulator: combined odds, the true chance it lands, compounded bookmaker margin, acca bonus reality check, and risk warnings.",
};

export default async function SlipCheckerPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
        <>
          <ToolHero
            icon={ClipboardCheck}
            title="Bet Slip Checker"
            description="Paste or enter the legs of your slip before you stake. See what the price implies, how much margin you're paying, and whether an acca bonus actually beats the vig."
          />
          <ResponsibleGamblingStrip />
        </>
      )}
      <div className={isLoggedIn ? "space-y-6 py-2" : "container mx-auto max-w-5xl space-y-10 px-4 py-10"}>
        {isLoggedIn && (
          <div>
            <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Bet Slip Checker</h1>
            <p className="mt-1 text-xs text-[#1e293b]/55">
              Quick-paste leg odds or build your ticket to check true probability, compounded margin, and acca bonus impact.
            </p>
          </div>
        )}
        <SlipChecker isAuthenticated={isLoggedIn} />
        {!isLoggedIn && <ResponsibleGamblingNote />}
      </div>
    </div>
  );
}
