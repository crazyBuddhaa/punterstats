-- ============================================================
-- PunterStat — Betting Academy: Bankroll Management New Modules
-- Migration 023: Add 4 new modules (10 lessons each)
--   Module 3: Risk Management & Ruin Theory   (intermediate)
--   Module 4: Psychology of Stake Sizing      (intermediate)
--   Module 5: Portfolio Bankroll Allocation   (advanced)
--   Module 6: Professional Bankroll Ops       (expert)
-- ============================================================

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Risk Management & Ruin Theory', 'risk-management-ruin-theory',
  'The mathematics of risk of ruin, drawdown limits, and how to calculate the stake sizes that keep your operation sustainable.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'bankroll-management';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Psychology of Stake Sizing', 'psychology-of-stake-sizing',
  'Why humans systematically over-bet, how emotional states affect stake decisions, and the behavioural disciplines that keep staking rational.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'bankroll-management';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Portfolio Bankroll Allocation', 'portfolio-bankroll-allocation',
  'How to allocate a single bankroll across multiple sports, markets, and strategies — with risk limits, correlation management, and rebalancing rules.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'bankroll-management';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Professional Bankroll Operations', 'professional-bankroll-operations',
  'Running a bankroll as a professional business — investor capital, syndicate structures, reporting, auditing, and scaling beyond individual limits.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'bankroll-management';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Risk Management & Ruin Theory               ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Understanding Risk of Ruin', 'understanding-risk-of-ruin',
'## The Ultimate Bankroll Management Question

Risk of ruin (RoR) is the probability that your bankroll reaches zero before your edge can compound into profit. It is the single most important number in bankroll management — and most bettors have never calculated it.

## The Formula

For a simplified binary model (win/loss at fixed odds):

RoR = ((1 - edge/variance) / (1 + edge/variance)) ^ (Bankroll / Stake)

Where edge = expected value per unit staked.

## An Intuitive Understanding

Risk of ruin depends on three variables:
1. **Edge:** Higher edge → lower RoR
2. **Stake size:** Larger stakes relative to bankroll → higher RoR
3. **Bankroll size:** Larger bankroll → lower RoR

If you have positive edge and bet 1% of bankroll per bet, ruin is nearly impossible. If you bet 10% of bankroll per bet, ruin is likely even with moderate edge.

## Calculating RoR for Your Operation

At edge = 3%, stake = 1% of bankroll, and conservative variance assumption:
RoR ≈ e^(-2 × 0.03 × 100) = e^(-6) ≈ 0.25%

At stake = 3% of bankroll (same edge):
RoR ≈ e^(-2 × 0.03 × 33) = e^(-2) ≈ 13.5%

Same edge, 3× larger relative stake: RoR increases from 0.25% to 13.5%.

## The Professional Threshold

A professional operation targets RoR below 1%. This means:
- At 3% edge: stake at most 1.5% of bankroll
- At 2% edge: stake at most 1% of bankroll
- At 5% edge: stake at most 2.5% of bankroll

Below these thresholds, your edge will almost certainly compound before ruin. Above them, significant ruin probability persists.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Maximum Drawdown and Bankroll Reserve', 'max-drawdown-bankroll-reserve',
'## Drawdown vs Ruin

Risk of ruin is the ultimate disaster — bankroll → 0. But there is a lesser disaster that stops most bettors before reaching zero: a drawdown large enough to cause psychological or financial abandonment of the strategy.

## The Expected Maximum Drawdown

For a given staking strategy, the expected maximum drawdown over N bets is approximately:

E[Max Drawdown] ≈ 2 × σ_per_bet × √N × (some constant depending on distribution)

A simplified version: E[Max Drawdown] ≈ 2 × stake × √N at 50% win probability.

For 500 bets at £25 stake:
E[Max Drawdown] ≈ 2 × £25 × √500 ≈ 2 × £25 × 22.4 ≈ £1,120

This means you should expect to experience a drawdown of roughly £1,120 at some point during 500 bets, even with genuine positive edge.

## The Bankroll Reserve Principle

Your operational bankroll (available for betting) should be separate from a reserve that is never staked. The reserve absorbs the expected maximum drawdown while the operational bankroll continues running.

Conservative split: 70% operational, 30% reserve.

At total bankroll £2,000: £1,400 operational, £600 reserve.
If operational bankroll drops to £800: top up to £1,400 from reserve. This prevents forced stake reduction from temporary variance.

## The Reserve Replenishment Rule

After topping up from reserve, do not restore the reserve until the operational bankroll has recovered to its previous peak. The reserve should only be consumed by variance, not replenished through further downside.

## The Reserve as Psychological Insurance

Knowing you have a reserve eliminates one category of fear during downswings — the fear that this run will bankrupt you. This psychological benefit makes the reserve worthwhile even if you never need to use it.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Edge Uncertainty and Risk Adjustment', 'edge-uncertainty-risk-adjustment',
'## The Problem of Uncertain Edge

The Kelly Criterion and ruin theory assume you know your edge precisely. In practice, you have an estimate of your edge — and that estimate has uncertainty. This uncertainty is often ignored, with significant consequences.

## Why Edge Uncertainty Matters

Suppose your last 300 bets show 3.5% ROI. Your 95% confidence interval:
Standard error ≈ σ_bet / √n

With typical variance, SE ≈ 3%. So your 95% CI is 3.5% ± 6% = [−2.5%, 9.5%].

Your edge could plausibly be negative. If you stake at Kelly for 3.5% edge but your true edge is 0%, you are betting positive Kelly with zero edge — equivalent to betting at random with declining bankroll.

## The Conservative Response: Shrink the Estimate

A common approach: use 50–70% of your estimated edge in all staking calculations.

At 3.5% estimated ROI: use 1.75–2.45% in staking calculations.

This conservative adjustment builds in a margin for estimation error. If your true edge is better than expected, the stake was slightly sub-optimal. If your edge was overestimated, the conservative stake prevents disaster.

## The Bayesian Update Approach

Formally, combine your prior (pre-season belief about edge) with the evidence from your actual results:

Posterior edge = (Prior edge × Prior weight + Observed edge × Data weight) / Total weight

Early in the season, prior dominates. After 500 bets, data dominates. This approach naturally prevents over-staking on unvalidated edge estimates.

## The Sample Size Rule

Until you have 300+ bets: use flat 1% staking, not Kelly. The edge estimate is too uncertain to justify Kelly-based variable staking. After 300 bets with consistent positive CLV: introduce fractional Kelly gradually.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Diversification and Risk Correlation', 'diversification-risk-correlation',
'## How Correlation Affects Portfolio Risk

In a portfolio of independent bets, each bet''s variance is additive. In a portfolio of correlated bets, the effective combined variance is higher than the sum of individual variances.

## When Bets Are Correlated

- **Same event, multiple markets:** Backing Team A to win + Over 2.5 goals in the same match. These are positively correlated — if A wins big, both likely win.
- **Same league, same round:** Backing all home teams in a round of fixtures. If there is a league-wide unusual result pattern (extreme weather, refereeing tendency), all bets move together.
- **Same model inputs:** If all your bets use the same xG model and that model has a systematic bias, all bets are affected the same way.

## Quantifying Correlation Impact

For two bets with equal variance V and correlation ρ:
Portfolio variance = 2V + 2ρV = 2V(1 + ρ)

At ρ = 0 (independent): Portfolio variance = 2V → σ_portfolio = √2 × σ_single
At ρ = 0.5 (moderate positive correlation): Portfolio variance = 3V → σ_portfolio = √3 × σ_single

A 0.5 correlation between two bets increases portfolio risk by 22% relative to independent bets.

## The Practical Diversification Target

- No single event: maximum 3% total exposure
- No single league on a single match day: maximum 8% total exposure
- No single model bias: spread modelling approaches across sports and methods

## The Uncorrelated Ideal

The most valuable diversification is across genuinely uncorrelated sports and time periods. Football bets on Saturday are uncorrelated with basketball bets on Sunday — different sports, different teams, different models.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Scenario Planning: Stress Testing Your Bankroll', 'scenario-planning-stress-testing',
'## Beyond Expected Value

Bankroll management that only considers expected value and standard variance is incomplete. Rare but real scenarios — model failure, major market shift, simultaneous bad variance across correlated markets — require specific planning.

## The Three Stress Test Scenarios

