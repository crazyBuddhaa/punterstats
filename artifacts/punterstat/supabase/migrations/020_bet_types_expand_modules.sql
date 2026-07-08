-- ============================================================
-- PunterStat — Betting Academy: Bet Types Expansion
-- Migration 020: Expand existing 2 modules to 10 lessons each
--   • "Singles, Doubles & Accumulators"  — add lessons 1–10
--   • "Handicap & Asian Handicap"        — add lessons 1–10
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Singles, Doubles & Accumulators             ║
-- ║  Existing: 0 lessons                                    ║
-- ║  Adding: lessons 1–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Is a Single Bet?', 'what-is-a-single-bet',
'## The Simplest Bet in Sports Betting

A single bet is a wager on one outcome in one event. If the outcome occurs, you win. If it does not, you lose your stake. Nothing else affects the result.

**Example:** Manchester City to beat Arsenal at 1.90. Stake: £50.
- City win: return = £50 × 1.90 = £95 (£45 profit)
- City do not win: lose £50

## Why Singles Are the Foundation

Every bet type — doubles, accumulators, systems — is built from singles. Understanding the mechanics of a single bet is non-negotiable before moving to any combination.

**Singles are transparent:** The return is one multiplication. The implied probability is one division. There is no complexity obscuring the value.

**Singles are honest:** A single at a market with 5% margin has 5% drag. No compounding, no hidden costs.

## When Singles Are the Right Choice

- When you have a specific, well-researched opinion on one outcome
- When you prioritise reliability over theoretical maximum return
- When you are operating in markets where accuracy matters more than multiplied odds

## The Case Against Singles

Singles have lower maximum returns than combination bets for the same outlay. A £10 single at 2.50 returns £25. A £10 double at 2.50 × 2.50 returns £62.50. But the double requires both legs to win.

## Professional Practice

Most serious bettors place primarily singles. The added complexity and compounded margin of combinations usually does not justify the higher maximum return for bettors with genuine edge.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Doubles: How Combined Bets Work', 'doubles-how-combined-bets-work',
'## What Is a Double?

A double is a single bet combining two selections. Both must win for the bet to pay out. The winnings from the first selection are automatically staked on the second.

**Example:** Arsenal to win (1.85) AND Liverpool to win (2.10). Stake: £20.
- Combined odds: 1.85 × 2.10 = 3.885
- Return if both win: £20 × 3.885 = £77.70 (£57.70 profit)
- If either loses: lose £20

## The Margin Compounding Problem

A double with 5% margin on each leg has combined effective margin:
1 − (0.95 × 0.95) = 9.75%

The margin compounds. Two legs with 5% margin each produce a double with nearly 10% effective margin. Every leg added multiplies the cost.

## When a Double Has Value

A double has genuine positive expected value only if both legs individually have positive expected value AND the combined margin is exceeded by combined edge.

For recreational bettors: virtually never.
For edge bettors: only if both legs are independently validated value bets.

## The Practical Use of Doubles

Despite the mathematical disadvantages, doubles appear in one legitimate context: hedging. If you have a running accumulator with multiple winners and one remaining selection, a double combining your next two legs at good prices (on an exchange) may balance your liability efficiently.

## Computing Any Double

Mental shortcut: multiply the two decimal prices together. The result is the combined odds. Apply your EV calculation to the combined odds vs your estimated joint probability (P_A × P_B if independent).',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Accumulators: Mechanics and Myths', 'accumulators-mechanics-myths',
'## The Accumulator Explained

An accumulator (parlay) combines multiple selections into one bet. All must win. The potential return grows multiplicatively with each leg.

## The Seductive Return

4-fold accumulator at 2.00 each: 2.00 × 2.00 × 2.00 × 2.00 = 16.00
£10 stake → £160 return

This looks extraordinary. The catch: each leg added also multiplies the probability of the entire bet losing.

## The Probability Reality

If each leg truly has 50% win probability:
P(all 4 win) = 0.50 × 0.50 × 0.50 × 0.50 = 6.25%

