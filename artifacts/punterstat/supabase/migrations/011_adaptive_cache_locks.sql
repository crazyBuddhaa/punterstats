-- Migration 011: Adaptive cache refresh locks
--
-- Adds a `cache_refresh_locks` table that owns the two-threshold TTL and
-- stale-while-revalidate lock for every external-API cache group.
--
-- Each row represents one logical cache group identified by a text key:
--   "odds:<sportKey>"            e.g.  "odds:soccer_epl"
--   "fixtures:<source>"          e.g.  "fixtures:football-data"
--
-- TTL semantics
--   fetched_at ... soft_expires_at (1 h)  ->  always serve from cache
--   soft_expires_at ... hard_expires_at (2 h)
--     last_served_at within 30 min  ->  high traffic  ->  refresh
--     last_served_at older          ->  low traffic   ->  serve stale
--   now > hard_expires_at           ->  must refresh regardless of traffic
--
-- Refresh lock
--   is_refreshing + refreshing_since ensure only ONE concurrent request
--   calls the upstream API per cache group. All others serve the stale row.
--   A lock held for > 2 minutes is considered crashed and auto-cleared.

CREATE TABLE IF NOT EXISTS cache_refresh_locks (
  cache_key         TEXT        PRIMARY KEY,
  fetched_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  soft_expires_at   TIMESTAMPTZ NOT NULL,
  hard_expires_at   TIMESTAMPTZ NOT NULL,
  last_served_at    TIMESTAMPTZ,
  is_refreshing     BOOLEAN     NOT NULL DEFAULT false,
  refreshing_since  TIMESTAMPTZ
);

-- RLS: service-role only (admin client writes; no client-side access needed)
ALTER TABLE cache_refresh_locks ENABLE ROW LEVEL SECURITY;

-- Fast lookup by key (already covered by PRIMARY KEY, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_cache_refresh_locks_key
  ON cache_refresh_locks (cache_key);

-- ── fixtures_cache.source constraint fix ────────────────────────────────────
-- Migration 009 only allowed 'api-football' and 'football-data'.
-- The footballdata-io client (primary source) writes 'footballdata-io', which
-- was blocked by that constraint. Replace the constraint using plain ALTER TABLE
-- statements (no DO block needed -- DROP CONSTRAINT IF EXISTS is native SQL).

ALTER TABLE public.fixtures_cache
  DROP CONSTRAINT IF EXISTS fixtures_cache_source_check;

ALTER TABLE public.fixtures_cache
  DROP CONSTRAINT IF EXISTS fixtures_cache_source_check_v2;

ALTER TABLE public.fixtures_cache
  ADD CONSTRAINT fixtures_cache_source_check_v2
  CHECK (source IN ('api-football', 'football-data', 'footballdata-io'));
