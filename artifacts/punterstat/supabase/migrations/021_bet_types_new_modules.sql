-- ============================================================
-- PunterStat — Betting Academy: Bet Types New Modules
-- Migration 021: Add 4 new modules (10 lessons each)
--   Module 3: Over/Under & Totals Markets       (intermediate)
--   Module 4: Outright & Futures Betting        (intermediate)
--   Module 5: Live & In-Play Bet Types          (advanced)
--   Module 6: Player Props & Specials           (expert)
-- ============================================================

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Over/Under & Totals Markets', 'over-under-totals-markets',
  'How totals markets work in football, basketball, tennis, and more — and how to find value in goals, points, and game counts.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'bet-types';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Outright & Futures Betting', 'outright-and-futures-betting',
  'Season-long markets — league winners, top-four finishes, relegation, tournament winners — and the unique edge opportunities they create.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'bet-types';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Live & In-Play Bet Types', 'live-in-play-bet-types',
  'The full menu of in-play markets — next goal, player events, half-time result, live spreads — and how to navigate each.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'bet-types';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Player Props & Specials', 'player-props-and-specials',
  'Individual player markets, goalscorer bets, player performance props, and the specific analytical approaches that find value in them.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'bet-types';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Over/Under & Totals Markets                 ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How Over/Under Markets Work', 'how-over-under-markets-work',
'## The Totals Market Explained

An over/under (totals) market does not require you to predict who wins. You predict whether the combined total of a scored metric — goals in football, points in basketball, games in tennis — will be above or below a set line.

**Football example:** Over/Under 2.5 goals. If the match ends 2-1, 3-0, 1-2 etc (3+ goals): Over wins. If it ends 0-0, 1-0, 0-1, 1-1, 2-0, 0-2 (0, 1, or 2 goals): Under wins.

## Why Totals Markets Attract Sharp Attention

The totals market is independent of the match result — you can bet on goals without caring who wins. This independence creates a clear analytical separation: match winner models and goals models are distinct.

A bettor with a strong goals model but no reliable match winner model can concentrate entirely on totals. This specialisation often leads to deeper expertise and more reliable edge.

## The Half-Line and Full-Line Distinction

**Half-line (2.5, 3.5, 4.5):** No push. Clear binary outcome. Easier to model.

**Full-line (2, 3, 4):** Push is possible (stake returned) if total exactly equals the line. For example, a 2-0 or 1-1 game has exactly 2 goals — betting Under 2 returns stake; Over 2 returns stake.

## Setting the Line

Bookmakers set the totals line to produce approximately 50/50 expected probability on each side. A line of 2.5 goals in a match between average teams reflects the bookmaker''s model estimate that roughly 50% of such matches produce 3+ goals.

## Totals Line as an Information Source

If the bookmaker''s totals line is 3.5 but you estimate only a 35% probability of 4+ goals (vs the 50% implied), the Under 3.5 offers value. The line itself encodes the bookmaker''s expected goals estimate — which you can extract and compare to your own.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Football Totals: Goals Modelling Basics', 'football-totals-goals-modelling',
'## The Expected Goals Foundation

Football totals betting is most profitably approached through an expected goals (xG) framework. Your over/under estimate should come from your model of total expected goals in the match, not from gut feeling or recent results alone.

## Building a Simple Goals Model

**Step 1:** Calculate each team''s average xG scored and xG conceded per match over the last 15 matches (opponent-adjusted).

**Step 2:** Estimate total expected goals for the upcoming match:
Expected Goals = (Home team avg xG scored + Away team avg xG conceded) / 2 + (Away team avg xG scored + Home team avg xG conceded) / 2

This produces a single expected total xG for the match.

**Step 3:** Apply the Poisson distribution to derive the probability of each total goals outcome from 0 to 7+.

**Step 4:** Calculate the probability of Over and Under for any line.

## Contextual Adjustments for Goals

Beyond team xG, adjust for:
- **Referee:** Top-quartile card-happy referees also tend to allow fewer goals (more stoppages)
- **Weather:** Rain and wind suppress goals by approximately 0.1–0.2 per match
- **Motivation:** A match with nothing at stake (mid-table clash, last day of season) sometimes sees more carefree attacking play
- **Tactical matchup:** Two high-press, counter-attack teams facing each other may produce lower xG than their individual averages suggest

## The Over/Under Margin

Totals markets typically carry slightly higher margins than 1X2 in football — around 5–7% at standard bookmakers. Target Pinnacle or exchanges where totals margins fall to 2–3%.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Basketball Totals: A High-Volume Market', 'basketball-totals-high-volume',
'## Why Basketball Totals Are Different

Basketball games typically produce 200–230 combined points. The total is highly predictable at the team level — pace and efficiency ratings are among the most stable metrics in team sports.

## The Key Variables

**Pace:** Possessions per 48 minutes. High-pace teams produce more scoring opportunities.
**Offensive Efficiency:** Points per 100 possessions.
**Defensive Efficiency:** Points allowed per 100 possessions.

Expected game total = (Home off eff × Away pace + Away off eff × Home pace) / 200 × 48 / 5 ... (simplified: use team-specific pace-adjusted scoring estimates)

## Simplified Approach

Home points estimate = (Home team avg points scored + Away team avg points allowed) / 2
Away points estimate = (Away team avg points scored + Home team avg points allowed) / 2
Total estimate = Home estimate + Away estimate

Compare to the bookmaker''s total line. If your estimate exceeds the line by > margin threshold: Over has value. If below: Under.

## Rest and Roster Effects on Totals

- Back-to-back games reduce pace and scoring by approximately 3–5 points combined
- Star player absence reduces his team''s offensive efficiency — but can increase pace (faster break opportunities)
- Foul trouble for defensive anchors increases the opposing team''s efficiency

## The NBA Totals Edge

The NBA is well-modelled by sharp books and academics. Edge is most likely in:
- Non-prime-time games with lower analyst attention
- Early-season games where previous season ratings are stale
- Playoff adjustments (defensive intensity rises significantly; totals tend to go Under)',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Tennis Totals: Games and Sets Markets', 'tennis-totals-games-sets',
'## How Tennis Totals Work

Tennis totals markets are offered on:
- **Total games:** Combined games played across all sets (e.g. Over/Under 22.5 games)
- **Total sets:** Whether the match goes to 2 sets or 3 (best of 3) / 3, 4, or 5 sets (best of 5)
- **Set score:** Exact set count (e.g. 2-0, 2-1 in a best-of-3)

## The Modelling Approach

Tennis can be modelled from the point level up using a Markov chain:

1. Estimate P(server wins point) for each player on each surface
2. Derive P(server wins game) from the point probability (using game-level Markov chain)
3. Derive P(player wins set) from game probabilities
4. Derive P(match outcome) from set probabilities
5. Derive expected total games from the probability distribution over all possible score lines

## Key Drivers of Tennis Totals

- **P(server wins point):** The dominant driver. High server dominance → more tiebreaks, more games, higher totals.
- **Surface:** Clay courts produce more baseline rallies (longer games, more games per set) than grass courts (more serve dominance, shorter rallies, fewer total games).
- **Player style:** Aggressive baseliners vs net rushers vs defensive counterpunchers all produce different game counts.

## The Bagel and Breadstick Effect

A "bagel" (6-0 set) is the minimum possible set score — 6 games. A "breadstick" (6-1) is 7 games. Dominant players produce more of these compressed sets, lowering the total games. Models that do not account for dominant player service games will overestimate total games.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Totals Markets in American Football', 'totals-american-football',
'## NFL Totals: The Most Analysed Market

The NFL over/under is one of the most studied markets in sports betting. The combination of massive liquidity, deep public interest, and decades of data makes it highly efficient — but specific inefficiencies remain.

## The Scoring Model

NFL scoring is driven by:
- **Offensive efficiency:** Yards per play, red zone conversion rate
- **Defensive efficiency:** Points allowed per drive, yards allowed per play
- **Pace:** Plays per game, time of possession

Expected total = Home team expected points + Away team expected points

