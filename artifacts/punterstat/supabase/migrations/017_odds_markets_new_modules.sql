-- ============================================================
-- PunterStat — Betting Academy: Odds & Markets New Modules
-- Migration 017: Add 4 new modules (10 lessons each)
--   Module 3: Odds Comparison & Line Shopping  (intermediate)
--   Module 4: Live & In-Play Odds              (intermediate)
--   Module 5: Exchange Betting & Lay Markets   (advanced)
--   Module 6: Building Your Own Lines          (expert)
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ── New Modules ───────────────────────────────────────────────

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Odds Comparison & Line Shopping', 'odds-comparison-line-shopping',
  'How to find the best available price on every bet — and why the difference between best and second-best price is worth more than your selection process.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'odds-and-markets';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Live & In-Play Odds', 'live-and-in-play-odds',
  'How in-play markets work, why prices move so fast, and the specific edges that exist in the live betting environment.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'odds-and-markets';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Exchange Betting & Lay Markets', 'exchange-betting-lay-markets',
  'The mechanics of betting exchanges — backing, laying, trading, and why exchanges represent the most transparent market structure in sports betting.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'odds-and-markets';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Building Your Own Lines', 'building-your-own-lines',
  'How to construct your own price for an event from scratch — the methodology professionals use to identify when bookmakers are wrong.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'odds-and-markets';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Odds Comparison & Line Shopping             ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Why Line Shopping Is Non-Negotiable', 'why-line-shopping-non-negotiable',
'## The Single Easiest Edge in Betting

Line shopping — always taking the best available price across multiple bookmakers — requires no predictive skill. It is purely operational discipline. Yet it is one of the highest-ROI habits a bettor can build.

## The Numbers Are Real

Suppose you place 300 bets per year at an average stake of £50. On average, the best available price is 0.08 decimal points higher than the second-best.

- 300 bets × £50 stake × 0.08 edge ≈ £1,200 additional profit per year
- That is 8% extra ROI on your turnover without changing a single selection

## Why Most Bettors Do Not Line Shop

1. **Friction:** Logging into multiple accounts takes time
2. **Loyalty:** Many recreational bettors use one bookmaker out of habit
3. **Ignorance:** They do not know prices differ significantly across books

## What Line Shopping Actually Requires

- Accounts at 5–8 bookmakers covering sharp and soft tiers
- A comparison tab open before every bet (Oddschecker, OddsPortal, or a manual spreadsheet)
- 30–90 extra seconds per bet

The payoff per hour of this additional time exceeds almost any other improvement you can make to your betting process.

## Getting Started

Open accounts at a minimum of: Pinnacle (or an exchange), two mid-tier books, and two soft books. Check all five before every bet. Within a month, the habit becomes automatic.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How to Use Odds Comparison Sites', 'how-to-use-odds-comparison-sites',
'## The Major Platforms

- **Oddschecker (UK):** Best for UK/Irish markets, horse racing, football. Shows best available price highlighted in green.
- **OddsPortal:** Wider European and international coverage. Also tracks historical closing lines.
- **BetBrain:** Strong on European football.
- **Betegy / Betfair Hub:** Useful for exchange price benchmarking.

## Reading a Comparison Page

A standard comparison table shows:
- Each bookmaker''s current price on a row
- The best price highlighted (typically green or bold)
- Historical price movement (optional — check the price graph if available)

## What to Look For

1. **The range:** How wide is the spread between best and worst price? A wide range (e.g. 2.20 vs 1.95 for the same outcome) signals price inefficiency — dig into why.
2. **Which book is highest:** Is the outlier consistently Pinnacle (sharp signal) or a soft book (soft error to exploit)?
3. **Movement direction:** Is the price shortening (money coming in) or drifting (money going elsewhere)?

## Time Sensitivity

Comparison sites update with slight delays. For liquid markets, always cross-check the live bookmaker site before placing. For illiquid markets (lower leagues, minor sports), the comparison site is usually accurate enough.

## Building Your Own Reference Table

For markets you bet in regularly, build a personal spreadsheet tracking which bookmakers consistently offer the best price. After 50 bets, patterns emerge — some books consistently lead on certain markets, allowing you to check them first.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Quantifying the Value of a Better Price', 'quantifying-value-better-price',
'## Turning Price Differences into Money

Many bettors know that better prices are good in principle, but few have calculated what specific price differences are worth.

## The Expected Value Difference Formula

EV Difference = Stake × (Price A − Price B) × True Probability of Winning

At stake = £100, Price A = 2.20, Price B = 2.10, True P = 45%:

EV Difference = £100 × (2.20 − 2.10) × 0.45 = £100 × 0.10 × 0.45 = £4.50 per bet

## Annualised Impact

If you make this improvement on 200 bets per year: 200 × £4.50 = £900 extra profit.

The true probability cancels across many bets, so the practical formula simplifies to:

Annual Gain ≈ Annual Stake Volume × Average Price Improvement

## Price Improvement Benchmarks

- 0.05 improvement on 200 bets × £100: ~£500/year
- 0.10 improvement on 200 bets × £100: ~£1,000/year
- 0.15 improvement on 200 bets × £100: ~£1,500/year

## The ROI Equivalence

For a bettor with 3% ROI who line shops and gains an additional 2% effective improvement: this is the same as a 67% increase in profitability — without improving selection quality at all.

## Application

Before every bet: check the comparison site, note the best price, and calculate whether the extra step of using an account you use less frequently is worth the access time. Invariably, it is.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Managing Multiple Bookmaker Accounts', 'managing-multiple-bookmaker-accounts',
'## The Account Portfolio

Serious line shoppers maintain 8–15 active accounts across different bookmakers. Managing this portfolio is a discipline in itself.

## Account Tiers

**Tier 1 — Sharp/Exchange (primary):**
- Pinnacle, Betfair, Matchbook, Smarkets
- Use for every bet as primary price benchmark
- Unlimited or high limits; winner-tolerant

**Tier 2 — Mid-tier (secondary):**
- Bet365, Unibet, William Hill (online)
- Use for occasional better prices or promotions
- Will restrict if you win consistently but more slowly

**Tier 3 — Soft/Promo (tactical):**
- Smaller regional books, new entrants
- Use for promotional value and price outliers
- Restrict quickly — manage account health carefully

## Account Health Management

Soft books monitor several signals for restrictions:
- Consistent profit (the most obvious trigger)
- Always taking the best available price (signals sharp activity)
- High percentage of early bets (before prices adjust)
- Low accumulator / high singles ratio

To extend soft account life:
- Occasionally place a small accumulator
- Do not always take maximum available stake
- Withdraw less frequently than monthly

## KYC and Verification

Keep verification documents ready. Most bookmakers require ID proof and proof of address before withdrawals over certain thresholds. Delay here costs money when you need to withdraw quickly.

## Record Keeping for Accounts

Maintain a spreadsheet: bookmaker, account status (open/limited/closed), current balance, restriction level, best markets at that book. Update after every session.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Steam Moves and Beating the Market', 'steam-moves-beating-the-market',
'## What Is a Steam Move?

A steam move is a sharp, rapid line movement driven by coordinated sharp money hitting multiple bookmakers simultaneously. Within seconds, a price might move from 2.20 to 2.00 across all major books.

## Why Steam Moves Happen

Sharp syndicates place large bets across multiple books to maximise the amount they can bet before the line moves. The signal propagates: one book moves, others copy instantly to avoid arbitrage exposure.

## How to Read Steam

When you see a price drop sharply without obvious public news (no injury announcement, no lineup news), a steam move is the likely cause. The interpretation: smart money has determined this selection is underpriced and acted simultaneously.

## Trading Ahead of Steam

Some bettors specialise in predicting steam moves before they happen — based on model output, inside information, or historical patterns. This is called "beating the move." If you can identify a mispriced line before it steams, you capture the maximum edge.

## Reverse Line Movement

