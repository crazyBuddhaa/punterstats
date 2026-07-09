-- ============================================================
-- PunterStat — Migration 051: Data Block Pilot
--
-- Annotates the "Crowd Effect & Home Advantage" lesson with the
-- first live data-block marker in the codebase, proving the
-- end-to-end LessonContent server-component pipeline in production.
--
-- The block is inserted immediately before the Key Takeaway
-- section — right where the lesson body discusses home win rates —
-- so the live stat from historical_matches sits alongside the
-- narrative context that references it.
--
-- Affected lesson : crowd-effect-home-advantage
-- Affected course : home-advantage-unpacked  (Football Fundamentals)
-- Block rendered  : home_win_rate across all leagues in the dataset
-- ============================================================

UPDATE public.lessons
SET content = replace(
  content,
  '<h2>Key Takeaway</h2>',
  '<p>The PunterStat historical dataset covers the top five European leagues from 1993/94 through 2025/26. Here is the actual home win rate computed across every match in the dataset:</p>
<div data-block="stat" data-factor="home_win_rate"></div>

<h2>Key Takeaway</h2>'
)
WHERE slug = 'crowd-effect-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');
