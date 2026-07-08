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
    <div className="flex flex-wrap gap-3 items-end">
      {/* League */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wide">
          League
        </label>
        <select
          value={selectedLeague}
          onChange={(e) => update("league", e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3D2DFF] min-w-[160px]"
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
        <label className="text-xs text-white/50 font-medium uppercase tracking-wide">
          Season
        </label>
        <select
          value={selectedSeason}
          onChange={(e) => update("season", e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3D2DFF] min-w-[120px]"
        >
          <option value="">All seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Result */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wide">
          Result
        </label>
        <select
          value={selectedResult}
          onChange={(e) => update("result", e.target.value)}
          className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#3D2DFF] min-w-[110px]"
        >
          <option value="">Any result</option>
          <option value="H">Home win</option>
          <option value="D">Draw</option>
          <option value="A">Away win</option>
        </select>
      </div>

      {/* Team search */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wide">
          Team
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
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
            className="h-9 w-48 rounded-md border border-white/10 bg-white/5 pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#3D2DFF]"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="h-9 flex items-center gap-1.5 rounded-md border border-white/10 px-3 text-sm text-white/50 hover:text-white hover:border-white/30 transition-colors mt-5"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
