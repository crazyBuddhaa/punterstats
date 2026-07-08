-- ============================================================
-- PunterStat — Betting Academy: Betting Psychology New Modules
-- Migration 034: Add 4 new modules (10 lessons each)
--   Module 3: Emotional Control Under Pressure  (intermediate)
--   Module 4: Decision-Making Frameworks         (intermediate)
--   Module 5: Mental Models for Uncertainty      (advanced)
--   Module 6: The Professional Bettor Mindset    (expert)
-- ============================================================

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Emotional Control Under Pressure', 'emotional-control-under-pressure',
  'How to recognise and manage the emotional states that distort betting decisions — tilt, chasing, euphoria, and fear — with practical protocols.',
  'intermediate', true, 3
FROM public.course_categories WHERE slug = 'betting-psychology';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Decision-Making Frameworks for Bettors', 'decision-making-frameworks-bettors',
  'Structured thinking frameworks — pre-mortems, reference class forecasting, Bayesian updating — applied to betting decisions.',
  'intermediate', true, 4
FROM public.course_categories WHERE slug = 'betting-psychology';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'Mental Models for Betting Under Uncertainty', 'mental-models-betting-uncertainty',
  'The core mental models — base rates, regression to the mean, expected value — that underpin rigorous probabilistic thinking in markets.',
  'advanced', true, 5
FROM public.course_categories WHERE slug = 'betting-psychology';

INSERT INTO public.courses (category_id, title, slug, description, level, is_published, sort_order)
SELECT id, 'The Professional Bettor Mindset', 'professional-bettor-mindset',
  'The psychological characteristics, habits, and identity shifts that distinguish long-term professional bettors from skilled amateurs.',
  'expert', true, 6
FROM public.course_categories WHERE slug = 'betting-psychology';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 3 — Emotional Control Under Pressure            ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Understanding Tilt in Betting', 'understanding-tilt-betting',
'## What Is Tilt?

The term "tilt" comes from poker: the state of emotional disturbance that follows a painful loss, causing a player to make irrational, aggressive decisions to recover. In betting, tilt is any emotional state that causes you to deviate from your rational process in response to recent results.

## The Neurological Basis

Losses activate the amygdala (the brain''s threat-response centre) more strongly than equivalent gains activate the reward system. A £100 loss produces a stronger emotional response than a £100 win — known as loss aversion. When the amygdala is activated, it competes with the prefrontal cortex (rational decision-making) for cognitive resources.

In tilt, the amygdala is winning.

## Tilt Triggers in Betting

- A "sure thing" loses in injury time
- A VAR decision overturns what appeared to be a winning goal
- Three consecutive losses in markets you feel highly confident about
- A significant profitable run that then reverses
- A large stake on a bet that goes badly wrong

## Tilt Symptoms

Physical: increased heart rate, muscle tension, restlessness
Cognitive: urge to place more bets immediately, difficulty thinking about anything else, minimising the significance of losses
Behavioural: placing bets outside your normal market scope, increasing stakes above your normal limit, reduced analysis time per selection

## The Tilt Identification Protocol

Create a personal tilt symptom list: the specific physical and cognitive signals that tell you tilt is beginning. Review this list before each betting session. If you identify more than 2 symptoms: mandatory 24-hour pause.

The pause is not weakness. It is the most profitable decision available in that moment.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Chasing Losses: Recognition and Prevention', 'chasing-losses-recognition',
'## The Chasing Behaviour Pattern

Chasing losses is increasing bet frequency, stake size, or risk level in an attempt to quickly recover lost funds. It is one of the most destructive behaviours in betting — and one of the most common.

## Why Chasing Feels Rational

In the moment, chasing has a seductive logic: "If I increase my next stake, I can win back everything I lost in one bet." Mathematically, this is true — one large winning bet does return you to breakeven. The problem is that increasing stake size does not increase win probability. You are taking on more risk without any increase in expected return.

## The Escalation Pattern

Standard stake: £20. After 3 losses: £40 stake. After 4th loss: £80. After 5th loss: "I''ll get it all back if I put £150 on the next one."

This geometric stake escalation is precisely the Martingale pattern — which we know eventually produces catastrophic loss.

## Prevention System

**Pre-set daily loss limit:** "I will not place another bet today after losing more than 5 units." This rule is written down and placed where you see it during betting sessions.

**The cooling-off period rule:** After any loss that triggers the emotional urge to bet again immediately: mandatory 30-minute break. Walk away from the device. The urge to chase almost always dissipates after 30 minutes of no-screens activity.

**Stake lock:** After a losing day, stakes revert to 75% of normal until a positive-CLV day occurs. This is the opposite of chasing: measured reduction, not escalation.

## The Accountability Call

If chasing is a persistent pattern: tell your accountability partner immediately after any session where you chased. The discomfort of this disclosure is a powerful preventative against future chasing.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Euphoria Management: The Winning Streak Problem', 'euphoria-management-winning-streak',
'## The Winning Streak Illusion

A sustained winning run produces euphoria: the feeling that you cannot lose, that your analysis is perfect, that the method is flawless. This state is as dangerous as tilt — perhaps more so, because it feels positive.

## How Euphoria Harms Performance

**Stake inflation:** "I''m winning so consistently I can afford to bet more." This ignores that the winning run will end, and higher stakes will amplify the ensuing losses.

**Scope expansion:** "I''m so good at football AH, why not try basketball props?" Euphoria reduces the perceived risk of venturing into unvalidated markets.

**Analysis reduction:** "I don''t need to run the model as carefully — my intuition is working great." The analysis quality degrades precisely when stakes are elevated.

**Withdrawal delay:** "I''ll withdraw profits at the end of the season — I want to keep compounding." Extended compound periods mean larger bankrolls at risk during inevitable variance events.

## The Post-Win Protocol

After any winning run of 10+ bets:
1. Run a full CLV analysis of the winning run — was it above-market prices (genuine edge) or lucky outcomes (variance)?
2. Compare stakes used during the winning run to pre-run Kelly calculations — have stakes drifted above plan?
3. Perform a market-scope audit — are all bets during the run within your validated market boundaries?

## The Emotional Symmetry Target

The goal is symmetry: the same calm, analytical state after 10 consecutive wins as after 10 consecutive losses. Neither state should produce behavioural change beyond what the Kelly formula prescribes. This symmetry is one of the clearest markers of psychological maturity in betting.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Fear-Based Decision Errors', 'fear-based-decision-errors',
'## The Other Side of Tilt

While tilt and chasing involve excessive action, fear produces the opposite error: excessive caution at exactly the wrong time.

## Fear Manifestations in Betting

**The overly early cash-out:**
A bet that is winning comfortably early in the game triggers the fear of losing the profit. The bettor cashes out at a price that locks in a partial win — but sacrifices significant expected value.

**Reducing stakes after a bad run:**
Beyond what Kelly recommends, fear drives stakes down to near-zero levels. The bettor is present in the market but not meaningfully extracting the edge they have.

**Strategy abandonment:**
After a losing run, fear of further loss causes the bettor to stop betting entirely — precisely when the market may be most favourable if their edge was real and recent losses were variance.

**The "can''t lose" selection paralysis:**
Fear of another loss causes the bettor to raise the bar for bet selection impossibly high, effectively removing themselves from the market.

## The Fear Analysis

When you notice fear-driven behaviour: name it explicitly. "I am avoiding placing this bet because I am afraid of losing, not because the analysis is weak." This naming alone often dissolves the fear enough to take the analytical action.

## The Expected Value Override

Fear decisions should always be tested against expected value: "What is the expected outcome of cashing out now vs holding?" If holding has positive expected value versus cash out, the fear-based early cash-out is objectively incorrect. Let EV be the override mechanism for fear-based impulses.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Breathing and Physical Regulation Techniques', 'breathing-physical-regulation',
'## The Body-Brain Connection

Emotional states are not purely mental — they are embodied. Fear, tilt, and euphoria each have physical signatures. Regulating the physical state is one of the fastest ways to regulate the emotional state.

## The Physiological Sigh

Research at Stanford (Huberman et al.) has identified the physiological sigh — a double inhalation through the nose followed by a long exhale through the mouth — as the fastest method for reducing physiological arousal.

