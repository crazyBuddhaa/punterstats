-- ============================================================
-- PunterStat — Betting Academy: Probability & Value New Modules
-- Migration 019: Add 4 new modules (10 lessons each)
--   Module 3: Expected Value in Practice     (intermediate)
--   Module 4: The Mathematics of Variance    (intermediate)
--   Module 5: Market Inefficiencies          (advanced)
--   Module 6: Predictive Edge Building       (expert)
-- ============================================================

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Expected Value in Practice', 'expected-value-in-practice',
  'How to calculate, track, and grow your EV across hundreds of bets — translating theory into a repeatable profitable process.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'probability-and-value';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'The Mathematics of Variance', 'mathematics-of-variance',
  'Why positive EV bettors experience losing runs, how to size bankrolls to survive them, and what sample sizes actually tell you.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'probability-and-value';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Market Inefficiencies Deep Dive', 'market-inefficiencies-deep-dive',
  'A systematic map of where betting markets fail — and the research methods used to find and exploit those failures.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'probability-and-value';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Building a Predictive Edge', 'building-a-predictive-edge',
  'The complete expert framework for creating, validating, and maintaining a lasting edge over bookmaker markets.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'probability-and-value';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Expected Value in Practice                  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Tracking EV on Every Bet', 'tracking-ev-every-bet',
'## Why EV Tracking Is Not Optional

Most bettors track profit and loss. Fewer track expected value. But profit/loss at small samples is dominated by variance; EV tracking gives you a faster and more reliable signal of whether your process is working.

## What to Record

For every bet, record:
- Selection and market
- Your estimated probability (formed before seeing the price)
- The offered price (decimal)
- Implied probability (1/price)
- EV% = (Your P × (price-1)) - (1-Your P) — expressed as % of stake
- Stake
- Outcome (win/loss)
- Actual P&L

## The EV Ledger

Maintain a cumulative EV ledger: the sum of all individual EV amounts across every bet. This represents what you should have earned based on your probability estimates, irrespective of actual results.

Compare cumulative EV to actual P&L over time. They should converge as sample size grows. If P&L consistently underperforms cumulative EV, your probability estimates may be systematically optimistic.

## Monthly EV Review

At the end of each month:
- Total expected profit (sum of EV amounts)
- Actual profit/loss
- Difference (variance impact this month)
- Rolling 6-month cumulative EV vs actual

The variance impact should average toward zero over time. If your EV is consistently positive but actual P&L is consistently negative over 12 months, investigate: your probability estimates may be miscalibrated.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'EV Across Multiple Bet Types', 'ev-across-multiple-bet-types',
'## Not All Markets Have the Same EV Profile

A 2% EV edge on a 1X2 market behaves very differently from a 2% EV edge on an accumulator or a player prop. Understanding these differences prevents you from mixing up EV metrics across incomparable markets.

## Single Bets: The Clean Baseline

Singles have the most interpretable EV. Your probability estimate, the offered price, and the EV formula give a single, clear number.

**Benchmark all other market EV against singles.** If you cannot calculate cleaner EV on a market type, you probably should not be betting it.

## Accumulator EV: Compounding Uncertainty

For a 3-leg accumulator where each leg has +2% EV:
Combined EV ≈ 1.02 × 1.02 × 1.02 − 1 = 6.1% on the parlay odds

This seems to compound the edge — but it also compounds the uncertainty in your probability estimates. A 2% EV edge based on a correctly calibrated model is very different from a 2% EV edge based on a rough guess.

**Rule:** Only combine legs in accumulators if each individual leg EV is well-validated. An accumulator of five dubious 2% EV selections is not better than one solid 2% EV single — it is riskier without proportionately more edge.

## Prop Bet EV: The Data Problem

Player prop markets (first scorer, assists, passing yards) often have higher nominal EV — markets are less efficient. But your probability estimates for props require player-level data that is harder to validate for calibration.

**Rule:** Higher apparent EV in less-liquid markets may reflect worse estimation, not genuine edge. Validate props against closing lines before scaling stakes.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The EV Mindset: Thinking Long-Term', 'ev-mindset-long-term',
'## The Hardest Part Is Not the Maths

You can understand EV perfectly and still fail to apply it correctly because applying it requires an emotional discipline that contradicts human instinct.

## The Single-Bet Trap

Human psychology evaluates one bet at a time. A losing bet feels like a failure. A winning bet feels like success. EV thinking requires evaluating your process across all bets, not any individual result.

The specific discipline required: you must be as comfortable losing a +8% EV bet as you are winning a −5% EV bet. The losing +8% bet was correct. The winning −5% bet was wrong. Outcome does not determine process quality.

## Pre-Commitment to the Process

Write down your EV threshold before the season starts: "I will only bet when my estimated EV exceeds X%." Do not change this threshold after a losing run — the losing run does not mean your threshold was wrong.

## The Accountability Practice

Share your pre-bet EV estimates with a betting partner or accountability group before placing the bet. Knowing others will review your estimates creates accountability for honest probability formation.

## Building EV Intuition

After 6 months of EV tracking, you develop intuition for what genuine value feels like vs what optimistic hope feels like. The two feel almost identical at first. Over time, you learn to recognise when you are stretching your probability estimate beyond what evidence supports — the moment when a marginal analysis becomes a rationalisation for a bet you already want to place.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'EV and Stake Sizing: The Unified Framework', 'ev-and-stake-sizing',
'## EV Alone Is Not Enough

Knowing a bet is +5% EV tells you it is worth betting. It does not tell you how much to bet. This is where EV and staking theory intersect.

## The Kelly Connection

The Kelly Criterion derives the optimal stake size from EV:

Kelly % = (P × B − Q) / B

Where P = win probability, Q = 1−P, B = net odds (decimal − 1)

This formula maximises the geometric growth of your bankroll. At the same EV, higher-odds bets receive smaller Kelly fractions because their variance is higher.

## Worked Example

EV +5% on a 3.00 bet (P = 0.40, B = 2.00, Q = 0.60):
Kelly % = (0.40 × 2.00 − 0.60) / 2.00 = (0.80 − 0.60) / 2.00 = 0.10 = 10% of bankroll

EV +5% on a 1.80 bet (P = 0.60, B = 0.80, Q = 0.40):
Kelly % = (0.60 × 0.80 − 0.40) / 0.80 = (0.48 − 0.40) / 0.80 = 0.10 = 10% of bankroll

Same EV, same Kelly fraction — because EV% and Kelly fraction are directly proportional given the same odds structure.

## Practical EV-Driven Staking

Most bettors use fractional Kelly (25–50% of full Kelly) to reduce variance while still scaling stakes with EV:

Stake = (EV% / B) × bankroll × Kelly fraction

The key discipline: bet more on higher EV, less on lower EV — not more on higher confidence or longer price.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'EV in Horse Racing and Multi-Runner Markets', 'ev-horse-racing-multi-runner',
'## Multi-Runner Markets: A Different EV Environment

In a two-outcome market (tennis, basketball), if one outcome is underpriced, the other is overpriced — you need only identify which side has the edge.

In a multi-runner market (horse racing with 12 runners, football outright with 20 teams), the situation is more complex: the market''s probability mass must be distributed across many outcomes, and mispricing can exist in multiple places simultaneously.

## Finding EV in Horse Racing

Your job: for each runner, estimate the true win probability and compare to the implied probability from the market.

**Step 1:** Build a speed rating for each runner based on best recent time, adjusted for distance and going conditions.
**Step 2:** Convert relative ratings into win probabilities (market share model or Elo-style conversion).
**Step 3:** De-vig the SP or opening market.
**Step 4:** Compare — any runner where your probability significantly exceeds implied probability is a potential value bet.

## The "Racing Form" EV Trap

Conventional racing form analysis identifies horses that look like good bets based on form. EV analysis identifies horses that are underpriced relative to their true ability. The two often diverge: the obvious form horse is already priced in; the underpriced horse often looks less impressive on paper.

## Portfolio EV in Multi-Runner Markets

It is possible to have value on multiple runners in the same race — your total implied stake probability may be below 100%. This is a positive dutching opportunity: backing multiple runners at stakes sized for equal profit creates a guaranteed profit if any of your value selections wins.

## Expected Value vs Expected Price Movement

