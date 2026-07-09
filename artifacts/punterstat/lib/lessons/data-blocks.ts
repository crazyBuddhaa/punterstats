import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlockFactor = "home_win_rate" | "avg_goals" | "btts_rate" | "over25_rate";

export interface BlockStat {
  factor: BlockFactor;
  label: string;
  value: string;
  /** e.g. "12,450 matches · Premier League" */
  context: string;
  sampleSize: number;
}

export interface BlockParams {
  factor: BlockFactor;
  /** FDCO league code, e.g. "E0" (Premier League), "SP1" (La Liga). Omit for all leagues. */
  league?: string;
  /**
   * Number of most-recent seasons to include.
   * Reserved for future use — season filtering is not yet implemented.
   * Currently ignored; all available seasons for the given league are used.
   */
  seasons?: number;
}

// ─── League display names ─────────────────────────────────────────────────────

const LEAGUE_NAMES: Record<string, string> = {
  E0: "Premier League",
  E1: "Championship",
  E2: "League One",
  E3: "League Two",
  EC: "Conference",
  SP1: "La Liga",
  SP2: "La Liga 2",
  D1: "Bundesliga",
  D2: "2. Bundesliga",
  I1: "Serie A",
  I2: "Serie B",
  F1: "Ligue 1",
  F2: "Ligue 2",
  N1: "Eredivisie",
  P1: "Primeira Liga",
  SC0: "Scottish Premiership",
  B1: "Pro League",
  G1: "Super League",
  T1: "Süper Lig",
};

// ─── Query ─────────────────────────────────────────────────────────────────────

/**
 * Queries the `historical_matches` table for a pre-aggregated stat.
 *
 * All queries run server-side only (called from a Server Component or API route).
 * Returns null when the dataset has no rows for the requested parameters, or on
 * any DB error — the caller should render a graceful fallback in both cases.
 *
 * Performance note: `home_win_rate` and `btts_rate` use COUNT-only queries
 * (no row transfer). `avg_goals` and `over25_rate` fetch goal columns for the
 * filtered dataset; this is acceptable for the bounded football dataset but
 * should be converted to a Postgres aggregate function when row counts exceed ~200k.
 */
export async function getBlockStat({ factor, league }: BlockParams): Promise<BlockStat | null> {
  try {
    const supabase = await createClient();

    const leagueName = league ? (LEAGUE_NAMES[league] ?? league) : "all leagues";
    const contextSuffix = league ? ` · ${leagueName}` : "";

    switch (factor) {
      case "home_win_rate": {
        let totalQ = supabase
          .from("historical_matches")
          .select("id", { count: "exact", head: true });
        let winsQ = supabase
          .from("historical_matches")
          .select("id", { count: "exact", head: true })
          .eq("result", "H");

        if (league) {
          totalQ = totalQ.eq("league_code", league);
          winsQ = winsQ.eq("league_code", league);
        }

        const [total, wins] = await Promise.all([totalQ, winsQ]);
        const n = total.count ?? 0;
        if (!n) return null;

        const rate = (wins.count ?? 0) / n;
        return {
          factor,
          label: "Home Win Rate",
          value: `${Math.round(rate * 100)}%`,
          context: `${n.toLocaleString()} matches${contextSuffix}`,
          sampleSize: n,
        };
      }

      case "btts_rate": {
        let totalQ = supabase
          .from("historical_matches")
          .select("id", { count: "exact", head: true });
        let bttsQ = supabase
          .from("historical_matches")
          .select("id", { count: "exact", head: true })
          .gt("home_goals", 0)
          .gt("away_goals", 0);

        if (league) {
          totalQ = totalQ.eq("league_code", league);
          bttsQ = bttsQ.eq("league_code", league);
        }

        const [total, btts] = await Promise.all([totalQ, bttsQ]);
        const n = total.count ?? 0;
        if (!n) return null;

        const rate = (btts.count ?? 0) / n;
        return {
          factor,
          label: "Both Teams to Score Rate",
          value: `${Math.round(rate * 100)}%`,
          context: `${n.toLocaleString()} matches${contextSuffix}`,
          sampleSize: n,
        };
      }

      case "over25_rate":
      case "avg_goals": {
        // PostgREST can't aggregate home_goals + away_goals server-side, so we
        // fetch goal columns in-app. Guard against silent truncation by checking
        // total count first; if it exceeds the fetch limit we cannot produce an
        // accurate figure and return null rather than a misleading statistic.
        const FETCH_LIMIT = 200_000;

        let countQ = supabase
          .from("historical_matches")
          .select("id", { count: "exact", head: true })
          .not("home_goals", "is", null)
          .not("away_goals", "is", null);
        if (league) countQ = countQ.eq("league_code", league);

        const { count: total } = await countQ;
        if (!total) return null;

        if (total > FETCH_LIMIT) {
          // Dataset too large for in-app aggregation — convert to a Postgres
          // aggregate function (RPC) when this warning appears in production logs.
          console.warn(
            `[data-blocks] ${factor}: ${total} rows exceeds fetch limit ${FETCH_LIMIT}; ` +
              `returning null to avoid inaccurate stat. Migrate to a DB-side aggregate.`,
          );
          return null;
        }

        let dataQ = supabase
          .from("historical_matches")
          .select("home_goals, away_goals")
          .not("home_goals", "is", null)
          .not("away_goals", "is", null)
          .limit(FETCH_LIMIT);
        if (league) dataQ = dataQ.eq("league_code", league);

        const { data, error } = await dataQ;
        if (error || !data?.length) return null;

        // Sanity check: detect unexpected row-count discrepancy
        if (data.length < total) {
          console.warn(
            `[data-blocks] ${factor}: expected ${total} rows but received ${data.length}; ` +
              `returning null to avoid inaccurate stat.`,
          );
          return null;
        }

        const n = data.length;

        if (factor === "over25_rate") {
          const over = data.filter(
            (m) => (m.home_goals as number) + (m.away_goals as number) > 2.5,
          ).length;
          return {
            factor,
            label: "Over 2.5 Goals Rate",
            value: `${Math.round((over / n) * 100)}%`,
            context: `${n.toLocaleString()} matches${contextSuffix}`,
            sampleSize: n,
          };
        } else {
          const totalGoals = data.reduce(
            (s, m) => s + (m.home_goals as number) + (m.away_goals as number),
            0,
          );
          return {
            factor,
            label: "Average Goals Per Match",
            value: (totalGoals / n).toFixed(2),
            context: `${n.toLocaleString()} matches${contextSuffix}`,
            sampleSize: n,
          };
        }
      }
    }
  } catch {
    return null;
  }
}
