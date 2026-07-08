-- ============================================================
-- PunterStat — Betting Academy: Statistical Thinking Expansion
-- Migration 035: Expand 2 existing modules to 10 lessons each
--   • sample-size-and-variance   — add lessons 3–10
--   • regression-to-the-mean     — add lessons 3–10
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Sample Size and Variance                    ║
-- ║  Existing: 2 lessons (sort_order 1–2)                   ║
-- ║  Adding: lessons 3–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How Much Data Is Enough?', 'how-much-data-is-enough',
'## The Perennial Question

"How many bets do I need before my results are meaningful?" This question is central to every betting operation. The answer depends on the size of the edge you are trying to detect.

## The Signal-to-Noise Problem

A small edge (2% ROI) is harder to detect in a noisy dataset than a large edge (8% ROI). The required sample size to distinguish real edge from random variance scales with the square of the edge — smaller edges require much larger samples.

## A Practical Guide to Sample Size Requirements

For a 5% significance level (95% confidence) to detect a true edge:

| True Edge (ROI) | Required Bets |
|---|---|
| 8% | ~150 bets |
| 5% | ~350 bets |
| 3% | ~950 bets |
| 2% | ~2,100 bets |

A typical professional bettor targeting 3% ROI needs approximately 1,000 bets before they can be reasonably confident their results are not pure luck.

## Why Most Bettors Misread Their Results

After 200 bets with 4% ROI, many bettors conclude they have "proven" their edge. Statistically, 200 bets at 4% ROI is consistent with both genuine 4% edge AND zero edge with lucky variance. The confidence interval is too wide to conclude anything.

## The CLV Shortcut

Closing Line Value (CLV) requires smaller samples to detect genuine edge than results-based ROI. This is because CLV directly measures market position (did you beat the closing price?) rather than outcomes (did the selection win?). 200 bets of consistently positive CLV is meaningful evidence; 200 bets of positive ROI is not.

## The Practical Approach

- Track CLV from bet 1 (meaningful early signal)
- Track ROI but do not interpret it until 500+ bets
- Do not change strategy based on short-sample results (either direction)',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Standard Deviation and Betting Variance', 'standard-deviation-betting-variance',
'## Measuring Uncertainty

Standard deviation (σ) is the primary measure of variability in betting results. It tells you how widely individual results are dispersed around the mean.

## Calculating Betting Variance

For a series of n bets, each with profit p_i:

Mean (μ) = Σp_i / n
Variance (σ²) = Σ(p_i − μ)² / (n − 1)
Standard deviation (σ) = √σ²

For a simple binary bet (win or lose) at decimal odds d with probability p:
σ_per_bet ≈ √(p(1−p)) × d (approximate)

## The Variance of Different Bet Types

**Even-money bets (2.00 odds):** Low variance. Each bet is +1 or −1. σ ≈ 1 unit per bet.
**Long odds bets (10.00 odds):** High variance. Each bet is +9 or −1. σ ≈ 3 units per bet.
**Accumulators:** Very high variance. Four-fold accumulator at 16.00 has σ ≈ 3.9 units per leg.

## The 68-95-99.7 Rule

For normally distributed returns (approximately valid for large samples):
- 68% of monthly totals fall within ±1 standard deviation of the mean
- 95% fall within ±2 standard deviations
- 99.7% fall within ±3 standard deviations

**Example:** 100 bets/month, 0.05 units average profit, σ = 10 units:
- 95% of months: profit between −19.9 and +20.1 units
- A 15-unit losing month is within normal variance: no action required

## Why This Matters

Most bettors react to monthly results as if they are precise performance signals. Understanding standard deviation reveals that monthly results are extremely noisy. A strategy with genuine 3% ROI will have many losing months — this is not failure, it is variance.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Confidence Intervals for Betting Performance', 'confidence-intervals-betting',
'## What a Confidence Interval Tells You

A 95% confidence interval for your ROI gives the range within which your true ROI almost certainly falls, given your observed results. It quantifies how uncertain your performance estimate is.

