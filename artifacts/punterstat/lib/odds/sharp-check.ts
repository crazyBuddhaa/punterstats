import { createAdminClient } from "@/lib/supabase/admin";
import { stripOverround } from "./devig";
import type { OddsOutcome } from "./types";

/** Sharpest bookmaker keys in priority order (The Odds API keys). */
const SHARP_BOOKMAKERS = ["pinnacle", "betfair_ex_eu", "matchbook", "marathonbet", "betsson"];

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 300;

export interface SharpMarketCheck {
  /** Fair (de-vigged) probability implied by sharp/consensus live odds for this selection. */
  sharpFairProb: number;
  /** Fair decimal odds (1 / sharpFairProb). */
  sharpFairOdds: number;
  /** Source label, e.g. "Pinnacle" or "Market consensus (7 books)". */
  sourceLabel: string;
  /** Implied prob on user's slip minus sharp fair prob (> 0 means slip is priced tighter/worse than sharp). */
  driftPct: number;
  /** True when sharp consensus is meaningfully lower than slip implied prob (>= 6 percentage points). */
  isDriftWarning: boolean;
}

interface CachedH2HPrices {
  homeTeam: string;
  awayTeam: string;
  homeFair: number;
  drawFair: number;
  awayFair: number;
  sourceLabel: string;
  expiresAt: number;
}

const sharpCache = new Map<string, CachedH2HPrices | null>();

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function extract1x2(
  outcomes: OddsOutcome[],
  homeTeam: string,
  awayTeam: string,
): [number, number, number] | null {
  const hNorm = norm(homeTeam);
  const aNorm = norm(awayTeam);
  let hPrice = 0;
  let dPrice = 0;
  let aPrice = 0;

  for (const o of outcomes) {
    const oNorm = norm(o.name);
    if (oNorm === "draw") {
      dPrice = o.price;
    } else if (oNorm === hNorm || oNorm.includes(hNorm) || hNorm.includes(oNorm)) {
      hPrice = o.price;
    } else if (oNorm === aNorm || oNorm.includes(aNorm) || aNorm.includes(oNorm)) {
      aPrice = o.price;
    }
  }

  if (hPrice > 1 && dPrice > 1 && aPrice > 1) {
    return [hPrice, dPrice, aPrice];
  }
  return null;
}

/**
 * Pure helper: map a selection string onto de-vigged 1X2/DC/DNB sharp fair probability.
 */
export function mapSelectionToSharpProb(
  selection: string,
  homeTeam: string,
  awayTeam: string,
  fair1x2: { homeFair: number; drawFair: number; awayFair: number },
): number | null {
  const sel = norm(selection);
  const hNorm = norm(homeTeam);
  const aNorm = norm(awayTeam);
  if (!sel) return null;

  // Exclude goals/btts/combo markets from 1X2-only sharp lookup
  if (
    sel.includes("over") ||
    sel.includes("under") ||
    sel.includes("btts") ||
    sel.includes("both teams") ||
    sel.includes("gg") ||
    sel.includes("ng") ||
    sel.includes("corner") ||
    sel.includes("card") ||
    /\band\b/.test(sel)
  ) {
    return null;
  }

  // Double Chance
  if (sel === "1x" || sel.includes("home or draw") || sel.includes(`${hNorm} or draw`)) {
    return Math.min(0.99, fair1x2.homeFair + fair1x2.drawFair);
  }
  if (sel === "x2" || sel.includes("draw or away") || sel.includes("away or draw") || sel.includes(`${aNorm} or draw`)) {
    return Math.min(0.99, fair1x2.drawFair + fair1x2.awayFair);
  }
  if (sel === "12" || sel.includes("home or away")) {
    return Math.min(0.99, fair1x2.homeFair + fair1x2.awayFair);
  }

  // Draw No Bet
  if (sel.includes("dnb") || sel.includes("draw no bet")) {
    const nonDraw = Math.max(1e-6, fair1x2.homeFair + fair1x2.awayFair);
    if (sel.includes("home") || sel.includes("1") || (hNorm.length >= 3 && sel.includes(hNorm))) {
      return fair1x2.homeFair / nonDraw;
    }
    if (sel.includes("away") || sel.includes("2") || (aNorm.length >= 3 && sel.includes(aNorm))) {
      return fair1x2.awayFair / nonDraw;
    }
    return null;
  }

  // 1X2
  if (sel === "draw" || sel === "x") return fair1x2.drawFair;
  if (sel === "1" || sel === "home" || sel === "home win" || (hNorm.length >= 3 && sel.includes(hNorm))) {
    return fair1x2.homeFair;
  }
  if (sel === "2" || sel === "away" || sel === "away win" || (aNorm.length >= 3 && sel.includes(aNorm))) {
    return fair1x2.awayFair;
  }

  return null;
}

