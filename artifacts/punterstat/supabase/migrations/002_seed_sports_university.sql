-- ============================================================
-- PunterStat — Sports University Seed Data
-- Run after 001_initial_schema.sql
-- ============================================================

-- ── Categories ──────────────────────────────────────────────
insert into public.course_categories (name, slug, description, icon_name, sort_order) values
  ('Football Fundamentals',    'football-fundamentals',   'The building blocks of how football works — rules, positions, and the physical mechanics of the game.',                         'book',     1),
  ('Tactical Analysis',        'tactical-analysis',       'How teams set up and attack. Formations, pressing systems, transitions, and the chess match between managers.',                 'layers',   2),
  ('Competitions & Structure', 'competitions-structure',  'How leagues, cups, and tournaments are organised — formats, qualification, promotion, and relegation systems.',                 'trophy',   3),
  ('Match Dynamics',           'match-dynamics',          'What happens inside a match — tempo, home advantage, squad rotation, momentum, and injury impact on outcomes.',                 'activity', 4);

-- ── Courses — Football Fundamentals ─────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Introduction to Football', 'introduction-to-football',
  'Start here. Learn the rules, objectives, and structure of a football match from the ground up.',
  'beginner', true, 1
from public.course_categories where slug = 'football-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Positions & Roles', 'positions-and-roles',
  'What every position on the pitch is responsible for — and how those responsibilities shift depending on the system.',
  'beginner', true, 2
from public.course_categories where slug = 'football-fundamentals';

-- ── Courses — Tactical Analysis ─────────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Understanding Formations', 'understanding-formations',
  'What 4-3-3, 4-2-3-1, 3-5-2, and every other formation actually means for how a team attacks and defends.',
  'intermediate', true, 1
from public.course_categories where slug = 'tactical-analysis';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Pressing Systems Explained', 'pressing-systems-explained',
  'High press, mid-block, low block, gegenpressing — how teams win the ball back and why it matters.',
  'intermediate', true, 2
from public.course_categories where slug = 'tactical-analysis';

-- ── Courses — Competitions & Structure ──────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'How Leagues Work', 'how-leagues-work',
  'Points, goal difference, promotion and relegation — the mechanics behind domestic league competitions.',
  'beginner', true, 1
from public.course_categories where slug = 'competitions-structure';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Cup & Knockout Formats', 'cup-and-knockout-formats',
  'Single-leg, two-leg, away goals, seeding, and how tournament brackets are built across UEFA and domestic cups.',
  'beginner', true, 2
from public.course_categories where slug = 'competitions-structure';

-- ── Courses — Match Dynamics ─────────────────────────────────
insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Home Advantage Unpacked', 'home-advantage-unpacked',
  'Why home teams win more often — crowd effect, travel fatigue, referee tendencies, and the data behind it.',
  'intermediate', true, 1
from public.course_categories where slug = 'match-dynamics';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Squad Rotation & Fatigue', 'squad-rotation-and-fatigue',
  'How fixture congestion, rotation strategies, and player fatigue affect team performance and results.',
  'advanced', true, 2
from public.course_categories where slug = 'match-dynamics';

-- ── Sample Lessons — Introduction to Football ────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Objective of the Game',
  'the-objective-of-the-game',
  '## What is football trying to achieve?

Football is a game of goals. Two teams of eleven players compete to score more goals than their opponent within 90 minutes of play.

## The basic structure

A match is divided into two 45-minute halves with a 15-minute half-time interval. Additional time may be added at the end of each half to compensate for stoppages.

## Why this matters analytically

Understanding the objective sounds obvious — but it shapes everything. Every tactical decision, substitution, and formation choice flows from this simple reality: goals decide matches.

## Key insight

Teams do not exist to play attractive football. They exist to score and prevent goals. How they achieve that is where tactics, probability, and intelligence enter the picture.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-football' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Pitch, Ball, and Players',
  'the-pitch-ball-and-players',
  '## The playing surface