## The Formula

For n bets, observed ROI r, and standard error SE:

SE = σ / √n

95% CI = r ± 1.96 × SE

Where σ is the standard deviation of your per-bet returns.

## A Worked Example

After 300 bets: observed ROI = +3.5%, σ = 1.0 unit per bet (typical even-money betting)

SE = 1.0 / √300 = 0.0577 units = 5.77% (per unit staked)

95% CI = 3.5% ± 1.96 × 5.77% = 3.5% ± 11.3% = [−7.8%, +14.8%]

Interpretation: "My true ROI is between −7.8% and +14.8% with 95% confidence." The confidence interval includes zero — so at 300 bets, you cannot rule out zero edge.

## Using Confidence Intervals Operationally

Run a confidence interval calculation at every 100-bet milestone. Track how the interval narrows as the sample grows. Only begin scaling stakes when the 95% CI lower bound is above 0% (the entire interval is positive).

This is the statistical test that distinguishes validated edge from lucky variance.

## The Upper Bound Information

The upper bound of the CI is also informative: "My true ROI is probably not higher than X%." This constrains the maximum expected return and prevents overconfident scaling based on hot streaks.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Poisson Distribution in Sports Modelling', 'poisson-distribution-sports',
'## Why Poisson Fits Rare Events

The Poisson distribution models the probability of a given number of events occurring in a fixed interval, when events are rare, independent, and random. Football goals fit these criteria surprisingly well.

## The Poisson Formula

P(X = k) = (e^(−λ) × λ^k) / k!

Where:
- λ = expected number of goals (e.g. 1.5 for a team in a match)
- k = the number of goals you want the probability for
- e ≈ 2.718

**Example:** Team A expected goals = 1.5. What is the probability they score exactly 2?

P(X = 2) = (e^(−1.5) × 1.5²) / 2! = (0.2231 × 2.25) / 2 = 0.2510 = 25.1%

## Building a Full Goals Distribution

For a match where Team A expects 1.3 goals and Team B expects 1.1 goals:

Compute P(A scores 0, 1, 2, 3, 4+) using Poisson with λ = 1.3
Compute P(B scores 0, 1, 2, 3, 4+) using Poisson with λ = 1.1

For every score combination (A=0, B=0), (A=0, B=1), ..., multiply the independent probabilities:
P(A=1, B=0) = P(A scores 1) × P(B scores 0)

Sum all score combinations where A > B for home win probability. Sum all A < B for away win. Sum all A = B for draw.

## The Limitations of Poisson

- Poisson assumes goals are independent — but a goal changes match dynamics (teams often park the bus or push forward), which violates the independence assumption
- Dixon-Coles correction adjusts for the underestimation of 0-0 and 1-0/0-1 scorelines
- For extended coverage, use bivariate Poisson which captures goal correlation between teams',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Simulating Betting Runs: The Monte Carlo Method', 'monte-carlo-betting-simulation',
'## What Monte Carlo Simulation Does

Monte Carlo simulation uses random sampling to model the distribution of possible outcomes from a repeated process. For betting: it simulates thousands of possible betting records given your edge and variance, producing a distribution of possible results.

## Why Run Monte Carlo Simulations?

Before experiencing a 20-unit losing run, you should know:
- What is the probability of a 20-unit losing run in my strategy?
- How long could a losing run plausibly last?
- What is my expected maximum drawdown over 1,000 bets?

Monte Carlo answers these questions from first principles — before the events occur.

## A Simple Monte Carlo Setup

**Inputs:** Edge (ROI), bet frequency, odds distribution, number of simulations

**Process:**
For each simulation (1,000 iterations):
  For each bet in the simulation (1,000 bets):
    Generate a random draw (win/lose based on probability)
    Calculate profit/loss
    Update running total
  Record: final profit, maximum drawdown, longest losing run

**Output:** Distribution of final profits, drawdown distribution, losing run distribution

## Interpreting the Results