At fair odds (2.00 each = 50% implied), the fair combined price is 1/0.0625 = 16.00.
The bookmaker offers exactly 16.00 — this is fair. But after applying 5% margin per leg, each leg is at 1.90 (47.4%):
Accumulated price: 1.90⁴ = 13.03
True probability: 6.25%
Fair price: 16.00
You receive 13.03 for a fair bet at 16.00 → significant negative EV.

## The Industry Truth

Accumulators are the most profitable product for bookmakers and the worst product for informed bettors. They combine:
1. Compounded margins (as shown above)
2. More legs = exponentially lower win probability
3. Emotional appeal that drives large volumes

## When Accumulators Are Appropriate

For recreational bettors treating betting as entertainment — the cost of an accumulator is the entry price for the excitement. For analytical bettors: only if every leg independently meets your value threshold AND the combined product is not available as individual singles on an exchange at lower margin.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Trebles, Trixies and Patents', 'trebles-trixies-and-patents',
'## Full Cover Bets: The Compromise

Full cover bets combine accumulators with each-way doubles and singles to produce some return even if not all selections win.

## The Trixie

A Trixie covers 3 selections with 4 bets:
- 3 doubles (AB, AC, BC)
- 1 treble (ABC)

Minimum requirement to return anything: 2 of 3 selections win (a double pays).
Total stakes: 4 units.

## The Patent

A Patent covers 3 selections with 7 bets:
- 3 singles (A, B, C)
- 3 doubles (AB, AC, BC)
- 1 treble (ABC)

Minimum requirement: 1 selection wins (a single pays).
Total stakes: 7 units.

## The Yankee

4 selections, 11 bets:
- 6 doubles
- 4 trebles
- 1 four-fold

Minimum: 2 of 4 win.

## The Heinz

6 selections, 57 bets named after Heinz 57 varieties.

## When to Use Full Cover Bets

Legitimate use cases are narrow:
- Horse racing where you genuinely believe 3–5 horses represent value at fair odds
- When you want partial return protection (a Patent gives you something if only 1 wins)

The disadvantage: full cover bets still carry compounded margins on every leg. The "insurance" of a single paying is partly offset by the increased total staked.

## The EV Reality

No full cover bet format has positive EV unless each individual leg has positive EV. The structure changes the variance profile, not the underlying mathematics of value.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Each-Way Betting: When It Makes Sense', 'each-way-betting-when-it-makes-sense',
'## What Is an Each-Way Bet?

An each-way bet is two bets: one on the selection to win, one on the selection to place (finish in the top positions — typically top 2, 3, or 4 depending on field size and race format).

The place part pays at a fraction of the win odds (usually 1/4 or 1/5) if the horse finishes in the defined places.

## The Mechanics

Each-way bet of £10 on a horse at 10.00 (9/1 fractional):
- Win part: £10 at 10.00
- Place part (1/4 odds, top 3): £10 at ((10−1)/4 + 1) = 3.25

If wins: Win returns £100 + Place returns £32.50 = £132.50 (net profit: £112.50 on £20 staked)
If places but does not win: Win loses £10. Place returns £32.50 (net profit: £12.50 on £20 staked)
If neither: lose £20

## When Each-Way Value Exists

Each-way betting has genuine value in specific horse racing contexts:

**Large fields with 1/4 odds each-way for 3 places:** If a horse is 20.00 (18/1 fractional), the place part at 1/4 odds pays (18/4 + 1) = 5.50. If the horse''s true probability of placing is above 1/5.50 = 18.2%, the place part has value.

**Non-runner rule impacts:** If a withdrawal changes the place terms, each-way bets can become better or worse value.

## When Each-Way Is Poor Value

- Small fields (under 8 runners): typically only 2 places paid. The place market is thin and often has a larger margin than the win market.
- Odds-on favourites: an each-way bet on a 1.50 shot is rarely value — the place odds will be negligible.

## Football Each-Way (First Goal, Top Scorer Markets)

The each-way principle applies to football outright markets. Check the exact terms and model the value of the place part separately from the win part before betting.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'System Bets: Heinz, Super Heinz, Goliath', 'system-bets-heinz-goliath',
'## The Large Multiple Systems

The Heinz (57 bets on 6 selections), Super Heinz (120 bets on 7 selections), and Goliath (247 bets on 8 selections) are full cover bet systems for large numbers of selections.