/**
 * Log-opinion-pool blend between a statistical model probability and a sharp market fair probability.
 */
export function blendModelWithMarket(
  modelProb: number,
  marketFairProb: number,
  marketWeight = 0.55,
): number {
  const w = Math.max(0, Math.min(1, marketWeight));
  const pM = Math.max(1e-4, Math.min(1 - 1e-4, modelProb));
  const pK = Math.max(1e-4, Math.min(1 - 1e-4, marketFairProb));
  const logOdds = (1 - w) * Math.log(pM / (1 - pM)) + w * Math.log(pK / (1 - pK));
  return 1 / (1 + Math.exp(-logOdds));
}

/**
 * Look up live cached sharp/consensus odds for a match from Supabase `odds_cache`
 * (zero extra Odds API quota consumed). Returns null if the match isn't currently cached.
 */
export async function checkSharpMarketOdds(
  homeTeam: string,
  awayTeam: string,
  selection: string,
  slipDecimalOdds: number,
): Promise<SharpMarketCheck | null> {
  const hSafe = homeTeam.trim().replace(/[%_\\]/g, "");
  const aSafe = awayTeam.trim().replace(/[%_\\]/g, "");
  if (hSafe.length < 2 || aSafe.length < 2 || !(slipDecimalOdds > 1)) return null;

  const cacheKey = `${hSafe.toLowerCase()}::vs::${aSafe.toLowerCase()}`;
  const cached = sharpCache.get(cacheKey);
  let fairEntry: CachedH2HPrices | null = null;

  if (cached !== undefined && (cached === null || Date.now() < cached.expiresAt)) {
    fairEntry = cached;
  } else {
    try {
      const admin = createAdminClient();
      const cutoff = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      const { data, error } = await admin
        .from("odds_cache")
        .select("home_team, away_team, bookmaker, outcomes")
        .eq("market_key", "h2h")
        .ilike("home_team", `%${hSafe}%`)
        .ilike("away_team", `%${aSafe}%`)
        .gt("fetched_at", cutoff)
        .limit(30);

      if (!error && data && data.length > 0) {
        const rows = data as Array<{
          home_team: string;
          away_team: string;
          bookmaker: string;
          outcomes: OddsOutcome[];
        }>;
        const resolvedHome = rows[0].home_team;
        const resolvedAway = rows[0].away_team;

        // Prefer sharpest bookmaker first
        let chosen: { prices: [number, number, number]; label: string } | null = null;
        for (const sharpKey of SHARP_BOOKMAKERS) {
          const match = rows.find((r) => r.bookmaker.toLowerCase() === sharpKey);
          if (match) {
            const p = extract1x2(match.outcomes, resolvedHome, resolvedAway);
            if (p) {
              chosen = {
                prices: p,
                label: sharpKey === "pinnacle" ? "Pinnacle" : sharpKey.replace(/_/g, " "),
              };
              break;
            }
          }
        }

        // Otherwise take median consensus across cached bookmakers
        if (!chosen) {
          const triples = rows
            .map((r) => extract1x2(r.outcomes, resolvedHome, resolvedAway))
            .filter((t): t is [number, number, number] => t !== null);
          if (triples.length > 0) {
            chosen = {
              prices: [
                median(triples.map((t) => t[0])),
                median(triples.map((t) => t[1])),
                median(triples.map((t) => t[2])),
              ],
              label: `Market consensus (${triples.length} books)`,
            };
          }
        }

        if (chosen) {
          const devigged = stripOverround(chosen.prices);
          fairEntry = {
            homeTeam: resolvedHome,
            awayTeam: resolvedAway,
            homeFair: devigged.fair[0],
            drawFair: devigged.fair[1],
            awayFair: devigged.fair[2],
            sourceLabel: chosen.label,
            expiresAt: Date.now() + CACHE_TTL_MS,
          };
        }
      }
    } catch {
      fairEntry = null;
    }

    if (sharpCache.size >= MAX_CACHE_ENTRIES) {
      const oldest = sharpCache.keys().next().value;
      if (oldest !== undefined) sharpCache.delete(oldest);
    }
    sharpCache.set(cacheKey, fairEntry);
  }

  if (!fairEntry) return null;

  const sharpFairProb = mapSelectionToSharpProb(
    selection,
    fairEntry.homeTeam,
    fairEntry.awayTeam,
    fairEntry,
  );
  if (sharpFairProb === null || sharpFairProb <= 0) return null;

  const slipImplied = 1 / slipDecimalOdds;
  const driftPct = Math.round((slipImplied - sharpFairProb) * 1000) / 10;

  return {
    sharpFairProb: Math.round(sharpFairProb * 1000) / 1000,
    sharpFairOdds: Math.round((1 / sharpFairProb) * 100) / 100,
    sourceLabel: fairEntry.sourceLabel,
    driftPct,
    isDriftWarning: driftPct >= 6,
  };
}
