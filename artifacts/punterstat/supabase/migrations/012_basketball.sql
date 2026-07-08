-- ============================================================
-- PunterStat — Basketball Sports University Content
-- Stage 28: Basketball categories, courses, and sample lessons
-- Run after 011_adaptive_cache_locks.sql
-- ============================================================

-- ── Categories (section = 'sports_university') ───────────────
insert into public.course_categories (name, slug, description, icon_name, sort_order, section) values
  ('Basketball Fundamentals',   'basketball-fundamentals',   'The core rules, positions, and structure of basketball — everything you need to understand the game from the ground up.',          'target',   10, 'sports_university'),
  ('Basketball Strategy',       'basketball-strategy',       'Offensive sets, defensive schemes, pace-and-space concepts, and how coaches design systems to exploit mismatches.',              'layers',   11, 'sports_university'),
  ('Basketball Analytics',      'basketball-analytics',      'Advanced statistics, efficiency metrics, and how the NBA and global leagues use data to evaluate players and teams.',             'chart',    12, 'sports_university');

-- ── Courses — Basketball Fundamentals ────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Introduction to Basketball', 'introduction-to-basketball',
  'Rules, scoring, court dimensions, and the structure of a basketball game explained from scratch.',
  'beginner', true, 1
from public.course_categories where slug = 'basketball-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Positions & Player Roles', 'basketball-positions-and-roles',
  'Point guard to center — what each position is responsible for and how positionless basketball is changing those definitions.',
  'beginner', true, 2
from public.course_categories where slug = 'basketball-fundamentals';

-- ── Courses — Basketball Strategy ────────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Offensive Systems', 'basketball-offensive-systems',
  'Pick-and-roll, motion offense, isolation, and how teams create high-quality shots through structured ball movement.',
  'intermediate', true, 1
from public.course_categories where slug = 'basketball-strategy';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Defensive Schemes', 'basketball-defensive-schemes',
  'Man-to-man, zone defense, switching, and the principles that determine which system a team deploys.',
  'intermediate', true, 2
from public.course_categories where slug = 'basketball-strategy';

-- ── Courses — Basketball Analytics ───────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Reading the Box Score', 'reading-the-box-score',
  'What points, rebounds, assists, steals, blocks, and turnovers actually tell you — and what they hide.',
  'beginner', true, 1
from public.course_categories where slug = 'basketball-analytics';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Advanced Efficiency Metrics', 'basketball-advanced-metrics',
  'PER, True Shooting %, VORP, BPM, Win Shares — the modern framework for evaluating basketball players.',
  'advanced', true, 2
from public.course_categories where slug = 'basketball-analytics';

-- ── Sample Lessons — Introduction to Basketball ───────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Object of the Game',
  'basketball-object-of-the-game',
  '## What basketball is trying to achieve

Basketball is a game of possession and scoring. Two teams of five players compete to score more points than the opponent within four quarters of play (typically 10 or 12 minutes each, depending on the competition).

## How points are scored

- **2 points** — any field goal made from inside the three-point arc
- **3 points** — any field goal made from beyond the three-point arc
- **1 point** — each successful free throw

## The shot clock

Professional basketball uses a shot clock (24 seconds in the NBA, 30 seconds in FIBA) that forces teams to attempt a shot before it expires. This single rule transforms basketball into a game of continuous pace and pressure — it prevents teams from stalling indefinitely and forces offensive decision-making under time constraints.

## Why this matters analytically

Every possession has a value. Teams with better shot selection, faster pace, or superior conversion rates accumulate an edge one possession at a time. Modern basketball analytics treats each possession as a transaction to be optimised.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-basketball' and cat.slug = 'basketball-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Court, Zones, and Key Rules',
  'basketball-court-zones-rules',
  '## Court dimensions

A standard NBA court is 28.7m x 15.2m. The court is divided into a backcourt and frontcourt by the half-court line. Key zones include:

