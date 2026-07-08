-- ============================================================
-- PunterStat — Betting Academy: Additional Topics
-- Migration 015: Betting Psychology, Statistical Thinking,
--               Market Dynamics, Staking Strategies
-- Run in Supabase SQL editor after migration 014.
-- ============================================================

-- ── New Topics ────────────────────────────────────────────────

INSERT INTO public.course_categories (name, slug, description, icon_name, sort_order, section) VALUES
  ('Betting Psychology',    'betting-psychology',    'The mental side of betting — cognitive biases, emotional traps, and the discipline separating consistent analysts from impulsive gamblers.',  'activity', 5, 'betting_academy'),
  ('Statistical Thinking',  'statistical-thinking',  'How to read data properly — sample size, variance, regression to the mean, and the statistics traps that fool most bettors.',               'chart',    6, 'betting_academy'),
  ('Market Dynamics',       'market-dynamics',        'How betting markets move, why odds shift, and what line movement reveals about where the smart money is going.',                            'globe',    7, 'betting_academy'),
  ('Staking Strategies',    'staking-strategies',     'From flat stakes to the Kelly Criterion — how to size bets in a way that maximises growth while managing the risk of ruin.',               'shield',   8, 'betting_academy');


-- ============================================================
-- BETTING PSYCHOLOGY
-- ============================================================

-- Module 1: Cognitive Biases
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Cognitive Biases in Betting', 'cognitive-biases-in-betting',
  'The mental shortcuts that make us human also make us predictably wrong. Learn the biases that cost bettors the most money.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'betting-psychology';

-- Module 2: Discipline & Record Keeping
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Discipline & Record Keeping', 'discipline-and-record-keeping',
  'Why meticulous records are the single most effective tool a bettor has — and how to build the discipline to keep them.',
  'intermediate', true, 2
FROM public.course_categories WHERE slug = 'betting-psychology';

-- Lessons — Cognitive Biases in Betting
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Gambler''s Fallacy & Recency Bias',
  'gamblers-fallacy-and-recency-bias',
  '## The Gambler''s Fallacy

The gambler''s fallacy is the belief that past random events influence future ones. A coin lands heads five times in a row — many people feel tails is "due". It is not. Each flip is independent. The coin has no memory.

In betting, this manifests when a team has lost four games straight and you feel a win is "overdue". If the losses were random variance around a true probability, the next result is independent of the previous four.

## Recency Bias

Recency bias is the opposite error: overweighting the most recent events. A team wins three in a row and suddenly feels unbeatable. A striker scores in two consecutive matches and bettors pile onto the anytime scorer market at shrinking odds.

Markets price in recency bias. When the crowd overreacts to a short run of results, prices on the "hot" side compress — meaning you are getting worse value for following the trend.

## Why Both Biases Are So Persistent

They are not signs of stupidity. They are features of human pattern recognition. Our brains evolved to detect sequences because patterns in nature are usually meaningful. In a random process, this instinct backfires.

## The Discipline to Counter Them

Before acting on a streak — positive or negative — ask: what is the sample size, and is this result consistent with known probability? A team that wins three out of ten games losing four in a row is not a crisis. It is within normal variance.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Confirmation Bias & Loss Aversion',
  'confirmation-bias-and-loss-aversion',
  '## Confirmation Bias

Confirmation bias is the tendency to search for, interpret, and remember information in a way that confirms what you already believe.

If you think a team will win, you subconsciously discount evidence to the contrary and amplify evidence in your favour. You read the team news focusing on the good (key striker fit) and minimise the bad (three key defenders out).

**In practice:** After placing a bet, bettors often stop evaluating impartially. The analysis ends the moment the bet is placed. The discipline is to continue questioning your position right up to kick-off.

## Loss Aversion

Daniel Kahneman''s research showed that the pain of a loss is roughly twice as powerful as the pleasure of an equivalent gain. Losing £50 hurts about as much as gaining £100 feels good.

This has direct betting consequences:

- **Chasing losses:** After a bad run, bettors increase stakes to recoup faster — compressing the time horizon and increasing risk of ruin.
- **Cutting winners short:** Bettors cash out winning bets early to lock in profit, even when the expected value of holding is higher.
- **Avoiding correct bets:** Bettors refuse to back a team they previously lost on, even when the price is genuinely good.

## The Antidote

