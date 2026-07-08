-- ============================================================
-- PunterStat — Betting Academy: Statistical Thinking New Modules
-- Migration 036: Add 4 new modules (10 lessons each)
--   Module 3: Probability Distributions in Sport  (intermediate)
--   Module 4: Building Predictive Models           (intermediate)
--   Module 5: Model Evaluation and Calibration     (advanced)
--   Module 6: Advanced Quantitative Methods        (expert)
-- ============================================================

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Probability Distributions in Sport', 'probability-distributions-sport',
  'The mathematical distributions behind sports outcomes — Poisson, binomial, normal — and how to apply them to build better probability estimates.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'statistical-thinking';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Building Predictive Models', 'building-predictive-models',
  'A step-by-step guide to building your first sports prediction model — from data collection to outcome probabilities.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'statistical-thinking';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Model Evaluation and Calibration', 'model-evaluation-calibration',
  'How to rigorously test whether your model actually works — backtesting, walk-forward testing, calibration curves, and proper scoring rules.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'statistical-thinking';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Advanced Quantitative Methods', 'advanced-quantitative-methods',
  'Regression analysis, machine learning basics, Elo rating systems, and ensemble modelling applied to sports prediction.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'statistical-thinking';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Probability Distributions in Sport          ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Binomial Distribution for Match Outcomes', 'binomial-distribution-match',
'## The Binomial Setting

The binomial distribution models the number of successes in n independent trials, where each trial has probability p of success. In betting, this applies whenever you have a series of yes/no outcomes.

## Examples in Betting

**Win rate over N bets:** If your true win rate is 48% (even-money betting with slight edge), what is the probability of winning exactly 52 out of 100 bets?

P(X = 52) = C(100,52) × 0.48^52 × 0.52^48 ≈ 5.4%

**Clean sheet probability over a season:** A team keeps clean sheets in 32% of matches. What is the probability they keep 10+ clean sheets in a 38-match season?

P(X ≥ 10) = Σ P(X = k) for k = 10 to 38 ≈ 72%

## Calculating Binomial Probabilities

Binomial CDF gives cumulative probabilities: P(X ≤ k) = Σ_{i=0}^{k} C(n,i) × p^i × (1−p)^(n−i)

Tools: Excel BINOM.DIST(), Python scipy.stats.binom, R pbinom()

## The Normal Approximation

For large n (n > 30), the binomial distribution is well approximated by the normal distribution with:
μ = np
σ = √(np(1−p))

For 500 bets with p = 0.50: μ = 250, σ = √125 ≈ 11.2

P(winning at least 260 bets) = P(Z > (260−250)/11.2) = P(Z > 0.89) ≈ 18.7%

## Practical Applications

- Calculating the probability of a specific winning or losing run
- Determining whether your observed win rate is statistically significant
- Setting realistic expectations for any binary-outcome market',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Normal Distribution in Betting Analysis', 'normal-distribution-betting',
'## Why the Normal Distribution Matters

The normal distribution (bell curve) appears throughout betting analysis because of the Central Limit Theorem: the sum of many independent random variables tends toward a normal distribution, regardless of the underlying distribution of each variable.

## Applications in Betting

**1. Portfolio P&L distribution:**
The sum of many bets'' profit/losses, each with some distribution, approximates a normal distribution. This allows:
- Calculating the probability of a specific monthly P&L
- Setting stop-loss levels based on standard deviation multiples
- Comparing actual results to expected results

**2. Team performance metrics:**
Goals per match, points per match, xG per match — all approximately normally distributed across a team''s matches. This enables:
- Identifying statistically unusual performances
- Calculating confidence intervals for team ability estimates

**3. Market efficiency testing:**
The distribution of your CLV values across bets should be approximately normal if the market is efficient and your CLV deviations are random. A non-normal CLV distribution suggests systematic patterns.

## Reading the Normal Distribution Table

For standard normal Z:
P(Z < 1.65) = 95% → 95th percentile
P(Z < 1.96) = 97.5% → used for 95% two-sided CI
P(Z < 2.58) = 99.5% → used for 99% two-sided CI
P(−1.96 < Z < 1.96) = 95% → 95% of observations within ±1.96σ of mean

## The Practical Value

The normal distribution allows a bettor to calculate: "What is the probability that my bankroll falls below X over the next Y bets, given my edge and variance?" This is the foundational calculation for ruin risk management.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Bivariate Poisson: Modelling Both Teams'' Goals', 'bivariate-poisson-model',
'## Beyond Independent Poisson

The standard Poisson model for football treats each team''s goal scoring as independent. This is a simplification — the number of goals each team scores are not truly independent (a goal changes game dynamics, affecting subsequent goal probability).

## The Dixon-Coles Correction

Dixon and Coles (1997) introduced a correction factor τ for low-scoring outcomes (0-0, 1-0, 0-1, 1-1), which are under/over-represented in standard Poisson models:

P(score = (x, y)) = τ(x, y, λ_home, λ_away, ρ) × Poisson(x; λ_home) × Poisson(y; λ_away)

Where τ = 1 − ρλ_home λ_away (for x=0, y=0)
       = 1 + ρ (for x=1, y=1)
       = 1 + ρλ_away (for x=1, y=0)
       = 1 + ρλ_home (for x=0, y=1)
       = 1 (otherwise)

ρ is typically estimated at −0.13 to −0.10.

## Why This Matters for Bettors

The Dixon-Coles correction improves probability estimates for low-scoring games. If your model uses pure Poisson without this correction, it:
- Underestimates 0-0 probability by 15–20%
- Overestimates 1-1 probability by 5–10%

These distortions affect over/under markets and correct score markets systematically.

## Implementing the Correction

The correction is straightforward to implement in Excel or Python. The adjusted score probability matrix gives more accurate probability estimates for all market types derived from the scoreline distribution.

Most serious football modellers use Dixon-Coles as the standard. If you are not using it, you are working with a systematically biased probability distribution for low-scoring outcomes.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Negative Binomial and Over-Dispersion', 'negative-binomial-overdispersion',
'## When Poisson Is Not Enough

The Poisson distribution has one parameter (λ) and assumes that the mean equals the variance. In practice, sports goal scoring often has variance greater than the mean — a phenomenon called over-dispersion.

## Why Over-Dispersion Occurs

Over-dispersion in goals arises because:
1. Match quality varies significantly — some matches are high-intensity, others are tactical affairs
2. Weather and pitch conditions affect scoring rates
3. In-game state changes (red cards, early goals) shift the effective goal rate during the match

These factors make the true variance of goals scored across matches larger than the Poisson mean.

## The Negative Binomial Distribution

The negative binomial distribution extends Poisson by adding a second parameter (the dispersion parameter r) to capture over-dispersion:

P(X = k) = C(k+r−1, k) × (r/(r+μ))^r × (μ/(r+μ))^k

As r → ∞, the negative binomial approaches Poisson.

## When to Use Negative Binomial

If your data shows that the variance of goals across matches significantly exceeds the mean: use negative binomial. Compare:
- Mean goals per match: 2.7
- Variance of goals per match: 3.8 (vs 2.7 expected for Poisson)

Variance > mean: over-dispersion present → negative binomial more appropriate.

## The Practical Impact

Using negative binomial instead of Poisson in over-dispersed data:
- Assigns more probability mass to extreme totals (0 goals, 5+ goals)
- Assigns slightly less to the central range (2–3 goals)
- Produces better-calibrated over/under probabilities for extreme lines

For most applications, the difference is small. For bettors specifically interested in high-goals or low-goals markets, negative binomial is worth implementing.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Elo Rating System Explained', 'elo-rating-system-explained',
'## Elo Ratings: A Foundation for Sports Modelling

The Elo rating system, originally developed for chess, has become one of the most widely used approaches to rating sports teams. Its elegant simplicity makes it powerful: a team''s rating updates after every match based on the result and the prior ratings of both teams.

## The Core Update Formula

