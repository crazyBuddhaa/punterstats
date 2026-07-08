-- ============================================================
-- PunterStat — Betting Academy: Betting Psychology Expansion
-- Migration 033: Expand 2 existing modules to 10 lessons each
--   • cognitive-biases-in-betting   — add lessons 3–10
--   • discipline-and-record-keeping — add lessons 3–10
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Cognitive Biases in Betting                 ║
-- ║  Existing: 2 lessons (sort_order 1–2)                   ║
-- ║  Adding: lessons 3–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Confirmation Bias: Seeing What You Want to See', 'confirmation-bias-betting',
'## The Most Dangerous Bias in Betting

Confirmation bias is the tendency to search for, interpret, and recall information in a way that confirms your pre-existing beliefs. In betting, it is the tendency to find reasons why your selection is correct and ignore evidence that it is not.

## How Confirmation Bias Manifests

**Before placing the bet:**
You decide Team A will win. You then read every positive statistic about Team A (home record, recent form) while skimming or dismissing negative information (their defensive weakness, key player doubts).

**After placing the bet:**
You monitor the match and interpret every Team A possession as "they''re dominating" while dismissing the opposition''s clear chances as "fluky." The match analysis is shaped by what you want to see.

**After a loss:**
You attribute the loss to bad luck ("we should have won"), not to the quality of the analysis. The post-loss narrative confirms that the original decision was correct and bad luck was responsible.

## The Research Evidence

Academic studies show bettors recall their winning selections more clearly and with more positive framing than their losing selections. Win rates are systematically overestimated in self-reported performance records — confirmation bias in memory.

## Breaking the Pattern

**Pre-mortem analysis:** Before placing the bet, explicitly argue the case against your selection. List three reasons the opposing team might win. This forces engagement with disconfirming evidence.

**Blind data review:** Before reading any narrative about a team, review their underlying performance metrics (xG, defensive record) without knowing your intended selection. Let the data form the view, then add context.

**Systematic tracking:** CLV-based performance tracking is immune to confirmation bias — the number does not adjust based on how you felt about the selection.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Recency Bias and Narrative Traps', 'recency-bias-narrative-traps',
'## The Recency Problem

Recency bias is the tendency to weight recent events more heavily than older events, even when the older events are statistically more representative. In betting, this produces predictable errors.

## Classic Recency Errors

**The form team overreaction:**
A team wins 4 matches in a row. Their next-match odds shorten significantly. The market — and most bettors — extrapolate the winning run as evidence of superiority. Statistical analysis shows: winning runs of 4 in a sport like football are common even for average teams due to schedule variance and goalkeeper performance regression.

**The bad run underreaction:**
A strong team loses 3 consecutive matches. Bettors avoid them; the market drifts. But the underlying xG data shows they are performing well — they have been unlucky. The recency bias creates value for the analytically rigorous bettor.

**The star player game:**
A striker scores in 3 of 4 matches. His anytime scorer price falls. Recency extrapolation ignores his underlying xG rate (the best predictor) in favour of recent results.

## The Narrative Trap

Media coverage amplifies recency bias. When a team is "on fire," every outlet publishes this narrative. This amplified narrative affects public betting behaviour and moves markets independently of actual probability change. The narrative and the underlying probability can diverge significantly.

## The Correction Mechanism

Maintain a rolling model that weights historical data appropriately:
- Last 5 matches: 30% weight
- Matches 6–15: 40% weight
- Matches 16–25: 20% weight
- Pre-season/historical baseline: 10% weight

This prevents any short-term run from dominating the probability estimate.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Gambler''s Fallacy and Independence of Events', 'gamblers-fallacy-independence',
'## The Classic Fallacy

The gambler''s fallacy is the belief that independent random events are influenced by previous outcomes: "It''s been red 8 times in a row at roulette — black is overdue."

In sports betting, the fallacy manifests differently but is equally costly.

## How It Appears in Betting

