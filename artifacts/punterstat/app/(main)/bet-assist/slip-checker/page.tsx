import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { ToolHero } from "@/components/bet-assist/tool-hero";
import { ResponsibleGamblingNote, ResponsibleGamblingStrip } from "@/components/bet-assist/responsible-gambling";
import { SlipChecker } from "@/components/bet-assist/slip-checker";

export const metadata: Metadata = {
  title: "Bet Slip Checker — PunterStat",
  description:
    "Check any single or accumulator: combined odds, the true chance it lands, compounded bookmaker margin, expected value and risk warnings.",
};

export default function SlipCheckerPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <ToolHero
        icon={ClipboardCheck}
        title="Bet Slip Checker"
        description="Enter the legs of your slip before you place it. We'll show you what the price implies, how much margin you're paying, and anything that should make you think twice."
      />
      <ResponsibleGamblingStrip />
      <div className="container mx-auto max-w-5xl space-y-10 px-4 py-10">
        <SlipChecker />
        <ResponsibleGamblingNote />
      </div>
    </div>
  );
}
