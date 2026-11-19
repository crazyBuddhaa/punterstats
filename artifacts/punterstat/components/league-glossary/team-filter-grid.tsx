"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TeamCard } from "./team-card";
import type { LeagueTeam } from "@/lib/league-glossary/types";

export function TeamFilterGrid({ teams }: { teams: LeagueTeam[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((t) =>
      [t.name, t.playingStyle, t.typicalFormation, t.styleNote]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [teams, query]);

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1e293b]/35" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clubs or playing styles…"
          className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm text-[#0f172a] placeholder:text-[#1e293b]/35 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-[#1e293b]/50">
          No clubs match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