One physiological sigh produces measurable heart rate reduction within 30 seconds. Two to three cycles reduce cortisol signalling within 60 seconds.

Application: before any high-stakes bet placement, perform 2–3 physiological sighs. This reduces the activation of the fight-or-flight system that drives impulsive decisions.

## Cold Water

Splashing cold water on the face activates the diving reflex — a parasympathetic (calming) response that reduces heart rate rapidly. 30 seconds of cold water on face and wrists before a betting session can meaningfully shift the physiological starting state.

## Movement Breaks

30–60 minutes of sitting in front of markets builds physical tension and contributes to poor decision-making in later bets. A 5-minute movement break (walk, stretch, brief exercise) between analysis and bet placement resets the physical state.

## The Regulation Toolkit

Build your personal regulation toolkit from evidence-based techniques: breathing exercises, brief movement, cold water, music (specifically designed playlists for focus vs calm states). Know which technique works best for you in each state (tilt vs fear vs euphoria) and apply them deliberately, not as an afterthought.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Stress Management for Long-Term Bettors', 'stress-management-long-term',
'## The Accumulation of Betting Stress

A single losing bet produces minimal stress. A month of below-expectation results produces significant chronic stress — particularly if the bankroll represents a meaningful portion of savings or if betting is the primary income.

Chronic stress impairs decision-making, memory, and emotional regulation — the exact faculties required for profitable betting.

## Stress Sources Specific to Betting

**Result uncertainty:** Every open bet is an unresolved uncertainty. Multiple simultaneous open positions create sustained uncertainty that accumulates throughout the day.

**Performance pressure:** Self-imposed or investor-imposed performance expectations create pressure that converts normal variance into perceived failure.

**Social judgment:** Explaining to family members why you are betting, managing perceptions, keeping the activity private — these social stressors compound the performance stress.

**Identity threat:** A significant losing run challenges the self-concept of "I am good at this" — producing existential stress beyond the financial.

## The Stress Reduction Framework

**Perspective calibration:** At least weekly, remind yourself that betting decisions made today will only be evaluable in 500+ bets. Any single week''s results are noise. This is a fact, not a consolation.

**Position reduction at peak stress:** If stress is genuinely high (life event, financial pressure, relationship stress), reduce bet frequency by 50% until stress is managed. High-stress betting is always low-quality betting.

**Professional support:** If betting-related stress is affecting sleep, relationships, or daily functioning: speak to a mental health professional. This is not a sign of addiction — it is a rational response to operating a high-variance enterprise. The intervention will pay for itself in better decision quality.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Pre-Bet Emotional Checklist', 'pre-bet-emotional-checklist',
'## The Decision Point

Every bet has a placement moment — the point at which you enter the stake and confirm the bet. This moment is the intervention point for emotional regulation.

## The 60-Second Pre-Bet Checklist

Before confirming any bet above your minimum threshold:

**1. Emotional state check (10 seconds):**
"On a scale of 1–5, how calm and analytical am I feeling right now?" If below 3: pause, apply regulation technique, recheck.

**2. Process validation (20 seconds):**
"Did I analyse this bet before looking at the price? Is this within my defined market scope? Is the stake within my pre-calculated range?" If any answer is no: stop.

**3. Motivation check (10 seconds):**
"Am I placing this bet because the model says there is value, or because I want to bet?" If the latter: stop.

**4. Last-look price check (10 seconds):**
"Is the price still at or above where my analysis identified value? Has significant line movement occurred since my analysis?" If the price has moved significantly against you: reassess.

**5. Confirm (10 seconds):**
If all checks pass: place the bet at the calculated stake.

## Making the Checklist Automatic

Initially, run the checklist explicitly, step by step. After 100 bets, it becomes semi-automatic: a brief internal scan that takes less than 60 seconds. After 500 bets, it becomes the natural preparation before every bet — not felt as a checklist but as the normal way of placing a bet.

## The Override Record

Any time you override the checklist (place a bet that fails one of the five checks), log the reason. Review these logs monthly. If override frequency is increasing: investigate why the process is being bypassed.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Detachment: Not Caring About Individual Outcomes', 'detachment-individual-outcomes',
'## The Paradox of Caring

Bettors who care intensely about individual bet outcomes make worse decisions than bettors who are genuinely indifferent to individual outcomes. This sounds counterintuitive — surely caring more produces better performance?

The issue: caring about outcomes, rather than process, produces all the emotional distortions described in this module. Tilt, chasing, euphoria, and fear are all downstream of caring too much about individual results.

## The Portfolio Mindset

A portfolio manager running 500 positions does not experience significant stress when position #247 loses money. They monitor the portfolio''s overall performance against the benchmark. Individual position losses are expected — they are the cost of operating a diversified position set.

The betting equivalent: each bet is one data point in a 1,000-bet portfolio. The individual outcome is irrelevant. The aggregate performance of the portfolio is the only meaningful measure.

## Building Genuine Detachment

Detachment is not pretending not to care. It is genuinely internalising the following fact: the outcome of this specific bet is not in my control. The quality of the analysis and execution is in my control. Since I can only influence the controllable, I focus on that — and accept the outcome with equanimity.

This is easier to say than to do. It is built through repetition: reviewing thousands of results and watching them average toward your model''s predictions. The more data you accumulate, the more visceral the understanding that individual outcomes are noise.

## The 1,000-Bet Perspective

Ask about every bet: "Will I remember this specific outcome in 1,000 bets?" The answer is almost always no. From 1,000 bets in the future, this result will be one row in a spreadsheet, visible only in aggregate. Treat it accordingly now.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Routines as Emotional Infrastructure', 'routines-emotional-infrastructure',
'## Why Routines Work

Routines reduce decision fatigue by automating repeated choices. When the routine handles the decision, emotional resources are preserved for the decisions that actually require them.

In betting, the pre-session ritual, the bet placement checklist, the post-session debrief, and the monthly review are all routines. Each routine reduces the emotional load of the activity and creates a consistent psychological environment for decision-making.

## Designing Your Betting Routine

**The session start anchor:**
A specific physical action that consistently signals the beginning of a betting session. Example: making a specific drink, sitting in a specific chair, opening the spreadsheet first (before any bookmaker site). This anchor trains the brain to enter analytical mode reliably.

**The session end anchor:**
A specific action that signals the end of the session and full disengagement. Example: closing all bookmaker tabs, writing the session summary, turning off the screen. This prevents the drift into restless monitoring of open positions.

**The separation ritual:**
A 10-minute activity that creates clear psychological separation between the betting session and the rest of life. Physical activity is most effective. A short walk, 10 minutes of stretching, or a brief exercise routine creates a clean boundary.

## The Routine as a Mood-Independent System

The most valuable property of a routine: it operates regardless of mood. On a motivated day and on a resistant day, the same actions are performed in the same sequence. The routine does not depend on motivation — which is unreliable — but on habit, which is far more robust.

## Building the Habit Loop

Habit formation requires: cue → routine → reward. Define your cue (time of day, completing the model run), your routine (the sequence above), and your reward (a small, defined pleasure after the session ends). The reward is not another bet — it is something entirely unrelated to betting.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Emotional Regulation: The Integrated Practice', 'expert-emotional-regulation',
'## The Integration Challenge

Each lesson in this module has described specific techniques for emotional regulation: breathing exercises, checklists, routines, detachment practices, accountability systems. The expert challenge is not learning these techniques — it is integrating them into a seamless, sustainable daily practice.

## The Daily Emotional Regulation Stack

An expert-level emotional regulation practice for betting incorporates:

**Morning:**
- Physical movement (15–20 min): regulates stress hormones and creates a baseline physiological state
- Intention setting: "Today I will manage one portfolio session. The results are data, not judgements."
- Brief mindfulness practice (5 min): grounds the day in present-moment awareness

**Pre-session:**
- Emotional state check (1–5 scale)
- If < 3: no betting. If 3–5: proceed with session
- Session intention: which markets, how many bets expected, what is the stop-loss for today?

**During session:**
- Pre-bet checklist for every bet above minimum threshold
- Movement break every 45 minutes
- No result-based decisions (chasing or euphoria-based expansion)

**Post-session:**
- Log all bets (real time during session, confirmed post-session)
- Session debrief: any deviations from plan? Any emotional states identified?
- Separation ritual: 10 minutes of activity fully unrelated to betting