A football pitch is a rectangle between 100–110m long and 64–75m wide at professional level. The dimensions influence tactical decisions — wider pitches favour attacking, expansive football; narrower pitches suit compact, physical play.

## Player count and substitutions

Each team fields 11 players. Most competitions allow 3–5 substitutions per match, which gives managers tactical flexibility in the second half.

## The ball in and out of play

The ball is in play until it fully crosses a touchline or goal line. Understanding when the ball is "dead" is critical for analysing set pieces, which produce a significant proportion of goals at all levels.',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-football' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'How Goals Are Scored (and Prevented)',
  'how-goals-are-scored-and-prevented',
  '## The anatomy of a goal

Research consistently shows that most goals at the top level come from:

- Open play (approximately 65–70%)
- Set pieces — corners, free kicks, throw-ins (approximately 25–30%)
- Penalty kicks (approximately 5–10%)

## What this tells us

Set pieces are massively undervalued by casual observers. A team that is dominant from dead-ball situations has a structural advantage that persists across an entire season.

## Prevention is half the battle

Defensive organisation — the shape, discipline, and communication of the back line — is statistically just as important as attacking quality. Elite defences win titles.',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'introduction-to-football' and cat.slug = 'football-fundamentals';

-- ── Sample Lessons — Understanding Formations ────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'What a Formation Number Actually Means',
  'what-a-formation-number-means',
  '## Reading the numbers

A formation like 4-3-3 is read back to front: 4 defenders, 3 midfielders, 3 forwards. The goalkeeper is never included in the count.

## The number is just a starting shape

Formations describe a team''s default defensive shape — where players stand when the opposition has the ball. In attack, those numbers shift dramatically.

## The same formation, different football

Two teams can both play 4-3-3 and produce completely different football. Personnel, instructions, and pressing triggers matter far more than the number itself.

## Why analysts focus on shape, not formation

Modern football analysis focuses on the "shape in possession" vs "shape out of possession" distinction. A team may defend in a 4-4-2 and attack in a 3-2-5. The number on the team sheet is just the starting point.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'understanding-formations' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The 4-3-3: Control and Width',
  'the-4-3-3-control-and-width',
  '## Why the 4-3-3 dominates elite football

The 4-3-3 offers natural width through wide forwards, central control through three midfielders, and defensive compactness through a flat back four.

## How it attacks

In possession, the wide forwards pin back opposition fullbacks. The central midfielder trio creates overloads in central areas. The striker holds the line and creates space for runners.

## How it defends

Out of possession, the wide forwards become the first line of press. The central three compress the middle. The back four holds a high or mid line depending on the manager''s preference.

## Teams that use it

Manchester City, Barcelona (historically), Liverpool, and Bayern Munich have all used variants of the 4-3-3 as their primary system. The details differ massively, but the skeleton is the same.',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'understanding-formations' and cat.slug = 'tactical-analysis';

-- ── Sample Lessons — Home Advantage ──────────────────────────
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Data Behind Home Advantage',
  'the-data-behind-home-advantage',
  '## What the numbers show

Across Europe''s top five leagues over the past 20 seasons, home teams win approximately 45–48% of matches. Away teams win around 27–30%. Draws account for the remainder.

## Why home teams win more

Several factors combine:

- Crowd noise creates psychological pressure on the away team and influences marginal referee decisions
- Travel fatigue and disrupted routines affect away players
- Familiarity with the pitch dimensions, surface, and conditions
- The "last action" advantage in set pieces near the home crowd

## Has it changed?

Yes. Home advantage declined significantly during the COVID-19 period when matches were played in empty stadiums — confirming that crowd effect is a real, measurable factor.

## What this means for analysis

Home advantage is a structural edge, not a random outcome. Any serious analytical framework must account for venue as a variable when evaluating team performance.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'home-advantage-unpacked' and cat.slug = 'match-dynamics';