After 10,000 simulations of 1,000 bets at 3% ROI:
- 5th percentile final profit: −8 units (unlucky scenario)
- 50th percentile: +30 units (median scenario)
- 95th percentile: +68 units (lucky scenario)
- 95th percentile maximum drawdown: 32 units

This tells you: in the worst 5% of scenarios, you will still be profitable at 1,000 bets (−8 units is a loss, but within risk limits). And your stop-loss should be set at 30+ units to avoid triggering it in normal variance scenarios.

## Tools for Monte Carlo

- Excel: RAND() function with IF statements for win/loss simulation
- Python: NumPy random module with a simple loop
- R: runif() and custom function
- Online tools: several free betting variance simulators (e.g. Luck vs Skill by Pyckio)',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Hypothesis Testing for Bettors', 'hypothesis-testing-bettors',
'## Formal Statistical Testing

Hypothesis testing provides a formal framework for deciding whether observed results are likely due to genuine edge or random chance.

## The Null Hypothesis Setup

**H₀ (null hypothesis):** My strategy has no edge (ROI = 0%).
**H₁ (alternative hypothesis):** My strategy has positive edge (ROI > 0%).

We assume H₀ is true and calculate the probability of seeing results at least as extreme as we observed. If this probability (the p-value) is below our significance threshold (typically 5%), we reject H₀.

## The t-Test for Betting

For n bets with mean return μ and standard deviation σ:

t = (μ − 0) / (σ / √n) = μ√n / σ

For n = 500, μ = 0.03 (3% ROI), σ = 1.0:
t = 0.03 × √500 / 1.0 = 0.03 × 22.36 = 0.671

With 499 degrees of freedom, t = 0.671 corresponds to p ≈ 0.25. We cannot reject H₀ (p > 0.05).

At n = 1,000: t = 0.03 × √1,000 / 1.0 = 0.949. p ≈ 0.17. Still not significant.

At n = 5,000: t = 0.03 × √5,000 / 1.0 = 2.12. p ≈ 0.02. Now we can reject H₀ at 5% significance.

## The Implication

A genuine 3% edge requires approximately 5,000 bets to reach statistical significance at p < 0.05. This is far more bets than most people place before making strategy decisions.

The practical response: use CLV (shorter-sample validation) alongside results (longer-sample validation). Do not claim statistically significant ROI before the sample supports it.

## Type I and Type II Errors

Type I error: concluding you have edge when you do not (false positive).
Type II error: concluding you do not have edge when you do (false negative).

Setting a strict significance threshold (p < 0.01 instead of 0.05) reduces Type I errors but increases Type II errors. Choose the threshold based on the cost of each error type.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Variance Across Different Betting Styles', 'variance-different-betting-styles',
'## How Strategy Choice Affects Variance

Two bettors with identical expected ROI can experience very different variance profiles based on their market choices. Understanding this allows deliberate variance optimisation.

## The Variance Spectrum

**Low-variance betting:**
- Even-money markets (1X2 on strong favourites, AH at −0.25)
- High bet frequency (50+ bets/month)
- Small edge per bet, many bets

Characteristic: smooth equity curve, tight confidence interval that narrows quickly, lower maximum drawdown.

**High-variance betting:**
- Long-odds markets (5.00+, outright winners)
- Low bet frequency (5–10 bets/month)
- Large edge per bet, few bets

Characteristic: volatile equity curve, wide confidence interval that narrows slowly, higher maximum drawdown.

## Calculating Your Portfolio Variance

Portfolio variance = Σ wᵢ² σᵢ² (for independent bets)

Where wᵢ = stake as fraction of bankroll, σᵢ = standard deviation per bet type.

If you mix 70% even-money bets (σ = 1) and 30% 4.00 bets (σ = 2):
Portfolio σ² = (0.70)² × 1² + (0.30)² × 2² = 0.49 + 0.36 = 0.85
Portfolio σ = 0.92 (lower than pure 4.00 betting, slightly lower than pure even-money)