## Why They Are Marketed Heavily

These products generate large stake volumes from a single bet. A £1 Goliath requires £247 total stakes. The bookmaker earns their margin on each of 247 legs. For the customer, the complex name and the promise of large returns obscures the fundamental mathematics.

## The Margin Compounding Is Extreme

8 selections, each with 5% margin. A full cover Goliath includes 8-fold accumulators.
The 8-fold margin: 1 − (0.95)^8 = 33.7%.
A third of your money on the 8-fold portion is expected to be lost to margin alone.

## The Only Legitimate Use

A horse racing analyst with genuinely positive EV assessments on 6–8 runners in different races can use a Heinz-style product to reduce the administrative burden of placing 57 individual bets. But this only applies if every individual leg meets the value threshold.

## The Practical Recommendation

For any selection on which you genuinely have edge: place a single. The single has the lowest margin, the most direct expression of your edge, and the simplest tracking. System bets add structure but not value.

## Horse Racing Syndicates and Systems

Professional syndicates rarely use system bets. They identify individual value selections and place singles (or doubles when the correlation makes it appropriate). The perception that "professionals use complex systems" is largely a marketing myth.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Builder Bets: Same Game Multis Dissected', 'builder-bets-same-game-multis',
'## The Same Game Multi Revolution

Bet builders (same game multiples) let you combine multiple selections within the same event into one bet. Examples: "Team A wins + Over 2.5 goals + Player X to score."

## The Appeal

Bet builders generate exotic, high-odds combinations from a single match. A 5-fold builder from a match priced at individual odds of 1.50, 1.70, 1.90, 2.00, and 2.20 might return 16.0+ combined.

## The Structural Problem: Correlation

When you combine "Team A wins" with "Player X (on Team A) to score anytime", these outcomes are not independent. If Team A wins, Player X is more likely to have scored. The true combined probability is higher than the product of individual probabilities.

Bookmakers model this correlation with proprietary algorithms — but they apply it in their favour, not yours. The offered combined price systematically underestimates the true combined probability of positively correlated outcomes.

## The Margin Stack

Even before correlation penalties, each leg carries individual margin. A 5-leg builder at 5% margin per leg:
1 − (0.95)^5 = 22.6% combined margin

Then the correlation penalty is added on top (if the bookmaker''s correlation model over-discounts positive correlations).

## Where Genuine Edge Exists in Builders

In theory, edge exists where the bookmaker''s correlation assumptions are wrong:
- Two outcomes that are positively correlated, but priced as if independent or negatively correlated
- Player props combined with team outcomes where the player''s impact is systematically underestimated

In practice, finding and validating this edge requires player-level probability models that most bettors do not have.

## The Verdict

For entertainment: bet builders are fine if you accept the cost. For analytical bettors: avoid unless you have a specific, validated correlation edge.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Bankers in Accumulators: A Strategic Tool', 'bankers-in-accumulators',
'## What Is a Banker?

A "banker" in an accumulator is a selection you treat as near-certain — a high-confidence pick used as the foundation of your combination bet.

In system bets like the Lucky 15 or Lucky 31, a banker means every combination includes that specific selection. If the banker loses, all bets lose.

## The Psychological Trap

Bettors who identify a banker feel they are adding confidence to their bet. But a banker at 1.40 (implied 71%) has a 29% chance of losing. At 1.20 (implied 83%), the banker still loses 17% of the time.

Including a banker in an accumulator does not reduce the overall risk — it concentrates it. If the banker loses, the entire investment is gone regardless of how well the other legs perform.

## The Mathematical Effect of a Banker

4-fold accumulator with banker (1.50) and three other legs at 2.00 each:
Combined odds: 1.50 × 2.00 × 2.00 × 2.00 = 12.00
P(all win): ~0.67 × 0.50 × 0.50 × 0.50 = 8.4%

Replace the banker with another 2.00 selection:
P(all win): 0.50 × 0.50 × 0.50 × 0.50 = 6.25%

The banker increases win probability but the fair odds fall proportionally. The value contribution remains determined by individual EV — not by the "banker" label.

## The Legitimate Banker Situation

