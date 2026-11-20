"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Search, X } from "lucide-react";

interface Props {
  leagues: { code: string; name: string; country: string }[];
  seasons: string[];
  selectedLeague: string;
  selectedSeason: string;
  selectedTeam: string;
  selectedResult: string;
}

export function ResultsFilters({
  leagues,
  seasons,
  selectedLeague,
  selectedSeason,
  selectedTeam,
  selectedResult,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [teamInput, setTeamInput] = useState(selectedTeam);
  const [teams, setTeams] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Keep input synced when URL changes (e.g. clicking Clear)
  useEffect(() => {
    setTeamInput(selectedTeam);
  }, [selectedTeam]);

  // Load distinct teams for autocomplete (scoped to active league/season)
  useEffect(() => {
    let active = true;
    const qs = new URLSearchParams();
    if (selectedLeague) qs.set("league", selectedLeague);
    if (selectedSeason) qs.set("season", selectedSeason);
    const url = qs.toString() ? `/api/historical/teams?${qs.toString()}` : "/api/historical/teams";

    fetch(url)
      .then((r) => r.json())
      .then((json: { success?: boolean; teams?: string[] }) => {
        if (active && json.success && Array.isArray(json.teams)) {
          setTeams(json.teams);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [selectedLeague, selectedSeason]);

  const suggestions = useMemo(() => {
    const q = teamInput.trim().toLowerCase();
    if (!q || teams.length === 0) return [];
    const starts: string[] = [];
    const includes: string[] = [];
    for (const t of teams) {
      const lower = t.toLowerCase();
      if (lower === q) continue;
      if (lower.startsWith(q)) starts.push(t);
      else if (lower.includes(q)) includes.push(t);
      if (starts.length + includes.length >= 12) break;
    }
    return [...starts, ...includes].slice(0, 8);
  }, [teamInput, teams]);

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.delete("page");
      startTransition(() => {
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [params, pathname, router],
  );

  const hasFilters = Boolean(selectedLeague || selectedSeason || selectedTeam || selectedResult);

  function clearAll() {
    setTeamInput("");
    setOpen(false);
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 pb-5">
      {/* League */}
      <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 sm:flex-initial">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          League
        </label>
        <select
          value={selectedLeague}
          onChange={(e) => update("league", e.target.value)}
          disabled={isPending}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition focus:border-[#3D2DFF] focus:outline-none focus:ring-2 focus:ring-[#3D2DFF]/15"
        >
          <option value="">All leagues ({leagues.length})</option>
          {leagues.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name}
              {l.country ? ` (${l.country})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-1.5 min-w-[135px] flex-1 sm:flex-initial">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Season
        </label>
        <select
          value={selectedSeason}
          onChange={(e) => update("season", e.target.value)}
          disabled={isPending}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition focus:border-[#3D2DFF] focus:outline-none focus:ring-2 focus:ring-[#3D2DFF]/15"
        >
          <option value="">All seasons ({seasons.length})</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Result */}
      <div className="flex flex-col gap-1.5 min-w-[125px] flex-1 sm:flex-initial">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Result
        </label>
        <select
          value={selectedResult}
          onChange={(e) => update("result", e.target.value)}
          disabled={isPending}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-xs transition focus:border-[#3D2DFF] focus:outline-none focus:ring-2 focus:ring-[#3D2DFF]/15"
        >
          <option value="">Any result</option>
          <option value="H">Home win</option>
          <option value="D">Draw</option>
          <option value="A">Away win</option>
        </select>
      </div>

      {/* Team search with autocomplete */}
      <div className="relative flex flex-col gap-1.5 min-w-[210px] flex-1 sm:flex-initial">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Team
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team (e.g. Arsenal)…"
            value={teamInput}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onChange={(e) => {
              setTeamInput(e.target.value);
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setOpen(false);
                update("team", teamInput.trim());
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition focus:border-[#3D2DFF] focus:outline-none focus:ring-2 focus:ring-[#3D2DFF]/15 sm:w-56"
          />
          {teamInput && (
            <button
              type="button"
              aria-label="Clear team filter"
              onClick={() => {
                setTeamInput("");
                setOpen(false);
                if (selectedTeam) update("team", "");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {suggestions.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onMouseDown={() => {
                    setTeamInput(t);
                    setOpen(false);
                    update("team", t);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-800 transition hover:bg-slate-100"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          disabled={isPending}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5" />
          Reset
        </button>
      )}
    </div>
  );
}
