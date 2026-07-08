-- ============================================================
-- PunterStat — Betting Academy: Bankroll Management Expansion
-- Migration 022: Expand existing 2 modules to 10 lessons each
--   • "Bankroll Fundamentals"  — add lessons 2–10 (1 exists)
--   • "Staking Strategies"     — add lessons 1–10 (0 exist)
-- Progression: Beginner → Intermediate → Advanced → Expert
-- ============================================================


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 1 — Bankroll Fundamentals                       ║
-- ║  Existing: 1 lesson (sort_order 1)                      ║
-- ║  Adding: lessons 2–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

-- Lesson 2: Setting Your Starting Bankroll (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Setting Your Starting Bankroll',
  'setting-your-starting-bankroll',
  '## The Most Important Decision You Make

The size of your starting bankroll sets the foundation for everything else. Get it wrong — too small or funded from money you cannot afford to lose — and no staking strategy in the world can save you.

## The Two Non-Negotiable Rules

**Rule 1: Your bankroll must be money you can afford to lose entirely.**
Not money you need back in six months. Not money earmarked for anything else. Money that could disappear completely without affecting your life.

**Rule 2: Your bankroll must be large enough to survive realistic losing runs.**
Even with a genuine edge, losing runs of 15–25 bets are mathematically normal. Your bankroll must survive them without forcing a change in strategy.

## A Practical Sizing Framework

1. **Determine your intended stake size** — the amount you plan to bet per standard unit.
2. **Set your bankroll at 50–100× that stake.**

Intended stake: £20 per bet → Starting bankroll: £1,000–£2,000.
Intended stake: £50 per bet → Starting bankroll: £2,500–£5,000.

This 50–100× ratio ensures you can survive a 25-unit losing run without dropping below 50% of starting capital — the minimum to continue staking at your intended level.

## The Under-Capitalised Trap

Many bettors start with £200 and try to bet £20 per unit (10× bankroll). One bad week of 10 losses leaves £100 — 50% drawdown. The psychological pressure to "recover" is immense and leads to poor decisions.

Under-capitalisation is the most common reason bettors with genuine ability fail in the short term.

## Starting Small Is Not Failure

A £500 bankroll betting £5–£10 per unit is a legitimate starting operation. The goal in the first 6 months is to build a validated track record, not to maximise profit. Profitability compounds — starting small and building correctly is always superior to starting large and blowing up.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 3: Units — The Universal Measure (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Units: The Universal Measure of Betting Performance',
  'units-universal-measure',
  '## Why Units, Not Currency

Bettors who track performance in pounds, dollars, or euros face a problem: stake sizes change, bankrolls grow or shrink, and currency amounts are not comparable across different operation sizes.

Units solve this. One unit = one standard stake. Regardless of whether that unit is £10 or £1,000, performance measured in units is universal.

## The Unit Definition

At the start of any tracking period, define: 1 unit = your intended standard stake.

This does not change during the period. If you increase your stakes mid-period, start a new period with a new unit definition.

## Expressing Results in Units

- Win 3 bets at 2.50 for 1 unit each: 3 × 1.5 = +4.5 units profit
- Lose 2 bets for 1 unit each: −2 units
- Net: +2.5 units

If your unit is £20: net profit £50.
If your unit is £100: same 2.5u result = £250 profit.

The performance is identical in units. Units allow bettors of all sizes to compare results and evaluate the same system.

## Variable Stake Sizes

Not all bets are equal. You may bet 0.5 units on uncertain selections and 1.5 units on high-confidence picks. Express each bet as a unit multiple.

Total return = Σ (unit size of each bet × decimal result of that bet) − Σ (unit size of each bet)

## Units and ROI

ROI (Return on Investment) = (Total profit in units / Total staked in units) × 100

A bettor who stakes 100 units total and profits 5.5 units has 5.5% ROI — regardless of their unit currency value.

## Tracking Your Unit P&L

Maintain a running P&L in units. After every 50 bets, plot the cumulative unit profit chart. This is the clearest single visualisation of whether your system is producing value or consuming it.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 4: The Psychological Discipline of Bankroll Separation (Beginner)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Bankroll Separation: The Psychological Foundation',
  'bankroll-separation-psychological',
  '## Why Physical Separation Matters

It is not enough to mentally designate a portion of your savings as your betting bankroll. Mental accounting is unreliable under pressure. The most effective protection is physical separation: a dedicated betting account that is distinct from all other financial accounts.

## How to Implement Physical Separation

1. Open a dedicated bank account or e-wallet used exclusively for betting
2. Transfer your entire intended bankroll into this account at the start of the season
3. Deposit to bookmakers only from this account
4. Withdraw winnings only to this account, not to your main account

The rule: money flows from the betting account to bookmakers, and from bookmakers back to the betting account. It does not flow between your betting account and your daily spending account.

## The Emotional Benefit

When your betting funds are separate, a losing run does not affect your daily financial life. You are not choosing between this week''s groceries and your betting strategy. This emotional insulation allows you to make decisions based on analysis, not financial fear.

## The Withdrawal Policy

Decide in advance how and when you withdraw profits. Common approaches:
- **Monthly withdrawal:** Withdraw X% of profits each month (e.g. 30%)
- **Bankroll cap:** When bankroll exceeds 2× starting amount, withdraw the excess
- **End-of-season withdrawal:** Take all profits at season end, reset to starting bankroll

Consistency in withdrawal policy prevents both under-withdrawal (never enjoying profits) and over-withdrawal (depleting the bankroll below operational size).

## The Accountability Practice

Share your bankroll statement (not your bet details, just the overall balance) with a trusted person monthly. External accountability reduces the temptation to make exceptions to your separation rules during downswings.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 5: Bankroll Tracking Systems (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Bankroll Tracking Systems That Work',
  'bankroll-tracking-systems',
  '## The Minimum Viable Tracking System

You cannot manage what you do not measure. Every bankroll management strategy depends on accurate, real-time tracking of your bankroll position.

## The Spreadsheet Foundation

At minimum, maintain a spreadsheet with these columns for every bet:
- Date
- Sport and competition
- Selection and market
- Bookmaker/exchange
- Stake (in units)
- Decimal odds
- Result (W/L/V — void)
- Profit/loss (in units)
- Running bankroll balance (in units)
- Running bankroll balance (in currency)
- Notes (brief reasoning)

## Automated Tracking Tools

Several tools can automate or supplement manual tracking:
- **Betaminic, Traxdata:** Import bet history from bookmakers automatically
- **RebelBetting Tracker:** Specifically for value bettors and matched bettors
- **Custom Google Sheets:** Most flexible — build your own formula suite

The advantage of manual tracking: you review every bet at entry, reinforcing disciplined analysis.

## The Dashboard Metrics

Your tracking system should surface these metrics automatically:
- **Total bets placed** (this period and all-time)
- **ROI (%)** by sport, market type, and bookmaker
- **Units staked** and **units profit**
- **Win rate** by odds range
- **Longest losing streak** (current and all-time)
- **Maximum drawdown** (peak-to-trough unit loss)
- **Average CLV** (if you track it)

## Monthly Review Ritual

Set aside 30 minutes at the end of each month to review these metrics. Compare to the previous month. Identify trends: improving ROI, emerging market where you underperform, account restrictions that are changing your market access.

The monthly review turns raw data into actionable insights — the whole point of tracking.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 6: Bankroll Growth Strategies (Intermediate)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Bankroll Growth: Compounding and Scaling',
  'bankroll-growth-compounding',
  '## The Compounding Effect in Betting

A bankroll managed correctly compounds over time. Each unit of profit is reinvested as additional capital, enabling slightly larger stakes, which generates slightly more profit, which is reinvested again.

## The Two Growth Models

**Model 1: Fixed Stake (Flat Betting)**
Stake = same currency amount regardless of bankroll size.
Your bankroll grows in currency terms but the unit stays fixed.

Pros: Simple. Predictable. Immune to drawdown-induced over-betting.
Cons: Does not capture the compounding benefit of a growing bankroll.

**Model 2: Proportional Stake (% of Bankroll)**
Stake = fixed % of current bankroll.
As bankroll grows, stake grows proportionally.

Pros: Naturally scales with success. Mathematically linked to Kelly optimisation.
Cons: In downswings, stakes decrease — which is good for capital preservation but psychologically difficult.

## The Hybrid Approach

Many professional bettors use a hybrid: review bankroll monthly and reset the unit size to 1–2% of current bankroll. This gives the compounding benefit of proportional staking while avoiding the whipsaw of stake changes after every result.

## Compounding Projection

Starting bankroll: £2,000. Monthly growth rate: 5% (realistic for consistent edge bettors). After:
- 12 months: £3,592
- 24 months: £6,453
- 36 months: £11,590

Modest monthly growth rates compound to significant bankroll expansion over multiple years.

## The Withdrawal Decision

Withdrawing profits removes capital from the compounding cycle. Each £100 withdrawn reduces future compound growth. Define your withdrawal policy as a tradeoff between enjoying current profits and maximising long-term bankroll growth. Neither extreme (never withdraw vs always withdraw all profits) is optimal.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 7: Stop-Loss Rules (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Stop-Loss Rules: Protecting Your Capital',
  'stop-loss-rules-protecting-capital',
  '## Why Stop-Losses Are Essential

A stop-loss is a pre-defined rule that limits how much you can lose in a given period before you pause betting and review. Without one, a losing run can become catastrophic — not because variance is unusually bad, but because emotional responses to losses cause bettors to deviate from their strategy.

## Types of Stop-Loss Rules

**1. Session Stop-Loss**
Maximum loss in a single betting session. Common setting: 5–10 units.
"If I lose 5 units today, I stop until tomorrow."

**2. Weekly Stop-Loss**
Maximum loss in one week. Common setting: 15–20 units.
"If I lose 20 units this week, I stop and review before betting again."

**3. Drawdown Stop-Loss**
Maximum acceptable peak-to-trough loss at any point. Common setting: 25–30 units.
"If my bankroll drops 25 units below its highest point, I pause all betting and conduct a full strategy review."

## What "Stop and Review" Actually Means

A stop-loss triggers a mandatory review — not permanent cessation. The review asks:
- Is the current losing run within my simulated variance range? (If yes: continue)
- Have I been deviating from my strategy? (Betting markets outside my validated universe, changing stake sizes emotionally)
- Is there new information that suggests my edge has eroded? (Negative CLV trend)

If the review finds variance is the likely cause and the strategy is intact, resume with no changes. If the review finds systematic problems, address them before resuming.

## The Commitment Mechanism

Write your stop-loss rules down. Put them somewhere visible (printed next to your computer, phone wallpaper). The purpose of written rules is that violating them requires explicit, conscious override — not simply forgetting them under emotional pressure.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 8: Bankroll Across Multiple Bookmakers (Advanced)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Managing Bankroll Across Multiple Bookmaker Accounts',
  'bankroll-across-multiple-accounts',
  '## The Multi-Account Reality

Serious bettors maintain 8–15 active bookmaker accounts simultaneously. Each account holds a portion of the total bankroll. Managing the distribution and monitoring the total correctly is a distinct operational skill.

## The Float Distribution Problem

You cannot bet at a bookmaker unless you have funds in their account. Keeping the right amount in each account — enough to cover your intended bets, not so much that idle capital is locked up — requires active management.

## A Practical Float Strategy

Allocate approximately 10–15% of total bankroll to each of your 5–8 most active accounts. Keep 20–30% in a central reserve (bank account linked to the dedicated betting account) for rapid deposit when an account runs low.

Review all account balances weekly. Withdraw from accounts where balance exceeds target; deposit to accounts running low.

## The Withdrawal Cycle

The typical flow: bookmaker → dedicated betting bank account → deposit to depleted bookmakers. Withdrawal processing times vary (instant at some; 1–5 days at others). Factor processing time into your float management.

## Account Health Monitoring

Track not just the balance but the status of each account:
- Open (normal access)
- Bonus restricted (reduced or no further promotions)
- Stake limited (maximum bet reduced on certain markets)
- Closed (account terminated)

When an account is limited or closed, the float held there needs redistribution. Have a plan before it happens — not after.

## The CLV by Account Tracking

Track CLV separately by bookmaker. Some accounts produce consistently better prices than others. If one account is producing negative CLV (you consistently take worse prices than closing) — review whether you should reduce activity there.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 9: Bankroll Recovery After Drawdown (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Bankroll Recovery: Managing and Rebounding from Drawdown',
  'bankroll-recovery-after-drawdown',
  '## The Recovery Paradox

After a significant drawdown, the instinct is to bet more aggressively to "recover faster." This is the opposite of what mathematics recommends.

## Why Aggressive Recovery Fails

To recover from a 25% drawdown: you need +33% growth from the lower point.
Aggressive recovery strategies that double stakes increase variance dramatically — they might recover faster in a lucky scenario, but in an unlucky scenario, they turn a 25% drawdown into a 50% or 75% drawdown.

The Kelly Criterion explicitly captures this: as your bankroll decreases, the mathematically optimal fraction stake also decreases. Betting the same fraction of a smaller bankroll means betting less in absolute terms — not more.

## The Proportional Response

If your bankroll drops from £2,000 to £1,500 (25% drawdown), your stake should drop proportionally:
- Original stake: 2% of £2,000 = £40
- Post-drawdown stake: 2% of £1,500 = £30

This automatic stake reduction is a feature of proportional staking, not a bug. It protects against ruin without requiring any decision.

## The Review Trigger

A 20-unit drawdown should automatically trigger a full strategy review:
1. Is the drawdown within the simulated variance range for your strategy? (If yes: expected, continue at reduced stakes)
2. Is there evidence of model error or strategy drift? (If yes: pause, fix, resume)
3. Have external conditions changed (market efficiency improvements, account restrictions)? (If yes: adapt)

## The Re-Scaling Protocol

After a drawdown and subsequent recovery back to the previous peak:
- Confirm the strategy is working before re-scaling stakes
- Scale stakes proportionally as the bankroll grows
- Do not jump back to pre-drawdown stakes immediately — grow back organically',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';

-- Lesson 10: The Long-Term Bankroll Business Plan (Expert)
INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Long-Term Bankroll Business Plan',
  'long-term-bankroll-business-plan',
  '## Treating Your Bankroll as a Business Asset

The most sophisticated bettors treat their bankroll the same way a fund manager treats capital under management: with a formal plan, performance objectives, risk limits, and reporting.

## The Annual Bankroll Plan

Produce a written bankroll plan at the start of each year containing:

**Capital allocation:**
- Total bankroll: £X
- Exchange float: Y%
- Active bookmaker float total: Z%
- Reserve: R%

**Performance objectives:**
- Target ROI: X% (based on last year''s CLV performance)
- Expected annual profit: £Y (bankroll × expected turnover × target ROI)
- Maximum acceptable drawdown: Z units

**Risk limits:**
- Maximum stake per bet: N units (typically 2–4)
- Stop-loss: daily, weekly, drawdown-based
- Account diversification: minimum 8 active accounts

**Review schedule:**
- Weekly balance review
- Monthly performance review
- Quarterly model calibration test
- Annual plan update

## The Capital Efficiency Metric

Track capital efficiency: profit per unit of capital deployed.

Capital efficiency = Annual profit / Average bankroll

A £10,000 bankroll generating £1,500 annual profit = 15% capital efficiency.

Compare this to your opportunity cost: could that £10,000 earn 7% in an investment account? Your 15% represents meaningful alpha over the alternative.

## The Exit Criteria

Define in advance when you would stop the operation:
- Sustained negative CLV for 12 months (edge gone)
- Loss of access to all competitive markets (restriction cascade)
- Capital falling below minimum operational size
- Personal circumstances changing

Having exit criteria in advance prevents the common failure mode of continuing to bet without edge out of habit or attachment to the activity.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'bankroll-fundamentals' AND cat.slug = 'bankroll-management';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 2 — Staking Strategies                          ║
-- ║  Existing: 0 lessons                                    ║
-- ║  Adding: lessons 1–10                                   ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Purpose of a Staking Strategy',
  'purpose-of-staking-strategy',
  '## Staking Is Not Just About Money

A staking strategy determines how much you bet on each selection. Done correctly, it does three things:
1. **Prevents ruin:** Ensures losing runs do not destroy the bankroll
2. **Captures edge:** Stakes appropriately more on higher-edge selections
3. **Enables compounding:** Grows stakes as the bankroll grows

A bad staking strategy can turn a profitable selection process into a losing operation.

## The Spectrum of Staking Methods

From simplest to most sophisticated:

**Level Staking (Flat):** Same amount every bet. Simple, predictable, widely used.
**Percentage Staking:** Fixed % of current bankroll. Adapts to bankroll size.
**Kelly Criterion:** Mathematically optimal stake based on edge and odds.
**Fibonacci, Martingale:** Systems based on chasing losses (universally ill-advised).

## Why Strategy Matters More Than Selection (Sometimes)

Consider two bettors with identical selection abilities (both identify +5% EV selections equally well):

- Bettor A: Flat stakes, 1% of bankroll. Slow growth, almost zero ruin risk.
- Bettor B: Doubles stakes after losses (Martingale). High ruin risk regardless of edge.

The identical selection process produces radically different outcomes based purely on staking.

## The Risk of Ruin Calculation

For any staking strategy, risk of ruin = P(bankroll → 0 before any positive goal).

This probability depends on: edge size, bet variance, stake as % of bankroll, and the number of bets.

The key insight: stake too high relative to bankroll and edge, and ruin is likely even with genuine positive EV. Staking strategy is the difference between extracting value and destroying it.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Flat Staking: The Foundation',
  'flat-staking-foundation',
  '## The Simplest Staking System

Flat staking (level staking) means betting exactly the same amount on every selection, regardless of perceived confidence or odds. One unit, always.

## The Advantages

**1. Simplicity:** No calculations. No decisions beyond selecting the bet.
**2. Performance clarity:** ROI in units is a clean measure of selection quality with no staking distortion.
**3. Emotional discipline:** Equal stakes remove the temptation to chase losses with larger bets.
**4. Variance management:** Without stake variation, variance is minimised relative to edge.

## The Disadvantages

**1. Does not adapt to edge size:** A bet with 10% EV and a bet with 2% EV receive identical stakes. This under-exploits the stronger bet.
**2. Does not compound automatically:** As the bankroll grows, the unit stays fixed, reducing the % of bankroll staked over time.
**3. All selections treated equally:** In practice, not all selections have equal probability or edge.

## When Flat Staking Is Optimal

- Early in your betting career (first 6–12 months)
- When your model does not produce confident edge estimates for individual bets
- When your primary goal is building a clean performance record
- For any bettor who finds variable staking psychologically destabilising

## The Flat Staking Performance Metric

ROI using flat staking = (Total profit in units / Total bets) × 100

This is the purest measure of selection quality. A flat-stake ROI of +5% over 500 bets is a meaningful, statistically significant result.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Percentage Staking: Adapting to Your Bankroll',
  'percentage-staking-adapting-bankroll',
  '## The Core Idea

Percentage staking (proportional staking) means betting a fixed percentage of your current bankroll on every selection. As your bankroll grows, stakes grow. As your bankroll shrinks, stakes shrink automatically.

**Example:** 1.5% staking on a £2,000 bankroll = £30 per bet.
If the bankroll grows to £2,500: 1.5% = £37.50 per bet.
If the bankroll drops to £1,500: 1.5% = £22.50 per bet.

## The Compounding Benefit

Percentage staking automatically implements compounding. As your bankroll grows, your absolute stake grows proportionally — accelerating profit accumulation.

Growth rate comparison (same selections, 3% ROI, 500 bets):
- Flat staking at £25: profit ≈ £375
- 1.5% staking, starting at £25 per bet: profit ≈ £420 (additional ~12% through compounding)

## The Drawdown Benefit

In a losing run, percentage staking automatically reduces stakes:
- 20-bet losing run at 1.5%: bankroll drops from £2,000 to roughly £1,470
- Stake at end of losing run: 1.5% of £1,470 = £22, vs the original £30

Smaller stakes during downswings mean each additional loss is smaller in absolute terms. The losing run hits you progressively less hard.

## The Standard Percentage Range

- Conservative: 0.5–1% per bet (very low ruin risk, slower growth)
- Moderate: 1–2% per bet (balanced risk/reward)
- Aggressive: 2–4% per bet (higher growth but significant drawdown potential)

Most professional bettors operate at 1–1.5%. The Kelly Criterion (next lessons) provides the mathematical justification for these ranges.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Kelly Criterion Explained',
  'kelly-criterion-explained',
  '## The Most Important Formula in Bankroll Management

The Kelly Criterion, developed by J.L. Kelly Jr. in 1956, calculates the mathematically optimal fraction of your bankroll to stake on a bet, given your estimated edge and the odds.

## The Formula

Kelly Fraction (f*) = (bp - q) / b

Where:
- **b** = net decimal odds (decimal odds − 1). At 2.50 odds, b = 1.50.
- **p** = your estimated probability of winning
- **q** = 1 − p (probability of losing)

**Example:**
Odds: 2.50. Your estimated win probability: 45% (implied: 40%).

f* = (1.50 × 0.45 − 0.55) / 1.50
f* = (0.675 − 0.55) / 1.50
f* = 0.125 / 1.50 = **0.0833 = 8.33% of bankroll**

## What Full Kelly Means

At full Kelly, you are mathematically maximising the long-run geometric growth of your bankroll. This is not the same as maximising expected value per bet — it is maximising the rate of bankroll growth over many bets.

## The Kelly Constraint

Kelly only makes sense when you have genuine edge: p > 1/(1+b). If p < this value, Kelly gives a negative fraction — meaning you should not bet at all.

## Why Bettors Rarely Use Full Kelly

Full Kelly is mathematically optimal but psychologically brutal. A run of incorrect probability estimates can generate enormous stakes, and the resulting drawdowns are extreme. Most practitioners use a fraction of Kelly (described in the next lesson).

## The Key Insight

Kelly connects your probability estimates directly to your staking. The better your estimates, the closer you can safely run to full Kelly. Poor probability estimates = dangerous full-Kelly stakes.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Fractional Kelly: Balancing Growth and Safety',
  'fractional-kelly-growth-safety',
  '## The Problem With Full Kelly

Full Kelly betting produces the maximum long-run growth rate — but the variance is enormous. In the short term (hundreds of bets), you can experience 30–50% drawdowns even with well-calibrated estimates. Most bettors cannot psychologically sustain these drawdowns without abandoning the strategy.

## Fractional Kelly

Fractional Kelly means betting a fixed fraction of the full Kelly stake. Common fractions:
- **Quarter Kelly (25%):** Very safe, captures ~75% of Kelly growth rate
- **Half Kelly (50%):** Moderate, captures ~87.5% of Kelly growth rate
- **Full Kelly (100%):** Maximum theoretical growth, extreme variance

## The Mathematical Trade-Off

At f fraction of Kelly, the growth rate is proportional to f − f²/2 (relative to full Kelly at 1 − 1/2 = 0.5).

At 50% Kelly: growth rate = 2(0.5) − (0.5)² × (full Kelly growth) ≈ 75% of full Kelly growth, with ~25% of the variance.

At 25% Kelly: growth rate ≈ 44% of full Kelly growth, with ~6% of the variance.

The sharp reduction in variance for modest reduction in expected growth makes fractional Kelly significantly more practical.

## The Professional Standard

Most professional bettors use 25–33% Kelly. This:
- Produces meaningful compounding over a season
- Limits drawdowns to roughly 15–20% of peak (manageable psychologically)
- Accounts for the certainty that probability estimates are not perfectly calibrated

## Implementing Fractional Kelly

Full Kelly calculation: 8.33% (from previous lesson)
At 25% Kelly: stake = 0.25 × 8.33% = 2.08% of bankroll
At £2,000 bankroll: stake = £41.60

This is a concrete, mathematically grounded stake — not a guess.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'The Dangers of Martingale and Chasing Systems',
  'dangers-martingale-chasing',
  '## The Martingale Explained

The Martingale system doubles your stake after every loss. The idea: eventually you win, and the win covers all previous losses plus a small profit.

**Example:** Bet 1 unit. Lose. Bet 2 units. Lose. Bet 4. Lose. Bet 8. Win.
Net result: +1 unit after 4 bets.

This sounds appealing. It fails catastrophically.

## Why Martingale Destroys Bankrolls

**The sequence risk:** A losing run of 10 bets requires a stake of 2^10 = 1,024 units on the 11th bet. Starting from 1 unit, a 10-loss run requires staking 1,023 total units to reach this point. At a £10 unit: you have staked £10,230 to win back £10.

**Losing runs are normal:** Even with a 50% win rate, a 10-loss run has P = (0.5)^10 = 0.1% probability. At 1,000 bets, expected occurrences: 1. At 10,000 bets: 10 occurrences.

**No edge requirement:** Martingale does not address whether your selections have positive EV. It is purely a staking system that assumes infinite bankroll and no stake limits.

## The Fibonacci and D''Alembert Fallacies

Both are variations of progression betting — increasing stakes after losses. All progression systems share the same fatal flaw: they cannot convert negative EV selections into positive EV outcomes. They just change the loss distribution (many small wins, occasional catastrophic loss).

## The Casino''s Perspective

Casinos welcome Martingale players. The system is emotionally compelling but mathematically equivalent to flat betting with the same number of units staked in expectation — minus the occasional ruin event.

## The Rule

Never use any staking system that increases stakes after losses without a mathematical basis (like Kelly) connecting the stake increase to a genuine edge calculation.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Confidence-Based Staking: Variable Units',
  'confidence-based-staking-variable-units',
  '## Expressing Different Confidence Levels

Not all bets are equal. Some selections are based on stronger evidence, more reliable models, and larger estimated edges than others. Confidence-based staking attempts to capture this variation by betting more on higher-confidence selections.

## A Simple Variable Staking Scale

| Confidence Level | Unit Size | When to Use |
|---|---|---|
| Low (marginal value) | 0.5 units | EV 1–2%, uncertain probability estimate |
| Standard | 1.0 units | EV 2–5%, well-supported analysis |
| High | 1.5 units | EV 5%+, strong model signal + contextual support |
| Maximum | 2.0 units | EV 8%+, multiple confirming signals |

The maximum should rarely exceed 3× the minimum. Anything larger destroys the disciplined consistency that makes this approach work.

## The Danger of Subjective Confidence

The risk: "confidence" becomes a rationalisation for betting more on selections you emotionally prefer. True confidence-based staking requires your confidence level to be based on objective metrics (estimated EV%, model accuracy, CLV expectation) — not gut feeling.

## Linking Variable Staking to Edge

The most principled variable staking system links stake directly to estimated EV:

Stake = (Estimated EV%) / (Reference EV%) × Standard Unit

At standard unit = 1 and reference EV = 3%:
- 1.5% EV bet: stake = 0.5 units
- 3.0% EV bet: stake = 1.0 units
- 6.0% EV bet: stake = 2.0 units

This is a simplified proportional Kelly approach — mathematically grounded and defensible.

## Tracking Variable Staking Performance

When using variable stakes, always track both flat-stake ROI (to measure selection quality independently) and actual ROI (to measure the contribution of your staking decisions). If actual ROI consistently underperforms flat-stake ROI, your variable staking is adding noise rather than edge.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Staking in Different Market Contexts',
  'staking-different-market-contexts',
  '## One Staking System Does Not Fit All Markets

The optimal staking percentage varies by market because variance varies by market. A staking system calibrated for frequent, low-variance bets (tennis match winner) is too aggressive for high-variance bets (accumulator or long-odds outright).

## Variance-Adjusted Staking

The Kelly Criterion naturally adjusts for variance through the b term (net odds). Higher odds = higher variance = lower Kelly fraction for the same edge.

At 5% EV:
- Odds 1.90 (short): Kelly fraction ≈ 12.8% → Half Kelly ≈ 6.4%
- Odds 4.00 (mid-long): Kelly fraction ≈ 4.7% → Half Kelly ≈ 2.4%
- Odds 10.00 (long): Kelly fraction ≈ 2.0% → Half Kelly ≈ 1.0%

The same 5% edge at longer odds warrants a smaller proportional stake because the win/loss distribution is more extreme.

## Market-Specific Stake Caps

Set maximum stake sizes by market category:
- Single-match bets (1X2, AH, O/U): up to 2.5% of bankroll
- Outright bets: up to 1.5% of bankroll (longer time horizon, higher uncertainty)
- Player props: up to 1.0% of bankroll (higher margin, higher individual variance)
- Accumulators (if used): up to 0.5% of bankroll

These caps operate as ceilings — your Kelly calculation may suggest less even before the cap applies.

## The Correlated Bet Problem

When you bet multiple markets in the same event (match winner + over 2.5 goals in the same match), the positions are correlated. Your total exposure to that event should be treated as a single combined position:

Combined Kelly fraction = 1 − P(both lose) × (appropriate single-bet Kelly)

Practically: cap total correlated exposure to any single event at 3% of bankroll regardless of how many markets you bet.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Implementing Kelly in a Real Betting Operation',
  'implementing-kelly-real-operation',
  '## Kelly Is a Framework, Not a Calculator

The Kelly Criterion gives mathematically optimal stakes given perfect probability estimates. In a real operation, probability estimates are uncertain, and the Kelly calculation must account for this uncertainty.

## Step 1: Produce Your Probability Estimate

Your model outputs a probability (e.g. 48% for home team to win).

**Important:** Is this estimate well-calibrated? If your model is known to produce overconfident estimates (common), apply a shrinkage factor before using in Kelly. A 15% shrinkage: 48% × 0.85 + 50% × 0.15 = 48.3% (minimal shrinkage in this case) — for strongly overconfident models, apply larger shrinkage.

## Step 2: Calculate Full Kelly Fraction

f* = (b × p − q) / b

Where b = decimal odds − 1, p = calibrated probability estimate, q = 1 − p.

## Step 3: Apply Fractional Kelly

Multiply by your chosen fraction (25–50% for most practitioners).

## Step 4: Apply Market-Specific Cap

Check the market cap from your bankroll management rules. The final stake is the lower of:
- Fractional Kelly stake
- Market-specific cap
- Maximum bet allowed by bookmaker/exchange

## Step 5: Round to Practical Unit

Real bets are placed in whole pounds or dollars. Round down (never up) to the nearest practical unit.

## Step 6: Log the Kelly Calculation

Record: full Kelly %, fraction used, final stake %. After 200+ bets, analyse whether your Kelly fractions are well-calibrated — are you over or under-betting relative to the optimal fraction given actual results?

## Automating Kelly Calculations

Build a spreadsheet that accepts: probability estimate, decimal odds, bankroll size, fraction choice, and cap. It returns the recommended stake. Run this for every bet before placing. This removes the temptation to deviate from the calculated stake.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id,
  'Expert Staking: Unified Bankroll Management System',
  'expert-staking-unified-system',
  '## The Complete System

At the expert level, staking is not decided bet-by-bet. It is determined by a unified bankroll management system that integrates staking strategy, risk limits, portfolio rules, and review protocols into a single operating framework.

## The System Architecture

**Core staking rule:**
Stake = (EV% / 3) × bankroll × Kelly fraction (25%)

This produces stakes proportional to edge, scaled by bankroll, constrained by the 25% Kelly fraction. Reference EV of 3% = 1 unit (standard stake).

**Hard limits (override the formula if exceeded):**
- Maximum per bet: 2% of bankroll
- Maximum correlated exposure per event: 3% of bankroll
- Minimum per bet: 0.25% (avoid administrative cost on trivial stakes)
- Outright market maximum: 1.5% per market

**Stop-loss triggers:**
- Daily: pause at −5 units
- Weekly: pause at −15 units
- Drawdown: review at −25 units from peak

**Review schedule:**
- Weekly: balance reconciliation, stop-loss status check
- Monthly: ROI review, CLV review, account health update
- Quarterly: calibration test, Kelly fraction review, model performance

## The Calibration Review

Quarterly, review your Kelly performance:
- Calculate what your results would have been at flat 1% staking
- Compare to what they actually were at your variable staking
- If variable staking outperforms flat: your edge estimates are directionally correct
- If flat outperforms: your edge estimates are adding noise — simplify to flat staking

## The Long-Run Proof

A unified staking system, applied consistently over 3–5 years:
- Provides a complete, auditable record of every betting decision
- Enables rigorous performance attribution (selection quality vs staking quality)
- Builds the statistical sample required to validate edge with high confidence
- Demonstrates professional-grade risk management to potential investors or partners

This system is not glamorous. It is the operational backbone that separates sustainable professional operations from high-variance hobbyist betting.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'staking-strategies' AND cat.slug = 'bankroll-management';
