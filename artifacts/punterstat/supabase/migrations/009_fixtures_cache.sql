-- ============================================================
-- PunterStat — Migration 009: Fixtures Cache + Prediction Records
-- Run in order after 008_odds_cache.sql
-- Part of the Quant Layer rollout (see PLAN_QUANT_LAYER.md, Stage 13)
-- ============================================================

-- ── 1. fixtures_cache ────────────────────────────────────────────────────
-- Shared cache for match/fixture data from both API-Football (primary,
-- 100 req/day) and football-data.org (secondary, top-5 leagues fallback).
-- `source` records which provider populated a given row so the UI and
-- router can reason about data freshness/quality per fixture.
CREATE TABLE IF NOT EXISTS public.fixtures_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('api-football', 'football-data')),
  external_id text NOT NULL,
  league text NOT NULL,
  season text,
  home_team text NOT NULL,
  away_team text NOT NULL,
  kickoff timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  home_score integer,
  away_score integer,
  raw_payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS fixtures_cache_source_external_id_idx
  ON public.fixtures_cache (source, external_id);
CREATE INDEX IF NOT EXISTS fixtures_cache_kickoff_idx ON public.fixtures_cache (kickoff);
CREATE INDEX IF NOT EXISTS fixtures_cache_league_idx ON public.fixtures_cache (league);

ALTER TABLE public.fixtures_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fixtures_cache_select_authenticated" ON public.fixtures_cache
  FOR SELECT TO authenticated USING (true);

-- ── 2. prediction_records ───────────────────────────────────────────────
-- Created by the "Track This Prediction" button on the Match Breakdown
-- Analyzer (Stage 16). Stores the model's output at prediction time; once
-- the real match result is known, the Calibration Engine (Stage 19) scores
-- these rows for a Brier score / accuracy / calibration curve.
CREATE TABLE IF NOT EXISTS public.prediction_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fixture_id uuid REFERENCES public.fixtures_cache(id) ON DELETE SET NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_date timestamptz,
  predicted_home_win_prob numeric(5, 4) NOT NULL,
  predicted_draw_prob numeric(5, 4) NOT NULL,
  predicted_away_win_prob numeric(5, 4) NOT NULL,
  model_input jsonb NOT NULL,
  actual_result text CHECK (actual_result IN ('home_win', 'draw', 'away_win')),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prediction_records_user_id_idx ON public.prediction_records (user_id);
CREATE INDEX IF NOT EXISTS prediction_records_fixture_id_idx ON public.prediction_records (fixture_id);
CREATE INDEX IF NOT EXISTS prediction_records_resolved_idx ON public.prediction_records (resolved_at);

ALTER TABLE public.prediction_records ENABLE ROW LEVEL SECURITY;

-- Private per-user data — same pattern as other user-owned tables
-- (e.g. bookmarks, simulation_history).
CREATE POLICY "prediction_records_select_own" ON public.prediction_records
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "prediction_records_insert_own" ON public.prediction_records
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "prediction_records_update_own" ON public.prediction_records
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "prediction_records_delete_own" ON public.prediction_records
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
