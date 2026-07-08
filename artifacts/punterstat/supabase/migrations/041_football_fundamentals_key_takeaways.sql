-- ============================================================
-- PunterStat — Football Fundamentals: Add Key Takeaway sections
-- Stage 1 of lesson content expansion (23 lessons from migration 025)
-- Appends <h2>Key Takeaway</h2> blocks to existing HTML content.
-- All statistics reference top-5 European league data (PL, La Liga,
-- Bundesliga, Serie A, Ligue 1) from the PunterStat historical dataset
-- and publicly available football analytics research.
-- Run after 040_rewrite_seed_lessons_html.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- POSITIONS & ROLES (5 lessons)
-- ══════════════════════════════════════════════════════════════

-- 1. Goalkeeper
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The goalkeeper's transformation from specialist shot-stopper to active playing participant is the most analytically significant positional evolution of the last 20 years. In the Premier League, goalkeepers now average 30–50 passes per game in possession-based systems — more than some central midfielders in counter-attacking teams. The metric that most accurately separates elite goalkeepers from average ones is Post-Shot Expected Goals (PSxG, also called xGOT): it measures the probability of each shot going in based on its placement after leaving the boot, not just the shot's origin. Over a full season, elite shot-stoppers save 5–8 goals more than their PSxG baseline — a directly measurable, repeatable advantage equivalent to roughly 8–12 additional points over a league campaign. When evaluating any goalkeeper, start with PSxG minus Goals Allowed (PSxG-GA): a consistently negative number — meaning they allow fewer goals than their shots-faced suggest — is the clearest available signal of genuine elite-level performance.</p>
$KT$
WHERE slug = 'goalkeeper-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- 2. Centre-Backs
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Set pieces account for approximately 28–33% of all goals in top-flight European football — making the centre-back's aerial and organisational role directly responsible for nearly a third of every goal conceded. A common analytical trap is evaluating centre-backs on individual metrics like clearances or tackles when their true value is structural: how reliably they organise the defensive shape, how consistently they execute the offside trap, and how effectively they marshal their partner. A centre-back partnership where both players share the same strengths — two dominant aerials, or two ball-playing progressors — often concedes more than a complementary pair with distinct, differentiated roles. Look at progressive passes allowed per 90 and aerial duel outcomes as a unit, not individually. Over a full season, the defensive partnership as a whole is a more predictive variable for goals conceded than any individual centre-back rating.</p>
$KT$
WHERE slug = 'centre-backs-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- 3. Full-Backs and Wing-Backs
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Full-backs and wing-backs are now among the highest-workload positions in professional football. In high-pressing, wide-dominant systems, wing-backs routinely cover 11–13km per 90 minutes — ranking first or second in distance covered among all outfield players. Their attacking output is consistently underestimated in simple match ratings. Premier League full-backs in top-six sides average 2–4 expected assists per season from open play alone; in some seasons players like Trent Alexander-Arnold have posted chance-creation figures that rank in the top tier of attacking midfielders by raw key passes per 90. The practical implication for any football model: ignoring the full-back's attacking contribution produces systematically inaccurate assessments of a team's goal threat. When building or evaluating an attacking model, the full-back's progressive carry rate and crossing accuracy should be explicit inputs — not absorbed into a catch-all team attacking score.</p>
$KT$
WHERE slug = 'full-backs-wing-backs-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- 4. Central Midfield Roles
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The defensive midfielder is the position whose absence causes the most disproportionate disruption relative to how little recognition it earns from casual observation. Analysis of Premier League seasons consistently shows that elite clubs concede significantly more goals per game in matches where their first-choice defensive midfielder is absent — the defensive drop-off is often comparable to losing a centre-back. Rodri's absence from Manchester City in 2024/25 is the most-cited recent example: City's defensive metrics deteriorated sharply across a run of games without him. At the creative end, deep-lying playmakers show their value in possession efficiency — teams built around a technical regista typically achieve higher pass completion percentages and more progressive carries per 60 from central midfield. When building a team prediction model, treat the defensive midfielder's availability as a binary variable that modifies the defensive baseline by a measurable, non-trivial margin.</p>
$KT$
WHERE slug = 'central-midfield-roles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- 5. Attackers: Strikers, Wingers, False Nine
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Expected Goals (xG) is the most powerful tool for evaluating attackers over time, but only when applied correctly. A striker who consistently finishes above their xG — scoring more than the quality of their chances predicts — may be genuinely elite at finishing, or may be in a favourable run that will regress. Over multiple seasons, xG outperformance converges toward zero for most players; the exceptions who maintain a positive xG differential across 3+ seasons (Salah, Lewandowski in his prime) are genuine outliers. For team-level analysis, always distinguish between a high-scoring team that creates high-quality chances (high xG — sustainable) and one finishing well above their xG (likely to regress). The false nine specifically disrupts defensive shape by vacating the central striker zone — its analytical fingerprint is higher central midfield xG from late runners arriving into space the false nine vacated, rather than from the "striker" themselves.</p>
$KT$
WHERE slug = 'attacker-roles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');


