-- ============================================================
-- PunterStat — Rewrite original 12 seed lessons from markdown
--              to full HTML with expanded content and Key Takeaway
-- Migrations 002 (Sports University) and 003 (Betting Academy)
-- Run after 039_international_matches.sql
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- SPORTS UNIVERSITY — Introduction to Football
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>What is football actually trying to achieve?</h2>
<p>Football is a game of goals. Two teams of eleven players compete to score more goals than their opponent within 90 minutes of play. That sentence sounds obvious — but its implications reach into every tactical decision, substitution, set-piece routine, and formation choice a manager makes. Understanding the objective is the foundation of understanding everything else.</p>
<p>Every action on a football pitch exists in relation to one question: does this help us score, or help us prevent the opposition from scoring? When a centre-back passes backwards to the goalkeeper under pressure, he is protecting the team from a goal. When a full-back overlaps down the flank, he is trying to create one. The objective never changes. The methods are infinite.</p>

<h2>The structure of a match</h2>
<p>A standard match is divided into two 45-minute halves with a 15-minute half-time interval. The referee adds time at the end of each half to compensate for stoppages — substitutions, injuries, time-wasting, VAR reviews. This additional time, called stoppage or injury time, has increased significantly in recent seasons. Premier League matches in 2023/24 regularly saw 8–12 minutes added at the end of the second half as referees were instructed to account for all delays more precisely.</p>
<p>If the score is level after 90 minutes in knockout competitions, extra time (two 15-minute periods) is played, followed — if the score remains level — by a penalty shootout. League football ends at the final whistle regardless of the score.</p>

<h2>How the objective shapes tactical decisions</h2>
<p>The pursuit and prevention of goals creates every tactical tension in the game:</p>
<ul>
<li><strong>Defending a lead:</strong> A team that scores first fundamentally changes its priorities. Many teams will sacrifice possession and territory to protect a lead, accepting pressure in exchange for defensive organisation. This is not negative football — it is rational goal management.</li>
<li><strong>Chasing a game:</strong> A team that needs to score will typically push more players forward, accept defensive risk, and use substitutions to bring on attacking players. The final 15 minutes of a match where one team needs a goal looks completely different to the first 15 minutes of the same game.</li>
<li><strong>Managing goal difference:</strong> In league football, goal difference separates teams level on points. A team that wins 3-0 instead of 1-0 earns the same points but builds a statistical cushion. This is why top teams continue pressing for goals even with a comfortable lead.</li>
</ul>

<h2>What our match data shows</h2>
<p>Across the top five European leagues in our historical dataset — covering the Premier League, La Liga, Bundesliga, Serie A, and Ligue 1 — the average number of goals per match sits consistently between 2.5 and 2.8. But averages conceal enormous variation: some matches end 5-4, others 0-0. The distribution of scorelines is one of the most powerful analytical tools available, and it begins with understanding that goals are relatively rare events in a 90-minute contest.</p>
<p>Because goals are rare, each individual goal has an outsized impact on match outcomes. A single goal scored in the 87th minute changes everything. This is why late goals are not just emotionally significant — they are analytically significant. Teams that score late concede fewer draws and convert more draws into wins.</p>

<h2>The referee and the laws of the game</h2>
<p>A match is controlled by a referee supported by two assistant referees (linesmen) and, in most top-level competitions, a Video Assistant Referee (VAR) system. The referee has absolute authority over application of the laws. VAR can recommend reviews for goals, red cards, penalties, and cases of mistaken identity — but the on-field referee makes the final decision.</p>
<p>Understanding the referee''s role matters analytically. Referees are not neutral machines: research consistently shows that referees are influenced by crowd pressure in marginal decisions. Home teams receive more favourable decisions on average, particularly in foul counts and additional time awarded. This is a measurable, consistent pattern — not an opinion.</p>

<h2>Key Takeaway</h2>
<p>Every tactical decision in football — from formation choice to substitution timing — exists solely to serve the objective of scoring more goals than the opponent. Understanding this keeps analysis grounded when complexity threatens to overwhelm it.</p>'
WHERE slug = 'the-objective-of-the-game'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');


UPDATE public.lessons
SET content = '<h2>The playing surface and what it means tactically</h2>
<p>A standard professional football pitch is a rectangle between 100–110 metres long and 64–75 metres wide. These are not arbitrary numbers — pitch dimensions have a direct and measurable impact on how football is played.</p>
<p>Wider pitches favour teams that want to attack with width: there is more space for wingers to operate, and opposition fullbacks are stretched further. Narrow pitches compress space and tend to produce more physical, direct football where width is less effective. Some clubs have historically managed their pitch dimensions deliberately — making it narrower to suit a direct, compact style when facing technically superior opposition.</p>
<p>Pitch surfaces matter too. A heavy, wet surface slows the ball and disadvantages technically skilled teams who rely on quick passing. A firm, dry surface speeds up play and suits teams built around fast ball circulation. Top-level stadiums invest heavily in pitch quality precisely because surface consistency is a competitive variable.</p>

<h2>Player count, positions, and squad management</h2>
<p>Each team fields exactly 11 players, including the goalkeeper. A team reduced to fewer than 7 players through red cards or injuries cannot continue, and the match is abandoned. In practice, this is extremely rare at the professional level.</p>
<p>Substitutions have evolved significantly. Traditional rules allowed 3 substitutions per match. Most major competitions now permit 5 substitutions (introduced widely post-COVID). This change has meaningfully affected late-game tactics — managers can make more significant tactical shifts in the second half, freshen legs in a congested fixture schedule, and deploy specialised players (set-piece takers, defensive midfielders, target strikers) for specific situations.</p>
<p>Squads at top professional clubs typically carry 20–25 players. The gap in quality between the starting eleven and the bench — and the manager''s ability to use that depth — is a major determinant of performance over a full season, particularly for teams competing in multiple competitions.</p>

<h2>The ball: specifications and their impact</h2>
<p>A professional football must conform to FIFA specifications: circumference 68–70cm, weight 410–450g, pressure 0.6–1.1 atmospheres. Within these bounds, ball manufacturers produce varying designs that affect flight characteristics. Modern low-seam balls used in major tournaments are known to behave unpredictably — which is why goalkeepers sometimes struggle with long-range shots that "knuckle" through the air.</p>
<p>These details matter because aerial balls, long shots, and set-piece deliveries are all affected by ball behaviour. A goalkeeper who is excellent at stopping conventional shots may be more vulnerable to unpredictable flight from distance.</p>