After a match:

New_Rating_A = Old_Rating_A + K × (Result − Expected_Result)

Where:
- K = update factor (typically 20–40 in sports)
- Result = 1 (win), 0.5 (draw), 0 (loss)
- Expected_Result = 1 / (1 + 10^((Rating_B − Rating_A)/400))

**Example:**
Team A rating: 1600. Team B rating: 1500. Team A wins.
Expected result = 1 / (1 + 10^((1500−1600)/400)) = 1 / (1 + 10^(−0.25)) = 0.640
Actual result = 1 (win)
New rating for A = 1600 + 30 × (1 − 0.640) = 1600 + 10.8 = 1610.8

## Converting Elo to Win Probability

Expected_Result is directly the probability of winning (accounting for draws via the standard split: e.g. 60% expected → 50% win, 17% draw, 33% loss).

For more accurate 1X2 probabilities, combine the Elo win probability with the historical draw rate for similar match quality differentials.

## Advantages of Elo

- Simple to calculate and update
- Self-correcting: overrated teams lose points until their rating reflects their true quality
- Produces match win probabilities directly

## Limitations

- Does not incorporate within-match information (goals scored, chances created)
- K factor choice significantly affects responsiveness vs stability
- Does not model home advantage directly (must be added manually)',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expected Goals as a Probability Input', 'xg-probability-input',
'## xG as the Raw Material

Expected Goals (xG) is the single most powerful public input for football probability models. By modelling each shot as a probability of scoring (based on location, shot type, assist type), xG provides a much more stable measure of team quality than actual goals.

## The xG-to-Probability Pipeline

**Step 1: Estimate team xG rates**
For each team, calculate rolling average xG scored per match (λ_attack) and xG conceded per match (λ_defence) over the last 15–20 matches.

**Step 2: Calculate match-level expected goals**
λ_home_scores = (Home team λ_attack × Away team λ_defence) / League average λ
λ_away_scores = (Away team λ_attack × Home team λ_defence) / League average λ

**Step 3: Apply home advantage**
Multiply home team λ by home advantage factor (typically 1.10–1.15).

**Step 4: Apply the Poisson distribution**
Use λ_home and λ_away to generate the full scoreline probability matrix.

**Step 5: Aggregate into market probabilities**
Sum scoreline probabilities → 1X2, Asian handicap, over/under probabilities.

## Why xG Outperforms Results-Based Models

xG-based ratings are more predictive of future results than results-based ratings because:
- xG is less volatile than goals (averages out over fewer matches)
- xG reflects chances quality, which is more under team control than conversion
- xG identifies over/under-performing teams earlier than results alone

## Data Sources

Free xG data: Understat, FBref, Sofascore (partially), WhoScored (partially)
Paid xG data: StatsBomb, Opta, Wyscout (institutional quality)',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Time-Weighting and Recency in Probability Models', 'time-weighting-recency-models',
'## The Staleness Problem

Historical data is not equally informative. A match played 18 months ago is less informative about a team''s current ability than a match played 3 weeks ago. A model that weights all historical data equally gives excessive influence to stale information.

## Exponential Time-Weighting

The most common approach: apply exponential decay to historical match weights.

Weight(match) = exp(−decay × days_since_match)

Where decay controls how quickly old data becomes irrelevant.

- decay = 0.003: match 3 months ago has weight ≈ 75%
- decay = 0.006: match 3 months ago has weight ≈ 57%

Typical range used in football models: decay = 0.002 to 0.005.

## Choosing the Decay Parameter

The optimal decay parameter can be estimated by backtesting: test different decay values on historical data and identify which produces the most accurate probability estimates (lowest log-loss on held-out matches).

## Seasonal Discontinuity

At the start of a new season, there is a structural break: team composition changes, manager tactics may evolve, key transfers occurred. The simplest approach: discard all data from before the previous season, or assign very low weight (5–10%) to data older than 6 months.

## The Summer Transfer Window Problem

If a team loses its top striker and goalkeeper in the summer, last season''s data is particularly uninformative. Incorporate transfer data as a qualitative adjustment layer on top of the time-weighted historical model.

## Opponent-Adjusted Ratings

Raw xG rates are affected by the quality of opponents faced. An attack that produces 2.5 xG/match against low-quality defences is not equivalent to one producing 2.5 xG/match against top defences. Adjust team ratings for opponent quality in every historical match — this is called "strength of schedule adjustment."',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Beta Distribution for Probability Estimation', 'beta-distribution-probability',
'## Modelling Uncertainty in Probabilities

You estimate that a team wins 52% of matches. But how confident are you in this estimate? The beta distribution models uncertainty about a probability itself.

## The Beta Distribution Parameters

The beta distribution β(α, β) on [0,1] has:
- Mean = α / (α + β)
- Variance = αβ / ((α+β)² × (α+β+1))

**Interpretation:** You can think of α as the number of "successes" observed and β as the number of "failures." A team that has won 52 of their last 100 matches has α = 52, β = 48.

## Using Beta for Credible Intervals

The 95% credible interval for team win probability from 100 matches (52 wins, 48 losses):
Using the beta distribution: approximately [42%, 62%]

This is the Bayesian equivalent of a confidence interval: "I am 95% confident the true win probability lies between 42% and 62%."

## Prior Information and Bayesian Updating

The beta distribution naturally incorporates prior information:

Prior: Team is average (β(50, 50) → 50% win probability with moderate confidence)
New data: 10 matches, 6 wins

Posterior = β(50+6, 50+4) = β(56, 54) → mean = 56/110 = 50.9%

The prior tempers the new information: we do not leap from 50% to 60% after just 10 matches.

As more matches accumulate, the posterior approaches the pure observed win rate — the data gradually dominates the prior.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Court and Surface Effects: Distribution Applications', 'court-surface-distribution',
'## Surface as a Probability Modifier

Different playing surfaces produce systematically different probability distributions for key statistics. Identifying these surface effects and incorporating them into probability models produces measurable accuracy improvements.

## Football: Grass vs Artificial Turf

Research shows artificial turf (used in some Scandinavian and lower-division leagues) produces:
- Approximately 0.2–0.4 more goals per match
- Higher passing completion rates
- Different injury patterns (surface-specific conditioning)

A model without a turf adjustment will systematically underestimate goals in turf league matches.

## Tennis: Clay vs Grass vs Hard

Surface is the most significant predictor in tennis, often overriding raw player quality:
- **Clay:** Long rallies, lower service dominance, higher break point percentage
- **Grass:** Short points, high service dominance, fewer breaks
- **Hard:** Intermediate — most variable depending on specific court speed

Statistical profiles on each surface should be modelled separately. A clay specialist''s win probability on grass may be 15–20 percentage points lower than their clay probability against the same opponent.

## Basketball: Home vs Away

NBA home court advantage is more stable and larger than in most sports: approximately 3–4 points per game. Regular season vs playoff home advantage differs significantly (playoff away teams perform closer to home).

## Golf: Course Characteristics

Specific course types (links, parkland, elevation) correlate with specific skill sets. Long hitters outperform on wide courses; accurate iron players outperform on tight courses. Course history for each player is among the most predictive factors in golf models.

Building course/surface/venue-specific adjustments is a key differentiator for sport-specific models.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Distribution Theory: The Complete Toolkit', 'expert-distribution-theory',
'## The Distribution Toolkit

An expert quantitative bettor maintains fluency with the full distribution toolkit:

| Distribution | When to Use | Key Parameters |
|---|---|---|
| Poisson | Goals, points scored, events per time period | λ (rate) |
| Negative Binomial | Over-dispersed count data | μ (mean), r (dispersion) |
| Binomial | Binary outcomes over n trials | n (trials), p (probability) |
| Normal | Large-sample aggregates, P&L distributions | μ, σ |
| Beta | Uncertainty about a probability | α, β |
| Elo/Bradley-Terry | Pairwise comparison and ranking | Team ratings |

