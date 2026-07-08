-- ============================================================
-- PunterStat — International Football Dataset
--
-- Stores the Kaggle "martj42" international results dataset:
--   international_matches     — 47,000+ results from 1872 to present
--   international_goalscorers — individual goal records with scorer/minute
--   international_shootouts   — penalty shootout outcomes
--
-- Source: kaggle.com/martj42/international-football-results-from-1872-to-2017
-- Run after 038_r2_sync_log.sql
-- ============================================================

-- ── Match results ─────────────────────────────────────────────────────────────

create table if not exists public.international_matches (
  id           uuid    primary key default gen_random_uuid(),
  source       text    not null default 'kaggle-martj42',
  external_id  text    unique not null,   -- "{date}_{home_slug}_{away_slug}"
  match_date   date    not null,
  home_team    text    not null,          -- country name, e.g. "England"
  away_team    text    not null,
  home_score   smallint,
  away_score   smallint,
  result       char(1)                    -- H D A (home perspective); null if score missing
               check (result in ('H','D','A')),
  tournament   text,                      -- "FIFA World Cup", "Friendly", "UEFA Euro", etc.
  city         text,
  country      text,                      -- host country
  neutral      boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists im_date_idx       on public.international_matches (match_date desc);
create index if not exists im_home_team_idx  on public.international_matches (home_team);
create index if not exists im_away_team_idx  on public.international_matches (away_team);
create index if not exists im_tournament_idx on public.international_matches (tournament);
create index if not exists im_result_idx     on public.international_matches (result);
-- Compound for H2H queries
create index if not exists im_h2h_idx        on public.international_matches (home_team, away_team);

-- ── Goalscorer records ────────────────────────────────────────────────────────

create table if not exists public.international_goalscorers (
  id         uuid    primary key default gen_random_uuid(),
  match_id   uuid    references public.international_matches (id) on delete cascade,
  match_date date    not null,
  home_team  text    not null,
  away_team  text    not null,
  team       text    not null,
  scorer     text    not null,
  minute     smallint,
  own_goal   boolean not null default false,
  penalty    boolean not null default false,
  unique (match_id, scorer, minute, own_goal, penalty)
);

create index if not exists ig_match_id_idx on public.international_goalscorers (match_id);
create index if not exists ig_scorer_idx   on public.international_goalscorers (scorer);
create index if not exists ig_team_idx     on public.international_goalscorers (team);

-- ── Penalty shootout outcomes ─────────────────────────────────────────────────

create table if not exists public.international_shootouts (
  id             uuid primary key default gen_random_uuid(),
  match_date     date not null,
  home_team      text not null,
  away_team      text not null,
  winner         text not null,
  first_shooter  text,
  unique (match_date, home_team, away_team)
);

create index if not exists is_date_idx  on public.international_shootouts (match_date desc);
create index if not exists is_teams_idx on public.international_shootouts (home_team, away_team);

-- ── Row-level security ────────────────────────────────────────────────────────

alter table public.international_matches     enable row level security;
alter table public.international_goalscorers enable row level security;
alter table public.international_shootouts   enable row level security;

create policy "international_matches_public_read"
  on public.international_matches for select using (true);

create policy "international_goalscorers_public_read"
  on public.international_goalscorers for select using (true);

create policy "international_shootouts_public_read"
  on public.international_shootouts for select using (true);

create policy "international_matches_admin_write"
  on public.international_matches for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "international_goalscorers_admin_write"
  on public.international_goalscorers for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "international_shootouts_admin_write"
  on public.international_shootouts for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