- **The paint (key)** — the rectangular area under each basket; offensive players can only remain here for 3 seconds
- **The three-point arc** — 7.24m from the basket in the NBA; 6.75m in FIBA competitions
- **The mid-range** — the area between the paint and the three-point line; increasingly deprioritised in modern analytics

## Key rules that shape strategy

- **Five-second inbound rule** — teams must inbound the ball within 5 seconds
- **Eight-second backcourt violation** — once a team crosses half-court, they cannot return to the backcourt
- **Goaltending** — defenders cannot block a shot on its downward arc or interfere with the ball above the cylinder of the rim

## Fouls and free throws

Personal fouls accumulate. Once a team reaches a certain foul total in a quarter (the bonus), every subsequent foul sends the opposing player to the free-throw line regardless of whether a shot was attempted. This dramatically alters late-game strategy.',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-basketball' and cat.slug = 'basketball-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'How Turnovers Decide Games',
  'basketball-turnovers',
  '## What is a turnover?

A turnover occurs when a team loses possession of the ball to the opponent without attempting a shot. Common causes include:

- Bad passes (stolen or thrown out of bounds)
- Offensive fouls (charging)
- Shot-clock violations
- Travelling or double-dribble violations

## The hidden cost

Each turnover is not just a missed scoring opportunity — it is also a scoring opportunity gifted to the opponent. A turnover followed by a fast-break layup represents a swing of 4-5 expected points compared to a normal possession.

## Turnover rate as a measure of ball security

Analytics tracks turnover rate: turnovers per 100 possessions. Elite teams typically post turnover rates below 12. A rate above 16 is a serious structural problem.

## What to watch for

Watch which players are making turnovers and in which situations. A point guard who turns the ball over under pressure in the fourth quarter is a significantly different problem from a center who occasionally fumbles entry passes.',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-basketball' and cat.slug = 'basketball-fundamentals';

-- ── Sample Lessons — Basketball Positions ─────────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Five Traditional Positions',
  'basketball-five-positions',
  '## Point Guard (1)

The floor general. Responsible for bringing the ball up the court, running the offense, and making decisions in the half-court. Elite point guards combine passing vision with scoring threat to keep defenders honest.

## Shooting Guard (2)

Primarily a scorer, the shooting guard is expected to make shots off the catch, off the dribble, and at the rim. Modern shooting guards are also increasingly required to defend multiple positions.

## Small Forward (3)

The most versatile position on the floor. Small forwards are expected to contribute across all areas — scoring, rebounding, defending, and ball-handling. The best small forwards are matchup nightmares.

## Power Forward (4)

Traditionally a physical presence near the basket, the power forward role has evolved dramatically. Modern stretch fours space the floor from the three-point line, forcing opposing big men to defend the perimeter.

## Center (5)

The anchor of the defense and the primary presence in the paint. Centers protect the rim, clean the glass, and serve as the hub of pick-and-roll offenses. Rim protection is the single most valuable defensive skill a center can provide.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-positions-and-roles' and cat.slug = 'basketball-fundamentals';

-- ── Sample Lessons — Offensive Systems ────────────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Pick-and-Roll: Basketball''s Core Action',
  'basketball-pick-and-roll',
  '## What is a pick-and-roll?

A pick-and-roll (also called a screen-and-roll) is the most frequently executed action in professional basketball. It involves two players:

1. The ball-handler dribbles toward a defender
2. The screener steps into the path of the defender, creating a legal obstruction
3. Once the screen is set, the ball-handler uses it to gain separation
4. The screener then rolls toward the basket or pops to the perimeter for a jump shot

## Why it works

The pick-and-roll forces the defense to make a decision on every repetition. Does the defending guard fight over the screen or go under it? Does the big man hedge, drop, or switch onto the ball-handler? Every choice creates an advantage somewhere on the floor.

## Reading the defense

Elite pick-and-roll ball-handlers read the defensive response in real time:
- If the big drops — shoot the mid-range or pull-up three
- If the big hedges hard — pass to the rolling big for a lob or short roll finish
- If defenders switch — attack the resulting mismatch immediately

## Why analytics loves it