**Weekly:**
- Performance review: numbers only, no narrative
- Emotional audit: what states did you experience? How did they affect decisions?

## The Long-Run Transformation

The expert bettor who has operated this integrated practice for 2–3 years will not experience betting as emotionally demanding — not because the variance has reduced, but because their relationship with outcomes has fundamentally changed. Results are information. Process is identity. Variance is expected. This transformation is the highest-value outcome of psychological work in betting — more valuable than any single analytical improvement.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'emotional-control-under-pressure' AND cat.slug = 'betting-psychology';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 4 — Decision-Making Frameworks for Bettors      ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Reference Class Forecasting', 'reference-class-forecasting',
'## The Outside View

When making predictions, humans naturally default to the "inside view" — focusing on the specific details of the case at hand. Reference class forecasting uses the "outside view" instead: what is the base rate for this class of event?

## The Classic Example

An analyst is asked to predict whether a new company will be profitable within 3 years. The inside view focuses on this company''s specific business plan, management team, and market opportunity. The outside view asks: what percentage of companies in this industry with similar starting conditions became profitable within 3 years?

If the historical base rate is 25%, that is your starting probability — regardless of how compelling the specific business case looks.

## Application to Betting

**The underdog upset rate:**
Rather than analysing whether this specific underdog can win, ask: what is the historical win rate for underdogs in this specific odds range against this type of favourite in this competition?

If underdogs at 4.00–5.00 win 22% of matches (implied probability 20–25%), and the bookmaker prices this underdog at 4.50 (22% implied): no value. The base rate and the price are aligned.

**The clean sheet rate:**
Rather than assessing whether this specific defence will keep a clean sheet, ask: what percentage of matches between teams at this quality differential produce a clean sheet for the better defence?

## The Base Rate Table

Build a personal base rate reference table from historical data in your target leagues:
- Win rate by odds range (1.20–1.40, 1.40–1.60, etc.)
- Draw rate by match quality differential
- Clean sheet rate by defensive ranking
- Over/Under hit rate by expected goals range

These base rates are the empirical outside view against which inside-view adjustments should be modest and specific.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Bayesian Updating: Reasoning From Evidence', 'bayesian-updating-evidence',
'## The Bayesian Approach

Bayesian reasoning is a formal framework for updating beliefs in response to new evidence. Rather than forming fixed opinions, Bayesian thinkers hold beliefs as probabilities and update those probabilities when new information arrives.

## The Basic Formula

P(A|B) = P(B|A) × P(A) / P(B)

Where:
- P(A) = prior probability of A before new evidence
- P(B|A) = probability of observing evidence B given A is true
- P(B) = total probability of observing evidence B
- P(A|B) = posterior probability of A after observing B

In plain language: start with your prior belief. Update it based on how likely the new evidence would be if your belief were true.

## Betting Application

**Prior:** Your model gives Team A a 50% win probability.

**New information:** Key centre-back is confirmed absent.

**Bayesian update:**
- What is the historical win rate for Team A without this player? (-5% vs average)
- Revised probability: 45%

**Further update:** Heavy rain forecast.
- Historical data: heavy rain reduces home win rate by 3% in this league
- Revised probability: 42%

The Bayesian approach gives a principled mechanism for incorporating new information without abandoning the prior estimate entirely.

## The Key Discipline

Bayesian updating requires honest prior estimates (not anchored to market prices) and honest assessment of how diagnostic the new evidence is. "The coach said they''re confident" is low-diagnostic evidence — it changes the probability by very little. "The starting goalkeeper is confirmed out" is high-diagnostic — it changes the probability significantly.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Pre-Mortem Analysis for Betting Decisions', 'pre-mortem-analysis-betting',
'## What Is a Pre-Mortem?

The pre-mortem is a decision analysis technique developed by psychologist Gary Klein. Before committing to a decision, you imagine it is 6 months in the future and the decision has failed catastrophically. Then you ask: "What went wrong?"

This prospective hindsight — imagining the failure before it happens — generates a richer list of potential failure modes than standard risk assessment.

## Pre-Mortem Applied to Betting

**Standard analysis approach:** "Team A should win because they have the superior xG, the home advantage, and the better recent record."

**Pre-mortem addition:** "It is 5 minutes after full time. Team A has lost 1-0. Why did I get this wrong?"

Possible answers generated by the pre-mortem:
- "Team A''s defensive xGA was inflated by weak opponents recently"
- "The referee historically favours defensive, counter-attacking play"
- "Team B''s new striker is not in my model yet — he joined midweek"
- "Team A has 3 key players who played 90+ minutes on Tuesday"

## Using the Pre-Mortem Output

Each pre-mortem response is a check:
- Is this failure mode accounted for in my analysis? (If yes: confidence maintained)
- Is this failure mode NOT accounted for? (Reduce confidence, or add to the analysis)
- Is this failure mode impossible to assess? (Acknowledge irreducible uncertainty, reduce stake)

## When to Use Pre-Mortems

Use the pre-mortem on:
- Any bet above your standard unit (higher-stake bets warrant more rigorous analysis)
- Selections in unfamiliar leagues or match contexts
- Selections with strong narrative support (the "obvious" bet that everyone likes)

The obvious bet that survives a rigorous pre-mortem is a better bet than the obvious bet accepted uncritically.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Inversion Thinking in Betting Analysis', 'inversion-thinking-betting',
'## Think Backwards

Inversion thinking — approaching problems by thinking about what you want to avoid, then working backwards — is a powerful analytical tool often neglected in betting.

Charlie Munger''s principle: "Invert, always invert." Rather than asking "how do I win?", ask "what causes betting operations to fail?"

## What Makes Betting Operations Fail?

Working through this list creates the foundation of good practice by identifying its opposite:

1. **No validated edge** → Solution: never bet without CLV validation
2. **Over-staking** → Solution: strict Kelly fraction discipline
3. **No stop-loss** → Solution: written, enforced stop-loss rules
4. **Betting outside your competence** → Solution: defined market scope, enforced
5. **Emotional decision-making** → Solution: process-first systems
6. **Confirmation bias in selection** → Solution: pre-mortem, blind data review
7. **Account restriction from winning too visibly** → Solution: deliberate account management
8. **Model becomes stale** → Solution: quarterly calibration reviews

## The Inversion Applied to Individual Bets

Instead of asking "why will Team A win?" ask:
"What are all the reasons Team A will NOT win?"

Then assess whether each reason is:
- Already reflected in the market price (already priced in: no additional information)
- Not reflected in the market price (potential edge if negative OR if your analysis resolves the concern)

## The Pre-Bet Inversion Habit

For each selection: spend 2 minutes explicitly arguing against the bet. Write down every reason it might lose. Only if you can address each counterargument with specific data should you proceed.

This reversal of the usual "find reasons to bet" approach dramatically reduces the false positives that drain value through poorly-reasoned selections.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The 10/10/10 Framework for High-Stakes Decisions', 'ten-ten-ten-high-stakes',
'## Suzy Welch''s Framework Applied to Betting

The 10/10/10 framework asks three time-horizon questions about any decision:

1. How will I feel about this in 10 minutes?
2. How will I feel about this in 10 months?
3. How will I feel about this in 10 years?

This framework is designed to counter the emotional weight of immediate feelings by distributing perspective across multiple time horizons.

## Application to Betting Decisions

**Scenario: You are considering placing a £300 bet (3× normal stake) on a team you feel strongly about.**

10 minutes: "I''ll feel excited to have a larger position. If it wins, I''ll feel great."
10 months: "If I made this a habit and it lost, it would have meaningfully impacted my bankroll. Was the analysis worth 3× normal stake?"
10 years: "One oversized bet either way will be invisible in a 10-year record. But the habit of oversizing bets when I feel strongly is clearly visible in a 10-year record."

The 10-year perspective reveals: it is the habit, not the individual bet, that matters.

## The Discipline Framework Version

For discipline decisions (should I skip the bet log tonight? should I use the stop-loss today?):

10 minutes: "Skipping the log is easier right now."
10 months: "I will have gaps in my data that make calibration impossible."
10 years: "A habit of skipping the log means a non-functional record. Everything I claimed to learn from the data is invalidated."

