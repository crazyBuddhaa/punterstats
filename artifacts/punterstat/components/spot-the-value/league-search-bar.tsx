"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Zap, Search, X, Database } from "lucide-react";
import type { LeagueSearchResult } from "@/lib/spot-the-value/types";

interface SearchResult {
  primary: LeagueSearchResult[];
  secondary: LeagueSearchResult[];
}

interface LeagueSearchBarProps {
  onSelect: (league: LeagueSearchResult) => void;
}

export function LeagueSearchBar({ onSelect }: LeagueSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`/api/spot-the-value/leagues?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      });
      const json = (await res.json()) as SearchResult;
      if (!controller.signal.aborted) {
        setResults(json);
        setOpen(true);
      }
    } catch (err) {
      if ((err as { name?: string }).name !== "AbortError") {
        setResults(null);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 320);
  }

  function handleSelect(league: LeagueSearchResult) {
    setQuery("");
    setResults(null);
    setOpen(false);
    onSelect(league);
  }

  const hasResults = results && (results.primary.length > 0 || results.secondary.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-sm focus-within:border-[#3D2DFF] focus-within:ring-1 focus-within:ring-[#3D2DFF]">
        {loading
          ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#3D2DFF] border-t-transparent shrink-0" />
          : <Search className="h-4 w-4 text-[#1e293b]/40 shrink-0" />
        }
        <input
          type="text"
          placeholder="Search any league — e.g. Ligue 1, MLS, Eredivisie…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results && setOpen(true)}
          className="flex-1 bg-transparent text-sm text-[#0f172a] placeholder:text-[#1e293b]/40 outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); setOpen(false); }}>
            <X className="h-4 w-4 text-[#1e293b]/40 hover:text-[#1e293b]" />
          </button>
        )}
      </div>

      {open && hasResults && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          {results.primary.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
                Live odds available
              </p>
              {results.primary.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <Zap className="h-3.5 w-3.5 text-[#3D2DFF] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0f172a] truncate">{r.title}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.secondary.length > 0 && (
            <div className={results.primary.length > 0 ? "border-t border-border" : ""}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#1e293b]/40">
                Fixture data only — enter market odds manually
              </p>
              {results.secondary.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelect(r)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <Database className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0f172a] truncate">{r.title}</p>
                    <p className="text-xs text-[#1e293b]/40">No live odds — manual entry</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !results.primary.length && !results.secondary.length && (
            <p className="px-4 py-3 text-sm text-[#1e293b]/50">No leagues found for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}

      {open && query.length >= 2 && !loading && !hasResults && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 rounded-xl border border-border bg-white shadow-lg px-4 py-3">
          <p className="text-sm text-[#1e293b]/50">No leagues found for &ldquo;{query}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