Reverse line movement occurs when public betting sentiment is clearly on one side, but the line moves against that side. If 75% of bets are on Team A, but the price on Team A shortens (rather than lengthening), sharp money is on Team A — pushing the line even though the public is already on that side.

This is a powerful directional signal: when sharp money and public money align (same direction), confidence is highest. When they diverge (public on A, line moves toward B), follow the sharp signal.

## Practical Application

Set up price alerts at comparison sites for your key markets. When a price moves sharply without news, cross-check volume indicators and decide whether the move confirms or contradicts your analysis.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Arbitrage: Risk-Free Profit Between Books', 'arbitrage-between-books',
'## What Is Sports Arbitrage?

Arbitrage (arb) occurs when two or more bookmakers price the same event such that you can back all outcomes at combined odds that guarantee a profit regardless of result.

## A Simple Example

- Bookmaker A: Team X at 2.20
- Bookmaker B: Team Y at 2.10

Both sides of a two-outcome market. Check if an arb exists:

1/2.20 + 1/2.10 = 0.4545 + 0.4762 = 0.9307 → 93.07% < 100% → **Arb exists**

Profit margin: (1/0.9307) − 1 = 7.45%

## Calculating Stakes

To guarantee equal profit:

Stake on X = Total stake × (1/Price X) / (1/Price X + 1/Price Y)
Stake on Y = Total stake × (1/Price Y) / (1/Price X + 1/Price Y)

At £1,000 total: £489 on X at 2.20 = £1,076; £511 on Y at 2.10 = £1,073. Both outcomes return ~£1,075. Profit: ~£75 guaranteed.

## The Practical Obstacles

1. **Speed:** Arbs disappear in seconds as books adjust
2. **Stake limits:** You cannot always place the required stake
3. **Account restrictions:** Books restrict arbers aggressively
4. **Voided bets:** One leg voided without the other destroys the hedge
5. **Withdrawal friction:** Funds spread across books

## Arbing as a Sustainability Problem

Pure arbing is not sustainable long-term — accounts are restricted and closed quickly. Most serious bettors use arb-detection tools to find line shopping opportunities rather than pure arbs, preserving account health while still capturing most of the edge.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Closing Line Value as a Performance Metric', 'closing-line-value-performance-metric',
'## The Problem With Short-Run Profit

Profit over 50–100 bets is heavily influenced by variance. A bettor with no edge can show a 10% ROI at 50 bets purely through luck. A skilled bettor can show −5% ROI over the same sample due to bad variance.

## Closing Line Value: The Alternative

Closing Line Value (CLV) measures whether the prices you take are consistently better than the final closing price (the most accurate market estimate at event start).

CLV per bet = (Your taken price − Closing de-vigged price) / (Closing de-vigged price − 1)

If positive, you beat the market. If negative, you took a worse price than the market corrected to.

## Why CLV Is More Reliable Than P&L at Small Samples

At 200 bets:
- P&L has standard deviation of ~20–30% ROI due to variance
- CLV has standard deviation of ~5–8% due to averaging dozens of price comparisons

CLV becomes statistically meaningful at 200 bets; P&L requires 500–1,000+.

## Benchmarking Yourself

A consistent positive CLV of 2–3% across 300+ bets is strong evidence of skill. Professional bettors target 3–5% CLV as their core performance indicator.

## Tracking CLV

For every bet:
1. Record the price you took
2. Record the Pinnacle closing price (or exchange closing price) for the same outcome
3. De-vig the closing price
4. Calculate CLV

Maintain a rolling CLV chart. If it trends toward zero or negative, your edge is disappearing — act before your P&L reflects it.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Automated Price Monitoring Systems', 'automated-price-monitoring',
'## Moving Beyond Manual Checking

At scale (100+ active markets), manual comparison checking is impossible. Professional operations use automated monitoring to flag opportunities in real time.

## What Automated Systems Do

1. **Scrape prices** from multiple bookmakers every 30–120 seconds
2. **Calculate differentials** versus a benchmark (usually Pinnacle)
3. **Flag alerts** when differential exceeds a threshold (e.g. 3% above Pinnacle)
4. **Log line movement** for post-hoc analysis

## Tools Available to Semi-Professional Bettors

- **OddsMonkey / RebelBetting / Trademate Sports:** Subscription services that flag value bets and arbs in real time
- **SureBetPro / BetBurger:** Arb-specific scanners
- **BetExplorer API / Pinnacle API:** For custom system builders

## Building Your Own Simple Monitor

A basic system can be built with:
- A spreadsheet with IMPORTXML formulas pulling prices from comparison sites (refreshes on open)
- Python with BeautifulSoup scraping comparison pages
- A webhook to a messaging app (Telegram, Slack) that alerts when a differential fires

## The Workflow With Automation

1. System alerts you to a price discrepancy
2. You verify: is this a genuine edge or is there news explaining the discrepancy?
3. If genuine: place the bet immediately before the line corrects
4. Log the bet and the differential for CLV tracking

## Legal and Terms-of-Service Considerations

Automated scraping may violate some bookmakers'' terms of service. Most professional operations use licensed data feeds or API access to stay compliant. The tools mentioned above operate within legal boundaries.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Selective Aggression: When to Bet Bigger', 'selective-aggression-bet-sizing',
'## The Mistake of Uniform Stake Sizes

Many bettors stake the same amount on every bet, regardless of the quality of the opportunity. This wastes edge on marginal opportunities and under-exploits strong ones.

## The Line Shopping Dimension

Line shopping does not just tell you where to bet — it tells you how much to bet. The larger the price differential between your best available price and the fair/closing price, the more confident you can be that genuine value exists.

## A Framework for Variable Staking

Calibrate stake size to the estimated edge:

| CLV Estimate | Stake (as % of standard unit) |
|---|---|
| < 1% | 0.5 units (half stake) |
| 1–2% | 1.0 units (standard) |
| 2–4% | 1.5 units |
| > 4% | 2.0 units (double) |

This is not the Kelly Criterion (which uses true probability estimates) — it is a simplified heuristic based on observable edge signal.

## The Risk of Over-Scaling

Scaling stakes too aggressively on high-CLV opportunities creates a different problem: a few outsized losses in a run cause disproportionate drawdown. The rule: never exceed 3–4× your standard unit regardless of CLV, without a rigorous mathematical model supporting the position.

## Combining Line Shopping with Bankroll Management

Line shopping and bankroll management are complementary disciplines. Together they determine:
1. Which price to take (line shopping)
2. How much to stake at that price (bankroll management + edge estimate)

The bettor who masters both is operating at the highest level of process-oriented betting.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Sustainable Price-Hunting Operation', 'sustainable-price-hunting-operation',
'## From Individual Habit to Systematic Process

The highest-performing bettors do not just line shop — they run a price-hunting operation with documented processes, performance tracking, and continuous improvement loops.

## The Core Operational Elements

**1. Account infrastructure:** Maintain active accounts at 10+ bookmakers, with balances pre-positioned for rapid deployment. Update balances weekly.

**2. Monitoring layer:** Automated or semi-automated price alerts for every market you follow.

**3. Decision layer:** A clear framework for what constitutes an actionable opportunity (minimum CLV threshold, minimum liquidity, maximum stake).

**4. Execution layer:** Rapid bet placement with pre-filled amounts; every second of hesitation risks the opportunity closing.

**5. Recording layer:** Every bet logged with taken price, closing price, CLV, and reasoning.

**6. Review layer:** Weekly CLV review; monthly market-tier performance review; quarterly account status review.

## The Account Replacement Problem

As soft accounts are restricted, they must be replaced. The pipeline:
- Open 2–3 new accounts per quarter before existing ones are restricted
- Use family members'' accounts (where legally permitted and compliant with terms)
- Focus new accounts on books with the highest price leadership in your key markets

## Scaling