In horse racing, early bettors sometimes extract value simply by betting before the market corrects — an opening price of 8.00 that closes at 5.00 represented genuine value at 8.00, regardless of whether the horse won.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Negative EV Situations to Avoid', 'negative-ev-situations-to-avoid',
'## Knowing What Not to Bet Is as Important as Knowing What to Bet

A significant portion of profitable betting is simply refusing to bet in high-negative-EV situations that most recreational bettors accept as normal.

## The Accumulator Trap

An accumulator of five selections, each with 5% bookmaker margin:
Combined margin = 1 − (0.95)^5 = 22.6%

The bettor who places this bet needs over 22.6% edge across the combined selections to break even. This is essentially impossible for most bettors.

**Avoid:** Accumulators using bookmaker prices unless each individual leg is independently verified as positive EV.

## The Cash-Out Trap

Cash-out prices are systematically below fair market value. The bookmaker embeds an additional margin into the cash-out price.

If you backed Team A at 3.00 and they are now in-play at 1.60, the fair cash-out should be:

Matched lay at 1.60 on the exchange = the fair value of your position.

The bookmaker''s cash-out offer will be below this. The difference — typically 5–15% below exchange — is additional margin extracted from you.

**Avoid:** Cash-out as a systematic practice. Use exchange lays to cash out at fair value instead.

## The Bet Builder Trap

Same-game multi (bet builder) products are designed to create the illusion of customisation while compounding multiple margins. Individual leg prices already include margin; combining them multiplies it.

**Avoid:** Bet builders unless you have a specific, validated reason to believe two correlated outcomes are independently mispriced in a way the bookmaker has not accounted for.

## The "Value" Enhanced Odds Trap

Bookmakers offer "enhanced" prices on selected events — often headlining a 4.00 offer on a 1.80 favourite. These promotions extract value in other ways: wagering requirements, withdrawal restrictions, or account monitoring. Read terms before acting.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'EV Across a Season: Portfolio Thinking', 'ev-across-a-season-portfolio',
'## Your Bets Are a Portfolio

Professional investors do not evaluate each stock trade in isolation — they evaluate the portfolio. The same approach applies to betting.

## The Season-Level EV Budget

Set a season-level EV target:
- Number of bets planned: 400
- Average stake: £75
- Average EV%: 3%
- Expected annual profit: 400 × £75 × 0.03 = £900

This is your operating budget. Variance will mean actual results deviate — but the EV budget tells you what to expect if your process is correct.

## Portfolio Diversification Benefits

Diversifying across markets, sports, and odds ranges reduces the correlation between individual bet outcomes. Uncorrelated bets smooth the variance of the overall portfolio.

Mathematically: if you make n independent bets of equal EV and size, variance scales as 1/√n relative to stake. Doubling the number of uncorrelated bets reduces standard deviation of results by ~30%.

## Identifying Portfolio Drag

Some market types in your portfolio will have lower actual CLV than others. Quarterly analysis might reveal:
- Football 1X2: +3.5% CLV
- Tennis main markets: +2.1% CLV
- Football goalscorer: −0.5% CLV

Goalscorer markets are dragging the portfolio. Eliminating them improves overall portfolio EV without changing any other behaviour.

## The Compound Growth Simulation

Run a Monte Carlo simulation of your expected portfolio:
- Input: number of bets, average EV%, average odds
- Output: distribution of possible outcomes after n bets

This shows you the realistic range of outcomes — not just the expected value. If the 10th percentile outcome over your season is still above your starting bankroll, your operation is conservatively sized. If the 10th percentile is ruin, you are overbetting.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Communicating EV to Stakeholders', 'communicating-ev-stakeholders',
'## When You Bet Other People''s Money

Whether managing a syndicate, operating a tipping service, or partnering with an investor, you must communicate EV-based performance metrics clearly to people who may not think in these terms.

## The Problem with Showing P&L Only

Short-run P&L is dominated by variance. Showing a subscriber or investor a losing month result — even one caused purely by variance on a +EV process — undermines confidence in the system.

## What to Show Instead

**Primary metric: CLV (Closing Line Value)**
"On average, our selections were priced 2.8% better than the closing Pinnacle line."

**Secondary metric: Sample-adjusted ROI**
Actual ROI with confidence interval based on sample size. "Our 350-bet sample shows 4.1% ROI with 95% confidence interval of 1.2%–7.0%."

**Variance context:**
"A random sequence of 350 bets with our edge profile would produce results between −2% and +10% ROI in 90% of scenarios. Our actual result of +4.1% is within this range."

## The Subscription Service Challenge

Tipster services typically report ROI, win rate, and profit in units. Most hide the confidence interval context. A responsible service:
- Reports the number of qualifying bets in each reporting period
- Shows rolling metrics rather than cherry-picked time windows
- Acknowledges variance explicitly in monthly reports

## Investor Reporting for Syndicates

For betting syndicates managing external capital:
- Monthly reporting: CLV, actual P&L, cumulative
- Quarterly reporting: Calibration test results, market breakdown
- Annual reporting: Full statistical analysis, model documentation, forward-year edge estimate

Transparency about the probabilistic nature of returns — including honest downside scenarios — builds durable investor confidence.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Advanced EV: Correlated Outcomes and Hedging', 'advanced-ev-correlated-hedging',
'## When Bets Are Not Independent

Standard EV calculation assumes each bet is independent. In practice, your betting positions are sometimes correlated — the outcome of one affects the probability of another.

## Direct Correlation: Same Event, Multiple Markets

If you bet Team A to win AND over 2.5 goals in the same match, these bets are correlated. Team A winning at 2-1 satisfies both; Team A winning at 1-0 satisfies only the first. Your EV calculations need to account for this correlation.

True joint EV ≠ EV(win) + EV(over). The actual joint EV requires knowing the joint probability distribution of both outcomes.

## Indirect Correlation: Same League, Same Season

In a league outright market, backing multiple teams to win the league creates portfolio correlation. If your model says Team A is 30% likely and Team B 25% likely (50% combined) but the true probability of "neither wins" is 55%, there is an inconsistency — the probabilities are competing.

## Hedging EV: When to Trade Out

If you backed Team A at 3.00 and they are in-play at 1.60, your current position has positive EV relative to the current price. Whether to hold or hedge depends on:

Hold EV: (Original P × 3.00) − 1 (ongoing from here)
Hedge EV: Lock profit now (certain)

The hedge is correct if the remaining uncertainty (risk of A not winning) plus the commission of the hedge exceeds the EV of holding. In most cases with large in-play price compression, the hedge is correct once sufficient profit is locked.

## Portfolio EV with Correlations

For a portfolio of correlated bets, total portfolio EV is still the sum of individual EVs (EV is additive). But the variance of the portfolio is not simply additive — it grows with correlation. Highly correlated positions concentrate both upside and downside, increasing the probability of extreme outcomes in either direction.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'EV Mastery: The Complete Operational Framework', 'ev-mastery-operational-framework',
'## Integrating Every EV Concept

At the expert level, EV is not a concept you apply to individual bets — it is the lens through which every operational decision is made.

## The EV Decision Tree

**Selection decision:** Is this bet +EV? (Probability estimate vs implied probability)
**Market decision:** Which bookmaker/exchange maximises EV for this bet? (Price comparison)
**Stake decision:** How much does EV, Kelly, and bankroll position suggest I stake?
**Portfolio decision:** Does adding this bet increase or decrease portfolio EV efficiency?
**Exit decision:** If in-play, does hedging or holding maximise EV from here?
**Review decision:** Does this bet''s CLV conform to my model''s expected performance?

## The EV Infrastructure Stack

- **Data layer:** Team performance database, odds history, CLV records
- **Model layer:** Probability estimation framework with calibration tracking
- **Execution layer:** Multi-account management, line shopping process
- **Review layer:** Monthly EV vs P&L reconciliation, quarterly calibration tests
- **Adaptation layer:** Model updates based on review findings

## The Compounding Proof of Concept

A bettor applying this framework consistently over 5 years will have:
- 2,500+ bets in their database
- Statistical certainty (or refutation) of their edge
- A calibrated model updated through 5 annual revision cycles
- An account portfolio refined through 5 years of restriction/replacement experience