**Scenario 1: Extended variance (the unlucky run)**
Your edge is real but variance delivers a 30-unit losing run. How does your bankroll and staking respond? What is the psychological and financial impact?

Pre-calculation: If you stake 1.5% and experience 30 consecutive losses (each loses 1 unit), total loss = 30 × 1.5% of initial bankroll. At £2,000 bankroll: 30 × £30 (approximately, given proportional staking) ≈ £780 loss. Bankroll drops to ~£1,220. Remaining operational capacity: 61% of initial. Can you continue? Yes, if stop-loss is set at 50%.

**Scenario 2: Edge erosion (the model fails)**
Your CLV drops to zero or negative over 6 months. When do you notice? What is your trigger to stop? How much do you lose before stopping?

Pre-calculation: If CLV erodes to 0% from 3%, and you are betting 1.5% per bet with 300 bets remaining before your next review: expected additional loss = 300 × stake × 0% = £0 (breakeven). But if edge goes negative (−2%), loss = 300 × stake × 0.02 = meaningful. Monthly reviews prevent this from accumulating.

**Scenario 3: Market access restriction cascade**
Your top 3 bookmakers restrict your account simultaneously. Your betting capacity drops by 40%. How do you continue operating?

Pre-planning: always maintain 3+ untouched fallback accounts. Never deploy full capacity to a single bookmaker.

## Running the Stress Tests Annually

Before each season: write out responses to each scenario in your bankroll plan. The written plan is your decision-making guide when the scenario occurs — not an ad hoc response under pressure.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Ruin Recovery: Rebuilding After Catastrophic Loss', 'ruin-recovery-rebuilding',
'## When the Worst Happens

Despite best practices, catastrophic losses occur. A catastrophic loss is a drawdown large enough to require fundamental reassessment — typically 50%+ of the original bankroll.

## Causes of Catastrophic Loss

1. **Edge failure:** The edge was less real than estimated, and the loss ran longer than expected before the stop-loss triggered
2. **Discipline failure:** Stop-loss rules were violated, leading to revenge betting and accelerating losses
3. **External event:** A sudden change in market access, rule change, or personal circumstance forced premature liquidation

## The Post-Catastrophe Assessment

Before rebuilding, conduct an honest post-mortem:
- Was the loss within the modelled variance range? (If yes: variance, not failure. Rebuild.)
- Was there a genuine model or process error? (Identify and fix before rebuilding.)
- Were stop-loss rules violated? (Address the psychological discipline issue first.)

Rebuilding before fixing the root cause will produce the same result.

## The Conservative Rebuild Protocol

Start fresh with a smaller bankroll and conservative staking:
- New bankroll: 30–50% of original peak (from savings, not emergency funds)
- Staking: flat 0.75% per bet for the first 3 months (lower than normal)
- Bet selection: only your most validated market type (your best-performing historical market)
- No variable staking until new 200-bet CLV shows positive results

## The Psychological Challenge

Rebuilding after catastrophic loss requires confronting the exact situations that caused the loss — and responding differently. This is one of the most psychologically demanding challenges in betting. External support (accountability partner, peer group) is often necessary.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Variance Reduction Techniques', 'variance-reduction-techniques',
'## Reducing Variance Without Reducing Edge

Variance is not the enemy per se — but unnecessary variance is. Any technique that reduces variance without proportionally reducing expected value improves risk-adjusted returns.

## Technique 1: Market Selection

Different markets have different variance profiles for the same edge. Asian Handicap at 1.91/1.91 has lower variance than a correct score bet at 10.00, even if both have the same EV%.

Concentrating in low-variance markets reduces portfolio volatility while maintaining edge. Practitioners in AH and totals markets experience smoother equity curves than practitioners in longshot markets.

## Technique 2: Bet Frequency and Timing Distribution

Spreading bets evenly across the week (not concentrating on Saturday only) reduces weekly P&L variance. Each day''s results are partially independent — diversifying across time reduces the amplitude of weekly swings.

## Technique 3: Rounding Down Stakes

When your Kelly calculation gives 1.3%, round down to 1.0% rather than rounding to the nearest 0.5%. Consistently rounding down leaves a small buffer below Kelly — reducing variance slightly at the cost of a marginal reduction in expected growth.

## Technique 4: Avoiding High-Variance Specials

Any bet with very high variance (>100× bankroll potential payout) introduces catastrophic tail risk. Even with theoretical positive EV, the variance makes these unsuitable for systematic bankroll management.

## Technique 5: Partial Hedging

Using exchanges to partially hedge in-play positions — locking in partial profit before the event concludes — trades maximum expected value for reduced variance. Appropriate when your current edge has been extracted and remaining uncertainty is high.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Risk Management Policy Document', 'risk-management-policy-document',
'## Writing Your Risk Management Policy

A risk management policy is a written document that defines your rules for bankroll management, stop-losses, stake sizing, and risk review. Writing it down commits you to it; sharing it with an accountability partner enforces it.

## Essential Sections

**1. Bankroll Definition**
- Total bankroll: £X
- Operational allocation: Y%
- Reserve: Z%
- Minimum bankroll to continue operating: £M

**2. Staking Rules**
- Staking method: (flat / percentage / fractional Kelly)
- Standard stake: N% of operational bankroll
- Maximum stake per bet: N%
- Maximum correlated exposure per event: N%
- Market-specific caps: (list by market type)

**3. Stop-Loss Rules**
- Session stop-loss: −X units
- Weekly stop-loss: −Y units
- Drawdown stop-loss: −Z units from peak
- Response on trigger: (pause, review, resume procedure)

**4. Review Schedule**
- Weekly: balance reconciliation
- Monthly: performance review
- Quarterly: model calibration, edge validation
- Annual: full strategy review, policy update

**5. Account Management**
- Number of active accounts maintained: N+
- Float distribution target: X% per account
- Restriction protocol: defined responses to account restrictions

## The Living Document

The policy is not set once and forgotten. Review it at each quarterly meeting. Update it when market conditions, edge estimates, or personal circumstances change.

A policy that reflects current reality is useful. One that reflects outdated assumptions is worse than having no policy.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Insurance and Hedging Strategies', 'insurance-hedging-strategies',
'## Managing Specific Risk Events

Some risks can be partially mitigated through deliberate hedging — using an opposing bet or position to limit downside on an existing exposure.

## Outright Hedging

You backed a team at 8.00 to win the league. Midway through the season they are priced at 2.50. You can lock in profit by laying them on an exchange — regardless of the final outcome, you secure a return.

**When to hedge an outright:**
- The team''s actual probability has increased beyond your original estimate (the bet has generated value you can crystallise)
- A key player injury or management change significantly reduces the team''s true probability going forward
- You need the capital deployed in this outright for higher-EV current opportunities

**When not to hedge:**
- Simply because you are nervous (not a legitimate risk management reason)
- Because the team had a bad week but your long-term assessment is unchanged

## Match-Specific Hedging

If a combination of bets creates a scenario where one specific outcome causes excessive loss — for example, an accumulator that would result in £500 loss if one specific outcome occurred — a targeted hedge on that outcome (via exchange lay) limits the worst case.

## The Cost of Insurance

Every hedge costs money. The lay on the exchange costs commission. The cross-market hedge reduces expected value by the amount of the hedge''s negative EV.

Effective hedging is only worthwhile when:
1. The risk being hedged is genuinely beyond normal variance expectations
2. The cost of the hedge is lower than the value of the risk reduction

Hedging for emotional comfort (to stop worrying) is rarely worth the cost.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Risk Framework: Integrated Risk Management', 'expert-integrated-risk-framework',
'## The Complete Risk Picture

Expert bankroll risk management integrates ruin theory, drawdown limits, edge uncertainty, correlation management, and scenario planning into a single unified framework.

## The Risk Hierarchy

**Level 1 — Catastrophic risk (must prevent):**
Probability of ruin (bankroll → 0 or below minimum operation size). Target: < 0.5%.
Control: appropriate stake sizing relative to edge and bankroll.

**Level 2 — Serious risk (must manage):**
Large drawdown that causes psychological abandonment of the strategy. Target: < 5% probability of drawdown > 35%.
Control: stop-loss rules, reserve bankroll, regular review.

**Level 3 — Normal risk (must tolerate):**
Monthly P&L variance within expected bounds. This is variance, not risk in the control sense.
Response: pre-acceptance, no action required.

