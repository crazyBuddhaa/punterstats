-- ============================================================
-- PunterStat — Tennis Sports University Content
-- Stage 29: Tennis categories, courses, and sample lessons
-- Run after 012_basketball.sql
-- ============================================================

insert into public.course_categories (name, slug, description, icon_name, sort_order, section) values
  ('Tennis Fundamentals',   'tennis-fundamentals',   'The rules, scoring system, court surfaces, and structure of professional tennis — the foundation before anything else.',    'target',  20, 'sports_university'),
  ('Tennis Tactics',        'tennis-tactics',         'How professional players construct points, exploit weaknesses, and adapt their game plan to different opponents and surfaces.', 'shield',  21, 'sports_university'),
  ('Tennis Competitions',   'tennis-competitions',    'Grand Slams, ATP/WTA Tours, rankings, seedings, and how the global professional tennis calendar is structured.',              'trophy',  22, 'sports_university');

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'How Tennis Scoring Works', 'how-tennis-scoring-works',
  'Love, 15, 30, 40, deuce, advantage — the tennis scoring system explained clearly, including tiebreaks and match formats.',
  'beginner', true, 1
from public.course_categories where slug = 'tennis-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Court Surfaces & Their Impact', 'tennis-court-surfaces',
  'How grass, clay, and hard courts change the speed, bounce, and style of play — and why surface matters for analysing outcomes.',
  'beginner', true, 2
from public.course_categories where slug = 'tennis-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Serve and Return Strategy', 'tennis-serve-return-strategy',
  'Why the serve is the most important shot in tennis and how elite returners neutralise it.',
  'intermediate', true, 1
from public.course_categories where slug = 'tennis-tactics';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Playing Styles and Archetypes', 'tennis-playing-styles',
  'Baseline grinders, serve-and-volleyers, all-court players, and aggressive baseliners — how different styles match up.',
  'intermediate', true, 2
from public.course_categories where slug = 'tennis-tactics';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'The Grand Slams Explained', 'tennis-grand-slams',
  'What makes the four Grand Slams unique — format, surface, tradition, and why they carry more weight than any other tournament.',
  'beginner', true, 1
from public.course_categories where slug = 'tennis-competitions';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'ATP & WTA Rankings System', 'tennis-rankings-system',
  'How ranking points are earned and lost, why seedings matter in draws, and how the ranking system shapes the tennis season.',
  'intermediate', true, 2
from public.course_categories where slug = 'tennis-competitions';

-- Lessons — How Tennis Scoring Works
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Points, Games, and Sets', 'tennis-points-games-sets',
  '## The building blocks

Tennis is scored across three layers: points, games, and sets.

## Points within a game

Each game starts at love (0). Points progress: 15, 30, 40. Both players at 40 = Deuce. At deuce, a player must win two consecutive points. The first gives Advantage; if they win the next they win the game; if they lose it returns to deuce.

## Games within a set

A set is won by the first player to reach 6 games, leading by at least 2. At 6-6, most sets are decided by a tiebreak.

## Sets within a match

Men''s Grand Slam matches are best of 5 sets. All other men''s and all women''s tour matches are best of 3 sets.

## Why this matters analytically

The non-linear nature of tennis scoring creates fascinating probability dynamics. Winning 55% of points typically translates to winning far more than 55% of matches — small edges in point-winning probability compound enormously through the games-sets-match structure.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-tennis-scoring-works' and cat.slug = 'tennis-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The Tiebreak: When Sets Reach 6-6', 'tennis-tiebreak-explained',
  '## What is a tiebreak?

When a set reaches 6-6, most formats use a tiebreak rather than continuing indefinitely. The tiebreak is played to 7 points, win by 2.

## How the tiebreak is served

The player due to serve next serves the first point. After that, each player alternates serving every two points. Players change ends every 6 points.

## Final set tiebreak variations by Grand Slam

- **Australian Open** — standard tiebreak at 6-6 in all sets
- **French Open** — super-tiebreak (first to 10, win by 2) at 6-6 in the final set
- **Wimbledon** — standard tiebreak, but final set only once it reaches 12-12
- **US Open** — standard tiebreak at 6-6 in all sets

These differences affect match duration, physical demands, and late-match probability significantly.',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-tennis-scoring-works' and cat.slug = 'tennis-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'How Service Breaks Decide Matches', 'tennis-service-breaks',
  '## Holding serve is the baseline expectation

At elite level, holding your service game is expected. Professional servers win the majority of their service games — typically 75-85% on hard courts.

## What is a break of serve?

A break occurs when the returning player wins a service game. Because holding serve is the baseline, every break represents an exceptional performance by the returner.

## Break points: the critical moments

A break point occurs when the returner is one point away from winning the service game. Converting break points — and saving them when serving — is one of the most predictive performance metrics in professional tennis.

## Analytical insight

Players with high break-point conversion rates and high break-point save rates simultaneously are the most consistent performers on tour. These statistics often explain outcomes better than raw point-winning percentages.',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-tennis-scoring-works' and cat.slug = 'tennis-fundamentals';

-- Lessons — Court Surfaces
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Clay, Grass, and Hard: How Surfaces Change Everything', 'tennis-three-surfaces',
  '## Clay courts

Clay produces a high, slow bounce. Points last longer, rallies are extended, and endurance becomes decisive. Topspin is rewarded — the high bounce amplifies heavy topspin groundstrokes.