**The draw drought:**
"Arsenal haven''t drawn in 12 matches — a draw must be due." Each match is independent. The probability of a draw in Arsenal''s next match is determined by Arsenal''s current team quality and their opponent — not by the string of non-draws before it.

**The late equaliser belief:**
"There''s always a late goal in these matches." Past late goals in a specific fixture do not increase the probability of a late goal in the next fixture. Each match is an independent draw.

**The losing streak reversal:**
"I''ve lost 8 bets in a row — I''m due a win." Your individual results are independent events if your selections are based on independent analysis. A losing run does not make the next bet more likely to win.

## The Crucial Exception: Non-Independent Events

Some events in betting ARE genuinely correlated:
- A referee who has issued many cards in the first half is not necessarily "overdue" for a calm second half — referees tend to be consistently strict or lenient (positive autocorrelation)
- A striker who has not scored in 10 matches may genuinely have declining form (not just "overdue" — the underlying probability may have changed)

The skill is distinguishing genuine probability changes (non-independence) from the gambler''s fallacy (incorrect belief in dependence of independent events).

## The Test

For any "overdue" belief, ask: "What mechanism would cause previous outcomes to influence this specific probability?" If there is no causal mechanism, the belief is the gambler''s fallacy.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Availability Heuristic and Memorable Events', 'availability-heuristic-betting',
'## When Vivid Memories Distort Probability

The availability heuristic is the tendency to estimate the probability of an event based on how easily examples come to mind. Events that are vivid, recent, or emotionally charged are mentally "available" and therefore perceived as more probable than they actually are.

## Betting Examples

**The memorable upset:**
Brazil lost 7-1 to Germany in the 2014 World Cup. This vivid, shocking result is mentally available to everyone who saw it. Bettors who experienced this event may systematically overestimate the probability of historic upsets when Brazil plays strong opposition — even 10 years later.

**The spectacular goal:**
A striker scores a spectacular 35-yard volley in a broadcast match. This goal is memorable and mentally available. His anytime scorer price is affected by public memory of spectacular goals disproportionately to his underlying xG rate.

**The dramatic late goal:**
You personally watched a match where a 94th-minute goal overturned a winning position. This experience makes late goals feel more probable in future matches you watch than the statistical base rate warrants.

## Why Availability Distorts Markets

Public betting markets are influenced by what bettors think about — not just what the statistics show. The availability heuristic systematically inflates prices on memorable outcomes (high-profile upsets, famous strikers, dramatic comebacks) and deflates prices on statistically probable but unremarkable outcomes (the quiet 2-0 win by the deserving favourite).

## The Systematic Correction

Keep a probability calibration log: for each category of bet (e.g. "favourite wins by 2+ goals"), track your estimated probability vs actual frequency. If your estimated frequency is consistently above actual frequency for a category that includes vivid counterexamples, availability bias is likely at work.

The correction is mechanical: return to base rates and model outputs. The vivid exceptions are exceptions — their vivid quality does not make them typical.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Anchoring: How First Prices Shape Your Thinking', 'anchoring-prices-betting',
'## The Anchoring Effect

Anchoring is the cognitive bias where the first piece of numerical information encountered disproportionately influences subsequent judgments. In betting, the first price you see for a selection becomes an anchor that shapes how you evaluate subsequent prices.

## How Anchoring Operates in Betting

**Opening line anchoring:**
A bookmaker opens Team A at 2.50. You immediately think "2.50 for Team A." When you later check Pinnacle and see 2.30, you interpret it as "expensive" — even if 2.30 more accurately reflects the true probability.

**Personal prediction anchoring:**
You estimated Team A''s win probability at 45% before seeing any market prices. When the market shows 38% implied probability, you see "value" — but the anchor (your 45% estimate) may itself be biased, and the 38% may be the more accurate figure.

**Round number anchoring:**
Odds of 2.00 feel like a natural "fair" point. Bettors evaluate 1.90 as "short" and 2.10 as "generous" relative to this anchor — regardless of whether 2.00 was ever the actual fair price.