## Combining Distributions

The most powerful models combine multiple distributions:
- Poisson for each team''s goals → scoreline matrix
- Dixon-Coles correction for low-score adjustment → improved scoreline matrix
- Beta distribution for team rating uncertainty → probability intervals, not points
- Normal approximation for portfolio P&L → risk management

## The Simulation Approach

When analytical formulae become complex, simulation is often more practical:
1. Draw each team''s expected goals from its beta distribution (incorporating uncertainty)
2. Draw actual goals from a Poisson distribution with the drawn expected goals
3. Generate the match result
4. Repeat 100,000 times

The output is a full probability distribution over match results that properly accounts for both model uncertainty and outcome variance.

## Building Distributional Intuition

The expert bettor develops distributional intuition: the ability to immediately recognise what distribution governs a specific situation and roughly what that distribution predicts. This intuition is built through years of working with these distributions in real betting contexts — seeing predictions vs outcomes thousands of times.

The combination of formal distribution knowledge and calibrated intuition is the foundation of expert quantitative analysis.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'probability-distributions-sport' AND cat.slug = 'statistical-thinking';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — Building Predictive Models                  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Model Building Pipeline', 'model-building-pipeline',
'## From Data to Probability

Building a sports prediction model follows a reproducible pipeline. Each step must be completed before the next begins — shortcuts at any stage compromise the entire output.

## The Six-Stage Pipeline

**Stage 1 — Define the question:**
What exactly are you predicting? Match winner? Goals scored? Player performance metric? The prediction target must be precisely defined before data collection begins.

**Stage 2 — Collect and clean data:**
Identify data sources, collect historical data, clean for errors and missing values, structure for analysis. This stage takes the most time.

**Stage 3 — Feature engineering:**
Create the input variables (features) from raw data. Examples: rolling average xG, home/away performance split, head-to-head record, days since last match.

**Stage 4 — Model specification:**
Choose the model structure: Poisson regression, logistic regression, Elo rating, or machine learning approach. Simple models should be tried before complex ones.

**Stage 5 — Estimation:**
Fit the model to historical data. Estimate parameters.

**Stage 6 — Evaluation:**
Test the model on held-out data. Measure probability accuracy. Compare to the market.

## The Minimum Viable Model

A first model does not need to be sophisticated. A minimum viable model:
- Uses 3–5 input features (home xG rate, away xG rate, home advantage, rest days difference, relative position)
- Uses Poisson regression with these features as predictors
- Produces match-level goal probabilities from which all market probabilities can be derived

Build the MVP first. Evaluate it. Improve iteratively.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Data Collection and Management', 'data-collection-management',
'## The Data Foundation

Your model is only as good as the data it is trained on. Data quality, completeness, and appropriate scope are the most important determinants of model quality — more important than model complexity.

## What Data You Need

For a football goals model:

**Match-level data:**
- Date, competition, home team, away team
- Full-time score
- Match xG (home and away) — per shot
- Match xGA (home and away conceded)
- Pre-match odds (opening and closing)

**Team-level data (derived from match data):**
- Rolling xG scored per match (5, 10, 15-match windows)
- Rolling xGA per match (5, 10, 15-match windows)
- Home and away splits

**Contextual data:**
- Days rest before match
- Match significance (cup, league, European)
- Stadium capacity / attendance (where available)
- Weather data (for outdoor stadiums)

## Free Data Sources

| Source | Coverage | Format |
|---|---|---|
| FBref | Top 5 EU leagues + major comps | Web scraping / CSV download |
| Understat | Premier League, Bundesliga, La Liga, Serie A, Ligue 1, RFPL | JSON via API |
| football-data.co.uk | 30+ leagues, historical back to 1990s | CSV download |
| The Odds Portal | Historical odds | Web scraping |
| OpenWeatherMap | Historical weather | API (free tier) |

## Data Management Best Practices

- Store data in a structured database (SQLite for solo projects, PostgreSQL for teams)
- Automate data collection with weekly scripts
- Maintain a data changelog — when data was collected, from what source, and any known gaps
- Never overwrite raw data — always maintain the original as collected',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Feature Engineering for Betting Models', 'feature-engineering-betting',
'## What Are Features?

Features are the input variables that a predictive model uses to generate predictions. The quality of your feature engineering often matters more than the choice of model. Good features from a simple model beat poor features from a complex model.

## The Core Features for a Football Model

**Attack strength:**
Rolling average xG scored per match (home and away separately), opponent-adjusted.

**Defence strength:**
Rolling average xGA per match (home and away separately), opponent-adjusted.

**Home advantage:**
Binary flag (1 = home, 0 = away). Plus optionally: estimated home advantage multiplier from historical win rate for this specific team at home.

**Rest advantage:**
Days since last competitive match for each team. Difference between teams'' rest days.

**Form indicator:**
Points earned / expected points earned in last 5–10 matches. Captures recent trajectory.

**Motivation:**
Distance from a threshold (top 4, relegation, title) — teams fighting for something may be motivated differently. Operationalised as points gap to nearest relevant threshold.

## Feature Engineering Pitfalls

**Lookahead bias:** Using future information to calculate historical features. If you calculate a team''s "season-average xG" using all matches including those after the prediction date, you are cheating — your model will appear to work better than it does on genuinely future data.

**Overfitting through feature count:** More features allow the model to fit the training data better but generalise worse. Prefer fewer, theoretically motivated features.

**Collinearity:** Features that are highly correlated (home xG and home points per match are correlated) can destabilise model estimation. Test for correlation and drop redundant features.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Poisson Regression for Goals Modelling', 'poisson-regression-goals',
'## From Counts to Regression

Poisson regression models the expected count outcome (goals) as a function of input features. It is the most appropriate regression framework for modelling goals — which are non-negative integers.

## The Model Structure

log(λ_home) = β₀ + β₁ × home_xG_att + β₂ × away_xG_def + β₃ × home_advantage
log(λ_away) = β₀ + β₁ × away_xG_att + β₂ × home_xG_def

Where:
- λ_home, λ_away = expected goals for home and away team
- β coefficients are estimated from historical data
- log link ensures predictions are always positive

## Fitting the Model

In Python:
```
import statsmodels.api as sm
from statsmodels.genmod.families import Poisson

model = sm.GLM(goals_scored, features, family=Poisson())
result = model.fit()
```

In R:
```
model <- glm(goals_scored ~ home_xg_att + away_xg_def + home_adv,
             data = match_data, family = poisson())
```

## Interpreting Coefficients

Coefficients are on the log scale. exp(β) gives the multiplicative effect on expected goals.

If β₁ = 0.45 for home_xG_att: exp(0.45) = 1.57, meaning a 1-unit increase in home xG attack rate multiplies expected goals by 1.57.

## Generating Predictions

For a new match: calculate λ_home and λ_away from the fitted model. Apply Poisson distribution to generate the full scoreline probability matrix. Aggregate into 1X2, Asian handicap, and over/under probabilities.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Logistic Regression for Match Outcomes', 'logistic-regression-outcomes',
'## When You Want Win Probability Directly

Logistic regression models the probability of a binary outcome (win/not win) directly as a function of input features. It is simpler than the two-stage Poisson approach and appropriate when you care about match result probabilities but not about the specific goal distribution.

## The Model Structure

P(home win) = 1 / (1 + e^(−(β₀ + β₁×X₁ + β₂×X₂ + ...)))

This S-shaped function maps any linear combination of features to a probability between 0 and 1.

## Fitting a 1X2 Logistic Model

Features: home strength (xG differential per match), away strength, home advantage, rest differential.

In Python:
```
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train)  # y = 0 (home loss), 1 (draw), 2 (home win)
```

For three-outcome modelling, use multinomial logistic regression.

## Calibration Requirement

A logistic model''s output must be calibrated — the predicted probability should match the actual frequency. If the model predicts 70% home win probability, home teams should win approximately 70% of those matches.

