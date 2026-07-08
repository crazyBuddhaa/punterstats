-- ============================================================
-- PunterStat — Odds & Markets: Add Key Takeaway sections
-- Stage 3 of lesson content expansion (17 lessons from migration 016)
-- Lessons are in Markdown format; Key Takeaways added in Markdown.
-- Run after 042_basketball_tennis_key_takeaways.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- UNDERSTANDING ODDS FORMATS (7 lessons — lessons 4-10 from 016)
-- ══════════════════════════════════════════════════════════════

-- Lesson 4: Converting Between Odds Formats
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Conversion fluency — the ability to instantly convert any odds format to its implied probability — is not a cosmetic skill. It is a prerequisite for any meaningful price comparison. A bettor who cannot perform this conversion in under 5 seconds is operating at an informational disadvantage: they cannot quickly evaluate whether a price represents value without a mechanical pause that may cost them a timely bet. The single most important conversion to automate is to decimal as an intermediate step, then to implied probability using the formula **1 ÷ decimal odds**. Every other comparison flows from this. A Pinnacle price of 1.95 (51.3% implied probability) versus a soft-book price of 2.05 (48.8% implied probability) on the same outcome represents a 2.5-percentage-point pricing discrepancy that only becomes visible through format-normalised comparison. Practise decimal conversion until it is a reflex — not because it is intellectually impressive but because it is financially necessary.
$KT$
WHERE slug = 'converting-between-odds-formats'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 5: Reading Odds Boards Quickly
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Speed of odds reading has measurable financial consequences. Sharp bookmakers update prices every 5–15 minutes on major markets and in near-real-time on high-liquidity markets following public or sharp money. A bettor who takes 30 seconds to assess whether a price represents value is operating at a practical disadvantage against one who does it in under 10 seconds. Build your mental calibration around six reference anchors that cover 80% of the prices you will encounter: **1.50 = 67%, 1.80 = 56%, 2.00 = 50%, 2.50 = 40%, 3.00 = 33%, 4.00 = 25%**. From these anchors, interpolate quickly. Everything below 2.00 is the favourite (>50% implied probability); everything above is the underdog. The goal is not memorisation of a table but fluent reading — the difference between a driver who reads road signs consciously and one who processes them automatically. Invest deliberate practice time here; it pays compound returns across every subsequent bet you evaluate.
$KT$
WHERE slug = 'reading-odds-boards-quickly'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 6: Odds Across Different Sports
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Sports-specific pricing structures create systematic opportunities for bettors who understand them. Football's three-outcome market carries a higher total margin than two-outcome markets (tennis, basketball) because the bookmaker prices three probability estimates rather than two — accepting more modelling risk across a wider outcome set. However, football's larger market ecosystem (more bookmakers, higher volume, more competition) enables better line-shopping. American point-spread markets add complexity but create arbitrage opportunities (middles, buying half-points) unavailable in fixed-odds win markets. Each market structure has distinct value-hunting implications. Bettors who restrict themselves to one sport's familiar pricing format miss structural opportunities in adjacent markets. The analytical principle: understand the mechanics of each market you enter, specifically how margins are built and where pricing uncertainty is highest, before applying any selection strategy.
$KT$
WHERE slug = 'odds-across-different-sports'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 7: Spread & Totals
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Spread betting's key analytical insight is that it transforms a two-outcome market into one about margin of victory — and the public's tendency to bet with heavy favourites creates systematic biases. NFL data consistently shows that the market underprices the probability of close games (within one possession, 8 points or fewer) for heavily favoured teams, reflecting public over-confidence in blowout margins. Totals markets (over/under) are similarly affected: high-profile offensive teams attract disproportionate over-bets, pushing lines higher than objective data justifies. These systematic biases — favourite cover bias and over-totals bias for high-profile matchups — have been documented across decades of NFL and NBA data. They represent some of the most studied and persistent value-hunting frameworks in sports betting because they arise from structural audience behaviour (recreational bettors backing favourites and overs emotionally) that the market only partially corrects. Understanding them does not guarantee profit but identifies where to look first.
$KT$
WHERE slug = 'spread-and-totals-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 8: Exchange Odds vs Bookmaker Odds
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The structural advantage of exchange betting is price improvement: exchanges consistently offer higher odds on the same outcome than bookmakers because their margin is extracted as commission on winnings (2–5%) rather than by compressing both sides of the price. For a bet at 2.50 on an exchange with 2% commission, your effective return is 2.50 × 0.98 = 2.45. The equivalent bookmaker price on the same market is often 2.30–2.40 — a 5–10% difference in return per winning bet. Over a large sample, this difference compounded across hundreds of bets produces a substantial ROI improvement. The additional feature of exchange lay markets — the ability to bet against an outcome — enables position-taking strategies (greening up, trading both sides as prices move) unavailable through traditional bookmakers. Any serious long-run bettor should maintain exchange accounts alongside traditional bookmaker accounts and route appropriate bets to whichever offers the better effective price after commission.
$KT$
WHERE slug = 'exchange-odds-vs-bookmaker-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 9: Pricing Discrepancies Across Bookmakers
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Pricing discrepancies between bookmakers are not random noise — they arise from structurally different customer profiles, modelling competencies, and liability management approaches. A bookmaker heavily bet by recreational customers on the local team will shade their price on that team higher to manage liability, creating a structural over-price relative to true probability. The most practically useful discrepancy pattern is when sharp books (Pinnacle, Circa) price an outcome significantly lower than recreational books. A Pinnacle offering on the home team at 1.80 while a soft book offers 1.95 signals that the soft book is holding an inaccurate line — and the soft book's price is the side you want. No independent probability model is required for this approach; you are using the sharp book's line as a peer-reviewed probability reference and exploiting the soft book's lag. This is one of the most accessible, data-grounded value-hunting strategies available.
$KT$
WHERE slug = 'pricing-discrepancies-across-bookmakers'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Lesson 10: How Bookmakers Set Their Odds
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The opening line process is one of the most information-rich datasets in sports betting. Pinnacle publishes opening lines earlier than most bookmakers and with deliberately low initial limits — effectively using their sharp customer base as a peer-review mechanism for the trading team's initial probability estimate. When large, informed bets hit the opening line and move it quickly in one direction, the market has found information the opening model missed. Watching how a line moves from open to close — which direction, how consistently, and whether it reverses — reveals market structure. A line that opens at 2.10 for the home team and closes at 2.40 has been hit consistently by informed bettors who believe the home team was overpriced: the closing price is a better estimate of true probability than the opening one. This is why **closing line value (CLV)** — comparing your taken price to the final pre-match price — is the most reliable metric for evaluating whether your selections reflect genuine information or luck.
$KT$
WHERE slug = 'how-bookmakers-set-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');


