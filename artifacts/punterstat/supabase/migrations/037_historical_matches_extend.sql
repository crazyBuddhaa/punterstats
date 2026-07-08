-- ============================================================
-- PunterStat — Extend historical_matches for rich CSV import
--
-- Adds: ELO ratings, form metrics, avg/max 1X2 odds,
--       over/under odds, Asian handicap, calibrated model probs.
-- Also: enables RLS with public-read / admin-write policies,
--       and adds indexes for team-centric queries (H2H).
-- Run after 036_statistical_thinking_new_modules.sql
-- ============================================================

-- ── New columns ─────────────────────────────────────────────

alter table public.historical_matches
  -- ELO ratings at kick-off
  add column if not exists home_elo            numeric(9,2),
  add column if not exists away_elo            numeric(9,2),

  -- Recent form (points accumulated in last N games)
  add column if not exists form3_home          numeric(6,2),
  add column if not exists form5_home          numeric(6,2),
  add column if not exists form3_away          numeric(6,2),
  add column if not exists form5_away          numeric(6,2),

  -- Average market 1X2 odds
  add column if not exists avg_home_odds       numeric(8,3),
  add column if not exists avg_draw_odds       numeric(8,3),
  add column if not exists avg_away_odds       numeric(8,3),

  -- Best (max) market 1X2 odds
  add column if not exists max_home_odds       numeric(8,3),
  add column if not exists max_draw_odds       numeric(8,3),
  add column if not exists max_away_odds       numeric(8,3),

  -- Over/Under 2.5 goals odds
  add column if not exists over25_odds         numeric(8,3),
  add column if not exists under25_odds        numeric(8,3),
  add column if not exists max_over25_odds     numeric(8,3),
  add column if not exists max_under25_odds    numeric(8,3),

  -- Asian handicap
  add column if not exists handi_size          numeric(5,2),
  add column if not exists handi_home_odds     numeric(8,3),
  add column if not exists handi_away_odds     numeric(8,3),

  -- Calibrated model probabilities (C_* columns in source CSV)
  add column if not exists prob_lth            numeric(8,5),  -- C_LTH  (long-term home win)
  add column if not exists prob_lta            numeric(8,5),  -- C_LTA  (long-term away win)
  add column if not exists prob_vhd            numeric(8,5),  -- C_VHD
  add column if not exists prob_vad            numeric(8,5),  -- C_VAD
  add column if not exists prob_htb            numeric(8,5),  -- C_HTB
  add column if not exists prob_phb            numeric(8,5),  -- C_PHB

  -- Optional kick-off time (HH:MM)
  add column if not exists match_time          text;

-- ── Additional indexes ───────────────────────────────────────
-- H2H queries combine home + away lookups; a partial index on
-- a concat is impractical — these two let the planner use
-- index union (OR queries).
create index if not exists hm_elo_idx
  on public.historical_matches (home_elo, away_elo);

create index if not exists hm_result_idx
  on public.historical_matches (result);

-- Compound index used by the results browser filter
create index if not exists hm_league_date_idx
  on public.historical_matches (league_code, match_date desc);

-- ── Row-level security ───────────────────────────────────────
alter table public.historical_matches enable row level security;
alter table public.match_odds         enable row level security;

-- Anyone (anon + authenticated) can read historical data
create policy "historical_matches_public_read"
  on public.historical_matches
  for select
  using (true);

create policy "match_odds_public_read"
  on public.match_odds
  for select
  using (true);

-- Only the service role (backend / cron) may insert / update / delete
create policy "historical_matches_admin_write"
  on public.historical_matches
  for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "match_odds_admin_write"
  on public.match_odds
  for all
  using     (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