The compounding effect of 5 years of systematic improvement cannot be replicated by sporadic, unstructured betting — regardless of raw analytical talent.

## The Final Insight

EV is a measure of process quality, not a guarantee of outcomes. The best EV practitioners accept this distinction completely — they define their identity as a "good process bettor" rather than a "winner." This identity is resilient to losing runs because the process, not the outcome, is what they control.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'expected-value-in-practice' AND cat.slug = 'probability-and-value';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — The Mathematics of Variance                 ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Is Variance and Why It Matters', 'what-is-variance-betting',
'## The Invisible Force in Every Bet

Variance is the statistical measure of how spread out your results will be around the expected value. Even with a perfect edge, variance guarantees that your actual results will deviate from expectation — sometimes dramatically.

## The Coin Flip Benchmark

A fair coin flipped 100 times: expected 50 heads. But actual results at 100 flips follow a binomial distribution with standard deviation √(100 × 0.5 × 0.5) = 5.

This means roughly 95% of 100-flip sequences produce between 40 and 60 heads. Getting 42 heads is not evidence the coin is biased. Getting 38 heads is unusual but still possible by chance.

## Betting Variance Is Higher

Sports betting involves odds-weighted outcomes, not simple win/lose. A bet at 4.00 with 25% win probability has much higher variance than a bet at 1.50 with 67% win probability — even if both have identical EV.

The variance of a single bet: σ² = p × (1−p) × (decimal_odds − 1)²

At 4.00 with p = 0.28: σ² = 0.28 × 0.72 × 9 = 1.81
At 1.50 with p = 0.72: σ² = 0.72 × 0.28 × 0.25 = 0.05

The 4.00 bet has 36× the variance of the 1.50 bet. Same EV can mean radically different risk profiles.

## The Practical Implication

Chasing longshots or mixing odds ranges without understanding variance leads to bankroll ruin even with genuine edge. Variance management is inseparable from EV management.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Standard Deviation and Betting Results', 'standard-deviation-betting',
'## From Variance to Standard Deviation

Standard deviation (σ) is the square root of variance — expressed in the same units as the outcome (profit/loss), making it more interpretable.

For a portfolio of n bets:

Portfolio σ = √(Σ individual bet variances) [assuming independence]

## Calculating Your Expected Result Range

After n bets with average EV of E and average variance of V:

Expected total profit: n × E
Standard deviation of total profit: √(n × V)

The 95% confidence interval for total profit: [n×E − 1.96×√(n×V), n×E + 1.96×√(n×V)]

## A Worked Example

200 bets, average EV = +£3.00, average odds = 2.50, stake £100, win probability 42%.

Per-bet variance: 0.42 × 0.58 × 1.50² = 0.42 × 0.58 × 2.25 = 0.548 variance in units of stake²
In £: V = 0.548 × £100² = £5,480 per bet variance → σ per bet = £74

Portfolio σ = √(200 × £5,480) = √1,096,000 = £1,047

Expected profit: 200 × £3.00 = £600
95% range: £600 ± 1.96 × £1,047 = [−£1,452, +£2,652]

## The Sobering Reality

At 200 bets, your result may be anywhere from a £1,452 loss to a £2,652 profit — even with genuine +£3 EV per bet. Only at much larger samples does the result reliably converge on the expected value.

## Managing Psychological Response to Variance

Knowing the expected result range before starting reduces psychological damage from results within the normal range. Write down your expected range at the start of any period. Losses within range are not failures.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Downswing Probability and Bankroll Sizing', 'downswing-probability-bankroll',
'## What Is a Downswing?

A downswing is a losing run — a period where actual results are significantly below expected value due to variance. Every positive-EV bettor will experience them. The question is not whether downswings happen, but how large they get and whether your bankroll survives them.

## Calculating Maximum Drawdown Risk

The expected maximum drawdown (peak-to-trough loss) over n bets depends on the variance of each bet and the number of bets. A simplified calculation:

For n = 500 bets at average stake £50, average bet variance σ_bet = £60:

Expected max drawdown ≈ 2 × √n × σ_bet / 2 ≈ 2 × √500 × £60 / 2 = £1,342

This means at some point during 500 bets, you should expect a drawdown of roughly £1,342 at the 50th percentile — just from variance, even with genuine edge.

## Bankroll Sizing Rule

Your starting bankroll must be large enough to absorb the expected maximum drawdown without psychological or financial pressure forcing you to abandon the strategy.

Minimum bankroll = 3 × Expected max drawdown

At expected drawdown £1,342: minimum bankroll = £4,026

With £50 average stakes and this bankroll, your stake is roughly 1.2% of bankroll — conservatively sized.

## The Risk of Ruin Formula

P(ruin) ≈ e^(-2 × edge × bankroll / variance_per_bet)

Where edge is EV per unit stake and variance_per_bet is σ² per bet.

Even with positive edge, if variance is high and bankroll is small, the probability of ruin approaches 50%+ — variance kills the operation before the edge can compound.

## Practical Guidance

Size your bankroll as a function of your bet variance, not just your average stake. High-variance bettors (longshot specialists) need proportionally larger bankrolls than low-variance bettors (short-odds specialists) to achieve the same risk of ruin.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Sample Size: How Many Bets Until You Know', 'sample-size-how-many-bets',
'## The Fundamental Problem of Small Samples

Bettors constantly draw conclusions from too-small samples. "My system is up 8% ROI after 50 bets" is almost meaningless statistically. How meaningless?

At 50 bets with win rate 40%, standard error of win rate = √(0.40 × 0.60 / 50) = 6.9%

This means even a "true" 40% win rate can produce observed win rates anywhere from 26% to 54% in 95% of 50-bet samples. The noise completely overwhelms any signal.

## The Statistical Power Table

Minimum bets needed to detect a given edge (with 95% confidence) at a typical betting win rate:

| True Edge (ROI) | Bets Needed |
|---|---|
| 1% | ~10,000 |
| 2% | ~2,500 |
| 3% | ~1,100 |
| 5% | ~400 |
| 10% | ~100 |

A 3% genuine edge requires 1,100 bets to be statistically detectable. Most bettors never accumulate this volume in a consistent system.

## CLV as a Sample Size Amplifier

Closing Line Value validates edge faster than outcomes because it compares your price to an independent reference rather than to a 0/1 outcome. CLV confidence interval narrows roughly 3× faster than outcome-based ROI confidence interval for the same number of bets.

300 CLV-tracked bets provides confidence equivalent to ~900 outcome-tracked bets.

## The Practical Implication

You cannot know if your current system has edge based on short-run results. You can approximate the answer using CLV. Before spending 1,100 bets on outcome-based validation, use CLV as a leading indicator — if your CLV is consistently positive over 200 bets, proceed with cautious confidence.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Impact of Odds on Variance', 'impact-of-odds-on-variance',
'## Different Odds, Different Variance

The odds at which you bet fundamentally determine the variance profile of your operation. Two bettors with identical EV but different odds distributions will have radically different variance experiences.

## The Variance Formula Reminder

Variance per bet = p × (1−p) × (decimal_odds − 1)²

For EV to be the same, higher odds require higher probability of winning. But the (odds−1)² term grows quadratically with odds, dominating variance at long prices.

## Comparing Two Portfolios

Portfolio A: 500 bets at 2.00 average odds, 53% win rate (EV ≈ +6%)
Portfolio B: 500 bets at 5.00 average odds, 22% win rate (EV ≈ +10%)

Portfolio A variance per bet ≈ 0.53 × 0.47 × 1 = 0.249
Portfolio B variance per bet ≈ 0.22 × 0.78 × 16 = 2.745

Portfolio A standard deviation over 500 bets ≈ √(500 × 0.249) × stake
Portfolio B standard deviation over 500 bets ≈ √(500 × 2.745) × stake — 3.3× higher

Portfolio B has higher EV but 3.3× higher variance. A bettor experiencing Portfolio B''s variance without understanding this will likely abandon the system during a perfectly normal downswing.

## The Optimal Odds Range for Psychological Sustainability

Most bettors are best served by focusing on odds between 1.70 and 3.50. This range offers:
- Moderate win rates (30–60%): fast enough feedback for calibration
- Moderate variance: survivable downswings at sensible bankroll sizes
- Efficient pricing: most scrutiny from sharp money, best calibration of model against market