## The Variance-Return Tradeoff

Higher-odds bets with the same EV produce higher expected value per bet (because Kelly stakes are lower but the return when winning is larger) — but also produce much wider variance bands.

For bankroll management purposes, lower-odds markets are generally preferable for the same EV% because:
- Confidence interval narrows faster (validates edge sooner)
- Maximum drawdown is smaller (more psychologically sustainable)
- Ruin risk is lower (smaller stakes as % of bankroll per Kelly)',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Statistical Literacy: The Complete Framework', 'expert-statistical-literacy',
'## The Statistically Literate Bettor

Statistical literacy in betting means: the ability to correctly interpret data, recognise what conclusions the data supports, and identify what additional data would change those conclusions.

## The Five Core Statistical Competencies

**1. Sample size intuition:**
Knowing at a glance whether a sample is large enough to support a conclusion. 100 bets: no. 500 bets: marginal. 1,000+ bets with consistent CLV: meaningful.

**2. Variance comprehension:**
Understanding the expected range of outcomes for your strategy and accurately categorising any specific result as within-range (variance) or outside-range (signal). Applying Monte Carlo simulation before experiencing extremes.

**3. Distribution thinking:**
Modelling outcomes as probability distributions, not point predictions. Using Poisson for goals, binomial for match outcomes, normal approximation for portfolio P&L.

**4. Significance testing:**
Applying statistical tests correctly and interpreting p-values accurately. Knowing when results are statistically significant and when they are not — regardless of how they feel.

**5. Calibration measurement:**
Systematically measuring probability estimate accuracy against outcomes. Identifying and correcting systematic biases in probability assessment.

## The Annual Statistical Review

Each year, conduct a formal statistical review of the operation:
- Calculate the 95% confidence interval for annual ROI
- Test each strategy separately for statistical significance
- Run the calibration graph analysis
- Update the Monte Carlo model with the year''s actual variance data
- Compare actual maximum drawdown to simulated expected maximum drawdown

## The Competitive Advantage of Statistical Literacy

In a market populated primarily by intuitive bettors, statistical literacy is a genuine differentiator. It allows:
- Faster, more accurate edge validation (via CLV)
- Better-calibrated probability estimates (via calibration analysis)
- More appropriate staking (via variance-adjusted Kelly)
- More resilient psychology (via accurate variance expectations from Monte Carlo)

These advantages compound over years into a significant performance advantage over the statistically naive bettor.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'sample-size-and-variance' AND cat.slug = 'statistical-thinking';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — Regression to the Mean                      ║
-- ║  Existing: 2 lessons (sort_order 1–2)                   ║
-- ║  Adding: lessons 3–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Win Rate Regression: Teams That Outperform xG', 'win-rate-regression-xg',
'## The Overperforming Team Problem

A team finishes the first 10 matches of the season with 8 wins, a +15 goal difference, and a top-table position. The market prices them as genuine title contenders.

But their xG data tells a different story: they have scored 12 goals on just 8 expected goals (150% conversion), and their goalkeeper has made 6 saves rated in the top 5% for difficulty. They are significantly outperforming their underlying performance.

## The Statistical Expectation

Teams that significantly outperform their xG in one period are expected to revert toward their xG performance in the next period. This is regression to the mean — not because the team "gets worse" but because the lucky components (high conversion, exceptional saves) do not sustain.

## Quantifying the Regression

Research on football performance data shows:
- Goal conversion rates in excess of xG predict lower conversion in subsequent matches with 60–70% frequency
- Goalkeeper save percentages above expected predict lower save percentage in subsequent matches
- Point tallies significantly above xPoints (expected points from xG) predict lower points per game in subsequent matches

The regression is not guaranteed in any individual match — it is a statistical tendency over many matches.

## The Betting Opportunity

When the market overvalues a team because of outperformance metrics (ignoring the xG data), a value opportunity exists:
- The overperforming team is overpriced
- Their opponent (or "Under" on total goals) may be underpriced