A price-hunting operation scales in two ways:
1. **More markets:** Wider coverage, more alerts, more opportunities
2. **Higher stakes per market:** Requires deeper bankroll and access to higher limits

Both require systematic process, not just more time. Document everything so the process can run the same way regardless of emotional state.

## The Professional Standard

The elite level of this practice — operating a fully systematic, data-driven line-shopping operation — is indistinguishable from running a small financial trading operation. The discipline, record-keeping, and analytical rigour required are the same.',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'odds-comparison-line-shopping' AND cat.slug = 'odds-and-markets';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — Live & In-Play Odds                         ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How In-Play Markets Work', 'how-in-play-markets-work',
'## The Live Betting Revolution

In-play (live) betting lets you place bets after an event has started. Prices update continuously based on what is happening on the pitch, court, or track. It now accounts for the majority of sports betting volume at most major operators.

## How Live Prices Are Generated

Bookmakers use automated algorithms (called "traders" or "trading engines") that:
1. Receive live event data feeds (score, possession, shots, time elapsed)
2. Update a probability model in real time
3. Apply a margin to the updated probability
4. Publish the resulting price — often updated every 5–30 seconds

## What Changes Live Prices

- **Score changes:** A goal immediately reprices all remaining markets
- **Red cards:** Significant repricing of match winner and goals markets
- **Time:** As the match progresses, remaining time affects uncertainty — prices compress on the favourite if time is short
- **Injuries/substitutions:** Significant but usually slower to price in

## Suspensions: The Bookmaker''s Brake

Bookmakers "suspend" markets (temporarily halt betting) around expected volatility moments:
- Immediately after a goal
- During VAR checks
- Around half-time
- After a red card

Suspensions protect the bookmaker from bettors acting on information faster than the algorithm. The window between event and suspension is where in-play edges exist — but it is measured in seconds.

## The Information Speed Problem

Live betting edges are almost always about information speed. If you are watching a match with a 5-second broadcast delay, you cannot act faster than a bettor with a pitch-side data feed. Know what your information disadvantage is before attempting live betting.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Reading In-Play Price Movement', 'reading-in-play-price-movement',
'## Prices Tell a Story

In-play price movements are the aggregate of all bettor activity plus the algorithm''s model. Reading these movements correctly gives you information beyond what the raw game data provides.

## The Benchmark: Pre-Game Closing Line

Always start with the pre-game closing price as your reference point. The live price should be consistent with game state relative to that baseline. If it is not, there may be a pricing error.

## Common Live Patterns

**After a goal for the favourite:**
Expected: favourite price drops significantly.
Watch for: price dropping less than expected → market disagrees with the goal''s significance (perhaps the goal was against the run of play).

**After a goal for the underdog:**
Expected: underdog price shortens sharply.
Watch for: underdog price shortening less than expected relative to time remaining → market sees the goal as fluky.

**Goalless at half-time in a match expected to have goals:**
Both teams'' next-goal prices and over-goals prices shift. The algorithm may overshoot or undershoot depending on how well it models game state vs pure expected goals.

## The Time Decay Dynamic

As an event nears its end, uncertainty decreases. A winning team''s price shortens not because anything new happened but because time remaining decreases. Understanding this "time decay" dynamic prevents you from misreading routine price movement as a signal.

## Pattern Recognition Exercise

Watch 20 live football matches with the live market open alongside. For each significant event, predict what the price movement will be before it happens. Log your predictions. This builds intuition for normal vs abnormal movements.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'In-Play Edges: Where They Actually Exist', 'in-play-edges-where-they-exist',
'## Most In-Play Bettors Lose More, Not Less

The live betting environment feels more exciting and controllable than pre-game betting. This sensation is largely an illusion. Live markets have higher margins, faster information requirements, and more emotional decision-making traps.

## Where Genuine Edges Do Exist

**1. Pre-game model advantage carried live**
If your pre-game model gives Arsenal a 60% win probability and the market opens at 55%, you may take the pre-game bet. If the game progresses without significant events but the live price drifts to 52%, the live price is now even more wrong. Bettors with strong pre-game models can use live markets to get larger positions at better prices when the live algorithm lags their model.

**2. Event-driven mispricings**
Algorithms sometimes overprice the impact of certain events (e.g. an early goal by a strong team) or underprice others (e.g. a goal against the run of play). Humans watching the game can sometimes identify these mispricings before the market corrects.

**3. Correlation exploits in related markets**
In a goalless match at 70 minutes, the over-2.5 goals market may be correctly priced at 1.10. But the "both teams to score" market may lag, still priced at 1.40 when the true probability has collapsed. Finding these cross-market inconsistencies is a systematic live edge.

**4. Closing-time distortions**
In injury time, market algorithms sometimes underprice a trailing team''s probability — particularly in football where a 88-minute goal is a well-documented statistical anomaly. Sharp live bettors study these closing-time patterns.

## The Margin Problem

Live markets typically carry 8–15% margins — far higher than pre-game. Any edge must be large enough to overcome this structural disadvantage.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'In-Play Betting in Different Sports', 'in-play-betting-different-sports',
'## Sport-Specific In-Play Characteristics

Each sport has a different live betting landscape. The best sport for in-play betting is the one where:
1. Your information is most reliable
2. The market algorithm has most structural weaknesses
3. The margin is lowest for your target markets

## Football

The most liquid live market globally. Large suspension windows after goals mean the speed edge is limited. The structural edge is in reading game state vs algorithm expectation (xG, possession, pressure) rather than reacting to events faster.

## Tennis

No suspension windows. Prices update continuously after every point. The margin in live tennis is typically 6–10%, lower than football specials. The edge: understanding momentum dynamics that the point-by-point algorithm underweights. A player winning a close set may be priced too short for the next set if their underlying performance was weaker than the scoreline suggests.

## Basketball

Very high-frequency scoring. Algorithms cope well with point-based scoring but can misweigh "momentum runs" — consecutive scoring by one team that the market sometimes over-reacts to. Foul trouble is a known live edge: a star player picking up 3 fouls in the first quarter has significant impact on match probability that some algorithms underprice.

## Horse Racing

Unique structure: the market is liquid pre-race but live betting (if available) is highly restricted. The most significant live market in racing is the "in-running" market on exchanges, where speeds and positions update the probability rapidly during the race itself.

## Cricket

The longest-form sport produces the widest range of live odds and the most complex probability dynamics. Session betting, match odds, and top-batsman markets all have distinct in-play characteristics. The complexity creates more potential for algorithmic errors — and more risk for underprepared bettors.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Psychology of Live Betting', 'psychology-of-live-betting',
'## The Unique Psychological Pressure of Live Markets

Live betting is psychologically different from pre-game betting in several critical ways. These differences systematically disadvantage bettors who are not prepared for them.

## The Illusion of Control

Watching a live event makes bettors feel they have more information and more control over the outcome. This sensation is partly true — you do have more information than at kick-off — but the market has the same information. The feeling of control leads to overconfidence in live judgements.

## The Recency Trap, Amplified

A team dominates the first 20 minutes but is goalless. The market drifts slightly. Bettors who watched those 20 minutes feel the favourite is "clearly better" and bet accordingly. This is recency bias amplified by emotional engagement. The pre-game model often still applies better than the 20-minute impression.

## Action Seeking

Live betting provides constant stimulus — prices moving, events unfolding, decisions to make. This stimulation creates an action-seeking cycle. Bettors place live bets not because they identified an edge, but because the environment demands action. Most live bets placed without a pre-defined framework are action-seeking, not edge-seeking.

## The Cancellation Temptation

Live markets make it easy to cash out or hedge a pre-game position. Cash-out prices are systematically below fair value — the bookmaker builds margin into the cash-out price. Cashing out a winning bet early is almost always mathematically negative: you are selling a positive-EV position for less than its value.

## The Discipline Rule

