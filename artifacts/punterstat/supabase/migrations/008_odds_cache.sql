-- ============================================================
-- PunterStat — Migration 008: Odds Cache + API Quota Log
-- Run in order after 007_blog_fts.sql
-- Part of the Quant Layer rollout (see PLAN_QUANT_LAYER.md, Stage 13)
-- ============================================================

-- ── 1. odds_cache ────────────────────────────────────────────────────────
-- Persistent floor for The Odds API responses (500 credits/month budget).
-- Every fetch is cached here so repeated reads (Bet Simulator, Spot The
-- Value) never re-spend a credit; only a scheduled refresh or explicit
-- cache-miss triggers a new API call.
CREATE TABLE IF NOT EXISTS public.odds_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_key text NOT NULL,
  event_id text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  commence_time timestamptz NOT NULL,
  bookmaker text NOT NULL,
  market_key text NOT NULL,
  outcomes jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS odds_cache_event_id_idx ON public.odds_cache (event_id);
CREATE INDEX IF NOT EXISTS odds_cache_expires_at_idx ON public.odds_cache (expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS odds_cache_event_bookmaker_market_idx
  ON public.odds_cache (event_id, bookmaker, market_key);

ALTER TABLE public.odds_cache ENABLE ROW LEVEL SECURITY;

-- Cache is derived, non-sensitive market data — safe to read for any
-- authenticated user; writes are service-role only (server-side fetch).
CREATE POLICY "odds_cache_select_authenticated" ON public.odds_cache
  FOR SELECT TO authenticated USING (true);

-- ── 2. api_quota_log ─────────────────────────────────────────────────────
-- Tracks daily/monthly usage per external API so lib/sports-data/router.ts
-- can route between primary/secondary sources with hysteresis and avoid
-- exceeding free-tier quotas (API-Football: 100 req/day, Odds API: 500
-- credits/month, football-data.org: 10 req/min).
CREATE TABLE IF NOT EXISTS public.api_quota_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  last_request_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_quota_log_provider_window_idx
  ON public.api_quota_log (provider, window_start, window_end);

ALTER TABLE public.api_quota_log ENABLE ROW LEVEL SECURITY;

-- Internal accounting table — no client access; service role only
-- (no policy grants SELECT/INSERT/UPDATE to anon/authenticated).