The analytical edge: use xG-based ratings rather than results-based ratings. The market''s heavy weight on results creates systematic mispricing of teams in hot or cold sequences.

## The Timing Challenge

Regression is not always immediate. An overperforming team can continue overperforming for 5–10 matches before the statistical tendency asserts itself. Betting against form too early can produce multiple losing bets before the regression arrives. Risk management (standard staking, not increasing stakes in anticipation of regression) is essential.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Goalkeeper Performance and Regression', 'goalkeeper-performance-regression',
'## The Goalkeeper Regression Phenomenon

Goalkeeper performance is among the most volatile statistics in football. A goalkeeper can "save" a team for a run of matches with exceptional performances — but statistical regression means this performance level almost never sustains.

## Why Goalkeeper Stats Are Volatile

A typical goalkeeper faces 3–6 shots per match that would score if not saved (on target, above xG threshold). Each save is a binary outcome with significant randomness. Over 10 matches, a goalkeeper can make 6–8 more saves than their long-run expected rate — appearing "in form" — before regression normalises the numbers.

## Post-Save Percentage Analysis

Compare a goalkeeper''s current save percentage (saves / shots on target) to their career average and league average:
- Current: 82%
- Career average: 71%
- League average: 73%

This goalkeeper is performing 11 percentage points above career average. The probability they sustain this for the next 10 matches: approximately 12%. Regression toward 71–73% is the base expectation.

## The Market''s Goalkeeper Blind Spot

The betting market is generally poor at incorporating goalkeeper performance regression into pricing. A team with a "goalkeeper in form" often has its odds shortened based on recent clean sheets — without the market questioning whether the clean sheets reflect genuine defensive quality or goalkeeper outperformance.

## The Betting Application

When a team''s recent defensive results are significantly better than their xGA (expected goals against):
1. Calculate how much of the defensive overperformance is attributable to goalkeeper luck vs genuine defensive improvement
2. If goalkeeper luck is the primary driver: expect regression, which is not priced in
3. Over/Under goals markets (favour the Over) and defensive team win markets (favour the opponent) become relatively better value

## The Caveat

Goalkeeper quality is genuinely variable. A new elite goalkeeper can genuinely be better than his predecessor — the improvement is real, not just luck. Always separate genuine quality change from performance deviation around a stable baseline.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Striker Form and Goal Scoring Regression', 'striker-form-goal-scoring-regression',
'## The Hot Striker Phenomenon

A striker scores in 5 consecutive matches. The media declares him "in form." His anytime scorer price falls significantly. Public money flows to his team.

Statistically: a 5-match scoring run occurs by chance for any player with a genuine 30% per-match scoring probability with approximately 3% frequency over a season. It is notable but not evidence of a genuine step-change in quality.

## The Components of Goal Scoring

A goal is the product of:
1. **Quality of chance generated:** Measured by xG value
2. **Conversion efficiency:** Goals scored / xG generated (random variation component)
3. **Minutes played:** Affects total scoring opportunities

Of these three, conversion efficiency has the highest game-to-game variance and the lowest persistence. A striker on a scoring run is almost certainly doing so with conversion efficiency above their long-run rate — which will regress.

## Identifying Sustainable Improvement vs Hot Streak

**Hot streak indicators (expect regression):**
- Goals scored >> xG generated (conversion rate significantly above average)
- High proportion of goals from outside the box or from difficult angles
- No improvement in chance quality or volume — just better conversion

**Genuine improvement indicators (more sustainable):**
- xG rate increased (more and better quality chances)
- Improved shot placement (shots on target rate up)
- Improved movement and positioning data (GPS/tracking)

The former is a statistical hot streak. The latter is a real improvement.

## Anytime Goalscorer Market Application

When a striker''s ATGS price has shortened due to a goal run without a corresponding increase in xG rate: the price undervalues the regression probability. Either avoid the bet or — if you are comfortable with exchange lay markets — consider laying the striker at the inflated price.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Team-Level Regression: Expected Points vs Actual', 'team-regression-expected-points',
'## The xPoints Concept