<h2>When the ball is in and out of play</h2>
<p>The ball is in play until it <em>completely</em> crosses a touchline or goal line — whether on the ground or in the air. This is why goal-line technology exists: to determine definitively whether a ball has crossed the line when the eye cannot be certain.</p>
<p>Dead-ball situations — corners, free kicks, throw-ins, goal kicks — occur when the ball goes out of play. These moments are more analytically significant than many casual observers appreciate. Our historical match data tracks corners per game, and across the top five leagues the average is between 10 and 12 corners per match. Corners alone do not directly produce many goals, but they are proxies for territorial pressure and attacking intent, and they feed into set-piece routines that do produce goals.</p>

<h2>Fouls, cards, and the disciplinary system</h2>
<p>A foul is called when a player commits an illegal challenge — tripping, pushing, holding, or making contact with an opponent in a dangerous way. Fouls concede free kicks, and in or near the penalty area they can concede penalty kicks or dangerous free-kick positions.</p>
<p>Yellow cards (caution) accumulate: two yellows in the same match result in a red card and dismissal. Red cards can also be issued directly for serious foul play or violent conduct. A team reduced to 10 men has a significantly lower probability of winning — data from our historical match dataset consistently shows that teams who receive a red card win fewer than 15% of the matches in which the dismissal occurs.</p>

<h2>Key Takeaway</h2>
<p>The physical laws of the game — pitch dimensions, player count, substitution rules, dead-ball situations — are not just background detail. They are tactical variables that coaches and analysts exploit systematically, and understanding them is the prerequisite to reading a match intelligently.</p>'
WHERE slug = 'the-pitch-ball-and-players'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');


UPDATE public.lessons
SET content = '<h2>Where goals actually come from</h2>
<p>At the professional level, goals do not arrive randomly. They follow measurable patterns that have been documented across millions of matches. Understanding those patterns is one of the foundations of modern football analysis.</p>
<p>The broad breakdown at the top level across multiple seasons:</p>
<ul>
<li><strong>Open play:</strong> Approximately 65–70% of goals. Sequences of passing or carrying that end in a shot from an organised attacking move.</li>
<li><strong>Set pieces:</strong> Approximately 25–30% of goals. Corners, direct free kicks, indirect free kicks, and throw-ins in dangerous areas. This figure has risen over the past decade as clubs have professionalised set-piece coaching.</li>
<li><strong>Penalty kicks:</strong> Approximately 5–10% of goals. Converted at roughly 75–80% in professional football.</li>
</ul>
<p>These percentages vary by league, team style, and era — but the structural reality is consistent: set pieces are not a minor element of the game. A team that concedes from set pieces at an above-average rate has a structural defensive problem that will show up every week.</p>

<h2>Expected Goals (xG): the modern analytical lens</h2>
<p>Not all shots are equal. A tap-in from two metres with an open goal is a near-certain goal. A speculative long-range effort from 30 metres is not. Expected Goals (xG) is the metric that assigns each shot a probability between 0 and 1 based on its characteristics: distance from goal, angle, shot type (header, foot), whether it was from open play or a set piece, and whether the shooter was under pressure.</p>
<p>An xG value of 0.35 means a shot from that situation would be converted 35% of the time on average. A player who scores 15 goals from chances with a combined xG of 10 is finishing above expectation. A player with 15 goals from 20 xG is underperforming their chance quality — and may be due to regress.</p>
<p>Our historical match dataset stores home_xg and away_xg for matches where this data has been populated. When both goals and xG figures are available, the comparison between the two is one of the most powerful indicators of whether a result reflected performance or variance.</p>

<h2>The anatomy of a goal: what the data shows</h2>
<p>Goals are more likely to come from:</p>
<ul>
<li><strong>Central positions:</strong> The area directly in front of goal, between the penalty spot and the six-yard box, produces the highest xG per shot.</li>
<li><strong>Shots on target:</strong> Obvious, but often understated. Teams that generate more shots on target per match win more often. Our historical dataset tracks home_shots_on_target and away_shots_on_target, and the difference between these figures is a stronger predictor of the final result than total shots.</li>
<li><strong>Second-ball situations:</strong> Goals frequently come from the ball rebounding off a goalkeeper or post and being converted by a player reacting quickest. This is not luck — it is positioning and anticipation, qualities that good strikers train deliberately.</li>
</ul>

<h2>Prevention: the other half of the equation</h2>
<p>Defensive organisation prevents goals by reducing the quality and quantity of chances the opposition can create. The key defensive metrics are:</p>
<ul>
<li><strong>Expected Goals Allowed (xGA):</strong> How many goals a team''s defence should have conceded based on the shots allowed. Teams that consistently concede fewer goals than their xGA have excellent goalkeeping or slightly fortunate finishing from opponents — and vice versa.</li>
<li><strong>Defensive line management:</strong> Holding a high line compresses space in the middle of the pitch but creates vulnerability to balls played in behind. A low block is harder to break down but cedes possession and invites pressure.</li>
<li><strong>Set-piece defence:</strong> With 25–30% of goals coming from dead balls, a team''s set-piece defensive organisation is as important as their open-play structure. Elite defensive teams work intensively on marking systems, blocking runners, and clearing the first ball at corners.</li>
</ul>

<h2>Shot conversion and its limits</h2>
<p>Across top European football, roughly 10–12% of all shots result in goals. Shots on target convert at around 30–35%. These averages create a baseline for evaluating individual and team performance — a striker converting 20% of shots is performing above the average; a team allowing opponents to hit 60% of their shots on target is defending poorly.</p>
<p>Shot conversion rates fluctuate significantly over short time frames due to variance. A striker who converts 25% of shots over 10 games may regress to 12% over the next 20, not because his quality has dropped but because the initial rate contained a significant luck component. Treat short-term finishing percentages with caution; xG provides the better signal.</p>

<h2>Key Takeaway</h2>
<p>Goals follow predictable patterns — set pieces are more valuable than casual observation suggests, shot quality matters more than shot quantity, and the gap between goals scored and xG is the clearest signal of how much variance is embedded in a team''s current results.</p>'
WHERE slug = 'how-goals-are-scored-and-prevented'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');


-- ══════════════════════════════════════════════════════════════
-- SPORTS UNIVERSITY — Understanding Formations
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>What the numbers mean — and what they do not</h2>
<p>A formation like 4-3-3 is read back to front: 4 defenders, 3 midfielders, 3 forwards. The goalkeeper is never included in the count. The number describes where a team''s outfield players stand in their <em>default defensive shape</em> — not how they actually behave when the game is in motion.</p>
<p>This is the most important thing to understand about formations: they are a starting position, not a rule. Once a match begins, players move, systems adapt, and the printed formation becomes a loose description of tendencies rather than a fixed map of positions.</p>

