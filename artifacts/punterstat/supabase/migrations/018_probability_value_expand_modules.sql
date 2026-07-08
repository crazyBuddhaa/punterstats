-- ============================================================
-- PunterStat — Betting Academy: Probability & Value Expansion
-- Migration 018: Expand existing 2 modules to 10 lessons each
--   • "Implied Probability Explained" — add lessons 3–10
--   • "Finding Value Bets"            — add lessons 1–10
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Implied Probability Explained               ║
-- ║  Existing: 2 lessons (sort_order 1, 2)                  ║
-- ║  Adding: lessons 3–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Lesson 3: Applying Implied Probability to Decisions (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Applying Implied Probability to Every Bet',
  'applying-implied-probability-to-bets',
  '## From Theory to Practice

You have learned that implied probability = 1 / decimal odds. Now the question is: what do you actually do with that number?

## The Three-Step Decision Process

Every bet you consider should pass through this process before you place it:

**Step 1 — Convert the price to implied probability**
Offered price: 2.75 → Implied P = 1/2.75 = 36.4%

**Step 2 — Form your own probability estimate**
Based on your analysis, what do you think the true probability is?
Your estimate: 42%

**Step 3 — Compare**
Your estimate (42%) > Implied probability (36.4%) → Value bet
Your estimate (32%) < Implied probability (36.4%) → Pass (negative value)

## The Comparison Is Everything

You do not need to pick winners. You need to consistently find situations where your probability estimate is higher than the implied probability. Over hundreds of bets, this is what generates positive expected value.

## A Common Mistake: Thinking in Odds, Not Probabilities

"3.00 looks like a long shot" is a vague feeling. "33.3% implied probability vs my 40% estimate" is a testable claim. Train yourself to think in percentages, not in price labels.

## Practical Habit

Before every bet, write down: "Implied P = X%. My estimate = Y%." If Y > X by enough to overcome the margin, proceed. If not, pass. This two-number habit eliminates most impulsive betting.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 4: Probability vs Frequency (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Probability vs Frequency: A Critical Distinction',
  'probability-vs-frequency',
  '## The Long Run Is the Only Run That Matters

A 40% implied probability does not mean the event will happen 40 times in 100. It means that over a very large number of trials under identical conditions, the frequency approaches 40%. In any finite sample, the actual result may be far from 40%.

## Why This Matters for Bettors

At 50 bets, a sequence of results can deviate dramatically from the underlying probability:
- A bettor with 40% selection win rate may win only 28% or as many as 52% at 50 bets due to variance
- Conclusions drawn from 50 bets are almost meaningless for measuring true skill

## Distinguishing Variance from Skill

The variance around a win rate decreases as sample size grows. The standard deviation of a proportion at n trials:

σ = √(p × (1-p) / n)

At p = 0.40 and n = 50: σ = √(0.40 × 0.60 / 50) = 0.069 → ±6.9% uncertainty around 40%

At n = 500: σ = 0.022 → ±2.2% uncertainty

## The Practical Implication

You cannot know if your 43% win rate at 50 bets is real skill or variance. You can be reasonably confident at 500 bets, and very confident at 2,000 bets.

## Frequentist Thinking in Practice

When you assign 55% probability to an outcome, you are making a claim about what would happen over a large number of similar events. To validate this claim, you need many bets in similar situations — not one bet that won or lost.

This is why systematic record-keeping with categorisation (by market type, sport, league, bet type) is essential. You cannot validate probability estimates without grouped frequency data.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 5: Multiple Outcomes and Conditional Probability (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Multiple Outcomes and Conditional Probability',
  'multiple-outcomes-conditional-probability',
  '## When Events Are Not Independent

Many sports betting situations involve outcomes that are not independent. Understanding when probabilities combine multiplicatively and when they do not prevents significant errors.

## Independent Events: Multiplication Rule

If two events are independent (the result of one does not affect the other), the probability of both occurring = P(A) × P(B).

**Accumulator example:**
P(Team A wins) = 0.60
P(Team B wins) = 0.55
P(both win) = 0.60 × 0.55 = 0.33 (33%)

Bookmaker prices: 1.67 (A) and 1.82 (B)
Accumulator odds: 1.67 × 1.82 = 3.04
Fair odds: 1/0.33 = 3.03 ✓ (margin is embedded in each leg)

## Conditional Probability: When Events Are Related

Conditional probability: P(A|B) = probability of A given B has occurred.

In sports, outcomes within a match are often correlated:
- If Team A scores first, their probability of winning increases significantly (not independent of "Team A wins")
- Over/under goals and both-teams-to-score markets are mathematically linked (if both teams score, minimum 2 goals)

## The Correlation Trap in Accumulators

Combining correlated outcomes in accumulators creates pricing errors. A "goalscorer + team to win" accumulator:
- P(Striker scores anytime) = 0.35
- P(Team wins) = 0.55
- These are NOT independent — if the striker scores, the team is more likely to win

True P(both) > 0.35 × 0.55 = 0.19, because they are positively correlated.

Bookmakers price same-game multiples using correlation assumptions. Where their assumptions are wrong, pricing errors (edge) exist.

## Bayesian Updating

When new information arrives (a goal, an injury), you should update your probability estimate proportionally. Bayes'' theorem formalises this: posterior probability = (likelihood × prior) / normalisation. In practice, the key discipline is systematically revising your estimate when new evidence arrives, not anchoring to the pre-event probability.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 6: Calibrating Your Probability Estimates (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Calibrating Your Probability Estimates',
  'calibrating-probability-estimates',
  '## What Is Calibration?

A probability estimator is well-calibrated if outcomes they rate at 60% probability actually occur 60% of the time, outcomes at 30% occur 30% of the time, and so on.

Poor calibration is the most common form of systematic error in betting. Most bettors are overconfident — assigning 70% probability to events that only occur 55% of the time.

## The Calibration Test

To test your calibration:
1. For 200+ bets, record your estimated probability for each selection before placing the bet
2. Group bets into probability buckets: 55–60%, 60–65%, 65–70%, 70%+
3. For each bucket, calculate the actual win frequency
4. Compare estimated frequency to actual frequency

If you estimated 65% probability and actual frequency is 55%, you are overconfident by 10 percentage points in that range.

## Why Overconfidence Is Systematic

Humans consistently overestimate their ability to predict outcomes in complex domains. The signal (actual evidence) is routinely overwhelmed by the noise (subjective confidence). Sports expertise can increase this overconfidence — knowing more about a team leads to more confident assessments that are not proportionally more accurate.

## Correcting for Overconfidence

The standard correction: shrink your probability estimates toward 50%. If you estimate 70%, a 10–20% shrinkage toward 50% might produce a better-calibrated 60–65%.

The right shrinkage factor depends on your skill level and domain. Find it empirically through your calibration test results.

## The Brier Score

The Brier Score measures overall probability calibration quality:

BS = (1/n) × Σ(estimated_p − outcome)²

where outcome = 1 (win) or 0 (loss). Lower Brier Score = better calibration.

Compare your Brier Score to the market''s Brier Score (using closing prices). If yours is higher (worse), the market is more accurate — defer to it. If yours is lower (better), you have genuine forecasting edge.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 7: Market Efficiency and Where It Fails (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Market Efficiency and Where It Fails',
  'market-efficiency-where-it-fails',
  '## The Efficient Market Hypothesis in Betting

The efficient market hypothesis (EMH) from financial economics states that asset prices reflect all available information. Applied to betting, it means the closing market price is the best possible estimate of the true probability given all public information.

The closing Pinnacle price is approximately semi-strong efficient: it incorporates all publicly available information (team news, form, statistics) but may not fully incorporate private information (pitch-side scouts, injury updates before public announcement).

## Where Market Efficiency Breaks Down

**1. Low-liquidity markets**
In minor leagues with low betting volume, fewer sharp bettors scrutinise the lines. Errors persist longer. There is more edge for a researcher willing to do the work.

**2. Opening line inefficiencies**
The first line posted by a bookmaker is the least refined. Sharp money corrects it over hours or days before the event. Early access to a mispriced opening line is one of the clearest edges in the industry.

**3. Novel events and structural breaks**
When something genuinely new occurs — a team''s first match under a new manager, a rule change in a sport, a pandemic affecting home advantage — historical data cannot fully model the new situation. Models struggle; informed qualitative analysis may be more accurate.

**4. Specific public biases**
Markets are systematically skewed by public behaviour. Favourites are slightly over-bet (favourite bias), home teams are over-bet, and popular teams attract excess money. These create small but measurable edges on the opposite side in certain conditions.

**5. The favourite-longshot bias**
Well-documented: longshots are systematically overpriced (implied probability too high) and strong favourites are slightly underpriced. Betting every strong favourite is not a winning strategy (the margin still applies), but the bias is statistically real.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 8: Advanced Probability Modelling Concepts (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Advanced Probability Modelling Concepts',
  'advanced-probability-modelling',
  '## Beyond Simple Win/Loss Probability

Advanced bettors model the full distribution of outcomes, not just win/loss probability. This unlocks pricing of spread markets, totals, and props from the same underlying model.

## The Poisson Process

Sports scoring in football and hockey approximates a Poisson process: goals arrive at a roughly constant rate, independently of each other. For a team with expected goals λ:

P(exactly k goals) = e^(-λ) × λ^k / k!

This produces a complete probability distribution over all possible scores, from which any market can be priced.

## Regression Toward the Mean in Ratings

Team performance ratings regress toward the mean over time. An exceptional performance last season predicts above-average (but not exceptional) performance next season. This has a specific implication: never use a single season''s data to set a team rating without applying a regression factor.

The standard approach: blend historical performance with a mean prior. The weight on the prior is inversely related to sample size. At the start of a season with no data, use pure prior (league average). As matches accumulate, blend toward observed performance.

## Dixon-Coles Adjustment

The standard Poisson model slightly underestimates the probability of 0-0 and 1-1 draws in football. The Dixon-Coles adjustment corrects for this by adding a correlation parameter between home and away goals at low score levels. In practice, this improves pricing accuracy for low-total goal markets.

## Hierarchical Models

When data is sparse (limited match observations per team), hierarchical Bayesian models improve estimates by sharing information across teams. A newly promoted team with limited top-flight data can borrow strength from similar teams'' priors.

## Simulation vs Analytical Solutions

For complex multi-event problems (in-play probability during a match, playoff probability), Monte Carlo simulation is often more practical than analytical probability calculation. Run 100,000 match simulations from the current game state to estimate outcome probabilities.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 9: Cross-Market Probability Consistency (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Cross-Market Probability Consistency',
  'cross-market-probability-consistency',
  '## Markets Must Be Internally Consistent

Every bookmaker market for the same event should produce consistent implied probabilities when de-vigged. If the 1X2 market implies Home wins 50% of the time, the Asian handicap market should price the home team consistently.

When they do not, a mathematical inconsistency exists — and inconsistencies are potential edges.

## Finding Inconsistencies

**Example: Football match**
- 1X2 market (de-vigged): Home 52%, Draw 27%, Away 21%
- Over/Under 2.5 (de-vigged): Over 55%, Under 45%
- BTTS (de-vigged): Yes 52%, No 48%

Check: Is P(Over 2.5) = 55% consistent with BTTS Yes = 52%? For BTTS Yes to occur, at least 2 goals must be scored (1 each). The over/under and BTTS markets should be correlated — a mismatch is a potential arbitrage or value signal.

## The Correlation Check

Build a Poisson model from the 1X2 implied probabilities. Use it to derive the implied over/under and BTTS probabilities. Compare to what the bookmaker actually offers on those markets.

If your Poisson-derived Over 2.5 probability is 58% but the bookmaker prices it at 55% (implied), the over market may be slightly underpriced relative to the match winner market.

## The Limits of Cross-Market Arbitrage

Bookmakers are aware of cross-market consistency and price them together (or with correlated models). Genuine inconsistencies are usually small and require sharp execution. Also, the margin on specialty markets is higher, which can absorb apparent inconsistencies.

## Practical Workflow

Run the consistency check as a secondary screen after identifying value in a primary market. If your 1X2 value bet is confirmed by an independent consistency check from the BTTS market, confidence in the edge increases.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';

-- Lesson 10: Building a Probability Framework (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Building Your Complete Probability Framework',
  'complete-probability-framework',
  '## The Integrated Framework

At the expert level, probability estimation is not a single step — it is a complete framework that spans pre-event analysis, real-time updating, market comparison, and post-event validation.

## Framework Architecture

**Layer 1 — Base model**
Statistical team ratings (Elo, xG-based, or regression model) producing prior probability estimates for each match. This is the foundation: dispassionate, data-driven, consistent.

**Layer 2 — Contextual adjustment**
Systematic modifications for injuries, rest, motivation, weather, venue characteristics. Each adjustment has a defined magnitude derived from historical data, not gut feeling.

**Layer 3 — Market reference**
De-vigged closing line from Pinnacle (or exchange) as an independent probability estimate. Weight your model vs the market based on your model''s historical accuracy relative to the market.

**Layer 4 — Bayesian update**
Real-time revision as new information arrives (lineups confirmed, weather changes, market movement). Use Bayes'' theorem structurally: prior × likelihood → posterior.

**Layer 5 — Bet decision**
Compare weighted average of model + market probability to offered price. Bet if edge exceeds margin + uncertainty buffer.

## The Uncertainty Buffer

Not all probability estimates are equally reliable. Wider uncertainty → higher required edge before betting.

Simple rule: require edge at least 2× the standard error of your probability estimate.

## Continuous Calibration

The framework is only as good as its calibration. Run calibration tests quarterly on all bets placed. Identify which layers contribute most to calibration error and revise them.

## The Honest Assessment

This framework requires significant investment to build and maintain. The payoff — consistent positive CLV across a wide range of markets — makes it the defining characteristic of a long-term profitable bettor. Without it, you are betting on instinct against models far more sophisticated than your own.',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'implied-probability-explained' AND cat.slug = 'probability-and-value';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — Finding Value Bets                          ║
-- ║  Existing: 0 lessons                                    ║
-- ║  Adding: lessons 1–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Lesson 1: What Is a Value Bet? (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'What Is a Value Bet?',
  'what-is-a-value-bet',
  '## The Most Important Concept in Betting

A value bet is a bet where the probability of an outcome occurring is greater than the implied probability of the bookmaker''s odds.

This is the entire foundation of profitable betting. Without value, you cannot win in the long run. With value, you mathematically must profit over a sufficient sample size.

## A Clear Example

You believe Arsenal has a 55% chance of winning a match.
The bookmaker prices Arsenal at 2.00 (implied probability: 50%).

55% > 50% → This is a value bet.

If this same scenario repeated 100 times:
- You win 55 bets at 2.00 → 55 × £10 = £550
- You lose 45 bets → 45 × £10 = £450
- Net profit: £100 on £1,000 staked = 10% ROI

## What Value Is Not

Value is not:
- Picking winners (you can win without value; you can lose consistently with it)
- Backing short-priced favourites (short prices have lower value potential)
- Following tipsters who "always win" (no tipster knows the true probability)

## The Fundamental Shift in Thinking

Most bettors think: "Will this team win?"
Value bettors think: "Is the probability of this team winning higher than what the bookmaker implies?"

The first question is about predicting results. The second is about exploiting mispricing. Only the second generates sustainable profit.

## Your Only Job

Estimate probabilities more accurately than the bookmaker on the selections you bet on. You do not need to be right on every bet. You need your estimated probabilities to be, on average, more accurate than the implied probabilities you bet into.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 2: Expected Value Formula (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Expected Value Formula',
  'expected-value-formula',
  '## Expected Value: The Engine of Profitable Betting

Expected Value (EV) is the average outcome of a bet if it were placed an infinite number of times. Positive EV bets profit in the long run. Negative EV bets lose.

## The Formula

EV = (P_win × Profit) − (P_lose × Stake)

Where:
- P_win = your estimated probability of winning
- Profit = (Decimal odds − 1) × Stake
- P_lose = 1 − P_win
- Stake = your stake

## A Worked Example

Stake: £100
Odds: 2.50 (profit if win: £150)
Your estimated P_win: 0.45

EV = (0.45 × £150) − (0.55 × £100)
EV = £67.50 − £55.00 = **+£12.50**

This bet has a positive expected value of £12.50 per £100 staked.

## Negative EV Example

Same stake and odds, but your estimated P_win: 0.35

EV = (0.35 × £150) − (0.65 × £100)
EV = £52.50 − £65.00 = **−£12.50**

Despite the same odds, this bet loses £12.50 on average. If you place enough of these, you will lose money regardless of short-term results.

## EV as % of Stake

Express EV as a percentage of stake for easier comparison:

EV% = EV / Stake × 100

+£12.50 / £100 = +12.5% EV. This is an exceptional value bet.

A realistic value bet for a well-calibrated bettor might be +2% to +5% EV — modest, but compounded over hundreds of bets, it produces sustainable profit.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 3: Spotting Value in Practice (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Spotting Value in Practice',
  'spotting-value-in-practice',
  '## Value Is a Comparison, Not a Feeling

You cannot spot value by watching a team or reading match previews alone. Value exists in the gap between your probability estimate and the market''s implied probability. Both numbers must exist before you can assess value.

## The Two-Step Value Check

**Step 1: Form your estimate independently**
Before checking odds: what probability do you assign to the outcome? Write it down.

**Step 2: Check the market price**
Convert to implied probability. Is your estimate higher? By how much?

Only proceed if:
- Your estimate > implied probability
- The gap exceeds the bookmaker''s margin (typically 4–6%)

## Practical Example: A Football Match

Your pre-analysis conclusion: Brighton will win away at Crystal Palace — 38% probability (based on xG ratings, head-to-head, and current form).

You check the market: Brighton Away at 2.90 → implied probability 34.5%.

38% > 34.5% → the gap is 3.5 percentage points. At a 5% margin market, this is marginal — close to fair value, not a strong value bet.

Now check another bookmaker: Brighton Away at 3.20 → implied probability 31.3%.

38% > 31.3% → gap is 6.7 percentage points. At 5% margin, this clears the threshold. This is a value bet.

## The Margin Threshold Rule

Do not bet unless:
Your estimate > (Implied probability + half the margin)

At 5% margin: bet only if your estimate exceeds implied probability by 2.5%+ (as a practical minimum).

## When to Pass

Uncertainty is not value. If you are unsure of your probability estimate, pass. Value requires confidence in your estimate, not just a hope that the price is wrong.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 4: Common Sources of Value (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Common Sources of Betting Value',
  'common-sources-of-betting-value',
  '## Where Does Value Actually Come From?

The market is set by bookmakers and corrected by sharp bettors. Value exists where the market misprices an outcome. Understanding why mispricing occurs helps you find it systematically.

## Source 1: Public Bias and Popularity

Recreational bettors systematically over-bet popular teams, heavy favourites, and high-profile matches. The market adjusts prices to reflect this imbalance.

**Practical implication:** Popular teams (Manchester United, Real Madrid, Dallas Cowboys) are often slightly over-bet, compressing their price below fair value. Opposing them — when your model supports it — can be systematically profitable.

## Source 2: Recency Overreaction

After a team''s exceptional recent performance (3-game winning streak, big away win), the public prices them as though that performance will continue. But recent extremes are often variance rather than skill shift.

**Practical implication:** Fade teams that have had exceptional recent results against opponents of similar quality. The price often reflects recency bias more than true underlying quality.

## Source 3: News and Information Timing

When significant team news (a key injury) is publicly announced, the market takes minutes to hours to fully reprice. Sharp bettors who react first capture the mispriced window.

**Practical implication:** Establish fast news alerts. Be among the first to see major lineup changes and act before prices fully adjust.

## Source 4: Model Gaps in Niche Markets

Bookmakers invest more resources in Premier League pricing than in the Scottish Championship or Brazilian Serie B. Their models are less refined in lower-profile markets — creating more frequent and larger mispricings for researchers willing to do the work.

## Source 5: Opening Line Errors

Bookmakers sometimes post opening lines with conservative modelling or deliberate caution, which are then corrected by market action. The gap between opening line and closing line can represent extracted edge for early movers.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 5: The Relationship Between Edge and Stakes (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Edge, Stakes, and Expected Profit',
  'edge-stakes-expected-profit',
  '## Your Edge Determines Your Earning Power

Once you have identified a value bet, the next question is: how much should you stake? The answer depends on the size of your edge, your bankroll, and your risk tolerance.

## The Edge as a Rate

Edge = Your probability − Implied probability (as a decimal)

At your probability 0.55 and implied probability 0.50: edge = 0.05 (5%)

This means for every £1 staked, you expect to earn approximately £0.05 in expected profit.

## Turnover × Edge = Expected Profit

Annual expected profit = Annual stake turnover × Average edge

If you bet £500 average stake per week, 40 weeks/year = £20,000 annual turnover.
At an average edge of 3%: expected profit = £20,000 × 0.03 = **£600 per year.**

Increasing edge or turnover (or both) scales profit. Increasing stakes without edge is simply increasing expected losses.

## The Kelly Criterion Preview

The Kelly Criterion (covered in depth in the Staking Strategies topic) calculates the mathematically optimal stake as a fraction of your bankroll given your edge. The formula:

Kelly fraction = Edge / (Decimal odds − 1)

At edge = 0.05 and odds = 2.50 (so odds − 1 = 1.50):
Kelly fraction = 0.05 / 1.50 = 3.33% of bankroll

## Why Overbetting Edge Is Dangerous

Staking too much relative to edge leads to ruin even if you have genuine positive EV. The Kelly Criterion identifies the maximum optimal stake — exceeding it increases variance faster than it increases expected return.

## The Practical Lesson

A 3% edge is real but modest. Do not over-bet it. Consistent application of modest stakes at consistent edges — not occasional large bets on high-confidence picks — is how sustainable profit is built.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 6: Value vs Confidence (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Value vs Confidence: A Crucial Distinction',
  'value-vs-confidence-distinction',
  '## The Trap of the "Nailed On" Pick

Every bettor has experienced it: a match they feel certain about. "This is a certainty." The team is clearly superior, the conditions favour them, the form is strong. They bet heavily. They lose.

This is not bad luck. It is a misunderstanding of value.

## High Confidence ≠ High Value

Confidence is your subjective certainty that a selection will win.
Value is the gap between your probability estimate and the implied probability.

A 90% confidence bet priced at 93% implied probability is a bad bet. A 55% confidence bet priced at 44% implied probability is an excellent bet.

## Where Bettors Go Wrong

Bettors naturally increase stakes on bets they feel most confident about. But bookmakers also price those bets most efficiently — because they attract the most action, receive the most expert scrutiny, and have the most data behind them.

The bets you feel most confident about are often the least mispriced — because everyone else also feels confident and the market reflects that collective assessment.

## The Counterintuitive Truth

Your most profitable bets will often be the ones you feel least certain about — lower-profile events, longer odds, markets where the bookmaker''s model is least refined.

## Separating the Two in Practice

Before every bet, ask these separately:
1. "How confident am I that this outcome will occur?" (subjective)
2. "What is the gap between my estimated probability and the offered probability?" (objective)

Only the second question determines whether to bet. The first question determines nothing about value — but it does reveal a lot about your risk tolerance and potential biases.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 7: Systematic Value Hunting (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Systematic Value Hunting',
  'systematic-value-hunting',
  '## Moving Beyond Case-by-Case Analysis

Analysing each bet individually is time-intensive and prone to inconsistency. Systematic value hunting creates a repeatable process that evaluates many potential bets against defined criteria.

## The Systematic Approach

**Step 1 — Universe definition**
Define the markets you will evaluate. Example: "All top-5 European league matches, Asian handicap and 1X2 markets, 48 hours before kick-off."

**Step 2 — Model output**
For every match in your universe, your model produces a probability estimate for each outcome.

**Step 3 — Market scan**
Automated or manual comparison of model probabilities to best available bookmaker prices.

**Step 4 — Filter**
Flag all outcomes where model probability exceeds implied probability by > threshold (e.g. 3%).

**Step 5 — Human review**
Briefly review flagged bets for obvious model errors (injury news your model has not incorporated, venue changes, data errors).

**Step 6 — Place**
Place bets that survive review, sized by your staking system.

## The Volume Advantage

At 200 matches per week in your universe, with 5% of bets flagging as value, you evaluate 10 potential bets per week. Over 40 active weeks, 400 value bets. At this volume, your CLV data becomes statistically meaningful within 6 months.

## Avoiding Systematic Biases in Screening

Your filter may introduce biases — if your model systematically overestimates home teams, your value bets will be dominated by home bets. Review your model''s directional biases quarterly.

## The Human-Model Hybrid

Pure model approaches miss contextual information (injury not yet in the data). Pure human approaches are inconsistent and biased. The hybrid — model for base probability, human for contextual adjustment, model for bet decision — is more accurate than either alone.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 8: Value at Different Odds Ranges (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Value at Different Odds Ranges',
  'value-at-different-odds-ranges',
  '## The Odds Range Problem

Value opportunities exist across the full odds range, but they do not behave identically. Understanding the characteristics of value at different price points prevents systematic errors.

## Short Odds (< 1.80): The High Win Rate Zone

At short prices, you win frequently but profit margins per bet are thin. A single loss at short odds can wipe out many small wins.

**The value hunter''s problem at short odds:**
- Bookmakers price favourites most accurately (heavy scrutiny, high volume)
- Finding genuine 5% edge at 1.50 (implied 67%) requires your model to say 72%+ — a significant disagreement with a well-informed market
- Account restrictions come fastest for consistently profitable short-odds bettors

**When short-odds value exists:**
- Opening line errors before correction
- Injury to a key player that dramatically shifts true probability but has not fully priced in

## Mid-Range Odds (1.80–4.00): The Sweet Spot

The most accessible zone for value hunting. Moderate win rates allow meaningful variance testing. Bookmaker models are generally good but more frequently err than at extreme prices.

## Long Odds (4.00+): The High Variance Zone

Large potential profits, but very low win rates. To detect genuine edge at these odds, you need hundreds of bets in the same odds range — the sample size requirement for statistical confidence is much higher.

**The longshot bias:** Research consistently shows that bookmakers overprice longshots (actual probability lower than implied). Bettors who systematically back longshots without edge lose more than in other ranges.

## Odds Range Calibration

Track your results separately for each odds range. Most bettors discover their edge is concentrated in a specific range — where their model is most accurate relative to the market. Identify your range and concentrate there.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 9: Testing and Validating Your Value Edge (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Testing and Validating Your Value Edge',
  'testing-validating-value-edge',
  '## The Validation Problem

Any bettor who records their bets will, at some point, show a period of positive ROI. The question is: is this evidence of a genuine value-finding edge, or is it variance?

## Statistical Significance in Betting

To determine if a positive ROI is statistically significant:

Z-score = (Observed wins − Expected wins) / √(n × p × (1−p))

Where p = average win rate at your typical odds, n = number of bets.

Rule of thumb: Z > 2 (i.e. result more than 2 standard deviations above expectation) corresponds roughly to 95% confidence that the result is not pure luck.

**Example:**
100 bets, average implied win rate 40%, you won 50 bets (50%).
Expected wins = 40. Observed = 50.
Z = (50 − 40) / √(100 × 0.40 × 0.60) = 10 / 4.90 = 2.04

Marginally significant. Not conclusive, but encouraging.

## CLV-Based Validation

CLV (Closing Line Value) validation is more statistically powerful than outcome-based validation for the same number of bets.

If your average CLV is +2% over 300 bets with a standard deviation of 8%:
Standard error = 8% / √300 = 0.46%
Z = 2% / 0.46% = 4.3 → Highly statistically significant

## Out-of-Sample Testing

Backtest your value-finding method on historical data you did not use to develop it. If your method showed 4% ROI in the development dataset but only 0.5% in the out-of-sample test, the method has likely overfitted to historical data.

## Continuous Monitoring

Even after validation, monitor performance monthly. Edges erode as markets improve. A method valid two years ago may no longer produce value. Set performance thresholds: if rolling 6-month CLV drops below zero, pause and re-evaluate.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';

-- Lesson 10: Building a Sustainable Value Betting Operation (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Building a Sustainable Value Betting Operation',
  'sustainable-value-betting-operation',
  '## The Operational Reality

Identifying value bets is necessary but not sufficient. Turning a theoretical edge into sustainable income requires operational infrastructure, account management, psychological resilience, and continuous adaptation.

## The Pipeline Problem

Soft bookmakers restrict winning accounts. As accounts are restricted, your capacity to place value bets shrinks. A sustainable operation plans for this:

- Maintain 10–15 active accounts at all times
- Open 2–3 new accounts per quarter before restrictions hit
- Use exchanges and sharp books (Pinnacle) as the foundation that cannot be restricted
- Use soft book accounts tactically for enhanced prices and promotions

## Diversification Across Markets and Sports

A single-market value bettor is vulnerable to:
- Seasonal gaps in the market
- Specific market shutdowns or restrictions
- Edge erosion if the market corrects against your method

Diversifying across sports and markets reduces vulnerability while increasing the total number of value bets available per week.

## Psychological Infrastructure

A value betting operation will experience losing months. Not because of errors, but because variance is real. The psychological resilience required:
- Trusting the process (positive CLV) when results are negative
- Maintaining consistent stake sizes through drawdowns
- Not adjusting the strategy based on short-term results

Pre-commitment rules: define in writing how you will behave during a 50-unit drawdown. Stick to the pre-commitment regardless of emotion.

## The Compound Growth Framework

A bettor with 3% average CLV, £10,000 starting bankroll, 1.5% stake sizing, 500 bets per year:

Year 1: £10,000 → ~£12,250 (3% × 500 × 1.5% stake = ~22.5% growth)
Year 3: ~£18,400
Year 5: ~£27,500

These are expected values — actual results will deviate due to variance. But the direction is determined by the edge. Protect the edge above everything else.',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'finding-value-bets' AND cat.slug = 'probability-and-value';