Test calibration using the calibration curve (reliability diagram). Isotonic regression or Platt scaling can correct miscalibrated outputs.

## Logistic vs Poisson Approach

| Aspect | Logistic Regression | Poisson Regression |
|---|---|---|
| Prediction target | Win probability directly | Goal distribution → all markets |
| Simplicity | Simpler | More complex |
| Market coverage | 1X2, basic AH | All markets (O/U, correct score, AH) |
| Recommended for | Beginners, 1X2 focus | Full market coverage |',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Handling Missing Data and Imputation', 'handling-missing-data',
'## The Missing Data Problem

Real sports datasets have missing values: matches with no xG data, player statistics for injured players, weather data gaps. How you handle missing data significantly affects model quality.

## Types of Missing Data

**MCAR (Missing Completely At Random):**
The probability of data being missing is unrelated to the true value or any other variable. Example: a random server error that dropped some match data. Safe to delete these observations.

**MAR (Missing At Random):**
The probability of data being missing depends on other observed variables but not on the missing value itself. Example: xG data missing for lower leagues (smaller league → less data collection). Can be imputed using observed data.

**MNAR (Missing Not At Random):**
The probability of data being missing depends on the missing value itself. Example: match attendance data missing when attendance was unusually low (embarrassing for the club). The missingness is informative — imputation is problematic.

## Imputation Strategies

**Mean/median imputation:** Replace missing values with the mean (continuous) or mode (categorical) of the observed values. Simple but ignores patterns.

**Regression imputation:** Model the missing variable as a function of other variables and use the predicted value. Better than mean imputation.

**Multiple imputation:** Create multiple datasets with different imputed values, run the model on each, and combine results. The gold standard for MCAR/MAR situations.

**Indicator approach:** Add a binary "is_missing" feature alongside the imputed value. Lets the model learn whether missingness itself is predictive.

## The Practical Recommendation

For betting models: track the volume of missing data per variable. If > 20% of observations for a key feature are missing, the feature may not be reliable enough to use. Below 5%: any imputation method works adequately.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Model Iteration: From V1 to a Production Model', 'model-iteration-production',
'## Start Simple, Improve Deliberately

Every production model started as a simple prototype. The iteration process — evaluate, identify limitations, hypothesize improvement, implement, re-evaluate — is the mechanism of model improvement.

## Version 1: The Baseline

A Version 1 football model might include only:
- Home team xG attack rate (5-match rolling)
- Away team xG defence rate (5-match rolling)
- Home advantage (fixed coefficient)

Evaluate V1: calculate log-loss on held-out matches. Compare to the naive baseline (always predict 45% home, 25% draw, 30% away). If V1 beats the naive baseline: it is adding information. Track CLV on all bets placed with V1.

## Version 2: Adding Features

Identify where V1 is most wrong. Analyse by:
- Match type (cup vs league — does V1 misjudge cups?)
- Rest days (does V1 mishandle fixture congestion?)
- Season position (early season vs mid-season accuracy?)

Add the feature that addresses the most common systematic error. Re-evaluate on held-out data.

## Version N: The Production Model

After 5–10 iterations, each adding one tested feature:
- Weekly automated data update pipeline
- Automated prediction generation for all qualifying matches
- Automated CLV comparison against live market prices
- Alert system for matches exceeding CLV threshold

The production model is not necessarily more complex than V1 — it is better calibrated and proven on out-of-sample data.

## The Danger of Over-Iteration

Each added feature risks overfitting: the model learns noise from the training data rather than genuine signal. After each addition, test on held-out data. If held-out performance does not improve: discard the feature regardless of training performance.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Multi-League Modelling: Challenges and Solutions', 'multi-league-modelling',
'## Should One Model Cover All Leagues?

A single model trained across all leagues simultaneously has advantages (more data) and disadvantages (different dynamics in different leagues may dilute the signal).

## The Case for League-Specific Models

Different leagues have genuinely different statistical profiles:
- Average goals per match: Bundesliga (3.0) vs Serie A (2.5)
- Home advantage magnitude: Greece vs England
- Referee behaviour: cards per match varies dramatically across leagues
- Season length and cup competition calendar varies

A model calibrated on Premier League data may produce systematically biased predictions for La Liga. League-specific models avoid this contamination.

## The Case for Unified Models

League-specific models have smaller training datasets — particularly problematic in lower leagues with shorter historical records. A unified model benefits from larger effective sample sizes and can learn cross-league patterns.

## The Hybrid Solution

Many production models use a hybrid approach:
1. **Global parameters:** Home advantage, rest effect, motivation effects — estimated across all leagues (large sample)
2. **League-specific parameters:** Average goals rate, strength of schedule adjustments — estimated per league (smaller sample, league-specific signal)

This retains the efficiency gains of pooled data while allowing league-specific calibration.

## The New League Problem

When you want to start modelling a new league with limited historical data:
- Start by applying the nearest similar league''s parameters
- Collect 2 full seasons of data before building a league-specific model
- Use the hierarchical model approach: new league starts at the global mean and adapts as data accumulates',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Real-Time Model Updates: Match-Day Pipeline', 'real-time-model-updates',
'## The Match-Day Information Flow

A prediction model is most accurate when it incorporates the most recent available information. On match days, significant new information becomes available in a defined sequence:

**T-24 hours:** Manager press conference signals
**T-2 hours:** Official lineup release
**T-1 hour:** Pre-match warm-up observation
**T-0:** Kickoff odds (closing line)

Each information release requires a model update.

## The Lineup Update

The most significant match-day information update is lineup confirmation. The impact of specific absences on team probability must be pre-calculated:

For each of the top 20 players in your target leagues:
- Calculate xG impact of their absence (from historical matches played/not played)
- Calculate how often they miss matches (injury / suspension / rotation risk)
- Pre-calculate the probability adjustment for their confirmed absence

When lineups confirm, apply the pre-calculated adjustments automatically.

## The Weather Update

For outdoor sports: pull the final weather forecast (2-hour window) at T-1 hour. Apply pre-calculated weather adjustments (wind → reduced goals, rain → reduced goals, extreme cold → reduced goals).

## The Closing Line Comparison

At T-0 (kickoff): record Pinnacle''s opening and closing prices for every match you have predictions for. The move from opening to closing represents the aggregate sharp money flow. If Pinnacle moves significantly against your prediction direction: investigate what information you may have missed.

## Automation

The full match-day pipeline can be automated in Python with:
- Scheduled scripts for lineup scraping (FBref, official club Twitter)
- Weather API calls
- Automated Pinnacle price recording
- CLV calculation post-result
- Dashboard update with all predictions and outcomes',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Model Architecture: The Full Production System', 'expert-model-architecture',
'## What a Production Model Actually Looks Like

A production sports prediction model is not a single script or spreadsheet. It is an integrated system of components that collect data, process it, generate predictions, compare to markets, and track performance.

## The Component Architecture

**Data Layer:**
- Automated data collection scripts (match data, xG, lineups, weather, odds)
- Database (PostgreSQL): tables for matches, teams, players, predictions, bets
- Data quality checks: automated alerts for missing data or outlier values

**Processing Layer:**
- Feature calculation: rolling averages, strength adjustments, recency weights
- Rating updates: team ratings recalculated after each match
- Prediction generation: Poisson regression + Dixon-Coles → probability matrix

**Market Comparison Layer:**
- Live odds collection (Pinnacle API or scraping)
- Expected Value calculation: (Model probability − Implied probability) × odds
- Value threshold filter: only matches above CLV threshold enter bet candidates

**Execution Layer:**
- Bet candidate list generated automatically
- Stake calculation: Kelly fraction applied to model probability and best available price
- Manual bet placement (or API integration for automated placement)
- Bet log update: automatic recording with all metadata

**Reporting Layer:**
- Real-time dashboard: current bankroll, daily P&L, weekly CLV
- Post-match CLV calculation: predicted vs closing Pinnacle
- Monthly automated report generation

