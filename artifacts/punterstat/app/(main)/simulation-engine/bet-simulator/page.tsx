import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { BetSimulator } from "@/components/simulation/bet-simulator";
import { getUser } from "@/lib/auth/helpers";

export const metadata: Metadata = {
  title: "Bet Simulator — PunterStat",
  description:
    "Simulate bet placement with a virtual ₦10,000 balance. Track outcomes, streaks, and ROI — no real money, pure education.",
};

export default async function BetSimulatorPage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-border bg-white">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/simulation-engine"
              className="inline-flex items-center gap-1.5 text-xs text-[#1e293b]/50 transition hover:text-[#0f172a]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Simulation Engine
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-[#1e293b]/50">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Virtual currency only — no real money
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
            Bet Simulator
          </h1>
          <p className="mt-2 text-sm text-[#1e293b]/60">
            You start with a virtual{" "}
            <span className="font-semibold text-[#0f172a]">₦10,000</span> balance. Enter the
            decimal odds and your stake, then simulate the outcome. Track your performance over
            time and see what patterns emerge.
          </p>
        </div>
        <BetSimulator isAuthenticated={!!user} />
      </div>
    </div>
  );
}