Home expected points = (Home off + Away def) / 2 [adjusted for home advantage ≈ 1.5 pts]

## Key NFL Totals Factors

**Weather:** Wind above 15 mph suppresses passing game significantly. In outdoor stadiums, monitor wind speed and direction. Historical data shows totals go Under at higher rates in high-wind conditions.

**Division rivalry:** Teams that know each other well tend toward more defensive, lower-scoring games. Intra-division games go Under at slightly higher rates.

**Total clustering:** NFL scores cluster at specific totals — 23, 27, 37 — due to scoring unit structure (touchdown = 7, field goal = 3). Models that ignore this clustering are less accurate on whole-number total lines.

## The Public Over Bias

Research consistently shows the public bets overs at higher rates than probability warrants — partly because high-scoring games are more exciting to watch. Markets shade slightly toward under value to balance the book.

A weak but real edge: under on prime-time games with heavy media attention and expected offensive spectacles.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Alternative Totals Lines: Finding Value Off-Key', 'alternative-totals-lines',
'## Beyond the Main Line

Most bettors focus on the main total line — the one closest to 50/50. But alternative totals lines (higher and lower than the main line) can offer value when your probability distribution differs from the bookmaker''s.

## The Alternative Line Approach

Your model gives a full probability distribution over goals scored. For each possible total-goals value, you have an estimated probability. Compare this to the bookmaker''s implied probability at each alternative line.

**Example:**
Main line: Over/Under 2.5 at 1.91 each (52.4% implied each)
Your model: Over 2.5 = 55% (slight value on Over)

But check alternative lines:
- Over/Under 3.5: bookmaker at 2.10 (implied 47.6%); your model says 40% → Under 3.5 at value
- Over/Under 1.5: bookmaker at 1.40 (implied 71.4%); your model says 75% → Over 1.5 at value

The alternative line analysis finds stronger value than the main line in this case.

## Margin at Alternative Lines

Alternative total lines typically carry higher margins than the main line. A 5% margin at 2.5 goals may become 8–10% at 1.5 or 4.5 goals. The value at alternative lines must exceed this higher margin.

## Cross-Reference with Asian Goal Lines

Asian goal line markets (equivalent to Asian handicap for totals) use quarter-goal increments (2.25, 2.75) and offer better margins than European whole/half-line markets. Convert your probability distribution to these increments for maximum precision.

## The Edge at Extreme Lines

For very high lines (Over/Under 4.5+) in football, bookmakers'' models are less refined — fewer qualifying historical events make calibration harder. This is a niche opportunity for analysts with large historical databases of high-scoring match contexts.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Correlations Between Totals and Other Markets', 'totals-correlations-other-markets',
'## Markets Do Not Exist in Isolation

The over/under total for a match is mathematically related to other markets for the same event. Understanding these relationships lets you use totals as a consistency check and occasionally find cross-market value.

## Totals and Match Result (1X2)

In football, higher expected goals generally benefit the favourite (more goals = more chances for the better team to assert their quality). Match result and totals markets are positively correlated: high-total matches tend to produce results consistent with the pre-match favourite.

**Implication:** If you bet the favourite to win and the over, your two bets are correlated — they will tend to both win or both lose. This concentration of variance is not necessarily bad but must be understood.

## Totals and Both Teams to Score (BTTS)

BTTS and Over 2.5 are highly correlated — BTTS requires at least 2 goals (one from each team); Over 2.5 requires at least 3 goals.

P(BTTS Yes) and P(Over 2.5) should be consistent with the same underlying goals model. If the bookmaker''s BTTS price implies a higher total than the O/U 2.5 price, a cross-market inconsistency exists.

## Totals and Asian Handicap

For low-expected-goals matches, the AH line is often −0.5 or −0.25. For high-expected-goals matches, larger AH lines are common (−1.5, −1.75). The correlation between expected goals and AH line is direct — both derive from the same underlying team quality and style model.

## Finding Cross-Market Value

Build a unified model that generates 1X2, AH, BTTS, and over/under probabilities from the same Poisson distribution. Compare each derived probability to the live bookmaker price. Where the bookmaker is internally inconsistent (one market priced differently than implied by others), the discrepancy is a potential edge.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'In-Play Totals: Live Goals Markets', 'in-play-totals-live-goals',
'## Totals in the Live Environment

In-play totals markets add a real-time dimension: rather than predicting the final total from the start, you are predicting the remaining total from the current game state.

## The Current State Update

At any moment during a match, the live goals market prices the probability of reaching various total-goals thresholds from the current score:

**Example:** 0-0 at 65 minutes. Initial total line: 2.5. Now the live market offers:
- Over 1.5 at 1.60 (remaining ≥2 goals expected? Implied 62.5%)
- Over 0.5 at 1.20 (at least 1 more goal? Implied 83.3%)

Your live model should estimate the remaining expected goals per unit of time remaining, then generate the probability of each remaining-goals total.

## The Key In-Play Totals Calculation

Remaining expected goals ≈ pre-match expected goals × (1 − fraction of match elapsed) × intensity adjustment

This is a simplification — actual remaining xG should use accumulated in-game xG data for better accuracy.

## Common In-Play Totals Edges

- **Under after high xG half:** A match with high xG but no goals through 45 minutes is "owed" goals statistically, but the Under 0.5 for second half may be mispriced
- **Over in injury time:** Pressure from a trailing team creates disproportionate attacking output in injury time — over/under markets often underprice this
- **Post-red card goals:** Markets often over-adjust for red cards — sometimes under prices become good value immediately after a red card when teams settle into their new formation

## The Suspension Window

In-play totals markets frequently suspend around goals, red cards, and half-time. Acting before suspension is the execution challenge — the same speed constraints as all live markets apply.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Totals Research: Building Your Database', 'totals-research-database',
'## The Data You Need

Totals betting quality depends entirely on the quality of your goals data and the depth of contextual factors. Building a totals-specific database takes time but compounds significantly.

## Required Data Fields

For every match in your target leagues:
- Date, competition, home team, away team
- Full-time score (goals by each team)
- Half-time score
- Expected goals (home and away)
- Pre-match total line (opening and closing)
- Weather data (temperature, wind, precipitation)
- Referee assigned
- Match significance score (relegation, title implications, nothing at stake)
- Key absences (leading goal scorer, defensive anchor)

## Analysing Contextual Factors in Totals

Once you have 3+ seasons of data with contextual annotations, test each factor independently:

For each factor (e.g. "high wind"):
- Filter all matches with high wind (> 15 mph)
- Compare actual average goals to pre-match total line
- Calculate whether Under hit at higher than 50% rate
- Calculate the average CLV of Under bets in these conditions

If a factor consistently produces >52% Under hit rate across 200+ qualifying matches: it is a real contextual effect worth systematically applying.

## The Calibration Test for Totals Models

Split your historical data into deciles by your model''s expected goals estimate (0–1.5, 1.5–2.0, 2.0–2.5, 2.5–3.0, 3.0+). For each decile, calculate:
- Average actual goals
- Average model prediction

If average actual goals matches average prediction within each decile, your model is well-calibrated for totals. If not, identify the systematic bias and correct it.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Totals Portfolio Management', 'expert-totals-portfolio',
'## Specialising in Totals

Many professional bettors specialise entirely in totals markets, never betting match winner or handicap. The rationale: totals modelling is a distinct skill from result modelling, and specialisation produces deeper expertise.

## Building a Totals-Only Operation

A totals specialist operation has:
- **Goals database:** Match-level xG, contextual factors, 5+ seasons, multiple leagues
- **Goals model:** Calibrated Poisson or regression model producing expected goals distributions
- **Contextual overlay:** Rule-based adjustments for weather, referee, motivation
- **Market monitoring:** Daily scan of totals lines across leagues vs model output
- **CLV tracking:** All totals bets tracked against closing Pinnacle totals price

## League-Level Totals Profiles