Think in expected value, not outcomes. A bet with positive EV is correct regardless of whether it wins. A bet with negative EV is wrong regardless of whether it wins. Detach from individual results — track performance over hundreds of bets, not tens.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

-- Lessons — Discipline & Record Keeping
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Why Records Change Everything',
  'why-records-change-everything',
  '## The Problem with Memory

Human memory is reconstructive, not reproductive. We do not play back the past — we rebuild it, and we rebuild it to flatter ourselves. Bettors consistently remember their winners more vividly than their losers. Without written records, your subjective sense of your own performance is almost certainly wrong.

## What to Record

For every bet, record:

- Date and time
- Event and market
- Selection
- Odds taken
- Stake (in units)
- Bookmaker
- Result (win/loss)
- Profit/loss (in units)
- Brief reasoning note (2–3 sentences)

The reasoning note is the most valuable part. It lets you review not just what happened, but why you thought it would happen.

## What Records Reveal

After 200+ bets, patterns emerge that memory never could:

- Which markets you perform best in
- Which sports you should stop betting on
- Whether you perform better on certain days or with certain bet types
- Whether your edge is shrinking as markets sharpen

## Tracking Return on Investment

Track ROI (profit ÷ total staked × 100) not just profit. A £200 profit on £10,000 staked (2% ROI) is far less impressive than £200 profit on £1,000 staked (20% ROI). Absolute profit numbers hide the efficiency of your capital.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Tilt, Chasing & Knowing When to Stop',
  'tilt-chasing-and-knowing-when-to-stop',
  '## What is Tilt?

The term comes from poker: a player on "tilt" has let emotion override decision-making. In betting, tilt typically follows a losing run. The emotional response — frustration, urgency, the need to recoup — takes over from the analytical one.

## Signs You Are on Tilt

- Placing bets you would not normally place to "get back to even"
- Increasing stake sizes after losses without a strategy-based reason
- Betting on markets you do not normally bet
- Placing bets very quickly without your usual research process
- Feeling that you "deserve" a winner after a run of losses

## The Mechanics of a Downswing

Even a genuinely profitable bettor with a 5% edge will experience losing runs of 10, 15, or 20 bets. This is not a malfunction — it is the nature of probability. The bettor who survives a downswing intact is the one who has planned for it in advance.

## Pre-Commitment Rules

The most effective protection is pre-commitment: rules you set when you are calm that govern your behaviour when you are not.

Common examples:
- "If I lose more than X units in a week, I stop betting for the rest of the week"
- "I never increase my standard stake by more than 20% in response to a losing run"
- "I review my last 20 bets before placing any bet after 5 consecutive losses"

Write your rules down. The point is that future-you, under emotional pressure, cannot override the rule without explicitly acknowledging they are doing so.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';


-- ============================================================
-- STATISTICAL THINKING
-- ============================================================

-- Module 1: Sample Size & Variance
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Sample Size & Variance', 'sample-size-and-variance',
  'Why short-term results are almost meaningless, and how many bets you actually need before drawing any conclusions.',
  'intermediate', true, 1
FROM public.course_categories WHERE slug = 'statistical-thinking';

-- Module 2: Regression to the Mean
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Regression to the Mean', 'regression-to-the-mean',
  'Why extreme performances tend to be followed by more ordinary ones — and how to profit from bettors who do not understand this.',
  'intermediate', true, 2
FROM public.course_categories WHERE slug = 'statistical-thinking';

-- Lessons — Sample Size & Variance
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'How Many Bets Does It Take to Know Anything?',
  'how-many-bets-to-know-anything',
  '## The Core Problem

Suppose you place 20 bets and show a profit. Are you skilled, or did you run well? The honest answer at 20 bets is: you cannot tell.

This is not pessimism. It is mathematics. At small sample sizes, variance (luck) swamps skill. The signal is drowned in noise.

## What Variance Actually Means

Variance is the natural spread of outcomes around the expected value. Even a coin weighted to land heads 55% of the time will land tails in long streaks. If you bet on it 20 times, tails can easily dominate by chance.

Betting on football, where single-game outcomes are highly random, variance is enormous. Even a 10% edge on a market does not guarantee profit over 50 bets. It starts to show reliably around 500–1,000 bets in most markets.

## The Rough Numbers

At 5% ROI, with average odds of 2.0:

- At 50 bets: results are essentially noise
- At 200 bets: a weak pattern starts to be detectable
- At 500 bets: you can begin to have modest confidence in a genuine edge
- At 1,000+ bets: statistical significance becomes achievable

## Implications for Evaluation

Never evaluate a betting strategy on fewer than a few hundred bets. Never abandon a strategy during a normal variance downswing. Never conclude a strategy is working based on a short winning run. The uncomfortable truth is that most bettors never place enough bets in a consistent enough system to ever know whether they have an edge.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Standard Deviation & What a Downswing Looks Like',
  'standard-deviation-and-downswings',
  '## Standard Deviation in Betting

Standard deviation (SD) measures the spread of results around the average. In betting, it tells you how wild the swings will be.

For a flat-staking bettor at odds of 2.0 (evens), the SD per bet is approximately 1 unit. Over 100 bets, the SD of total profit is approximately √100 = 10 units. This means a one-standard-deviation downswing at breakeven means being 10 units down over 100 bets — through pure luck.

## What a Realistic Losing Run Looks Like

A bettor with a genuine 5% edge, betting at average odds of 2.0:

- Expected profit over 100 bets at 1 unit/bet: +5 units
- Standard deviation: ≈ 10 units
- One SD below expectation: –5 units (a 5-unit loss despite a real edge)
- Two SDs below: –15 units

Losing runs of 15–20 consecutive bets can happen even with a genuine edge. This is not a reason to panic — it is a reason to have planned for it.

## Using This Knowledge

Before starting any system, calculate the expected drawdown range. If your bankroll cannot withstand a 2 SD downswing without going broke, your stakes are too high. Most professionals plan for a 3 SD downswing to be safe.

This calculation is the foundation of bankroll management — it connects the variance of your strategy to the stake sizes that keep you in the game.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

-- Lessons — Regression to the Mean
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Why Hot Streaks and Cold Streaks End',
  'why-hot-and-cold-streaks-end',
  '## What Regression to the Mean Is

Regression to the mean is the statistical tendency for extreme measurements to be followed by more moderate ones on subsequent measurement. It was first described by Francis Galton in the 19th century: the children of very tall parents tend to be tall, but not as tall as their parents.

In sport, it appears everywhere. The team that concedes five goals in one match is unlikely to concede five in the next. The striker who scores in seven consecutive matches is unlikely to maintain that rate indefinitely. Extreme performances contain an element of luck, and luck does not persist.

## The Betting Opportunity

Markets often fail to discount regression correctly. After a team scores eight goals in one game, the over market in their next game is overpriced — the crowd overweights what just happened. After a goalkeeper makes a sequence of error-strewn performances, their team''s odds shorten more than the true probability warrants.

The value lies in fading (opposing) the extreme. Not always — sometimes the extreme reflects a genuine step change in quality. But systematically, markets overreact to the exceptional.

## How to Apply It

Ask: is this extreme result more likely to represent a genuine permanent shift, or a temporary spike? Indicators that it was temporary:

- The extreme result was against unusual opposition quality
- The underlying performance metrics (expected goals, possession) were more moderate
- The key performer who drove the extreme is known to have high variance output',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Avoiding the Statistics Traps',
  'avoiding-statistics-traps',
  '## Cherry-Picking (Data Dredging)

If you look at enough statistics, you will always find one that supports any claim. "This team wins 80% of home games on Tuesdays in February when it has rained in the previous week" — technically accurate, statistically meaningless.

Data dredging produces patterns that are entirely due to chance. The safeguard: form your hypothesis first, then check the data. Do not browse data looking for patterns and then treat what you find as a discovery.

## Survivorship Bias

You hear about systems that worked. You do not hear about the 50 systems tried by the same person that failed. You read about the tipster who has had a great six months. You do not see the 200 tipsters who tried and gave up.

Survivorship bias inflates apparent performance of everything you can observe, because only the survivors are observable.

## Correlation vs Causation

Two statistics that move together do not necessarily influence each other. Classic sports example: teams that score first win 70% of matches. Does scoring first cause winning? Partly — but mostly, better teams are more likely to score first and more likely to win. The true cause is team quality, not the act of scoring first.

Betting on "next team to score" at kick-off based on this correlation misidentifies the mechanism.

## Small Sample Percentages