<h2>In possession vs out of possession: two different shapes</h2>
<p>Modern coaching distinguishes sharply between the shape a team holds when defending and the shape they create when attacking. These are often completely different.</p>
<p>A team that defends in a 4-4-2 may attack in a 3-2-5. Their fullbacks push so high they become wingers, their centre-backs spread wide, and their two defensive midfielders drop between them to form a back three in possession. The "4-4-2" on the teamsheet tells you nothing about what the team looks like when it has the ball for 65% of the match.</p>
<p>Analysts therefore describe a team''s <strong>in-possession shape</strong> and their <strong>out-of-possession shape</strong> separately. When scouting a match, the question is not "what formation do they play?" but "what shape do they create in each phase, and how do they transition between them?"</p>

<h2>The historical evolution of formations</h2>
<p>Football formations have evolved dramatically over a century of development:</p>
<ul>
<li><strong>The WM (3-2-2-3):</strong> Dominant from the 1920s to the 1950s. A response to the offside law change of 1925, it used three defenders to counter the newly dangerous two-striker attacking formations.</li>
<li><strong>4-4-2:</strong> The defining formation of the 1970s–2000s. Compact, balanced, and easy to organise. England''s domestic game was dominated by it for decades.</li>
<li><strong>4-2-3-1:</strong> Took over at the top level in the 2000s. The double pivot solved the central midfield vulnerability of the flat 4-4-2.</li>
<li><strong>4-3-3 and its variants:</strong> The current dominant system at elite clubs. Provides natural width, central control, and flexibility in how the front three operate.</li>
<li><strong>Three-at-the-back systems (3-5-2, 3-4-3):</strong> Cyclically popular. Resurgent in the 2010s under coaches like Antonio Conte and Thomas Tuchel.</li>
</ul>

<h2>Personnel define the system, not the number</h2>
<p>Two teams can both line up in a 4-3-3 and play entirely different football. The formation is the canvas; the players are the painting.</p>
<p>Pep Guardiola''s 4-3-3 at Manchester City involves fullbacks who invert into central midfield during build-up, a "false nine" who drops deep, and wide forwards who tuck inside. Jürgen Klopp''s 4-3-3 at Liverpool was built around vertical pressing, explosive transitions, and wide forwards who stay wide and run in behind. The number is the same. The football is completely different.</p>
<p>This is why formation analysis without player-level detail is limited. When you see "4-3-3" — ask: which type? Where do the fullbacks go in possession? What pressing trigger does the striker use? How deep does the midfield sit out of possession?</p>

<h2>Role labels vs position names</h2>
<p>Modern football increasingly describes players by their role rather than their positional number. "False nine," "inverted winger," "regista," "mezzala," "half-space runner" — these describe what a player does within a system, not where they stand at kick-off. A mezzala is a midfielder who makes aggressive runs into the channels from a central starting position. Two midfielders both listed as "CM" on a teamsheet might be performing completely different roles based on the team''s tactical instructions.</p>
<p>Understanding role labels gives you a far more useful framework for analysing how a team will behave than reading a formation number.</p>

<h2>Key Takeaway</h2>
<p>A formation number is a starting position, not a description of how a team plays. Always ask about in-possession shape, out-of-possession shape, and the roles individual players are performing — the number on the teamsheet is just the beginning of the analysis.</p>'
WHERE slug = 'what-a-formation-number-means'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');


UPDATE public.lessons
SET content = '<h2>Why the 4-3-3 dominates modern elite football</h2>
<p>The 4-3-3 has become the reference system of elite football for a simple reason: it solves multiple tactical problems simultaneously. It provides natural width through the wide forwards, central control through three midfielders who can press, hold, and box-to-box, and defensive compactness through a disciplined back four. No other modern formation offers the same combination of structural balance.</p>
<p>The system''s rise tracks directly with the broader shift toward high pressing and possession-based football that has defined the top of European football since roughly 2008. Teams like Barcelona, Bayern Munich, Manchester City, and Liverpool — the most successful clubs of the past 15 years — have all used variants of the 4-3-3 as their primary architecture.</p>

<h2>How the 4-3-3 attacks</h2>
<p>In possession, the 4-3-3 creates width through the wide forwards who pin back the opposition''s fullbacks. This is the key: when two wide forwards occupy two fullbacks, the centre of the pitch opens up. The attacking team''s three midfielders can operate with more space, and the striker receives the ball in less congested situations.</p>
<p>The build-up in a modern 4-3-3 typically involves:</p>
<ul>
<li><strong>The fullbacks pushing forward:</strong> In attacking phases, both fullbacks advance to provide width or overlapping options for the wide forwards. This creates a 2-3-5 attacking shape, with two defenders staying deep and five players in advanced positions.</li>
<li><strong>The pivot holding:</strong> One of the three midfielders — the deepest, often called the "6" — stays between the lines to provide defensive cover and recycle possession. The other two push higher.</li>
<li><strong>The striker''s movement:</strong> Whether the centre-forward holds the defensive line, drops short to link play, or makes runs in behind depends entirely on the specific system. Haaland at City runs in behind. Firmino at Liverpool dropped deep. The number 9 position varies enormously.</li>
</ul>

<h2>How the 4-3-3 presses and defends</h2>
<p>Out of possession, the 4-3-3 becomes a pressing machine. The three forwards are the first line of defence. When the opposition''s centre-backs have the ball, the striker and wide forwards press in coordinated patterns designed to force the ball into channels or backward to the goalkeeper.</p>
<p>Common pressing triggers in a 4-3-3:</p>
<ul>
<li>The striker shows one side (pressing toward the fullback), forcing the pass in a predictable direction where teammates are ready to press</li>
<li>A back pass to the goalkeeper triggers an immediate press from the striker and one wide forward</li>
<li>A heavy touch or a pass to a player facing their own goal triggers the nearest forward to press aggressively</li>
</ul>
<p>The back four holds a relatively high line to compress the space between the defensive and midfield units, making the pitch small for the opposition.</p>

<h2>Variants: the 4-3-3 is not one system</h2>
<p>Understanding that different teams use different versions of the 4-3-3 is essential for accurate analysis:</p>
<ul>
<li><strong>The positional play 4-3-3 (Guardiola):</strong> Structured build-up, inverted fullbacks, the "false 9," overloads in half-spaces, slow patient build-up followed by rapid exploitation of gaps</li>
<li><strong>The transition-based 4-3-3 (Klopp):</strong> Fast vertical play, high counter-pressing, wide forwards staying wide and running in behind, directness from goalkeeper to forwards</li>
<li><strong>The defensive 4-3-3:</strong> Wide forwards who defend first, a deeper midfield block, counter-attacks on the transition. Uses the same number but is far more conservative in approach</li>
</ul>

