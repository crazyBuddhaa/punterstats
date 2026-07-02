-- ============================================================
-- PunterStat — Betting Academy Schema Extension & Seed Data
-- Adds section column to course_categories, then seeds BA content
-- ============================================================

-- ── Add section discriminator ────────────────────────────────
ALTER TABLE public.course_categories
  ADD COLUMN IF NOT EXISTS section text NOT NULL DEFAULT 'sports_university';

ALTER TABLE public.course_categories
  DROP CONSTRAINT IF EXISTS course_categories_section_check;

ALTER TABLE public.course_categories
  ADD CONSTRAINT course_categories_section_check
  CHECK (section IN ('sports_university', 'betting_academy'));

-- Existing rows already correct via DEFAULT 'sports_university'

-- ── Betting Academy Topics ───────────────────────────────────
INSERT INTO public.course_categories (name, slug, description, icon_name, sort_order, section) VALUES
  ('Odds & Markets',       'odds-and-markets',       'How betting odds work, what formats exist, and what they tell you about implied probability.',                'target',   1, 'betting_academy'),
  ('Probability & Value',  'probability-and-value',  'The maths behind finding bets where the price is better than the true probability — the foundation of edge.',  'chart',    2, 'betting_academy'),
  ('Bet Types',            'bet-types',              'Singles, doubles, accumulators, handicaps, over/unders — what each bet type means and how it works.',           'layers',   3, 'betting_academy'),
  ('Bankroll Management',  'bankroll-management',    'How to protect your capital, choose stake sizes, and apply staking strategies that survive variance.',          'shield',   4, 'betting_academy');

-- ── Modules — Odds & Markets ─────────────────────────────────
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Understanding Odds Formats', 'understanding-odds-formats',
  'Decimal, fractional, American — what each format means and how to convert between them instantly.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'odds-and-markets';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'How Bookmaker Margins Work', 'how-bookmaker-margins-work',
  'Why the odds always add up to more than 100% — and what that overround costs you on every bet.',
  'intermediate', true, 2
FROM public.course_categories WHERE slug = 'odds-and-markets';

-- ── Modules — Probability & Value ────────────────────────────
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Implied Probability Explained', 'implied-probability-explained',
  'How to convert any odds format into a probability — and why that number is the starting point for everything.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'probability-and-value';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Finding Value Bets', 'finding-value-bets',
  'What a value bet actually is, how to identify when a price is wrong, and why most bettors never look for it.',
  'intermediate', true, 2
FROM public.course_categories WHERE slug = 'probability-and-value';

-- ── Modules — Bet Types ──────────────────────────────────────
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Singles, Doubles & Accumulators', 'singles-doubles-accumulators',
  'The mechanics of combining bets — how parlay odds compound and why accumulators are higher risk.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'bet-types';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Handicap & Asian Handicap Betting', 'handicap-and-asian-handicap',
  'How handicap markets remove the draw and create a near-50/50 market — a favourite of sharp bettors.',
  'intermediate', true, 2
FROM public.course_categories WHERE slug = 'bet-types';

-- ── Modules — Bankroll Management ───────────────────────────
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Bankroll Fundamentals', 'bankroll-fundamentals',
  'What a bankroll is, how to set one, and why separating your betting funds is non-negotiable.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'bankroll-management';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Staking Strategies', 'staking-strategies',
  'Flat staking, percentage staking, and the Kelly criterion — how each affects your long-run results.',
  'advanced', true, 2
FROM public.course_categories WHERE slug = 'bankroll-management';

-- ── Sample Lessons — Understanding Odds Formats ─────────────
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Decimal Odds',
  'decimal-odds',
  '## What are decimal odds?

Decimal odds represent the total return per unit staked — including your stake back.

A price of 2.50 means: stake £10, receive £25 back (£15 profit + £10 stake).

## The formula

Return = Stake × Decimal Odds
Profit = Return − Stake

## Why most sharp bettors prefer decimal

Decimal odds make comparing two prices trivially easy. 2.10 vs 2.08 is an immediate visual comparison. Fractional odds (21/10 vs 26/12.5) obscure the same difference.