-- ══════════════════════════════════════════════════════════════
-- HOW BOOKMAKER MARGINS WORK (10 lessons from migration 016)
-- ══════════════════════════════════════════════════════════════

-- Lesson 1: What Is the Overround?
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The overround should be understood as an annualised tax rate on your betting capital — not a one-time cost. A market with a 5% margin does not cost you 5% of one bet; it erodes your expected return by 5% relative to true probability on every bet you place. Over 500 bets into a 5% overround, a bettor with no edge will lose approximately 5% of total stakes regardless of their individual results. This compounding is the reason why minimising the margin you bet into is as important as finding value. Consistently betting into 2% margins instead of 5% margins reduces your break-even win rate by approximately 1.5 percentage points — a substantial structural improvement achieved through bookmaker selection alone, before any selection skill is applied. The overround is not a background detail; it is the primary determinant of long-run ROI for bettors who do not have substantial edge.
$KT$
WHERE slug = 'what-is-the-overround'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 2: Calculating the Margin Step by Step
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Margin calculation — sum of implied probabilities minus 1.00 — should be the first tool you apply to any new market before evaluating individual prices. A total implied probability of 1.07 means a 7% margin. Within that 7%, not all outcomes are equally penalised: bookmakers tend to compress the shortest-priced outcome further (because their liability on the favourite is highest) while allowing the longest-priced outcome to sit closer to fair value. In a match where the home team is a heavy favourite (e.g., Manchester City hosting a relegation-threatened side), the home win odds may carry a 4–5% individual price compression while the away win odds carry only 1–2%. The underdog may structurally represent better pricing relative to true probability — independent of whether you believe they will win. This is why calculating the margin distribution across outcomes, not just the total margin, gives a more precise picture of which outcome is receiving the worst deal.
$KT$
WHERE slug = 'calculating-the-margin-step-by-step'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 3: Why Margins Vary by Market
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The margin hierarchy across market types reveals the bookmaker's information confidence and customer base by market. Popular markets with high liquidity and intense competition — Premier League match odds, major horse racing events — carry lower margins (3–5%) because bookmakers compete for volume and their pricing algorithms are most refined. Niche markets — lower-league football, minor tennis tournaments, obscure player props — carry 8–12% margins because bookmakers price with less certainty and face less competition. For bettors with genuine specialised knowledge, niche markets present both a higher margin barrier and greater potential value: the question is whether your informational advantage exceeds the higher margin hurdle. For most bettors without domain specialisation, the high niche-market margin is a structural barrier. For genuine specialists in overlooked competitions, it is an opportunity that the efficient mainstream market does not offer.
$KT$
WHERE slug = 'why-margins-vary-by-market'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 4: True Odds vs Offered Price
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The gap between true probability and offered price is the only variable that determines whether any betting strategy is profitable long-term. The critical cognitive trap is circularity: using the bookmaker's offered price as a proxy for true probability, then using that estimate to judge whether the price is fair. Genuine value identification requires an independent probability source — a quantitative model, genuine domain expertise, or a reference market. The most accessible reference market for most bettors is Pinnacle's de-vigged closing line: after removing Pinnacle's known margin (approximately 2–3%), the remaining price represents a peer-reviewed market consensus probability estimate. When a softer bookmaker offers a meaningfully higher price on the same outcome than Pinnacle's de-vigged estimate implies, you have a data-grounded basis for a value bet — not one dependent on overconfidence in your own prediction. This framework makes value identification systematic rather than subjective.
$KT$
WHERE slug = 'true-odds-vs-offered-price'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 5: Comparing Margins Across Bookmakers
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Migrating from betting into 8% margins to 3% margins improves expected long-run ROI by approximately 5 percentage points on every bet — without changing a single selection. This is the most reliable, underutilised ROI improvement available to most recreational bettors: choosing the right bookmaker for each bet is a decision with a quantifiable, consistent expected value impact independent of selection quality. The practical framework: maintain accounts at a spectrum of bookmakers, from sharp (Pinnacle, Betfair Exchange) to selective soft books, and route each bet to whichever offers the best effective price after margin. Tracking your average margin per bet over a 100+ bet sample tells you more about your operational efficiency than your win/loss record in the short run. A bettor consistently achieving an average margin per bet below 4% is already positioned in the top tier of recreational bettors by cost structure, before factoring in selection skill.
$KT$
WHERE slug = 'comparing-margins-across-bookmakers'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 6: How Margin Destroys Long-Run ROI
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The mathematics of margin on long-run ROI are unambiguous and do not respond to skill. At break-even probability, a bettor placing 1,000 bets into a 5% margin loses approximately 5% of total stakes — these losses are independent of selection quality, strategy, or discipline. Even a genuinely skilled bettor with a 3% edge loses it entirely when betting into a 7% margin, needing extraordinary consistent outperformance to maintain long-run profit. The strategy implication is direct: **minimising the margin you bet into is a prerequisite to any value-betting operation, not an afterthought**. Finding a +2% edge in a 6% margin market produces a net expected ROI of approximately −4%. The same +2% edge in a 2.5% margin market produces approximately −0.5% — a loss still, but dramatically more survivable, and one that converts to profit once edge reliably exceeds 2.5%. Your first priority is cost structure, not edge identification.
$KT$
WHERE slug = 'margin-and-long-run-roi'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 7: De-Vigging — Deriving Fair Odds
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

