import type { LeagueTeam } from "@/lib/league-glossary/types";

interface TeamCardProps {
  team: LeagueTeam;
}

function ResultBar({
  win,
  draw,
  loss,
  label,
}: {
  win: number | null;
  draw: number | null;
  loss: number | null;
  label: string;
}) {
  if (win == null || draw == null || loss == null) return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#1e293b]/40">{label}</p>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/40">
        <div
          className="bg-emerald-500"
          style={{ width: `${win}%` }}
          title={`W ${win}%`}
        />
        <div
          className="bg-amber-400"
          style={{ width: `${draw}%` }}
          title={`D ${draw}%`}
        />
        <div
          className="bg-rose-400"
          style={{ width: `${loss}%` }}
          title={`L ${loss}%`}
        />
      </div>
      <div className="flex gap-3 text-[10px] text-[#1e293b]/50">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          W {win?.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          D {draw?.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
          L {loss?.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a]">{team.name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {team.typicalFormation && (
              <span className="rounded-md bg-[#0f172a]/5 px-2 py-0.5 text-[10px] font-semibold text-[#0f172a]/60">
                {team.typicalFormation}
              </span>
            )}
            {team.playingStyle && (
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">
                {team.playingStyle}
              </span>
            )}
          </div>
        </div>

        {/* xG chips */}
        {(team.xgFor != null || team.xgAgainst != null) && (
          <div className="shrink-0 rounded-xl bg-[#f8fafc] px-3 py-2 text-center">
            <p className="text-[10px] text-[#1e293b]/40 mb-0.5">xG</p>
            <p className="text-xs font-bold text-[#0f172a]">
              {team.xgFor?.toFixed(2) ?? "—"}{" "}
              <span className="font-normal text-[#1e293b]/40">/</span>{" "}
              {team.xgAgainst?.toFixed(2) ?? "—"}
            </p>
            <p className="text-[9px] text-[#1e293b]/30">for / against</p>
          </div>
        )}
      </div>

      {/* Result bars */}
      <div className="space-y-3 mb-4">
        <ResultBar
          win={team.homeWinPct}
          draw={team.homeDrawPct}
          loss={team.homeLossPct}
          label="Home"
        />
        <ResultBar
          win={team.awayWinPct}
          draw={team.awayDrawPct}
          loss={team.awayLossPct}
          label="Away"
        />
      </div>

      {/* Clean sheet rate */}
      {team.cleanSheetRate != null && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#f8fafc] px-3 py-2">
          <span className="text-[10px] font-medium text-[#1e293b]/50 uppercase tracking-wide">
            Clean sheets
          </span>
          <span className="ml-auto text-xs font-bold text-[#0f172a]">
            {team.cleanSheetRate.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Style note */}
      {team.styleNote && (
        <p className="text-xs leading-relaxed text-[#1e293b]/60 line-clamp-4">
          {team.styleNote}
        </p>
      )}
    </div>
  );
}
