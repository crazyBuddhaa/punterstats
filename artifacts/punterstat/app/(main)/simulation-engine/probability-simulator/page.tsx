import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { getUserProfile } from "@/lib/auth/helpers";
import { ProbabilitySimulator } from "@/components/simulation/probability-simulator";

export const metadata: Metadata = {
  title: "Probability Simulator — PunterStat",
  description:
    "Run 1,000 Monte Carlo simulations to visualise long-term outcomes from any set of betting parameters. No real money — educational tool.",
};

export default async function ProbabilitySimulatorPage() {
  const profile = await getUserProfile();
  const isLoggedIn = Boolean(profile);

  return (
    <div className={isLoggedIn ? "" : "min-h-screen bg-[#f8fafc]"}>
      {!isLoggedIn && (
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
      )}

      <div className={isLoggedIn ? "space-y-6 py-2" : "container mx-auto max-w-5xl px-4 py-8 sm:py-12"}>
        <div className={isLoggedIn ? "" : "mb-8"}>
          {isLoggedIn && (
            <Link
              href="/simulation-engine"
              className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-[#3D2DFF] hover:underline"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Simulation Engine
            </Link>
          )}
          <h1 className={isLoggedIn ? "text-xl font-bold text-[#0f172a] sm:text-2xl" : "text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl"}>
            Probability Simulator
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#1e293b]/60">
            Enter your bankroll, odds, estimated win percentage, and stake — or pick a scenario preset — then run{" "}
            <span className="font-semibold text-[#0f172a]">1,000 Monte Carlo trials</span> simultaneously.
          </p>
        </div>
        <ProbabilitySimulator isAuthenticated={isLoggedIn} />
      </div>
    </div>
  );
}
