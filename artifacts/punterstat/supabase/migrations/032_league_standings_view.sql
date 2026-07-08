-- ============================================================
-- PunterStat — League Standings (computed view)
-- Derived live from historical_matches — no separate table needed.
-- Run after 031_historical_matches.sql
-- ============================================================

create or replace view public.league_standings_computed
  with (security_invoker = true)
as
with home_stats as (
  select
    league_code, league_name, season, home_team as team,
    count(*)::int                                                              as played,
    sum(case when result = 'H' then 1 else 0 end)::int                        as won,
    sum(case when result = 'D' then 1 else 0 end)::int                        as drawn,
    sum(case when result = 'A' then 1 else 0 end)::int                        as lost,
    coalesce(sum(home_goals), 0)::int                                         as gf,
    coalesce(sum(away_goals), 0)::int                                         as ga,
    sum(case when result = 'H' then 3 when result = 'D' then 1 else 0 end)::int as pts
  from public.historical_matches
  where result is not null
  group by league_code, league_name, season, home_team
),
away_stats as (
  select
    league_code, league_name, season, away_team as team,
    count(*)::int                                                              as played,
    sum(case when result = 'A' then 1 else 0 end)::int                        as won,
    sum(case when result = 'D' then 1 else 0 end)::int                        as drawn,
    sum(case when result = 'H' then 1 else 0 end)::int                        as lost,
    coalesce(sum(away_goals), 0)::int                                         as gf,
    coalesce(sum(home_goals), 0)::int                                         as ga,
    sum(case when result = 'A' then 3 when result = 'D' then 1 else 0 end)::int as pts
  from public.historical_matches
  where result is not null
  group by league_code, league_name, season, away_team
),
combined as (
  select
    league_code, league_name, season, team,
    sum(played)::int          as played,
    sum(won)::int             as won,
    sum(drawn)::int           as drawn,
    sum(lost)::int            as lost,
    sum(gf)::int              as goals_for,
    sum(ga)::int              as goals_against,
    (sum(gf) - sum(ga))::int  as goal_difference,
    sum(pts)::int             as points
  from (
    select * from home_stats
    union all
    select * from away_stats
  ) t
  group by league_code, league_name, season, team
)
select
  row_number() over (
    partition by league_code, season
    order by points desc, goal_difference desc, goals_for desc, team asc
  )::int as position,
  league_code,
  league_name,
  season,
  team,
  played,
  won,
  drawn,
  lost,
  goals_for,
  goals_against,
  goal_difference,
  points
from combined;