<h2>When the 4-3-3 struggles</h2>
<p>The 4-3-3 has vulnerabilities that good opponents exploit:</p>
<ul>
<li><strong>Against a 3-5-2 with wing-backs:</strong> The wing-backs create a 3-vs-2 overload against the wide forwards and fullbacks, stretching the defensive structure</li>
<li><strong>Against a compact 5-4-1:</strong> Teams that sit deep in a narrow block deny the space between the lines where the midfield three want to operate</li>
<li><strong>When the frontline press is beaten:</strong> If the first press is bypassed, the midfield is exposed in transition before the back four can reorganise</li>
</ul>

<h2>Key Takeaway</h2>
<p>The 4-3-3''s dominance comes from the spatial logic it creates — wide forwards pinning fullbacks open the centre of the pitch for midfield control. But how any individual team executes it varies dramatically; always analyse the specific variant, not just the number.</p>'
WHERE slug = 'the-4-3-3-control-and-width'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');


-- ══════════════════════════════════════════════════════════════
-- SPORTS UNIVERSITY — Home Advantage Unpacked
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>What the numbers consistently show</h2>
<p>Home advantage is one of the most reliably observed phenomena in football. Across Europe''s top five leagues — the Premier League, La Liga, Bundesliga, Serie A, and Ligue 1 — over the past two decades, the pattern is consistent:</p>
<ul>
<li><strong>Home teams win approximately 44–48% of matches</strong></li>
<li><strong>Away teams win approximately 27–30%</strong></li>
<li><strong>Draws account for approximately 25–27%</strong></li>
</ul>
<p>Our historical match dataset, which covers these five leagues across multiple seasons, captures the result column (H, D, or A) for every match. When you aggregate results by venue, the home team advantage is one of the clearest signals in the entire dataset. The probability of a home win has historically been around 15–18 percentage points higher than an away win.</p>
<p>This is not a small effect. In a league table, it compounds over 38 matches into a significant structural advantage for sides who perform strongly at home.</p>

<h2>The contributing factors: what research shows</h2>
<p>Home advantage is not caused by any single factor — it is the accumulation of several overlapping effects:</p>
<ul>
<li><strong>Crowd noise and referee influence:</strong> This is the most consistently documented factor. Studies across multiple sports show that referees give more favourable decisions to home teams in genuinely marginal situations. The crowd''s reaction — particularly to borderline fouls, offside calls, and penalty appeals — creates social pressure that influences unconscious decision-making. This shows up clearly in foul counts: away teams on average receive more yellow cards per match than home teams. Our dataset''s home_yellow_cards and away_yellow_cards columns demonstrate this pattern across all five leagues.</li>
<li><strong>Travel fatigue:</strong> Away teams travel before every match, disrupting sleep schedules and routine. In European competition, away legs after long-distance travel show significantly reduced performance. In domestic leagues the effect is smaller but measurable, particularly for northern clubs travelling south (or vice versa) in the same country.</li>
<li><strong>Familiarity with conditions:</strong> Home players know the pitch dimensions, surface quality, and ground conditions. They have trained on or near the surface all week. The away team experiences it for the first time on the day of the match.</li>
<li><strong>Absence of travel disruption:</strong> Home teams sleep in their own beds, follow their normal training routine, and eat their usual meals. The routine advantage is small for any single match but consistent.</li>
</ul>

<h2>The COVID experiment: isolating the crowd effect</h2>
<p>The 2019/20 and 2020/21 seasons provided a natural experiment in home advantage. When stadiums were empty due to COVID restrictions, the traditional home advantage largely disappeared across European football.</p>
<p>Across the major leagues during the "ghost match" period, home win rates fell sharply — in some leagues, away teams won <em>more</em> matches than home teams for the first time in recorded history. This result has been replicated in academic studies across football, basketball, and other team sports. The crowd effect is not just real — it may be the <em>dominant</em> driver of home advantage, not merely one factor among many.</p>
<p>When fans returned, home advantage recovered, though the magnitude of the effect has been somewhat lower than pre-COVID levels in some leagues — possibly reflecting other structural changes in football during the same period.</p>

<h2>How home advantage varies across leagues and contexts</h2>
<p>Home advantage is not uniform. It varies significantly by:</p>
<ul>
<li><strong>League:</strong> The Bundesliga has historically had slightly lower home advantage than Serie A or La Liga, partly attributed to stadium designs and crowd cultures. The relationship between crowd proximity, noise intensity, and referee influence differs across venues.</li>
<li><strong>Stadium size and atmosphere:</strong> A packed stadium of 80,000 creates more pressure than a 15,000-seat ground that is half-empty. Some clubs consistently benefit from exceptional home atmospheres that produce above-average home win rates relative to their general quality.</li>
<li><strong>Match importance:</strong> Home advantage tends to be larger in derbies and local rivalry matches, where crowd intensity is highest. In lower-stakes matches late in the season when neither team has anything significant to play for, the effect is smaller.</li>
<li><strong>Team quality:</strong> The best teams produce more consistent results both home and away, so their home/away split is less extreme than average teams. The most pronounced home advantage effects tend to be at the lower end of tables, where weaker teams struggle on the road but can be competitive at home.</li>
</ul>

<h2>Practical implications for analysis</h2>
<p>Home advantage is a structural variable that must be built into any analytical framework. When assessing a team''s form, always separate home performance from away performance — they are not the same thing, and treating them as one obscures important information.</p>
<p>The key questions to ask when analysing an upcoming match: How strong is this team''s home record specifically? Does the away team travel well? Is this a high-atmosphere fixture where crowd effect will be amplified? Does the match have any neutral-venue element (relegation six-pointer, title-deciding match) that might heighten the crowd''s intensity on either side?</p>

<h2>Key Takeaway</h2>
<p>Home advantage is real, consistent, and quantifiable — our historical match data shows it clearly across all five major leagues. Crowd effect appears to be its primary driver, as demonstrated by the COVID ghost-game period. Any serious analytical framework must account for venue as a structural variable, not an afterthought.</p>'
WHERE slug = 'the-data-behind-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');