Different leagues have different goals-per-match averages and variance profiles:
- Premier League: ~2.7 goals/match, moderate variance
- Bundesliga: ~3.0 goals/match, higher variance
- Serie A: ~2.5 goals/match, lower variance (historically more defensive)
- Spanish La Liga: ~2.6 goals/match
- Scottish Premiership: ~2.7 goals/match, significant variance

League-specific models outperform cross-league models because each league has distinct tactical cultures and playing styles.

## Venue-Specific Adjustments

Some grounds systematically produce more or fewer goals than expected:
- Tight, atmospheric grounds (Anfield, Old Trafford) can affect total goals
- Large, modern grounds with less atmosphere may see fewer "big occasion" defensive errors
- Artificial turf grounds (some lower leagues) produce more goals on average

Build a ground-specific adjustment table from your historical data.

## The Compounding Research Advantage

A goals model built on 5 years of rich contextual data cannot be replicated quickly by a new entrant. The historical database is a moat. Each season adds new data that refines contextual adjustments. The research compounds — making the specialist''s model progressively more accurate relative to the market over time.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'over-under-totals-markets' AND cat.slug = 'bet-types';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — Outright & Futures Betting                  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Understanding Outright Markets', 'understanding-outright-markets',
'## What Is an Outright Bet?

An outright (futures) bet is a wager on the outcome of a competition over its full duration — who wins the league, which team finishes top four, which player wins the Golden Boot.

Unlike single-match betting, outrights require predicting performance over weeks or months. The uncertainty is higher; the odds are longer; the capital is tied up until the competition concludes.

## Common Outright Markets

- **League winner:** Which team wins the championship
- **Top-four/Top-six finish:** Season-long placement bets
- **Relegation:** Which teams drop to the lower division
- **Top goalscorer:** Which player scores the most goals
- **Tournament winner:** Which nation or team wins a World Cup, Euros, etc.
- **Manager to be sacked first:** Novelty market, typically high margin

## The Pricing Structure

Outright markets have higher margins than single-match markets — typically 8–15%. The bookmaker must price 20 outcomes simultaneously and maintain profit across all, creating more pricing uncertainty.

This higher margin means the edge required to profit from outright bets is substantially higher than for single-match bets.

## The Capital Tie-Up Problem

Outright bets lock capital for the duration of the competition. A Champions League winner bet placed in September may not settle until May — 8 months of capital immobilised.

For bettors who use their bankroll efficiently (multiple bets per week on single-match markets), the opportunity cost of tying up capital in an outright is significant.

## When Outrights Are Worth It

Outrights have genuine value when:
1. Your probability estimate for a specific team significantly exceeds the implied probability
2. You have a long-term thesis that the market has not priced in (a new manager''s system taking time to develop)
3. The market has overreacted to pre-season hype, creating value on overlooked teams',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How to Model Outright Markets', 'how-to-model-outright-markets',
'## From Match Probabilities to Season Simulations

The most rigorous approach to outright betting uses a simulation framework: run the full season thousands of times and aggregate the results.

## The Season Simulation Approach

**Step 1:** Assign each team a current strength rating (Elo or xG-based).

**Step 2:** For each fixture in the remaining schedule, use team ratings to predict match probabilities.

**Step 3:** Simulate each match result using those probabilities (random draw weighted by probability).

**Step 4:** Aggregate simulated results into a final table.

**Step 5:** Record which team finished first, top four, relegated, etc.

**Step 6:** Repeat 100,000 times. The frequency of each outcome across simulations is your estimated probability.

## The Early vs Late Season Edge

Early in the season (weeks 1–5), team ratings are derived almost entirely from last season''s data. The market''s pricing is also primarily last-season based.

**Where edge exists early season:**
- Teams with significant summer squad changes (new manager, key signings) may be systematically mispriced by last-season models
- Newly promoted teams are particularly hard to price — one season of top-flight data is insufficient

Late in the season (weeks 30–38), outright markets become very efficient. The actual points standings are near-final; the mathematics of remaining permutations are the dominant pricing input.

## The Regression to the Mean Effect

Very early leader: A team that leads the table after 8 games is likely better than average, but their current points-per-game almost always exceeds their true long-run rate. Betting the early leader''s position to hold often means betting against regression to the mean.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Tournament Outrights: World Cups, Euros, Grand Slams', 'tournament-outright-betting',
'## Tournament Structure and Probability

Tournament outrights (knock-out competitions) produce compound probability chains — a team must win multiple matches sequentially to win the tournament.

P(team wins tournament) = P(wins R1) × P(wins R2) × ... × P(wins final)

Each round is conditional on the previous round''s results. The path through the bracket matters enormously.

## The Bracket Effect

In a seeded draw, strong teams are separated on opposite sides of the bracket — designed to produce a "best vs best" final. But upsets occur. The team on the "easier" side of the bracket has a higher win probability even if intrinsically weaker.

**Example:** In the World Cup, a group with weaker opposition at the knock-out stage can elevate a host team''s tournament win probability significantly beyond their raw rating.

Tournament models must incorporate the full bracket path — not just absolute team strength.

## Early Pricing: The Largest Inefficiency Window

When a major tournament draw is completed, the outright market reprices rapidly. Teams with easy-looking paths see their odds shorten; teams on difficult sides see their odds lengthen.

The first 30–60 minutes after the draw are the highest-edge window: your bracket simulation may reach a different probability than the market for specific teams before the market fully reprices.

## Each-Way Tournament Betting

Most outright markets offer each-way at 1/4 or 1/5 odds for top-N placements (top 4, top 8). In large 32-team tournaments, identifying undervalued teams to reach the semi-finals (even if unlikely to win) often has better EV than the outright winner market.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Relegation Markets: The Contrarian Edge', 'relegation-markets-contrarian-edge',
'## Why Relegation Is Underanalysed

Most betting attention focuses on the top of the table. Relegation markets — which teams finish in the bottom positions — receive a fraction of the analytical attention and sharp scrutiny.

The result: relegation markets are often less efficiently priced than title markets.

## The Base Rate Problem

In a 20-team league with 3 relegation places, the base rate probability is 15%. Any team with "obvious" relegation concern might be priced at 20–40% by the market. The question is whether that premium is justified.

**Key analysis point:** Is the concern about a team''s relegation probability based on:
- Actual poor performance metrics (xG, defensive xG, underlying quality)?
- Narrative and media attention (a bad result, a poor start)?

Markets often overprice narrative concerns and underprice actual quality indicators.

## Early-Season Relegation Value

The first 5–10 games of a season produce dramatic early table positions that the market overreacts to. A promoted team starting 19th after 6 games gets short relegation odds — but their historical performance data may suggest they are actually a mid-lower division quality team who will stabilise.

## The Key Relegation Variables

- Points per game over last 20 league matches (most predictive)
- xG performance (are they playing better or worse than results suggest?)
- Squad quality indicators (wage bill, market value — available publicly)
- Managerial experience in relegation battles
- Fixture schedule for remaining matches

## Hedging Outright Relegation Bets

If a team you backed for survival starts performing badly, hedge on the exchange or via in-season relegation bets. Some bookmakers offer "to be relegated" bets that update in season — these provide hedging opportunities mid-competition.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Top Scorer and Player Outright Markets', 'top-scorer-player-outright',
'## The Goalscorer Outright

The top goalscorer outright (Golden Boot) is one of the most widely bet individual player markets. It is also one of the hardest to model — individual performance is subject to more variance than team performance.

## Why Goal Scoring Outrights Are Hard to Price

- **Minutes dependency:** A player who misses 8 matches due to injury cannot compete
- **Penalty dependency:** 5–8 goals per season often come from penalties; the number awarded is highly variable
- **Teammate dependency:** A striker''s goal tally depends on his team''s attack creating chances, which depends on the team''s overall performance

## The Key Variables for Modelling

- **Non-penalty xG per 90 minutes:** Strips out penalty volatility and minutes noise
- **Expected minutes played:** Based on historical injury profile and manager rotation
- **Team attacking strength:** The better the team, the more chances for the striker
- **Direct competition:** Is the striker competing with another prolific teammate for penalties and chances?

## Value in the Golden Boot Market