## Mixing Odds Ranges

A diversified portfolio across odds ranges reduces overall variance relative to pure long-shot or pure short-price portfolios. The uncorrelated variance of different odds ranges partially offsets each other.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Monte Carlo Simulation for Bettors', 'monte-carlo-simulation-bettors',
'## Simulating Your Future Results

Monte Carlo simulation runs thousands of random scenarios from your betting parameters to show the full distribution of possible outcomes. It answers the question: "Given my edge and variance, what range of results should I expect?"

## Building a Simple Simulation

Inputs:
- Number of bets (n)
- Win probability per bet (p)
- Decimal odds (d)
- Stake (s)

For each simulation run:
1. For each of n bets, draw a random number between 0 and 1
2. If random < p → win: profit += s × (d-1)
3. If random ≥ p → loss: profit -= s
4. Record cumulative profit at each bet

Run 10,000 simulation iterations. The distribution of final profits shows your outcome range.

## What the Simulation Reveals

- **10th percentile outcome:** What happens in a bad-but-not-terrible scenario
- **50th percentile (median):** Most likely single outcome
- **90th percentile:** Best case realistic scenario
- **Maximum drawdown distribution:** How deep the worst losing run gets in each iteration

## The Practical Use

Before starting a new system, simulate it. If the 10th percentile outcome is ruin (bankroll → 0), reduce your stake. If the 10th percentile is still a profit, you are conservatively sized.

## Free Tools

- A spreadsheet with RAND() and cumulative sum can produce basic simulations
- Python''s numpy library enables sophisticated multi-parameter simulations in under 20 lines
- Betfair has published Monte Carlo tools for exchange traders

## Simulation Limitations

Monte Carlo assumes your probability estimates are correct and stable. Real-world variance includes model error (your estimates are not perfectly calibrated), edge erosion over time, and correlated runs (losing bets cluster more than pure independence assumes). Factor in a 20–30% uncertainty margin on your model inputs.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Reducing Variance Through Diversification', 'reducing-variance-diversification',
'## Variance Reduction Without Sacrificing Edge

If your edge is independent of the specific bet, diversifying across many uncorrelated bets reduces the variance of your total profit without reducing expected profit.

## The Mathematical Principle

For n independent bets each with variance V:
Portfolio variance = n × V
Portfolio standard deviation = √(n × V) = √n × √V

But expected profit = n × EV

Therefore: Sharpe ratio (EV / σ) of portfolio = (n × EV) / (√n × √V) = (EV / √V) × √n

The portfolio''s Sharpe ratio improves with √n. More independent bets → better risk-adjusted returns.

## Practical Diversification Strategies

**1. Market diversification:** Bet across 1X2, Asian handicap, over/under. Each market''s outcomes are related but not identical — partial diversification benefit.

**2. Sport diversification:** Football, tennis, and basketball outcomes on the same day are essentially uncorrelated. Betting both reduces overall portfolio variance.

**3. League diversification:** Premier League results are uncorrelated with Bundesliga results — both can be in your portfolio without correlation risk.

**4. Time diversification:** Spreading bets across a season rather than concentrating on weekend fixtures smooths variance over time.

## The Correlation Warning

Diversification only works if bets are genuinely independent. Backing every home team in the same league on the same matchday is not diversification — a league-wide bad-weather day or refereeing trend affects all simultaneously.

## The Optimal Bet Count

From a variance-management perspective, 15–25 active bets per week (across uncorrelated markets) provides significant diversification benefit while remaining manageable for a part-time operation.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Surviving a Downswing: The Mental and Mathematical Framework', 'surviving-downswing',
'## The Inevitability of Downswings

A positive-EV bettor with a 3% ROI placing 500 bets per year should expect, statistically:
- At least one 20-bet losing run during the year
- At least one 30-unit drawdown during a typical 2-year window
- A losing month in approximately 1 in 4 months

These are not failures. They are mathematical certainties. Planning for them is not pessimism — it is professional risk management.

## Pre-Downswing Preparation

**Bankroll buffer:** Your bankroll should support a 3× expected maximum drawdown without requiring stake reduction.

**Performance monitoring trigger:** Define in advance the CLV or rolling-result threshold that triggers a strategy review. Example: "If 30-day rolling CLV is negative for 3 consecutive months, I pause and review."

**Stake reduction rule:** If bankroll falls below 70% of starting point, reduce stakes proportionally (Kelly mechanics do this automatically).

**Communication plan:** If managing external funds, prepare a downswing template that frames results in statistical context before sending.

## During the Downswing

- Do not change strategy mid-downswing unless CLV also turns negative (which would signal model failure, not variance)
- Increase record-keeping detail to catch any actual errors vs pure variance
- Check for scope drift: are you betting markets outside your validated edge?

## Post-Downswing Analysis

After a significant drawdown resolves:
- Was the depth within the pre-simulated range? (If yes: variance, not failure)
- Was there any evidence of systematic error? (Model bias, market deterioration)
- Was the response disciplined? (Did you maintain stakes, avoid tilt bets)

The bettor who survives a downswing with process intact has proven professional resilience — the defining quality that separates consistent operators from occasional lucky runs.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Variance and Tipping Services: What ROI Claims Really Mean', 'variance-tipping-services-roi',
'## The Tipster Industry''s Dirty Secret

Most tipping services report ROI figures that are mathematically meaningless at their sample sizes. A service reporting 12% ROI over 200 bets sounds impressive. Statistically, a 12% ROI at 200 bets is indistinguishable from zero edge at conventional significance levels.

## Calculating Whether a Tipster ROI Is Meaningful

Null hypothesis: the tipster has zero edge (true ROI = 0%).
Observed ROI = 12%, typical bet win probability = 40%, typical odds = 2.60.

Standard error of ROI at 200 bets:
SE ≈ σ_bet / √n = [(0.40 × 0.60 × 1.60²)^0.5 × 100] / √200

σ_bet = √(0.40 × 0.60 × 2.56) = √0.614 = 0.784 → 78.4% of average stake
SE = 78.4% / √200 = 5.5%

Z-score = 12% / 5.5% = 2.18 → approximately 97th percentile → borderline significant

Even at 12% ROI over 200 bets, this is only marginally statistically significant. At 100 bets with the same ROI, Z = 1.54 — not significant at all.

## What Bettors Should Ask Tipsters

1. How many bets in the sample?
2. What is the confidence interval around the reported ROI?
3. What is the average odds profile (which determines variance)?
4. Is there a CLV-based validation in addition to outcome-based ROI?
5. Is the profitable period cherry-picked or the full history?

## The CLV Alternative

A tipster who reports +3% average CLV over 500 bets with documented methodology is more credible than a tipster with 20% ROI over 100 bets. CLV is harder to fake (it requires timestamped prices) and statistically more significant at the same sample size.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Variance Management: The Complete Picture', 'expert-variance-management',
'## Integrating All Variance Concepts

Expert-level variance management is not a single technique — it is an integrated framework that controls variance at every level of the betting operation.

## The Four Levers of Variance Control

**1. Stake sizing (Kelly fraction)**
The primary lever. Half-Kelly reduces variance to 25% of full-Kelly variance while retaining 75% of expected growth rate. For most bettors, 25–33% Kelly is optimal: low enough variance to survive, high enough to grow.

**2. Odds range selection**
Concentrate in the 1.70–3.50 range unless your model is specifically validated for longshots. High-odds portfolios require proportionally larger bankrolls for the same risk of ruin level.

**3. Bet count and diversification**
More independent bets per week reduces portfolio variance proportionally. Target 15–25 bets per week across uncorrelated markets.

**4. Bankroll buffer**
Maintain 3× expected maximum drawdown as a buffer above operating capital. This buffer is not available for staking — it is the cushion that allows the operation to survive extreme variance.

## The Variance Dashboard

Track monthly:
- Rolling 3-month actual σ (standard deviation of monthly results)
- Model-predicted σ for the same period
- Ratio: if actual σ > 1.5× predicted σ, investigate for model miscalibration or scope drift

## The Long-Run Convergence Test

At 1,000+ bets:
- Actual ROI should be within 1× standard error of CLV-based expected ROI
- If gap persists, either CLV tracking is inaccurate or there is a systematic execution error (not taking available price, delayed bet placement after CLV is measured)

