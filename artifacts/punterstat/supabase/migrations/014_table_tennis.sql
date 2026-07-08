-- ============================================================
-- PunterStat — Table Tennis Sports University Content
-- Stage 30: Table Tennis categories, courses, and sample lessons
-- Run after 013_tennis.sql
-- ============================================================

insert into public.course_categories (name, slug, description, icon_name, sort_order, section) values
  ('Table Tennis Fundamentals', 'table-tennis-fundamentals', 'Rules, equipment, serving regulations, and the basic structure of table tennis — the starting point for understanding the sport.',      'target',   30, 'sports_university'),
  ('Table Tennis Technique',    'table-tennis-technique',    'The strokes, spins, footwork patterns, and technical building blocks that separate recreational players from competitive ones.',          'zap',      31, 'sports_university'),
  ('Table Tennis Competition',  'table-tennis-competition',  'How professional table tennis is structured — ITTF World Rankings, World Championships, World Table Tennis tours, and Olympic formats.', 'trophy',   32, 'sports_university');

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Rules and Scoring in Table Tennis', 'table-tennis-rules-scoring',
  'How points are scored, service rules, the let system, and match formats from recreational to Olympic level.',
  'beginner', true, 1
from public.course_categories where slug = 'table-tennis-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Equipment: Table, Ball, and Rubber', 'table-tennis-equipment',
  'How the table, ball, and rubber characteristics affect speed, spin, and playing style — and why equipment choices matter competitively.',
  'beginner', true, 2
from public.course_categories where slug = 'table-tennis-fundamentals';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Understanding Spin', 'table-tennis-spin',
  'Topspin, backspin, sidespin — how spin is generated, how it affects ball trajectory, and how to read and respond to it.',
  'intermediate', true, 1
from public.course_categories where slug = 'table-tennis-technique';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'The Core Strokes', 'table-tennis-core-strokes',
  'The forehand drive, backhand loop, push, flick, and block — the fundamental stroke repertoire of competitive table tennis.',
  'intermediate', true, 2
from public.course_categories where slug = 'table-tennis-technique';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'How Professional Table Tennis Is Structured', 'table-tennis-pro-structure',
  'The ITTF, World Table Tennis (WTT) circuit, World Championships, and how ranking points and qualification work at elite level.',
  'beginner', true, 1
from public.course_categories where slug = 'table-tennis-competition';

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'Playing Styles at the Elite Level', 'table-tennis-elite-styles',
  'Attackers, defenders, all-round players — how different strategies play out at the professional level.',
  'intermediate', true, 2
from public.course_categories where slug = 'table-tennis-competition';

-- Lessons — Rules and Scoring
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Scoring: First to 11, Win by 2', 'table-tennis-scoring',
  '## The basic scoring structure

A game of table tennis is won by the first player to reach 11 points — but they must lead by at least 2 points. If the score reaches 10-10 (deuce), play continues until one player leads by 2 clear points.

## Match formats

Competitive matches are typically best of 5 or best of 7 games. Olympic and World Championship events use best of 7 for singles.

## Service rotation

Each player serves 2 points consecutively, then service switches. At deuce (10-10), service alternates after every single point.

## Why 11 points changed the sport

Table tennis switched from 21-point games to 11-point games in 2001. The change was driven by television — shorter games create more decisive moments. From an analytical perspective, 11-point games increase variance: a single bad stretch of 3-4 points can cost an entire game.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-rules-scoring' and cat.slug = 'table-tennis-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Service Rules: The Most Regulated Shot in Sport', 'table-tennis-service-rules',
  '## Why service rules are so strict

Table tennis service rules are among the most detailed regulations in any sport. The serve is the only shot entirely under the server''s control — and spin can be generated deceptively.

## The legal service: key requirements

1. The ball must rest freely on the open palm before the toss
2. The toss must rise at least 16 cm vertically
3. The ball must be visible above the table height throughout the service motion
4. The free arm and hand must remain above table level during the serve
5. The serve must bounce once on the server''s side, clear the net, and bounce once on the receiver''s side

## Analytical insight

The quality and variety of service is one of the most decisive factors in competitive matches. Players who can generate multiple spin variations from the same service motion create systematic advantages — particularly in short-format 11-point games where a single service ace can swing a game.',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-rules-scoring' and cat.slug = 'table-tennis-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Doubles: How Team Table Tennis Works', 'table-tennis-doubles',
  '## The core rule that defines doubles

In doubles table tennis, players must alternate hitting the ball. Partner A hits, then Partner B must hit the next ball, then Partner A again — in strict alternation.

## Serving in doubles

Service must be diagonal — right half to right half. After every 2 points, service rotates to the next player.

## Why footwork becomes critical

Because players must alternate shots, both players are always in motion. After hitting, you must move out of your partner''s way immediately. In high-speed rallies, this requires choreographed footwork patterns.

## Olympic and team competition formats

At the Olympics, doubles was replaced by team events in 2008. Teams of 3 compete in a format where matches consist of up to 5 singles rubbers. The team format changes preparation — players must consider which matchups favour their team''s overall composition.',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-rules-scoring' and cat.slug = 'table-tennis-fundamentals';

-- Lessons — Equipment
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The Rubber: How Equipment Defines Playing Style', 'table-tennis-rubber',
  '## What is the rubber?

A table tennis bat consists of a wooden blade covered on one or both sides by rubber sheets. The rubber is the primary determinant of how the ball behaves.

## The two main rubber types

**Inverted (smooth) rubber:** The pimples face inward, creating a smooth outer surface. It generates heavy topspin and is used by the vast majority of professional attackers.