Do not bet live without a pre-game thesis. Your live bet should be a refinement of a pre-game analysis, not a reaction to watching the event. If you have no pre-game opinion on a match, do not form one live.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Live Betting Strategies That Work', 'live-betting-strategies-that-work',
'## Strategy 1: The Pre-Game Extension

The most reliable live betting strategy is an extension of your pre-game thesis. You identified value pre-game but the price was not quite right. During the event, if nothing materially changes your assessment, a price drift in your direction creates an entry point.

**Setup:** You model Team A at 55% probability. Market opens at 60% (priced at 1.67). You pass. During the first 30 minutes, the game is even, but Team B scores a set piece goal. Team A''s price moves to 2.50 (40% implied). Your model says 45%. Now the live bet is more attractive than the pre-game bet was.

## Strategy 2: The Lay-the-Draw Approach (Football)

In football, the draw outcome loses probability sharply when a goal is scored. A common exchange strategy: lay the draw pre-game (bet that the game will not be a draw), then back the draw in-play if it is still goalless at a key time (e.g. 60–70 minutes) to hedge and lock profit regardless of outcome.

This requires exchange access and understanding of lay betting mechanics.

## Strategy 3: Exploiting Algorithm Overreaction

When events occur that algorithms systematically overprice — an early red card to the dominant team, for example — the opposing team''s price may compress more than the true probability shift warrants. Back the over-compressed favourite immediately and cover the position if the game evolves as the algorithm expects.

## What Does Not Work

- Betting without watching: you lack the game-state information the market already has
- Momentum betting: following a momentum run is usually buying at peak price
- Cash-out cycling: taking cash-out and re-betting in the same market destroys edge through double margin',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Speed, Data Feeds, and the Information Hierarchy', 'speed-data-feeds-information-hierarchy',
'## The Information Stack

In live betting, information speed and quality determine who wins. Understanding the information hierarchy tells you whether live betting can be a viable edge for you.

## The Hierarchy (Fastest to Slowest)

1. **Pitch-side data providers** (Sportradar, Stats Perform): 0–1 second latency. Used by sharp bookmakers and professional bettors.
2. **Bookmaker trading engines:** React to data feeds in 1–3 seconds. Markets update within this window.
3. **Sharp recreational bettors with stadium access or premium streams:** 1–3 second advantage over broadcast.
4. **Standard broadcast stream:** 5–8 second delay from live action.
5. **Free streaming services:** 10–30+ second delay.

## The Practical Implication

If you watch a match on a standard broadcast, you are 5–8 seconds behind the data feed. The bookmaker''s algorithm has already processed the event and suspended the market before your signal arrives.

## Where Speed Is Less Critical

Live betting edges that do not require event-reaction speed:
- **Pre-game model carried live:** The edge is in your model, not in reaction time
- **Cross-market inefficiencies:** Spotting inconsistencies between related markets does not require millisecond execution
- **Long-horizon live bets:** Betting on the next-score team when the game is still open — analysis-based, not reaction-based

## Investing in Better Data

For serious live bettors, a premium live data subscription and a high-quality, low-latency streaming service are business expenses, not luxuries. The delta between a 3-second and 10-second feed is the difference between acting before and after suspension.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Live Betting Model', 'building-a-live-betting-model',
'## Why a Model Is Essential

Without a model, live betting is reactive. A model gives you a pre-defined expected probability at any game state, so you can compare it to the live market price and identify discrepancies.

## The Core Components of a Live Football Model

**Inputs:**
- Current score
- Time elapsed
- Pre-game expected goals (xG) for each team
- Actual xG accumulated in-game
- Team strength ratings (from pre-game model)
- Game state (whether the leading team is likely to defend or attack)

**Output:**
- Win/draw/loss probability at the current moment
- Over/under probability for remaining goals

## Simplified Example: Time-Score Model

A common starting point: for each score at each minute mark, historical data tells you the win probability distribution. A 1-0 lead at 30 minutes converts to a win ~70% of the time; at 80 minutes, ~92% of the time.

Build a lookup table of historical outcomes by score + time. When the live market price differs from your lookup table by more than the margin, you have a signal.

## Incorporating xG

Pure score+time models miss game state. Adding expected goals — how many clear chances each team has created — improves probability estimates when scorelines are misleading (a team 1-0 up but having been outplayed has different true probability than a team 1-0 up and dominating).

## Backtesting

Before using any live model, backtest on historical data. Collect closing Pinnacle live prices for 500+ historical matches at different game states and compare your model''s output. A model that consistently disagrees with sharp live markets is almost certainly wrong.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Live Trading on Exchanges', 'live-trading-exchanges',
'## Trading vs Betting

A bettor places a bet and waits for the outcome. A trader places a bet and then places an opposing bet during the event — locking in profit (or limiting loss) regardless of the final result.

## The Core Mechanics

You back Team A at 3.00 for £100 (liability = £100 if A loses; profit = £200 if A wins).

During the match, A scores. Their price drops to 1.60. You now lay A at 1.60:

**Lay stake calculation to lock profit:**
Back profit × Lay price / (Lay price − 1)... or simply:

If you lay £187.50 at 1.60:
- A wins: Back wins £200, Lay loses £112.50 → Net +£87.50
- A does not win: Back loses £100, Lay wins £112.50 → Net +£12.50

You have locked in a guaranteed profit of at least £12.50.

## Greening Up

"Greening up" means distributing profit or loss equally across all outcomes. This is done by calculating the lay stake such that net profit is equal regardless of which outcome occurs.

Formula: Lay stake = Back stake × Back price / Lay price

£100 × 3.00 / 1.60 = £187.50

## The Trade-Off

Trading guarantees smaller profits in exchange for certainty. A pure backer who holds the bet to 3.00 → win collects £200 profit. The trader locks £87.50. The trader gives up upside to eliminate variance.

## When Trading Is the Right Choice

Trading makes sense when your initial edge was exploited (you are now ahead of fair value) but your uncertainty about the final outcome is high. It converts betting edge into realised profit immediately, preserving bankroll for the next opportunity.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Advanced Live Betting: Integrating Pre- and In-Game Analysis', 'advanced-live-pre-in-game-integration',
'## The Unified Framework

Advanced live bettors do not treat pre-game and in-play as separate activities. They run a single analytical process that begins before kick-off and adapts continuously through the event.

## The Pre-Game Setup

Before the event:
1. Run your pre-game model → derive your probability estimate
2. Identify the markets where your estimate diverges most from the market
3. Set price alerts for specific live conditions: "If Team A is still goalless at 60 minutes and their price drifts above X, I will bet Y"
4. Define your maximum live exposure for this event

## In-Game Adaptation

During the event:
- Track xG accumulation vs expectation
- Note any significant events (injuries, red cards) and update your model estimate
- Monitor market prices against your updated estimate
- Act only when the live price diverges from your updated estimate by more than your minimum threshold

## The Event Log

Maintain a live event log: minute-by-minute notes on key events, your probability estimate, the market price, and any bets placed. After the event, review this log to identify where your model was right, where the market was right, and where you acted correctly or incorrectly.

## The Expert Mental Model

Elite live bettors operate like air traffic controllers: they maintain a holistic situational awareness (pre-game model, current game state, market prices, remaining time, bankroll position) and make decisions within a defined framework rather than reactively.

The key discipline: if your pre-game thesis has not been invalidated by in-game events, stick with it. Markets that move against your thesis should be treated as potential entry points, not as evidence you were wrong.',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'live-and-in-play-odds' AND cat.slug = 'odds-and-markets';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Exchange Betting & Lay Markets              ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'How Betting Exchanges Work', 'how-betting-exchanges-work',
'## Peer-to-Peer Betting

A betting exchange matches bettors directly with each other. One bettor backs an outcome; another lays it. The exchange earns commission on net winnings rather than embedding a margin in the odds.

## The Major Exchanges