## The Risk Dashboard

Monthly metrics to review:
- Current drawdown from peak (in units and %)
- Probability of drawdown exceeding stop-loss threshold (run from your variance model)
- Days of reserve remaining at current loss rate
- Number of active accounts vs minimum required for full deployment
- Rolling CLV (leading indicator of edge health)

## The Feedback Loop

The risk framework generates alerts → alerts trigger reviews → reviews generate decisions (continue / adjust / stop) → decisions are logged and compared to outcomes.

Over years of operation, this feedback loop produces a refined, personalised risk framework that is calibrated to your specific edge distribution, betting volume, and psychological tolerance.

## The Core Insight

Risk management in betting is not about avoiding risk. You cannot extract positive expected value without accepting variance. Risk management is about taking only the risks you are compensated for (variance around your edge) and eliminating the risks you are not compensated for (excess variance from over-staking, correlation concentration, or model uncertainty).

The professional risk manager accepts variance and rejects ruin.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'risk-management-ruin-theory' AND cat.slug = 'bankroll-management';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — Psychology of Stake Sizing                  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Why Humans Are Bad at Stake Sizing', 'why-humans-bad-at-stake-sizing',
'## The Behavioural Economics of Staking

Stake sizing should be a mathematical exercise: edge, odds, bankroll → optimal stake. In practice, human psychology systematically distorts this calculation in predictable ways.

## Distortion 1: Loss Aversion Increasing Stakes

After a losing run, the emotional drive to "get back" causes bettors to increase stakes. This is the opposite of what Kelly recommends (smaller stakes after losing, as bankroll shrinks). The psychological response worsens the situation by adding additional financial risk.

## Distortion 2: Overconfidence Scaling

Bettors increase stakes on selections they feel most confident about — even when that confidence is not backed by a better probability estimate. "This is a certainty" leads to 3× normal stakes on a bet that, analytically, may have no more edge than a 1× stake bet.

## Distortion 3: Hot Hand Fallacy

After a winning run, many bettors increase stakes, believing they are "in form." In reality, a winning run provides no information about future outcomes if the underlying edge is constant. Hot-hand thinking inflates stakes precisely when the risk of a normalising run is highest.

## Distortion 4: The Small Stake Illusion

Very small stakes relative to bankroll (0.1% or less) feel "safe" and lead bettors to place too many bets without rigorous analysis. The logic: "It''s only £2, who cares?" The cumulative effect of many such bets — each with negative EV — is a consistent drain on the bankroll.

## The Solution: Pre-Commitment

The most effective behavioural protection is pre-committing to a staking strategy before the betting session begins. Write the stake for each planned bet before the event starts. Do not modify the stake in response to feelings during the session.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Emotional States and Stake Discipline', 'emotional-states-stake-discipline',
'## The State-Dependent Betting Problem

Research on decision-making shows that people in negative emotional states (anxious, frustrated, sad) make different financial decisions than in neutral or positive states — typically more risk-taking and less analytical.

## Identifying Dangerous Emotional States for Bettors

**Tilt (anger/frustration):** After an unexpected loss, particularly if the loss felt unfair (bad beat, late goal). Tilt causes: increased stake size, betting on unfamiliar markets, reduced analysis time.

**Chasing (desperation):** After multiple losses, the urgency to recoup creates desperation. Chasing causes: placing bets outside your normal market, staking above your normal limit, reducing your analytical standards.

**Euphoria (overconfidence):** After a winning run, euphoria creates the feeling of invincibility. Euphoria causes: oversizing positions, betting on markets where you have less edge.

**Fear (anxiety):** Before a large bet or during a significant drawdown, anxiety causes stake under-sizing, premature cash-out, and strategy abandonment.

## Monitoring Your Emotional State

Before each betting session, rate your emotional state on a 1–5 scale (1 = very negative, 5 = very positive). Set a rule: only place bets when rating is 3–5.

If rating is 1–2: log in, open your tracking spreadsheet, review your risk management policy — but place no bets.

## The Physical Signals

Your body signals problematic states: racing heart, shallow breathing, clenched jaw, restless movement. These physical signals indicate elevated arousal — associated with impulsive decision-making. Recognise them and treat them as automatic pause signals.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Pre-Session Ritual', 'pre-session-ritual',
'## Creating a Consistent Betting State

Professional performance environments — surgery, military operations, elite athletics — all use pre-performance rituals to create optimal psychological state before high-stakes tasks. Betting deserves the same approach.

## The Purpose of a Ritual

A ritual:
1. Creates a clear, consistent psychological anchor between "analysis mode" and "betting mode"
2. Allows you to check your emotional state before committing any money
3. Reduces the probability of impulsive opening bets

## A Practical Pre-Session Ritual (15 Minutes)

**Step 1 (2 min):** Review yesterday''s results. Log any pending settlements. Update the cumulative unit tracker.

**Step 2 (3 min):** Check the risk management policy. What are today''s stop-loss limits? What is the current drawdown from peak? Am I within normal operating parameters?

**Step 3 (3 min):** Rate your emotional state. Note any unusual circumstances (stressful day, poor sleep, external pressure). Proceed only if rating ≥ 3.

**Step 4 (5 min):** Review your planned bets for today (already identified in your pre-match analysis). Confirm stakes are pre-set. No new bets added in this session without a pre-existing analysis.

**Step 5 (2 min):** Confirm account balances. Are floats at appropriate levels? Are all platforms accessible?

## The Session Boundary

Define a clear end to each betting session. Do not leave browsers open on live markets indefinitely. Once your planned bets are placed, close the bookmaker tabs. Open markets create decision-making temptation.

## The Post-Session Debrief

A 5-minute post-session log: what bets were placed, how you felt during the session, and whether you deviated from any planned stakes. This debrief is the feedback mechanism for improving the ritual over time.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Cognitive Biases in Stake Decisions', 'cognitive-biases-stake-decisions',
'## The Biases That Attack Staking Specifically

Many cognitive biases affect selection analysis (discussed in the Betting Psychology topic). A subset of biases specifically distort stake sizing decisions — often in ways that selection biases do not.

## Denomination Effect

The denomination effect: people treat larger nominal amounts more carefully than smaller ones, even when the relative value is identical.

For bettors: a £100 stake feels significant; ten £10 bets feel trivial. The cognitive cost of each £10 decision is lower than a single £100 decision — but the total exposure is identical. This can lead to under-analysis of small bets and proliferation of low-quality small bets.

**Correction:** Evaluate every bet by its expected cost (EV amount), not its nominal stake size.

## Sunk Cost in Betting

Once money is staked, it is gone (win or lose). The sunk cost fallacy treats existing losses as a reason to bet more (to recover). The right framework: each new bet is evaluated from zero — what is the EV of this specific bet, independent of all previous results?

## Availability Heuristic in Staking

Bettors remember large wins at high stakes more vividly than consistent small wins at normal stakes. This availability makes high stakes feel "worth it" — even when the expected value of the high-stake bet does not justify the increase.

**Correction:** Base staking decisions entirely on the Kelly calculation. Vivid memories of large wins are irrelevant.

## Mental Accounting in Betting

Treating "house money" (from recent winnings) differently from "original bankroll" money is a dangerous cognitive error. All money in your bankroll is equal — whether won recently or deposited originally. A bet with 2% of house money has identical risk to 2% of original capital.

**Correction:** Track total bankroll as one number. Never create mental sub-accounts of "winnings" vs "deposits."',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building Stake Discipline Through Systems', 'stake-discipline-through-systems',
'## The Environment Design Principle

The most effective approach to stake discipline is not willpower — it is environment design. Structure your betting environment so that the disciplined action is the easy action and the impulsive action is the hard one.

## System 1: Pre-Calculated Stakes

Before any betting session, calculate the stake for every planned bet using your staking formula. Enter the stake amount into a spreadsheet. When placing the bet, copy the pre-calculated stake — do not recalculate in the heat of the moment.

## System 2: Stake Input Lock

Set up your bookmaker app with standard stakes pre-filled. When the temptation to enter a different amount arises, the friction of changing a pre-filled field is a small but real barrier.

## System 3: The Second-Day Rule for Large Bets

Any bet larger than 2× your standard unit requires a 24-hour waiting period between decision and placement. If you still believe the bet is worth the larger stake 24 hours later, place it. If you have reconsidered, be glad you waited.