## Converting to probability

Implied Probability = 1 / Decimal Odds

At 2.50: 1 / 2.50 = 0.40 = 40%.

This is the most important conversion in all of sports betting. Memorise it.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Fractional Odds',
  'fractional-odds',
  '## What are fractional odds?

Fractional odds (e.g. 5/2, 7/4, 11/8) express profit relative to stake. The left number is profit; the right is stake.

## The formula

Profit = Stake × (Numerator / Denominator)

At 5/2 with a £10 stake: profit = £10 × (5/2) = £25. Total return = £35.

## The catch

Fractions like 11/4, 13/8, and 85/40 are deliberately awkward. Bookmakers have historically used them to slow down comparison shopping.

## Converting fractional to decimal

Decimal = (Numerator / Denominator) + 1

5/2 → (5/2) + 1 = 3.50 decimal',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'American (Moneyline) Odds',
  'american-moneyline-odds',
  '## What are moneyline odds?

American odds are expressed as positive or negative numbers relative to a £100 unit.

- Positive (e.g. +250): profit on a £100 stake. +250 returns £350 total.
- Negative (e.g. -150): stake required to profit £100. -150 means stake £150 to profit £100.

## Converting to decimal

Positive: Decimal = (Moneyline / 100) + 1
Example: +250 → (250/100) + 1 = 3.50

Negative: Decimal = (100 / |Moneyline|) + 1
Example: -150 → (100/150) + 1 = 1.667

## When you will encounter these

US sportsbooks and some international operators use moneyline format by default. If you use Pinnacle, Bet365, or DraftKings in the US, you will see these daily.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- ── Sample Lessons — Implied Probability ─────────────────────
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'From Odds to Probability',
  'from-odds-to-probability',
  '## The single most important formula

Implied Probability = 1 / Decimal Odds

This converts any bookmaker price into the probability they are implying for an outcome.

## A worked example

A match has these prices:
- Home win: 2.10 → 1/2.10 = 47.6%
- Draw: 3.40 → 1/3.40 = 29.4%
- Away win: 3.60 → 1/3.60 = 27.8%

Total: 104.8%

## The 4.8% above 100% is the margin

Bookmakers build profit into every market by pricing all outcomes above 100%. This excess is called the overround or vig.

## Why this matters

Every time you bet, you are paying this margin. Understanding it is the first step to understanding why most bettors lose money over time.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Overround Explained',
  'the-overround-explained',
  '## What is the overround?

The overround (also called the vig, juice, or margin) is the bookmaker''s built-in profit on any market.

## Calculating it

Sum the implied probabilities of all outcomes. The amount above 100% is the margin.

Example from the previous lesson: 47.6% + 29.4% + 27.8% = 104.8%. The overround is 4.8%.

## What that costs you

On a market with a 5% margin, even if you pick winners at exactly the true probability, you will lose 5% of your total turnover in the long run.

## Margin varies by market and bookmaker

- Match result (1X2): typically 4–8%
- Asian handicap: typically 2–4%
- Pinnacle (low-margin book): often 1.5–2.5%

Choosing which market to bet in is partly about choosing how much margin you are willing to pay.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- ── Sample Lessons — Bankroll Fundamentals ───────────────────
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'What is a Bankroll?',
  'what-is-a-bankroll',
  '## The definition

A bankroll is a dedicated, ring-fenced sum of money set aside exclusively for betting — money you can afford to lose entirely without affecting your daily life.

## Why separation matters

Mixing betting funds with living expenses creates psychological pressure that leads to poor decisions. Fear of losing rent money causes bettors to chase losses, reduce stake on winners, and abandon their strategy.

## Setting your starting bankroll

There is no universal correct size. The rules:

- It must be money you can afford to lose 100% of
- It must be large enough to survive a realistic losing run
- A common unit size is 1–2% of total bankroll per bet

## The concept of units

Professionals track performance in units rather than currency. One unit = a standard stake size. If your bankroll is £1,000 and you stake 1% per bet, one unit = £10.

Thinking in units removes emotional attachment to currency amounts.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';