"This referee cards 3.2 players per game" — based on 12 games. A 95% confidence interval around that estimate is enormous. The true rate could be anywhere from 1.8 to 4.6 and still be consistent with the observed data. Treat any percentage derived from fewer than 30 events with significant scepticism.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';


-- ============================================================
-- MARKET DYNAMICS
-- ============================================================

-- Module 1: How Markets Move
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'How Betting Markets Move', 'how-betting-markets-move',
  'From opening line to closing line — why odds change, what drives those changes, and what movement reveals.',
  'intermediate', true, 1
FROM public.course_categories WHERE slug = 'market-dynamics';

-- Module 2: Sharp vs Recreational Money
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Sharp vs Recreational Money', 'sharp-vs-recreational-money',
  'How to distinguish informed money from noise — and why the closing line is the most honest price in the market.',
  'advanced', true, 2
FROM public.course_categories WHERE slug = 'market-dynamics';

-- Lessons — How Betting Markets Move
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Opening Lines & Why They Shift',
  'opening-lines-and-why-they-shift',
  '## The Opening Line

Bookmakers publish an opening price typically several days before an event. This line is set by a small team of traders using models and market knowledge. It is not the "true" probability — it is an opening position, subject to revision.

## Why Odds Move

Odds move for several reasons, not all of which carry the same information:

**Volume-driven movement:** Bookmakers balance their books to limit exposure. If too much money arrives on one outcome, they shorten its price to attract money on the other side. This movement reflects commercial risk management, not necessarily new information.

**Information-driven movement:** A significant injury is announced. The market adjusts rapidly. This is genuine new information updating the probability estimate.

**Sharp money:** A sophisticated bettor or syndicate places a large bet. If the bookmaker respects their opinion (because sharp bettors have proven track records), the odds move to reflect the implied new probability. This is the most information-rich type of movement.

## What to Look For

A line that opens at 2.10 and drifts to 2.40 without any obvious news often signals that sharp money is sitting on the other side. A line that steam-moves from 2.10 to 1.70 in minutes usually reflects either a major news development or a coordinated sharp move.

The pattern of movement tells you a story. You are trying to read that story before acting.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-betting-markets-move' AND cat.slug = 'market-dynamics';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Steam Moves & Reverse Line Movement',
  'steam-moves-and-reverse-line-movement',
  '## Steam Moves

A steam move is a sudden, rapid, coordinated shift in a line across multiple bookmakers simultaneously. It typically indicates a large bet or group of bets placed quickly across the market.

Steam moves are the market''s clearest signal of sharp action. When multiple bookmakers all shorten the same team within minutes, with no news to justify it, the most likely explanation is that someone who the market respects has taken a position.

## Reverse Line Movement

Reverse line movement is one of the most valuable concepts in market reading. It occurs when the line moves opposite to where the majority of bets (by volume) are going.

Example: 70% of bets placed on Team A, but the price on Team A drifts from 1.80 to 1.90 (getting longer, not shorter). This means large-stake sharp money is on Team B, outweighing the large number of smaller recreational bets on Team A.

Public bettors tend to bet favourites and popular teams. Bookmakers shade the lines to attract money on the other side. When despite that shading the line still moves against the public, it strongly implies professional money is driving it.

## Practical Limits

This information is useful context, not a mechanical system. Not every steam move is correct. Syndicates get it wrong. Bookmakers sometimes manufacture movement. The skill is using market signals as one input among many, not as a shortcut that replaces your own analysis.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'how-betting-markets-move' AND cat.slug = 'market-dynamics';

-- Lessons — Sharp vs Recreational Money
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Closing Line & Why It Matters',
  'the-closing-line-and-why-it-matters',
  '## The Closing Line as the Best Estimate

The closing line — the last price available before an event starts — is widely considered the most accurate estimate of true probability in a liquid market. By the time a market closes, it has absorbed the most information: team news, sharp money, public money, and model estimates from hundreds of sources.

Studies across multiple sports consistently find that the closing line outperforms most individual prediction models in accuracy. The market, in aggregate, is a very good forecaster.

## Closing Line Value (CLV)

Closing Line Value is the measure of whether you consistently beat the closing line. If you bet a team at 2.20 and it closes at 1.90, you have positive CLV — you got a better price than the final market consensus. If you bet at 2.20 and it closes at 2.40, you have negative CLV.

CLV is important because:

- It measures edge independently of short-term results
- It is harder to fake than profit (profit can be a lucky run; consistently beating the close cannot)
- Professional bettors track CLV as their primary performance metric