A banker in a Dutch bet (backing multiple runners to guarantee equal return) is a different concept — it is the highest-probability selection staked most heavily. This is a mathematically defensible use.

## Expert Insight

Remove the concept of "banker" from your vocabulary. Every selection should be evaluated on its own probability estimate and EV. Call them what they are: high-confidence selections in a multi-selection bet where every leg still has a substantial failure probability.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Exchange Multiples and Exchange Accumulator Strategy', 'exchange-accumulator-strategy',
'## The Exchange Accumulator Difference

On betting exchanges (Betfair, Smarkets), you can construct accumulators with lower effective margin than bookmakers — because commission replaces the per-leg margin.

## The Cost Comparison

Bookmaker 5-fold accumulator at 5% margin per leg:
Effective odds = (0.95)^5 × true accumulated odds = 0.774 × true odds

Exchange 5-fold at 4.5% commission on net profit:
Effective odds = 1 + (True accumulated odds − 1) × (1 − 0.045)
= 1 + accumulated profit × 0.955

For long-odds accumulators (where accumulated profit >> stake), the exchange advantage is significant.

**Example:** 5-fold with true accumulated price of 30.00
- Bookmaker (effective): 30.00 × 0.774 = 23.22
- Exchange (effective): 1 + 29 × 0.955 = 28.70

Exchange gives 23.6% more return.

## The Mechanics of Exchange Multiples

Some exchanges offer built-in multiple bet constructors. Alternatively, the "round-robin backing" approach: back each leg sequentially, reinvesting winnings from each leg as the stake for the next.

This requires active management — you cannot place all legs simultaneously and walk away as with a bookmaker accumulator.

## Using Exchanges for Selective Combination

The most sophisticated approach: place high-EV singles on an exchange, then selectively combine only the legs that remain most underpriced as the event approaches. This dynamic approach extracts the best available price on each leg rather than committing to all legs simultaneously at opening prices.

## The Bottom Line

Even on exchanges, accumulation is only justified when each leg independently meets your value threshold. But when those conditions are met, exchanges provide materially better prices for the combined product.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Advanced Combination Strategy: Optimising Multi-Leg Bets', 'advanced-combination-strategy',
'## The Expert Framework for Combination Bets

At the expert level, combination bet decisions are made through a rigorous portfolio optimisation framework — not through gut feel or the desire for a big payout.

## When Combination Is Superior to Singles

Combination bets are mathematically superior to singles in a narrow but real scenario: when the marginal cost of combining (the additional margin or commission) is lower than the correlation discount you would apply to the individual selections.

In practical terms: if you have a model that shows two legs are positively correlated at a higher rate than the bookmaker''s pricing assumes, the bookmaker is overpricing the combination — creating value in the combined product that does not exist in the singles.

## Portfolio Variance Optimisation

A single bet on a 4.00 selection has much higher per-unit variance than four singles at 2.00 on uncorrelated events with the same total stake. For bettors managing risk across a portfolio, combining lower-variance legs rather than placing higher-variance singles can improve the portfolio''s Sharpe ratio (EV per unit of variance).

## Negative EV Combinations: Never Accept

Regardless of portfolio optimisation arguments, no combination bet with negative EV should be placed. The portfolio framing is relevant only when all individual legs have positive EV.

## Building a Combination Decision Matrix

Before placing any combination, answer:
1. Does each individual leg have positive EV? (Required)
2. Is the combined margin lower than the combined edge? (Required)
3. What is the correlation between legs? (Affects true combined probability)
4. Does the combination improve or worsen the portfolio''s variance profile? (Desirable)
5. What is the opportunity cost vs placing each leg as a separate single on an exchange? (Comparison)

If all conditions are met, the combination is justified. If any fail, default to singles.

## The Professional Standard

Elite operations rarely use combination bets beyond doubles. The marginal gains from clever combination structures are small relative to the gains from better probability estimation, better market selection, and better execution.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'singles-doubles-accumulators' AND cat.slug = 'bet-types';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — Handicap & Asian Handicap Betting           ║
-- ║  Existing: 0 lessons                                    ║
-- ║  Adding: lessons 1–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Is Handicap Betting?', 'what-is-handicap-betting',
'## Levelling the Field