Early-season markets price the Golden Boot based on name recognition more than probability. A striker who won last season''s Golden Boot receives heavy public backing despite regression to the mean — creating value on competitors.

Value typically exists on:
- Second-choice strikers on high-attacking teams (priced as backups but often play significant minutes)
- Penalty takers at attacking teams with modest reputations (reliable goal tallies)
- Emerging players who have shown xG progression but whose reputation lags their current output

## Hedging and Trading Outright Player Markets

During the season, top scorer markets update regularly. If your chosen player has an injury-free start and builds a goal lead, the exchange price will shorten. Early closure via lay bet locks profit without waiting for the season to conclude.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Hedging and Trading Outright Positions', 'hedging-trading-outright-positions',
'## The Outright as a Trading Vehicle

Outrights do not have to be held to completion. As the competition evolves, prices change — creating opportunities to close positions at a profit or hedge exposure.

## When to Close an Outright Early

**Scenario 1: Your team has performed beyond expectation**
You backed Arsenal at 8.00 (12.5% implied) to win the league. After 20 matches, Arsenal leads the table. Their outright price has shortened to 2.50 (40% implied). Your position has tripled in implied value.

Close via exchange lay at 2.50: back profit preserved regardless of final outcome.

**Scenario 2: A key player gets injured**
Your outright bet was partly predicated on a star player. Their injury materially reduces your probability estimate. Close the position before the market fully reprices.

## The Partial Hedge

Instead of fully closing, consider a partial hedge — lay enough on the exchange to guarantee a small profit if the team wins, while maintaining upside if you chose to hold for the full return.

Partial hedge math: lay (Back stake × Back price) / (2 × Lay price) to split the potential outcomes between guaranteed profit and higher-if-wins return.

## The Seasonal Liquidity Pattern

Exchange outright market liquidity builds through the season. In the final weeks, when the championship or relegation battle intensifies, liquidity peaks. This is the best time to trade:
- Tightest spreads (back/lay differential smallest)
- Easiest to execute larger hedges without market impact

## Avoid Holding to Expiry on Negative EV

If your outright bet has evolved into a negative EV position (the current probability is below the implied price of your position''s remaining expected value), close it. Do not hold simply because "I''ve already bet it."',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Outright Margin: Understanding the True Cost', 'outright-margin-true-cost',
'## The High Cost of Outright Markets

Outright markets have the highest margins of any common betting product. Understanding the true cost is essential before committing capital.

## How Outright Margin Is Calculated

Sum all implied probabilities for every outcome. The total above 100% is the margin.

**20-team league outright (approximate):**
If all teams'' implied probabilities sum to 120%: margin = 20%

This is far higher than the 5% margin on a 1X2 match bet. An outright bettor needs 20% edge (not 5%) to break even.

## The Effect of Favourite Concentration

In an outright market with 2–3 clear favourites and 17 rank outsiders:
- The favourites are priced fairly (high liquidity, sharp scrutiny)
- The outsiders carry most of the margin

A small club at 250.00 (implied 0.4%) in reality might have 0.2% true probability — but the 0.2% discrepancy is invisible in a margin of 20%.

## Where True Outright Value Is Hidden

Outright value is most likely in the mid-tier: teams with 5–20% true win probability priced at 3–15% implied. The margin is applied more uniformly here, and these are the teams where individual research creates the most differentiation from the market.

## Exchange Outright Margins

Betfair outright markets have significantly lower margins than bookmakers — often 5–10% instead of 15–20%. With 4.5% commission on net winnings, the exchange outright is typically 2–3× lower cost than a bookmaker outright.

Always compare bookmaker outright prices to exchange equivalents before committing.

## The Benchmark Test

Before placing any outright, calculate: "What probability does my model give this team?" vs "What probability is implied by the best available price?" Only proceed if your estimate exceeds implied probability by enough to overcome the full outright margin.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Each-Way Outright Strategy', 'each-way-outright-strategy',
'## Each-Way in Outright Markets

Most bookmakers offer each-way betting on outright markets, particularly in horse racing, golf, tennis, and football tournament markets. The each-way place terms (1/4 or 1/5 odds for top-N placements) create a distinct probability calculation.

## The Each-Way Value Test for Football Outrights

A 20-team league with top-four each-way terms at 1/4 odds.

Team X is available at 12.00 to win the league, 1/4 odds for top four.
Each-way price components:
- Win: 12.00
- Place: 1 + (12−1)/4 = 1 + 2.75 = 3.75

Your model estimates:
- P(win league): 10%
- P(top four finish): 35%

Each-way EV (per £1 each-way = £2 total stake):
EV_win = 0.10 × 11 − 0.90 = 1.10 − 0.90 = +£0.20
EV_place = 0.35 × 2.75 − 0.65 = 0.9625 − 0.65 = +£0.3125
Total EV = +£0.5125 on £2 = +25.6% EV

## The Place Part as Independent Value

Even when the win part has marginal EV, the place part can be strongly positive — or vice versa. Evaluate each part independently.

If the win part is negative EV but the place part is strongly positive: consider a place-only bet if available (some bookmakers offer place markets separately).

## Golf and Individual Sport Each-Way

Golf majors and tournaments with 72+ players offer each-way at 1/4 odds for top 5 or top 8. With large fields, the place market can be significantly mispriced relative to the win market — creating independent value on the place component alone.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'In-Season Outright Updates and Edge Evolution', 'in-season-outright-updates',
'## The Dynamic Nature of Outright Markets

An outright bet placed in August is based on pre-season information. By November, the competition has produced 10–15 rounds of actual performance data. Your probability estimates should update accordingly — and so should your outright strategy.

## The In-Season Model Update Cycle

After every 5 matches:
1. Update team ratings with new match data
2. Re-run the season simulation with updated ratings
3. Compare your updated team win probabilities to current market prices
4. Identify any team where your updated assessment creates new value

## Finding In-Season Outright Value

**The overlooked improver:** A team that has played significantly better than expected in the first 10 matches (high xG, strong defensive performance) but has been unlucky with results (low conversion on high-quality chances). Their outright odds may still reflect early poor results. The underlying performance data suggests better outcomes ahead.

**The regression target:** A team priced short on the basis of exceptional early results but with weak underlying xG data. Their odds will lengthen as results normalise. Backing their odds to drift (via a lay on the exchange) can be profitable.

## The Mathematical Update

Bayesian updating applies perfectly to outright betting. At the start of the season, your prior is the pre-season rating. After each match, you update:

New rating = (Prior rating × prior weight + new performance × new weight) / total weight

As the season progresses, the new performance data receives increasing weight relative to the prior. By mid-season, actual performance dominates. At this point, the market is typically well-calibrated — value is harder to find.

## The Final Weeks: The Liquidity Peak

In the final 5 matches of a tight title or relegation race, outright market volume peaks. This is the best time to execute any remaining hedges or new positions due to the tightest spreads and deepest liquidity.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Outright Portfolio: Managing Season-Long Exposure', 'expert-outright-portfolio',
'## The Outright Portfolio Challenge

Managing a portfolio of outright bets across multiple competitions simultaneously requires distinct risk management compared to single-match betting.

## Portfolio Construction Principles

**1. Diversification across competitions:**
Hold outrights in 3–5 different competitions. Premier League, Champions League, Bundesliga, and individual player markets are largely uncorrelated — a bad English season does not predict a bad German season.

**2. Diversification within a competition:**
In a league outright, consider backing 2–3 teams at different probability levels. If Team A at 20% and Team B at 15% each represent value, backing both is superior to concentrating on one — you capture value in both selections while reducing the winner-takes-all variance.

**3. Stake sizing for outrights:**
Apply Kelly principles with caution. Outrights have high variance (single event, long time horizon) — fractional Kelly of 15–25% is appropriate.

**4. Capital budget for outrights:**
Limit total outright exposure to 10–15% of total bankroll. The remaining 85–90% is available for high-frequency single-match betting where edge compounds more rapidly.

## The Opportunity Cost Calculation