## The Professional Counter

**Blind probability estimation:** Before looking at any market price, estimate your probability for each outcome. Write it down. Only then look at the market price. This prevents the market price from anchoring your probability estimate.

**Price-agnostic model output:** Build your betting model to output probabilities only — not prices. Convert to implied prices only at the comparison stage. This keeps the model uncontaminated by market anchoring.

**Multiple reference points:** Never rely on a single bookmaker''s price as the reference. Always check Pinnacle, the exchange, and at least one alternative bookmaker to establish a range rather than a single anchor.

## The Anchor Test

If you find yourself thinking "that''s good value" or "that''s short" about a price: ask what probability you assigned before seeing any market. If you did not assign a probability before looking at the price, you may be evaluating value relative to an arbitrary anchor rather than an objective estimate.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Overconfidence and Calibration', 'overconfidence-calibration-betting',
'## The Overconfidence Problem

Overconfidence is perhaps the most pervasive cognitive bias in betting: the tendency to be more certain about the accuracy of your judgments than the evidence warrants.

Research across populations consistently shows that humans are poorly calibrated: when people say they are "90% confident" in a prediction, they are correct less than 75% of the time. In betting, overconfidence manifests as:

- Underestimating the probability of upset results
- Staking more than Kelly recommends for your actual edge
- Viewing losing runs as anomalies rather than expected outcomes

## Measuring Your Calibration

A calibration test: over your last 200 bets, group selections by your confidence level:

| Stated confidence | Actual win rate |
|---|---|
| 60% | X% |
| 65% | Y% |
| 70% | Z% |

If your stated confidence consistently exceeds your actual win rate, you are overconfident. If it matches (or understates), you are well-calibrated.

## Correcting for Overconfidence

**Shrink your probability estimates toward 50%:**
If your model says 70% win probability, consider using 63% in Kelly calculations (applying a 30% shrinkage factor toward 50%). This corrects for systematic overconfidence.

**Compare to closing line:**
If the market consistently closes at a lower implied probability than your pre-market estimate, the market is correcting for your overconfidence.

**Track raw model output vs outcome:**
Build a calibration chart from historical model predictions. Where model exceeds actual frequency: apply a calibration correction. Where model matches: trust the output.

## The Elite Level Standard

The best bettors are neither overconfident nor underconfident — they have well-calibrated uncertainty. A 60% estimate is correct approximately 60% of the time. This calibration takes years of deliberate tracking to achieve and is one of the clearest markers of analytical maturity.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Hot Hand Fallacy in Sports Betting', 'hot-hand-fallacy-sports-betting',
'## The Hot Hand Belief

The hot hand fallacy is the belief that a person who has been successful recently is more likely to continue succeeding — that they are "on a streak" or "in the zone." In basketball, fans believe a player who has made 3 consecutive shots is more likely to make the next one.

The foundational 1985 study by Gilovich, Vallone, and Tversky found no statistical support for the hot hand in basketball shooting. This result was influential — but subsequent research has found nuances.

## Where the Hot Hand Is Real

More recent, larger-sample studies have found small but real hot hand effects in some contexts:

- **Free throw shooting:** Slight positive autocorrelation (0.02–0.03 correlation between consecutive attempts)
- **Sports where confidence affects mechanics** (darts, snooker): Psychological momentum may produce small real effects

## Where It Is Not Real

- **Goal scoring frequency in football:** Controlling for xG, recent goals do not predict future goals
- **Betting selections:** Your personal win rate from last week does not predict this week''s performance
- **Team winning runs:** Positive autocorrelation in team results mostly reflects schedule quality and underlying team rating, not genuine momentum

## The Betting Application

Many bettors increase stakes when "running hot" and decrease when "running cold." This stake variation based on recent results has zero expected value unless:
1. Your recent wins were based on a genuinely stronger analytical approach (and you can identify what improved)
2. The "hot" period reflects a better market environment (not your personal hot hand)