## The Existential Insight

Variance is not the enemy. Variance is the environment. The bettor who understands variance is not afraid of losing months — they expected them. This absence of fear is itself a competitive advantage: it prevents tilt, prevents strategy abandonment, and allows the edge to compound over the timescales required for statistical certainty.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mathematics-of-variance' AND cat.slug = 'probability-and-value';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Market Inefficiencies Deep Dive             ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Mapping Sports Betting Market Inefficiencies', 'mapping-market-inefficiencies',
'## The Efficiency Spectrum

No betting market is perfectly efficient — information asymmetries, cognitive biases, and liquidity constraints create pockets of mispricing. The expert bettor maps these inefficiencies systematically rather than hunting randomly.

## Class 1: Information Inefficiencies

The market does not have all relevant information. Examples:
- Injury known internally before public announcement
- Weather forecast affecting outdoor match not yet priced in
- Insider knowledge of team selection in a league where lineups are not pre-announced

These are the fastest-closing inefficiencies. They close within minutes of information becoming public.

## Class 2: Processing Inefficiencies

The market has the information but has not priced it correctly. Examples:
- Recency bias (over-pricing a team''s recent form)
- Public sentiment bias (over-pricing popular teams)
- Model gaps in low-liquidity markets (algorithm cannot process context correctly)

These close more slowly — often remaining open through the closing price.

## Class 3: Structural Inefficiencies

Systematic market structure creates predictable mispricing patterns. Examples:
- Favourite-longshot bias (longshots systematically overpriced)
- Draw bias in football (draws marginally under-bet in certain contexts)
- Home advantage miscalculation after pandemic-era empty-stadium data

These are persistent patterns that require quantitative research to find and validate.

## Class 4: Execution Inefficiencies

The market is correctly priced but accessible at different prices from different bookmakers. Line shopping exploits this.

## The Hierarchy

Class 1 closes fastest and requires the most infrastructure to exploit. Class 4 requires the least skill but the most operational discipline. Class 2 and 3 are the most accessible for analytical bettors — they are not about speed but about being right.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Researching and Documenting Market Biases', 'researching-documenting-market-biases',
'## The Systematic Approach to Bias Research

Anecdotally claiming a market bias ("draws are undervalued") is insufficient. A systematic bettor builds evidence: collects data, tests the claim, quantifies the bias, and monitors for erosion.

## Step 1: Hypothesis Formation

Start with a specific, falsifiable hypothesis.

**Good hypothesis:** "In English Championship matches where the home team is a top-half side and the away team is a bottom-half side played on a Tuesday evening, draw probability is underestimated by bookmakers by 3–5%."

**Bad hypothesis:** "Draws are good value."

## Step 2: Data Collection

Gather historical data matching your hypothesis criteria. Minimum: 200 qualifying events over at least 3 seasons. Collect: closing Pinnacle prices, outcomes.

## Step 3: Statistical Test

Compare actual draw frequency to implied draw probability across your sample.

If actual draw rate = 30% and average implied probability = 25% across 300 events:
Z = (0.30 − 0.25) / √(0.25 × 0.75 / 300) = 0.05 / 0.025 = 2.0 → Significant

## Step 4: Effect Size

Calculate the average value per bet:
Value per bet = (True draw rate − Implied draw rate) × (De-vigged odds)

This is your expected profit per unit staked if the bias persists.

## Step 5: Erosion Monitoring

Apply the bias forward in time (out-of-sample). Track whether the effect persists, diminishes, or reverses. Many apparent biases are data artefacts or have already been priced in by the time you discover them.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Public Betting Bias: The Recreational Bettor''s Impact', 'public-betting-bias-impact',
'## How Recreational Money Distorts Markets

Bookmakers in the soft-book segment often balance their books based on customer volume — not pure probability. When 80% of bets are on one team, they shade the price to attract money on the other side, regardless of their true probability estimate.

## The Documented Public Biases

**1. Favourite bias**
Short-priced favourites attract disproportionate public money. Markets shade slightly toward the underdog to balance the book. Result: favourites are very slightly overpriced, underdogs very slightly underpriced.

Effect size: approximately 1–2% across a large sample. Subtle but statistically detectable at scale.

**2. Home team bias**
Home teams systematically attract more recreational bets than their probability warrants. This is especially strong in high-profile local derbies and national team matches.

**3. Popular team bias**
Manchester United, Liverpool, Real Madrid, Barcelona attract excess public money in every market. Their prices are systematically compressed below true probability in soft books.

**4. Recency bias (market level)**
After a high-profile result (a famous upset, a dominant performance), the public over-prices the team that performed well. This is documented: teams that won by 3+ goals in the previous match are over-bet in the following fixture.

## How to Exploit These Biases

These biases produce small but persistent edges against soft books. The systematic approach:
- Fade popular teams in soft books (take the opponent at inflated prices)
- Back away teams in high-profile fixtures
- Back teams coming off a heavily covered loss (the market under-corrects for recency)

Always validate against CLV — these are soft book biases, not sharp book biases.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Situational Inefficiencies: When Context Misprices Markets', 'situational-inefficiencies',
'## Situation Creates Edge

Beyond team quality and form, the specific situation of a match — what is at stake for each team — systematically creates pricing errors that sophisticated analysis can exploit.

## Motivation Differentials

Teams at different stages of the season have fundamentally different utility functions for winning:

- A relegated team vs a mid-table team: the relegated team may have released pressure and is performing without fear; the mid-table team has nothing at stake
- A team already qualified for European competition playing the last league match vs a desperate rival: the qualified team may prioritise rest over result
- A cup tie where a small club has "one game to win big": motivation spike not captured in season-long rating

Research shows motivation differentials shift implied win probability by 5–12% in extreme cases.

## Rest and Rotation

When elite clubs play mid-week European fixtures followed by a weekend league match, squad rotation is likely. The starting XI for the weekend match is materially different from the first-choice team. Models using season-average team strength miss this.

**Edge window:** Between team announcement and market adjustment. First-team available 45 minutes before opening of some markets; confirmed lineups often 60 minutes before kick-off. Acting quickly on rotation news is a real, if brief, edge.

## Cup vs League Mentality

Many clubs treat cup competitions differently from league matches:
- Premier League clubs rotate heavily in early-round League Cup ties
- La Liga clubs prioritise league position over Copa del Rey in regular rounds
- Champions League groups stage last rounds are often treated as rotation opportunities

The market often uses the same team rating model regardless of competition priority.

## The Research Approach

For each situation type, collect historical data. Does a specific situational factor (rotation, motivation, cup context) predict outcomes beyond team quality alone? Quantify the effect and apply it as a contextual adjustment.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Referee and Environmental Market Inefficiencies', 'referee-environmental-inefficiencies',
'## Factors the Market Systematically Underweights

Modern bookmaker models are highly sophisticated at team-level statistics but less precise at granular contextual factors. These gaps create pockets of edge for researchers willing to collect the data.

## Referee Effects

Referees have measurable, consistent tendencies:
- Cards per match (strict vs lenient)
- Penalty award rate
- Propensity to allow physical play (affects strong vs technical teams differently)
- Home advantage amplification (some referees show larger home bias)

If a strict referee (top-quartile for cards) is assigned to a match between two physically aggressive teams, over-cards markets are more valuable than the average-referee baseline. The market often does not adjust fully for referee assignment.

## Weather Effects

Football in heavy rain:
- Goals per match drops by approximately 0.1–0.2 on average
- Over/Under total goals markets affected more than 1X2 markets
- Teams that play a ground-based possession game are disadvantaged vs direct/physical teams

Wind specifically affects:
- Corners (more corners in high-wind conditions)
- Shot accuracy (distance shooting less accurate)
- Long ball effectiveness (changes with wind direction)

## Pitch and Venue Effects

- Artificial turf vs natural grass: certain teams have documented performance differentials
- Tight stadiums with close crowd support: home advantage amplified for some teams
- Altitude effects in international fixtures: teams from high-altitude nations have documented advantages when playing at altitude

## Building an Environmental Data Advantage

