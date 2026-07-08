-- ============================================================
-- PunterStat — League Glossary Schema
-- Creates leagues and league_teams tables with RLS.
-- Run after 026_basketball_tennis_expanded.sql
-- ============================================================

-- ============================================================
-- LEAGUES
-- ============================================================
create table public.leagues (
  id                    uuid primary key default uuid_generate_v4(),
  slug                  text not null unique,
  name                  text not null,
  country               text not null,
  sport                 text not null default 'football',
  logo_url              text,
  season                text not null,                          -- e.g. '2024-25'
  playing_style         text not null default 'mixed'
                          check (playing_style in (
                            'possession-based',
                            'direct',
                            'high-tempo',
                            'counter-attacking',
                            'mixed'
                          )),
  style_summary         text,                                   -- 2-3 sentence narrative
  avg_goals_per_game    numeric(4, 2),
  xg_trend              text,                                   -- prose description
  home_advantage_index  numeric(5, 2),                         -- % lift over neutral (0.0 = none)
  home_win_pct          numeric(5, 2),
  draw_pct              numeric(5, 2),
  away_win_pct          numeric(5, 2),
  ou_reference_line     numeric(4, 2),                         -- typical market line, e.g. 2.5
  over_pct              numeric(5, 2),                         -- % of games going over that line
  fatigue_pattern       text,                                   -- narrative on congestion / form drop
  parity_score          numeric(5, 2),                         -- 0-100 (100 = fully competitive)
  parity_note           text,                                   -- brief explanation
  is_published          boolean not null default false,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger set_leagues_updated_at
  before update on public.leagues
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- LEAGUE TEAMS
-- ============================================================
create table public.league_teams (
  id                uuid primary key default uuid_generate_v4(),
  league_id         uuid references public.leagues(id) on delete cascade not null,
  slug              text not null,
  name              text not null,
  logo_url          text,
  season            text not null,
  playing_style     text,
  typical_formation text,                                       -- e.g. '4-3-3'
  home_win_pct      numeric(5, 2),
  home_draw_pct     numeric(5, 2),
  home_loss_pct     numeric(5, 2),
  away_win_pct      numeric(5, 2),
  away_draw_pct     numeric(5, 2),
  away_loss_pct     numeric(5, 2),
  xg_for            numeric(4, 2),                             -- avg xG scored per game
  xg_against        numeric(4, 2),                             -- avg xG conceded per game
  clean_sheet_rate  numeric(5, 2),                             -- % of games with a clean sheet
  style_note        text,                                       -- 2-3 sentence team narrative
  is_published      boolean not null default false,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (league_id, slug)
);

create trigger set_league_teams_updated_at
  before update on public.league_teams
  for each row execute procedure public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
create index leagues_slug_idx
  on public.leagues (slug);

create index leagues_published_sort_idx
  on public.leagues (is_published, sort_order);

create index league_teams_league_published_sort_idx
  on public.league_teams (league_id, is_published, sort_order);

create index league_teams_slug_idx
  on public.league_teams (slug);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.leagues      enable row level security;
alter table public.league_teams enable row level security;

-- Public: read published leagues
create policy "Public read published leagues"
  on public.leagues for select
  using (is_published = true);

-- Public: read published teams
create policy "Public read published league teams"
  on public.league_teams for select
  using (is_published = true);

-- Admins: full access to leagues
create policy "Admins full access to leagues"
  on public.leagues for all
  using (public.is_admin())
  with check (public.is_admin());

-- Admins: full access to league teams
create policy "Admins full access to league teams"
  on public.league_teams for all
  using (public.is_admin())
  with check (public.is_admin());