De-vigging is the technical foundation of all comparative probability analysis. Once you have fair (de-vigged) probabilities, you can compare your independent estimate to the market's estimate and identify specific discrepancies with a quantified magnitude. The proportional method — dividing each raw implied probability by the sum of all implied probabilities — is the most widely used and produces results close to more mathematically precise methods for mainstream market prices. A worked example: home 2.00, draw 3.40, away 3.60 gives implied probabilities of 50%, 29.4%, 27.8% summing to 107.2%. After proportional de-vigging: home 46.6%, draw 27.4%, away 25.9% — these are the market's best estimates of true probability. Your model's estimates compared to these three numbers tells you exactly where, if anywhere, a discrepancy worth investigating exists. De-vigging converts a market from a pricing signal into a probability signal — and that conversion is the prerequisite for any rigorous value identification.
$KT$
WHERE slug = 'de-vigging-fair-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 8: Sharp Books vs Soft Books — Margin Profiles in Practice
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

The sharpness spectrum matters for two reasons beyond margin level. First, sharp books update lines faster in response to breaking information — team news, injury reports, sharp money — while soft books lag. A bettor who monitors sharp-book line movements and acts quickly at soft books with stale lines is exploiting a timing gap that generates systematic positive expectation with no selection skill required. Second, soft books restrict and close winning accounts. This creates a practical operational tension: sharp books accept winners but offer tight margins; soft books offer better pricing windows and larger initial stakes but close winning accounts. A sustainable long-run operation requires both: placing large-stakes bets at sharp books where account longevity is assured, and exploiting temporary stale lines at soft books before limits are applied. Account management — maximising account longevity at soft books while delivering volume at sharp books — is itself a discipline with quantifiable ROI implications.
$KT$
WHERE slug = 'sharp-vs-soft-margin-profiles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 9: Margin-Aware Market Selection
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Margin-aware market selection is portfolio management applied to betting costs. Every market you enter has a specific expected cost (the margin per bet). Reducing average cost per bet across your portfolio is a pure ROI improvement, independent of selection skill. The actionable framework: before placing any bet, calculate the margin in that specific market at that specific bookmaker. If the margin exceeds your estimated edge, the bet is negative expected value regardless of how confident you are in the outcome. This is why systematically low-margin bookmakers are more valuable long-term than high-margin bookmakers offering occasional enhanced odds promotions: a consistent 2–3% cost structure outperforms a 7% average cost with periodic 15% enhanced prices in any 100+ bet sample. Build the habit of asking "what is the margin on this market right now?" before asking "do I want to bet this?". The first question determines whether the second question is even worth answering.
$KT$
WHERE slug = 'margin-aware-market-selection'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Lesson 10: Using Margin Analysis to Hunt Value
UPDATE public.lessons
SET content = content || $KT$

## Key Takeaway

Using margin differentials as a value signal — identifying markets where one bookmaker's price implies meaningfully different true probability than another's — is one of the most practical and accessible value-hunting techniques available. When Pinnacle (2.5% total margin) prices a team at 2.00 and a soft bookmaker (8% total margin) prices the same team at 2.20, the soft book is offering a materially better price on that outcome. After de-vigging both: Pinnacle's fair price is approximately 2.05; the soft book's fair price is approximately 2.38. The soft book's offered price of 2.20 still exceeds Pinnacle's de-vigged estimate of 2.05 — a 7.3% price premium over the consensus. This analysis requires no independent probability model: you are using a sharp book as your reference probability source and a soft book as your execution vehicle. The systematic application of this approach — monitor, compare, act on significant discrepancies — is one of the most rigorously data-grounded entry points into value betting.
$KT$
WHERE slug = 'using-margin-to-hunt-value'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