## System 4: The External Review

Share your planned staking for the week with an accountability partner before the betting week starts. If you want to deviate from the plan during the week, you must communicate the reason to your partner. External accountability dramatically reduces impulsive deviation.

## System 5: Audit Trails

Every bet placed should be logged immediately, with the pre-calculated Kelly stake and the actual stake placed. If these differ, you document the reason. Over time, the audit trail reveals patterns of deviation that inform process improvements.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Psychology of Big Winners and Downswings', 'psychology-big-winners-downswings',
'## The Post-Win Problem

A large winning bet — particularly at long odds — creates a psychological distortion almost as damaging as a large loss. The euphoria of a big win leads to:
- Overconfidence in future selections ("I have a good feel right now")
- Inflated stakes on subsequent bets ("I can afford to bet more because I just won")
- Reduced analytical rigor ("I don''t need to analyse as carefully — I''m running hot")

All three responses are irrational and empirically harmful. A winning bet tells you nothing about your edge on the next bet.

## Implementing a Post-Win Protocol

After any single bet win > 5× your standard unit:
1. Do not place another bet for 24 hours
2. Review your next 5 planned bets with extra scrutiny (challenge every assumption)
3. Confirm stakes are at normal level, not inflated

This protocol is uncomfortable. It feels like leaving money on the table. It also prevents euphoria-driven over-staking that often follows big wins.

## The Downswing Identity Threat

Extended losing runs threaten self-concept. A bettor who defines themselves as "good at this" finds a downswing cognitively threatening — it suggests they may not be as good as they thought. The response to an identity threat is often defensiveness: minimising the significance of the loss, attributing it entirely to bad luck, or doubling down to prove the approach works.

## The Identity Shift

Replace "I am a good bettor" with "I run a good process." Process identity is resilient to losing runs — the process is intact even when results are negative. When results are negative, a process-oriented bettor investigates the process, not the self.

## The Equanimity Target

The mental state that produces the best long-run staking decisions is equanimity — calm acceptance of both wins and losses as variance around the mean, without emotional significance attached to either.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Role of Rules vs Discretion in Staking', 'rules-vs-discretion-staking',
'## The Rules-vs-Discretion Continuum

Staking strategies range from fully rule-based (Kelly calculation: stake = output, no discretion) to fully discretionary (bet whatever feels right). Neither extreme is optimal, but the right balance depends on experience level and emotional regulation.

## The Case for Rules

Rules provide:
- Consistency (same inputs → same stakes, regardless of mood)
- Speed (no deliberation required per bet)
- Accountability (any deviation is visible and documentable)
- Psychological protection (rules pre-commit you when emotions run high)

At early career stages, maximally rule-based staking is strongly preferred. You do not yet have the calibrated intuition to make good discretionary stake decisions.

## The Case for Limited Discretion

Experienced bettors with well-calibrated intuition may have valid reasons to deviate from a strict Kelly calculation:
- News that is not yet in the model warrants a downward stake adjustment
- An unusual sense of uncertainty about a specific event (hard to model but real) warrants a reduction
- A specific account limit means the calculated stake is not accessible at the best price

These are narrow, defensible reasons for discretion. "I feel good about this one" is not.

## The Discretion Budget

Allocate a discretion budget: you are allowed to deviate from the calculated stake on a maximum of 20% of bets, and only in the direction of reducing (not increasing) the stake. Increases require the same second-day waiting rule as large bets.

This prevents unconstrained discretion while allowing legitimate situational adjustments.

## The Long-Run Test

Track every discretionary deviation: what was the Kelly-recommended stake, what you actually staked, and the result. After 200 discretionary deviations, calculate whether your deviations improved or worsened the result vs strict Kelly. If they worsened: reduce your discretion budget. If they improved: your intuition is adding genuine value.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Peer Influence and Stake Discipline', 'peer-influence-stake-discipline',
'## Social Pressure in Betting Communities

Betting is often a social activity. Online communities, tipping services, syndicate groups, and friend networks create social dynamics that can distort individual staking decisions.

## The Following Problem

When a respected tipster or peer posts a large bet, the social impulse is to match or exceed their stake. But their stake is calibrated to their bankroll and their edge estimate — not yours. Blindly matching stakes is a common form of under-thinking stake sizing.

## Peer Pressure to Chase Losses

In betting groups, social proof operates: if everyone is betting more after a bad week, the social norm suggests you should too. Maintaining your standard stakes in a group context where others are "chasing" requires active resistance to peer pressure.

## Using Peers Positively

Peer influence can be structured to support discipline:
- Share your pre-session planned stakes with an accountability partner (not for confirmation, for commitment)
- Create group norms around process: celebrate analytical quality, not winning outcomes
- Debrief downswings collectively with a focus on variance vs process failure

## The Syndicate Staking Challenge

In a formal syndicate (shared bankroll), staking decisions affect all members. Clear, documented staking rules enforced by the group prevent individual members from over-betting the shared bankroll. A designated risk manager who reviews all bet approvals above a certain threshold is a common syndicate control.

## The Selective Transparency Principle

Share your staking approach (the framework, the percentages, the rationale) freely with peers. Do not share individual bet stakes before events unless there is a specific accountability purpose. Sharing specific stakes invites commentary that can weaken your pre-commitment.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Mindfulness and Long-Term Stake Consistency', 'mindfulness-long-term-consistency',
'## The Long Game

Betting edge compounds over years, not weeks. The psychological challenge is maintaining consistent discipline for long enough for the edge to compound — despite the natural human tendency toward impatience, emotional reaction, and short-term focus.

## The Role of Mindfulness

Mindfulness — present-focused, non-judgmental awareness of current state — is a research-supported tool for improving financial decision-making. Applied to betting, mindfulness helps bettors:
- Notice emotional states before they distort staking decisions
- Interrupt the automatic impulse to chase losses
- Tolerate variance without requiring immediate correction

## Simple Mindfulness Practices for Bettors

**The 60-second pause:** Before placing any bet, pause for 60 seconds. Close the browser, breathe normally. Re-open only if you still want to place the bet and the planned stake is unchanged.

**The emotion check:** Ask: "What am I feeling right now?" Name the emotion explicitly. Research shows that labeling an emotion ("I''m feeling frustrated") reduces its unconscious influence on subsequent decisions.

**The worst-case rehearsal:** Before each session, briefly imagine your stop-loss triggering — you lose the maximum you set. Accept this outcome as a known possibility. Starting each session with this rehearsal reduces the shock of actually hitting the stop-loss.

## Consistency Is the Competitive Advantage

The bettor who maintains consistent 1.5% staking through a 25-unit drawdown has a significant advantage over the bettor who increases stakes mid-drawdown or abandons the strategy. The edge compounds only if the process is maintained. Mindfulness and emotional discipline are the mechanisms that enable that maintenance.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Stake Psychology: The Complete Mental Framework', 'expert-stake-psychology',
'## Integrating Psychology and Mathematics

At the expert level, stake sizing psychology and staking mathematics are unified. The goal is a mental state in which the mathematically correct stake is also the emotionally comfortable choice.

## Achieving Psychological-Mathematical Alignment

This alignment develops through three phases:

**Phase 1 — Rule-following:** In early career, follow the Kelly formula mechanically. Do not trust intuition. Build a track record.

**Phase 2 — Internalisation:** After 1,000+ bets, the Kelly framework becomes intuitive. You can estimate the approximate Kelly stake for a given edge and odds range without a calculator. Your emotional responses to bet outcomes diminish — you have seen enough variance to accept it.

**Phase 3 — Integration:** At the expert level, your intuitive sense of a "right" stake aligns with the Kelly calculation most of the time. Rare deviations are flagged immediately because they feel wrong — not because they violate a written rule.

## The Identity of the Process Bettor

The final expert-level shift: you no longer think of yourself as a "winner" or "loser" — you think of yourself as a process manager. Your job is to maintain the process. Outcomes are the domain of probability, not your domain.

This identity shift eliminates most of the psychological pressure that distorts staking: if you are not responsible for outcomes, you cannot be emotionally reactive to them. You are only responsible for the process — and the process is entirely within your control.

## The Test of Integration

You are fully integrated when:
- A 15-unit losing run produces no stake adjustment beyond what Kelly prescribes
- A 20-unit winning run produces no additional stake beyond what Kelly prescribes
- You review your monthly P&L with the same emotional neutrality as reviewing a weather forecast
- Stake sizes are determined in the morning and remain unchanged through the session