Absent these conditions, stake variation based on recent results is pure gambler''s fallacy dressed as momentum intuition.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Bias-Resistant Decision Process', 'bias-resistant-decision-process',
'## From Bias Awareness to Bias Resistance

Knowing about cognitive biases does not eliminate them. Research by Kahneman and others shows that even trained statisticians and economists exhibit the same biases when reasoning intuitively — bias awareness does not produce bias immunity.

What reduces bias is not knowledge but systems: processes that take key decisions out of the hands of in-the-moment intuition.

## The Bias-Resistant Betting System

**1. Quantitative model as primary input:**
A model that generates probabilities from historical data and current conditions is immune to most human biases. It does not feel excitement about a "form team," cannot remember a spectacular recent goal, and does not anchor to yesterday''s price.

Use the model output as the primary input for bet selection. Override it only with documented, specific information the model does not capture — not with feelings.

**2. Pre-commitment to stakes:**
Calculate stakes using the Kelly formula before placing any bet. Write them down before watching any match or reading any news. Adjusting stakes after emotional exposure to match events or team news narratives is where biases enter.

**3. Checklist-based bet review:**
Before each bet, work through a fixed checklist:
- Model probability vs market implied probability: edge confirmed?
- Any news the model does not capture? (injuries, weather, late lineup changes)
- Is this selection outside my validated market scope? (if yes: pass)
- Is my stake within the pre-calculated range? (if no: return to formula)

**4. Outcome-independent review:**
Review bets based on process quality, not result. A well-reasoned loss is a better bet than a poorly-reasoned win.

**5. Regular calibration reviews:**
Monthly, compare estimated probabilities to outcomes across all selections. Identify systematic biases in specific market contexts and update the process accordingly.

## The Compound Effect

A bias-resistant process does not make every bet correct. It makes the error distribution more symmetric — errors in both directions, rather than systematically biased errors in one direction. Symmetric errors have zero expected cost. Systematic biased errors have predictable negative expected value.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'cognitive-biases-in-betting' AND cat.slug = 'betting-psychology';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — Discipline and Record Keeping               ║
-- ║  Existing: 2 lessons (sort_order 1–2)                   ║
-- ║  Adding: lessons 3–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Non-Negotiable Bet Log', 'non-negotiable-bet-log',
'## Why Recording Every Bet Is Not Optional

The bet log is the empirical foundation of your entire operation. Without it, you have no way to distinguish a genuinely profitable approach from an approach that feels profitable due to selective memory and confirmation bias.

The bet log is not a bureaucratic formality. It is the mechanism by which you convert experience into knowledge.

## What Every Entry Must Contain

At minimum, each bet entry should record:

| Field | Why It Matters |
|---|---|
| Date and time placed | Enables time-of-day and day-of-week analysis |
| Event and kickoff time | Links to result data |
| Selection and market | Enables market-type performance analysis |
| Bookmaker | Enables account-level analysis |
| Stake (units and currency) | Required for all financial calculations |
| Decimal odds | Required for P&L calculation |
| Result (W / L / V) | The outcome |
| Profit/Loss (units) | Net unit P&L |
| Closing odds (Pinnacle) | Required for CLV calculation |
| Model probability | Required for calibration analysis |
| Notes (one line) | Brief reasoning — key at review time |

## Maintaining the Log in Real Time

Log each bet the moment it is placed. Not at the end of the day. Not when you remember. The moment it is placed.

Delayed logging introduces selection memory bias: you unconsciously remember winners with more detail than losers. Real-time logging is immune to this.

## Cloud Backup

Your bet log must be backed up automatically (Google Sheets with Google account backup, or Excel with OneDrive/Dropbox sync). A corrupted spreadsheet representing 18 months of data is not recoverable from memory. The backup is insurance against catastrophic data loss.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Closing Line Value: The Gold Standard Metric', 'closing-line-value-gold-standard',
'## What Is Closing Line Value?

Closing Line Value (CLV) measures whether the price you took was better or worse than the final closing price at a sharp reference bookmaker (Pinnacle is the standard).