The 10-year perspective reveals: the small shortcuts compound into fundamental operational failures.

## Using 10/10/10 for Emotional Override

When an emotional impulse (to chase, to skip a step, to increase stakes dramatically) arises: apply 10/10/10 before acting. The 10-month and 10-year perspectives almost always support the process-consistent decision over the emotionally driven one.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Decision Journaling for Bettors', 'decision-journaling-bettors',
'## The Decision Journal

A decision journal is a written record of significant decisions: what you decided, what information you had, what reasoning you applied, and what you expected to happen. Later, you revisit the journal to see what actually happened — and what you got right or wrong.

The bet log is a decision journal for bet selections. The decision journal extends this to strategic decisions: entering a new market, changing your staking method, adding a new strategy.

## What to Record

For each significant decision (not individual bets — those are in the bet log):

- **Decision:** What did I decide?
- **Context:** What was the situation? What information did I have?
- **Reasoning:** Why this decision? What alternatives were rejected and why?
- **Expected outcome:** What do I expect to happen? By when?
- **Emotional state:** What was I feeling when I made this decision?
- **Review date:** When will I check whether the decision was correct?

## Example Decision Journal Entry

**Date:** March 15
**Decision:** Add basketball player props as a second strategy starting April
**Context:** My football AH strategy has 200+ bets of positive CLV. Basketball props seem similar in terms of statistical predictability. NBA injury report timing creates clear edge windows.
**Reasoning:** Diversification benefit, uncorrelated with football, available analysis infrastructure.
**Expected outcome:** Positive CLV within 100 bets; positive ROI within 200.
**Emotional state:** Enthusiastic, possibly slightly overconfident.
**Review date:** September 15 (after 6 months)

## The Review Discipline

Set calendar reminders for every decision journal entry review date. At review: did the decision produce the expected outcome? If not: why not? What would you decide differently?

This structured learning loop produces genuine expertise improvement that casual experience does not.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Separating Signal from Noise in Results', 'separating-signal-from-noise',
'## The Fundamental Challenge

Every result is a mix of signal (reflecting genuine edge or its absence) and noise (random variance). The central challenge of performance evaluation in betting is separating these two components.

## The Sample Size Reality

Statistical significance in betting requires large samples:
- 100 bets: almost no distinguishable signal from noise
- 300 bets: weak signal — trend visible but not reliable
- 500 bets: moderate confidence in edge estimation
- 1,000 bets: strong confidence; 95% CI narrow enough for meaningful conclusions
- 2,000+ bets: near-definitive edge validation

A 5% ROI over 200 bets could be genuine edge OR luck. The same 5% ROI over 1,000 bets is very likely genuine edge.

## The CLV Shortcut

CLV-based analysis is signal-rich even at smaller samples. Because CLV compares your price to the most efficient price in the market (Pinnacle closing), positive CLV at 200 bets is more informative than positive ROI at 200 bets.

This is why CLV tracking is the preferred short-sample indicator — it filters out result noise and isolates the genuine market position signal.

## The Noise Floor

All betting strategies operate above a "noise floor" — the level below which results cannot be reliably distinguished from chance. Operating near this floor (with small samples and small edge) requires particular discipline: acting on results that may be noise creates costly strategy changes.

The discipline: do not change a strategy based on short-sample results. Change a strategy based on long-sample CLV trends, model calibration failures, or clear process errors — not because results have been bad for 2 months.

## The Signal Test

Before making any strategic change based on results: ask "Is this signal or noise?" Calculate the 95% confidence interval for your performance metric. If the confidence interval includes zero (no edge): cannot distinguish from noise. Do not change strategy.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Opportunity Cost Thinking in Betting', 'opportunity-cost-betting',
'## Every Decision Has a Cost

Opportunity cost is the value of the next-best alternative foregone. In betting, opportunity cost thinking reveals hidden costs that are easy to ignore.

## The Capital Opportunity Cost

Capital tied up in outright bets or floats at bookmakers has an opportunity cost: that capital could be generating returns elsewhere.

**Example:** £1,000 in an outright bet for 8 months, expected return: £80 (8%).
Alternative: £1,000 in a premium bond account at 4% APR for 8 months: £27 guaranteed.

The opportunity cost of the outright is £27. The net advantage of the outright over the alternative: £53. Is the outright''s risk worth £53 advantage? Only the individual bettor can answer.

## The Attention Opportunity Cost

Time spent on low-value betting activities has an opportunity cost: time not spent on high-value activities.

2 hours watching your open positions anxiously produces zero expected value. 2 hours developing and backtesting a new model feature potentially produces significant long-run expected value. The opportunity cost of the anxious watching is the model development.

## The Account Opportunity Cost

Keeping large floats in soft bookmaker accounts has an opportunity cost: that capital earns no return between bets.

Optimising float management — keeping the minimum necessary in each account, holding the remainder in a high-interest savings account — adds marginal but real return to the total operation.

## The Decision Opportunity Cost

Every bet placed is a decision to stake a unit. An alternative to placing this bet is preserving the unit for a better bet tomorrow. With a limited daily bet count target, each selection decision has an opportunity cost of the bets you did not place instead.

This framing forces prioritisation: if you can only bet on 3 matches today, which 3 provide the strongest edge?',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Decision-Making Audit', 'decision-making-audit',
'## Auditing Your Decisions, Not Just Your Results

A results audit tells you how much you won or lost. A decision audit tells you whether your decisions were correct — regardless of outcomes.

Every significant decision — bet placement, stake size, strategy change — can be evaluated on process quality independent of result. A well-reasoned decision that loses is better than a poorly-reasoned decision that wins.

## The Quarterly Decision Audit Process

**Step 1:** Review the last quarter''s bet log. Identify 10–15 significant decisions (largest bets, bets outside normal scope, strategy changes).

**Step 2:** For each decision: reconstruct the reasoning from your notes. What did you know? What did you decide? Why?

**Step 3:** Evaluate the reasoning quality independently of outcome:
- Was the analysis based on a model and data, or intuition?
- Were biases potentially active? (Describe the bias if yes)
- Was the stake within Kelly guidelines?
- Was the selection within your validated market scope?

**Step 4:** Assign a decision quality score (1–5) for each reviewed decision.

**Step 5:** Identify the most common decision quality failures. These are the process improvements for next quarter.

## The Decision Quality vs Outcome Matrix

| | Good Decision | Bad Decision |
|---|---|---|
| **Win** | Deserved win | Lucky win |
| **Lose** | Unlucky loss | Deserved loss |

Profitable bettors optimise for the top-left (deserved wins) and minimise the bottom-right (deserved losses). The top-right (lucky wins) and bottom-left (unlucky losses) are temporary — they revert to the mean. Only decision quality is sustainable.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Decision Architecture: The Complete Framework', 'expert-decision-architecture',
'## Decision Architecture Defined

Decision architecture is the deliberate design of the environment and processes in which decisions are made. Rather than improving individual decisions one at a time, decision architecture improves the systematic conditions that govern all decisions.

## The Five Pillars of Expert Betting Decision Architecture

**Pillar 1 — Information structure:**
Define exactly what information you need for each decision type and exactly where you get it. The decision process starts only when the required information is present. No information = no decision = wait.

**Pillar 2 — Sequence design:**
Define the order of steps for every decision type. Analysis before price. Probability before EV. EV before stake. Stake before placement. Placement is the last step, not the first.

**Pillar 3 — Constraint system:**
All decisions operate within constraints: market scope, stake range, daily limits. Constraints are non-negotiable. They are not defaults to be overridden — they are the architecture within which decision quality is expressed.

**Pillar 4 — Feedback loops:**
Every decision type has a feedback mechanism. Bets → CLV. Strategy decisions → quarterly decision audit. Stake decisions → rolling Kelly calibration. Without feedback, decisions cannot improve.

**Pillar 5 — Environmental design:**
The physical and digital environment in which decisions are made is designed to support good decisions. One platform open at a time. Pre-calculated stakes visible before prices. Session boundaries enforced by physical ritual.

## The Integration Advantage

A betting operation with all five pillars in place makes consistently better decisions — not because each individual decision is thought about more carefully, but because the system design removes the conditions that produce poor decisions.

