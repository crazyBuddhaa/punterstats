import type { Metadata } from "next";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/helpers";
import { getJournal } from "@/lib/bet-assist/journal-actions";
import { BetTracker, type TrackerPrefill } from "@/components/bet-assist/bet-tracker";

export const metadata: Metadata = { title: "Bet Tracker — Dashboard — PunterStat" };

const PREFILL_KEYS = ["event", "selection", "odds", "prob", "bookmaker", "market"] as const;

export default async function BetTrackerPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAuth();
  const [bets, params] = await Promise.all([getJournal(), searchParams]);

  const prefill: TrackerPrefill = {};
  for (const k of PREFILL_KEYS) {
    const v = params[k];
    if (typeof v === "string" && v.length <= 200) prefill[k] = v;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a]">Bet Tracker</h1>
        <p className="mt-1 text-sm text-[#1e293b]/60">
          Log the bets you place and see what&apos;s really working — profit, ROI, strike rate and whether you&apos;re
          beating the closing line. Private to you. Need a pick?{" "}
          <Link href="/bet-assist/picks" className="font-medium text-[#3D2DFF] hover:underline">
            See today&apos;s data-driven picks
          </Link>
          .
        </p>
      </div>
      <BetTracker bets={bets} prefill={prefill} />
      {bets.length === 0 && (
        <p className="text-center text-sm text-[#1e293b]/50">
          No bets logged yet. Your stats and profit curve appear once you add your first bet.
        </p>
      )}
    </div>
  );
}
