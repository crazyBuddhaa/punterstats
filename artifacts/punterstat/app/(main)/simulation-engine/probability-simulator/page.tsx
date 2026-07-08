import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { ProbabilitySimulator } from "@/components/simulation/probability-simulator";

export const metadata: Metadata = {
  title: "Probability Simulator — PunterStat",
  description:
    "Run 200 Monte Carlo simulations to visualise long-term outcomes from any set of betting parameters. No real money — educational tool.",
};

export default function ProbabilitySimulatorPage() {
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
            Probability Simulator
          </h1>
          <p className="mt-2 text-sm text-[#1e293b]/60">
            Enter your assumptions — odds, your estimated win percentage, stake size, and number
            of bets — then run{" "}
            <span className="font-semibold text-[#0f172a]">200 simulations</span> simultaneously.
            See the full distribution of possible outcomes and understand why variance matters as
            much as edge.
          </p>
        </div>
        <ProbabilitySimulator />
      </div>
    </div>
  );
}