## Technology Stack

A solo bettor can build this with:
- Python (data collection, processing, prediction)
- SQLite or PostgreSQL (database)
- Jupyter Notebook or VSCode (development)
- Google Sheets or Tableau (dashboard)
- GitHub (version control)

A team can extend to cloud infrastructure (AWS/GCP), real-time data streams, and web-based dashboards.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-predictive-models' AND cat.slug = 'statistical-thinking';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Model Evaluation and Calibration            ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Train/Test Split and Out-of-Sample Testing', 'train-test-split-testing',
'## Why In-Sample Testing Is Misleading

If you fit a model on a dataset and then evaluate it on the same dataset, you will always get an overly optimistic result. The model has "seen" the answers and has been optimised for them. This is in-sample evaluation — it tells you how well the model memorised the training data, not how well it predicts the future.

## The Train/Test Split

The solution: reserve a portion of data exclusively for testing. The model never sees this data during training.

Standard split:
- 70–80% of data: training set (model fitted on this)
- 20–30% of data: test set (model evaluated on this)

For time-series data (sports matches are time-ordered), use a temporal split: all matches before date X for training, all matches after date X for testing. Do not randomly shuffle time-series data — this introduces lookahead bias.

## Walk-Forward Testing

Even a single temporal split can be misleading if the split date is chosen to favour the model. Walk-forward testing (also called rolling window validation) is more robust:

1. Train on months 1–12. Test on month 13.
2. Train on months 2–13. Test on month 14.
3. Continue rolling forward.
4. Aggregate test results across all periods.

This simulates how the model would perform in genuine real-time deployment.

## The Minimum Test Set Size

A test set must be large enough to provide statistically meaningful evaluation. For a betting model:
- Minimum test set: 300 matches per league
- Preferred: 500+ matches per league
- Multiple seasons preferred over a single season (captures different competitive environments)',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Log-Loss: The Proper Scoring Rule for Probabilistic Models', 'log-loss-scoring-rule',
'## Beyond Accuracy: Why We Need Proper Scoring Rules

Accuracy (percentage of correct predictions) is a poor evaluation metric for probabilistic models. A model that always predicts "home team wins" achieves 45% accuracy — not because it is good, but because home teams win approximately 45% of matches.

Proper scoring rules evaluate the full probability distribution, rewarding confident correct predictions and penalising confident wrong predictions.

## Log-Loss (Cross-Entropy)

Log-loss is the standard proper scoring rule for probabilistic predictions:

Log-Loss = −(1/n) × Σ [y_i × log(p_i) + (1−y_i) × log(1−p_i)]

Where:
- y_i = actual outcome (1 or 0)
- p_i = predicted probability

**Example:** You predict 70% home win. Home team wins.
Contribution = −log(0.70) = 0.357

**Contrast:** You predict 70% home win. Away team wins.
Contribution = −log(1−0.70) = −log(0.30) = 1.204

Confident wrong predictions are heavily penalised. This incentivises well-calibrated probabilities.

## Interpreting Log-Loss

Lower log-loss = better model. The naive baseline (always predicting base rates, e.g. 45%/25%/30% for home/draw/away) gives a reference log-loss.

Your model''s log-loss should be significantly below the naive baseline to justify its use.

## Brier Score

The Brier score is an alternative proper scoring rule:
Brier = (1/n) × Σ (p_i − y_i)²

Lower Brier score = better calibration. Also rewards confident correct predictions, but less steeply than log-loss.

Both metrics are appropriate for betting model evaluation. Log-loss is more commonly used in the machine learning community; Brier score in the academic sports statistics literature.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Calibration Curves and Reliability Diagrams', 'calibration-curves-reliability',
'## What Is Calibration?

A model is perfectly calibrated if, for all matches where it predicts 60% home win probability, the home team wins 60% of the time. In reality, most models are miscalibrated in specific ranges.

## The Calibration Curve

To build a calibration curve (reliability diagram):

1. Group all predictions into probability bins (0–10%, 10–20%, ..., 90–100%)
2. For each bin: calculate average predicted probability and actual outcome frequency
3. Plot predicted probability (x-axis) vs actual frequency (y-axis)

A perfectly calibrated model lies on the diagonal (y = x line). Points above the diagonal: model underestimates probability. Points below: model overestimates.

## Common Miscalibration Patterns

**Overconfidence:** The calibration curve is flatter than the diagonal — predictions of 80% correspond to 65% actual frequency. The model is too confident.

**Underconfidence:** The calibration curve is steeper than the diagonal — predictions of 80% correspond to 90% actual frequency. The model is too conservative.

**Range miscalibration:** The model is well-calibrated in the 40–60% range but poorly calibrated at extremes. Common in models fitted primarily on "competitive" matches.

## Fixing Miscalibration

**Platt scaling:** Fit a logistic regression on the model''s raw output vs outcomes. Use the logistic regression''s output as the final probability.

**Isotonic regression:** A more flexible, non-parametric calibration method. Preferred when calibration errors are non-monotonic.

**Beta calibration:** Uses the beta distribution to calibrate probability outputs. Best theoretical fit for probability-valued outputs.

After applying calibration, rebuild the calibration curve and confirm improvement.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Backtesting Against Historical Odds', 'backtesting-historical-odds',
'## Simulating Historical Betting Performance

Backtesting applies your model''s historical predictions to historical betting markets, simulating what profit you would have made if you had bet on the model''s signals.

## The Backtesting Setup

For each historical match in your test period:
1. Calculate your model''s probability at the time (using only information available before the match)
2. Compare to the available odds from historical odds databases (Pinnacle, BetBrain, Odds Portal)
3. Calculate EV: (Model probability / Implied probability − 1) × 100
4. If EV > threshold: record a simulated bet
5. Calculate P&L: (odds − 1) if match result matches selection; −1 otherwise
6. Aggregate across all simulated bets: total units staked, total profit, ROI

## Critical Requirements for Valid Backtesting

**No future data:** Model features must use only data available before the match. Rolling averages must be calculated on data up to but not including the match being predicted.

**Use closing odds, not opening odds:** Opening odds reflect initial estimates; closing odds reflect the market''s best estimate after all information is processed. Your model should beat closing odds, not opening odds.

**Include all bets above threshold:** Do not cherry-pick. If your rule says "bet when EV > 3%," record every bet above this threshold — including losses. Cherry-picking surviving bets produces fictional backtested performance.

## Interpreting Backtested CLV

The most meaningful backtesting result: your model''s predictions have positive average CLV against Pinnacle closing prices. If this is positive across 1,000+ historical matches: your model has demonstrated genuine historical edge.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Cross-Validation Techniques for Sports Data', 'cross-validation-sports-data',
'## Beyond Train/Test Split

Cross-validation improves on a single train/test split by using the data more efficiently — training and testing on multiple splits and averaging the results.

## K-Fold Cross-Validation

Standard k-fold:
1. Split data into k equal folds (e.g. k=5)
2. For each fold: train on the other k−1 folds, test on this fold
3. Average test performance across all k folds

**Problem for time-series data:** Standard k-fold randomly assigns matches to folds, which allows future data to inform predictions of past matches — a form of lookahead bias.

## Time-Series Cross-Validation

For sports data, use time-blocked cross-validation:
- Block 1: Train on season 1, test on first half of season 2
- Block 2: Train on seasons 1–2, test on second half of season 2
- Block 3: Train on seasons 1–2, test on season 3
- Continue...

This preserves the temporal ordering and simulates real deployment conditions.

## The Leave-One-Match-Out Test

Extreme version: for each match, train on all other matches and predict this one. Most computationally expensive but most rigorous.

For computational efficiency: leave-one-season-out is more practical and nearly as informative.

## Nested Cross-Validation for Hyperparameter Tuning

When you are also selecting model hyperparameters (e.g. decay rate, regularisation strength): use nested cross-validation.