-- ══════════════════════════════════════════════════════════════
-- BETTING ACADEMY — Understanding Odds Formats
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>What decimal odds actually represent</h2>
<p>Decimal odds express the total return per unit staked — <strong>including your original stake back</strong>. This is the most important thing to understand about the format, because it distinguishes it from fractional odds which express profit only.</p>
<p>A price of 2.50 means: for every £1 you stake, you receive £2.50 back in total. Your profit is £1.50; the other £1.00 is your returned stake. At odds of 1.00, you would receive exactly your stake back and make zero profit — this represents a mathematical certainty (or as close to one as can exist in betting).</p>

<h2>The fundamental formulas</h2>
<p>Three formulas cover everything you need:</p>
<ul>
<li><strong>Total return:</strong> Stake × Decimal Odds</li>
<li><strong>Profit:</strong> (Stake × Decimal Odds) − Stake, or equivalently: Stake × (Decimal Odds − 1)</li>
<li><strong>Implied probability:</strong> 1 ÷ Decimal Odds</li>
</ul>
<p>The third formula — implied probability — is the most important in all of sports analysis. It converts any bookmaker price directly into the probability they are implying for an outcome. At 2.50: 1 ÷ 2.50 = 0.40 = 40%. At 1.50: 1 ÷ 1.50 = 0.667 = 66.7%.</p>

<h2>Why sharp bettors and analysts prefer decimal</h2>
<p>Decimal odds have three properties that make them the professional''s format of choice:</p>
<ul>
<li><strong>Comparison is instant:</strong> 2.10 vs 2.08 is an immediate, unambiguous comparison. The same prices in fractional form (21/10 vs 26/12.5) obscure the difference behind confusing numerators and denominators.</li>
<li><strong>Arithmetic is clean:</strong> Multiplying decimal odds together to calculate accumulator returns is straightforward. 2.10 × 1.80 × 3.20 = 12.10. Fractional multiplication is far more cumbersome.</li>
<li><strong>Probability conversion is direct:</strong> The implied probability formula (1/decimal) requires no intermediate step. Every other format requires conversion to decimal before applying the formula.</li>
</ul>

<h2>Reading decimal odds fluently: common reference points</h2>
<p>Building a set of mental anchors for common prices makes you faster and more accurate in live situations:</p>
<ul>
<li><strong>1.50</strong> → 66.7% implied probability → Strong favourite</li>
<li><strong>2.00</strong> → 50% implied → The exact "coin flip" price</li>
<li><strong>3.00</strong> → 33.3% implied → One-in-three chance</li>
<li><strong>4.00</strong> → 25% implied → One-in-four</li>
<li><strong>6.00</strong> → 16.7% implied → One-in-six</li>
<li><strong>11.00</strong> → 9.1% implied → Long shot territory</li>
</ul>
<p>Prices below 1.30 represent heavy favourites with implied probabilities above 77%. Prices above 10.00 represent genuine outsiders where variance is enormous — even if a selection is good value, it will lose most of the time.</p>

<h2>Decimal odds below 2.00: the "favourite" zone</h2>
<p>Prices between 1.00 and 2.00 represent outcomes the market considers more likely than not. The critical implication: at any price below 2.00, your profit on a winning bet is less than your stake. A £100 bet at 1.60 returns £160 total — £60 profit, £100 stake. If this selection loses, you lose £100 to gain £60. You need it to win more than 62.5% of the time just to break even at these odds.</p>
<p>Many recreational bettors underestimate how often "favourites" need to win to be profitable. The break-even win rate is always exactly the implied probability — and the bookmaker''s margin means even hitting that rate produces a loss over time.</p>

<h2>Key Takeaway</h2>
<p>Decimal odds are not just a format — they are the analytical language of modern sports betting. The implied probability formula (1 ÷ decimal) converts any price into a testable claim about the world. Fluency with decimal odds is the foundation everything else is built on.</p>'
WHERE slug = 'decimal-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');


UPDATE public.lessons
SET content = '<h2>What fractional odds mean</h2>
<p>Fractional odds express <em>profit</em> relative to stake — not total return. The number on the left is what you win; the number on the right is what you must stake to win it.</p>
<p>At <strong>5/2</strong>: stake £2 to profit £5. Total return: £7. If you stake £10 (five times the right-hand number), profit is £25, total return £35.</p>
<p>At <strong>1/2</strong> (also written as "1/2 on"): stake £2 to profit £1. Total return: £3. These odds below evens represent heavy favourites where the implied probability exceeds 50%. Odds-on prices are common in horse racing, where strong favourites regularly price at 4/7 or shorter.</p>
<p>Evens — written as "Evs" or 1/1 — means stake £1 to profit £1. Total return: £2. This is the fractional equivalent of decimal 2.00.</p>

<h2>The conversion formula</h2>
<p>Converting fractional to decimal is the most useful calculation to have automatic:</p>
<p><strong>Decimal = (Numerator ÷ Denominator) + 1</strong></p>
<ul>
<li>5/2 → (5 ÷ 2) + 1 = 3.50</li>
<li>7/4 → (7 ÷ 4) + 1 = 2.75</li>
<li>11/8 → (11 ÷ 8) + 1 = 2.375</li>
<li>1/2 → (1 ÷ 2) + 1 = 1.50</li>
<li>4/9 → (4 ÷ 9) + 1 = 1.44</li>
</ul>
<p>To convert decimal back to fractional: subtract 1 from the decimal, then express as a simplified fraction. 2.50 − 1 = 1.50 = 3/2 = 6/4 (the latter being the traditional UK expression).</p>

<h2>Common fractions and their decimal equivalents</h2>
<p>A working knowledge of the most frequently used fractions saves time and prevents errors:</p>
<ul>
<li><strong>1/2</strong> = 1.50 (66.7% implied)</li>
<li><strong>4/5</strong> = 1.80 (55.6% implied)</li>
<li><strong>Evens (1/1)</strong> = 2.00 (50.0% implied)</li>
<li><strong>6/4</strong> = 2.50 (40.0% implied)</li>
<li><strong>2/1</strong> = 3.00 (33.3% implied)</li>
<li><strong>5/2</strong> = 3.50 (28.6% implied)</li>
<li><strong>3/1</strong> = 4.00 (25.0% implied)</li>
<li><strong>4/1</strong> = 5.00 (20.0% implied)</li>
<li><strong>10/1</strong> = 11.00 (9.1% implied)</li>
</ul>

<h2>Why awkward fractions exist</h2>
<p>Fractions like 11/4, 13/8, 85/40, and 100/30 are deliberately non-standard. Traditional bookmakers used them to make direct price comparison between shops more difficult — if two bookmakers were both "offering 11/4" on the same horse, the customer might not notice that 11/4 at one and 3/1 at another is actually a different price. In an era before odds comparison websites, this slowed down the information available to bettors and protected bookmaker margins.</p>
<p>In modern online betting, these fractions persist in horse racing markets but are increasingly replaced by decimal displays. When you encounter an unusual fraction, convert to decimal immediately for a clear picture.</p>