Expected Points (xPoints) calculates how many league points a team should have earned based on the xG values of all chances in all their matches, rather than actual results.

If your xG model predicts each match result probability, you can calculate the expected points from those probabilities:
xPoints per match = P(win) × 3 + P(draw) × 1 + P(lose) × 0

Summing xPoints over a season gives the expected league standing based on underlying performance — independent of results variance.

## The Over- and Under-Achievers

Teams that significantly outperform xPoints have been lucky with results relative to their underlying performance. Teams that significantly underperform xPoints have been unlucky.

**Historical research finding:** The correlation between points over/under-performance in one half of a season and points performance in the second half is strongly negative. Over-performers in H1 tend to under-perform in H2. Under-performers in H1 tend to over-perform in H2.

This is regression to the mean in league table form.

## Identifying the Regression Candidates

After 15–20 matches of a season:
1. Calculate each team''s actual points
2. Calculate their xPoints from your model
3. Identify the largest positive and negative divergences

Teams with actual points significantly above xPoints: potential value to back their opponents in subsequent matches (or lay them on the exchange for their outright position).

Teams with actual points significantly below xPoints: potential value to back them in subsequent matches at inflated prices.

## The Season-Position Outright Market

The xPoints divergence is most directly exploited in outright markets: a team priced short for the title or a Champions League position based on actual results, when xPoints suggests their position is significantly above their underlying quality, may offer lay value.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Regression in Other Sports', 'regression-other-sports',
'## Universal Principle, Sport-Specific Details

Regression to the mean operates in every sport where performance has random components. The details differ — the underlying principle is universal.

## Basketball: True Shooting Percentage Regression

A basketball player''s three-point shooting percentage in one month is a noisy measure of their true ability. A player who shoots 50% from three in October (above their career 38%) will almost certainly regress toward 38–42% in November. The market does not fully price this.

**Betting application:** A team whose offensive performance has been driven by an exceptional shooting run (well above their season average) is likely to regress in their next 5 matches. Their over/under total may be overpriced.

## Baseball: Batting Average on Balls in Play (BABIP)

BABIP measures how often batted balls fall for hits (excluding home runs). The league average is approximately .300. Any batter significantly above or below this rate is almost certainly experiencing luck — and will regress.

A batter hitting .380 on balls in play is getting lucky. A batter hitting .220 is getting unlucky. Both will regress toward their true skill level (closer to league average .300, adjusted for their specific hit type distribution).

**Betting application:** In run-line and total run markets, teams whose offences have been driven by unsustainable BABIP are systematically overvalued.

## Tennis: Break Point Conversion Regression

Break point conversion rates (percentage of break point opportunities converted) have high match-to-match variance and strong regression toward a player''s career average. A player who won an exceptional number of break points in a tournament is likely to revert in the next tournament.

## The Universal Test

For any hot streak in any sport, ask:
1. What is the statistic that underlies the performance?
2. How variable is this statistic from period to period for this athlete/team?
3. Is the current performance within a realistic range of their career baseline?
4. Is the market accounting for the regression probability?',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Speed of Regression: When Does It Happen?', 'speed-of-regression',
'## Not All Regression Is Immediate

A common mistake: identifying a regression opportunity and expecting it to materialise in the next match. Regression is a statistical tendency over a period — not a guarantee in any specific match.

## Factors That Affect Regression Speed

**Sample size of the outperformance:**
A team that has outperformed xPoints over 20 matches has a more established "overperformance" than one over 5 matches. A 20-match divergence takes longer to fully revert than a 5-match divergence.

**The size of the divergence:**
A team 15 points above their xPoints level will regress more dramatically than a team 3 points above. The larger the divergence, the more certain and visible the regression — but not necessarily faster.

**The quality of the component that is regressing:**
Goalkeeper save percentage has faster regression than team xG performance. Save percentages are heavily luck-dependent and revert within 5–10 matches. Team xG performance, which has genuine quality components, reverts more slowly.