Collect referee assignments, weather forecasts, and venue conditions for every match in your target leagues. Build lookup tables of historical performance modifiers for each factor. Apply these as systematic adjustments on top of your base team rating model.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Temporal Inefficiencies: When Markets Are Least Efficient', 'temporal-inefficiencies',
'## Time-Based Market Patterns

Markets do not stay equally efficient throughout the week. The timing of your analysis and bet placement relative to market opening has a significant impact on the prices available.

## Opening Lines: Maximum Inefficiency

The opening line is set by the bookmaker''s model with limited external correction. It represents the bookmaker''s best estimate plus a margin. If the model has errors, they are most visible — and accessible — in the opening line.

Window: 1–48 hours after market opens. Sharp money flows in and corrects pricing within hours for liquid markets; days for lower-profile events.

**Strategy:** For each market you follow, compare opening line to your model immediately on opening. Act fast on large discrepancies.

## News Impact Windows

When significant news breaks (injury confirmation, lineup announcement, weather change), the market takes time to reprice. The window between news and full market adjustment is typically:
- Major injury to a top player: 5–20 minutes for sharp books; 30–90 minutes for soft books
- Full team lineup release: 15–30 minutes for liquid markets

**Strategy:** Set news alerts, have your model ready to produce an updated probability immediately on news receipt. Pre-calculate what your model would say for specific scenarios ("if Salah is out, what is my revised probability?").

## Weekend vs Weekday Patterns

Research indicates slightly higher inefficiency in weekday evening fixtures — lower liquidity, less analyst attention, faster news cycles. Soft book lines in weekday fixtures are often less refined than weekend equivalents.

## Pre-Season and Early-Season Pricing

Market models calibrated to last season struggle at the start of a new season. New signings, new managers, promoted/relegated teams — all create noise in models with insufficient new data. Early-season prices for recently changed squads can be significantly mispriced.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Exploiting Niche Market Inefficiencies', 'exploiting-niche-market-inefficiencies',
'## The Liquidity-Efficiency Trade-Off

A fundamental trade-off exists in betting markets: high-liquidity markets are more efficient (harder to beat) but accommodate larger stakes. Low-liquidity markets are less efficient (easier to beat) but limit how much you can bet.

## Defining "Niche"

Niche markets include:
- Lower-division football (Leagues One/Two, Championship in non-top nations)
- Women''s football and basketball
- Esports betting markets
- Minor tennis tournaments (Challengers, ITF events)
- Non-English-speaking leagues underrepresented in global modelling data

## Why Niche Markets Are Less Efficient

1. Fewer data points (less match history for modelling)
2. Less analyst coverage (fewer sharp bettors checking prices)
3. Less sophisticated bookmaker models (lower investment in niche market pricing)
4. Information asymmetry (a local expert has significantly better information than a global algorithm)

## The Local Expert Advantage

If you have deep domain knowledge of a specific niche — watching every match in a specific lower-division league, knowing coaching staff personally, understanding training ground culture — you have an information advantage that is impossible to replicate at scale.

This is the most sustainable form of edge: specialised knowledge that global markets cannot efficiently price.

## Liquidity Management in Niche Markets

Niche markets limit stake sizes. A market with £5,000 total matched cannot absorb your £2,000 bet without destroying the price. Operational strategies:
- Spread stakes across multiple bookmakers for the same selection
- Use smaller stakes that do not materially move the market
- Prioritise exchange + soft book combination for maximum total liquidity

## Scaling Niche Operations

The niche expert who validates their edge can scale by: expanding the number of niche markets covered (new leagues, new sports), training a team of niche analysts, or licensing their insights to a larger operation.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Tracking and Measuring Inefficiency Exploitation', 'tracking-measuring-inefficiencies',
'## From Discovery to Validated Edge

Identifying a potential inefficiency is the beginning, not the end. The discipline is in validating the inefficiency rigorously before betting significant capital on it.

## The Research Protocol

**Phase 1 — Hypothesis:** State a specific, falsifiable inefficiency claim.
**Phase 2 — Historical test:** Backtest on 300+ qualifying events. Calculate Z-score and CLV estimate.
**Phase 3 — Paper trade:** Forward-test for 3 months (or 100 qualifying events) without real money to check out-of-sample performance.
**Phase 4 — Small stake live:** Bet 20% of intended stake for 3 more months.
**Phase 5 — Full deployment:** Scale to intended stake if Phases 3–4 confirm the inefficiency.

## Measuring Success at Each Phase

At Phase 2: Z-score > 2.0, minimum. Prefer > 2.5.
At Phase 3: Out-of-sample CLV > 0% (positive is encouraging; negative suggests overfit in Phase 2).
At Phase 4: Live CLV directionally consistent with Phase 2/3.
At Phase 5: Ongoing monthly CLV monitoring with erosion alert at CLV < 0% for rolling 60 days.

## The Failure Mode to Detect

The most common failure: a backtested inefficiency that does not replicate out-of-sample. This means the backtest discovered noise, not signal. The Phase 3 paper-trade exists specifically to catch this.

## The Erosion Problem

Even valid inefficiencies erode. As more sharp bettors discover the same pattern, the market corrects. The half-life of a discovered betting inefficiency is typically 2–5 years. Monitor continuously and develop new inefficiencies before old ones close.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Cross-Sport Inefficiency Research', 'cross-sport-inefficiency-research',
'## Why Sports Differ in Market Efficiency

The depth of academic research, the sophistication of bookmaker models, and the density of sharp bettor attention vary enormously across sports. This creates dramatically different efficiency levels by sport.

## Relative Market Efficiency by Sport (Approximate Ranking)

Most efficient (hardest to beat):
1. NFL (US — highest liquidity, massive analytical community, decades of data)
2. Premier League football (massive global betting volume, highly studied)
3. NBA (huge market, sophisticated analytics community)
4. Tennis major tournaments (ATP/WTA Top 100, very liquid)

Less efficient (more opportunity):
5. Bundesliga, La Liga, Serie A (efficient but less scrutinised than EPL)
6. Championship football (surprisingly under-modelled relative to liquidity)
7. Minor tennis (Challengers, ITF)
8. Lower-division football (local knowledge advantage significant)
9. Non-mainstream sports (rugby union lower divisions, ice hockey lower leagues)

Most inefficient (niche opportunity):
10. Esports, emerging sports, women''s leagues in markets where bookmakers have thin models

## Research Cross-Pollination

Methods that work in football often have direct analogues in other sports:
- xG in football → shot quality models in hockey
- Elo ratings in football → Elo in tennis, basketball
- Situational motivation analysis applies across all sports

If you have developed a working methodology in one sport, test analogous hypotheses in a less-efficient sport before assuming the idea is unique to one discipline.

## The Emerging Market Opportunity

New betting markets (esports, emerging leagues, new sports) start maximally inefficient. Early entry before the market matures captures the highest returns — but requires highest tolerance for model uncertainty and limited historical data.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building an Inefficiency Research Programme', 'building-inefficiency-research-programme',
'## From Individual Bets to an R&D Operation

The highest-performing betting operations treat inefficiency discovery as a continuous research programme — not a one-time insight.

## The Research Pipeline

**Idea generation:** Broad observation of markets, academic literature review, peer discussion, automated pattern detection in historical data.

**Prioritisation:** Score ideas by expected effect size, testable sample availability, and operational feasibility. Focus research effort on highest-priority ideas.

**Validation:** Apply the 5-phase protocol from Lesson 8. Only graduate ideas to full deployment that survive out-of-sample testing.

**Deployment:** Scale with managed stake progression. Monitor CLV monthly.

**Deprecation:** Close positions and retire research tracks when 90-day rolling CLV drops below zero after sufficient sample.

## Academic Literature as a Starting Point

Sports betting research is published in economics and statistics journals. Key papers to review:
- Forrest & Simmons (2000) on home advantage and market efficiency in football
- Levitt (2004) on the structure of bookmaker pricing
- Dixon & Coles (1997) on the Poisson model correction for football
- Various papers on the favourite-longshot bias across sports

Academic findings are often 5–10 years old — the market has often corrected by the time they are published. Use them as hypothesis generation tools, not as active trading signals.

## The Team Advantage

A single analyst has limited research capacity. A team of 3–5 analysts, each specialising in different sports or methodologies, can run a much richer research pipeline. The efficiency gains of specialisation apply to betting research exactly as in any other analytical field.