<h2>Fractional odds in horse racing: the SP system</h2>
<p>Horse racing in the UK and Ireland uses a specific pricing tradition: the Starting Price (SP). The SP is the officially recorded odds at the time the race starts, based on the last available on-course prices. If you take the SP on a bet rather than a fixed price, your payout is determined by whatever price the horse starts at — which can be dramatically different from the morning price.</p>
<p>A horse might be priced at 8/1 the morning before a race and start at 3/1 if significant money arrives on it during the day. Understanding SP vs fixed price is essential for anyone betting on racing, and the gap between the two is a direct signal of where informed money has moved.</p>

<h2>Key Takeaway</h2>
<p>Fractional odds express profit, not total return — always add 1 (in decimal terms) to compare like-for-like. Convert to decimal immediately when you need to think clearly; the fractional format''s complexity is a historical artefact, not a feature.</p>'
WHERE slug = 'fractional-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');


UPDATE public.lessons
SET content = '<h2>What American odds are and how to read them</h2>
<p>American odds (also called moneyline odds) use positive and negative numbers, both anchored to a £100/€100/$100 unit. The sign tells you immediately which side of even money you are on:</p>
<ul>
<li><strong>Positive numbers (e.g. +250):</strong> The profit you make on a $100 stake. +250 means: stake $100, profit $250, total return $350. You are on the underdog side of even money.</li>
<li><strong>Negative numbers (e.g. −150):</strong> The stake required to profit $100. −150 means: stake $150 to profit $100, total return $250. You are on the favourite side of even money.</li>
</ul>
<p>The dividing line is −100/+100, which both equal decimal 2.00 — the exact coin-flip price. Any positive number is longer than evens; any negative number shorter than evens.</p>

<h2>Converting to decimal: the two formulas</h2>
<p>Always convert to decimal for clear comparison:</p>
<ul>
<li><strong>Positive moneyline to decimal:</strong> (Moneyline ÷ 100) + 1<br>Example: +250 → (250 ÷ 100) + 1 = 3.50</li>
<li><strong>Negative moneyline to decimal:</strong> (100 ÷ |Moneyline|) + 1<br>Example: −150 → (100 ÷ 150) + 1 = 1.667</li>
</ul>
<p>Quick reference table for common moneyline prices:</p>
<ul>
<li>+100 = 2.00 (evens, 50.0%)</li>
<li>+150 = 2.50 (40.0%)</li>
<li>+200 = 3.00 (33.3%)</li>
<li>+300 = 4.00 (25.0%)</li>
<li>−110 = 1.909 (52.4%) — the standard spread price</li>
<li>−150 = 1.667 (60.0%)</li>
<li>−200 = 1.500 (66.7%)</li>
</ul>

<h2>The vig in American odds: how it differs from the decimal presentation</h2>
<p>In American sports betting, two-outcome markets (spread, total) are almost universally priced at −110 on both sides. At decimal this is 1.909, implying 52.4% probability for each side.</p>
<p>The sum: 52.4% + 52.4% = 104.8%. The overround is 4.8% — exactly the same margin structure as a European book pricing both sides of a two-way market at 1.91. The format is different; the economic structure is identical.</p>
<p>Understanding this equivalence means you can evaluate American markets using the same overround logic you apply to decimal markets. The −110/−110 standard means bettors need to win approximately 52.4% of spread/totals bets just to break even — before shopping for better prices.</p>

<h2>Point spreads and totals: where moneyline format dominates</h2>
<p>The US sports betting market is structured primarily around two market types that use moneyline odds:</p>
<ul>
<li><strong>Moneyline (winner):</strong> Straight win/loss. In a mismatched game, the favourite might be −400 (1.25 decimal) and the underdog +320 (4.20 decimal).</li>
<li><strong>Point spread:</strong> A handicap market designed to create a near-50/50 proposition. Both sides typically price around −110. If the spread is Patriots −6.5, they must win by 7 or more for a Patriots spread bet to win.</li>
<li><strong>Total (over/under):</strong> The combined score must finish over or under a set number. Also typically priced around −110 on both sides.</li>
</ul>

<h2>When you will encounter American odds outside the US</h2>
<p>American odds appear in several contexts beyond US sportsbooks:</p>
<ul>
<li>International operators who serve US customers (DraftKings, FanDuel display them by default)</li>
<li>Some European exchanges and comparison sites allow users to toggle between formats</li>
<li>Pinnacle offers American format as an option alongside decimal</li>
<li>Betting journalism and podcasts based in North America quote prices in this format</li>
</ul>
<p>Even if you never use a US sportsbook, the ability to read moneyline odds quickly is essential for following international betting literature and understanding how the world''s largest legal sports betting market operates.</p>

<h2>Key Takeaway</h2>
<p>American odds are the same pricing information in a different wrapper. Convert to decimal first, apply the implied probability formula as usual, and evaluate value on exactly the same basis. The format changes; the underlying maths does not.</p>'
WHERE slug = 'american-moneyline-odds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');


-- ══════════════════════════════════════════════════════════════
-- BETTING ACADEMY — Implied Probability Explained
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>The most important formula in sports analysis</h2>
<p>Every bookmaker price makes a claim about the world. It says: "we believe this outcome happens with approximately X% probability." The implied probability formula decodes that claim in one step:</p>
<p><strong>Implied Probability = 1 ÷ Decimal Odds</strong></p>
<p>At 2.10: 1 ÷ 2.10 = 0.476 = 47.6%. The bookmaker is pricing this outcome as a 47.6% chance. At 3.40: 1 ÷ 3.40 = 29.4%. At 3.60: 27.8%.</p>
<p>Once you have these percentages, you have something concrete to argue with. Your analysis either agrees with the bookmaker''s implied probability, or it does not. If it does not, you have the foundation of a value bet.</p>