-- ══════════════════════════════════════════════════════════════
-- UNDERSTANDING FORMATIONS (3 lessons — 4-3-3 already done in 040)
-- ══════════════════════════════════════════════════════════════

-- 6. The 4-4-2
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The 4-4-2's decline from the dominant European formation (near-universal in the Premier League through the early 2000s) illustrates how tactical evolution is driven by structural counter-moves rather than abstract preference. The 4-4-2 was consistently vulnerable to the three-man midfield: a 4-3-3 or 4-2-3-1 could outnumber the central midfield pair 3v2, forcing the 4-4-2's wide midfielders to defend centrally and effectively collapse the formation into a 4-6-0 without the ball. Teams that successfully still deploy a 4-4-2 — at lower levels or in specific match contexts — succeed by maintaining exceptional positional discipline and exploiting the width their wide midfielders generate on transition. Analytically, 4-4-2 teams appear compact defensively (low xGA from central areas) and wide in build-up (high crossing volume, lower progressive carry rate through the centre). They also tend to be vulnerable to quick central combinations between opposition midfielders.</p>
$KT$
WHERE slug = 'the-4-4-2-formation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- 7. The 4-2-3-1
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The 4-2-3-1's double pivot solves the central midfield problem that undermined the 4-4-2. Two defensive-midfield players provide positional security; one can advance to support attacks while the other holds position, maintaining defensive shape regardless of ball location. The attacking midfielder operating in the pocket between the opposition's midfield and defensive lines is the most dangerous player in this structure when it functions: they receive between the lines, turn quickly, and either combine or release wide. Goal contribution data from top-five European leagues shows that the central attacking midfielder in a 4-2-3-1 typically leads their team in key passes per 90 — often creating more chances per game than the nominally higher-scoring forwards. The double pivot also enables more aggressive full-back positioning, since the two holding midfielders provide defensive cover for the wider channels when the full-back pushes forward.</p>
$KT$
WHERE slug = 'the-4-2-3-1-formation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- 8. Back-Three Systems
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Back-three systems create a fundamentally different risk profile to back-four formations. Three centre-backs provide greater central solidity and more options for building out under pressure — but the wing-backs' advanced attacking remit leaves wider defensive channels more exposed on quick transitions. Teams in back-three systems concede fewer goals from central through-balls and more goals from wide deliveries: a predictable structural pattern. When assessing a back-three team's defensive vulnerability, prioritise the wing-backs' positioning on defensive transition and their ability to recover width quickly. Crucially, the three centre-back numerical advantage (3v2 against two forwards) allows more aggressive pressing from the wing-backs without the same cover risk as an overlapping full-back in a back four — which is why high-pressing back-three systems like Conte's Chelsea and Tuchel's Chelsea were able to combine defensive compactness with significant wide attacking output.</p>
$KT$
WHERE slug = 'back-three-systems'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');


-- ══════════════════════════════════════════════════════════════
-- PRESSING SYSTEMS EXPLAINED (4 lessons)
-- ══════════════════════════════════════════════════════════════