Handicap betting removes the imbalance between a strong favourite and a significant underdog by giving the weaker team a virtual advantage (or imposing a virtual deficit on the stronger team) before the match is scored.

## European Handicap (Match Handicap)

The simplest form. A whole-number advantage is given to one team.

**Example:** Newcastle +1 vs Arsenal −1
- For a Newcastle bet to win: Newcastle win, or draw (the +1 gives them a virtual 1-goal head start)
- For an Arsenal bet to win: Arsenal must win by 2+ goals
- If Arsenal win by exactly 1: the handicap produces a 0-0 tie → void (stakes returned, as in a draw)

This is the European handicap. Unlike the Asian format, a draw result under European handicap exists and voids the bet.

## Why Use Handicap Markets?

1. **Price improvement:** Backing a heavy underdog at +2 goals is more valuable than backing them to win outright
2. **Two-outcome simplicity:** When the handicap is large enough, draws are unlikely, creating near-50/50 markets
3. **Remove the favourite-underdog imbalance:** Equal probability markets on each side attract more liquidity and tighter pricing

## How Handicaps Are Set

Bookmakers set handicap lines to create equal implied probability on each side (approximately 50/50 net of margin). The handicap line that achieves this tells you what the bookmaker''s model predicts for the typical winning margin.

A −1.5 handicap on Arsenal suggests the bookmaker''s model gives Arsenal roughly 50% probability of winning by 2+ goals.

## Handicap vs Spread

In American sports, point spreads are the equivalent. A −7 spread on the New England Patriots means they must win by 8+ points for a Patriots bet to pay.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Asian Handicap: The Core Mechanics', 'asian-handicap-core-mechanics',
'## What Makes Asian Handicap Different

Asian Handicap (AH) eliminates the draw from football betting by using non-integer handicap lines. Without a draw option, only two outcomes exist — giving the bettor near-50/50 choices with the lowest common margins.

## Whole and Half-Goal Lines

**-0.5 / +0.5 (Draw No Bet plus a margin):**
- AH −0.5 on Team A: A must win (by any margin). A draw: A loses.
- AH +0.5 on Team B: B wins or draws. B wins.

**-1 / +1:**
- AH −1 on A: A must win by 2+. A wins by exactly 1: void. A loses or draws: lose.
- Note: the "push" on an exact margin is returned as stake.

**-1.5 / +1.5:**
- A must win by 2+. No void possible.

## Quarter-Goal Lines (The Split)

Asian handicap also uses quarter-goal lines: −0.25, −0.75, −1.25. These split your stake between two adjacent lines.

**-0.75 = half stake at −0.5 and half stake at −1:**
- A wins by 1: half stake wins (the −0.5 part), half returns (the −1 part voids)
- A wins by 2+: both halves win
- Draw or A loses: both halves lose

## The Effect of Quarter Lines

Quarter lines eliminate all push scenarios. Instead of getting your stake back on the exact margin, you receive half the profit (or lose half the stake). This creates a more granular pricing structure than whole or half lines.

## Standard AH Notation

- AH0 = Draw No Bet
- AH-0.5 = Home must win
- AH-1 = Home must win by 2+ (or half return on exactly 1)
- AH-1.5 = Home must win by 2+ (no push possible)',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Why Sharp Bettors Prefer Asian Handicap', 'why-sharps-prefer-asian-handicap',
'## The Asian Handicap Advantages

Asian Handicap has become the preferred market structure for sharp professional bettors for reasons that go beyond the simple removal of the draw.

## Reason 1: Lower Margin

AH markets — especially on major exchanges and with Asian bookmakers — carry 2–3% margin vs 5–8% on equivalent 1X2 markets. Over a full season, this difference is enormous.

**Annual stake of £50,000:**
At 5% margin (1X2): expected drag = £2,500
At 2% margin (AH): expected drag = £1,000
**Saving: £1,500 per year without changing a single selection**

## Reason 2: Two-Way Market Efficiency

A two-way market with near-equal implied probabilities (both sides close to 50%) is the most efficient market structure. The market-making mechanism is straightforward; prices are more accurate and less susceptible to margin manipulation.

## Reason 3: Flexibility to Target Any Line