<h2>A full worked example: reading a match market</h2>
<p>Take a typical Premier League fixture with these prices from our match_odds dataset (sourced from Bet365 and Pinnacle):</p>
<ul>
<li><strong>Home win:</strong> 2.10 → 1 ÷ 2.10 = 47.6%</li>
<li><strong>Draw:</strong> 3.40 → 1 ÷ 3.40 = 29.4%</li>
<li><strong>Away win:</strong> 3.60 → 1 ÷ 3.60 = 27.8%</li>
<li><strong>Sum: 104.8%</strong></li>
</ul>
<p>The total exceeds 100% by 4.8 percentage points. That excess is the overround — the bookmaker''s margin. The prices do not represent the bookmaker''s true probability estimate; they represent true probability minus margin.</p>
<p>To estimate the market''s <em>true</em> probability for each outcome (after removing the margin), divide each implied probability by the total:</p>
<ul>
<li>True P(Home) = 47.6 ÷ 104.8 = 45.4%</li>
<li>True P(Draw) = 29.4 ÷ 104.8 = 28.1%</li>
<li>True P(Away) = 27.8 ÷ 104.8 = 26.5%</li>
<li>Sum: 100.0% ✓</li>
</ul>
<p>This de-vigging process gives you the market consensus estimate stripped of commercial margin — a starting point for your own assessment.</p>

<h2>What "value" means in this framework</h2>
<p>A value bet exists when your estimated probability for an outcome exceeds the implied probability embedded in the odds — after removing the margin.</p>
<p>If your analysis suggests the away team has a 32% chance of winning (not the market''s 26.5%), and the price is 3.60 (implying 27.8% before margin), you believe the true probability is approximately 5 percentage points higher than the market''s estimate. Whether you are correct will only be determined over hundreds of similar bets — but the identification process begins with this comparison.</p>

<h2>How odds from our dataset illustrate probability</h2>
<p>Our match_odds table contains pre-match odds from multiple bookmakers for every historical match. Comparing the implied probabilities from different bookmakers reveals market uncertainty: when Bet365 prices a home win at 2.10 (47.6%) and Pinnacle prices it at 2.20 (45.5%), the two-percentage-point difference reflects different probability models. Neither is definitively correct — the closing line, after all money has moved, is the best estimate available.</p>
<p>Matches where bookmakers disagree significantly on implied probability are the ones most likely to contain pricing errors — in one direction or the other. This disagreement shows up as wider spreads between bookmaker prices for the same outcome.</p>

<h2>Implied probability across different bet types</h2>
<p>The same formula applies to any betting market, not just match results:</p>
<ul>
<li><strong>Asian handicap:</strong> Both sides of a −0.5 handicap should each be near 50% after removing margin. Deviations from 50/50 reflect the market''s assessment of how much stronger one team is.</li>
<li><strong>Over/under totals:</strong> Over 2.5 at 2.00 implies exactly 50%. If you believe a match has a higher than 50% chance of producing three or more goals, the over offers value.</li>
<li><strong>Player props:</strong> Anytime scorer at 3.50 implies 28.6%. Your assessment of that player''s minutes, form, and role should produce a probability estimate you can compare directly.</li>
</ul>

<h2>The habit to build</h2>
<p>Every time you look at a price, immediately convert it to a probability. Do not evaluate a price as "short" or "generous" in isolation — evaluate it as a probability claim and ask whether that claim is accurate. This single habit separates analytical bettors from casual ones. Thinking in probabilities replaces gut feel with a framework that can be tested, tracked, and improved over time.</p>

<h2>Key Takeaway</h2>
<p>The implied probability formula (1 ÷ decimal odds) converts every bookmaker price into a testable claim. Comparing that claim to your own probability estimate is the entire basis of finding value — everything else in betting analytics is built on this foundation.</p>'
WHERE slug = 'from-odds-to-probability'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');


UPDATE public.lessons
SET content = '<h2>What the overround is and why it exists</h2>
<p>The overround (also called the vig, juice, or margin) is the mechanism through which bookmakers guarantee long-run profit. It works by pricing all possible outcomes in a market above their true probability, so the sum of all implied probabilities in any market exceeds 100%.</p>
<p>In a perfectly fair market on a coin flip, both outcomes would be priced at 2.00 — each implying exactly 50%, summing to 100%. A bookmaker prices both at 1.91 — each implying 52.4%, summing to 104.8%. The 4.8% above 100% is the overround.</p>
<p>The bookmaker does not care which side wins. If equal money arrives on both outcomes, the overround guarantees profit regardless of the result. In practice, books rarely have perfectly balanced books, but risk management tools allow them to hedge their exposure.</p>

<h2>Calculating the overround step by step</h2>
<p>For any market, the calculation is the same:</p>
<ol>
<li>Convert every outcome''s price to implied probability (1 ÷ decimal)</li>
<li>Sum all implied probabilities</li>
<li>The sum minus 100% is the overround</li>
</ol>
<p>For the three-outcome football market priced at 2.10 / 3.40 / 3.60:</p>
<ul>
<li>47.62% + 29.41% + 27.78% = <strong>104.81%</strong></li>
<li>Overround: <strong>4.81%</strong></li>
</ul>
<p>The long-run implication: a bettor who places equal stakes across all three outcomes (£1 each, £3 total) receives back on average £3 × (100 ÷ 104.81) = <strong>£2.86</strong>. The £0.14 loss on every £3 staked is the overround working against them.</p>

<h2>What the overround costs you per bet</h2>
<p>At a 5% overround, for every £100 staked, your expected return in a neutral market is £95. The remaining £5 is the bookmaker''s margin.</p>
<p>This is why even a bettor who picks winners at exactly the true probability will lose over time. To profit, you need to identify outcomes where your estimated probability <em>exceeds</em> the bookmaker''s implied probability — and by enough to overcome the margin.</p>
<p>A crude way to understand the break-even requirement: at a 5% margin, you need to identify 5% of value (on average) just to break even. At a 2% margin (Pinnacle-level), you only need 2% of edge to cover costs. This is why market selection is as important as selection quality.</p>

<h2>How margins vary across bookmakers and market types</h2>
<p>Our match_odds dataset contains prices from multiple bookmakers (Bet365, Pinnacle, William Hill, VC Bet, and others) for the same match. Comparing the overround across bookmakers on the same market is one of the most instructive exercises in understanding how the industry is structured:</p>
<ul>
<li><strong>Pinnacle (PS in our dataset):</strong> Typically 1.5–2.5% on major football 1X2 markets. The industry benchmark for low margin.</li>
<li><strong>Bet365 (B365):</strong> Typically 4–7% on standard markets. Higher margins offset by broader market availability and promotional offers.</li>
<li><strong>William Hill, VC Bet:</strong> Generally 5–8% on core markets. Higher still on secondary markets and specials.</li>
</ul>
<p>You can verify this directly in our dataset: for any match, calculate the overround for each bookmaker''s home/draw/away prices and compare. The pattern is consistent across thousands of matches.</p>