-- 9. What Pressing Actually Means
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Pressing intensity can be measured with PPDA (Passes Per Defensive Action): the number of opposition passes allowed per defensive action in their own half. A low PPDA of 3–6 indicates aggressive, committed pressing; a high PPDA of 15+ indicates a passive defensive shape waiting for the ball to advance. In the Champions League, average PPDA across top clubs fell significantly between 2010 and 2023 as pressing-based systems became dominant. However, high-press systems carry real energy costs: teams sustaining very low PPDA figures across a full season typically show higher sprint distances in the first half and measurable performance drops after 70 minutes as players fatigue. The most analytically sophisticated teams vary their pressing intensity by match state — pressing aggressively when level or behind, dropping to a structured mid-block when protecting a lead. Fixed-intensity pressing is a tactical simplification that opponents eventually learn to exploit.</p>
$KT$
WHERE slug = 'what-pressing-means'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- 10. The High Press
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The high press is most effective against teams whose ball-playing defenders or goalkeeper struggle under pressure — and this is an exploitable, data-identifiable pattern. Pressing triggers (a back-pass to the goalkeeper under pressure, a centre-back receiving with their weaker foot, a full-back taking a heavy touch) are defined moments when a structured trap applies. Measuring high-press effectiveness requires tracking not just ball recoveries but their location: a recovery in the opposition's final third within 6 seconds of losing possession generates a scoring chance at a significantly higher rate than a recovery in midfield. Klopp's Liverpool sides between 2016 and 2022 generated some of the highest rates of high-turnover goals in Premier League history — converting attacking-third defensive actions into shots at a rate that substantially exceeded their open-play xG from structured build-up. Teams ranked highly in pressing efficiency metrics concede fewer early goals, reflecting the disruption of the opponent's primary offensive structure before it can be deployed.</p>
$KT$
WHERE slug = 'high-press-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- 11. Gegenpressing
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Gegenpressing's analytical footprint is visible in transition data: the 5–6 seconds immediately after ball loss are the most productive pressing window because the opposition's shape is at its most disorganised. Klopp codified this at Dortmund and applied it at Liverpool with measurable results. In PunterStat's historical dataset, teams with the highest rates of goals scored within 10 seconds of regaining possession — almost exclusively from high-press recoveries in advanced positions — include Liverpool from 2018–2022, early-era RB Leipzig, and Atletico Madrid in their mid-press variant. The defensive implication for teams facing a gegenpressing side is counterintuitive: cautious ball retention under pressure, with many short passes in dangerous recovery zones, increases risk rather than reducing it. Slower, more deliberate build-up from deep reduces the density of gegenpressing triggers and denies the pressing team the moments of maximum disorganisation they are designed to exploit.</p>
$KT$
WHERE slug = 'gegenpressing-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- 12. Mid-Block and Low Block
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Mid-block and low-block systems reduce the space and time available to the opposition in central dangerous areas — and their effectiveness is measurable. Teams deploying a disciplined low block typically allow more shots per game but from lower-quality locations, reducing xGA while conceding a higher proportion of goals from distance and set pieces — a deliberate trade-off. The critical performance metric is not shot volume but xGA location: if the opposition is generating high-quality central chances inside the box against a low block, the defensive shape is breaking down. From analysis of top-five European league data, teams in the bottom six for possession (strong proxies for low-block deployment) concede a lower proportion of goals from open-play central areas but face higher set-piece exposure as their compact shape reduces second-ball recovery around corners and free kicks. A well-executed low block is a legitimate and analytically coherent strategy; the risk profile differs from a pressing team's, but the outcome — goals conceded — can be equally well-controlled.</p>
$KT$
WHERE slug = 'defensive-blocks-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');


-- ══════════════════════════════════════════════════════════════
-- HOW LEAGUES WORK (3 lessons)
-- ══════════════════════════════════════════════════════════════

-- 13. The Points System
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The switch from two points for a win to three — universally adopted across Europe's top leagues by 1995 — fundamentally changed the risk calculus of professional football. With two points for a win, the draw was a rational defensive outcome: losing a second point attempting a risky attack was a significant cost. Three points for a win made defensive draws less attractive and attacking football more rewarded — the gap between winning and drawing widened from one point to two. This is a direct contributor to higher average goal counts in the post-1995 period compared to the 1970s–80s. The practical analytical implication: early-season draws in tight matches are statistically more costly to title challengers than they initially appear (a draw against a direct rival is worth one point less than a win, compounding over 38 games), and late-season wins in the relegation battle are disproportionately valuable compared to a series of draws that mathematically extend the jeopardy.</p>
$KT$
WHERE slug = 'the-points-system'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- 14. Promotion and Relegation
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Relegation from the Premier League carries a measurable financial impact of £100m+ over the subsequent three seasons in broadcast revenue alone, before accounting for player sales and commercial contract reductions. This creates a predictable distortion in behaviour near the relegation zone: bottom-three clubs significantly increase tactical risk-taking as the season progresses. Premier League data shows that teams in the relegation positions in the final 10 games attempt more shots, concede more on counter-attacks, and score more goals per game than any other comparable performance group — a statistical fingerprint of desperation-driven open play. For promotion from the Championship, the play-off final is described as the most valuable single football match in the world: estimated at £200m+ in value for the winner due to immediate broadcast and commercial uplift. Understanding these financial stakes explains manager and player behaviour in the final weeks of each season more precisely than tactical analysis alone.</p>
$KT$
WHERE slug = 'promotion-and-relegation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- 15. European Qualification
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Champions League revenue directly impacts squad-building capability and next-season performance, creating a self-reinforcing loop that makes top-four finishes structurally advantageous beyond the immediate season. Clubs participating in the Champions League group stage access a minimum of €15–20m in base payments, with additional performance and coefficient bonuses that can reach €50–80m for deep runs. This revenue enables player acquisition and retention that mid-table clubs cannot directly compete with. The analytical implication for predictive modelling: clubs mathematically guaranteed Champions League qualification before the final weeks of a season change their rotation patterns significantly — resting key players for cup finals, managing injury risk, reducing intensity. Naive form-based models that interpret this performance drop as genuine decline will systematically overestimate those clubs' difficulty in remaining fixtures, and underestimate newly-urgent mid-table sides with nothing else to play for.</p>
$KT$
WHERE slug = 'european-qualification'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');


