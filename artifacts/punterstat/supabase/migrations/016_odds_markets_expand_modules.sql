-- ============================================================
-- PunterStat — Betting Academy: Odds & Markets Expansion
-- Migration 016: Expand existing 2 modules to 10 lessons each
--   • "Understanding Odds Formats"  — add lessons 4–10
--   • "How Bookmaker Margins Work"  — add lessons 1–10
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Understanding Odds Formats                  ║
-- ║  Existing: 3 lessons (Decimal, Fractional, American)    ║
-- ║  Adding: lessons 4–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Lesson 4: Converting Between Formats (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Converting Between Odds Formats',
  'converting-between-odds-formats',
  '## Why Conversion Matters

Different bookmakers display odds in different formats. If you are comparing a Pinnacle price in decimal against a UK shop price in fractional, you cannot compare them without converting to a common format.

## The Master Conversion Table

| From | To Decimal | To Fractional | To American (+) | To American (−) |
|---|---|---|---|---|
| Decimal (d) | — | (d−1)/1 simplified | (d−1)×100 | −100/(d−1) |
| Fractional (n/d) | (n/d)+1 | — | n/d×100 | — |
| American (+m) | m/100+1 | m/100 simplified | — | — |
| American (−m) | 100/m+1 | 100/m simplified | — | — |

## The Quickest Route

Always convert everything to decimal first. It is the most arithmetic-friendly format for comparison and probability calculation.

## Practice Drill

Work through these until they become automatic:

- 5/2 fractional → decimal → American: (5/2)+1 = 3.50 → (+250)
- −200 American → decimal → fractional: (100/200)+1 = 1.50 → 1/2
- 1.80 decimal → fractional → American: (0.80/1) = 4/5 → (−125)

## The Single Formula to Memorise

**Implied Probability = 1 / Decimal Odds**

This one formula works regardless of starting format, as long as you convert to decimal first. Every other conversion flows from this.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 5: Reading Odds Boards Quickly (Beginner/Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Reading Odds Boards Quickly',
  'reading-odds-boards-quickly',
  '## The Skill of Price Recognition

Professional bettors read odds the way experienced drivers read road signs — instantly, without conscious calculation. This is a trained skill, not an innate ability.

## Calibrating Your Mental Model

Build reference anchors for common prices:

| Decimal | Fraction | Approx Probability | Mental Label |
|---|---|---|---|
| 1.50 | 1/2 | 67% | Strong favourite |
| 1.80 | 4/5 | 56% | Moderate favourite |
| 2.00 | Evens | 50% | Coin flip |
| 2.50 | 6/4 | 40% | Mild underdog |
| 3.00 | 2/1 | 33% | Underdog |
| 4.00 | 3/1 | 25% | Long shot |
| 6.00 | 5/1 | 17% | Outsider |

## The 10-Second Rule

When a price appears, you should be able to answer in under 10 seconds:
1. What is the implied probability?
2. Is this value for money given my assessment?
3. Compared to the next best price I know of, is this competitive?

## Scanning a Market

When you open a betting market, scan the prices in this order:
1. Identify the shortest price (the favourite)
2. Note the rough spread — how wide is the field?
3. Look for outliers — any price that seems substantially different from comparable bookmakers?

## Drills to Build Speed

Create a set of 50 flashcards with a price on one side and implied probability on the other. Run through them daily for two weeks. The goal is sub-2-second recall at every common price point.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 6: Odds in Different Sports (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Odds Across Different Sports',
  'odds-across-different-sports',
  '## Not All Sports Price the Same Way

The same bookmaker uses different default formats and different market structures depending on the sport. Understanding this prevents confusion and unlocks opportunities.

## Football (Soccer) — The 1X2 Model

Three-outcome markets (home/draw/away) are football''s default. The presence of the draw option compresses individual outcome probabilities. Typical home win prices range from 1.30 (heavy favourites) to 5.00+ (underdogs).

**Implication:** The draw is systematically underestimated by recreational bettors, making it an area of potential value in certain match contexts.

## Tennis & Basketball — Two-Outcome Markets

No draw possible. Prices cluster around the 1.50/2.50 axis more than football. Tighter margins on two-outcome markets make sharp pricing easier to identify.

## Horse Racing — The Starting Price Model

UK/Irish racing uses fractional odds by convention, often quoted as SP (Starting Price). The market evolves as money comes in — odds can shorten dramatically between open of market and race time. The difference between early price and SP is a key edge signal.

## American Sports — Spread and Total Markets

Moneyline (winner), point spread, and over/under totals each have distinct pricing conventions. Spread markets are designed to create near-50/50 propositions, so most spreads price around −110 on both sides (equivalent to ~52.4% implied probability each).

## Key Takeaway

Learn the standard price range and market structure for each sport you bet on. An outsider at 8.00 is normal in horse racing; the same price in tennis is extremely rare and demands extra scrutiny.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 7: Spread & Total Markets (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Spread & Totals: Reading Point-Based Odds',
  'spread-and-totals-odds',
  '## What Is a Point Spread?

A point spread levels the field by giving the underdog a virtual head start. Instead of betting on winner/loser, you bet on the margin of victory.

**Example:** Manchester City −1.5 vs Brentford +1.5 at 1.91 each.
- City must win by 2 or more goals for a City bet to win.
- Brentford bettors win if Brentford win, draw, or lose by exactly 1 goal.

## Why Spread Markets Exist

They are designed to create two roughly equal-probability outcomes, reducing the bookmaker''s pricing complexity. A near-50/50 market also encourages larger volume from recreational bettors who feel the choice is "fair."

## Totals (Over/Under)

A totals market prices whether the combined score (goals, points, games) will be above or below a set number.

**Football:** Over/Under 2.5 goals is the most common. In a match expected to be low-scoring, the Under 2.5 may be priced at 1.75 (57% implied) vs Over 2.5 at 2.10 (48% implied). The overround here is ~5%.

## Half-Points and "Push" Protection

Fractional spread numbers (−1.5, +2.5) eliminate the possibility of an exact tie (push) that would void the bet. Round-number spreads (−2, +2) allow pushes, which return the stake.

## Asian Handicap: The Spread Without the Push Problem

Asian handicap extends spread betting by using quarter-goal increments (−1.25, −1.75), splitting the stake between two adjacent lines. This combines push protection with more granular pricing — a key reason sharp football bettors prefer it.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 8: Exchange Odds vs Bookmaker Odds (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Exchange Odds vs Bookmaker Odds',
  'exchange-odds-vs-bookmaker-odds',
  '## Two Fundamentally Different Models

A traditional bookmaker sets a price and you either accept it or do not. A betting exchange (Betfair, Smarkets, Matchbook) connects bettors directly: one side backs an outcome, the other lays it.

## Why Exchange Odds Are Usually Better

Bookmakers build a margin into every price to guarantee their profit. Exchanges charge a commission on net winnings (typically 2–5%), but the base odds often reflect true market probability far more closely — because the market itself is set by bettors competing to offer the best price.

**Example:**
- Bookmaker: Arsenal to win at 2.10 (includes ~5% margin)
- Betfair exchange: Arsenal at 2.18 (commission 4.5% on profit only)

Net return from exchange at 2.18, after 4.5% commission on £1 profit = ~2.08 effective. Still better than bookmaker in this case, but not always.

## The Commission Calculation

Effective decimal odds on exchange = Commission-adjusted price:

Effective Price = 1 + (Decimal − 1) × (1 − Commission Rate)

At 2.20 with 5% commission: 1 + 1.20 × 0.95 = 2.14 effective

## When Bookmakers Win on Price

For very short-priced favourites (under 1.40), bookmaker margins are a smaller absolute impact. The exchange price advantage shrinks and commission can make the bookmaker competitive or superior.

## Lay Betting: The Unique Exchange Feature

Exchanges let you lay a selection — betting it will NOT win. You become the bookmaker, accepting someone else''s back bet. Lay betting unlocks trading strategies impossible with traditional bookmakers: backing at one price, laying at another to lock in profit regardless of outcome.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 9: Pricing Discrepancies Across Bookmakers (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Pricing Discrepancies Across Bookmakers',
  'pricing-discrepancies-across-bookmakers',
  '## Why Prices Differ

Bookmakers do not all price markets identically. Their lines derive from different models, different algorithms, and different customer bases. The result: the same outcome can be priced at 2.10 at one bookmaker and 2.30 at another.

## Line Shopping: The Systematic Approach

Line shopping means always checking multiple bookmakers before placing a bet to find the best available price. Over hundreds of bets, the difference between the best and second-best price is a significant component of total profitability.

**Practical example:** You bet 200 times per year at an average stake of £50. The average difference between best and second-best price is 0.05 decimal odds (roughly 2–3%). That difference is worth approximately £500 in extra profit per year — without changing a single betting selection.

## Where Discrepancies Are Largest

- **New markets:** Less liquid markets priced from fewer data points create wider spreads
- **Lower-profile sports/leagues:** Less competition between bookmakers means less price convergence
- **Injury or team news:** Books update prices at different speeds; the slow mover is briefly wrong
- **Opening lines:** Before sharp money corrects the line, initial prices can be generous or poor

## Tools for Systematic Line Shopping

Odds comparison sites (Oddschecker, Betbrain, OddsPortal) aggregate prices in real time. The habit: bookmark the comparison page for your market, check it before every bet, place with the highest price. This single habit separates disciplined bettors from casual ones.

## Gubbing Risk

Soft bookmakers (those offering bonuses and inflated prices to recreational customers) restrict accounts that consistently beat their lines. Strategic line shoppers manage which books they use for which bet sizes to extend the lifespan of each account.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';

-- Lesson 10: How Odds Are Set (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'How Bookmakers Set Their Odds',
  'how-bookmakers-set-odds',
  '## The Opening Line

Before any market is published, a bookmaker''s trading team produces an opening line — their initial estimate of the true probability of each outcome. This is derived from a combination of:

1. **Statistical models:** Historical data, team performance metrics, situational factors
2. **Comparable markets:** Where is Pinnacle (the industry''s sharpest reference) pricing similar contests?
3. **Compiler judgement:** Experienced traders apply qualitative adjustments for news, context, and market dynamics

## Margin Application

Once the true probabilities are estimated, the margin is applied. A bookmaker targeting 5% margin on a two-way market might set each side at 52.5% implied rather than the true 50%. Both sides sum to 105%.

## Dynamic Adjustment

After opening, lines move in response to:

- **Betting volume:** Large bets on one side shift the price to balance liability
- **Sharp money:** Known sharp accounts (consistent winners) cause immediate, significant line movement
- **Pinnacle and exchanges:** Soft bookmakers often use Pinnacle''s live price as a reference and shade from it

## The Closing Line as Truth

The closing line — the final price before an event starts — is widely considered the best prediction of true probability. It has absorbed the most information and been corrected by the most scrutiny. Beating the closing line consistently (taking better prices before they shorten) is the gold standard of sharp betting.

## Implications for Bettors

Understanding the pricing process helps you identify:
- Markets where compiler errors are more likely (lower-profile events)
- When to act early (before the market corrects) vs. late (when confirmation is more important)
- Which bookmakers to treat as price leaders vs. price followers',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'understanding-odds-formats' AND cat.slug = 'odds-and-markets';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — How Bookmaker Margins Work                  ║
-- ║  Existing: 0 lessons                                    ║
-- ║  Adding: lessons 1–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Lesson 1: What Is the Overround? (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'What Is the Overround?',
  'what-is-the-overround',
  '## The Hidden Tax on Every Bet

The overround (also called the vig, juice, or margin) is the bookmaker''s built-in profit mechanism. It works by pricing all possible outcomes above their true probability — so the sum of all implied probabilities in a market exceeds 100%.

## A Clear Example

Consider a coin flip. The true probability of heads is 50%, tails is 50%. Fair odds would be 2.00 each (50% implied each, total = 100%).

A bookmaker prices this market as:
- Heads: 1.91 (implied: 52.4%)
- Tails: 1.91 (implied: 52.4%)
- **Total: 104.8%**

The 4.8% above 100% is the overround. The bookmaker earns this 4.8% on average regardless of which side wins.

## Why It Makes Most Bettors Lose

Even if you pick winners at exactly the true probability, the overround guarantees you lose over time. At 5% overround, you will return approximately £0.95 for every £1.00 staked in the long run — a 5% loss on turnover.

## The Formula

Overround = (Sum of all implied probabilities) − 1

Or as a percentage: (Sum − 1) × 100

## Not All Markets Are Equal

Overround varies by:
- **Bookmaker:** Pinnacle averages ~2%; high-street bookmakers often 8–12%
- **Market type:** Main markets (match result) have lower margins than specials
- **Sport:** Horse racing accumulators can embed 15%+ effective margins

Understanding overround is not just academic — it directly dictates which markets and which bookmakers you should use.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 2: Calculating the Margin Step by Step (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Calculating the Margin Step by Step',
  'calculating-the-margin-step-by-step',
  '## Step 1: Collect All Prices

For a football match, three outcomes: Home (H), Draw (D), Away (A).

**Example prices:**
- Home: 2.10
- Draw: 3.40
- Away: 3.60

## Step 2: Convert Each to Implied Probability

Implied Probability = 1 / Decimal Odds

- Home: 1/2.10 = 0.4762 = 47.62%
- Draw: 1/3.40 = 0.2941 = 29.41%
- Away: 1/3.60 = 0.2778 = 27.78%

## Step 3: Sum the Probabilities

47.62 + 29.41 + 27.78 = **104.81%**

## Step 4: Interpret

The overround is 4.81%. For every £100 bet across all outcomes at equal proportion, the bookmaker earns approximately £4.81.

## Quick Mental Check

For a two-outcome market (tennis, basketball), a rough check:
- Both sides at 1.91: 52.4% + 52.4% = 104.8% → ~4.8% margin
- Both sides at 1.95: 51.3% + 51.3% = 102.6% → ~2.6% margin

## The Margin as a Per-Bet Cost

If you bet £50 on a market with a 5% margin, your mathematical expectation (assuming you have no edge) is:
- Expected return = £50 × (1 − 0.05) = £47.50
- Expected loss = £2.50 per £50 bet

Knowing this number for every market you bet in is the foundation of cost-aware betting.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 3: Why Margins Vary by Market (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Why Margins Vary by Market',
  'why-margins-vary-by-market',
  '## The Simple Reason: Liquidity and Competition

Bookmakers price markets based on how much information they have, how much volume they expect, and how much competition they face from other operators. More information + more competition = lower margin.

## High-Volume, Low-Margin Markets

- **Premier League 1X2:** Massive data, enormous competition between bookmakers, high volume. Margins: 4–6%
- **Champions League outright:** Well-understood market, sharp scrutiny, fierce price competition. Margins: 3–5%
- **Pinnacle-specific:** Often 1.5–2.5% across major football markets

## Low-Volume, High-Margin Markets

- **Lower league specials (first goalscorer, anytime scorer):** Less data, less scrutiny, higher margin to compensate for uncertainty. Margins: 10–20%+
- **Bet Builder/Same Game Multi:** Multiple margins compound. Each leg adds margin; the combined product can embed 20–40% effective margin
- **Exotics (correct score, both teams to score + winner combos):** Very high margins, difficult for bettors to estimate true probability

## The Compounding Effect in Accumulators

Each leg of a 5-fold accumulator multiplies the margins together. If each leg carries a 5% bookmaker margin, the accumulated margin is not 25% — it is roughly 1-(0.95^5) = 22.6%. For a 10-leg acca at 5% per leg: 1-(0.95^10) = ~40% effective margin. This is why accumulators are enormously profitable for bookmakers.

## Practical Implication

Before betting any market, ask: is this a high-margin special or a low-margin core market? If you do not know, avoid it until you do. Your long-run performance is partly determined by the markets you choose to participate in.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 4: True Odds vs Offered Price (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The True Odds vs the Offered Price',
  'true-odds-vs-offered-price',
  '## The Central Question in Betting

Every time you consider a bet, the only question that ultimately matters is: does the offered price reflect a higher probability than the true probability of the event?

If yes: positive expected value. If no: negative expected value.

## What Are "True Odds"?

True odds represent the actual probability of an event occurring. They do not exist as a published number — they are what you estimate through analysis. No one knows the true probability with certainty; the market''s best collective estimate approximates it over time.

## The Gap Is the Margin

The difference between true odds and offered odds is the bookmaker''s margin plus or minus any pricing error.

**Example:**
- Your model says Arsenal''s true probability of winning is 55% → fair price = 1.82
- Bookmaker offers: 1.72
- The gap: you are being offered less than fair value. The bookmaker''s margin is embedded here.

If the bookmaker offered 1.90, the gap reverses — you are receiving more than fair value (positive expected value).

## De-vigging: Estimating True Probability

One practical approach to estimate true probability is to remove the margin from a market''s prices. For a 1X2 market, scale each implied probability down proportionally:

True P(Home) = Raw P(Home) / Sum of all raw probabilities

Example: Raw probabilities sum to 104.8%.
- Raw P(Home) = 47.6% → True P(Home) = 47.6/1.048 = 45.4%

## The Value Threshold

You should only bet when your assessed true probability exceeds the bookmaker''s implied probability. The further above it, the stronger the bet — but you must also be honest about the quality of your assessment model.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 5: Comparing Margins Across Bookmakers (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Comparing Margins Across Bookmakers',
  'comparing-margins-across-bookmakers',
  '## The Spectrum: From Sharp to Soft

Bookmakers fall on a spectrum from "sharp" (low margin, sharp clientele, tolerant of winners) to "soft" (high margin, recreational focus, quick to restrict winning accounts).

## Typical Margin Profiles

| Bookmaker Type | Avg Margin (1X2 Football) | Winner Tolerance |
|---|---|---|
| Pinnacle | 1.5–2.5% | High — sharp book model |
| Asian books (SBO, SBOBET) | 2–3% | High |
| Bet365 | 4–6% | Moderate initially |
| Ladbrokes/Coral | 6–9% | Low — restrict quickly |
| William Hill (UK retail) | 8–12% | Low |

## How to Measure a Book''s Margin Yourself

Pick 20 markets you are not betting on (to avoid bias). For each, calculate the overround as in Lesson 2. Average the results. Do this once per bookmaker every few months — margins change with competition.

## The Strategic Implication

For a bettor with genuine edge, the bookmaker''s margin is a tax you pay on every bet. You want to pay the lowest possible tax. This means:

1. Use Pinnacle or exchanges as your primary sharp book
2. Use soft books selectively for enhanced prices or promotions before they restrict your account
3. Never use a high-margin book as your default unless you have a specific structural reason to

## A Note on "Best Odds Guaranteed"

Some UK bookmakers offer BOG (Best Odds Guaranteed) on horse racing — if SP is higher than the price you took, you are paid at SP. This promotion effectively reduces the margin you pay. Where available, it is a genuine edge in your favour.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 6: Impact of Margin on Long-Run ROI (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'How Margin Destroys Long-Run ROI',
  'margin-and-long-run-roi',
  '## The Mathematics of Attrition

The overround is not a single loss — it is a continuous tax applied to every bet, compounding over time.

## A Worked Example

Bettor A bets 500 times per year, £100 per bet, on markets averaging 6% margin.
- Total staked: £50,000
- Expected return at random: £50,000 × (1 − 0.06) = £47,000
- Expected loss: £3,000 per year — without any skill whatsoever

Bettor B uses the same selections but only on Pinnacle at 2% margin:
- Expected loss at random: £50,000 × 0.02 = £1,000 per year

**The difference in edge required to break even:**
- Bettor A needs 6% edge above random to break even
- Bettor B needs only 2% edge above random to break even

## ROI Threshold Calculation

Minimum edge needed to break even = Margin (as a decimal)

At 5% margin: you need ROI of at least 5% on selections to survive. At 2% margin: only 2%.

## The Compounding Argument for Low-Margin Books

Over 5 years at 500 bets/year and £100/bet:
- At 6% margin with zero skill: total expected losses ≈ £15,000
- At 2% margin with zero skill: total expected losses ≈ £5,000

For a skilled bettor with 3% genuine edge, Bettor A still loses money; Bettor B profits.

## The Clear Lesson

Margin selection is not a minor detail. For bettors with modest edges, it is the difference between profit and loss. Choosing where to bet is as important as choosing what to bet on.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 7: De-Vigging: Finding the Fair Odds (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'De-Vigging: Deriving Fair Odds from a Market',
  'de-vigging-fair-odds',
  '## What De-Vigging Does

De-vigging (also called de-juicing or removing the vig) extracts the bookmaker''s best estimate of true probability from their offered prices. It answers: "What does this bookmaker actually think the probability is, before they applied their margin?"

## Method 1: Proportional De-Vig

The simplest approach. Divide each outcome''s raw implied probability by the sum of all implied probabilities.

**Example (1X2 market):**
- Home: 2.10 → 47.62%
- Draw: 3.40 → 29.41%
- Away: 3.60 → 27.78%
- Sum: 104.81%

**De-vigged probabilities:**
- Home: 47.62 / 104.81 = 45.43%
- Draw: 29.41 / 104.81 = 28.06%
- Away: 27.78 / 104.81 = 26.51%
- **Sum: 100.00%** ✓

**De-vigged fair odds:**
- Home: 1/0.4543 = 2.201
- Draw: 1/0.2806 = 3.563
- Away: 1/0.2651 = 3.772

## Method 2: Power (Shin) De-Vig

More sophisticated. Assumes the bookmaker applies margin non-uniformly — more on outsiders than favourites. The Shin method iteratively solves for a power parameter z such that adjusted probabilities sum to 1. Used by serious quantitative analysts.

## When De-Vigging Is Most Useful

1. **As a reference point:** What does the market think? Compare to your own probability estimate.
2. **Cross-market comparison:** Convert two markets (home/away; over/under) to de-vigged probabilities to check for internal consistency.
3. **Building a no-vig closing line:** The benchmark against which your taken prices are measured.

## Limitations

De-vigging assumes the bookmaker''s margin is applied to an accurate underlying probability. If the line is wrong (mispriced), de-vigging amplifies that error. The result is still the bookmaker''s view, not necessarily the true probability.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 8: Sharp Books vs Soft Books — Margin Profiles (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Sharp Books vs Soft Books: Margin Profiles in Practice',
  'sharp-vs-soft-margin-profiles',
  '## The Two-Tier Market

The global sports betting market is broadly split into two tiers: sharp (professional-grade) and soft (recreational-grade) bookmakers. Each has a distinct margin structure, risk tolerance, and account policy.

## Sharp Books: Characteristics

- **Low margin:** 1.5–3% across major markets
- **High limits:** Accept large stakes without moving the line materially
- **Winner-tolerant:** Profit from volume, not from restricting winning accounts
- **Line-setting role:** Sharp books (primarily Pinnacle) are used as a reference by most other operators

## Soft Books: Characteristics

- **Higher margin:** 5–12% on standard markets, 15%+ on exotics
- **Lower limits:** Cap bet sizes on winning accounts quickly
- **Restriction-prone:** Accounts showing consistent profitability are limited or closed
- **Price-follower role:** Often shade from Pinnacle''s line rather than setting their own

## Why Sharp Lines Matter for Everyone

Even bettors who never use Pinnacle benefit from understanding their lines. Pinnacle''s price is the closest public approximation of the true market probability. If a soft book deviates significantly from Pinnacle''s line, one of them is wrong — and that discrepancy is a potential edge.

## The Exploitation Window

Soft books publish lines before sharp books have corrected them. The window between opening (when soft books are often off) and closing (when the line is sharpest) is where early sharp movers extract value. By the time a Pinnacle-referenced soft book adjusts, the edge is gone.

## Account Strategy Implications

A sustainable betting operation typically uses:
1. Sharp/exchange books as primary for best prices and sustainability
2. Soft books tactically — for promotions, enhanced odds, or bonus plays — while managing account health carefully',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 9: Margin-Aware Market Selection (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Margin-Aware Market Selection',
  'margin-aware-market-selection',
  '## Selecting Markets Like a Business Decision

Every market you bet in is a cost centre. The margin is your cost of access. A sharp bettor treats market selection the same way a business treats supplier selection — minimise cost, maximise value.

## The Margin Hierarchy for a Typical Bettor

Rank markets from lowest to highest effective margin and restrict yourself to the lowest tiers:

**Tier 1 (< 3%):** Major football Asian handicap via exchange or Pinnacle; NBA spread via Pinnacle; ATP/WTA main match winner via sharp books

**Tier 2 (3–6%):** Major league 1X2 via mid-margin books; Grand Slam tennis; top horse racing win markets with BOG

**Tier 3 (> 6%):** Lower league football; correct score; both teams to score; anytime scorer; accumulators of any kind

**Tier 4 (avoid unless specific edge):** Bet Builders, same-game multis, prop bets from soft books

## The Compounding Selection Rule

For a bettor with a 3% edge, operating in Tier 1 markets leaves 0% net expected loss to overcome. In Tier 2 at 5% margin, the bettor still loses if they cannot demonstrate better than 5% edge in that tier.

## Measuring Your Own Edge by Market Tier

Maintain separate performance records by market tier. After 300+ bets per tier, calculate ROI. If Tier 2 shows negative ROI but Tier 1 shows positive ROI, the data tells you where to concentrate.

## Liquidity Constraints

Not every bettor can access Tier 1 unlimited. Exchange liquidity at high stakes is finite. Pinnacle limits vary. Part of professional betting is finding the highest-tier market where your desired stake size is accessible.

## The Expert Insight

The best bettors compete in markets where their edge exceeds the margin by the widest sustainable gap — not the markets where their selections feel most confident. Confidence without margin awareness is expensive.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';

-- Lesson 10: Using Margin to Identify Value Opportunities (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Using Margin Analysis to Hunt Value',
  'using-margin-to-hunt-value',
  '## Margin Differentials as a Value Signal

When two bookmakers price the same outcome substantially differently, at least one of them is wrong. Finding and exploiting these differentials is one of the oldest edges in sports betting.

## Systematic Differential Scanning

The workflow:
1. Record the Pinnacle price (or exchange price) on your selection — the sharp market reference
2. Record the soft book price on the same selection
3. Calculate the differential as a % of the sharp price:

Differential % = (Soft Price − Sharp Price) / (Sharp Price − 1) × 100

If positive and above your threshold (typically 3–5%), the soft book is offering better-than-sharp value on this selection.

## Why This Works Intermittently

Soft books copy Pinnacle''s lines, but not instantly. A line update at Pinnacle takes 5–60 minutes to propagate to soft books. Events that cause rapid line movement (injury news, market steaming) create short windows where soft book prices remain generous.

## Setting Up Alerts

For markets you follow, set price alerts at your soft books. When an outcome''s price crosses a threshold relative to the expected closing line, investigate immediately. Not every alert is actionable — many price divergences exist for good reasons — but systematic checking finds real opportunities.

## The Closing Line Value Framework

The gold standard test: compare the price you took against the closing Pinnacle price (de-vigged) at kick-off. If you consistently beat the closing line, you are extracting value — regardless of short-term results. This is why Closing Line Value (CLV) is the professional bettor''s primary metric, more reliable than profit/loss at small sample sizes.

## Practical Disciplines

- Never act on a differential without checking for an obvious reason (team news, suspension, weather)
- Track every "margin differential" bet separately to measure whether your differential threshold is correctly calibrated
- Accept that some soft books will close or limit your account as a direct consequence of this strategy — build a pipeline of accounts ahead of need',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-bookmaker-margins-work' AND cat.slug = 'odds-and-markets';