<h2>How margin compounds in accumulators</h2>
<p>Each leg of an accumulator multiplies the margins together. If each leg carries a 5% overround, the effective margin after five legs is:</p>
<p>1 − (0.952 × 0.952 × 0.952 × 0.952 × 0.952) = 1 − 0.776 = <strong>22.4%</strong></p>
<p>For a 10-leg accumulator at 5% per leg, the effective margin approaches 40%. This is the primary reason bookmakers actively promote accumulator betting — it is one of the highest-margin products they offer. Every recreational bettor who places weekly accumulators is paying a compounded margin that makes long-run profitability virtually impossible.</p>

<h2>Asian handicap: the low-margin alternative</h2>
<p>Asian handicap markets are two-outcome markets (the draw is eliminated by the half-goal handicap). With only two outcomes to price, bookmakers typically offer margins of 2–4% on major matches — significantly lower than the three-outcome 1X2 market. This is one reason sharp bettors heavily prefer Asian handicap: lower costs mean a smaller edge is required to be profitable.</p>

<h2>Key Takeaway</h2>
<p>The overround is not a technicality — it is a structural tax on every bet you place, and its size varies enormously by bookmaker and market type. Understanding it transforms you from a passive price-taker into someone who can evaluate the real cost of each bet and choose markets accordingly.</p>'
WHERE slug = 'the-overround-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');


-- ══════════════════════════════════════════════════════════════
-- BETTING ACADEMY — Bankroll Fundamentals
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = '<h2>What a bankroll is — and what it is not</h2>
<p>A bankroll is a dedicated, ring-fenced sum of money set aside exclusively for betting activity — money you can afford to lose entirely without affecting your daily life, your savings goals, or your financial security.</p>
<p>The definition has two parts that are equally important. The first is the purpose: it is for betting, not for other things. The second is the constraint: it must be money you can genuinely afford to lose completely. Not money you expect to lose — but money that could disappear entirely without consequence to the rest of your financial life.</p>
<p>A bankroll is <em>not</em> your rent money used because you feel confident about an upcoming fixture. It is not money borrowed from a friend "just this once." It is not savings earmarked for something else that you are temporarily redirecting. These uses corrupt the bankroll concept at the root and make every subsequent decision emotionally distorted.</p>

<h2>Why physical and psychological separation matters</h2>
<p>Mixing betting funds with living expenses creates a specific and well-documented psychological problem: loss aversion amplified by genuine stakes. When the money you are betting with is connected to real financial consequences, the emotional pressure of a losing run changes the quality of every decision you make.</p>
<p>Fear of losing money you need causes bettors to:</p>
<ul>
<li>Chase losses by increasing stakes to recover faster — compressing the time horizon and dramatically increasing the probability of total ruin</li>
<li>Close winning bets early to "lock in" profit even when the expected value of holding the position is higher</li>
<li>Avoid placing bets with genuine positive expected value because the potential loss feels unbearable</li>
<li>Abandon sound strategies during normal variance downswings because the losses feel like emergencies</li>
</ul>
<p>Physical separation — a dedicated bank account or e-wallet that holds only betting funds and receives only betting withdrawals — is the structural solution. When the money in your betting account is genuinely ring-fenced, a 10-unit losing run is a statistical event to be managed, not a personal financial crisis.</p>

<h2>Setting the right starting size</h2>
<p>There is no universal correct bankroll size. But there are two non-negotiable requirements and a practical sizing framework:</p>
<p><strong>Requirement 1:</strong> The bankroll must be money you can lose entirely without financial consequence.</p>
<p><strong>Requirement 2:</strong> The bankroll must be large enough to survive a realistic losing run without going broke or forcing a change in strategy.</p>
<p>Even a bettor with a genuine 5% edge will experience losing runs of 15–25 consecutive bets through normal variance. A bankroll that would be destroyed by such a run is too small for the intended stake size — not because of bad luck, but because the maths of variance makes such runs inevitable over a long enough sample.</p>
<p>A practical guideline: set your bankroll at 50–100 times your intended standard stake. If you plan to bet £20 per standard unit, your starting bankroll should be between £1,000 and £2,000. This ensures you can absorb a 25-unit losing run and remain comfortably operational.</p>

<h2>Units: the language of betting performance</h2>
<p>Professionals track performance in units rather than currency. One unit equals one standard stake. If your bankroll is £1,000 and you stake 2% per bet, one unit = £20.</p>
<p>Thinking in units has several advantages:</p>
<ul>
<li><strong>Comparability:</strong> A bettor with a £500 bankroll and a bettor with a £50,000 bankroll can compare results in units without the currency amounts confusing the picture. "+12 units over 200 bets" describes performance regardless of the unit size.</li>
<li><strong>Emotional insulation:</strong> "I''m 8 units down" is less viscerally painful than "I''m £1,600 down" — and the former is the correct frame for evaluating whether the run reflects normal variance or a genuine problem.</li>
<li><strong>Strategy clarity:</strong> When you adjust stakes, you adjust the unit size — you do not change your staking plan based on recent results. Units provide the stable reference point.</li>
</ul>

<h2>The minimum viable tracking system</h2>
<p>A bankroll without records is not really a bankroll — it is a feeling. Every bet placed from a bankroll should be recorded with at minimum:</p>
<ul>
<li>Date and event</li>
<li>Selection and market</li>
<li>Bookmaker</li>
<li>Stake in units</li>
<li>Decimal odds taken</li>
<li>Result (win/loss)</li>
<li>Profit/loss in units</li>
<li>Running bankroll balance in units</li>
</ul>
<p>The running balance column is the most important. Plot it periodically and you have the most informative single view of whether your operation is working — a curve that trends upward, holds flat, or declines, each telling a different story over a sufficient sample of bets.</p>

<h2>The long-run mindset</h2>
<p>A bankroll is a long-term instrument. It is not designed to produce dramatic short-term results. A bettor who grows their bankroll by 20% in a year, consistently and repeatably, without blowing up, is performing at an elite level. A bettor who triples their bankroll in a month and then loses it all has demonstrated nothing except variance.</p>
<p>The goal of bankroll management is survival first, growth second. An operation that survives long enough to accumulate a meaningful sample of bets can produce reliable conclusions about performance. An operation that blows up in two months never reaches that point.</p>

<h2>Key Takeaway</h2>
<p>A bankroll is not just money — it is a structured framework that separates disciplined decision-making from emotional reaction. Set it to a size you can genuinely lose, keep it physically separate, track every bet in units, and treat it as a long-term operation rather than a short-term speculation.</p>'
WHERE slug = 'what-is-a-bankroll'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'bankroll-fundamentals');
