"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
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
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();
  const [, startTransition] = useTransition();

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
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [params, pathname, router]
  );

  const hasFilters = selectedLeague || selectedSeason || selectedTeam || selectedResult;

  function clearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* League */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          League
        </label>
        <select
          value={selectedLeague}
          onChange={(e) => update("league", e.target.value)}
          className="h-9 min-w-[160px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          <option value="">All leagues</option>
          {leagues.map((l) => (
            <option key={l.code} value={l.code}>
              {l.name} ({l.country})
            </option>
          ))}
        </select>
      </div>

      {/* Season */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Season
        </label>
        <select
          value={selectedSeason}
          onChange={(e) => update("season", e.target.value)}
          className="h-9 min-w-[120px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          <option value="">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Result */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Result
        </label>
        <select
          value={selectedResult}
          onChange={(e) => update("result", e.target.value)}
          className="h-9 min-w-[110px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
        >
          <option value="">Any result</option>
          <option value="H">Home win</option>
          <option value="D">Draw</option>
          <option value="A">Away win</option>
        </select>
      </div>

      {/* Team search */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Team
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team…"
            defaultValue={selectedTeam}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                update("team", (e.target as HTMLInputElement).value.trim());
              }
            }}
            onBlur={(e) => update("team", e.target.value.trim())}
            className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-5 flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