The paradox: the expert bettor thinks less about individual bets than the amateur, because the architecture handles the decision so that only genuine analytical insight is required — not willpower, vigilance, or discipline in the moment.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'decision-making-frameworks-bettors' AND cat.slug = 'betting-psychology';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 5 — Mental Models for Betting Under Uncertainty  ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expected Value as a Decision Lens', 'expected-value-decision-lens',
'## The Master Mental Model

Expected value (EV) is the single most important mental model for betting decisions. Every other framework ultimately serves to produce a more accurate EV estimate.

EV = P(win) × Net profit + P(lose) × Net loss

A positive EV bet: expected to profit long-run. A negative EV bet: expected to lose long-run.

## Thinking in Expected Value, Not Outcomes

The fundamental mental shift: evaluate every bet not by "will this win?" but by "what is the expected value of this decision?"

A bet at 3.00 with a 40% win probability:
EV = 0.40 × 2 + 0.60 × (−1) = 0.80 − 0.60 = +0.20 per unit

This bet has positive EV. It will lose 60% of the time. The outcome does not determine whether the bet was correct — the EV estimate does.

## Separating Decision Quality from Outcome

Once EV thinking is internalised, losing bets no longer feel like failures. A well-reasoned bet with positive EV that loses is a correct decision with an unfavourable outcome. The decision is evaluated on the EV, not the outcome.

This separation is psychologically challenging but essential. It prevents the feedback loop where losing bets lead to process changes regardless of whether the analysis was correct.

## Applying EV Consistently

Extend EV thinking beyond individual bets:
- Should I cash out now? EV of holding vs EV of cash out
- Should I add this new market? Expected EV from this market vs opportunity cost
- Should I take this large stake? Expected value of 3× stake vs 1× stake given my edge estimate and variance

Every significant betting decision can be framed as an EV comparison between alternatives.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Base Rate Neglect and How to Fix It', 'base-rate-neglect-fix',
'## The Bias Toward the Specific

Base rate neglect is the tendency to underweight statistical base rates in favour of specific case information. In betting, you know the specific details of the match (form, injuries, motivation) and may underweight the general statistical base rate (how often do teams in this position win?).

## The Classic Demonstration

Kahneman''s cab problem: A witness identifies a cab as blue in a city where 85% of cabs are green and 15% are blue. Witnesses correctly identify colours 80% of the time. What is the probability the cab is actually blue?

Bayesian answer: P(blue|witness says blue) = (0.80 × 0.15) / (0.80 × 0.15 + 0.20 × 0.85) = 12% / 29% ≈ 41%

Despite the witness saying "blue," the base rate (85% green) means it is still more likely to be green. Most people ignore this.

## Base Rate Neglect in Betting

A punter analyses an away team''s attack and concludes they will score 2+ goals. The analysis focuses on their attackers'' quality, the home defence''s weaknesses, and the match motivation.

The base rate: away teams score 2+ goals in only 18% of top-division matches.

If the analysis ignores the base rate, the probability estimate is likely too high. The correct approach: start with 18%, then adjust up or down based on specific case information.

## The Correct Integration

Base rate + specific information adjustment:
- Base rate: 18% (away teams score 2+)
- Team quality adjustment: +4% (stronger than average away attack)
- Match context adjustment: +2% (defensive injury to home team)
- Adjusted estimate: 24%

Compare to the implied probability in the market. The base rate discipline prevents overconfident estimates from specific case analysis.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Regression to the Mean in Sports Performance', 'regression-to-mean-sports',
'## The Iron Law of Statistics

Regression to the mean is the statistical phenomenon where extreme performance tends to be followed by performance closer to the average. It occurs because extreme observations are partly caused by genuine quality and partly by random variation — and random variation does not persist.

## Sports Examples

**The striker on a purple patch:**
A striker has scored in 6 consecutive matches. His form is celebrated as exceptional. But: some of the goals were from outside his normal xG range (low probability shots that happened to go in). As the random component of scoring regresses, his goal rate normalises. The question is whether the underlying xG rate (the genuine component) is better than baseline.

**The goalkeeper with 3 clean sheets:**
A goalkeeper who has kept 3 consecutive clean sheets is praised as "in form." But clean sheets are heavily team-dependent. If the defence in front of him has not genuinely improved, the clean sheet run likely reflects favourable opponents and random variation — not a step change in goalkeeper quality.

**The team that conceded 0 goals in 5 matches:**
Investigate the xGA (expected goals against) over those 5 matches. If xGA was high but actual goals was zero: the defence benefited from exceptional goalkeeper performance and/or opponent misses. Regression toward the xGA trend is likely.

## The Market Opportunity

Markets often fail to adequately account for regression. After an extreme positive run, prices tighten excessively — overvaluing the team. This creates lay value or opposition backing value for the analytically rigorous bettor.

Rule: always check the underlying statistical rate alongside the headline result. If results and underlying rates diverge, regression of results toward rates is the base expectation.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Thinking in Distributions, Not Points', 'thinking-in-distributions',
'## The Single-Point Prediction Problem

Most bettors think in single-point predictions: "Arsenal will score 2 goals." "The match will end 1-0." These point predictions ignore the crucial fact that sports outcomes are probabilistic — there is a distribution of possible outcomes, not a single certain outcome.

## Switching to Distribution Thinking

Instead of "Arsenal will score 2 goals," think:
- P(0 goals) = 8%
- P(1 goal) = 22%
- P(2 goals) = 27%
- P(3 goals) = 23%
- P(4+ goals) = 20%

This distribution (derived from a Poisson model with Arsenal''s expected goals rate) is far more useful than a single point prediction. It allows you to calculate the probability of any total-goals outcome, any over/under line, and any scoreline.

## The Confidence Interval Discipline

For any prediction, always estimate a range rather than a point:
"I estimate Arsenal win probability at 52%, with a 90% confidence interval of 43–61%."

The width of the confidence interval reflects genuine uncertainty. A narrow interval means you have high-quality information. A wide interval means the outcome is genuinely uncertain — which should affect stake size.

## Expected Value from a Distribution

The full over/under model derives expected value from the entire probability distribution:

EV(Over 2.5 at 1.91) = P(over 2.5) × 0.91 + P(under 2.5) × (−1)
= (sum of P(3 goals) + P(4 goals) + ...) × 0.91 − (sum of P(0,1,2 goals)) × 1

Distribution thinking enables exact EV calculations rather than rough estimates.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Map Is Not the Territory', 'map-is-not-territory',
'## Alfred Korzybski''s Insight

"The map is not the territory" — the representation of reality is not reality itself. In betting, your model is the map; the actual match is the territory. The distinction is essential.

## How the Model Fails to Capture the Territory

**1. Model inputs are imperfect:**
xG models are built on historical data. They capture team quality as it was — not as it is after key personnel changes, tactical evolution, or injury absences.

**2. Model structure is simplified:**
A Poisson model assumes each goal is independent. In reality, goals affect match dynamics (a goal changes how both teams play). The model is a simplified map, not the territory.

**3. Unmeasured factors exist:**
Referee personality, weather not captured in data, player personal circumstances, locker room dynamics — these are real factors that the map does not represent.

## The Practical Implication

Model output is your best available estimate — not the truth. Hold it confidently enough to act (bet when the model says there is value) but loosely enough to update (revise when good information not in the model becomes available).

## Over-Fitting: When the Map Is Too Detailed

A model that is too closely fitted to historical data produces a map that is very accurate for the past but less accurate for the future. The model has learned the noise as well as the signal.

Test for overfitting: split historical data into training (80%) and test (20%) sets. If model performance on training data is significantly better than on test data: overfitting. Simplify the model.

## The Epistemic Humility Position

The expert bettor operates with explicit epistemic humility: "My model is a good map. It is not the territory. I will act on it confidently while acknowledging that it is an approximation of an uncertain reality."',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Second-Order Thinking in Markets', 'second-order-thinking-markets',
'## First vs Second-Order Thinking

First-order thinking: "Team A is better than Team B, so I back Team A."
Second-order thinking: "Team A is better than Team B, and everyone knows this — so the question is whether Team A is overpriced relative to their actual probability advantage."

First-order thinking produces conclusions. Second-order thinking produces conclusions about what other participants think — and exploits the gaps between consensus belief and actual probability.

