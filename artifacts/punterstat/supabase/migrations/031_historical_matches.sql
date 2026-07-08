-- ============================================================
-- PunterStat — Historical Matches + Odds
-- Source: football-data.co.uk (free, no key, 2001/02→present)
-- Covers: EPL, La Liga, Bundesliga, Serie A, Ligue 1
-- Run after 030_option_glossary_seed.sql
-- ============================================================

create table public.historical_matches (
  id           uuid     primary key default gen_random_uuid(),
  source       text     not null default 'football-data-co-uk',
  external_id  text     unique not null,   -- "{league_code}_{date}_{home_slug}_{away_slug}"
  league_code  text     not null,          -- E0 SP1 D1 I1 F1
  league_name  text     not null,
  season       text     not null,          -- "2023/24"
  match_date   date     not null,
  home_team    text     not null,
  away_team    text     not null,

  -- Full-time
  home_goals       smallint,
  away_goals       smallint,
  result           char(1),   -- H D A

  -- Half-time
  ht_home_goals    smallint,
  ht_away_goals    smallint,

  -- Match stats
  home_shots               smallint,
  away_shots               smallint,
  home_shots_on_target     smallint,
  away_shots_on_target     smallint,
  home_corners             smallint,
  away_corners             smallint,
  home_fouls               smallint,
  away_fouls               smallint,
  home_yellow_cards        smallint,
  away_yellow_cards        smallint,
  home_red_cards           smallint,
  away_red_cards           smallint,

  -- xG — populated later via API-Football or Understat
  home_xg   numeric(5,2),
  away_xg   numeric(5,2),

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index hm_league_season_idx on public.historical_matches (league_code, season);
create index hm_date_idx          on public.historical_matches (match_date desc);
create index hm_home_team_idx     on public.historical_matches (home_team);
create index hm_away_team_idx     on public.historical_matches (away_team);

-- ------------------------------------------------------------------
-- Odds table — one row per match × bookmaker
-- ------------------------------------------------------------------
create table public.match_odds (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.historical_matches (id) on delete cascade,
  bookmaker  text not null,   -- B365 PS WH VC BW IW ...
  home_odds  numeric(8,3),
  draw_odds  numeric(8,3),
  away_odds  numeric(8,3),
  unique (match_id, bookmaker)
);

create index mo_match_id_idx on public.match_odds (match_id);