AH lines from −3.5 to +3.5 effectively price every possible match outcome into a near-50/50 market. Whatever your model predicts, there is an AH line that expresses that prediction most efficiently.

## Reason 4: Reduced Emotional Influence

The draw is the most emotionally volatile outcome in football — unintuitive, unpredictable, and commonly blamed for "ruined accumulators." Removing the draw from the equation forces bettors and bookmakers to focus purely on the win/loss dimension.

## The Liquidity Depth

AH markets on Betfair, Pinnacle, and Asian-facing platforms (SBO, SBOBET) have among the deepest liquidity in sports betting. Large stakes can be placed without significant market impact — a critical advantage for professional operations.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Converting Between 1X2 and Asian Handicap', 'converting-1x2-to-asian-handicap',
'## The Relationships Between Market Types

The 1X2 (match result), Asian Handicap, and over/under markets for the same match are mathematically related. A consistent probability model should produce consistent prices across all three.

## From 1X2 to AH0 (Draw No Bet)

AH0 removes the draw. The implied probabilities for home and away wins must be scaled to remove the draw weight.

AH0 Home price = 1 / (P_home / (P_home + P_away))

Where P_home and P_away are the de-vigged probabilities from the 1X2 market.

**Example:**
De-vigged: Home 45%, Draw 28%, Away 27%
AH0 Home: 1 / (0.45 / (0.45 + 0.27)) = 1 / 0.625 = 1.60
AH0 Away: 1 / (0.27 / (0.45 + 0.27)) = 1 / 0.375 = 2.67

Check: 1/1.60 + 1/2.67 = 0.625 + 0.375 = 1.00 ✓

## From Expected Goals to AH Line Selection

Your expected goals model gives: Home xG 1.8, Away xG 1.1.

Using Poisson simulation, you calculate the probability distribution of goal margins. The AH line that gives 50/50 probability is the "correct" line for fair pricing.

At 1.8 vs 1.1: roughly AH−0.5 to AH−0.75 for the home team is near-50/50.

If Pinnacle offers AH−0.75 at 1.95 home and your model says the home team has 52% probability of winning this AH: edge exists.

## Cross-Market Consistency Check

After converting 1X2 to AH using this method, compare to the actual AH offered. Large discrepancies between your converted AH and the live AH suggest either your 1X2 model is wrong or the markets are inconsistently priced — a potential cross-market edge.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Handicap Betting in Other Sports', 'handicap-betting-other-sports',
'## The Universal Handicap Principle

The core mechanics of handicap betting — giving virtual advantages to level the playing field — apply across all major sports, though the specific conventions differ.

## Basketball Point Spreads

NBA and European basketball use point spreads extensively. A typical NBA game: Golden State −8.5 vs Cleveland +8.5 at 1.91 each.

- Golden State −8.5: Warriors must win by 9+ points
- Cleveland +8.5: Cavaliers win OR lose by fewer than 9 points

The half-point eliminates push possibilities (no tie at 8.5). Lines move throughout the week as betting volume shifts the market.

**Asian handicap equivalent:** The same quarter-line system exists in basketball (−8.25 = split between −8 and −8.5).

## Rugby Union and League

Rugby point spreads operate identically to basketball — whole-number lines with push possible on exact margins. Handicap markets also include try scorer and points-based alternative lines.

## American Football (NFL)

The point spread is the dominant NFL market. Typical lines: −3 and −7 (field goal and touchdown margins) act as natural clustering points where the market push becomes important.

**The key rule:** NFL totals and spreads all settle on 10-minute overtime results, not regulation. This affects in-play handicap bets specifically.

## Cricket (Runs/Wickets Handicaps)

Cricket handicap markets give virtual run advantages. In Test cricket, Asian-style handicaps are offered on total runs per innings.

## Tennis (Games Handicap)

Tennis handicap betting gives a virtual game advantage. An AH−2.5 in games means the player must win by a net 3+ games across all sets. Complex to model but efficient for specialists.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Asian Handicap Line Movement', 'asian-handicap-line-movement',
'## How AH Lines Move

Asian Handicap lines move in two ways: the line itself shifts (e.g. from −0.5 to −0.75) or the price at the same line shifts (e.g. from 1.91 to 1.82 at −0.5).