- Outer loop: splits for model evaluation
- Inner loop: splits for hyperparameter selection within the training set

This prevents "double-dipping" on the test set for both hyperparameter selection and evaluation.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Comparing Models: Selecting the Best Approach', 'comparing-models-selection',
'## The Model Comparison Framework

At some point, you will have multiple candidate models: Poisson regression, Elo ratings, logistic regression, machine learning. How do you decide which to use?

## The Comparison Metrics

Evaluate each candidate on the same held-out test set. Compare:

1. **Log-loss:** Which model produces the best-calibrated probability estimates?
2. **CLV against Pinnacle closing:** Which model''s bets would have had the highest average CLV?
3. **Simulated ROI:** Which model would have produced the highest ROI in backtesting?
4. **Stability:** Does the model''s performance hold across different seasons and competitions?

## The Statistical Significance of Differences

A difference in log-loss of 0.002 between two models on 500 matches is unlikely to be meaningful. Calculate whether the difference is statistically significant before concluding one model is superior.

Permutation test: randomly shuffle model A vs model B predictions 1,000 times and calculate the log-loss difference distribution. If the observed difference falls outside the 95th percentile of the shuffled distribution: the difference is statistically significant.

## The Ensemble Option

If multiple models each have genuine but distinct predictive information, combining them (ensemble) often outperforms any single model:

Combined probability = w₁ × P_model1 + w₂ × P_model2 + ... (weights sum to 1)

Optimal weights can be estimated by minimising log-loss on a validation set.

## The Parsimony Principle

When two models produce similar performance: choose the simpler one. Simpler models are easier to maintain, easier to debug when they fail, and less likely to have overfitted subtle patterns in historical data.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Overfitting: Recognition and Prevention', 'overfitting-recognition-prevention',
'## The Overfitting Problem

Overfitting occurs when a model learns to predict the training data too well — including the noise, not just the signal. An overfitted model performs well in sample but poorly out of sample.

## Signs of Overfitting

- Training performance significantly better than test performance
- Model has many parameters relative to training data size
- Removing or adding individual training examples significantly changes predictions
- Calibration on training data is good; calibration on test data is poor

## The Bias-Variance Tradeoff

All models face the bias-variance tradeoff:
- **High bias (underfitting):** Model is too simple to capture the true pattern. High error on both training and test data.
- **High variance (overfitting):** Model is too complex, fitting noise. Low training error, high test error.
- **Optimal:** Model captures the true signal without fitting the noise.

## Prevention Strategies

**1. Regularisation:**
Add a penalty for complexity to the model''s loss function. L2 regularisation (Ridge): shrinks all coefficients toward zero. L1 regularisation (Lasso): forces some coefficients to exactly zero (feature selection).

**2. Early stopping:**
In iterative models: stop training when test performance stops improving (even if training performance continues improving).

**3. Feature reduction:**
Fewer features = lower overfitting risk. Use domain knowledge to select theoretically motivated features.

**4. Cross-validation:**
Rigorous time-series cross-validation reveals overfitting — models that overfit show large train/test performance gaps.

**5. Minimum sample per feature:**
Rule of thumb: at least 50–100 observations per model parameter. A 10-feature model needs 500–1,000 training matches.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Live Model Monitoring and Drift Detection', 'live-model-monitoring-drift',
'## Models Degrade Over Time

A model fitted on historical data reflects the world as it was when that data was collected. As the sport evolves — tactical innovations, rule changes, player quality changes — the model may become less accurate.

This degradation is called model drift.

## Types of Model Drift in Sports

**Concept drift:** The underlying relationship between features and outcomes changes. Example: the introduction of VAR changed the probability of certain match outcomes (more late decisions, fewer "wrong" goals stand).

**Data drift:** The distribution of input features changes. Example: the average goals per match in a league changes over multiple seasons due to tactical evolution. A model trained on 3.0 goals/match average will underestimate goals in a 2.6 goals/match era.

**Covariate shift:** The types of matches in the market change. Example: expansion to a new league with different characteristics.

## Drift Detection Methods

**Performance monitoring:** Track log-loss and CLV on a rolling 100-match window. A sustained deterioration is evidence of drift.

**Feature distribution monitoring:** Track the distribution of key features (average goals per match, home win rate) over time. Significant shifts indicate data drift.

**Residual analysis:** Track model residuals (predicted − actual) over time. If residuals show a systematic trend (consistently positive or negative in a specific period), the model is miscalibrated for current conditions.

## The Response Protocol

On detection of significant drift:
1. Identify the source (concept drift vs data drift)
2. Update the training data window (remove oldest data, add recent)
3. Re-estimate model parameters
4. Evaluate on most recent held-out data
5. Deploy updated model',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Value of Prediction: Attributing P&L to Model Quality', 'attribution-model-quality',
'## Where Does P&L Come From?

A bettor who makes money has generated that return from some combination of:
1. Model edge (probability estimates better than the market)
2. Price hunting (consistently finding better prices than the market average)
3. Timing (placing bets at better prices than later available)
4. Variance (lucky outcomes in excess of expected value)

Attributing P&L correctly to these sources tells you what to invest in to improve performance.

## The Attribution Methodology

**Model edge attribution:**
Compare model probability to Pinnacle closing probability. Average CLV across all bets is the model edge contribution.

**Price hunting attribution:**
Compare price taken to Pinnacle closing price. Average of (price taken / Pinnacle closing − 1) across all bets is the price hunting contribution.

**CLV = Model edge + Price hunting** (approximately)
**Actual ROI = CLV + Variance**

## The Insight

If CLV is positive but actual ROI is negative: variance is responsible. Continue operating — the model is working.
If CLV is negative but actual ROI is positive: variance is responsible for the profit. The model is not working — do not be deceived by the results.
If both CLV and ROI are positive: model edge confirmed. Scale appropriately.

## The Model Quality Benchmark

The model''s contribution to CLV (estimated by comparing model probability to market probability) is the cleanest measure of model quality. A model that consistently outperforms the closing line is contributing genuine value — regardless of results in any specific period.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Evaluation: The Complete Model Review Protocol', 'expert-model-review-protocol',
'## The Quarterly Model Review

Expert-level model management includes a formal quarterly review that evaluates every component of model performance and generates specific improvement actions.

## The Review Checklist

**Performance metrics:**
- Log-loss (rolling 500 matches): above or below baseline?
- Average CLV (rolling 500 bets): positive, neutral, or negative?
- Calibration curve: any systematic bias at specific probability ranges?
- ROI by market type: which markets are profitable, which are not?

**Model health checks:**
- Feature importance: are the expected features most predictive? (If unexpected features dominate, investigate)
- Coefficient stability: have model coefficients changed significantly from last quarter? (Large changes suggest data drift)
- Residual distribution: are residuals normally distributed? Systematic patterns indicate model misspecification

**Data quality:**
- Missing data rate: higher than last quarter? (Indicates data source issues)
- Feature distribution: significant shifts vs last quarter? (Indicates potential concept drift)
- Match coverage: are all target leagues fully covered?

**Market comparison:**
- Opening vs closing CLV split: is edge concentrated at opening or maintained through closing? (Opening concentration suggests information is quickly priced in — threat to edge longevity)
- CLV by bookmaker: which bookmakers offer the best lines? Have any changed?

## The Improvement Backlog

Each review produces a prioritised improvement backlog:
- High priority: features that should improve calibration based on clear error pattern
- Medium priority: additional data sources to integrate
- Low priority: algorithmic improvements to investigate in the next research cycle

## The Long-Run Perspective

A model review protocol applied consistently over 3+ years produces a richly documented model evolution history: what was changed, why, and what effect it had. This history is the intellectual property of the operation — irreplaceable and compounding in value.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'model-evaluation-calibration' AND cat.slug = 'statistical-thinking';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — Advanced Quantitative Methods               ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Introduction to Machine Learning for Sports', 'intro-ml-sports-betting',
'## Why Machine Learning?