The pick-and-roll consistently generates either a shot at the rim (the highest-value shot in basketball) or an open three-pointer (the second-highest). It is efficient by design.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-offensive-systems' and cat.slug = 'basketball-strategy';

-- ── Sample Lessons — Defensive Schemes ────────────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Man-to-Man vs. Zone Defense',
  'basketball-man-vs-zone',
  '## Man-to-man defense

In man-to-man defense, each defender is responsible for a specific opposing player. The defender follows their assignment wherever they move on the floor.

**Strengths:** clear responsibility, harder to exploit with set plays, keeps pressure on the ball

**Weaknesses:** exposes individual mismatches, physically demanding over a full game, susceptible to screens

## Zone defense

In a zone defense, defenders are responsible for areas of the court rather than specific players. The most common formations are the 2-3 zone and the 3-2 zone.

**Strengths:** protects the paint, disguises defensive assignments, useful for giving tired defenders a rest

**Weaknesses:** vulnerable to ball movement and three-point shooting, offensive rebounds can be exposed

## Which teams use which — and why

Most professional teams spend the majority of their time in man-to-man. Zone is used situationally: when a key defender is in foul trouble, when the opposing offense relies heavily on isolation, or to change tempo late in a game.

## The hybrid: switching schemes

Modern analytics has pushed many elite teams toward switchable rosters — where all five players can guard multiple positions — enabling aggressive switching on every screen without creating exploitable mismatches.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-defensive-schemes' and cat.slug = 'basketball-strategy';

-- ── Sample Lessons — Reading the Box Score ─────────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'What Points and Rebounds Really Tell You',
  'basketball-points-rebounds',
  '## Points — the visible metric

Points are the most-watched statistic in basketball, but they are also the most misleading in isolation. A player who scores 25 points on 10-of-25 shooting (40%) may be hurting their team more than helping — each missed shot is a possession that yields zero points instead of an average return.

## Efficiency matters more than volume

Always pair points with shooting percentages:
- **Field goal %** — overall shooting accuracy
- **Three-point %** — shooting accuracy from beyond the arc
- **Free throw %** — shooting accuracy from the line

A player scoring 18 points on 50% shooting is almost always more valuable than a player scoring 25 on 38%.

## Rebounds — context is everything

Rebounds are split into offensive and defensive. Defensive rebounds are routine at the professional level. Offensive rebounds are significantly rarer and far more valuable: they extend possessions and reset the shot clock.

## What the box score hides

Standard box scores completely miss:
- Shot creation for teammates
- Defensive positioning and help defense
- Screen-setting effectiveness
- Off-ball movement that draws defenders

This is exactly why advanced metrics exist — to capture what counting statistics cannot.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'reading-the-box-score' and cat.slug = 'basketball-analytics';

-- ── Sample Lessons — Advanced Efficiency Metrics ──────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'True Shooting % and Why It Replaced FG%',
  'basketball-true-shooting-pct',
  '## The problem with field goal percentage

Field goal percentage treats every made shot as equal and ignores free throws entirely. A player who scores primarily on mid-range twos looks identical in FG% to one who scores exclusively from the rim — despite the rim finisher being far more efficient.

## Introducing True Shooting %

True Shooting % (TS%) accounts for the value of all scoring methods:

**Formula:** Points / (2 x (Field Goal Attempts + 0.44 x Free Throw Attempts))

The 0.44 multiplier approximates the average number of possessions used per free throw trip.

## What good looks like

- **League average TS%** typically falls between 55-57% in the NBA
- **Elite scorers** post TS% above 60%
- **Below 52%** is a significant drag on the offense

## Why it changed how teams evaluate players

TS% revealed that mid-range jumpers were systematically underperforming compared to rim attempts and three-pointers. This data insight is the single biggest driver behind the modern NBA shift away from the mid-range game.

## Using it alongside volume

TS% on low shot volume is less meaningful. A player who takes 3 shots per game at 65% TS% is not the same as one who takes 18 shots at 62%. Always read efficiency alongside usage rate.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-advanced-metrics' and cat.slug = 'basketball-analytics';