Both movements carry information about where sharp money is flowing.

## Line Shift: The Strong Signal

When the AH line moves from −0.5 to −0.75, the market is saying: "We initially thought the favourite needed to win by any margin; now we think they need to win by roughly half a goal on average." This is typically driven by significant sharp money on the favourite at −0.5.

A line shift is the strongest signal in AH markets: it means the market has changed its assessment of the likely margin of victory.

## Price Movement at the Same Line

If the line stays at −0.75 but the price moves from 1.95 to 1.85, public or sharp money is betting the same line but at increasing volume.

**Interpretation:** Price movement without line shift suggests volume-driven adjustment rather than model-driven reassessment. More ambiguous than a line shift.

## Reverse Line Movement in AH

If public betting strongly favours the favourite (−0.75 side) but the line moves to −0.5 (less favourable to the favourite), sharp money has moved the opposite direction. This is a reverse line movement — a strong sharp signal toward the underdog (+0.5 side).

## Using Line Movement in Your Strategy

- Monitor opening AH line at Pinnacle vs current AH line
- Large moves (0.5 goal or more) indicate significant sharp action
- Identify whether your model assessment agrees or disagrees with the line movement direction
- If your model and the sharp money agree → confidence in the bet increases
- If they disagree → investigate why before acting',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Handicap Betting Strategies', 'handicap-betting-strategies',
'## Strategy 1: The Alternative Handicap

Most bettors focus on the main AH line (the one closest to 50/50). But alternative handicap lines — larger or smaller handicaps — can offer value when the match probability distribution is skewed.

**Example:** Arsenal vs Burnley. Main line: Arsenal −1.5. Your model says Arsenal win by 2+ with 48% probability (bookmaker: 50/50 = 1.95). Marginal.

But your model''s score distribution says Arsenal win by 3+ with 28% probability. Alternative line: Arsenal −2.5 at 3.20 (implied 31.25%).

28% vs 31.25%: not value. But at 3.40 (implied 29.4%): 28% < 29.4% → still no value.

At 3.80 (implied 26.3%): 28% > 26.3% → value on the alternative line.

## Strategy 2: The Push Line

When a whole-number AH line is available (−1, −2), the push scenario (returning stake if exactly that margin) has value if that exact margin occurs often. Research shows 1-goal winning margins are very common in football — which makes AH−1 push scenarios frequent.

If your model says Arsenal have 20% chance of winning by exactly 1 goal and the push occurs at AH−1, the push is a real probability that partially compensates for the single-goal win not paying out on the −1 line.

## Strategy 3: Goal Line Selection

For totals markets, the same AH logic applies. Instead of handicapping teams, the market handicaps the total goals. Over/Under 2.5 (a half-line) has no push; Over/Under 2 (a whole-line) has a push on exactly 2 goals (returned).

If the probability of exactly 2 goals is high in your model, the Over/Under 2 whole-line may be superior to Over/Under 2.5.

## The Handicap Research Agenda

For every sport you bet in handicaps: build a probability distribution over winning margins (not just win/draw/loss). This distribution is the foundation of all handicap value analysis.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Draw No Bet: The Underused Tool', 'draw-no-bet-underused-tool',
'## What Is Draw No Bet?

Draw No Bet (DNB) is Asian Handicap 0: if the match is a draw, your stake is returned. You win if your team wins; you lose if your team loses.

This is equivalent to:
- AH 0.0 (Asian handicap zero — no head start for either team)
- Buying out the draw risk while keeping full win exposure

## When DNB Has Value

DNB makes mathematical sense when:
1. You want to back a team but the draw price is significant and represents real risk
2. The DNB price offers better risk-adjusted return than the win-only price given your probability estimates
3. The team is likely to win but not by huge margins (making AH−0.5 or AH−1 too aggressive)

## Comparing DNB to Win

**Match:** Arsenal vs Crystal Palace
Win (Arsenal): 1.65 (implied 60.6%)
Draw No Bet (Arsenal): 1.35 (implied 74.1%)
Your estimated probabilities: Arsenal win 62%, Draw 24%, Palace win 14%