**Famous event:** Roland Garros (French Open)

## Grass courts

Grass produces a low, fast bounce. Points are shorter, the serve is more dominant, and net approaches are more effective. Slice backhands stay low and are especially effective.

**Famous event:** Wimbledon

## Hard courts

Hard courts produce a medium-height, consistent bounce — the most neutral surface. Well-rounded players tend to perform most reliably here.

**Famous events:** Australian Open, US Open

## Why surface matters for analysis

Player performance across surfaces varies enormously. Some elite players dominate clay but struggle on grass. Any serious analytical comparison must account for surface as a variable.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-court-surfaces' and cat.slug = 'tennis-fundamentals';

-- Lessons — Serve and Return Strategy
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Why the Serve is the Most Important Shot', 'tennis-serve-importance',
  '## The server''s structural advantage

The server controls every single point from its beginning. They choose placement, speed, spin, and timing. No other shot provides this level of control.

## First serve vs. second serve

Players hit two serves per point. The first serve is hit near maximum speed — high risk, high reward. Missing the second serve is a double fault, immediately gifting the point to the opponent.

## Serve placement: the three targets

1. **Out wide** — pulls the returner off the court
2. **Body** — jams the returner, limiting swing arc
3. **Down the T** — aimed at the centre strap, limits return angles

## Reading serve statistics

First serve percentage, first serve points won, and second serve points won are the three most important serving statistics. A player who wins 80%+ of first serve points but only 48% of second serve points is highly vulnerable when their first serve percentage drops.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-serve-return-strategy' and cat.slug = 'tennis-tactics';

-- Lessons — Playing Styles
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The Four Playing Style Archetypes', 'tennis-playing-archetypes',
  '## Archetype 1: The Baseline Grinder

Wins through consistency and outlasting opponents in long rallies. Rarely attempts high-risk winners.

**Strengths:** excellent on clay, punishes aggressive opponents who make errors
**Weaknesses:** vulnerable to players who vary pace and spin

## Archetype 2: The Aggressive Baseliner

Attacks from the back of the court, generating winners through power and precision.

**Strengths:** explosive on hard courts
**Weaknesses:** higher error rate, can be destabilised by heavy topspin

## Archetype 3: The Serve-and-Volleyer

Serves and immediately advances to net. Largely extinct at the modern top level but still effective on grass.

**Strengths:** devastating on fast surfaces
**Weaknesses:** ineffective on clay; modern returners are too accurate at passing

## Archetype 4: The All-Court Player

Combines elements of all styles — comfortable at the baseline, capable at the net.

**Strengths:** adaptable, hardest to prepare for
**Weaknesses:** rarely as dominant in any single dimension as a specialist

## Using archetypes for analysis

Understanding the structural matchup between playing styles is the most useful analytical lens in tennis. A baseline grinder versus an aggressive baseliner on clay is a fundamentally different contest than the same matchup on hard courts.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-playing-styles' and cat.slug = 'tennis-tactics';

-- Lessons — Grand Slams
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The Four Grand Slams and What Makes Them Unique', 'tennis-four-grand-slams',
  '## Why Grand Slams are different

Grand Slams are the four most prestigious tournaments in tennis. They award double the ranking points of Masters 1000 events and are the primary measure of a player''s legacy.

## Australian Open (January, Melbourne)

Surface: Hard (Plexicushion). Hot conditions reward powerful, athletic players.

## French Open — Roland Garros (May-June, Paris)

Surface: Clay. The most physically demanding Grand Slam — clay rewards endurance, topspin, and court coverage.

## Wimbledon (June-July, London)

Surface: Grass. The oldest and most traditional Grand Slam. Fast grass favours big servers and net players. Strict all-white clothing rule.

## US Open (August-September, New York)

Surface: Hard (DecoTurf). The loudest, most urban Grand Slam. Tiebreaks in all sets including the final.

## The calendar year Grand Slam

Winning all four Grand Slams in a single calendar year is the rarest achievement in tennis. Only five players in history have achieved it in singles.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-grand-slams' and cat.slug = 'tennis-competitions';

-- Lessons — Rankings System
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'How ATP and WTA Rankings Are Calculated', 'tennis-rankings-calculation',
  '## The rolling 52-week window

ATP and WTA rankings are calculated on a rolling 52-week basis. Points expire exactly 52 weeks after they were earned — creating the phenomenon of defending points.

## How points are distributed

- **Grand Slam** — winner earns 2,000 points (ATP)
- **Masters 1000 / WTA 1000** — winner earns 1,000 points
- **ATP 500 / WTA 500** — winner earns 500 points
- **ATP 250 / WTA 250** — winner earns 250 points

## Mandatory events

Top-ranked players must enter a minimum set of mandatory events each year or receive the full points deducted. This prevents players from cherry-picking only their best surfaces.

## Why seedings matter in draws

Seeds receive favourable draw positions — placed in separate quarters to avoid meeting each other until the latter stages. The top two seeds are guaranteed to be on opposite halves of the draw.

## Analytical insight

A player''s ranking is a lagging indicator reflecting the past 52 weeks. Recent form, surface-specific records, and head-to-head history are often more predictive than raw ranking position.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-rankings-system' and cat.slug = 'tennis-competitions';