- **Betfair:** Largest exchange globally, deepest liquidity, especially in football and horse racing
- **Smarkets:** Lower commission (2%), growing liquidity, good for football
- **Matchbook:** Competitive on major markets, strong in horse racing

## The Order Book

Every market on an exchange shows a live order book with two sides:
- **Back prices:** What you can take immediately if you want to back the selection
- **Lay prices:** What you are offering others if you want to lay

Money at each price is shown in the order book. If you place a back bet at a price not currently available, your order sits in the book until a layer matches it.

## Liquidity: The Critical Variable

An exchange is only useful if there is enough money in the market to match your bet. Premier League football and major horse races have millions in liquidity. A League Two match at 10:00am might have £200. Always check liquidity before relying on exchange prices.

## Commission

Commission is charged on net winnings per market, not per bet. At 4.5% (Betfair standard), if you win £100 net in a market, you pay £4.50 commission. Commission rates vary by market, customer tier, and loyalty status.

## The Fundamental Advantage

Because the exchange margin comes from a fixed commission on net winnings rather than a percentage of every outcome, the effective margin for bettors is far lower than traditional bookmakers — typically 1.5–3% all-in.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Lay Betting Explained', 'lay-betting-explained',
'## What Does It Mean to Lay?

When you lay a selection on an exchange, you are betting that the selection will NOT win. You become the bookmaker: the backer pays you if they lose; you pay the backer if they win.

## The Mechanics

You lay Team A at odds of 3.00 for a backer''s stake of £10:
- If A wins: you pay the backer £20 (£10 × (3.00 − 1))
- If A does not win: you receive the backer''s £10 stake

Your liability (maximum loss) = Backer''s stake × (Odds − 1) = £10 × 2.00 = £20

## Why the Liability Matters

The liability is reserved when you place a lay bet. At odds of 10.00, your liability per £10 backer stake is £90. Laying at high odds requires significant float in your exchange account.

## When Laying Makes Sense

1. **You think the selection is overpriced:** Its true probability is lower than the offered price implies
2. **Trading a pre-existing back bet:** You backed at a longer price and now want to lock in profit
3. **Portfolio hedging:** You have a complex position across multiple markets and want to balance your liability

## Lay vs Back: The Probability Equivalence

Laying at 3.00 is equivalent to backing every other outcome in a complete market. In a two-outcome market, laying the favourite at 1.50 is the same as backing the underdog at 3.00 (after accounting for commission).

## The Most Common Error

New exchange users confuse their liability with the profit/loss. Remember: your profit from a lay win is the backer''s stake (small). Your liability from a lay loss is stake × (odds − 1) (potentially large). Never lay at high odds without understanding the full liability.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Exchange vs Bookmaker: When to Use Which', 'exchange-vs-bookmaker-when-to-use',
'## The Decision Framework

For every bet, you should have a clear reason to choose an exchange or a bookmaker. The default should be the option with the lowest effective cost and the best price.

## Use an Exchange When:

- The exchange price (after commission) exceeds the best bookmaker price
- You want to lay a selection rather than back it
- You plan to trade (back and then lay, or lay and then back, to lock in profit)
- You need unlimited or high stake availability
- You want to bet in-play without restrictions
- You want a winner-tolerant environment (exchanges never limit winning accounts)

## Use a Bookmaker When:

- The bookmaker''s price is higher than the exchange after commission
- A bookmaker offers a promotion or enhanced odds that justifies the higher margin
- The market has low exchange liquidity (your bet cannot be matched at a sensible price)
- You are using a product (accumulator, bet builder) that exchanges do not offer

## The Effective Price Calculation

To fairly compare bookmaker vs exchange, calculate the effective decimal price after commission:

Exchange effective price = 1 + (Exchange decimal − 1) × (1 − Commission rate)

At 2.50 exchange, 4.5% commission:
Effective = 1 + 1.50 × 0.955 = 1 + 1.4325 = **2.4325**

Compare this to the bookmaker price. If the bookmaker offers 2.45, the bookmaker is better despite the margin.

## The Account Strategy

Maintain both exchange and bookmaker accounts. Line shop across both — effective exchange price vs bookmaker price — before every bet. The choice should be made on numbers, not habit.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Trading Strategies on Exchanges', 'trading-strategies-exchanges',
'## The Core Trading Concept

Exchange trading means taking a position and then offsetting it during the event to lock in profit or limit loss, regardless of the final result. The exchange is the only environment where this is possible at scale.

## Strategy 1: Back-to-Lay

Back a selection at a long price before an event. If the selection''s implied probability increases (price shortens), lay at the shorter price to lock profit.

**Example:** Back a horse at 8.00 for £50. During the race build-up, money comes in and the price drops to 5.00. Lay at 5.00 to lock profit:

Lay stake = (Back stake × Back price) / Lay price = (£50 × 8.00) / 5.00 = £80

If horse wins: Back wins £350, Lay loses £320 → Net +£30
If horse loses: Back loses £50, Lay wins £80 → Net +£30
**Guaranteed profit: £30** (before commission)

## Strategy 2: Lay-to-Back

Lay a selection at a short price (when you think it will drift out). If the price lengthens, back at the longer price to lock profit.

## Strategy 3: Scalping

Place back and lay bets at adjacent prices in the order book, profiting from the spread. Requires very liquid markets (where the spread is small) and fast execution. Common in liquid horse racing markets in the minutes before a race.

## Strategy 4: Dutching Across Selections

Back multiple selections in the same market at stakes calibrated to return the same profit regardless of which one wins. Requires the combined implied probability to be below 100% (i.e. a positive dutch).

## The Role of Green Book Technology

Betfair''s interface shows a "green book" view — the net P&L for every outcome if you were to close the trade now. Learning to read the green book fluently is essential for exchange traders.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Liquidity, Price Discovery, and Market Depth', 'liquidity-price-discovery-market-depth',
'## Why Liquidity Is Everything

An exchange price is only as reliable as the liquidity behind it. A selection priced at 3.00 with £500,000 matched is a sharp, well-informed price. The same selection at 3.00 with £200 matched tells you almost nothing.

## Reading Market Depth

The order book shows available money at each price level. A market with deep liquidity (money available at many price levels within a tight range) is more efficient and harder to move with a single large bet.

A market with thin liquidity (most money concentrated at one or two prices) is easier to move — your own bet can shift the price if large enough.

## Price Discovery

Exchanges are the closest thing to a true sports betting price discovery mechanism. Because bettors compete to offer the best price, the exchange price tends to converge toward the true probability faster than any bookmaker line.

This is why sharp bookmakers use exchange prices (particularly Betfair) as a reference when setting and adjusting their own lines.

## The Depth-to-Bet Ratio

Rule of thumb: your intended stake should not exceed 10–15% of the available liquidity at your target price. A larger bet will significantly move the price against you (market impact cost).

If you want to bet £1,000 but there is only £800 available at your target price, you have two options:
1. Accept partial matching and adjust
2. Place a limit order in the book at your target price and wait for it to be matched

## Patience in Thin Markets

In illiquid markets, placing limit orders (offers at your preferred price) and waiting for matching often achieves better prices than taking what is immediately available. This requires patience and willingness to accept non-execution if the market moves away.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Commission Optimisation on Exchanges', 'commission-optimisation-exchanges',
'## Commission Is Your Primary Cost

On an exchange, commission replaces the bookmaker margin. Unlike a fixed margin that applies to every bet, exchange commission only applies to net winnings — meaning losing bets contribute nothing to commission.

## How Net Commission Works

On Betfair, you pay commission on your net winnings per market (not per bet). If you back a selection and it wins, you pay commission on the net profit. If it loses, no commission is charged.

**Example:**
You place £100 on Team A at 2.50. They win.
Profit = £150. Commission at 4.5% = £6.75.
Net received = £143.25.

## The Commission Rate Factors