CLV = (1/Your odds) − (1/Pinnacle closing odds)

Expressed as a percentage of stake:
CLV % = (Pinnacle closing price / Your price − 1) × 100

**Example:**
You bet at 2.50. Pinnacle closes at 2.20.
CLV % = (2.50/2.20 − 1) × 100 = (1.136 − 1) × 100 = +13.6%

You took significantly better odds than the closing price — positive CLV.

## Why CLV Is the Best Edge Indicator

Results in a small sample are dominated by variance. A 60-bet winning run can occur with zero edge; a 40-bet losing run can occur with real edge.

CLV is not subject to result variance. If you consistently beat the closing line, you have genuine edge — regardless of short-term results. If you consistently fail to beat the closing line, you do not have edge — regardless of short-term winning runs.

Research by academic and professional bettors has confirmed: positive average CLV is the most reliable predictor of long-run profitability.

## Tracking CLV Systematically

For every bet placed: record the Pinnacle closing price at kickoff. Calculate CLV immediately after the event.

Track rolling average CLV over:
- Last 50 bets (short-term signal)
- Last 200 bets (medium-term validation)
- All-time (the definitive measure)

Target: average CLV > 2% (after Pinnacle''s 2% margin, this represents a real edge of approximately 0–2% net of margin).',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Performance Metrics That Actually Matter', 'performance-metrics-that-matter',
'## Beyond Win Rate

Win rate (percentage of bets won) is the metric most bettors focus on. It is also one of the least informative.

A bettor who bets exclusively at 2.00 odds needs a 50% win rate to break even. A bettor who bets exclusively at 1.50 odds needs 66.7% to break even. Win rate means nothing without the context of average odds.

## The Metrics That Matter

**1. ROI (Return on Investment)**
ROI = Total profit / Total staked × 100

The primary measure of selection profitability. Positive ROI means you are extracting value. The higher the ROI over a larger sample, the more convincing the evidence of genuine edge.

**2. Average CLV**
The predictive indicator. If average CLV is positive: you have edge. If negative: you do not, regardless of ROI.

**3. ROI by Market Type**
Break down ROI by sport, league, and market. An overall 3% ROI may hide a 7% ROI in football AH and −1% ROI in football 1X2. The breakdown reveals where to concentrate and where to stop.

**4. Maximum Drawdown**
The largest peak-to-trough unit loss in your history. Measures the worst run you have experienced. Compare to your simulated expected maximum drawdown to assess whether your risk model was realistic.

**5. Yield per 100 Bets**
Total unit profit / (Total bets / 100). Normalises profitability across different bet frequencies. Comparable across bettors regardless of volume.

## Vanity Metrics to Stop Tracking

- Number of winners (meaningless without odds context)
- Total monetary profit without stake context (meaningless without bankroll size)
- "Hit rate" on high-confidence selections (too small a sample for significance)

## The Dashboard Habit

Build a spreadsheet dashboard that calculates all five key metrics automatically from your bet log. Review it weekly. The numbers tell you what your memory cannot.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Structuring Your Betting Day', 'structuring-your-betting-day',
'## Time as a Competitive Resource

Disciplined bettors treat time as a finite, precious resource. The hours available for analysis, bet monitoring, and review must be allocated deliberately to the activities that produce the most value.

## The High-Value Activities

**Model runs and analysis (highest value):**
Running your selection model, comparing output to available market prices, identifying value bets. This is where edge is created.

**Record-keeping and CLV review (high value):**
Logging bets, recording closing prices, updating the performance dashboard. This is where learning occurs.

**Account management (medium value):**
Balance monitoring, float management, withdrawal processing. Operationally necessary but creates no edge.

**Watching events (variable value):**
Watching a match you have bet on creates emotional investment but rarely produces actionable insight. Watching for live betting analysis is high-value; watching to "support" your selection is zero-value and potentially harmful.

## A Structured Betting Day Schedule