This state is achievable. It is not natural — it is built, deliberately, through years of disciplined practice, accurate record-keeping, and the experience of seeing variance resolve correctly.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'psychology-of-stake-sizing' AND cat.slug = 'bankroll-management';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Portfolio Bankroll Allocation               ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Is a Betting Portfolio?', 'what-is-a-betting-portfolio',
'## Thinking in Portfolios

A single bettor who bets on football match winners only has a single-strategy, single-market portfolio. A sophisticated operation may run multiple strategies (match winner, totals, player props), across multiple sports (football, basketball, tennis), in multiple markets (1X2, AH, exchange).

Managing this as a portfolio — rather than as independent unrelated bets — unlocks significant risk management advantages.

## The Portfolio Framework

Define the portfolio as a set of independent strategies. Each strategy has:
- A defined market scope (which bets it covers)
- A validated edge (CLV history)
- A bankroll allocation (% of total)
- Performance metrics tracked separately

## Why Separate Strategies Matter

If all bets are tracked together, you cannot identify which parts of your operation are profitable and which are not. A 3% total ROI could come from:
- Football 1X2: +7% ROI (strong)
- Basketball props: −4% ROI (destroying value)
- Football AH: +1.5% ROI (neutral)

The aggregate masks the problem. Separate tracking reveals it.

## Portfolio vs Single-Strategy Approaches

Single strategy: simpler to run, harder to diversify, higher variance per bet volume.

Portfolio approach: more complex, better diversification, smoother equity curve, clearer performance attribution.

## The Entry Criteria for a Strategy in the Portfolio

A strategy enters the portfolio only when:
1. It has produced positive CLV over 200+ bets (validated edge)
2. It has defined market scope and selection criteria
3. It has appropriate bankroll allocation within the total portfolio risk limits',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Allocating Capital Across Strategies', 'allocating-capital-across-strategies',
'## The Allocation Decision

How much of your total bankroll should each strategy receive? The answer depends on:
1. The strategy''s validated edge (higher edge → more allocation)
2. The strategy''s variance (higher variance → less allocation)
3. The strategy''s correlation with other strategies (lower correlation → more allocation OK)

## The Sharpe Ratio Framework

The Sharpe ratio (EV / standard deviation) measures risk-adjusted return. For betting:

Strategy Sharpe = Expected ROI / Standard deviation of ROI

Allocate proportionally to Sharpe ratio across strategies. A strategy with Sharpe 2.0 receives twice the allocation of a strategy with Sharpe 1.0.

This is the institutional asset allocation framework applied to betting.

## Simplified Allocation Rules

For bettors without full Sharpe ratio calculations:

**Stage 1 — Entry allocation:** New strategies receive 15% of total bankroll until 300 bets validate edge.
**Stage 2 — Proven allocation:** Validated strategies with positive CLV receive 20–35% based on qualitative edge assessment.
**Stage 3 — Core allocation:** Strategies with 1,000+ bets of positive CLV become core allocations (up to 50%).

Maximum in any single strategy: 60% (concentration risk limit).

## The Rebalancing Rule

Review allocations quarterly. Strategies that have produced consistently better results than initial estimates: increase allocation (up to their category maximum). Strategies with deteriorating CLV: reduce allocation or remove.

## Cash Buffer

Always maintain 10–15% of total bankroll as an unallocated cash buffer. This:
- Provides liquidity for rapid deployment on unexpected high-EV opportunities
- Acts as the operational reserve for account float management
- Prevents being "fully deployed" with no response capacity',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Cross-Strategy Risk Management', 'cross-strategy-risk-management',
'## The Portfolio Risk Is Not the Sum of Individual Risks

A portfolio''s total risk (variance) depends on the correlation between strategies. Independent strategies partially offset each other''s variance; correlated strategies amplify each other.

## Measuring Cross-Strategy Correlation

For two strategies A and B, track weekly P&L for 52 weeks. Calculate the Pearson correlation coefficient between the two weekly P&L series.

ρ = Σ(A_i - Ā)(B_i - B̄) / √(Σ(A_i-Ā)² × Σ(B_i-B̄)²)

If ρ > 0.7: strategies are highly correlated (consider reducing combined allocation).
If ρ < 0.3: strategies are largely independent (diversification benefit confirmed).
If ρ < 0: strategies are negatively correlated (very valuable diversification).

## Common Correlation Sources

**High positive correlation:**
- Football 1X2 and Football AH (same matches, similar model inputs)
- NBA props and NBA totals (both driven by game pace/scoring environment)
- Multiple strategies using the same base model

**Low/negative correlation:**
- Football and horse racing (different sports, different models)
- Pre-game and in-play (different information states, different timing)
- Match winner and goalscorer props (partially different driver)

## Portfolio Variance Calculation

Total portfolio variance = Σᵢ wᵢ² σᵢ² + 2 Σᵢ Σⱼ wᵢwⱼ σᵢσⱼρᵢⱼ

Where w = allocation weight, σ = strategy standard deviation, ρ = pairwise correlation.

Run this calculation quarterly. If total portfolio variance is higher than the variance of your best single strategy (which would indicate negative diversification due to positive correlations), reallocate toward less correlated strategies.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Seasonal and Calendar Bankroll Planning', 'seasonal-calendar-bankroll',
'## Betting Volume Is Not Constant

Sports seasons are not uniform. Football betting volume peaks September–May; drops sharply in June–August (off-season). Basketball peaks October–June. Tennis majors create concentrated high-volume periods four times per year.

## The Seasonal Liquidity Problem

If 80% of your betting occurs September–May and you withdraw profits monthly, your bankroll fluctuates significantly across the year. Planning for this prevents:
- Insufficient capital during peak season (if too much was withdrawn in summer)
- Idle capital during off-season (opportunity cost)

## The Annual Planning Cycle

**August (pre-season):**
- Set annual bankroll plan
- Adjust strategy allocations based on last season''s performance
- Open any new accounts needed for the coming season
- Replenish bankroll from reserves if required

**November (mid-cycle check):**
- Review all strategy CLV
- Rebalance allocations if any strategy is significantly over/under performing
- Review account health

**January (half-year review):**
- Full performance review
- Model calibration test
- Update bankroll size and per-strategy allocations

**May (end of season):**
- Full annual review
- Withdraw planned profit (per withdrawal policy)
- Archive season records
- Plan summer strategy (reduce activity or shift to different sports)

## Off-Season Capital Deployment

During primary sport off-seasons:
- Maintain exchange position (exchange liquidity benefits from continuous volume)
- Shift allocation toward in-season sports (tennis, cricket, American sports)
- Consider matched betting for off-season capital deployment (promotional value extraction without prediction requirement)',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Monitoring Portfolio Health Metrics', 'portfolio-health-metrics',
'## The Portfolio Dashboard

A portfolio-level bankroll requires portfolio-level monitoring. Individual strategy tracking is necessary but not sufficient — you need a holistic view of the entire operation.

## Key Portfolio Health Metrics

**1. Total portfolio ROI (rolling 90 days)**
The primary performance metric. Compare to your long-run target and to the previous quarter.

**2. Portfolio Sharpe ratio (rolling 90 days)**
ROI / standard deviation of weekly P&L. Measures risk-adjusted performance. Should exceed 1.0 for a well-managed operation.

**3. Weighted average CLV across all strategies**
The most forward-looking indicator. Negative CLV in aggregate is a warning signal regardless of current P&L.

**4. Strategy-level CLV decomposition**
Which strategies are producing positive CLV? Which are not? This identifies where to reallocate and where to cut.

**5. Correlation heatmap (quarterly)**
How correlated are your strategies currently? Has correlation increased (reducing diversification benefit)?

**6. Account health distribution**
How many accounts are fully open / stake-limited / closed? Is your capacity declining?

## The Early Warning System

Set thresholds for each metric that trigger automatic review:
- Portfolio ROI below target for 3 consecutive months → strategy review
- Any individual strategy CLV negative for 60 consecutive days → allocation reduction
- Total active accounts below 6 → emergency account opening priority
- Portfolio Sharpe below 0.5 → risk review

## Automated Monitoring