- **Base rate:** Betfair standard is 4.5% in most markets
- **Premium Charge:** Bettors who generate significant net lifetime profits pay a "Premium Charge" (up to 60% of gross profit). This affects very successful traders and is a major strategic consideration at scale.
- **Loyalty discounts:** Higher lifetime volume on some exchanges reduces commission

## Smarkets vs Betfair

Smarkets charges 2% commission on net winnings with no Premium Charge. For profitable bettors, Smarkets is often lower total cost for markets it covers.

## Reducing Commission via Market Selection

Commission-aware bettors prefer markets where:
- They win frequently (more wins → more commission, but also more profit)
- They can achieve positive net positions (commission on net, not gross)
- Liquidity is sufficient at Smarkets (to use 2% instead of 4.5%)

## The Winner-Loser Math

A bettor with a 5% edge and 4.5% commission nets approximately 0.5% per unit of turnover. The same edge at 2% commission nets 3%. Commission rate selection has the same magnitude of impact as the underlying edge.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Matched Betting: The Risk-Free Foundation', 'matched-betting-risk-free-foundation',
'## What Is Matched Betting?

Matched betting uses free bets and promotions offered by bookmakers, combined with exchange lay bets, to guarantee a profit regardless of the outcome. It is legal in most jurisdictions and requires no predictive skill.

## The Core Mechanism

**Step 1:** A bookmaker offers a £50 free bet if you place a £50 qualifying bet.

**Step 2 (Qualifying bet):** Place a £50 back bet with the bookmaker. Simultaneously lay the same selection on an exchange for £50. The back and lay cancel out, giving a small net loss (the lay commission and price differential — typically 5–10% of stake).

**Step 3 (Free bet):** The bookmaker credits £50 free bet. Place the free bet on a selection. Lay the same selection on the exchange for a calculated stake. The net result is a profit of approximately 75–85% of the free bet value (£37.50–£42.50 from a £50 free bet) regardless of outcome.

## Why It Works

The free bet is pure bonus value. The lay bet on the exchange converts this bonus into guaranteed cash. The exchange lay eliminates all outcome risk.

## Practical Considerations

- Requires float: you need exchange account funds equal to your lay liability
- Requires time: researching offers, calculating stakes, placing bets correctly
- Not indefinitely scalable: bookmakers eventually stop offering promotions to your account

## Matched Betting vs Edge Betting

Matched betting is a near-risk-free extraction of promotional value — not sports prediction. It is an excellent starting point for learning exchange mechanics without financial risk. Most serious bettors begin here, extract promotional value, and then develop predictive betting skills using the skills and bankroll built through matched betting.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Arbitrage Using Exchanges', 'arbitrage-using-exchanges',
'## Exchange-Enabled Arbitrage

The exchange enables a specific and common form of arbitrage: back at a bookmaker''s inflated price, lay at the exchange''s efficient price. When the bookmaker is wrong (higher than exchange), locking both legs guarantees a risk-free profit.

## The Calculation

Bookmaker: Team A at 2.40 for £100 (back)
Exchange: Lay Team A at 2.20 for £X (lay)

**Lay stake to cover bookmaker back profit:**

If you lay £109 at 2.20:
- A wins: Bookmaker pays £140 profit; Exchange costs £131.80 liability → Net +£8.20 (less commission)
- A does not win: Bookmaker loses £100 stake; Exchange pays £109 → Net +£9

Guaranteed profit ~ £8–9 on £100 staked (8–9% arb, before commission).

## When Exchange Arbs Appear

1. Bookmaker slow to react to line movement
2. Bookmaker offers a promotional price (boosted odds) above true market value
3. Bookmaker and exchange price a market from different models

## The Commission Impact

Exchange commission reduces arb profit. At 4.5% commission on £109 lay win: £4.91 cost, reducing arb to ~£3–4 net. Still positive, but the threshold must be high enough to cover commission.

Rule: Only take arbs where the bookmaker price exceeds exchange price by more than commission rate + 1% buffer.

## Sustainability

Bookmakers who see consistent arbing restrict accounts rapidly. Manage which accounts you use for arb plays and which you protect for long-term value betting.',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building an Exchange Trading System', 'building-exchange-trading-system',
'## From Ad Hoc Trades to a Systematic Operation

Random exchange activity — placing back and lay bets without a defined system — is not trading. It is reactive behaviour that may be profitable by luck but cannot be improved or scaled.

A trading system defines: entry criteria, exit criteria, stake sizing, and performance measurement — before any trade is placed.

## System Design Elements

**1. Trigger definition:** What condition causes you to open a position?
Example: "Back a selection when my model probability is ≥5% above exchange implied probability."

**2. Position sizing:** How much do you stake?
Example: "Stake 1% of exchange balance per trade, scaled by confidence (see Kelly notes)."

**3. Exit rules:** When do you close the trade?
Example: "Close at 50% profit, stop at 100% loss, or at event start — whichever comes first."

**4. Market scope:** Which markets do you operate in?
Example: "Only markets with >£100,000 matched by 30 minutes before event start."

## Performance Tracking

Track every trade: entry price, exit price, stake, net P&L (after commission), and the system trigger that caused entry. After 200+ trades, analyse:
- Average P&L per trigger type
- Win rate at different entry thresholds
- Commission as % of gross profit
- Average time to position close

## Automation Considerations

Many professional exchange traders automate their systems using Betfair''s API (BetAngel, Geek''s Toy, or custom Python scripts). Automation removes execution errors and enables high-frequency scalping that is impossible manually.

For non-automated systems, speed and discipline in manual execution remain the limiting factors.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Exchange Operations: Scaling and Diversification', 'expert-exchange-operations',
'## The Ceiling of Single-Strategy Exchange Trading

Any single exchange strategy eventually runs into one of three ceilings:
1. **Liquidity ceiling:** The market cannot absorb more volume at acceptable prices
2. **Edge erosion:** As more participants discover the same strategy, the edge compresses
3. **Premium Charge threshold:** For very profitable accounts on Betfair, the Premium Charge dramatically reduces returns

Expert exchange operations anticipate these ceilings and build diversified strategies before hitting them.

## Strategy Portfolio Architecture

A mature exchange operation typically runs:
- **Core back/lay strategy:** Primary edge, well-backtested, defined market scope
- **Trading strategy:** Live position management in high-liquidity markets
- **Matched betting extraction:** Systematic promotional value harvesting
- **Arb monitoring:** Systematic scanning for cross-bookmaker opportunities

Each strategy has its own performance metrics, bankroll allocation, and review cycle.

## Bankroll Partitioning

Divide exchange bankroll by strategy:
- Trading float (must remain available for liability coverage): 40%
- Active back positions: 30%
- Arb and matched betting float: 20%
- Reserve / drawdown buffer: 10%

## Dealing with the Premium Charge

If your Betfair account becomes Premium Charge liable, your effective commission may rise to 40–60% of gross profit. Mitigation strategies:
1. Shift volume to Smarkets and Matchbook (no Premium Charge)
2. Increase bet frequency in losing periods to "use up" loss credit
3. Diversify away from Betfair before the threshold is reached

## The Long-Term Professional Standard

The best exchange operators combine analytical edge (knowing what is mispriced), operational efficiency (lowest commission routes, fastest execution), psychological resilience (consistent process through drawdowns), and continuous system improvement (monthly review cycles that adapt to changing market conditions).',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'exchange-betting-lay-markets' AND cat.slug = 'odds-and-markets';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — Building Your Own Lines                     ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Building Your Own Lines', 'building-your-own-lines',
  'How to construct your own price for an event from scratch — the methodology professionals use to identify when bookmakers are wrong.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'odds-and-markets'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Why You Must Build Your Own Lines', 'why-build-your-own-lines',
'## The Fundamental Shift

Most bettors ask: "Is this price good or bad?" A line builder asks a different question first: "What should this price be?" Then they compare their answer to the market.