Before placing an outright, calculate: "If instead of locking this capital in an outright for 8 months, I deployed it at my average single-match edge — what would I expect to earn?"

Average single-match ROI: 3%. Capital locked: £500. Duration: 8 months at 20 bets/month × £25/bet = £4,000 turnover opportunity cost.
Expected single-match earnings over 8 months: £4,000 × 0.03 = £120.

The outright must offer at least £120 expected profit on £500 staked (24% ROI) to justify the capital allocation over this period — a high bar that most outright bets do not clear.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'outright-and-futures-betting' AND cat.slug = 'bet-types';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Live & In-Play Bet Types                    ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The In-Play Market Menu', 'in-play-market-menu',
'## What Markets Exist In-Play?

The in-play betting landscape offers far more variety than the pre-game menu. Understanding which markets are available — and when — is the foundation of in-play strategy.

## Core In-Play Markets (Available Throughout)

- **Match winner (live):** Continuously updating 1X2 probabilities
- **Asian handicap (live):** AH line adjusted for current score and time
- **Over/Under total goals (live):** Remaining goals markets
- **Next goal scorer:** Which player scores the next goal
- **Next team to score:** Home or away
- **Both teams to score (live):** Given current score, will both teams have scored by full time?

## Milestone Markets (Triggered by Events)

- **Half-time result:** Available pre-match and live until half-time
- **Score at half-time:** Which team leads or is it level
- **Number of goals in each half:** Over/Under for each 45 minutes
- **Next corner:** Which team wins the next corner kick
- **Next card:** Which team concedes the next yellow card

## Suspension Market Dynamics

Each market type has different suspension windows:
- Match winner: suspended during goal kicks, corners, and after goals
- Goals markets: suspended during VAR reviews
- Next scorer: suspended permanently once the next goal is scored

## Which Markets to Focus On

Not all in-play markets are worth targeting. The highest-value in-play markets combine:
1. Reasonable margin (under 10%)
2. Enough volume to be matched at desired stakes
3. A game-state calculation you can reliably perform

Match winner and Asian handicap meet all three criteria for most liquid fixtures.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Next Goal Markets: How to Approach Them', 'next-goal-markets',
'## Next Goal: A Pure In-Play Bet

The next goal market asks: which team scores the next goal in this match? It is the purest expression of in-play analysis — based entirely on game state at the moment of the bet, not pre-game team quality alone.

## What Determines Next Goal Probability

- **Current possession and territorial pressure:** The team dominating possession and creating more chances is more likely to score next
- **Set piece dynamics:** A team that has won consecutive corners or free kicks in dangerous positions
- **Defensive organisation:** A team chasing the game (losing) often leaves defensive gaps that increase the probability of a counter
- **Expected goals per minute:** The current rate of chance creation by each team

## The Baseline: Pre-Game Expected Goals

Your pre-game model gives each team an expected goals rate per minute. This provides the baseline.

During the match, accumulating xG data from shots and chances adjusts the in-game estimate. If Team A has created 1.2 xG in 60 minutes but the pre-game expected total was 0.8 xG at this stage, Team A is performing above expectation — which may warrant adjusting next goal probability upward for Team A.

## The Suspension Window Problem

Next goal markets suspend immediately after a goal is scored (obviously — a new "next goal" market opens). They also suspend around potential set-piece situations at some bookmakers. Acting on next-goal signals requires near-instant execution.

## The Professional Approach

Most professionals avoid next-goal markets because:
- Margins are high (8–15%)
- Execution window is extremely short
- The signal (who is dominating now) is visible to everyone, not just you

The exception: a specific game-state pattern you have modelled historically that the market does not price efficiently.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Half-Time Markets and Interval Betting', 'half-time-markets-interval',
'## The Half-Time Window

The 15-minute interval between first and second half creates a unique betting window. Markets are open, but the information environment has shifted — you now have 45 minutes of observed data to inform your second-half bets.

## Half-Time Result Market

A half-time result bet settles at the 45-minute mark. It is effectively a short-horizon match result bet on the first 45 minutes only.

Pre-game half-time market EV analysis:
- First half typically has slightly fewer goals than the second half (goal frequency is lower in minutes 1–45 vs 46–90)
- Draws are more common at half-time than at full-time
- Pre-game HT draw probability is typically higher than the full-time draw probability

## Second-Half Markets (Opened at Half-Time)

At half-time, bookmakers open second-half markets:
- Second-half result (who wins the second 45 minutes?)
- Second-half total goals (Over/Under)
- Second-half both teams to score

These markets incorporate half-time score information. The key analysis:
1. Update your full-match model with the half-time score
2. Derive second-half win/goals probabilities
3. Compare to offered second-half market prices

## Information Advantage at Half-Time

Half-time creates a brief window where observational information (tactical changes, player fatigue, visible team talk reactions) is available to match-goers but not to algorithm-based models.

This window is extremely short — markets open and adjust quickly. The advantage is primarily available to those at the stadium or with real-time tactical feeds.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Corners, Cards and Player Events In-Play', 'corners-cards-player-events-live',
'## The Micro-Event Markets

Beyond match result and goals, in-play betting extends to highly specific micro-events: the next corner, the next yellow card, the next throw-in. These markets are available at major bookmakers but are almost universally poor value.

## Why Micro-Event Markets Are Difficult

**1. Very high margin:** Corners, cards, and throw-in markets often carry 15–25% margin
**2. Near-random in the short term:** The next corner in a match is nearly 50/50 even with team context — the margin is the entire cost
**3. No sustainable edge:** The information required to beat a 20% margin on "next corner" does not exist in a form accessible to bettors

## Card Markets: An Occasional Exception

Yellow card markets are more predictable than goals or corners at the team level over a full match. Teams with aggressive pressing styles receive more cards. Referees with strict card tendencies issue more. The combination of a high-press team + strict referee = over card totals value in some cases.

But the in-play "next card" market (who gets the next yellow card now?) is too granular and random to model profitably.

## Player Events in Full-Match Contexts

Player-level in-play markets — will a specific player score, will a specific player get a card — are slightly more tractable than team-level micro-events because player-level probability estimates are more stable.

A striker with 0.4 xG per 90 minutes, playing 70+ minutes, has approximately 30% probability of scoring. If the live market prices him at 25% implied: marginal value. If at 20% implied: clearer value.

## The Practical Focus

Direct in-play attention toward: match winner, Asian handicap, and total goals. These are the highest-liquidity, lowest-margin, most-modellable in-play markets. Micro-event markets are entertainment products, not value opportunities.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Correct Score Markets: The Allure and Reality', 'correct-score-markets',
'## The Fascination with Correct Score

Correct score markets ask you to predict the exact final score of a match. The potential returns are high (a correct 2-1 prediction might pay 8.00–12.00) and the "skill" of naming an exact score feels impressive.

The reality is more sobering.

## The Probability Mathematics

A typical football match has 30+ possible correct scores. Even a score as common as 1-0 (typically the most likely individual result) occurs in only 15–20% of matches.

At a 1-0 price of 6.50 (implied 15.4%) and true probability 17%: edge is 1.6%. This is marginal value after the high margin (correct score markets carry 15–25% total margin across all possible scores).

## The Margin Structure

In a correct score market, the implied probabilities of all scores sum to 115–130%. The margin is spread across scores — typically highest for very low-probability outcomes (10-0 at 1000.00 still implies 0.1% vs true probability of near 0%).

## When Correct Score Has Value

Specific situations create genuine correct score value:

1. **Your goals model produces a different score distribution than the market:** If your Poisson model says 2-1 home win occurs 12% of the time but is priced at 1/0.08 = 12.50 (8%), backing 2-1 home has 4% EV.

2. **A market-wide systematic bias:** Research shows 1-1 draw is consistently underpriced relative to Poisson model predictions in certain league types (reflects the systematic underestimation of balanced matches).

## The Practical Recommendation

Correct score is an occasional tactical market for bettors with a full score-distribution model — not a primary market. Its high margin makes it unsuitable as a core strategy.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Live Market Navigation: Platform Mechanics', 'live-market-navigation-mechanics',
'## The In-Play Interface