## The Market as an Aggregation of First-Order Thinking

Efficient markets aggregate the beliefs of many participants. In efficient markets (Pinnacle, exchanges), first-order thinking is largely already priced in. The value exists in second-order insights: where does the consensus diverge from the actual probability?

## Second-Order Questions for Betting

"Everyone thinks Team A is strong because they won 4 in a row. What is the probability they continue winning at the rate the market now implies? Given regression to the mean, this probability is likely lower than the market price suggests."

"The media narrative is that this striker is in exceptional form. What is the probability the market is overweighting this narrative relative to his underlying xG rate?"

"Sharp money has moved Team B from 3.50 to 2.80. This is a significant move. Does my model confirm this move? Or does the sharp action reflect information I do not have?"

## The Crowd Psychology Overlay

Second-order thinking includes modelling how other bettors think — particularly the recreational majority who drive public money. Public money is typically biased toward: favourites, home teams, high-profile players, and recent winners. Understanding these biases identifies where the market is systematically pulled away from true probability.',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Law of Large Numbers and Patience', 'law-large-numbers-patience',
'## What the Law Guarantees

The law of large numbers states that as the number of trials increases, the sample average converges toward the population average. For betting: over a large enough sample, your actual ROI will converge toward your true edge.

## What It Does Not Guarantee

The law of large numbers says nothing about any finite sequence. In 500 bets with genuine 3% edge:
- Expected profit: 15 units
- Standard deviation of profit: approximately 32 units

Your actual result after 500 bets could plausibly range from −49 units to +79 units (95% interval). The law guarantees convergence eventually — not after any specific number of bets.

## The Patience Requirement

The law of large numbers demands patience: the willingness to continue operating the process through periods where results are below expectation, knowing that the long-run average will converge to the true edge.

Most bettors lack this patience. They exit strategies that are working because short-term results do not reflect the edge. They adopt new strategies because short-term results are attractive. Each switch restarts the sample — preventing the law of large numbers from doing its work.

## The Sample Accumulation Mindset

Treat every bet as a contribution to the sample. 100 bets in: sample is small, results are noisy. 1,000 bets in: sample is substantial, results reflect edge with reasonable accuracy. 5,000 bets in: sample is definitive, edge is validated or refuted.

The goal is not to win this week. The goal is to accumulate a valid sample that proves (or disproves) the edge — and then act appropriately on that evidence.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Efficient Market Hypothesis Applied to Betting', 'efficient-market-hypothesis-betting',
'## The EMH Framework

The Efficient Market Hypothesis (EMH) from finance states that asset prices reflect all available information. Applied to betting: an efficient betting market reflects all available information in its prices. No systematic edge is possible.

The fully efficient betting market does not exist — but understanding how close specific markets are to efficiency tells you where to look for edge.

## Market Efficiency Spectrum

**Highly efficient (close to no edge):**
- Pre-match Match Winner at Pinnacle (English Premier League, major European leagues)
- Pre-match Asian Handicap in high-liquidity markets

**Moderately efficient:**
- Over/Under goals markets
- Lower division match winner markets
- Betfair exchange markets (highly efficient at high liquidity but less so at low)

**Less efficient:**
- Player props markets
- Outright/futures markets (lower scrutiny, higher margin)
- Live/in-play markets (information processing delays create windows)
- Minor league and niche sport markets

## The Implications for Strategy

Edge is found in less efficient markets. The more efficient the market, the larger the edge required to overcome the margin. Concentrating your analytical effort in moderately efficient markets — where your superior information or model quality can outperform the average participant — is more productive than competing in the most efficient markets where your advantage is smallest.

## Why Markets Are Not Fully Efficient

- **Participation:** Recreational bettors comprise the majority of betting volume and are systematically biased (favourites, home teams, high-profile selections)
- **Information asymmetry:** Not all information is processed equally quickly by all market participants
- **Costs:** Margin, withdrawal costs, and account restrictions prevent pure arbitrage
- **Complexity:** Some markets (player props, niche leagues) are too complex for bookmakers to price with full sophistication

These inefficiencies are real and exploitable — by analytical bettors willing to do the work.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Uncertainty vs Risk: The Knightian Distinction', 'uncertainty-vs-risk-knightian',
'## Two Types of the Unknown

Economist Frank Knight distinguished between risk (unknown outcome, but knowable probability) and uncertainty (unknown outcome, unknowable probability). This distinction has profound implications for betting.

**Risk:** The probability of a fair coin landing heads is exactly 50%. The outcome is unknown but the probability is mathematically certain. Most standard betting scenarios are primarily risk — we can estimate probabilities from historical data.

**Uncertainty (ambiguity):** The probability that a specific economic policy will cause a recession in 3 years is genuinely unknown — not just unknown to you but fundamentally unknowable. There is no historical distribution to reference.

## Where Betting Is Risk vs Uncertainty

**Risk-dominated situations (probability estimable):**
- Match winner in a league with 10 seasons of data at the same competitive level
- Total goals in a well-studied competition
- Player performance in a stable team context

**Uncertainty-dominated situations (probability less estimable):**
- Match outcome for a newly promoted team in their first season in the higher division
- Tournament winner after major squad rebuilding
- Player performance after a serious injury return

## The Practical Implication

In risk situations: quantitative models are reliable. Bet with appropriate Kelly fraction.

In uncertainty situations: quantitative models are less reliable. Reduce stake size below what Kelly would suggest (because the Kelly calculation assumes accurate probability estimates). Apply wider confidence intervals.

## Recognising the Uncertainty Premium

In uncertainty situations, bookmakers must include an uncertainty premium in the margin — they know their model is less accurate. This means both your estimate and the bookmaker''s estimate may be far from the true probability. Caution is warranted.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Mental Modelling: Building a Coherent Worldview', 'expert-mental-modelling',
'## The Mental Model Library

Charlie Munger advocated building a "latticework of mental models" from multiple disciplines. A bettor with a rich mental model library applies the right model to each situation — rather than forcing every situation through a single framework.

## The Core Betting Mental Model Stack

**Probabilistic thinking:** Every outcome has a probability. Evaluate decisions by EV, not by outcome. (Foundation)

**Base rates and reference classes:** Start with the outside view. Adjust modestly for specific information. (Calibration)

**Regression to the mean:** Extreme observations are partially variance. They revert. Bet accordingly. (Correction)

**Bayesian updating:** Update beliefs with new information proportionally to its diagnosticity. (Learning)

**Second-order thinking:** What do other market participants think? Where does consensus diverge from probability? (Edge location)

**Expected value in distribution:** Think in distributions, not point predictions. Calculate EV from the full probability curve. (Precision)

**Efficient market awareness:** Know how efficient each market is. Concentrate analytical effort where efficiency is lower. (Strategy)

**Opportunity cost:** Every decision excludes alternatives. Value the alternatives explicitly. (Resource allocation)

## Applying Multiple Models to One Decision

A mature bettor does not pick one model for each decision — they apply multiple models simultaneously:

"This looks like a value bet (EV thinking). But the base rate for this scenario is lower than I initially assumed (base rate correction). The market has sharp action supporting my direction, which reduces my edge estimate (second-order thinking). But my model is better-calibrated in this specific league (market efficiency consideration). I''ll bet at 60% of my calculated Kelly stake to account for model uncertainty."

## The Expert Edge

The bettor who can fluidly apply and integrate multiple mental models produces probability estimates that are more accurate than any single model generates alone. This integration — the synthetic intelligence of a rich mental model library — is one of the deepest and most durable competitive advantages available in betting.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'mental-models-betting-uncertainty' AND cat.slug = 'betting-psychology';


-- ╔══════════════════════════════════════════════════════════╗
-- ║  MODULE 6 — The Professional Bettor Mindset             ║
-- ╚══════════════════════════════════════════════════════════╝

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'What Professional Bettors Actually Do Differently', 'what-professionals-do-differently',
'## The Myth vs The Reality

Popular media portrays professional sports bettors as gifted predictors who "just know" who will win. The reality is less glamorous and more reproducible.

Professional bettors do not predict winners more accurately than average. They are better at:
1. Estimating probability more accurately than the market in specific contexts
2. Identifying when the market price diverges from their probability estimate
3. Staking appropriately when they find this divergence
4. Maintaining the process consistently through wins and losses