## The Knowledge Moat

Deep, validated, proprietary research produces durable edge. Unlike a price discrepancy (which disappears in seconds), a research-based edge takes competitors months or years to replicate. This is why the highest-performing operations invest heavily in research — it is their sustainable competitive advantage.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'market-inefficiencies-deep-dive' AND cat.slug = 'probability-and-value';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — Building a Predictive Edge                  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Anatomy of a Predictive Edge', 'anatomy-of-predictive-edge',
'## What "Edge" Actually Means

In betting, edge is the advantage you have over the market — the consistent ability to estimate outcome probabilities more accurately than the prices offered.

Edge is not:
- A good tip you received
- A gut feeling about a team
- A system that worked last month

Edge is a statistically validated, measurable probability estimation advantage that persists over hundreds of bets.

## The Three Types of Edge

**1. Information edge:** You have information the market does not have. This is the rarest and most valuable form — and the only one that delivers immediate edge without needing a better model.

**2. Processing edge:** You have the same information as the market but process it more accurately. Better statistical models, better contextual weighting, better calibration.

**3. Execution edge:** You access better prices than the market average through line shopping, timing, and account management. This amplifies any existing edge without generating it.

## Why Most Bettors Have No Edge

Most bettors have:
- The same public information as everyone else (no information edge)
- No validated probability model (no processing edge)
- A single bookmaker account at above-average margin (no execution edge)

The combination produces consistent losses. Developing genuine edge requires deliberate investment in at least one of the three types.

## Building Edge Is a Project, Not an Insight

A single insight ("this team is undervalued") is not edge. Edge is a systematic, repeatable, validated advantage. Building it takes months or years of data collection, model development, and out-of-sample validation.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Data Strategy for Predictive Betting', 'data-strategy-predictive-betting',
'## Data Is the Foundation

You cannot build a better model than the market without better or more intelligently used data. Your data strategy — what you collect, how you clean it, and how you store it — determines the ceiling of your modelling capability.

## Essential Data Sources for Football

**Match-level:**
- Historical results (goals, shots, possession) — freely available from multiple sources
- xG (Expected Goals) — StatsBomb (open for some data), FBref, understat.com
- Lineups and substitutions — free from club/league official sources

**Player-level:**
- Individual xG, xA (expected assists), key passes — FBref, Sofascore, WhoScored
- Player workload and injury history — injury tracking sites, club announcements

**Contextual:**
- Odds history (opening and closing) — OddsPortal, Football-Data.co.uk
- Head-to-head records — direct from league databases
- Referee assignments — league official sites

## Building Your Database

Use a relational database (PostgreSQL or SQLite) to store historical data. Schema:
- matches (match_id, date, home_team_id, away_team_id, home_goals, away_goals, home_xg, away_xg, ...)
- teams (team_id, name, league_id, ...)
- odds (match_id, bookmaker_id, market_type, opening_price, closing_price, ...)
- lineups (match_id, team_id, player_id, minutes_played, ...)

## Data Quality Control

Before any modelling, check:
- Missing values: matches with null xG data
- Duplicate entries: same match recorded twice
- Outliers: implausible xG values (above 4 for a team is exceptional)
- Date range coverage: is the data complete for the seasons you need?

## Automation

Set up automated data fetching (Python scripts with scheduled runs) from your chosen sources. Manual data collection introduces errors and is not sustainable at scale.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Feature Engineering for Betting Models', 'feature-engineering-betting-models',
'## Turning Raw Data into Predictive Features

A machine learning model is only as good as the features you give it. Feature engineering — transforming raw data into informative inputs — is where most of the value is created in sports betting models.

## Core Feature Categories

**Team Strength (Trailing Performance)**
- Rolling xG per match (last 5, 10, 20 matches) — exponentially decayed
- Rolling xG conceded per match
- Rolling points per game vs adjusted opponent strength
- Rolling shots on target percentage

**Form and Momentum**
- Points from last 5 matches (simple and weighted by opponent)
- Win/draw/loss streak
- Goal difference in last 5 matches

**Head-to-Head**
- Historical result distribution in this specific fixture
- Average goals in this fixture

**Contextual**
- Rest days (days since last match)
- Travel distance (km)
- Is this a cup match? League position pressure?
- Weather score (composite of temperature, wind, rain)

**Odds-Derived**
- Opening Pinnacle price (de-vigged probability)
- Market movement indicator (opening price vs current price)

## The Most Predictive Features (Research-Backed)

In football, the strongest predictors of match outcomes are:
1. Trailing xG differential (last 10 matches, opponent-adjusted)
2. Current Pinnacle closing price (the market''s collective estimate)
3. Home/away indicator
4. Rest differential

Features 1 and 3 are within your control to build. Feature 2 is the market benchmark — if your model can predict outcomes better than this single feature, you have genuine processing edge.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Model Selection and Evaluation', 'model-selection-evaluation',
'## Choosing the Right Model Architecture

The choice of model matters less than the quality of your features and the rigour of your evaluation. That said, certain architectures perform better for sports prediction.

## The Hierarchy of Complexity

**Baseline: Logistic Regression**
Simple, interpretable, fast. Benchmark every complex model against logistic regression. If LR performs similarly, the complex model is adding computational cost without predictive benefit.

**Intermediate: Gradient Boosting (XGBoost, LightGBM)**
The workhorse of sports betting ML. Handles non-linear interactions, missing values, and categorical features. Produces well-calibrated probabilities with isotonic regression calibration. Typically outperforms LR on features with non-linear effects.

**Advanced: Neural Networks**
Valuable when sequence data (in-match event streams) is available. For match-level prediction, usually underperforms gradient boosting without significantly more data.

**Domain-specific: Dixon-Coles Poisson**
For football, a properly calibrated Poisson model often outperforms generic ML approaches because it encodes domain knowledge (goal-scoring as a Poisson process) that ML must learn from data.

## Cross-Validation Strategy

Time-series data requires temporal cross-validation — you cannot use future data to train a model predicting past events.

Use walk-forward validation: train on seasons 1–3, test on season 4. Then train on seasons 1–4, test on season 5. Repeat. Average the test-set performance across all folds.

## Model Evaluation Metrics

- **Brier Score:** Overall probability calibration
- **Log Loss:** Penalises confident wrong predictions heavily
- **CLV proxy:** For each test match, calculate (model probability − Pinnacle closing de-vigged probability) — positive mean = model beats market
- **AUC-ROC:** Discrimination ability (can the model rank outcomes correctly)

The CLV proxy is the most directly useful: it tells you whether your model would generate positive CLV in practice.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Backtesting Without Overfitting', 'backtesting-without-overfitting',
'## The Overfitting Danger

Overfitting occurs when a model learns the specific noise of the training data rather than the underlying signal. An overfit model performs excellently on historical data and poorly on new data.

Overfitting is the single most common reason that a backtested betting system fails in live deployment.

## Why Sports Betting Data Is Especially Vulnerable

- **Small dataset:** Even 10 seasons of Premier League data is only ~380 matches per season × 10 = 3,800 observations. Many ML models can overfit this easily.
- **Many features:** With 50+ features and 3,800 observations, feature selection becomes critical.
- **Non-stationarity:** Football tactics, player quality distributions, and market efficiency change over time, making historical patterns less predictive of future results.

## Preventing Overfitting

**1. Feature selection:**
Use domain knowledge to pre-select features. Do not include hundreds of features and let the model pick — this amplifies overfitting risk. Start with 10–15 domain-justified features.

**2. Regularisation:**
L1 and L2 regularisation in logistic regression and gradient boosting penalise model complexity. Tune the regularisation parameter using cross-validation.

**3. Temporal separation:**
Never train on data from the period you are testing on. Maintain a holdout test set from the last 1–2 seasons that you never touch during development.

**4. The simplest model that works:**
Occam''s Razor applies. A model with 8 features that achieves 90% of a 50-feature model''s performance is the better model — it is more likely to generalise.

## The Out-of-Sample Reality Check

Before going live, compare your model''s test-set CLV proxy to zero. If it is indistinguishable from zero after temporal cross-validation, the model is not ready. If it is positive and statistically significant, proceed to a paper-trade phase.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Integrating Your Model with Live Operations', 'integrating-model-live-operations',
'## From Jupyter Notebook to Live Betting Tool

