import Link from "next/link";
import { Target, TrendingUp, ShieldCheck } from "lucide-react";
import type { League } from "@/lib/league-glossary/types";

const STYLE_LABELS: Record<string, string> = {
  "possession-based": "Possession",
  direct: "Direct",
  "high-tempo": "High Tempo",
  "counter-attacking": "Counter",
  mixed: "Mixed",
};

const COUNTRY_FLAGS: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Portugal: "🇵🇹",
};

interface LeagueCardProps {
  league: League;
  teamCount: number;
}

export function LeagueCard({ league, teamCount }: LeagueCardProps) {
  const flag = COUNTRY_FLAGS[league.country] ?? "🌍";
  const styleLabel = STYLE_LABELS[league.playingStyle] ?? league.playingStyle;

  return (
    <Link
      href={`/league-glossary/${league.slug}`}
      className="group block rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">{flag}</span>
            <span className="text-xs font-medium text-[#1e293b]/50">{league.country}</span>
          </div>
          <h3 className="text-base font-bold text-[#0f172a] leading-tight group-hover:text-amber-600 transition-colors">
            {league.name}
          </h3>
          <p className="mt-0.5 text-xs text-[#1e293b]/40">{league.season}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
          {styleLabel}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#f8fafc] p-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Target className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-bold text-[#0f172a]">
              {league.avgGoalsPerGame?.toFixed(2) ?? "—"}
            </span>
          </div>
          <p className="text-[10px] text-[#1e293b]/40">Goals/game</p>
        </div>
        <div className="text-center border-x border-border/60">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-bold text-[#0f172a]">
              {league.homeWinPct != null ? `${league.homeWinPct}%` : "—"}
            </span>
          </div>
          <p className="text-[10px] text-[#1e293b]/40">Home wins</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ShieldCheck className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-bold text-[#0f172a]">
              {league.parityScore != null ? league.parityScore.toFixed(0) : "—"}
            </span>
          </div>
          <p className="text-[10px] text-[#1e293b]/40">Parity</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-[#1e293b]/40">
          {teamCount} {teamCount === 1 ? "team" : "teams"} profiled
        </p>
        <span className="text-xs font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
          View league →
        </span>
      </div>
    </Link>
  );
}