**Morning (30–45 min):**
- Check overnight results and update the bet log
- Log any closing prices from overnight events
- Review the day''s fixture list for your target leagues
- Run the model on today''s qualifying fixtures

**Afternoon (20–30 min):**
- Compare model output to opened market prices
- Identify value selections, calculate stakes
- Place bets for evening fixtures

**Evening (20–30 min):**
- Monitor for significant line movement on placed bets (not anxious watching — analytical)
- Check confirmed lineups and adjust if needed
- After events: log results

**Weekly (1–2 hours):**
- Full performance dashboard review
- Closing price record for all weekly bets (CLV calculation)
- Account balance reconciliation

## The Time-Limited Bettor

For part-time bettors with 5–10 hours per week: allocate 50% to analysis, 30% to review, 20% to operations. Quality of analysis matters more than volume of bets.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Handling Losing Runs With Discipline', 'handling-losing-runs-discipline',
'## The Inevitability of Losing Runs

Every bettor who has ever placed enough bets has experienced a losing run. Losing runs are not evidence of a broken system — they are a mathematical certainty of betting with variance.

At a 55% win rate on even-money bets, the expected probability of experiencing a 10-loss streak in 500 bets is approximately 8%. In 1,000 bets: 16%. Losing runs are inevitable.

## The Psychological Response Pattern

Most bettors who lack disciplined processes respond to losing runs with one of three counterproductive patterns:

**Pattern 1 — Escalation:** Increase stakes to recover faster. This amplifies variance and accelerates potential ruin.

**Pattern 2 — Abandonment:** Stop betting entirely, convinced the system is broken. This may forfeit future profitable bets.

**Pattern 3 — Scope creep:** Start betting on different markets, sports, or strategies — convinced something must be working somewhere. This replaces a validated approach with unvalidated speculation.

## The Disciplined Response

**Step 1 — Check the numbers:**
Is this losing run within the expected variance range for your strategy? Simulate 10,000 seasons with your historical win rate and variance. What was the worst 20-bet run in those simulations? If your current run is within this range: variance, not failure.

**Step 2 — Check the CLV:**
Is your CLV still positive during this losing run? If yes: the edge is intact. Results will normalise. Continue.

**Step 3 — Check the process:**
Have you changed anything? Different leagues, different stake sizes, different times of day for analysis? If the process is intact and CLV is positive: do nothing.

**Step 4 — Apply the stop-loss:**
If CLV has also gone negative and the run exceeds your stop-loss threshold: pause, conduct a full process review, and resume only if the review identifies and corrects a specific process failure.

## The Written Commitment

Write your response to a losing run in advance, before it happens. Commit to the specific steps above. When the losing run arrives (it will), follow the written plan. Do not make new decisions under emotional pressure.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Monthly Review Ritual', 'monthly-review-ritual',
'## Why Monthly Reviews Are Not Optional

The monthly review is the mechanism that converts raw betting data into actionable improvement. Without it, you are accumulating data without learning from it.

The review is also a psychological anchor: it provides structured reflection that prevents both excessive optimism (after winning months) and excessive pessimism (after losing months).

## The Complete Monthly Review Checklist

**Performance metrics:**
- Total bets placed
- Units staked
- Units profit/loss
- ROI (this month and all-time)
- Average CLV (this month and all-time)
- Maximum drawdown (this month and all-time)

**Market breakdown:**
- ROI by sport / league / market type
- Which market contributed most value?
- Which market produced negative ROI? (Is this variance or systematic underperformance?)

**CLV analysis:**
- Average CLV by market type
- Any market with consistently negative CLV → action required
- Line movement analysis: are your prices consistently moving against you after placement?

**Process review:**
- Did you stay within your defined market scope?
- Were stop-loss rules followed?
- Were stake sizes within Kelly guidelines?
- Any process deviations? (Documented reasons?)

**Account status:**
- Account balances vs targets
- Any accounts restricted or closed?
- Float management: accounts adequately funded?