A Google Sheets dashboard with formulas that automatically calculate all portfolio metrics from the bet log is achievable in a few hours of setup. The investment repays itself immediately in clarity and early warning capability.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Rebalancing: When and How to Adjust Allocations', 'rebalancing-allocations',
'## Why Rebalancing Is Necessary

Portfolio allocations drift over time. A strategy that produced exceptional results will have grown its bankroll allocation beyond its initial weight. A strategy with a bad period will have shrunk below its target. Without rebalancing, the portfolio gradually concentrates in whichever strategies have been recently profitable — not necessarily the best forward-looking allocation.

## The Trigger-Based Approach

Rebalance when an allocation drifts beyond a defined threshold:
- Target allocation: 25%. Rebalance bands: ±10%. Rebalance when actual allocation exceeds 35% or drops below 15%.

This avoids constant rebalancing (transaction costs in time and margin) while preventing excessive drift.

## The Calendar-Based Approach

Rebalance quarterly regardless of drift. This is simpler and less reactive — calendar-based rebalancing prevents the temptation to rebalance based on short-term performance (which is usually variance, not signal).

## The Performance-Based Adjustment

Quarterly rebalancing incorporates a performance review:
- Strategies with 3-quarter positive CLV: maintain or increase allocation
- Strategies with 1-quarter negative CLV: maintain with monitoring
- Strategies with 2+ consecutive quarters of negative CLV: reduce allocation by 50%
- Strategies with 3+ consecutive quarters of negative CLV: consider removal

This performance adjustment distinguishes between variance (short-term negative) and genuine edge erosion (persistent negative).

## The New Strategy Onboarding Protocol

When adding a new strategy to the portfolio:
1. Paper trade for 100 bets to confirm edge shows in live market
2. Allocate 10% of portfolio in small-stake live testing (next 100 bets)
3. If CLV remains positive: promote to full entry allocation (15–20%)
4. If CLV is negative: remove from portfolio, return allocation to buffer

This prevents under-tested strategies from receiving significant capital.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Tax Implications of Multi-Strategy Bankrolls', 'tax-implications-betting-bankroll',
'## Betting and Tax: A Jurisdiction-Dependent Topic

Tax treatment of betting winnings varies dramatically by jurisdiction. What is important for bankroll management: understanding your tax liability and accounting for it in your financial planning.

## UK: Generally Tax-Free

In the UK, betting winnings are not subject to income tax or capital gains tax for individual bettors. This applies to all forms of sports betting (fixed-odds, exchange, spread betting). Exceptions: professional bettors may be considered traders by HMRC in specific circumstances (rare and contested).

**Bankroll management implication:** UK-based individual bettors can treat all winnings as gross profit without tax deduction.

## US: Taxable at Federal Level

In the US, gambling winnings are taxable income. Professional gamblers may deduct losses, but only up to the amount of winnings. State taxes apply additionally in most states.

**Bankroll management implication:** US-based bettors must reserve a portion of each win for tax purposes — typically 25–37% federal + state. Track gross wins and gross losses separately.

## The Record-Keeping Requirement

Regardless of jurisdiction, maintaining detailed records of all bets (stake, odds, outcome, date) is essential for tax compliance in jurisdictions where winnings are taxable. This is another reason why the bet log described throughout this topic is not optional.

## Professional Bettor Reclassification

In some jurisdictions, systematic high-volume betting may lead to reclassification as a professional trader — with both tax implications (winnings taxable as income) and benefits (ability to deduct losses, platform costs, equipment). Consult a tax professional if your betting volume reaches significant levels.

## Disclaimer

This lesson provides general information only. Tax law changes frequently and varies by individual circumstances. Always consult a qualified tax professional for advice specific to your situation.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building a Portfolio from Scratch', 'building-portfolio-from-scratch',
'## The Portfolio Development Timeline

Building a multi-strategy portfolio takes years, not months. Trying to run too many strategies simultaneously before any is validated dilutes focus and produces poor results across all.

## The Recommended Build Sequence

**Year 1 — Single strategy focus:**
Pick one market where you have the strongest analytical foundation. Run it as the sole strategy. Accumulate 500+ bets. Validate edge via CLV.

**Year 2 — First diversification:**
If year 1 produced positive CLV: add one adjacent strategy (same sport, different market type — e.g. add AH if year 1 was 1X2). Validate the second strategy over 200+ bets before adding a third.

**Year 3 — Sport diversification:**
Add one strategy in a second sport. Run the two-sport, four-strategy portfolio. Measure cross-sport correlation.

**Year 4+ — Full portfolio:**
A 4–6 strategy portfolio across 2–3 sports represents a mature, diversified operation. This is the endpoint, not the starting point.

## Why the Slow Build Works

Each year adds:
- More data for model validation
- More account relationships
- More operational experience
- More capital from compounding profits

A Year 4 portfolio built on Year 1–3 experience is orders of magnitude more robust than a Year 1 portfolio attempting Year 4 scope.

## The Common Mistake

Most aspiring professional bettors try to run 5–6 strategies in year 1, betting on every major sport, using multiple staking methods. The result: no strategy accumulates enough bets for validation, no edge is confirmed, losses are attributed to "variance", and the operation fails.

Narrow focus in early years is not a limitation. It is the mechanism of expertise development.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Portfolio Performance Attribution', 'portfolio-performance-attribution',
'## What Drove This Result?

Performance attribution answers: how much of your total return came from selection quality, staking decisions, market access, and pure variance? Without attribution, you cannot systematically improve.

## The Decomposition

**Total return = Edge contribution + Staking contribution + Market access contribution + Variance**

**Edge contribution:** What would you have earned with flat 1% staking on all bets? This isolates pure selection quality.

**Staking contribution:** Difference between actual return and flat-staking return. Positive = your variable staking added value; negative = it subtracted value.

**Market access contribution:** What is the improvement in return from line shopping vs using a single bookmaker? Calculate by comparing taken prices to second-best available prices across your records.

**Variance:** Difference between all other components and actual return. This is the luck component — cannot be controlled, only understood.

## A Worked Annual Attribution

Annual total return: +£1,800
Flat staking return (estimated): +£1,200
Variable staking added: +£300 (your Kelly decisions were directionally correct)
Line shopping added: +£200 (always taking the best price)
Variance component: +£100 (slightly lucky year)

Each component tells you what to focus on:
- Flat staking return is the hardest to improve (requires better selections)
- Staking and access improvements are operational and more immediately actionable

## The Annual Attribution Review

Perform this analysis annually. Track each component over 3–5 years. If staking contribution is consistently negative: simplify to flat staking. If access contribution is consistently below expectations: improve account portfolio and line shopping discipline.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Portfolio Management: The Complete System', 'expert-portfolio-management-system',
'## The Fully Mature Portfolio Operation

An expert multi-strategy betting portfolio is a financial operation in every meaningful sense: structured capital allocation, formal risk limits, performance attribution, reporting, and continuous improvement.

## The System Architecture

**Capital structure:**
Total bankroll → Strategy allocations (60%) + Float management (25%) + Reserve (15%)

**Strategy layer:**
3–6 validated strategies, each with documented edge, defined scope, and performance history. Monthly CLV tracking per strategy. Quarterly rebalancing.

**Risk management layer:**
Per-strategy stop-losses, portfolio-level drawdown trigger, correlation monitoring, minimum active account threshold.

**Operational layer:**
Account portfolio management (open/limited/closed status), float distribution, daily balance reconciliation.

**Review layer:**
Weekly balance, monthly performance, quarterly model calibration and rebalance, annual plan update and attribution.

## The Scalability Dimension

A well-structured portfolio scales in two ways:
1. **More strategies:** Additional validated edges expand betting capacity without increasing per-strategy stakes
2. **Higher stakes per strategy:** As each strategy''s edge is more thoroughly validated, conservative Kelly fractions can gradually increase (25% → 33% → 40%)

## The Integration with Professional Operations

At sufficient scale, the portfolio management system integrates with investor reporting, syndicate accounting, and potentially institutional-grade risk management tools. The principles remain identical to the individual operation — the infrastructure becomes more sophisticated.

## The Sustainable Edge

A portfolio designed with rigorous allocation, correlation management, and performance attribution has one key advantage over a single-strategy operation: when one source of edge erodes, the portfolio continues producing returns from other sources. This resilience is the ultimate goal of portfolio-level bankroll management.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'portfolio-bankroll-allocation' AND cat.slug = 'bankroll-management';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — Professional Bankroll Operations            ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Makes a Bankroll "Professional"?', 'what-makes-bankroll-professional',
'## The Professional Standard