## Implications for Bet Timing

Do not bet against the outperforming team in their very next match — the regression probability in a single match is only marginally above the baseline. Bet against them across multiple matches where the cumulative regression is more certain.

Alternatively: focus on the outright market where the regression plays out over the full remainder of the season — cleaner timing, directly exploitable.

## The Regression Window

For most statistics in football, the regression window is 10–20 matches. This is when statistically meaningful regression typically occurs. Holding a structural anti-overperformer position for this window (via exchange outrights or consistent match betting) captures the regression value most effectively.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Separating Genuine Improvement From Regression Bait', 'genuine-improvement-vs-regression',
'## The Regression Trap

Not every outperforming team is a regression target. Some teams genuinely improve — through a major transfer, a tactical innovation, or a manager change. Confusing genuine improvement with regression bait is a costly mistake.

## The Signals of Genuine Improvement

**xG rate change, not just results change:**
If a team''s xG for AND against improves — they are creating better chances and conceding fewer quality chances — this is structural improvement, not just results luck. Regression is less expected.

**Process-level improvement:**
High pressing metrics, improved defensive shape indicators (passes allowed into the box), forward runs per match — these process metrics indicate genuine tactical improvement that underlies the results.

**Consistent vs intermittent performance:**
A team that outperforms for 3 matches with inconsistent underlying metrics is more likely regression bait. A team that consistently produces improved xG across 10 matches with clean process data is more likely to have genuinely improved.

## The Manager Change Signal

A new manager typically produces a sharp initial performance change in either direction — both genuine (different system) and psychological (players reset effort for new boss). The first 5–8 matches under a new manager are highly volatile and regression-prone in both directions. The 8–20 match range is more informative about whether the change was genuinely positive.

## The Model Update Protocol

When a significant genuine improvement is identified (new manager system, key transfer): update your model explicitly. The prior historical rating for this team is now partially obsolete. Bayesian approach: keep 40–60% weight on the old rating, 40–60% on the new performance. As new data accumulates, progressively shift weight toward the new performance.

Do not fully discard the historical rating — it remains informative. Do not ignore the improvement — it is real. Blend them proportionally based on sample size of the new data.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Regression Analysis: Building a Systematic Framework', 'expert-regression-analysis',
'## The Systematic Regression Framework

An expert-level regression analysis framework integrates xG data, performance metrics, sample size considerations, and market price comparison into a coherent weekly workflow.

## The Weekly Regression Scan

After each weekend of matches:

**Step 1 — Update the xG divergence table:**
For every team in your target leagues, calculate:
- Actual goals scored vs xG scored (conversion divergence)
- Actual goals conceded vs xGA conceded (goalkeeper/defensive divergence)
- Actual points vs xPoints (result divergence)

Sort teams by magnitude of divergence in each column.

**Step 2 — Flag the extreme divergers:**
Any team in the top/bottom 20% of any divergence metric: flag for detailed review.

**Step 3 — Investigate the flagged teams:**
For each flagged team:
- How long has the divergence persisted? (5 matches vs 15 matches)
- Is there an identified cause? (New manager, key transfer, injury to key player)
- Is the divergence reflected in the market price?

**Step 4 — Compare flagged teams to market prices:**
- Is the overperformer still priced shorter than their xG-based rating suggests? → Potential lay or opponent value
- Is the underperformer priced longer than their xG-based rating suggests? → Potential back value

**Step 5 — Generate bet candidates:**
Where market price and regression expectation create a meaningful expected edge: add to the week''s betting candidates for full analysis.

## The Compound Advantage

A bettor who consistently identifies regression opportunities before the market reflects them has a compounding information advantage: each observation improves the calibration of the regression model, making subsequent identifications more accurate.

After 2–3 seasons of systematic regression analysis, the model is highly calibrated for your specific leagues — and the market advantage deepens over time.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'regression-to-the-mean' AND cat.slug = 'statistical-thinking';