Machine learning (ML) methods can discover complex non-linear patterns in data that traditional regression models miss. In sports prediction, ML has shown improvements over linear models particularly for:
- High-dimensional feature spaces (many variables)
- Non-linear interactions between features (e.g. rest × quality interaction)
- Sequence data (in-game event streams)

## The Appropriate Scope for ML in Betting

ML is not a replacement for domain knowledge and proper statistical foundations. It is an additional tool, most valuable when:
- You have enough data (minimum: 3,000 historical matches per league for reliable ML)
- You have strong feature engineering (garbage in = garbage out, more so for ML)
- You have proper validation methodology (overfitting risk is higher with ML)

## Key ML Methods for Sports Prediction

**Random Forest:** Ensemble of decision trees. Good at capturing non-linear effects. Robust to noise. Less interpretable than regression.

**Gradient Boosting (XGBoost, LightGBM):** State-of-the-art for tabular data. Often the best-performing method on sports prediction benchmarks.

**Neural Networks:** Powerful for large datasets and sequence data (event streams). Requires the most data and tuning.

## The Starting Point

Begin with XGBoost (or LightGBM) as your ML baseline. It consistently outperforms simpler methods on sports tabular data with minimal hyperparameter tuning. Compare its out-of-sample log-loss to your Poisson regression baseline. Only adopt ML if it meaningfully improves performance.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Random Forest and Gradient Boosting in Practice', 'random-forest-gradient-boosting',
'## Gradient Boosting for Match Prediction

Gradient boosting builds an ensemble of decision trees sequentially. Each tree corrects the errors of the previous ones. The result is a powerful, flexible model capable of capturing complex patterns.

## Implementation with XGBoost

```python
import xgboost as xgb
from sklearn.model_selection import TimeSeriesSplit

# Prepare features and target
X = match_data[feature_columns]
y = match_data[''home_goals'']  # or outcome label

# Time-series cross-validation
tscv = TimeSeriesSplit(n_splits=5)
log_losses = []

for train_idx, test_idx in tscv.split(X):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        eval_metric=''mlogloss''
    )
    model.fit(X_train, y_train)
    probs = model.predict_proba(X_test)
    log_losses.append(log_loss(y_test, probs))
    
print(f"Average log-loss: {np.mean(log_losses):.4f}")
```

## Hyperparameter Tuning

Key parameters for sports prediction:
- `max_depth`: 3–5 (deeper trees overfit more easily)
- `learning_rate`: 0.01–0.1 (lower = slower learning, less overfitting)
- `n_estimators`: 100–500 (more = more complex model)
- `subsample`: 0.6–0.9 (random subsample of data per tree, reduces overfitting)

Use grid search or Bayesian optimisation with time-series cross-validation to find the best combination.

## Feature Importance

XGBoost produces feature importance scores — which features contributed most to the model''s predictions. Use this to:
- Identify the most valuable features for collection and maintenance
- Remove low-importance features that add noise
- Generate hypotheses about what drives match outcomes',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Hierarchical Models for Multi-League Analysis', 'hierarchical-models-leagues',
'## The Partial Pooling Problem

When modelling multiple leagues simultaneously, you face two extremes:
- **Complete pooling:** Treat all leagues as identical — one model for all. Ignores real inter-league differences.
- **No pooling:** Separate model per league — each uses only its own data. Poor for leagues with small data.

Hierarchical (multilevel) models offer a third option: **partial pooling** — leagues share information, but each retains its own estimates.

## How Hierarchical Models Work

In a hierarchical model, league-specific parameters are assumed to come from a common distribution:

β_league_k ~ Normal(μ_β, σ_β)

Where μ_β and σ_β are global parameters estimated from all leagues. This "shrinks" small-league estimates toward the global mean — appropriate when data is sparse.

## An Example: Home Advantage

Global home advantage: μ_HA = 0.35 (on log scale for Poisson model)
League-specific home advantages:
- Premier League: 0.28 (slight shrinkage toward global mean)
- Greek Super League: 0.42 (larger home advantage)
- New expansion league: 0.35 (little data → strong pull to global mean)

The new expansion league''s estimate is heavily regularised toward the global mean — appropriate given limited data.

## Implementation

Hierarchical models can be implemented in:
- Python: PyMC (Bayesian), statsmodels (frequentist mixed effects)
- R: lme4, brms
- Stan: most flexible, full Bayesian inference

For most betting applications, the lme4/statsmodels approach (frequentist mixed effects) provides adequate partial pooling without the computational complexity of full Bayesian inference.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Ensemble Methods: Combining Multiple Models', 'ensemble-methods-combining',
'## Why Ensembles Work

No single model captures all the signal in sports data. Different models have different strengths:
- Poisson regression: excellent for goal distribution
- Elo ratings: captures long-run quality dynamics
- XGBoost: captures non-linear contextual effects
- Logistic regression: simple, well-calibrated for basic features

When these models disagree, they are providing complementary information. An ensemble that weights their outputs optimally outperforms any single model.

## Simple Ensemble: Averaging

The simplest ensemble: average the probability predictions of all models.

P_ensemble = (P_model1 + P_model2 + P_model3) / 3

This is surprisingly effective — the averaging reduces the individual models'' biases and variances.

## Weighted Ensemble: Stacking

Stacking (or blending) learns the optimal weights for each model''s contribution:
1. Generate out-of-sample predictions from each base model (using cross-validation)
2. Fit a meta-model (typically logistic regression or linear regression) on these predictions
3. The meta-model''s coefficients are the ensemble weights

The meta-model learns that model A is more reliable for high-stakes matches and model B is more reliable for lower leagues — and weights accordingly.

## The Diversity Requirement

Ensembles only work if the models are genuinely diverse (make different errors). Combining two near-identical models produces minimal improvement. The ideal ensemble combines models with:
- Different architectures (regression vs tree-based vs rating system)
- Different feature sets
- Different training data periods

## Practical Ensemble for a Betting Operation

A practical ensemble for a solo bettor:
- Base model: Poisson regression (the workhorse)
- Supplementary model: Elo ratings (captures quality dynamics)
- Ensemble: 70% Poisson + 30% Elo (weights from backtested log-loss minimisation)

Test this ensemble against each model individually. If it improves log-loss: use it. If not: the models are too correlated to benefit from ensembling.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Event-Level Modelling: Beyond Match-Level Data', 'event-level-modelling',
'## Going Deeper Than Match-Level Statistics

Most models operate at the match level: aggregate statistics per match (xG total, possession percentage, shots). Event-level modelling uses individual shot or pass events — producing much richer feature sets.

## What Event-Level Data Contains

Each shot event includes:
- x/y coordinates on the pitch
- Shot type (foot, head, direct free kick)
- Assist type (through ball, cross, none)
- Situation (open play, set piece, counter-attack)
- Whether the goalkeeper was in position
- Distance to goal, angle to goal

From these raw events, custom features can be constructed:
- Shot quality distribution (not just total xG, but how it is concentrated)
- High-danger chance rate (shots from zones with >25% conversion)
- Set piece xG contribution (separate from open play)
- Transition speed (time from defensive action to shot)

## Building an xG Model From Events

A custom xG model assigns a probability of scoring to each shot event, based on its characteristics. Fitting this on historical event data (tens of thousands of shots per season) produces highly granular probability estimates.

Advantages over public xG:
- Tailored to your target leagues and time period
- Incorporates features not in public models
- Can be updated in near-real-time from live event feeds

## The Data Requirement

Event-level data requires either:
- Paid commercial data feeds (StatsBomb, Opta, Wyscout)
- Open StatsBomb (free for research purposes, limited scope)
- Web scraping detailed match logs from sources like Understat (partial event data)

## The Analytical Advantage

Bettors using event-level models often find edge in markets that aggregate-level models miss: player-specific props, half-time markets, and in-play opportunities that depend on granular game-state information.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Principal Component Analysis for Feature Reduction', 'pca-feature-reduction',
'## The Curse of Dimensionality