## The Core Professional Difference: Process Orientation

Amateurs ask: "Who will win this match?"
Professionals ask: "What is the true probability of each outcome? Does the available price reflect this probability? If not, how much should I stake?"

These are different questions. The professional question is one that can be answered rigorously — and the answer produces a decision rule. The amateur question leads to a guess.

## The Research Investment

Professional bettors invest significantly more time in research than recreational bettors — but not in watching matches. The research goes into:
- Building and maintaining quantitative models
- Collecting and cleaning historical data
- Calibrating model output against market prices
- Reading academic literature on sports analytics

This research investment is the source of the analytical advantage. It is not insight or talent — it is deliberate investment in information quality.

## The Reproducibility Test

A professional approach is reproducible: if you fully documented your selection criteria, data sources, model methodology, and staking rules, someone else could run the same operation and get approximately the same results.

An amateur approach is not reproducible: it depends on intuitions, feelings, and "reading" the game in ways that cannot be systematically replicated.

The reproducibility test is one of the clearest distinctions between professional and amateur practice.',
  1, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Growth Mindset vs Fixed Mindset in Betting', 'growth-vs-fixed-mindset-betting',
'## Carol Dweck''s Framework

Carol Dweck''s research on mindset distinguishes between:

**Fixed mindset:** Abilities are innate and fixed. Success proves you are talented; failure proves you are not. Challenges are threats.

**Growth mindset:** Abilities are developed through effort and learning. Success reflects effort; failure reflects a learning opportunity. Challenges are growth opportunities.

## How Fixed Mindset Manifests in Betting

A bettor with a fixed mindset:
- Attributes wins to superior ability ("I read this market perfectly")
- Attributes losses to bad luck ("the result was a fluke")
- Avoids markets where they might fail (protecting the self-image of competence)
- Responds to poor results with defensiveness rather than inquiry
- Does not systematically review mistakes (reviewing mistakes is threatening)

## How Growth Mindset Manifests in Betting

A bettor with a growth mindset:
- Attributes wins to effective process and reviews what worked
- Attributes losses to process errors or variance, and investigates which
- Enters new markets with beginner''s mind — willing to be wrong while learning
- Responds to poor results with curiosity: "What can I learn here?"
- Maintains a systematic mistake log as a core learning tool

## The Mistake Log

A growth-mindset bettor maintains a mistake log alongside the bet log. Any bet that:
- Violated a process rule
- Was placed with insufficient analysis
- Deviated from the staking formula
- Was placed in an emotional state

...is logged with the specific error identified and the lesson drawn.

This log is reviewed quarterly. The patterns it reveals drive the most targeted process improvements.',
  2, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Deliberate Practice in Betting', 'deliberate-practice-betting',
'## What Is Deliberate Practice?

Deliberate practice, researched by Anders Ericsson, is the specific form of practice that produces expert performance. It is not simply doing the activity more — it is practising specific sub-skills with focused attention and immediate feedback, explicitly targeting areas of weakness.

A chess player who plays thousands of casual games improves slowly. A chess player who studies endgame positions with a coach and immediate feedback improves rapidly.

## Deliberate Practice for Bettors

**Probability estimation drills:**
Take historical matches (before looking at the result) and estimate the probability of each outcome. Then check the actual result and the closing price. How well-calibrated is your estimate? Track accuracy over time.

**Model comparison exercises:**
Estimate the probability of an outcome before running your model. Then run the model. Where do your intuitive estimates diverge from the model? Are the divergences predictable (a systematic bias) or random (noise)?

**Calibration graph analysis:**
Review your last 200 probability estimates vs outcomes in the calibration graph. Which probability range is most poorly calibrated? Focus the next month''s deliberate practice on that range.

**Post-match review:**
After each match in your target league: review the xG data, the key events, and the tactical factors. Did your model capture the key drivers? What would you model differently for next time?

## The Feedback Requirement

Deliberate practice requires specific, immediate feedback. The bet log + CLV tracking provides this feedback. The feedback loop is: estimate probability → act on estimate → observe market closing price → calculate CLV → update model.

This feedback loop, operated rigorously over thousands of bets, is the mechanism of genuine expertise development.',
  3, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Long-Term Thinking and Delayed Gratification', 'long-term-thinking-delayed-gratification',
'## The Marshmallow Test for Bettors

The famous Stanford marshmallow test found that children who could delay gratification (wait for a second marshmallow) had better life outcomes across many dimensions. The capacity for delayed gratification — preferring larger future rewards over smaller immediate ones — is one of the most valuable psychological traits for long-run success.

In betting, delayed gratification is the ability to resist the impulse for immediate action (placing a suboptimal bet now) in favour of the better bet that will come later.

## Manifestations of Poor Delayed Gratification

**Bet compulsion:** Needing to have a bet on every match day regardless of whether genuine value is available
**Premature withdrawal:** Taking profits out of the bankroll before they have compounded enough to make a meaningful difference
**Impatience with sample building:** Abandoning a strategy after 150 bets because results are not yet significant
**Live betting over pre-game:** The immediate excitement of live betting at higher margins, rather than the slower but more valuable pre-game analysis

## Building the Long-Term Orientation

**Annual metrics:** Track performance annually, not weekly. The weekly perspective creates noise-driven anxiety; the annual perspective reveals signal.

**Compounding visualisation:** Calculate what your bankroll would be worth in 5 years at your current growth rate. Visualise this number. Each time you are tempted to deviate from process for immediate comfort, reconnect with the 5-year number.

**Pass rate tracking:** Track the percentage of potential bet opportunities you correctly pass on (no value identified). A high pass rate is a positive indicator of discipline, not missed opportunity.

## The Professional Time Horizon

The professional bettor operates on a 3–5 year time horizon for strategy validation and bankroll building. Short-term results are noise within this timeframe. The professional evaluates their work on this timescale — which fundamentally changes how individual outcomes feel.',
  4, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Intellectual Honesty and Ego in Betting', 'intellectual-honesty-ego-betting',
'## The Ego Problem

The ego — the self-concept and its defenses — is the betting analyst''s greatest enemy. The ego needs to be right. It resists updating beliefs in response to disconfirming evidence. It attributes failures to external factors and successes to internal ability.

Intellectual honesty — the willingness to accept uncomfortable truths about your analysis quality — is the antidote.

## Signs of Ego-Driven Betting

- Holding the same team selection opinion despite persistent evidence against it
- Dismissing negative CLV results as "pricing errors" without investigating
- Refusing to credit market information that contradicts your model
- Blaming referee decisions, bad luck, or opponent errors for losses rather than investigating whether the selection was correct
- Not sharing performance data with others because the actual results do not match the claimed results

## Intellectual Honesty in Practice

**The null hypothesis default:** Assume your model has no edge until proven otherwise. Positive results of ≥300 bets with positive CLV are required before claiming validated edge. Before that: the data is consistent with chance.

**The devil''s advocate review:** Once per month, assign yourself the task of proving your strategy does not work. Find the strongest possible counterargument. If you cannot refute it: your confidence is too high.

**The open P&L policy:** Share your actual P&L with your accountability partner — total profit, total staked, ROI. Not a curated selection of winning bets. Genuine transparency prevents the ego from selectively presenting data.

## The Long-Run Reward

Intellectual honesty is painful in the short term. It means accepting that some strategies you believed in were not working, that some analysis was poor, and that some results were lucky rather than skilled.

In the long run, intellectual honesty is the most valuable trait in betting: it enables the rapid identification and correction of errors that would otherwise persist and compound.',
  5, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Managing Uncertainty Without Certainty', 'managing-uncertainty-without-certainty',
'## The Comfort with Not Knowing

Humans have a deep psychological need for certainty. Ambiguity and uncertainty are uncomfortable; resolution — any resolution — provides relief. This need for cognitive closure drives premature certainty in betting analysis.

## The Cost of Premature Certainty

A bettor who needs to feel certain before placing a bet will:
- Overfit the narrative to their preferred outcome
- Dismiss genuine uncertainties that should reduce confidence
- Place lower-stakes bets than appropriate when uncertainty is high (and higher than appropriate when they feel falsely certain)

## Cultivating Comfort With Uncertainty

