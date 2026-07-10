-- Migration 052: SportsAPIPro season-id resolution cache
--
-- Football V2 season-scoped endpoints (events/next, events/last, standings,
-- etc.) require a numeric seasonId that must be resolved dynamically via
-- GET /tournaments/{tournamentId}/seasons and is NOT stable across seasons.
-- Per SportsAPIPro's docs, the active season changes at most a few times a
-- year, so we cache the resolved seasonId per tournament with a 24h TTL to
-- avoid re-resolving on every fixtures refresh (would otherwise double our
-- upstream call count for no benefit).
--
-- This is intentionally separate from cache_refresh_locks: season lookups
-- are idempotent and cheap to occasionally duplicate, so a plain timestamp
-- check is sufficient — no refresh-lock contention handling needed.

CREATE TABLE IF NOT EXISTS sportsapipro_season_cache (
  tournament_id   INTEGER     PRIMARY KEY,
  season_id       INTEGER     NOT NULL,
  season_name     TEXT,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