## The Practical Implication

Bettors who consistently achieve positive CLV have a demonstrable edge. Over a large enough sample, this edge translates to profit. The goal is not just to find winners — it is to find bets where your price is better than where the market settles.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sharp-vs-recreational-money' AND cat.slug = 'market-dynamics';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Bookmaker Types & Market Selection',
  'bookmaker-types-and-market-selection',
  '## Soft Books vs Sharp Books

Not all bookmakers are the same. Understanding the distinction is operationally important.

**Soft bookmakers** target recreational customers. They offer promotions, enhanced odds, and high limits for popular markets. They quickly restrict or close accounts that show consistent profit. Their opening lines are softer and more exploitable, but access is finite.

**Sharp bookmakers** (Pinnacle, Betfair Exchange) welcome winning bettors because sharp bettors make their markets more accurate. They offer lower margins (1.5–3%) and rarely restrict accounts. Their lines are harder to beat precisely because they incorporate sharp money.

## The Restriction Problem

Most bettors start with soft books because of the headline prices and promotions. The problem: if you win consistently, soft books restrict your maximum stake — sometimes to £2 per bet. This makes the account commercially worthless regardless of your edge.

Professional bettors manage a portfolio of accounts across multiple books and exchanges. When a soft book restricts them, they have alternatives.

## Market Liquidity

Liquid markets (major football leagues, top-level events) are harder to beat because they attract the most attention from sharp bettors and modellers. The prices are efficient.

Niche markets — lower leagues, minor sports, player props — are less liquid. They receive less sharp action and are often priced by less sophisticated models. This creates more mispricing opportunities, but also more uncertainty in your own estimates.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sharp-vs-recreational-money' AND cat.slug = 'market-dynamics';


-- ============================================================
-- STAKING STRATEGIES
-- ============================================================

-- Module 1: Flat & Proportional Staking
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Flat & Proportional Staking', 'flat-and-proportional-staking',
  'The two foundational staking approaches — what each does to your bankroll growth and risk of ruin over time.',
  'beginner', true, 1
FROM public.course_categories WHERE slug = 'staking-strategies';

-- Module 2: The Kelly Criterion
INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'The Kelly Criterion', 'the-kelly-criterion',
  'The mathematically optimal staking formula — how it works, why it is aggressive, and how professionals adapt it.',
  'advanced', true, 2
FROM public.course_categories WHERE slug = 'staking-strategies';

-- Lessons — Flat & Proportional Staking
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Flat Staking: Simple but Effective',
  'flat-staking-simple-but-effective',
  '## What Flat Staking Is

Flat staking means betting the same number of units on every selection regardless of the odds, your confidence level, or recent results. If your unit is 1% of your bankroll, every bet is 1%.

## Why It Works

Flat staking is not mathematically optimal, but it has significant practical advantages:

- **Simplicity:** No calculation required at the time of betting, which reduces the chance of emotionally distorted stake sizing.
- **Variance control:** Fixed stakes mean fixed exposure per bet. A losing run cannot spiral into a catastrophic draw-down through compound stake increases.
- **Fair performance tracking:** All bets are equal weight, so ROI accurately reflects edge per bet.

## The Returns at Different ROI Levels

At 1 unit per bet with a £1,000 bankroll (1% stakes = £10/bet):

- 5% ROI over 500 bets = +£250 profit
- 10% ROI over 500 bets = +£500 profit

The bankroll grows linearly, not exponentially. This is the trade-off against more aggressive staking methods.

## When to Use It

Flat staking is the correct choice when:

- You are still establishing whether your edge is real (too early to trust your own probability estimates for variable staking)
- You are betting in a market where your confidence levels do not vary much between selections
- You prioritise simplicity and emotional stability over theoretical optimality',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'flat-and-proportional-staking' AND cat.slug = 'staking-strategies';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Proportional Staking & the Risk of Ruin',
  'proportional-staking-and-risk-of-ruin',
  '## What Proportional Staking Is

Proportional staking means betting a fixed percentage of your current bankroll on every bet. As your bankroll grows, your stakes grow. As it shrinks, your stakes shrink.

Example: 2% proportional staking. Bankroll starts at £1,000 → stake = £20. After winning £200 → bankroll = £1,200 → next stake = £24.

## The Mathematical Advantage