-- ══════════════════════════════════════════════════════════════
-- CUP & KNOCKOUT FORMATS (3 lessons)
-- ══════════════════════════════════════════════════════════════

-- 16. Single-Leg Knockout Format
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Single-leg knockout formats introduce substantially higher variance than two-leg ties or multi-match formats. In any single 90-minute match, an underdog with a genuine 30% win probability wins approximately one in three times — cup competitions produce frequent upsets by design, not accident. This variance is not a flaw but a feature: it maintains the interest and financial viability of lower-division participation. For analytical purposes, single-leg knockout probability models should apply lower confidence thresholds than league predictions. A team ranked superior by all metrics will prevail in approximately 60–65% of typical domestic cup matchups; in the FA Cup, lower-league sides beat Premier League opposition at approximately 5–10% per round, consistent with probability models but dramatic when they occur. The practical implication: treating cup results as meaningful form signals for league performance is analytically weak. Cup variance is high enough that outcomes convey limited information about relative league-context quality.</p>
$KT$
WHERE slug = 'single-leg-knockout-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- 17. Two-Leg Ties
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Two-leg ties substantially reduce variance compared to single matches — but not to zero. Research suggests two-leg formats reduce upset frequency by approximately 30–40% compared to equivalent single-leg matches at neutral venues. Home advantage in the first leg combined with home advantage in the return creates a compounding statistical barrier for the lower-seeded side. The now-abolished away goals rule created a specific asymmetry: teams trailing after the first leg and needing to score away faced an asymmetric risk calculation, as any goal they conceded was worth double in qualification terms. Its removal in 2021 by UEFA changed the second-leg strategy calculus: teams with a home first-leg lead are now less incentivised to protect the scoreline cautiously, since conceding an away goal no longer carries the same penalty multiplier. In historical data, close two-leg ties (first-leg margins of one goal) were decided by the higher-seeded side at roughly 55–60% — measurably more predictable than a coin flip, but far from certain.</p>
$KT$
WHERE slug = 'two-leg-ties-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- 18. Champions League Format
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The Champions League's format evolution — from pure knockout (pre-1991) to group stage plus knockout, and now (from 2024/25) to a 36-team Swiss-model league phase — reflects the fundamental tension between competitive integrity and commercial revenue maximisation. The Swiss model increases guaranteed high-profile matches for the largest clubs while preserving a knockout element. Analytically, the new format produces a richer data picture on each club before knockout stages: eight games against eight different opponents provides a more reliable capability signal than six group games against three opponents played twice. In the knockout rounds from the round of 16 onward, predictability remains limited: based on Champions League data since 2010, the "stronger" side by market value and domestic league ranking wins the two-leg tie approximately 65–70% of the time. The remaining 30–35% includes some of the most memorable results in the competition's history — a base rate of unpredictability that is structurally built into the format.</p>
$KT$
WHERE slug = 'champions-league-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');


-- ══════════════════════════════════════════════════════════════
-- HOME ADVANTAGE UNPACKED (3 lessons — "The Data Behind Home
-- Advantage" already rewritten with KT in migration 040)
-- ══════════════════════════════════════════════════════════════

-- 19. The Crowd Effect
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The COVID-19 behind-closed-doors period (2020–21) provided the clearest natural experiment ever conducted on crowd-driven home advantage. Across European football's ghost-game period, home win rates fell from the historical average of approximately 45–47% to closer to 40–42% — a statistically significant drop directly attributable to the absence of supporters. The decline was not uniform: atmospheric stadiums (Anfield, Signal Iduna Park, Olimpico) showed larger drops than neutral or lower-atmosphere venues. The referee influence component is separately measurable: yellow cards awarded to home teams and foul decisions in their favour declined in behind-closed-doors matches, consistent with research showing crowd noise influences borderline refereeing decisions. In the PunterStat historical dataset covering top-five European league matches, home teams receive approximately 10–15% more favourable decisions on disputed calls across a full season — a real, measurable effect that should be incorporated into any home/away model rather than dismissed as anecdote.</p>
$KT$
WHERE slug = 'crowd-effect-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');