A model that lives in a notebook is not a betting tool — it is a research artefact. Converting your model to an operational tool requires engineering discipline that many analyst-bettors underestimate.

## The Operational Requirements

**Automated data refresh:**
- New match data must flow into the database within hours of match completion
- Team news and lineup data must be ingested as it becomes available
- Odds data must be updated in real time or near-real time

**Prediction pipeline:**
- For each upcoming fixture, automatically run the model and generate probability estimates
- Apply contextual adjustments (injuries, rest) to the model output
- Compare to live bookmaker prices and flag bets above the EV threshold

**Alert system:**
- When a match crosses the EV threshold, trigger an immediate alert
- Include: selection, model probability, best available price, estimated CLV, suggested stake

**Record keeping:**
- Every bet placed by the system is automatically logged with all relevant metadata
- Every prediction is stored (even for events you did not bet) for ongoing calibration tracking

## Latency and Reliability

The prediction pipeline must run reliably. A system that fails 20% of the time misses 20% of your opportunities — and may miss them disproportionately (system failures might correlate with high-volume periods).

Use cloud scheduling (a daily cron job on AWS or GCP), not a script that requires manual execution.

## Version Control

Every model version and every prediction should be tracked in version control. When you update the model in 6 months, you need to be able to reconstruct exactly which model version generated each historical prediction for accurate backtesting of the updated model.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Edge Maintenance: Keeping Up with a Moving Market', 'edge-maintenance-moving-market',
'## Markets Improve. Your Edge Erodes.

The betting market is not static. Every year, more sophisticated models are used by more bookmakers. More sharp bettors enter the market. Academic research on pricing inefficiencies is published and acted upon. The result: edges that existed three years ago are smaller or gone today.

## The Erosion Timeline

Most systematically identified edges follow a pattern:
1. **Discovery:** A specific inefficiency is identified and produces strong returns (years 1–2)
2. **Maturity:** The edge is partially known; returns are positive but shrinking (years 2–4)
3. **Saturation:** Widespread knowledge of the inefficiency has corrected the market; edge approaches zero (years 4+)

This timeline varies: niche market edges erode more slowly (fewer participants find them); major market inefficiencies erode faster.

## The Required Investment in Edge Renewal

A professional betting operation continuously invests in research to develop new edges ahead of current edge erosion. The lead time: you should begin researching the replacement edge when the current one is at peak performance — not when it has already deteriorated.

## Leading Indicators of Edge Erosion

- Monthly CLV trend: if 12-month CLV trajectory is declining, investigate
- Market response time: if the market is correcting your target opportunities faster than it used to, your edge is being discovered
- Opening line quality: if the opening lines in your target markets are becoming more accurate (less frequently correctable), the bookmakers'' models are improving

## The Adaptation Strategy

Identify your edge''s current life cycle stage. If approaching saturation:
1. Begin research programme in adjacent, less-efficient markets
2. Investigate deeper contextual factors within the current market
3. Explore automated approaches to find edges your manual research misses',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Collaborative Edge: Syndicates and Knowledge Networks', 'collaborative-edge-syndicates',
'## Why Individual Edges Have a Ceiling

A single analyst has limited research capacity, limited capital to deploy, and limited market access. A collaborative structure — a syndicate or knowledge network — amplifies all three.

## The Syndicate Model

A betting syndicate pools capital and expertise:
- Multiple analysts contribute models and research
- A central fund manager allocates bankroll across validated edges
- Stakes are larger, enabling higher returns on the same edge

The syndicate model works because: (1) capital scales better than edge — a 3% edge at £100,000 bankroll generates 10× more absolute profit than the same edge at £10,000; (2) analytical diversity reduces model error.

## The Knowledge Network Alternative

Less formal: a group of independent bettors who share research, validate each other''s models, and discuss market observations — without pooling capital. Each member benefits from collective intelligence while maintaining independent operation.

**Benefits:** Peer review of models catches systematic errors. Diverse analytical approaches provide cross-validation. Group monitoring of market changes provides earlier warning of edge erosion.

**Risks:** Intellectual property concerns (research is valuable; sharing has costs). Coordination overhead. Free-rider problems in informal structures.

## Managing Information Asymmetry in Syndicates

The primary tension: the most valuable research has the most impact when kept private. Syndicates solve this by making research exclusive to members and creating alignment of incentives (shared profit creates shared motivation to contribute quality research).

## The Track Record as Social Capital

In collaborative betting environments, your track record (documented CLV, validated results) is your currency. A documented track record opens doors to capital, partnerships, and knowledge networks that are inaccessible to unvalidated newcomers.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Full Expert Framework: Predictive Edge in Practice', 'full-expert-predictive-framework',
'## The Integrated Expert System

A complete predictive edge operation integrates: data infrastructure, feature engineering, modelling, validation, live deployment, performance monitoring, and edge renewal. This lesson maps the full system.

## Infrastructure Layer

- **Database:** PostgreSQL with match, player, odds, and lineup tables, updated daily
- **Data pipelines:** Automated ETL scripts running on cloud infrastructure
- **Model repository:** Version-controlled codebase with full model history
- **Alert system:** Automated bet flagging with estimated CLV, stake recommendation, and best available price

## Analytical Layer

- **Base model:** Calibrated gradient boosting model with 15 domain-justified features
- **Contextual adjustment module:** Rule-based adjustments for injuries, rest, motivation (validated individually against historical data)
- **Calibration tracker:** Monthly Brier score and calibration curve review
- **Market benchmark:** Daily CLV calculation against Pinnacle closing for all predictions

## Operational Layer

- **Account portfolio:** 12 active accounts across sharp, mid, and soft tiers, with health status tracked
- **Execution protocol:** Within 30 minutes of flag, confirm news, place bet, log result
- **Bankroll management:** Fractional Kelly (33%) based on modelled EV, with bankroll reviewed weekly

## Review Layer

- **Weekly:** CLV summary, P&L vs expected P&L, open position review
- **Monthly:** Full calibration test, market efficiency review, edge erosion check
- **Quarterly:** Model performance vs benchmark, feature importance update, research pipeline review

## The Defining Characteristic

What separates this expert operation from an amateur betting approach is not intelligence or inside information — it is systematic process applied with unwavering discipline over years. The compounding of process quality — each small improvement building on the last — is what produces sustainable profitability in a market where most participants lose.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Professional Bettor''s Career Arc', 'professional-bettor-career-arc',
'## From Learner to Expert: The Stages

Understanding the career arc of a professional bettor provides a realistic roadmap — and prevents the common mistake of skipping foundational stages in pursuit of quick profit.

## Stage 1: The Foundation (Months 1–6)

Focus: Master probability, EV, and market mechanics. No serious betting yet.
Activities: Study, paper-trade, track CLV on small bets.
Goal: Understand the mathematics of betting deeply enough to explain them clearly.

## Stage 2: The System Builder (Months 6–18)

Focus: Build and validate a first model or systematic approach. Small, consistent stakes.
Activities: Data collection, model development, first real CLV tracking.
Goal: Produce 300+ bets of positive CLV data in a specific, defined market.

## Stage 3: The Disciplined Operator (Years 2–3)

Focus: Scale validated edge carefully. Optimise execution, account portfolio, and staking.
Activities: System refinement, account management, research programme launch.
Goal: Consistent quarterly positive CLV with stable bankroll growth.

## Stage 4: The Professional (Years 3+)

Focus: Diversify across multiple validated edges and markets. Potentially involve external capital.
Activities: Syndicate formation, research team development, edge renewal as current edges mature.
Goal: A sustainable business-level operation producing consistent risk-adjusted returns.

## The Honest Assessment

Most bettors never reach Stage 3. Not because they lack intelligence but because they skip Stage 1 and 2 — they jump directly to betting without building the foundation. This course exists to provide that foundation clearly, so that bettors who choose to pursue serious betting do so with the complete mathematical and operational understanding required.

The goal is not to produce professional bettors — most readers will not pursue this path. The goal is to ensure that every person who bets understands the framework well enough to bet responsibly, with clear eyes about the edge they have (or do not have), the variance they face, and the process they need.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-a-predictive-edge' AND cat.slug = 'probability-and-value';