Every bookmaker and exchange has a different in-play interface. Navigating them efficiently under time pressure — where opportunities may close in seconds — requires deep familiarity with the tools.

## Key Interface Elements

**Price ladder:** On exchanges, the back/lay price ladder shows available money at each price. Knowing how to read the ladder and place limit orders quickly is essential.

**Market suspension indicator:** Watch for the yellow/orange indicator that signals imminent market suspension. When it appears, you have 1–5 seconds to place or abandon.

**Bet slip auto-populate:** Pre-set your stake to your standard live betting unit so the only variable you enter is the selection — not the amount.

**Odds format:** Set to decimal always. Fractional or American odds under time pressure is a calculation error waiting to happen.

## The One-Platform Rule

In live betting, limit yourself to one platform per market type. Having multiple windows open across bookmakers while watching a live match creates cognitive overload. If your primary live platform is the exchange for match winner and Pinnacle for Asian handicap, access only those two.

## Network and Device

Latency matters in live betting. A mobile device on 4G in a stadium is slower than a laptop on wired broadband. For time-sensitive live betting, use the most reliable connection available.

Bookmark your key in-play pages before the event. Navigating the bookmaker''s homepage to find a live market while the event is in progress costs critical seconds.

## Setting Alerts

Use bookmaker apps'' price alert features to set notifications when a live price crosses your target threshold. This converts real-time monitoring from active watching to passive alert-based action — more sustainable for long matches.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Cashing Out: When It Makes Sense', 'cashing-out-when-it-makes-sense',
'## The Cash Out Product

Cash out allows you to close a bet before the event concludes, accepting a reduced (or in some cases enhanced) return in exchange for certainty.

The bookmaker calculates a cash-out price in real time. This price always contains an additional margin on top of the live market price.

## The Fair Value of Your Position

The fair value of a pre-match bet at any point in a live match is:

Fair value = Current live probability × Original bet payout − (1 − Current live probability) × 0

Or equivalently: the price you could achieve on an exchange lay.

**Example:** You backed Team A at 3.00 for £100. Team A leads 1-0 at 70 minutes. Live probability of A winning: 80%. Exchange lay at 1.30.

Fair cash out via exchange:
Lay £230 at 1.30 (stake × original price / current price):
- A wins: back wins £200, lay loses £69 → net +£131
- A does not win: back loses £100, lay wins £230 → net +£130

Exchange gives you ~£130 guaranteed.

Bookmaker cash out offer: £115 (they embed ~12% additional margin on the cash out).

**Difference: £15 — or the cost of using the bookmaker''s cash out product instead of the exchange.**

## When to Use Bookmaker Cash Out

Only if exchange liquidity is insufficient to match your lay position. The bookmaker cash out, despite its margin, is better than no cash out at all.

## When to Never Cash Out

On small bets (under £20), the friction of executing an exchange lay (minimum bet amounts, commission) may exceed the benefit. For small recreational bets, holding to expiry is often the practical choice.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Live Spread Betting: A Different Instrument', 'live-spread-betting',
'## What Is Spread Betting?

Spread betting is a distinct financial instrument applied to sports. Instead of binary win/lose outcomes, you bet on whether a quantity (goals, corners, points, minutes to first goal) will be above or below a spread.

Your profit or loss is proportional to how far the result is from your bet price — unlike fixed-odds betting where payout is predetermined.

## The Spread Betting Mechanics

**Spread:** The bookmaker quotes a bid (sell) and ask (buy) price. For example: corners spread 10–11.

If you buy corners at 11 (betting the total will be above 11) for £10/corner:
- 14 corners: profit = (14 − 11) × £10 = +£30
- 8 corners: loss = (11 − 8) × £10 = −£30

## The Unlimited Loss Problem

Unlike fixed-odds betting, spread betting has theoretically unlimited loss. If you buy corners at 11 and only 3 occur, you lose (11−3) × £10 = £80. For very unlikely extreme outcomes, losses can vastly exceed stakes.

This makes spread betting inherently more dangerous for inexperienced bettors who do not set stop-loss levels.

## Where Spread Betting Has Potential Value

Because spread betting is less regulated in some jurisdictions (classified as a financial product rather than gambling), it is offered by specialist firms (Spreadex, Sporting Index) rather than mainstream bookmakers. These firms'' model quality varies — creating occasional edges for analysts with strong quantitative models.

## The Tax Advantage

In the UK, spread betting winnings are exempt from Capital Gains Tax and Betting Duty (as of current legislation). For high-volume profitable bettors, this tax treatment can meaningfully improve net returns compared to fixed-odds betting.

Consult a tax professional for your specific jurisdiction and situation.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Live Betting Framework', 'building-live-betting-framework',
'## The Framework Imperative

Unstructured live betting — reacting to events as they happen without a defined process — is almost universally losing. The live environment is designed to stimulate emotional responses (urgency, excitement, regret avoidance) that lead to poor decisions.

A framework converts the chaotic live environment into a structured decision process.

## The Pre-Match Setup

Before the event:
1. Run your pre-game model → record your estimated match probabilities and goals expectation
2. Identify the live market conditions under which you would place a bet (e.g. "If Arsenal drift to 2.60 in-play while leading 1-0 at 60 minutes, that exceeds my model estimate of 2.10 — I will back them")
3. Pre-set your live stake (typically 50% of pre-game stake to reflect higher margin and faster decision-making)
4. Confirm the bookmaker/exchange interface is open and the market is loaded

## During the Event

- Observe match conditions: is performance consistent with your pre-game model?
- Monitor price vs your pre-game estimate
- Place bets ONLY when both conditions are met: (a) price exceeds model by your threshold AND (b) no new information contradicts your model

## Strict Pass Rules

Pass on any live bet if:
- You did not analyse this match pre-game
- A significant unexpected event occurred (injury, red card) that you have not processed
- The price has already moved significantly in your favour (you may have missed the opportunity)
- You are in the 5 minutes before or after half-time (highest suspension and confusion risk)

## Post-Match Review

Log every live bet with: pre-game model probability, live price taken, game state at bet time, outcome, and CLV vs Pinnacle live closing. This data, accumulated over 200+ live bets, reveals whether your live betting is genuinely adding value or consuming edge.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert In-Play Operations: Technology and Process', 'expert-in-play-operations',
'## The Professional In-Play Setup

Expert in-play betting operations combine real-time data infrastructure, automated model updates, rapid execution tools, and structured decision frameworks into a cohesive system.

## The Technology Stack

**Data feeds:**
- Live match event stream (Sportradar or equivalent)
- Real-time xG accumulation from shot events
- Live exchange price feed (Betfair streaming API)
- Live bookmaker price feed (licensed data providers)

**Model layer:**
- Live probability calculator that updates after every match event
- Comparison engine: live model probability vs live market implied probability
- Alert generator: when discrepancy exceeds threshold, alert is triggered

**Execution layer:**
- Pre-loaded bet slips on exchange and bookmaker
- One-click execution with pre-defined stake
- Automatic CLV logging on bet confirmation

## The Response Protocol

When an alert fires:
1. Assess: is this alert based on model accuracy or a news event not yet in model? (3-second check)
2. Is the market still open? Check suspension status.
3. Execute if conditions clear.
4. Log immediately: price taken, model probability, reason for action.

## The Realistic Throughput

Even with automated alerts, an individual operator can realistically execute 3–8 in-play bets per match day when monitoring multiple matches simultaneously. Focus on the highest-EV alerts rather than acting on every signal.

## The Sustainability Ceiling

In-play betting at professional scale has high infrastructure cost, high time demand, and lower volume capacity per bettor than pre-game betting. The combination makes it most valuable as a complement to a pre-game operation rather than a standalone strategy for most operators.

For specialist in-play traders with automated systems: the combination of low-margin exchange markets, high information speed, and systematic modelling can produce significant consistent returns — but requires the full professional infrastructure described above.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-in-play-bet-types' AND cat.slug = 'bet-types';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — Player Props & Specials                     ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Introduction to Player Prop Markets', 'intro-player-prop-markets',
'## What Are Player Props?