As the number of features in a model increases, the data requirement for reliable estimation grows exponentially. With 50 features and 3,000 matches, you are in a high-dimensional regime where standard estimation methods struggle.

PCA (Principal Component Analysis) reduces dimensionality while preserving most of the information.

## How PCA Works

PCA finds the directions in feature space that explain the most variance. These directions are the "principal components" — uncorrelated linear combinations of the original features.

Steps:
1. Standardise all features (mean 0, standard deviation 1)
2. Compute the covariance matrix
3. Find eigenvectors (directions) and eigenvalues (variance explained)
4. Keep the top k components that explain 80–90% of total variance

The result: k new features (components) that are uncorrelated and together capture most of the information in the original 50 features.

## When to Use PCA in Betting Models

PCA is most useful when:
- You have many correlated features (team statistics are often highly correlated)
- You want to identify the underlying dimensions of team quality
- You are feeding features into a machine learning model that benefits from uncorrelated inputs

## A Sports Example

Team statistics (goals scored, shots, xG, possession, pass completion, pressing metrics) are highly correlated. PCA might find that:
- Component 1 (explains 45% of variance): "Attacking dominance" — high loadings on all attacking metrics
- Component 2 (explains 25% of variance): "Defensive solidity" — high loadings on defensive metrics
- Component 3 (explains 15% of variance): "Possession control" — high loadings on possession and pass accuracy

These 3 components replace the original many features with interpretable, uncorrelated dimensions.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Survival Analysis: Modelling Time-to-Event', 'survival-analysis-sports',
'## What Is Survival Analysis?

Survival analysis models the time until an event occurs. Originally developed for medical contexts (time until patient death), it applies naturally to sports events that occur as a function of time.

## Applications in Sports Betting

**Time to first goal:**
"What is the probability that the first goal occurs before the 30-minute mark?"

Survival analysis models the hazard rate (probability of a goal in the next minute, given no goal has yet occurred) as a function of time and match context.

**Manager survival:**
"How long until a manager is sacked?" Teams in poor form have higher sacking hazard rates. This powers outright "first manager to leave" markets.

**Player injury return:**
"When will this player return from injury?" Injury duration models use survival analysis to estimate return probabilities by date.

## The Key Concepts

**Survival function S(t):** P(event occurs after time t) — the probability of surviving (no event) past time t.

**Hazard function h(t):** The instantaneous rate of event occurrence at time t, given survival to t.

For football goals: the hazard rate is not constant — it peaks around the 75–90 minute mark as teams tire and matches are decided.

## The Cox Proportional Hazards Model

The Cox model estimates how covariates (team quality, score state) modify the hazard rate:

h(t|X) = h₀(t) × exp(β₁X₁ + β₂X₂ + ...)

Where h₀(t) is the baseline hazard and the exponential term modifies it by team-specific factors.

This produces: "A high-quality home team with a score advantage has a hazard rate for conceding 30% lower than the baseline."',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Natural Language Processing for Betting Signals', 'nlp-betting-signals',
'## Text as a Data Source

Much of the information that affects sports betting outcomes exists as unstructured text: injury reports, manager press conferences, team news articles, social media. Natural Language Processing (NLP) converts this text into structured signals.

## Practical NLP Applications in Betting

**Sentiment analysis of team news:**
Score manager and team news articles for positive/negative sentiment. A cluster of injury news, negative sentiment articles, and player availability concerns before a match is a negative signal for that team.

**Injury confirmation detection:**
Automated scanning of official club communications and sports news for player availability confirmations. Build a pipeline that:
1. Monitors key sources (BBC Sport, official club Twitter, team news aggregators)
2. Identifies mentions of key player names + availability-related language
3. Flags potential injury/doubt updates for human review

**Press conference analysis:**
Post-match and pre-match press conference transcripts contain signals about team morale, tactical changes, and player relationships. Language models can score press conferences for confidence, concern, and significant news.

## Getting Started With NLP

Tools:
- **spaCy:** Efficient NLP library for entity recognition (identify player names) and text processing
- **HuggingFace Transformers:** Access to pre-trained language models for sentiment and classification
- **BERT/RoBERTa:** Large language models that can be fine-tuned on sports-specific text

Starting point: build a simple classifier that labels sports text segments as "positive news," "negative news," or "neutral." Train on 500–1,000 manually labelled examples. Apply to new match-week news automatically.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Causal Inference: Understanding What Actually Drives Outcomes', 'causal-inference-outcomes',
'## Correlation vs Causation in Sports Data

Sports data is full of correlations that are not causal. A bettor who bets on correlations without understanding causality will find that exploitable patterns disappear when the underlying causal structure changes.

**Example correlation:** Teams that have won their last 3 matches win their next match at a higher rate than teams that have lost their last 3. Is this causal (winning builds confidence and momentum) or spurious (it reflects underlying quality differences — better teams tend to win consecutively)?

Answer: primarily the latter. Control for team quality, and the "recent wins" effect largely disappears.

## The Instrumental Variable Approach

When the causal effect of a variable cannot be identified from observational data (because confounding is present), instrumental variables (IVs) provide a path to causal identification.

**Sports example:** Does playing in the Europa League midweek cause worse league performance at the weekend?

Teams that play in Europe are better teams — they perform better in the league regardless. A simple correlation confounds quality with fixture congestion.

IV approach: find a variable that determines European competition entry but is otherwise unrelated to ongoing league performance (e.g. a points threshold rule that randomly assigns teams around the cutoff to European competition). Use this threshold as an instrument.

## Regression Discontinuity in Sports

When a threshold determines treatment (e.g. teams finishing 4th qualify for Champions League; 5th do not), comparing teams just above and just below the threshold provides a near-causal estimate of the treatment effect.

This approach has been applied to estimate the causal effect of Champions League participation on subsequent league performance — useful for outright betting models.

## The Practical Implication

Before including any feature in a betting model, ask: "Is there a plausible causal mechanism linking this feature to match outcomes?" Features without causal grounding are more likely to be overfitting patterns that disappear out of sample.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Quantitative Synthesis: The Research Programme', 'expert-quantitative-synthesis',
'## From Tools to Research Programme

The advanced methods covered in this module are not individual techniques to be applied once — they are components of an ongoing research programme that continuously improves the model and discovers new edges.

## The Research Programme Structure

**Foundation (maintain continuously):**
- Automated data pipeline
- Core Poisson regression model with quarterly recalibration
- Standard feature set with proven predictive value

**Research tier 1 (quarterly projects):**
- Test new features against the baseline model
- Evaluate new data sources
- Compare model performance across leagues and seasons

**Research tier 2 (annual projects):**
- Explore new modelling approaches (ML methods, event-level modelling)
- Investigate specific market inefficiencies
- Build new modules (e.g. half-time markets, player props)

**Research tier 3 (opportunistic):**
- Exploit temporary inefficiencies (rule changes, market disruptions)
- Apply NLP or alternative data when specific opportunities arise

## The Knowledge Accumulation Advantage

A research programme run consistently for 5+ years produces compounding intellectual capital:
- Historical calibration data (ground truth for model accuracy)
- Feature importance evidence (what works and what does not)
- Market efficiency mapping (which markets are most exploitable)
- Seasonal and structural knowledge (when edge is available)

This accumulated knowledge cannot be replicated quickly. It is the deepest competitive moat in analytical betting.

## The Open Source Contribution

Consider contributing findings to the open academic literature or public sports analytics community. This:
- Forces rigorous documentation (improving your own methodology)
- Attracts collaboration and critique (improving your models)
- Builds professional reputation (opening doors to institutional opportunities)

The academic sports analytics literature (Sloan Sports Analytics Conference, Journal of Quantitative Analysis in Sports) welcomes rigorous empirical contributions from practitioners.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'advanced-quantitative-methods' AND cat.slug = 'statistical-thinking';