Proportional staking has a key theoretical property: you cannot go bust. If you always stake a percentage of what remains, you will always have something left. The sequence of bets affects the terminal bankroll, but not the existence of one.

Compare: flat staking with a large enough downswing can take you to zero if stakes are too high relative to bankroll.

## The Growth Rate

With positive expected value and proportional staking, the bankroll grows exponentially. The same 5% ROI that produces linear growth under flat staking produces compound growth under proportional staking — though the absolute numbers only diverge meaningfully over very long runs.

## Risk of Ruin Under Flat Staking

Risk of ruin is the probability that your bankroll hits zero before it reaches a target. Under flat staking at too-high stake sizes, this is non-trivial.

Rule of thumb: your maximum stake per bet under flat staking should be no more than 1–3% of your bankroll. At 3% stakes, a losing run of 34 consecutive bets wipes you out. At 1% stakes, you need a run of over 100 losses in a row — vanishingly unlikely even in a bad strategy.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'flat-and-proportional-staking' AND cat.slug = 'staking-strategies';

-- Lessons — The Kelly Criterion
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'How the Kelly Formula Works',
  'how-the-kelly-formula-works',
  '## The Formula

The Kelly Criterion is a staking formula derived in 1956 by John L. Kelly Jr. at Bell Labs. Its purpose: to find the stake size that maximises the long-run growth rate of a bankroll.

**Kelly stake (as a fraction of bankroll) = (bp – q) / b**

Where:
- b = the decimal odds minus 1 (i.e. the net return per unit staked)
- p = your estimated probability that the bet wins
- q = 1 – p (the probability it loses)

## A Worked Example

You estimate a team has a 50% chance of winning. The bookmaker offers 2.20 (decimal).

- b = 2.20 – 1 = 1.20
- p = 0.50
- q = 0.50

Kelly stake = (1.20 × 0.50 – 0.50) / 1.20 = (0.60 – 0.50) / 1.20 = 0.10 / 1.20 ≈ 8.3%

The formula says to stake 8.3% of your bankroll on this bet.

## Why This Maximises Growth

Kelly was mathematically proven to maximise the expected logarithm of wealth. Over a long sequence of bets, no strategy produces a higher terminal bankroll in expectation. At the same time, the Kelly fraction is the threshold above which overbetting destroys expected long-run wealth.

## The Critical Input: Your Probability Estimate

The formula is only as good as your estimate of p. Overestimate your edge and Kelly tells you to overbet — producing catastrophic draw-downs. Underestimate and you leave growth on the table. The quality of p is everything.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'the-kelly-criterion' AND cat.slug = 'staking-strategies';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Fractional Kelly & Practical Application',
  'fractional-kelly-and-practical-application',
  '## Why Full Kelly is Too Aggressive

Full Kelly produces the maximum long-run growth rate, but it also produces terrifying short-term volatility. At full Kelly, a sequence of bad results produces draw-downs that few bettors can emotionally tolerate — even when their long-run edge is real.

Example: a full-Kelly bettor with a 5% edge can experience a 50% draw-down during normal variance. Most people would abandon their strategy long before the edge reasserted itself.

## Fractional Kelly

Fractional Kelly means staking a fraction — typically one-quarter to one-half — of the full Kelly recommendation.

Half-Kelly: (0.5 × Kelly stake)
Quarter-Kelly: (0.25 × Kelly stake)

Half-Kelly produces 75% of the long-run growth rate of full Kelly, but reduces variance and draw-downs substantially. This is the most common professional approach.

## Practical Limitations

**Probability estimation error:** Your edge estimate is always uncertain. If you think you have a 52% chance and you actually have 50%, full Kelly stakes turn into overbetting. Fractional Kelly provides a buffer against estimation errors.

**Bankroll tracking:** True Kelly requires recalculating the stake for every bet based on the current bankroll. This is straightforward but requires discipline.

**Multiple simultaneous bets:** Standard Kelly assumes sequential bets. When multiple events overlap, stakes must be reduced further (often divided by the number of concurrent bets) to maintain the correct risk profile.

## The Consensus View

Most serious bettors use fractional Kelly (quarter to half) with conservative probability estimates. The goal is not to extract the absolute maximum growth rate — it is to stay in the game long enough for edge to manifest.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'the-kelly-criterion' AND cat.slug = 'staking-strategies';