This shift is the dividing line between reactive betting (responding to bookmaker prices) and proactive betting (having an independent view against which prices are evaluated).

## What a Line Is

A line is a complete set of probabilities that you assign to all outcomes of an event, totalling exactly 100%. These probabilities are your model''s output — your best estimate of reality before seeing any bookmaker price.

## Why Independent Lines Matter

If you consult the bookmaker price before forming your opinion, you are anchored to their estimate. Anchoring bias means your "independent" assessment is influenced by the number you saw first. To identify genuine mispricing, your estimate must be formed before you see the bookmaker''s number.

## The Discipline of Blind Assessment

The professional workflow:
1. Conduct analysis
2. Assign probabilities to all outcomes
3. Convert to fair odds
4. **Then** check the bookmaker price
5. Act only if your line differs from the market by more than the margin

This order is not optional. Step 4 must come after Step 3, or the assessment is compromised.

## The Minimum Viable Line

You do not need a complex quantitative model to build lines. A structured qualitative framework — systematically accounting for team quality, form, injuries, venue, and head-to-head — produces better estimates than gut feeling and better ones than simply accepting bookmaker prices.',
  1, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Components of a Team Rating Model', 'components-team-rating-model',
'## Starting with Team Strength

Every line-building model begins with a team strength rating — a number representing how good a team is on an absolute scale.

## Common Rating Approaches

**1. Elo Ratings**
Adapted from chess, Elo ratings update after each match based on result and opponent strength. Teams gain Elo for wins (more for beating strong opponents), lose Elo for defeats.

Starting Elo: 1500 (average team). The difference in Elo between two teams predicts the expected match result.

Win probability for team A vs team B:
P(A wins) = 1 / (1 + 10^((Elo_B − Elo_A) / 400))

**2. Expected Goals (xG) Based Ratings**
Instead of using results (which contain variance), use the underlying xG each team generated and allowed. xG-based ratings are more predictive than result-based ratings at small samples because they see through variance.

**3. Composite Power Ratings**
Professional models combine multiple factors: xG, shot volume, shot location, defensive pressure, possession sequence quality. Each factor is weighted by its historical predictive accuracy.

## Home Advantage Adjustment

Home advantage in football is approximately 0.35–0.40 goals per match on average (equivalent to ~6–7% win probability shift). Apply this as a fixed adjustment to the away team''s expected goals.

## Recent Form Weighting

Decay recent results to give more weight to recent performance. A common decay: each match is weighted at 0.95 of the previous match''s weight. This gives recent matches more influence while not discarding older data entirely.',
  2, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'From Team Ratings to Match Probabilities', 'team-ratings-to-match-probabilities',
'## The Bridge Between Ratings and Odds

Having team ratings is necessary but not sufficient. You need a method to convert those ratings into probabilities for each match outcome.

## The Expected Goals Bridge

If your model estimates that Team A will generate 1.8 xG and Team B will generate 1.1 xG in a match, you can derive probabilities using the Poisson distribution.

## Poisson Distribution in Football

Football scores approximately follow a Poisson distribution: the number of goals scored by each team in a match is roughly independent and follows a process where the rate parameter (λ) is the expected goals.

P(k goals | λ) = (e^-λ × λ^k) / k!

## Computing Match Probabilities

1. Calculate P(Team A scores k goals) for k = 0, 1, 2, ..., 8 using λ_A
2. Calculate P(Team B scores j goals) for j = 0, 1, 2, ..., 8 using λ_B
3. For every combination of (k, j), calculate P(Team A = k, Team B = j) = P(A=k) × P(B=j)
4. Sum combinations where k > j → P(A wins)
5. Sum combinations where k = j → P(draw)
6. Sum combinations where k < j → P(B wins)

**Example with λ_A = 1.8, λ_B = 1.1:**
Approximate result: A wins ~51%, Draw ~26%, B wins ~23%

## Converting to Fair Odds

P(A wins) = 0.51 → Fair odds = 1/0.51 = **1.96**
P(Draw) = 0.26 → Fair odds = 1/0.26 = **3.85**
P(B wins) = 0.23 → Fair odds = 1/0.23 = **4.35**

Compare to bookmaker prices. Any bookmaker price substantially above these fair odds is a potential value bet.',
  3, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Incorporating Context and Adjustments', 'incorporating-context-adjustments',
'## Models Are Not Complete Without Context

A pure statistical model is an excellent starting point but does not capture all the factors that influence match outcomes. Smart line builders layer contextual adjustments on top of their base model.

## Key Contextual Adjustments

**Injuries and Suspensions**
The absence of a key player can shift a team''s attacking or defensive output by 0.1–0.4 expected goals per match depending on their role and quality. Build a lookup table of expected goals impact by player position and market value tier.

**Motivation and Fixture Context**
A team with nothing to play for vs a team fighting relegation is not a neutral fixture. Historical data shows motivation differentials shift implied win probabilities by 3–8%.

**Rest and Travel**
Teams playing on 3 days'' rest after a European away fixture perform measurably worse than teams with a full week''s rest. The effect is approximately 0.15–0.25 goals in expected goals.

**Head-to-Head Records**
Specific matchup effects (tactical styles that systematically cause problems) may not be captured by team-level ratings. Use head-to-head as a 10–20% weight alongside your rating-based estimate if there is a stable historical pattern.

**Weather**
Heavy rain reduces expected goals in football by approximately 0.1–0.15 on average. Wind affects corners, set-piece accuracy, and long-ball effectiveness.

## The Adjustment Hierarchy

Apply adjustments in order of reliability:
1. High confidence (injuries: quantifiable, recent, confirmed)
2. Medium confidence (motivation: real but variable in magnitude)
3. Low confidence (tactical matchup: speculative without specific evidence)

Never let low-confidence adjustments override a strong base model signal.',
  4, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Validating Your Model Against the Market', 'validating-model-against-market',
'## Model Validation Is Non-Negotiable

Building a model is easy. Building a model that is actually better than the market is hard. Before betting real money on your lines, you must validate whether they add value.

## Method 1: Back-Testing vs Historical Closing Lines

Apply your model to 500+ historical matches. For each match:
1. Calculate your model''s fair odds for each outcome
2. Compare to the closing Pinnacle line (de-vigged)
3. Calculate the difference (your price − market price) for every outcome

If your model is consistently more accurate than the market, you will see a statistically significant positive expected value signal.

## Method 2: Paper Trading

For 3–6 months before betting real money, simulate bets using your model. Apply the same selection criteria and staking rules you would use for real bets. At the end, calculate:
- ROI vs closing line (CLV)
- Win rate vs model prediction (calibration)
- Brier score (accuracy of probability estimates)

## Calibration: The Overlooked Metric

A model is well-calibrated if outcomes it estimates at 60% win actually win 60% of the time, at 40% they win 40%, etc. A poorly calibrated model may identify the right side but at systematically wrong probabilities, leading to poor staking decisions.

Plot a calibration curve: x-axis = model probability, y-axis = actual frequency. Ideal calibration is a 45° line. Deviations tell you where your model systematically over- or under-estimates.

## When to Trust Your Model Over the Market

Only bet against the market when:
1. Your model has been validated over 500+ historical observations
2. Your model''s calibration is demonstrably good
3. The discrepancy exceeds both the margin and your model''s estimated error margin

Until then, the market is almost certainly smarter than your model.',
  5, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Pricing Non-Standard Markets', 'pricing-non-standard-markets',
'## Beyond Match Winner

Once you can build a reliable match winner line, the next step is pricing derived markets: over/under goals, both teams to score, Asian handicap, and first-half markets. These markets can be priced directly from your expected goals model output.

## Over/Under Goals from Poisson

Using the Poisson model from Lesson 3:

P(Over 2.5 goals) = 1 − P(0 goals total) − P(1 goal total) − P(2 goals total)

Where total goals = Team A goals + Team B goals in each (k, j) combination.