**Pimpled (pimples-out) rubber:** The pimples face outward. It partially reverses or neutralises spin rather than amplifying it — extremely disruptive against topspin-heavy attackers.

## Red and black sides

ITTF regulations require competitive bats to have one red side and one black side, allowing opponents to identify which rubber is used for each shot.

## Why equipment choices are analytically significant

When a player switches rubber, it can affect their performance profile measurably. Understanding equipment choices helps explain performance variation that would otherwise appear random.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-equipment' and cat.slug = 'table-tennis-fundamentals';

-- Lessons — Understanding Spin
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Topspin, Backspin, and Sidespin Explained', 'table-tennis-spin-types',
  '## Why spin is everything in table tennis

Table tennis is the fastest racket sport in the world — professional rallies involve ball speeds exceeding 100 km/h and spin rates above 9,000 RPM. Spin is the fundamental language of the sport.

## Topspin

Generated by brushing the bat upward and forward over the top of the ball. Causes the ball to dip downward faster, enabling hard shots that still land on the table. On contact with the opponent''s bat, topspin kicks upward and accelerates.

**Typical use:** offensive loops and drives.

## Backspin

Generated by brushing the bat downward and forward under the ball. Causes the ball to float and feel heavy on the receiver''s bat. If not adjusted for, the ball will go into the net.

**Typical use:** pushes, defensive chops, service variations.

## Sidespin

Generated by brushing across the side of the ball. Causes the ball to curve sideways in the air and kick unpredictably on contact.

**Typical use:** predominantly in serves.

## Reading spin: the key skill

Experienced players read spin from the server''s bat angle and contact motion. The angle at contact tells you spin direction; the speed of the brushing motion tells you spin intensity.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-spin' and cat.slug = 'table-tennis-technique';

-- Lessons — Core Strokes
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The Topspin Loop: The Foundation of Modern Attack', 'table-tennis-topspin-loop',
  '## What is the topspin loop?

The topspin loop is the dominant attacking stroke in modern table tennis. It involves brushing the bat rapidly upward and forward over the ball to generate heavy topspin.

## Forehand loop vs. backhand loop

**Forehand loop:** Struck on the right side of the body, typically with more power. Usually the primary attacking weapon.

**Backhand loop:** More compact motion. The modern backhand loop has become so powerful that many elite players use it as their primary weapon — particularly for balls coming to the middle.

## Opening the rally: looping against backspin

The most technically demanding situation is looping against a heavy backspin ball. The player must adjust the bat angle significantly and increase brushing speed to lift the ball over the net.

This stroke — opening against backspin — is the defining technical skill that separates competitive players from recreational ones.

## Why it matters analytically

A player''s ability to consistently open with a loop against varied service spins is the single greatest technical differentiator in table tennis. Players who are passive in the opening phase are structurally disadvantaged at elite level.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-core-strokes' and cat.slug = 'table-tennis-technique';

-- Lessons — Pro Structure
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'The ITTF and World Table Tennis Tour', 'table-tennis-ittf-wtt',
  '## The governing body: ITTF

The International Table Tennis Federation (ITTF) is the global governing body for table tennis, overseeing 226 national associations. It sets rules, regulates equipment, and sanctions international competitions.

## World Table Tennis (WTT)

In 2021, the ITTF launched World Table Tennis (WTT) as the commercial arm of the professional circuit:

- **WTT Grand Smash** — highest-tier events; maximum ranking points
- **WTT Champions** — second tier; strong fields, significant prize money
- **WTT Contender** — third tier; development-focused
- **WTT Youth Contender** — junior development circuit

## World Championships

Held annually (team event in even years, singles/doubles in odd years). The most prestigious title outside the Olympics.

## Olympic table tennis

Table tennis has been an Olympic sport since Seoul 1988. Current format: men''s singles, women''s singles, men''s team, women''s team.

## The East Asian dominance factor

China has dominated world table tennis for decades. South Korea, Japan, and Germany are the principal challengers. This concentration of talent makes head-to-head records and recent form especially important for predicting outcomes.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-pro-structure' and cat.slug = 'table-tennis-competition';

-- Lessons — Elite Playing Styles
insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id, 'Attackers, Defenders, and All-Round Players', 'table-tennis-elite-archetypes',
  '## The Attacker

Attackers win points through aggressive topspin loops, power drives, and fast-paced exchanges. They prioritise ending rallies quickly.

**Sub-types:**
- **Forehand dominant** — base their game around powerful forehand loops
- **Balanced attackers** — equally dangerous with forehand and backhand; the modern default at elite level

**Strengths:** proactive, puts opponents under constant time pressure
**Weaknesses:** higher error rate, susceptible to change of pace

## The Defender

Defenders absorb and redirect attacks through consistency and variation. True defenders are rare at elite level but extremely difficult to beat.

**Characteristic strokes:** the chop (heavy backspin return from away from the table) and the block.

**Strengths:** creates frustration, punishes over-aggressive opponents
**Weaknesses:** entirely reactive; must convert rare attacking opportunities

## The All-Round Player

Combines solid attacking ability with strong defensive skills. Adapts game plan to the opponent rather than imposing a fixed style.

**Strengths:** hardest to prepare for, can shift game plans mid-match
**Weaknesses:** rarely dominant in any single phase compared to specialists

## Analytical application

Style matchups in table tennis are among the most predictive factors in competition analysis. A defender against a power attacker creates completely different probability dynamics than two balanced attackers. Understanding style before analysing statistics provides context that raw numbers alone cannot.',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'table-tennis-elite-styles' and cat.slug = 'table-tennis-competition';