A professional betting bankroll is one managed with the same discipline, documentation, and performance standards that a professional fund manager would apply to investor capital.

The distinction is not about size. A £5,000 bankroll managed professionally (documented process, validated edge, rigorous records, formal review cycles) is professional. A £100,000 bankroll managed on instinct and habit is not.

## The Six Professional Characteristics

**1. Documented strategy:** Written, testable selection and staking criteria. Not "I bet on teams I think will win."

**2. Validated edge:** Positive CLV across 500+ bets, with statistical significance. Not "I''m up this year."

**3. Formal risk limits:** Written stop-loss rules, maximum exposure limits, reserve requirements. Not "I''ll know when enough is enough."

**4. Systematic record-keeping:** Complete bet log with all metadata, maintained in real time. Not "I track results in my head."

**5. Regular structured review:** Monthly performance, quarterly model, annual plan. Not "I''ll think about it when results are bad."

**6. Continuous improvement:** Annual model updates, strategy research programme, edge renewal plan. Not "I''ll use the same approach as last year."

## The Professional Mindset

A professional does not define their identity by any single result or run of results. They define their identity by the quality of their process. Winning is evidence that the process worked in the sample. Losing is either variance or evidence that the process needs improvement. Only rigorous review can tell the difference.

## Why Professionalisation Matters

Professional practices do not just reduce risk — they create compounding advantages that casual bettors cannot replicate: better validated edge decisions, faster error detection, lower variance through disciplined staking, and the psychological resilience to maintain the process through downswings.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Investor Capital and Syndicate Structures', 'investor-capital-syndicate-structures',
'## Beyond Individual Capital

Proven bettors with documented edge can access external capital — investor funds that amplify their operation''s scale while generating returns for investors.

## The Basic Syndicate Structure

A betting syndicate pools capital from multiple members (or external investors) into a single managed bankroll. A designated manager (often the analyst with the validated edge) makes all betting decisions.

Common profit splits:
- 50/50: manager and investors split profits equally
- 70/30: investors receive 70% of profits (higher capital, lower risk)
- Performance fee: manager receives 0% base + 20% of profits above a hurdle rate

## The Due Diligence Requirement

Credible investors require documentation before committing capital:
- 2+ years of audited bet records
- CLV analysis by strategy and sport
- Risk management policy document
- Reference from trusted third party

Investors who do not require this documentation are not serious — and you should be suspicious of anyone willing to invest without it.

## Legal and Regulatory Considerations

In many jurisdictions, operating a managed betting fund may constitute regulated financial activity. In the UK, managing other people''s money for gambling purposes sits outside FCA regulation — but contractual documentation (partnership agreements, profit-sharing agreements) is essential.

Consult a solicitor before accepting investor capital to structure the arrangement appropriately.

## The Capital Advantage

With £100,000 under management vs £10,000 personal capital (same 3% annual ROI):
- Personal: £300 annual profit
- Syndicate: £3,000 annual profit (before performance fee)

The scale advantage is significant. Managing external capital well is one of the highest-leverage activities in professional betting.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Auditing and Reporting for Professional Operations', 'auditing-reporting-professional',
'## The Transparency Requirement

Whether managing personal capital or investor funds, the highest-performing operations maintain auditable records. Auditability means: an independent third party could verify every bet''s details, every stake decision, and every performance metric from your records alone.

## Creating an Auditable Bet Log

Each bet entry must contain:
- Timestamp (date and time of placement)
- Event and start time
- Selection and market
- Bookmaker/exchange (with account reference)
- Requested stake and actual matched stake
- Decimal odds
- Result and P&L
- CLV at closing (timestamp of Pinnacle closing reference)
- Strategy tag (which portfolio strategy)

This level of detail allows reconstruction of every decision and independent verification of CLV claims.

## Monthly Performance Report Structure

For investor-facing monthly reports:
- Period P&L (units and currency)
- P&L vs expected EV
- CLV summary by strategy
- Variance context (what would we expect in this period?)
- Account portfolio status (active / limited / new openings)
- Risk events (any stop-loss triggers, unusual occurrences)

## Annual Audit

Commission an independent review of your records annually. This can be done by:
- A trusted third party bettor who reviews methodology and records
- An accountant who verifies financial totals
- A statistical analyst who checks CLV calculations

Independent review catches both intentional misrepresentation (protecting investors) and unintentional errors in your own performance assessment.

## The Reputational Asset

A 3-year audited track record with positive CLV and appropriate risk management is one of the most valuable assets in professional betting. It cannot be faked and cannot be purchased — it can only be built through consistent disciplined operation over time.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Scaling Operations: Beyond Personal Account Limits', 'scaling-beyond-personal-limits',
'## The Scale Ceiling Problem

Individual bettors hit a scale ceiling: bookmakers restrict accounts, exchanges have limited liquidity, and personal time is finite. Scaling beyond these limits requires operational innovation.

## Strategy 1: Account Networks

The most common approach: operate accounts in the names of multiple trusted individuals (partner, family members where legally permitted). Each account has different activity patterns, reducing the correlation of restriction events.

Operational requirement: each account must be genuinely controlled by and transacting through the named individual (KYC and fraud regulations are strict). Proxy accounts are against most bookmakers'' terms and potentially illegal — research the legal requirements in your jurisdiction.

## Strategy 2: Specialist Brokers

Betting brokers place bets on behalf of clients through their own account networks, often with access to Asian bookmakers (Pinnacle, SBOBET) and higher limits than individual accounts. In exchange for this access, they charge commission (typically 2–5% of winnings).

For bettors with proven edge whose account access is restricted, brokers extend effective scale significantly.

## Strategy 3: Exchange Focus

Exchanges (Betfair, Smarkets, Matchbook) do not restrict winning accounts. As personal bookmaker access diminishes, shifting operational focus entirely to exchanges eliminates the restriction problem. Lower absolute liquidity per market is partially compensated by the restriction-free environment.

## Strategy 4: Data Licensing

Rather than betting with scaled stakes, licence your predictive model''s outputs to other operators (bookmakers, syndicates, data companies). This monetises your edge without the stake limitation constraint. Revenue is fee-based rather than risk-based.

## The Scaling Decision

Not all professional bettors need to scale. A £50,000 operation generating 8% annual return (£4,000/year) may be sufficient given the time invested. Scaling introduces complexity, legal obligations, and interpersonal dynamics that may not be worth the additional income.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Legal and Compliance Considerations', 'legal-compliance-considerations',
'## Sports Betting Is Legal — With Conditions

In most jurisdictions where sports betting is legal, individuals can bet and profit without restriction. However, professional-scale operations encounter a broader range of legal and compliance considerations.

## Jurisdictional Licensing

If you operate a service that provides betting tips, manages funds for clients, or operates as a trading platform, licensing requirements may apply. In the UK, regulated activities include "making arrangements for bets" — which may cover paid subscription tipping services.

Consult a gambling law specialist before operating any paid advisory or fund management service.

## KYC (Know Your Customer) Compliance

All licensed bookmakers and exchanges must verify customer identity. Professional bettors:
- Maintain clean KYC documentation (current ID, proof of address, source of funds documentation)
- Can demonstrate the legitimate source of betting funds on request
- Keep withdrawal records that can be traced to betting activity

## Source of Funds Documentation

As withdrawals increase in size, bookmakers may request source of funds documentation. Maintaining records that show: original bankroll source → betting activity → growth → withdrawals creates a clear, documentable trail.

## Anti-Money Laundering (AML) Obligations

Bookmakers have AML obligations and report large or suspicious transactions to financial intelligence units. This is a compliance matter for bookmakers — not typically a concern for legitimate bettors — but understanding it helps when providing documentation.

## The Practical Advice

For individual bettors operating at any scale: keep complete records, operate only through your own registered accounts, declare winnings as required by your jurisdiction, and consult a specialist before establishing any external-facing service.

Responsible, documented, legitimate operation protects you from regulatory risk and from the reputational damage that comes from association with non-compliant activity.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Time Management in Professional Betting', 'time-management-professional-betting',
'## Betting Is a Time-Intensive Operation

Professional betting is not passive income. At the level described throughout this topic, the time investment is substantial:

- Pre-game analysis and model runs: 10–20 hours/week
- Bet placement and execution: 2–5 hours/week
- Record-keeping and review: 3–5 hours/week
- Research and model development: 5–10 hours/week

**Total: 20–40 hours/week** for a serious operation.

## Time Allocation by Activity

The most common time misallocation: too much time watching events (enjoyable but low ROI) and too little time on model development and record review (unenjoyable but high ROI).

Recommended allocation:
- Analysis (pre-match): 40% of total time
- Research and development: 25%
- Operations (placement, records, accounts): 20%
- Review (performance, CLV, calibration): 15%
- Watching events (informational): only where directly relevant to analysis

## The Automation Opportunity

The most time-consuming repeatable tasks are candidates for automation:
- Data collection and database updates (Python scripts)
- Model runs (scheduled overnight)
- CLV calculation (spreadsheet formulas)
- Account balance updates (manual reconciliation streamlined by spreadsheet templates)

Each hour of automation setup typically saves 3–5 hours per month of manual operation.

## The Part-Time Professional

Most serious bettors operate alongside full-time employment, particularly in the early years. The strategy that fits a part-time operator:
- Narrow market scope (fewer events to analyse)
- Automated pipeline for overnight data processing
- Weekend-focused betting (higher event volume when time is available)
- Monthly rather than weekly reviews (sufficient given lower bet frequency)',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Building and Leading a Betting Team', 'building-leading-betting-team',
'## When Individual Capacity Is Not Enough

A single analyst with strong edge hits capacity limits in research, data collection, and model development. A team of complementary specialists can cover more ground, apply more diverse methods, and sustain higher research output.

## The Functional Roles in a Betting Team

**The Analyst/Trader:** Makes betting decisions based on model output and contextual research. Manages execution.

**The Quantitative Modeller:** Builds and maintains the statistical models. Backtests new approaches. Validates model output against closing lines.

**The Data Engineer:** Maintains the data infrastructure. Automates data collection and quality checks. Ensures the database is current and clean.

**The Operations Manager:** Manages bookmaker accounts, float distribution, KYC documentation, withdrawal cycles.

**The Research Analyst:** Studies market inefficiencies, reads academic literature, tests new hypotheses before deploying to the live portfolio.

## Team Dynamics in Betting

Betting teams face unique challenges:
- **Intellectual property:** Research findings are valuable. Define ownership upfront.
- **Trust:** Financial transparency is essential. All members should have visibility into relevant financial data.
- **Conflict resolution:** Disagreements about bet selection, model methodology, and allocation are inevitable. Define decision-making authority clearly.

## The Compensation Structure

Common models:
- **Fixed salary + profit share:** Stable income for members, aligned incentive through profit share
- **Equal profit share:** Simpler but may create free-rider incentives
- **Role-specific performance bonuses:** Research analyst bonused on new edge discovery; trader bonused on CLV improvement

## The Minimum Viable Team

The smallest viable team for a serious operation: two people — one focused on analysis and execution, one focused on model development and data. This division covers the most critical capacity bottleneck at the smallest cost.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Exit Strategies and Career Transitions', 'exit-strategies-career-transitions',
'## Professional Betting Has a Finite Window

The market becomes more efficient over time. Edges erode. Account restrictions accumulate. The personal circumstances that make professional betting viable change. Planning for the career arc — including its conclusion — is part of professional risk management.

## The Voluntary Exit

**Planned retirement:**
Set a target at which you transition from full-time betting to another career. This is a positive exit: you built a bankroll, validated an edge, and extracted maximum value before retiring on your terms.

**Exit metrics:** When the operation generates sufficient capital for reinvestment in other assets, converting betting profits into index funds, property, or a business provides more scalable long-term return without the operational complexity.

**The transition:** Wind down gradually over 6–12 months. Reduce strategy scope, simplify the operation, preserve the best accounts and the worst-to-replicate data assets.

## The Forced Exit

**Edge erosion:** Your CLV drops persistently to zero or negative. The market has caught up.

**Response:** Acknowledge it formally (review process). Attempt a model upgrade. If unsuccessful after 12 months, exit before further losses.

**Account restriction cascade:** Your operational account portfolio drops below minimum viable size and cannot be rebuilt.

**Response:** Transition to exchange-only operation (cannot be restricted) at lower capacity, or exit.

## Skills Transfer

Professional betting builds highly transferable skills:
- Probabilistic reasoning under uncertainty
- Statistical modelling and data analysis
- Risk management and capital allocation
- Disciplined process execution under emotional pressure

These skills are directly applicable to: financial trading, data science, fund management, and any analytical decision-making role.

## The Intellectual Legacy

The models, databases, research findings, and operational processes you build have value beyond their direct betting application. This intellectual property can be licensed, sold, or applied in adjacent domains. Build it well from the start.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Professional Bankroll: A 10-Year Simulation', 'professional-bankroll-10-year',
'## The Long-Run Vision

One of the most valuable exercises for any serious bettor is running a 10-year projection of their operation — not as a promise of results, but as a structured way to think about what consistent, disciplined betting can produce.

## The Base Assumptions

- Starting bankroll: £10,000
- Annual betting volume: £150,000 turnover (approximately £600/week staked)
- Average edge (CLV): 3%
- Annual staking method: 1.5% of bankroll per bet (proportional)

## The Year-by-Year Projection

At 3% ROI on £150,000 annual turnover: expected annual profit = £4,500.

Year 1: £10,000 → £14,500 (if proportional staking, slightly higher through compounding)
Year 2: ~£19,800
Year 3: ~£26,000
Year 5: ~£41,000
Year 10: ~£97,000

Starting with £10,000 and consistent 3% edge: expected to approach £100,000 by year 10.

## The Variance Around This Projection

Standard deviation of annual return at 3% ROI and typical variance:
~10% per year.

95% range for year 10 outcome: £40,000–£240,000

The wide range reflects cumulative variance over 10 years. The central estimate is £97,000; the realistic range is large. This is the nature of variance, not a flaw in the model.

## The Compounding Acceleration

The most powerful phase of this 10-year projection is years 7–10. By this point, the bankroll has grown significantly, each 1.5% stake is a larger absolute amount, and the annual profit accelerates. Year 10 produces more absolute profit than years 1–3 combined.

## The Non-Financial Returns

Beyond the financial projection, 10 years of professional betting produces:
- A complete, audited performance record
- A validated, mature statistical model
- A network of professional contacts in betting and data analytics
- Skills in probabilistic reasoning that have broad career applications
- The psychological resilience that comes from operating under uncertainty for a decade

These non-financial returns are not captured in the projection — but they are real and valuable.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Responsible Professional: Betting Within Your Values', 'responsible-professional-betting',
'## The Final Consideration

The technical and financial content of this topic is a framework for excellence within betting as a discipline. But excellence in any discipline must be pursued within a framework of personal values and responsibility.

## Who Should Consider Professional Betting

Professional betting is appropriate for people who:
- Have genuine analytical ability and are willing to validate it rigorously
- Can financially and psychologically withstand significant losing periods without damage to their life
- Treat it as a business activity with documented processes, not as entertainment
- Can maintain clear boundaries between their betting identity and their personal identity

## Who Should Not

Professional betting is not appropriate for people who:
- Find it difficult to stop betting once started
- Bet to escape from stress, anxiety, or other life problems
- Cannot tolerate losing periods without significant life disruption
- Are betting with money that affects their financial security

These are not weaknesses — they are honest assessments of fit. The same discipline required for professional betting is required to recognise when it is not the right pursuit.

## Responsible Gambling Resources

Even systematic, disciplined bettors should know:
- **GamCare (UK):** www.gamcare.org.uk / 0808 8020 133
- **BeGambleAware (UK):** www.begambleaware.org
- **Gambling Therapy (International):** www.gamblingtherapy.org
- **National Problem Gambling Helpline (US):** 1-800-522-4700

Self-exclusion tools are available on all licensed bookmakers and exchanges. Using them as a deliberate tool (e.g. during a planned break) is a responsible and professional practice.

## The Integration of Excellence and Responsibility

The highest standard of professional betting is not just financial performance — it is financial performance achieved within a framework of personal responsibility, clear boundaries, and honest self-assessment. This is what distinguishes a sustainable professional from someone who mistakes emotional compulsion for analytical edge.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bankroll-operations' AND cat.slug = 'bankroll-management';