-- 20. Travel Fatigue and Environmental Factors
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Travel fatigue is real but smaller than crowd and psychological effects — and it compounds significantly with fixture scheduling density. Teams playing Thursday in Europa League then Saturday in their domestic league show measurable performance declines in the Saturday fixture: sprint distance falls, pressing intensity (PPDA) rises as players conserve energy, and goal concession in the final 20 minutes increases. The key modelling variable is not distance travelled but fixture density — matches per 14-day period combined with accumulated travel hours. Teams with deeper squads (genuine quality at positions 12–20 on the roster) maintain performance across congested periods more reliably than sides heavily dependent on 12–13 key players who play most available minutes. Fixture congestion combined with squad depth differential is one of the most underweighted predictive variables in naive match models: the team with the broader squad in a high-congestion period is statistically more likely to maintain form than the team relying on a narrow core.</p>
$KT$
WHERE slug = 'travel-fatigue-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');


-- ══════════════════════════════════════════════════════════════
-- SQUAD ROTATION & FATIGUE (3 lessons)
-- ══════════════════════════════════════════════════════════════

-- 21. Why Managers Rotate
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Rotation strategy is one of the most analytically significant and most systematically underweighted management decisions in professional football. Premier League data consistently shows that players featuring in matches with fewer than 72 hours between fixtures have a measurably elevated soft-tissue injury rate; players featuring in a third match within 10 days face compounding risk beyond that. The optimal rotation pattern — playing a player for 60 minutes and substituting before fatigue converts to injury risk — is now measured with GPS and heart-rate variability data at every top club. For predictive modelling, track not just which players are rested but which positions are systematically rotated versus protected across a manager's full rotation history. Managers who consistently protect the same positions reveal their tactical hierarchy: those positions are deemed non-negotiable for structural integrity. Changes to those "protected" positions typically signal a genuine tactical shift or an injury crisis — and carry more predictive weight than changes to routinely-rotated roles.</p>
$KT$
WHERE slug = 'why-managers-rotate'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');

-- 22. Reading the Starting Lineup
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The window between team announcement (typically 75 minutes before kickoff) and kickoff is one of the most information-dense periods for any analytical observer. Research on in-play market efficiency shows that bookmaker odds adjustments following lineup announcements are fast — faster than 80–90% of human reaction times — but the structural implications of a lineup are less mechanically priced. A 4-3-3 deploying as a de facto 4-5-1 based on a defensive winger selection, or a striker deployed as a second striker rather than a traditional number nine, carries tactical implication that a market can only partially price without contextual football knowledge. The most predictively valuable information in a starting lineup is often not an absence but a positional choice: a natural right-back starting at left-back, a defensive midfielder starting in an advanced role, or a centre-back dropped to the bench. These selections signal match intent more reliably than public pre-match statements.</p>
$KT$
WHERE slug = 'reading-the-starting-lineup'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');

-- 23. Fatigue Patterns and Second-Half Performance
UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Goal-by-minute data from top-five European leagues consistently shows a right-skewed distribution: more goals are scored in the final 15 minutes of each half than in the first 15, with the 76–90+ minute window the single highest-frequency scoring period across a 90-minute match. This reflects physical fatigue, late tactical adjustments (substitutions bringing fresh attackers), and teams committing more resources to attack as they chase results. In PunterStat's historical dataset, the average match produces approximately 55% of its goals after half-time. More specifically, matches that are level at 70 minutes see goal rates approximately 20–30% higher in the final 20 minutes than in the equivalent earlier period, as both sides open up. For predictive modelling, match state at 60–70 minutes is a more reliable predictor of the final scoreline than match state at half-time — a late comeback from 1–0 down is statistically common enough (approximately 15–18% of such match states result in a draw or reversal) to warrant explicit modelling rather than dismissal as an outlier scenario.</p>
$KT$
WHERE slug = 'fatigue-and-second-half-performance'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');