At λ_A = 1.8, λ_B = 1.1 (total λ = 2.9):
P(Over 2.5) ≈ 59%, P(Under 2.5) ≈ 41%

Fair over/under odds: Over at 1/0.59 = 1.69; Under at 1/0.41 = 2.44

## Both Teams to Score

BTTS = P(Team A ≥ 1) × P(Team B ≥ 1)

P(A ≥ 1) = 1 − P(A = 0) = 1 − e^(-1.8) ≈ 83.5%
P(B ≥ 1) = 1 − P(B = 0) = 1 − e^(-1.1) ≈ 66.7%

P(BTTS) ≈ 83.5% × 66.7% ≈ 55.7%

Fair BTTS Yes: 1/0.557 ≈ 1.80; BTTS No: 1/0.443 ≈ 2.26

## Asian Handicap Lines

Set your own handicap line at the spread that produces equal probability on each side. If your model gives A a 60% win probability and the match is expected to be decided by 1.4 goals on average, the fair Asian handicap for A is approximately −0.75 to −1.

## First Half Markets

First half goals are roughly 40–45% of full-match goals in football (goals are slightly more frequent in the second half due to fatigue and substitutions). Apply this ratio to your total xG estimate to price first-half markets.',
  6, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Model Iteration and Continuous Improvement', 'model-iteration-continuous-improvement',
'## Models Decay

A model that worked well two years ago may not work as well today. Player quality changes, team tactics evolve, league parity shifts, and — critically — the market itself improves. As more sharp bettors use similar methods, the market becomes more efficient, reducing the edge any given model provides.

## The Improvement Loop

**Step 1 — Error analysis:** After each month of bets, examine where your model was most wrong. Were errors concentrated in specific market types (away teams, low total xG matches)? Is there a systematic bias?

**Step 2 — Feature addition:** Test whether adding a new variable (e.g. travel distance, referee statistics, weather) improves calibration. Add it only if backtesting confirms improvement.

**Step 3 — Weight recalibration:** The weights on individual model inputs (xG, form, head-to-head) should be recalibrated annually using the most recent data. Historical weights from five years ago may no longer be optimal.

**Step 4 — Market comparison:** Regularly compare your model''s closing-line accuracy against Pinnacle''s. If the gap is closing, your model is improving. If the gap is widening, something is wrong.

## Common Model Failure Modes

- **Overfitting:** The model performs well on historical data but poorly on new data because it learned noise rather than signal. Use out-of-sample validation.
- **Feature leakage:** Using information at prediction time that would not have been available in practice (e.g. using post-match xG to predict a pre-match outcome).
- **Lookback period too short:** Training on 2 years of data misses long-term team quality trends; training on 10 years includes tactical eras that are no longer relevant.

## The Honest Benchmark

Your model is useful if and only if it consistently predicts closing Pinnacle prices better than chance. If it does not, you are not building a model — you are building noise with extra steps.',
  7, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Integrating Machine Learning into Line Building', 'machine-learning-line-building',
'## Beyond Manual Models

Manual Poisson/Elo models are interpretable and maintainable but limited in the features they can incorporate. Machine learning models can combine dozens of input variables non-linearly — capturing interactions that manual models miss.

## Practical ML Approaches for Sports Betting

**Gradient Boosting (XGBoost, LightGBM)**
The most widely used approach in sports prediction. Can handle tabular data with many features, works well with moderate data sizes (5,000–50,000 match observations), and produces calibrated probability estimates when properly tuned.

**Neural Networks**
Require larger datasets and more careful calibration but can capture complex patterns. Best applied when rich sequence data (event-level data, not just match-level) is available.

**Logistic Regression (the underrated baseline)**
With engineered features (team strength differentials, recent form indices), logistic regression is transparent, fast, and often competitive with more complex models. Always benchmark against it.

## Feature Engineering for Football Models

Strong predictive features include:
- Trailing xG ratio (team A xG / team B xG) over last 5, 10, 20 matches
- Points per game over last 10 matches, weighted by opponent strength
- Goals against per match for each team over last 10 matches
- Cumulative xG difference over the season
- Days rest
- Travel distance (km from home stadium)

## Calibration: The Critical ML Step

ML models often produce uncalibrated probability outputs. Always apply calibration (Platt scaling or isotonic regression) before comparing model probabilities to bookmaker prices.

## Data Infrastructure

A serious ML line-building operation requires:
- A match database (historical results back 5+ seasons)
- An xG data feed (StatsBomb, Wyscout, Opta)
- A pipeline to pull current team news and contextual factors
- Version control for model code and results',
  8, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Multi-Sport Line Building', 'multi-sport-line-building',
'## Expanding Beyond Football

The principles of line building — team ratings, probability estimation, contextual adjustment, market comparison — apply to every sport. However, each sport requires a sport-specific statistical model.

## Basketball (NBA/EuroLeague)

- **Base ratings:** Offensive and defensive efficiency ratings (points per 100 possessions)
- **Home advantage:** ~3 points in the NBA
- **Key adjustments:** Rest (back-to-back performance is measurably worse), travel, roster injury load
- **Probability model:** Normal distribution works well for basketball (higher scoring, less Poisson-like than football)
- **Derived markets:** Point spread, over/under total points, player props

## Tennis

- **Base ratings:** Surface-specific Elo (separate ratings for clay, grass, hard)
- **Point-level model:** Estimate P(server wins point), derive P(win game), P(win set), P(win match) through a Markov chain simulation
- **Key adjustments:** H2H on specific surfaces, fitness signals (recent scheduling, injury history), weather (wind heavily affects outdoor play)

## Horse Racing

- **Base ratings:** Speed ratings from historical races, adjusted for going (track conditions) and distance
- **Key adjustments:** Jockey/trainer combination records, draw bias, stable form
- **Model type:** Relative ranking model rather than absolute probability — horses are compared to each other in the specific field, not assessed independently

## The Universal Principle

Regardless of sport, the goal is the same: produce a probability estimate that is independent of the bookmaker''s price, better calibrated than average recreational bettor opinion, and validated against market efficiency over a sufficient sample.',
  9, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Operating a Professional Line-Building Operation', 'professional-line-building-operation',
'## The Full Stack of Expert Line Building

A professional line-building operation integrates data infrastructure, statistical modelling, contextual research, market monitoring, and execution into a single workflow.

## The Daily Process

**Pre-match day (D−2 to D−1):**
- Run base model for upcoming fixtures
- Flag fixtures where base model diverges from early bookmaker lines by ≥3%
- Research flagged fixtures (injury news, lineup expectations, contextual factors)
- Produce adjusted fair odds for flagged fixtures

**Match day (D):**
- Update model with confirmed lineups (adjust xG inputs for key absences)
- Recalculate adjusted fair odds post-lineup
- Compare final model to opening market prices
- Place bets where adjusted fair odds exceed market by ≥ (margin + 2%)
- Set line alerts for further movement

**Post-match (D+1):**
- Log actual vs predicted outcomes for model validation
- Record CLV for all bets placed
- Update team performance database with match xG data

## Data Infrastructure Requirements

- Live lineup feed (API or automated scraping)
- Live odds feed (multiple sources)
- Historical match database (updated daily)
- Model compute environment (can be as simple as a local Python environment)
- Bet tracking database

## The Competitive Landscape

The sharpest bookmakers employ teams of quantitative analysts running models significantly more sophisticated than any individual bettor. Your edge, if it exists, is likely in:
1. Niche markets the sharp books model less carefully
2. Speed of contextual adjustment (acting on news faster than the market)
3. Specific domains where your specialist knowledge exceeds the model''s input features

Understanding where you have genuine comparative advantage — and limiting activity to those domains — is the expert-level insight that separates sustainable profitable bettors from those who eventually revert to market average.',
  10, true
FROM public.courses c
JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'building-your-own-lines' AND cat.slug = 'odds-and-markets';