**Action items for next month:**
- Specific improvements identified
- Markets to expand, reduce, or exit
- Model updates required

## The Written Record

Write the monthly review in a running document (not just a mental note). Monthly review records accumulate into a full operational history — invaluable for identifying slow-developing trends and for maintaining momentum during low-activity periods.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Accountability Systems and External Discipline', 'accountability-systems-external',
'## Why Self-Discipline Has Limits

Self-discipline is finite. Under stress, fatigue, or emotional pressure, self-imposed rules are the first to bend. External accountability systems are far more robust than internal commitments alone.

## Types of External Accountability

**The accountability partner:**
A trusted person (ideally another serious bettor, or a financially sophisticated friend) who receives your weekly performance update and reviews your monthly report. The requirement to present your data to another person strengthens the commitment to accurate recording and process discipline.

**The betting community:**
Online communities of analytical bettors (not tipster-follower communities) provide peer accountability through shared norms. When the community values CLV over results, you internalise this value more effectively than reading about it in isolation.

**The audit trail:**
A complete, timestamped bet log that could be reviewed by an independent party serves as implicit accountability. Knowing that every bet is permanently recorded prevents the selective recall that undermines self-assessment.

**The coach/mentor:**
An experienced bettor who periodically reviews your approach, challenges your assumptions, and provides external perspective. This is the most powerful and the hardest to find.

## Building Your Accountability System

1. Choose one accountability partner who agrees to monthly reviews of your performance data
2. Share the performance dashboard (not individual bet details if preferred) at the end of each month
3. Agree that the partner can ask any question about any decision without it being perceived as criticism
4. Return the favour — provide accountability for their process as well

## The Minimum Viable Accountability

If no accountability partner is available: publish your monthly performance data publicly (Reddit, a private blog, a betting forum). The commitment to public reporting enforces the same discipline as direct accountability.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Discipline: The Professional Mindset', 'expert-discipline-professional-mindset',
'## The Discipline of the Elite

At the expert level, discipline is not experienced as willpower. It is not the effortful resistance of temptation. It is the natural expression of a professional identity and a deeply internalised process.

This transformation — from willpower-based discipline to identity-based discipline — is the central developmental task of the professional bettor.

## The Identity Shift

Beginner: "I am trying to be disciplined about betting."
Intermediate: "I follow my betting system because it works."
Advanced: "My process is what I do. Deviating from it would feel wrong."
Expert: "I am a process manager. The process is my identity, not the outcomes."

At the expert level, deviating from the process (placing an unmodelled bet, changing stakes emotionally, skipping the bet log) feels like a professional failing — the same way a surgeon who skips the pre-operative checklist feels professional discomfort, not just personal guilt.

## The Record as Professional Asset

An expert bettor''s bet log is not a spreadsheet. It is a professional record — the equivalent of a trader''s blotter, a physician''s patient notes, a lawyer''s case file. It is maintained with professional care because it represents the intellectual and operational history of the enterprise.

5 years of complete, accurate records constitute an asset that cannot be replicated quickly. It takes discipline to build; once built, it is irreplaceable.

## The Continuous Improvement Mindset

Expert discipline includes continuous improvement: not accepting the current process as final, but constantly asking what could be better. Monthly reviews are not just accountability — they are the engine of incremental improvement. Each month''s review produces one or two specific hypotheses to test; each quarter''s calibration review validates or refutes them.

This improvement mindset is sustainable because it is based on curiosity, not self-criticism. The question is not "why am I failing?" but "how can this be better?"

## The Long-Run Perspective

The expert bettor operates on a time horizon of years, not weeks. A bad month is one data point in a multi-year record. A good month is also just one data point. The trend — the direction of the rolling average CLV, the direction of the model calibration, the direction of the account portfolio health — is what matters.

This long-run perspective is the final expression of professional discipline: the ability to act on the trend while remaining genuinely unconcerned with the individual data points.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'discipline-and-record-keeping' AND cat.slug = 'betting-psychology';