Player proposition (prop) bets are wagers on specific individual player performance outcomes within an event. Examples:

- **Football:** Anytime goalscorer, first goalscorer, player to receive a card, player assists
- **Basketball:** Points, rebounds, assists over/under for a specific player
- **American Football:** Passing yards, rushing yards, touchdowns for specific players
- **Tennis:** Aces, double faults, total games won by a specific player

Props shift focus from team-level outcomes to individual performance — a distinct analytical challenge.

## Why Props Markets Are Often Inefficient

- **Lower priority:** Bookmakers invest less modelling resource in props than in match winner markets
- **Data scarcity:** Player-level historical performance data is harder to source and clean than match-level data
- **Public sentiment bias:** Popular players (star strikers, celebrity athletes) are over-bet regardless of true probability — creating consistent value on their opponents or on lesser-known performers

## The Data Requirement

Profitable player prop betting requires player-level statistics:
- Goals, assists, shots on target, key passes (football)
- Points, rebounds, assists averages plus opponent defensive rating (basketball)
- Serve percentage, aces per set, break points converted (tennis)

Sources: FBref, Understat, Basketball-Reference, Tennis Abstract — all free with significant depth.

## The Edge Assessment

For each player prop market, your analytical question is: does the bookmaker''s implied probability (1/offered price) accurately reflect this player''s probability of achieving this outcome in this specific game context?

Player props are won in the research — not in the bet.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Anytime Goalscorer: The Most Common Football Prop', 'anytime-goalscorer-betting',
'## The Anytime Goalscorer Market

The anytime goalscorer (ATGS) market asks: will this specific player score at least one goal in the match? It is the most popular player prop in football and one of the highest-margin markets.

## The Pricing Problem

ATGS markets typically carry 20–35% effective margin across all listed players. The bookmaker prices each player independently, and the sum of all implied probabilities far exceeds 100%.

**Example:** In a 11-player match, if every outfield player had a true 10% probability of scoring, the fair market would sum to 100% (10 × 10%). But the bookmaker prices each at 12–15% implied, producing a sum of 120–150%.

## The True Probability Components

P(Player X scores anytime) = P(Player X plays) × P(Player X participates in ≥1 scoring chance) × P(Player X converts ≥1 chance)

Each component requires distinct modelling:
- **Minutes probability:** Based on injury history, current fitness, manager rotation signals
- **Chance involvement:** xG involvement rate (xG per 90 minutes when playing)
- **Conversion:** Non-penalty xG over/under conversion rate historically

## Where ATGS Value Exists

**1. Injury news not priced in:** A player listed but with unconfirmed fitness concern — if your news sources confirm fitness while the market still shows him, the price reflects uncertainty that you have resolved.

**2. High xG involvement, low goal conversion, positive regression incoming:** A player whose shots are generating high xG but converting below their historical rate is likely to see positive regression. Their ATGS price may be stale relative to their current form level.

**3. New penalty takers:** When a team''s penalty taker changes (through transfer, red card, or manager decision), the anytime goalscorer probabilities for both the old and new taker need substantial revision.

## Margin Reality Check

Even with an identified edge, the 20–30% effective margin on ATGS markets means you need significant probability estimation advantage to profit. Consider whether singles at Pinnacle (much lower ATGS margins of ~10–15%) are preferable to standard bookmaker prices.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Basketball Player Props: Points, Rebounds, Assists', 'basketball-player-props',
'## Why Basketball Props Are More Tractable

Basketball player props are, on average, more predictable than football goalscorer markets. The reasons:

1. **High volume:** Players accumulate 15–35 statistical events (shots, rebounds, assists) per game vs a striker who might take 2–3 shots
2. **Stable rates:** A player''s per-game averages are stable over 20+ game windows
3. **Opponent matchup data:** Defensive ratings by position are well-documented and predictable
4. **Minutes predictability:** NBA rotation patterns are consistent and publicly known

## The Core Model

Expected player points = Minutes played × (Points per minute adjusted for opponent)

**Step 1:** Calculate the player''s points per minute over last 20 games (excludes blowouts where he rested)
**Step 2:** Adjust for opponent''s defensive rating vs this position (how many points do opposing players at this position average?)
**Step 3:** Estimate minutes — based on recent rotation and confirmed injury report
**Step 4:** Multiply to get expected points

## The Over/Under Prop Value Calculation

Bookmaker line: LeBron James Over/Under 26.5 points at 1.91 each.
Your model estimates: 27.4 points expected, with a standard deviation of ~6 points.

P(Over 26.5) = P(Normal distribution with mean 27.4, sd 6 exceeds 26.5) = 56%

Implied probability at 1.91 = 52.4%.

56% > 52.4% → marginal value on Over.

## Injury Report Timing

NBA injury reports (official) are released at specific times before games. Players listed as "questionable" create pricing uncertainty. Acting immediately when a "questionable" player is confirmed as "active" (or "out") captures the most significant edges in basketball props.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'NFL Player Props: The Largest Prop Market', 'nfl-player-props',
'## The Scale of NFL Props

The NFL is the largest sports betting market in North America, and player props constitute a significant portion of that market. On Super Bowl weekend, more money is bet on player props than on the game result.

## Key NFL Prop Categories

**Passing (Quarterback):**
- Passing yards (Over/Under)
- Touchdown passes
- Interceptions
- Completions

**Rushing (Running Back):**
- Rushing yards
- Receiving yards
- Total touchdowns

**Receiving (Wide Receiver/Tight End):**
- Receiving yards
- Receptions (catch count)
- Targets

## The Basic Model

Expected receiving yards = (Player''s average yards per route) × (Expected targets) × (Expected catch rate)

Expected targets are derived from:
- Historical target share (% of team''s targets this player receives)
- Opponent''s coverage scheme (how they defend this receiver''s route tree)
- Game script prediction (will this team be throwing a lot? High-total game implies more passing)

## The Game Script Factor

NFL game script is the dominant variable for prop modelling:
- A team projected to win comfortably runs the ball more in the second half → suppresses passing props for both teams
- A team projected to trail runs hurry-up offence → increases passing props

Your total game model directly influences player prop estimates. This is why NFL prop specialists also need strong game model capability.

## Weather in NFL Props

Cold weather suppresses passing. Wind above 15 mph reduces completion percentages and passing yards. Rain reduces deep routes and increases run plays. These are quantifiable, consistent effects worth modeling for outdoor stadium games.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Specials Markets: The Entertainment Tier', 'specials-markets-entertainment',
'## What Are Specials?

Specials are novelty betting markets that do not fit standard match outcome categories. Examples:

- "Which manager will be sacked first this season?"
- "How many goals will Harry Kane score this season?"
- "Will this match go to extra time?"
- "Which team will finish higher in the league?"
- "Number of yellow cards in the match" (Over/Under)

## The Margin Reality

Specials typically carry the highest margins of any betting product — often 20–40%. The bookmaker prices them without competitive pressure and with the knowledge that most bettors approach them casually.

## When Specials Have Value

Very occasionally, a specific special has genuine value because:
1. The bookmaker has made an obvious pricing error (checkable against objective data)
2. You have specific domain expertise that significantly improves your probability estimate
3. The market is new and the bookmaker is clearly guessing

**Example:** "Number of yellow cards Over/Under 3.5." You know this match features a strict referee + two physically aggressive teams. Historical data for this combination: 65% over 3.5 cards. The bookmaker prices Over at 2.10 (implied 47.6%). This is a clear mispricing — and quantifiable.

## The Yellow/Red Card Markets

Cards markets are one of the more tractable specials because:
- Referee tendency is a stable, quantifiable factor
- Team aggression is measurable (tackles per game, fouls per game)
- Historical referee-team combination data is available

Build a cards model using referee × team aggression combinations. Compare to offered card markets.

## The Recommendation

Treat specials as entertainment unless you have a specific, quantified reason to believe the offered price is wrong. The cost of systematic specials betting without edge is the highest in the industry.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Player-Level Statistical Model', 'building-player-statistical-model',
'## The Data Architecture for Player Models