DNB expected value:
EV_DNB = (P_win × (1.35−1)) − (P_loss × 1) = 0.62×0.35 − 0.14×1 = 0.217 − 0.14 = +£0.077 per £1 (7.7%)

Win expected value:
EV_win = 0.62×0.65 − 0.38×1 = 0.403 − 0.38 = +£0.023 per £1 (2.3%)

DNB has higher EV here because the win price is less generous relative to your probability estimate.

## The Price Comparison Formula

DNB price = 1 / (P_win / (P_win + P_lose))

This is the fair DNB price given your estimates. Compare to the offered DNB price to find value.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Modelling Asian Handicap Probability Distributions', 'modelling-ah-probability-distributions',
'## From Match Model to AH Probabilities

Your football model produces three probabilities: home win, draw, away win. To price any AH line, you need the full probability distribution over goal margins — not just the three outcome probabilities.

## The Poisson-Based Approach

Using the Poisson model (as described in the line-building module), compute P(score = k-j) for all combinations:

- AH−0.5 home win probability = P(home goals > away goals) = P(home wins)
- AH−1 home win probability = P(home goals − away goals > 1) = P(home wins by 2+)
- AH−1 push probability = P(home goals − away goals = 1)
- AH−1.5 home win probability = P(home goals − away goals > 1.5) = P(home wins by 2+) (same as AH−1 win, different push structure)

## The Quarter-Line Split

For AH−0.75 (split between −0.5 and −1):

P(AH−0.75 home full win) = P(home wins by 2+) [both halves win]
P(AH−0.75 home half win) = P(home wins by exactly 1) [−0.5 wins, −1 voids]
P(AH−0.75 home full loss) = P(draw or away win) [both halves lose]

EV of AH−0.75 home:
= (P_full_win × (price−1) + P_half_win × ((price−1)/2) − P_full_loss) × stake

## Building an AH Pricing Sheet

For each upcoming match in your universe, generate a full AH pricing sheet: probability and fair price for every AH line from −3 to +3 in quarter increments. Compare to the bookmaker''s AH offerings across all lines. The line with the largest positive EV is your target bet.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert AH Operations: Running a Handicap Portfolio', 'expert-ah-portfolio',
'## The Professional AH Framework

Elite AH bettors operate a full handicap portfolio across multiple leagues and competitions, with a unified model producing AH probabilities for every target market daily.

## The Daily Process

**Morning:** Model runs overnight and produces AH probability sheets for all matches in the next 48 hours. Model probabilities are compared to current Pinnacle AH lines.

**Pre-selection:** All matches with ≥3% model vs Pinnacle discrepancy are flagged for review.

**Research:** Flagged matches are reviewed for contextual factors (injuries, lineups, weather) not in the base model. Contextual adjustments are applied.

**Bet placement:** Matches where adjusted model price remains above Pinnacle closing line equivalent → bets placed, starting with exchanges, then Asian books, then soft books.

**Post-event:** All AH bets logged with: model probability, Pinnacle closing price, actual result, AH outcome. CLV calculated for every bet.

## Line Selection Across the AH Range

A sophisticated portfolio does not focus on a single AH line for each match. It surveys all available lines and identifies the one with maximum positive EV given the full probability distribution.

The −0.75 line might be fair for a match, but the −1.5 line might have +4% EV if the bookmaker''s model underestimates the probability of a 2-goal winning margin.

## Account Management in AH Markets

Asian-facing bookmakers (Pinnacle, SBOBET, SBO) are essential for AH operations:
- They offer the lowest margins on AH
- They do not restrict winning accounts
- They have the deepest liquidity

Cultivating and maintaining access to these accounts is the operational priority of any serious AH portfolio.

## The Compounding Edge

A 2.5% AH edge, deployed at £200 average stake, 400 bets per year:
Expected annual profit = £200 × 400 × 0.025 = £2,000

At Pinnacle margins of 2.5%: the edge barely covers the margin. The threshold is tight — which is why line shopping for the best AH price across bookmakers and exchanges is not optional. Every 0.1 improvement in average AH price directly adds to the thin margin between profitability and loss.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'handicap-and-asian-handicap' AND cat.slug = 'bet-types';