**Probabilistic language:** Train yourself to speak and think in probability ranges rather than predictions. Not "Arsenal will win" but "Arsenal have approximately 55% win probability, range 48–62%."

**Uncertainty flags:** In your bet notes, explicitly flag all sources of genuine uncertainty: "This estimate assumes the injury report is accurate. If the goalkeeper is not fit, revise probability down 5–8%."

**The unknown unknowns acknowledgment:** Before every bet: "What don''t I know about this match that might matter?" List 2–3 unknowns explicitly. This does not prevent betting — it calibrates the stake to the uncertainty level.

## The Confidence Paradox

The most confident-appearing market participants are often the least well-calibrated — their certainty reflects overconfidence rather than accuracy. The most accurate forecasters (research by Philip Tetlock on "Superforecasters") express measured uncertainty, update frequently, and are explicitly humble about what they do not know.

Be the superforecaster in your market: precise uncertainty estimates, explicit about limitations, willing to update, genuinely comfortable saying "I don''t know enough to bet on this."',
  6, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Comparison Trap: Your Journey vs Others', 'comparison-trap-your-journey',
'## Why Comparing Results Is Dangerous

Online betting communities, social media, and tipping forums expose you to other bettors'' claimed results — typically the highlights, not the full record. Comparing your results to these curated highlights produces:

1. **False benchmarking:** You are comparing your real results to others'' best results
2. **Strategy abandonment:** A bad week triggers comparison to someone who had a great week, creating pressure to "do something different"
3. **Risk escalation:** Seeing others claim outsized returns tempts you to take larger risks to match their reported performance
4. **Confidence erosion:** A genuine 3% ROI operation looks unimpressive next to someone claiming 15% ROI (with 50 bets and no CLV evidence)

## The Only Valid Comparison

The only statistically valid comparison is your own performance over time:
- This quarter vs last quarter
- This year''s CLV vs last year''s CLV
- Current model accuracy vs 12-month-ago model accuracy

Your operation is on its own trajectory. External comparisons introduce noise that disturbs this trajectory.

## What to Learn From Others (Without Comparing Results)

Other serious bettors offer valuable learning through:
- Methodological discussions (how they model specific factors)
- Market access strategies (how they manage account restrictions)
- Analytical frameworks (new approaches to probability estimation)

These are transferable insights that improve your process. Results claims from others are not transferable insights — they are data points you cannot verify from a sample you cannot analyse.

## The Reference Group Upgrade

If your primary betting community focuses on results (who won last weekend), upgrade your reference group. Seek communities focused on process: CLV measurement, model methodology, bankroll management. Your reference group''s norms directly shape your own standards.',
  7, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'The Role of Passion and Purpose', 'role-of-passion-and-purpose',
'## Why Passion Is Not Enough

Many people are passionate about sports. Passion motivates initial engagement but does not predict success in sports betting. The analytical rigour, operational discipline, and psychological resilience required for profitable betting are independent of sports passion.

The danger of passion: it creates emotional attachment to specific teams, athletes, and outcomes — which is precisely what systematic betting must overcome.

## The Necessary Reconfiguration

A successful bettor reorients their relationship with sports from fan to analyst. This does not mean ceasing to enjoy sport — it means compartmentalising the fan experience from the analytical function.

Practical boundaries:
- Never bet on your own team (emotional attachment corrupts probability estimates)
- Never bet on a match while watching as a fan (match viewing creates real-time emotional states that distort live betting decisions)
- Treat favourite teams as any other data point in the model — no adjustment for love

## What Sustains Professional Commitment

Passion for sports is not a durable motivator for the unglamorous work of data collection, model maintenance, and record-keeping. What sustains professional bettors long-term:

**Intellectual curiosity:** The genuine interest in solving the probability estimation problem. Finding the edge is an intellectual puzzle — the sports outcome is the test of the solution.

**Competitive drive:** Competing against the most efficient price-setters in the world and finding instances where your analysis is superior.

**Financial motivation:** A clear financial return target, understood in context of opportunity cost.

**Mastery pursuit:** The desire to achieve genuine expertise in a complex, competitive domain.

## Finding Your Sustaining Motivation

Before committing to a serious betting operation, identify which of these motivations is authentic for you. The operation that is sustained by intellectual curiosity and competitive drive will outlast the operation driven by excitement or passion for the sport.',
  8, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Integration: Betting and Life Balance', 'betting-life-integration-balance',
'## The Whole Person Question

Professional betting is a time-intensive, cognitively demanding, emotionally pressured activity. Without conscious management, it can encroach on relationships, health, and life satisfaction in ways that undermine both the betting operation and the bettor.

## The Warning Signs

Betting is consuming too much bandwidth when:
- You think about open positions during conversations with family or friends
- Sleep quality is affected by betting results or upcoming matches
- Recreational activities are reduced to create more betting time
- Relationships feel secondary to the betting operation
- Your primary self-evaluation is based on recent betting results

These are not signs that you care too much about betting — they are signs that the boundary between betting-as-business and betting-as-identity has dissolved.

## Designing the Boundary

A professional bettor has a clear psychological boundary between "working hours" (the betting operation) and "life hours" (everything else). Specific practices:

- Betting only at defined times (your session schedule)
- No betting apps on the phone that is used for personal life
- Phone and computer closed at a defined daily time (the separation ritual)
- A clear policy on discussing betting with family members (how much, how often, what level of detail)

## The Sustainability Test

Ask quarterly: "Is the current level and quality of my betting operation compatible with the life I want to be living?"

If the answer is no: either reduce the betting operation to a compatible level, or redesign the life to accommodate the operation. Attempting to sustain an incompatible combination produces poor betting performance AND poor life quality — the worst of both.

## The Long-Run Stakeholder View

Your betting operation has long-run stakeholders: your family, your health, your non-betting relationships. These stakeholders have legitimate claims on your time and emotional energy that compete with the operation. Managing these stakeholders is not a distraction from professional betting — it is an essential component of sustaining professional betting for years.',
  9, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';

INSERT INTO public.lessons (course_id, title, slug, content, sort_order, is_published)
SELECT c.id, 'Expert Synthesis: The Complete Professional Psychology', 'expert-synthesis-professional-psychology',
'## The Psychological Stack of the Expert Bettor

The expert bettor''s psychological profile is the result of deliberate development across all the dimensions described in this topic. It is not a natural endowment — it is a constructed mental infrastructure.

## The Core Traits

**Probabilistic fluency:** Effortlessly thinks in probability distributions. EV is the natural unit of decision evaluation. Uncertainty is expressed precisely, not avoided.

**Bias awareness and systems defence:** Has mapped their personal cognitive biases through deliberate calibration work. Has built systems (model as primary input, pre-bet checklist, pre-commitment to stakes) that make bias-driven decisions structurally difficult.

**Emotional regulation mastery:** Can identify emotional states before they distort decisions. Has a personal toolkit of regulation techniques (physical, cognitive, ritual-based) that can be deployed in seconds.

**Process identity:** Defines competence by process quality, not outcome. Equanimity in the face of variance. No defensiveness about poor results — pure inquiry.

**Intellectual honesty:** Willing to update beliefs in response to evidence. Actively seeks disconfirming information. Maintains genuinely accurate records and shares them honestly.

**Long-run orientation:** Operates on a 3–5 year time horizon. Monthly and weekly results are noise within this frame. Patient accumulation of the sample is the primary aim.

**Sustainable motivation:** Driven by intellectual curiosity and competitive drive rather than passion or excitement. The motivation is durable because it does not depend on the results.

## The Integration

These traits do not operate independently — they form a coherent psychological system where each trait supports the others. Probabilistic fluency makes emotional regulation easier (you expect variance, so it does not trigger tilt). Process identity makes intellectual honesty easier (updating beliefs does not threaten the self if the self is the process, not the opinion).

## The Developmental Path

Building this psychological stack takes years of deliberate practice, consistent feedback, and honest self-examination. It cannot be shortcut. But the bettor who makes this investment is not just a better bettor — they are a better decision-maker in every domain where uncertainty and stakes collide. The skills compound far beyond betting itself.',
  10, true
FROM public.courses c JOIN public.course_categories cat ON cat.id = c.category_id
WHERE c.slug = 'professional-bettor-mindset' AND cat.slug = 'betting-psychology';