Player prop betting demands player-level data that match-level betting does not require. Building a player model requires a different data infrastructure from team-level betting.

## The Required Data

**Football (per player, per match):**
- Minutes played
- Shots (total, on target, from inside box)
- xG (expected goals generated)
- Key passes, xA (expected assists)
- Dribbles attempted/completed
- Defensive actions (tackles, interceptions, clearances)
- Pass completion rate

**Source:** FBref provides this data free for the top 5 European leagues + Champions League.

## The Model Architecture

**Layer 1 — Player baseline:**
Rolling 10-match average for each key metric (minutes, xG, shots on target), weighted more heavily on recent matches.

**Layer 2 — Matchup adjustment:**
Opponent''s defensive rating vs this player''s position/role. A centre-forward facing a top-quartile defensive team receives fewer shots and generates less xG.

**Layer 3 — Team context:**
Team''s attacking xG expected in this match. In a match where the team is expected to generate 2.5 xG, the share allocated to this player is derived from their historical xG share.

**Layer 4 — Minutes probability:**
Confirmed fitness, rotation risk, booking status (5th yellow card = suspension risk creates rotation).

**Output:**
Expected xG, shots on target, and assists for the player in this specific match. Convert to prop probabilities using historical conversion rates.

## Validation

Track every player prop bet against closing prices on Pinnacle or the exchange. Calculate player-level CLV. After 100+ bets on a specific player, you will know whether your model adds value for that player''s specific markets.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Prop Betting and the Lineup Confirmation Edge', 'prop-betting-lineup-confirmation',
'## The Information Advantage That Exists

One of the most consistent and legally accessible edges in player prop betting comes from lineup confirmation timing. When confirmed lineups are released (typically 60–90 minutes before kick-off), they significantly update player prop probabilities. Markets take time to reprice fully.

## The Pre-Announcement Window

Before lineup confirmation:
- Starting probability: estimated from rotation history, fitness signals, injury reports
- The bookmaker''s player prop price includes this uncertainty

After lineup confirmation:
- Starting probability: 100% (confirmed starter) or 0% (confirmed not starting)
- The prop price should reprice immediately and significantly

In practice, repricing takes 5–30 minutes on soft books. During this window, confirmed starters'' prop prices may still reflect pre-confirmation uncertainty — creating potential value on confirmed starters.

## The Reverse: Confirmed Non-Starter

If a player listed at 2.50 (ATGS, 40% implied) is confirmed as not starting:
- Their true probability drops to near 0 (substitute who scores is much rarer)
- If the soft book has not updated the price, they are temporarily overpriced — a lay opportunity on the exchange

## The Workflow

1. Set up notifications for official lineup releases in your target leagues
2. Immediately run your model with confirmed lineup inputs
3. Compare to current soft book prices
4. Act within 5 minutes of lineup release on any significant discrepancy

## Systematic Lineup Edge Research

Track, for every player prop bet:
- Was the bet placed pre-lineup or post-lineup confirmation?
- What was the CLV?

If post-lineup bets have significantly higher CLV than pre-lineup bets, the confirmation edge is real and systematically valuable.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Player Prop Correlation in Combination Bets', 'player-prop-correlation-combinations',
'## The Correlation Opportunity in Props

Player props are particularly interesting for combination bets because the correlation between some props is strong and predictable — and bookmakers do not always model it accurately.

## Positive Correlations (Both More Likely Together)

**Quarterback passing yards + Wide receiver receiving yards:**
These are almost perfectly positively correlated in the same game. More team passing yards = more individual receiver yards. A bet builder combining a QB over passing yards with a WR over receiving yards bets the same underlying variable twice — not an independent combination.

**Team to score many goals + Leading striker to score:**
A team winning 4-2 makes the striker scoring anytime more likely. The combination of "over 3.5 goals" + "striker anytime scorer" is more probable than their individual probabilities multiplied — they are positively correlated.

## Where Bookmakers Under-Price the Correlation

Some bookmakers'' same-game multi (bet builder) engines use simplified correlation models. When two props are highly positively correlated but the bookmaker treats them as independent (multiplying probabilities), the combined price is understated — the bet builder offers better than fair value.

Finding these correlations requires a player × team probability model that estimates joint probabilities. This is advanced modelling work but can produce persistent prop combination edges.

## Negative Correlations to Avoid

Some combinations are negatively correlated:
- "Team A to win" + "Team B striker to score anytime" — if Team A wins, it is less likely Team B scored (or vice versa). Combining these reduces the true joint probability below the independent product.

Bookmakers may overprice negatively correlated combinations — making them worse value than they appear.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Managing a Player Props Portfolio', 'managing-player-props-portfolio',
'## The Unique Challenges of Props

A player props portfolio differs from a match winner or handicap portfolio in several important ways that affect risk management:

1. **Higher margin:** Props carry 15–25% vs 2–5% for core markets. Each bet must overcome a higher hurdle.
2. **Less exchange liquidity:** Most player props are not available on exchanges. You are limited to bookmakers who will restrict winning prop accounts.
3. **Individual player variance:** A single injury or substitution can invalidate an entire night''s prop positions.
4. **Account health:** Prop bettors who win consistently are restricted very quickly by soft books.

## Portfolio Construction for Props

- **Cap per player:** Maximum 3% of props portfolio on any single player per match day. Player-specific variance is too high for concentration.
- **Sport diversification:** Football, basketball, and NFL props have uncorrelated event schedules. A bad football prop night does not affect basketball prop outcomes.
- **Market diversification within props:** Anytime scorer, assists, cards, total shots — each has different variance profiles and different market efficiency characteristics.

## Account Health in Prop Markets

Prop bettors are among the fastest to be restricted at soft books. To extend account lifespan:
- Mix some recreational bets (accumulators, entertainment specials) with sharp prop plays
- Limit prop betting frequency to 3–4 bets per account per week
- Withdraw infrequently

## The CLV Benchmark for Props

At Pinnacle (the sharpest prop market available), compare every prop bet. If the soft book prop price is consistently better than Pinnacle by 3%+, you are extracting genuine value. If not — if Pinnacle regularly beats your soft book prop prices — reassess your market selection.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Prop Betting: Building a Scalable System', 'expert-prop-betting-system',
'## The Expert Prop Operation

A scalable player props operation combines automated data pipelines, player-level models, lineup monitoring systems, and systematic account management — all optimised for the unique constraints of the props market.

## The Automated Pipeline

**Daily data update (automatic):**
- Fetch yesterday''s match results and player statistics
- Update all player rolling averages
- Update opponent defensive ratings with new match data

**Match-day prediction (automatic):**
- Generate player prop probability estimates for all upcoming matches
- Compare to current prop market prices (Pinnacle + top soft books)
- Flag all props where model exceeds implied probability by > threshold

**Lineup confirmation (manual/automated):**
- Monitor official lineup releases
- Re-run model with confirmed lineup inputs
- Generate updated alerts for post-confirmation props

**Bet placement (manual):**
- Review alerts, confirm no new disqualifying information
- Place bets across multiple accounts
- Log immediately with full metadata

## The Account Rotation Strategy

With soft books restricting winning prop accounts quickly:
- Cycle through 3–4 accounts per soft book before focusing too heavily on one
- Open new accounts before existing accounts reach restriction threshold
- Keep a "props account" and a "main account" separate at each bookmaker

## The Maximum Viable Scale

A single operator running this system can realistically cover:
- 3 sports (football, basketball, one American sport)
- 15–25 prop bets per week
- 5–8 active soft book accounts

Scaling beyond this requires either hiring analysts or automating the match-day prediction and comparison steps fully.

## The Long-Term Career Path

Player props expertise is highly portable across jurisdictions as sports betting legalises in new markets. Early entry to newly legal markets (where books are setting initial prop prices without sophisticated local competition) is consistently the highest-edge window in the props lifecycle.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'player-props-and-specials' AND cat.slug = 'bet-types';
