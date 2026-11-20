-- ============================================================
-- PunterStat — Migration 057: Sports University Football Deep Rewrite (29 lessons)
-- Rewrites & expands 29 lessons with real-data benchmarks,
-- worked examples, HTML tables, and Key Takeaways.
-- ============================================================

-- [introduction-to-football] the-objective-of-the-game
UPDATE public.lessons
SET content = '<h2>Why the Simplest Rule Drives Every Analytical Model</h2>
<p>Football is a low-scoring, continuous-clock invasion sport in which two teams of eleven players compete to score more goals than their opponent over 90 minutes plus stoppage time. That sounds elementary, yet its mathematical consequence separates football from almost every other major sport: <strong>goals are rare events</strong>. Because a typical top-flight match produces fewer than 3 total goals, a single deflection, refereeing call, or 89th-minute corner swings the match result far more dramatically than a single basket in the NBA (where teams score ~114 points per game).</p>
<p>Analytically, this rarity means short-term scorelines contain massive random noise. A team can generate 2.4 Expected Goals (xG) to an opponent''s 0.6 xG and still lose 0–1 roughly <strong>12–15% of the time</strong> under a standard Poisson goal distribution. Understanding that football is governed by rare-event probability is the first step away from narrative-driven analysis.</p>

<h2>Real Data: Scoring Rates Across Major Leagues</h2>
<p>In PunterStat''s historical dataset (221,382 matches across 39 leagues, 2005–2026) and our v2.0 Dixon-Coles MLE engine, baseline scoring intensity varies meaningfully by league culture and tactical structure:</p>
<table>
  <thead>
    <tr><th>League</th><th>Code</th><th>Typical Goals / Match</th><th>Base Scoring Intercept (exp &mu;)</th><th>Home Scoring Boost</th></tr>
  </thead>
  <tbody>
    <tr><td>Eredivisie (Netherlands)</td><td><code>N1</code></td><td>~3.05</td><td>1.28 goals/team</td><td>+22.3%</td></tr>
    <tr><td>Bundesliga (Germany)</td><td><code>D1</code></td><td>~3.02</td><td>1.26 goals/team</td><td>+31.0%</td></tr>
    <tr><td>Premier League (England)</td><td><code>E0</code></td><td>~2.82</td><td>1.27 goals/team</td><td>+20.9%</td></tr>
    <tr><td>Serie A (Italy)</td><td><code>I1</code></td><td>~2.68</td><td>1.22 goals/team</td><td>+18.4%</td></tr>
    <tr><td>La Liga (Spain)</td><td><code>SP1</code></td><td>~2.56</td><td>1.03 goals/team</td><td>+30.4%</td></tr>
    <tr><td>Liga Profesional (Argentina)</td><td><code>ARG</code></td><td>~2.28</td><td>0.94 goals/team</td><td>+30.5%</td></tr>
  </tbody>
</table>
<div data-block="stat" data-factor="avg_goals"></div>

<h2>Match Clock, Stoppage Time, and Game-State Shifts</h2>
<p>Matches are split into two 45-minute halves with a 15-minute interval. Since the 2022 World Cup and the 2023/24 IFAB stoppage-time directive, added time in major European leagues jumped from an average of ~4–5 minutes to <strong>8–11 minutes per match</strong>. That extra 4–5 minutes of live football increased late-goal frequency (goals scored after minute 80) by roughly 15–18% in the Premier League.</p>
<ul>
  <li><strong>Leading by 1 goal after 70 minutes:</strong> Leading teams drop their defensive line by an average of 6–9 metres, cutting their own shot volume by ~35% while inviting low-quality crosses and long shots.</li>
  <li><strong>Trailing by 1 goal after 75 minutes:</strong> Trailing teams push full-backs high and introduce extra forwards, creating asymmetric transition space. Both goals scored <em>and</em> goals conceded spike sharply in minutes 76–90+.</li>
  <li><strong>Level at 0–0 or 1–1 late in a league match:</strong> Under the 3-point-for-a-win system, a draw is worth 1 point while a win is worth 3, yet mid-table teams often become risk-averse after minute 82 to protect a guaranteed point — which is why Dixon-Coles models include a low-score correlation parameter (<code>&rho;</code>) adjusting 0–0 and 1–1 probabilities.</li>
</ul>

<h2>Worked Example: Why 1 Goal Changes Everything</h2>
<p>Suppose Team A is priced at 1.85 pre-match (implied win probability ~51% after removing ~5% margin) with pre-match expected goals of <code>&lambda;<sub>A</sub> = 1.65</code> and <code>&lambda;<sub>B</sub> = 1.05</code>. If Team A scores in the 12th minute, their win probability jumps immediately from <strong>~51% to ~76%</strong> — even though 78 minutes remain. Conversely, if Team B scores first against the run of play, Team A''s win probability collapses from 51% to <strong>~24%</strong>. Every tactical choice in football is engineered around scoring that high-leverage first goal.</p>

<h2>Key Takeaway</h2>
<p>Football''s low-scoring nature makes every goal disproportionately valuable and makes single-match results noisy. Ground your analysis in underlying chance creation, league-specific scoring environments, and how game state reshapes team behaviour after the first goal.</p>'
WHERE slug = 'the-objective-of-the-game'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');

-- [introduction-to-football] the-pitch-ball-and-players
UPDATE public.lessons
SET content = '<h2>Pitch Dimensions as a Tactical Weapon</h2>
<p>IFAB Laws of the Game allow professional pitches between <strong>100–110 metres long</strong> and <strong>64–75 metres wide</strong> — a staggering difference of up to 1,850 square metres of playable space between the smallest and largest stadiums. While UEFA Category 4 stadiums standardize around 105m &times; 68m (7,140 m&sup2;), older domestic venues still vary noticeably:</p>
<table>
  <thead>
    <tr><th>Venue Profile</th><th>Approx. Dimensions</th><th>Area (m&sup2;)</th><th>Tactical Effect</th></tr>
  </thead>
  <tbody>
    <tr><td>Standard UEFA Elite (e.g. Etihad, Bernab&eacute;u)</td><td>105m &times; 68m</td><td>7,140</td><td>Balanced width for positional play and switches of play</td></tr>
    <tr><td>Compact / Narrow Ground (e.g. Kenilworth Road, Craven Cottage)</td><td>100–101m &times; 65–66m</td><td>~6,550</td><td>Compresses half-spaces, aids low blocks, boosts long-throw threat</td></tr>
    <tr><td>High-Altitude / Heavy-Travel Venues (e.g. La Paz, Toluca)</td><td>105m &times; 68m</td><td>7,140</td><td>Thinner air alters ball flight and accelerates away-team fatigue</td></tr>
  </tbody>
</table>
<p>On a compact pitch, defenders need 10–15% less horizontal sprint distance to shuttle from touchline to touchline, which measurably lowers passing completion in the final third and increases aerial duels and set-piece volume.</p>

<h2>Five Substitutions and Squad Depth</h2>
<p>The permanent shift from 3 substitutions to <strong>5 substitutions</strong> (across 3 stoppage windows plus half-time) fundamentally altered match dynamics since 2020/21:</p>
<ul>
  <li><strong>Higher second-half pressing intensity:</strong> Clubs with deep benches (e.g. Manchester City, Arsenal, Real Madrid, Bayern Munich) can replace their entire front three plus a midfielder around minute 65, maintaining sprint output when smaller-budget opponents fatigue.</li>
  <li><strong>Wider gap between rich and poor clubs:</strong> Empirical studies across the Big Five leagues show that top-6 clubs increased their share of goals scored after minute 70 under the 5-sub rule compared to the 3-sub era.</li>
  <li><strong>Card management:</strong> Managers now routinely withdraw booked full-backs or defensive midfielders at minute 55–65 rather than risking a second yellow card.</li>
</ul>

<h2>Red Cards: The Most Extreme Structural Shock</h2>
<p>When a player is sent off, a team drops from 10 outfield players to 9 (a 10% manpower loss, but a far larger spatial-coverage loss). Across top-flight historical match data:</p>
<ul>
  <li>A team receiving a red card in the <strong>first half</strong> loses roughly <strong>70–75%</strong> of those matches and wins fewer than <strong>10%</strong>.</li>
  <li>Even a red card between minutes 46–70 shifts expected remaining goal difference by approximately <strong>&minus;0.55 to &minus;0.75 goals</strong> against the 10-man side.</li>
  <li>Crucially, teams that commit high foul counts in transition (high-line teams caught on the counter) carry structurally higher red-card risk — an overlooked driver of underdog upsets.</li>
</ul>

<h2>Dead-Ball Volume &amp; Corners</h2>
<p>Across the top five European leagues, matches average <strong>10.0 to 11.2 corners</strong> and roughly <strong>22–26 fouls</strong>. While an individual corner converts into a goal only about <strong>3.0–3.5% of the time</strong> (roughly 1 goal every 30 corners), elite set-piece teams like Arsenal (2023/24: 16 Premier League goals from corners alone) double that conversion rate to ~6–7%, adding 8–10 league points over a 38-game season.</p>

<h2>Key Takeaway</h2>
<p>Pitch dimensions, the five-substitution rule, dead-ball volume, and red-card vulnerability are quantifiable structural variables. They explain why certain stadiums produce tight low-scoring games and why squad depth increasingly decides matches after the 65th minute.</p>'
WHERE slug = 'the-pitch-ball-and-players'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');

-- [introduction-to-football] how-goals-are-scored-and-prevented
UPDATE public.lessons
SET content = '<h2>The Empirical Breakdown of Goals</h2>
<p>Across Europe''s top five leagues over the past decade, goals originate from three primary phases with remarkable stability:</p>
<table>
  <thead>
    <tr><th>Goal Source</th><th>Share of All Goals</th><th>Typical Conversion Rate</th><th>Analytical Signal</th></tr>
  </thead>
  <tbody>
    <tr><td>Open Play (organised + transition)</td><td>64% – 69%</td><td>~9.5% – 11.0% of shots</td><td>Best indicator of repeatable attacking strength</td></tr>
    <tr><td>Set Pieces (corners, free kicks, throw-ins)</td><td>24% – 29%</td><td>~3.2% per corner; ~6% direct FK</td><td>Persistent tactical edge when coached well</td></tr>
    <tr><td>Penalty Kicks</td><td>7% – 10%</td><td>~77% – 79% converted</td><td>High variance; strongly linked to box touches</td></tr>
  </tbody>
</table>
<div data-block="stat" data-factor="over25_rate"></div>

<h2>Expected Goals (xG) and Shot Location Geometry</h2>
<p>Not all shots are created equal. Expected Goals (xG) models trained on hundreds of thousands of shots show that <strong>distance and angle to goal</strong> explain over 75% of shot conversion probability:</p>
<ul>
  <li><strong>Six-yard box (0–6m, central):</strong> ~0.40 – 0.65 xG per shot (tap-ins and cutbacks).</li>
  <li><strong>Penalty spot zone (10–14m, central):</strong> ~0.18 – 0.28 xG per open-play foot shot (headers from the same spot drop to ~0.08 – 0.12 xG).</li>
  <li><strong>Edge of the box (16–20m):</strong> ~0.05 – 0.08 xG.</li>
  <li><strong>Long range (25m+):</strong> ~0.02 – 0.03 xG (1 goal every 35–50 attempts).</li>
</ul>
<p><strong>Worked Real-World Example:</strong> Imagine Team X wins 2–0 with 14 shots (11 from outside the box, total <code>0.78 xG</code>), while Team Y loses 0–2 with 9 shots (4 inside the six-yard box, total <code>2.15 xG</code>). A casual observer calls Team X "clinical and dominant." A data analyst recognises that if the same fixture were replayed 10 times, Team Y wins roughly 6–7 of them. Over a 38-game season, <strong>xG Difference (xGD)</strong> predicts future points roughly <strong>20–25% more accurately</strong> than actual goal difference over small 8–12 game windows.</p>

<h2>How Elite Defences Prevent Goals</h2>
<p>Great defences do not just rely on heroic goalkeeper saves — they engineer <strong>low xG per shot allowed</strong>:</p>
<ul>
  <li><strong>Protecting Zone 14 and the cutback lane:</strong> Blocking passes to the penalty spot forces opponents into 0.04 xG long shots or contested headers.</li>
  <li><strong>Post-Shot xG (PSxG) vs Goalkeeper Overperformance:</strong> A goalkeeper who saves +8 goals above PSxG in one season (e.g. Alisson Becker or Gianluigi Donnarumma at peak) is genuinely valuable, whereas a keeper who overperforms by +6 goals on a small 10-match run usually regresses toward zero.</li>
  <li><strong>Set-piece zonal + hybrid marking:</strong> Conceding 0.15 fewer set-piece goals per match saves ~5.7 goals over 38 games — worth roughly <strong>5–6 league points</strong>.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Goals come ~67% from open play, ~25% from set pieces, and ~8% from penalties. Separate repeatable chance quality (xG, box entries, shots on target) from short-term finishing luck before judging whether a team''s attack or defence is genuinely elite.</p>'
WHERE slug = 'how-goals-are-scored-and-prevented'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-football');

-- [positions-and-roles] goalkeeper-role
UPDATE public.lessons
SET content = '<h2>The Dual Mandate: Shot-Stopping and First Playmaker</h2>
<p>Twenty years ago, goalkeepers were judged almost exclusively on reflex saves and clean sheets. Today, an elite goalkeeper performs two statistically distinct jobs: <strong>preventing goals above expectation</strong> and <strong>breaking the opponent''s first line of press</strong>.</p>

<h2>Quantifying Shot-Stopping: PSxG &minus; GA</h2>
<p>Save percentage alone is deeply misleading because a goalkeeper behind a deep low block faces mostly 0.05 xG long shots, while a keeper behind a high-pressing defence faces 0.35 xG one-on-ones. Modern analytics uses <strong>Post-Shot Expected Goals minus Goals Allowed (PSxG &minus; GA)</strong>, which accounts for shot placement, velocity, and trajectory:</p>
<table>
  <thead>
    <tr><th>Goalkeeper Tier (38-match season)</th><th>PSxG &minus; GA</th><th>Impact on League Points</th><th>Typical Profile</th></tr>
  </thead>
  <tbody>
    <tr><td>Elite Shot-Stopper (Top 5%)</td><td>+6.0 to +10.0 goals</td><td>+5 to +8 points</td><td>Alisson, Courtois, Donnarumma (peak seasons)</td></tr>
    <tr><td>Solid Top-Flight Starter</td><td>&minus;1.0 to +2.5 goals</td><td>Neutral to +2 points</td><td>Average Premier League / Bundesliga starter</td></tr>
    <tr><td>Underperforming / Error-Prone</td><td>&minus;5.0 to &minus;9.0 goals</td><td>&minus;4 to &minus;7 points</td><td>Often replaced or triggers relegation battles</td></tr>
  </tbody>
</table>
<p><strong>Critical analytical trap:</strong> Goalkeeper PSxG &minus; GA has low year-to-year stability (<code>r &approx; 0.25–0.35</code>). A keeper who posts +9.0 in one season frequently drops to +1.0 the next. Never project a single hot 10-game streak as permanent superhuman ability.</p>

<h2>The Sweeper-Keeper and Build-Up Value</h2>
<p>When a goalkeeper steps 15–20 metres off their line (sweeper-keeper), they allow their centre-backs to push 8–10 metres higher up the pitch — compressing the opposition''s space without conceding breakaways. In possession, a ball-playing keeper (like Ederson at Manchester City or David Raya at Arsenal) creates a <strong>11v10 numerical overload</strong> against an opponent''s high press.</p>
<ul>
  <li><strong>Cross Claiming (OPA / Crosses Stopped %):</strong> Average top-flight keepers claim ~6–7% of crosses into the box. Dominant command keepers (e.g. Raya, Courtois) claim <strong>11–14%</strong>, directly extinguishing high-xG second balls.</li>
  <li><strong>Backup Goalkeeper Drop-Off:</strong> When a starting keeper is injured, the market often under-adjusts if the backup is weaker with their feet — forcing the entire team to abandon short build-up and go long, which reduces their possession by 5–8% and increases opponent shot volume.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Evaluate goalkeepers across three dimensions: PSxG &minus; GA (shot-stopping), cross-claiming percentage (aerial control), and pass-progression under pressure (build-up). A goalkeeper injury can quietly break a team''s entire build-up structure, not just its save rate.</p>'
WHERE slug = 'goalkeeper-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- [positions-and-roles] centre-backs-role
UPDATE public.lessons
SET content = '<h2>The Structural Spine of Every Football Team</h2>
<p>Centre-backs sit at the geometric heart of a team''s defensive and build-up architecture. Because central areas produce the highest xG per shot, a single centre-back lapse directly yields a 0.30+ xG chance. Modern squads pair complementary archetypes rather than two identical defenders.</p>

<h2>Core Centre-Back Archetypes</h2>
<table>
  <thead>
    <tr><th>Archetype</th><th>Primary Strengths</th><th>Key Metrics</th><th>Example Profiles</th></tr>
  </thead>
  <tbody>
    <tr><td>Ball-Playing CB</td><td>Line-breaking passes, press resistance, diagonal switches</td><td>Progressive passes/90 (&gt;5.0), pass completion &gt;89%</td><td>John Stones, Alessandro Bastoni, William Saliba</td></tr>
    <tr><td>Dominant Sweeper / Recovery CB</td><td>Recovery pace against high-line counters, 1v1 duels</td><td>High-speed recovery runs, duel win % &gt;68%</td><td>Micky van de Ven, Ronald Ara&uacute;jo, Ibrahima Konat&eacute;</td></tr>
    <tr><td>Aerial Stopper / Box Defender</td><td>Clearing crosses, set-piece dominance (both boxes)</td><td>Aerial duel win % &gt;70%, clearances/90</td><td>Virgil van Dijk, Gabriel Magalh&atilde;es, Jos&eacute; Gim&eacute;nez</td></tr>
  </tbody>
</table>

<h2>Why Centre-Back Partnerships Matter More Than Individuals</h2>
<p>A high-line team (e.g. Tottenham under Ange Postecoglou or Barcelona under Hansi Flick) depends on recovery speed to neutralize balls in behind. If their fast recovery CB is suspended and replaced by a slower box defender, the manager faces an ugly trade-off: either keep the high line and concede 2–3 breakaways per game, or drop the defensive line 10 metres deeper and break their pressing trap.</p>
<p><strong>Real-Data Impact:</strong> Across Premier League seasons 2019–2025, losing a first-choice ball-playing or organising centre-back (such as Virgil van Dijk in 2020/21 or William Saliba in spring 2023) increased team xG conceded by <strong>+0.25 to +0.42 xGA per match</strong> — equivalent to roughly 0.35 goals per game, which shifts fair match odds dramatically.</p>

<h2>Set-Piece Dual Threat</h2>
<p>Aerial centre-backs also generate 15–25% of their team''s set-piece xG. Gabriel Magalh&atilde;es (Arsenal) and Virgil van Dijk (Liverpool) routinely accumulate <strong>3.5–5.0 xG per season</strong> from corners and free kicks alone — comparable to a rotational winger''s open-play output.</p>

<h2>Key Takeaway</h2>
<p>Centre-backs dictate both defensive line height and first-phase ball progression. When checking team news, a missing first-choice centre-back — especially in a high-line system — is one of the highest-impact lineup shifts in football.</p>'
WHERE slug = 'centre-backs-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- [positions-and-roles] full-backs-wing-backs-role
UPDATE public.lessons
SET content = '<h2>From Defensive Stoppers to Primary Chance Creators</h2>
<p>No position in football has undergone a more radical transformation over the past 15 years than the full-back. In the classic 1990s 4-4-2, full-backs stayed compact alongside centre-backs. In modern football, full-backs and wing-backs frequently lead their teams in touches, progressive passes, and assists.</p>

<h2>Three Modern Full-Back Roles</h2>
<ul>
  <li><strong>Overlapping Wing-Back / Attacking Full-Back:</strong> Hugs the touchline to stretch the opponent''s back four, delivering cutbacks and early crosses (e.g. Achraf Hakimi, Andy Robertson, Jeremie Frimpong). Creates high assist volume but leaves transition space behind them.</li>
  <li><strong>Inverted Full-Back:</strong> Steps inside into central midfield during build-up to form a <code>3-2</code> rest-defence structure (e.g. Oleksandr Zinchenko, Rico Lewis, Trent Alexander-Arnold in hybrid roles). Protects against central counter-attacks and creates midfield numerical superiority.</li>
  <li><strong>Third Centre-Back / Tuck-In Full-Back:</strong> Stays deep alongside the two centre-backs when the opposite full-back bombs forward (e.g. Ben White, Kyle Walker, Josko Gvardiol). Balances a 4-man defence into a 3-man build-up platform.</li>
</ul>

<h2>The Physical and Tactical Cost</h2>
<p>Wing-backs cover the highest high-intensity sprint distance on the pitch — routinely <strong>11.0–12.2 km total distance</strong> with <strong>800–1,100 metres of sprinting per match</strong>. That workload creates two clear analytical patterns:</p>
<ol>
  <li><strong>Fixture-congestion drop-off:</strong> Teams relying heavily on overlapping wing-backs (e.g. Inter Milan''s 3-5-2 or Bayer Leverkusen''s 3-4-2-1) suffer sharper fatigue drop-offs during 3-game weeks unless they rotate wing-backs around minute 60–70.</li>
  <li><strong>Asymmetric vulnerability:</strong> When a team pushes its right-back high into the attacking third, opponents deliberately target that exact channel on turnovers. Tracking <em>which flank</em> a team attacks from often predicts where they will concede counter-attacks and corners.</li>
</ol>

<h2>Key Takeaway</h2>
<p>Identify whether a team''s full-backs overlap, invert, or tuck in. Overlapping full-backs increase both chance creation and counter-attack exposure down the flanks, while inverted full-backs prioritize central control and rest-defence stability.</p>'
WHERE slug = 'full-backs-wing-backs-role'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- [positions-and-roles] central-midfield-roles
UPDATE public.lessons
SET content = '<h2>The Engine Room That Controls Tempo and Transition</h2>
<p>Central midfielders touch the ball more often than any other unit on the pitch and determine whether a match becomes a controlled positional chess game or a chaotic end-to-end transition battle. Modern analytics divides central midfielders into four distinct functional profiles:</p>
<table>
  <thead>
    <tr><th>Role</th><th>Primary Job</th><th>Key Statistical Signatures</th><th>Real-World Examples</th></tr>
  </thead>
  <tbody>
    <tr><td>Single Pivot / Destroyer (#6)</td><td>Screen centre-backs, break up counters, recycle possession</td><td>Interceptions, tackles in middle third, high pass accuracy</td><td>Rodri, Declan Rice, Aur&eacute;lien Tchouam&eacute;ni</td></tr>
    <tr><td>Deep-Lying Playmaker (Regista)</td><td>Dictate tempo, switch play, beat first press</td><td>Progressive passes/90 (&gt;8), long-ball accuracy &gt;75%</td><td>Toni Kroos, Jorginho, Vitinha</td></tr>
    <tr><td>Box-to-Box / Mezzala (#8)</td><td>Carry ball into half-spaces, late box runs, press aggressively</td><td>Progressive carries, touches in opp. box, pressures/90</td><td>Federico Valverde, Jude Bellingham, Nicol&ograve; Barella</td></tr>
    <tr><td>Attacking Midfielder (#10)</td><td>Receive between lines, final-third through balls</td><td>Expected Assists (xA/90), shot-creating actions</td><td>Martin &Oslash;degaard, Florian Wirtz, Jamal Musiala</td></tr>
  </tbody>
</table>

<h2>Real Data: The Single-Pivot Dependency Effect</h2>
<p>When a possession-dominant team loses its elite #6, the structural impact is often larger than losing a star striker. A famous empirical case: during the 2023/24 Premier League season, Manchester City''s win rate <strong>with Rodri</strong> was ~74% (conceding ~0.82 goals/game), whereas in the matches <strong>without Rodri</strong> their win rate fell sharply and opponents generated far higher transition xG. Without a press-resistant #6, a team loses both its ball progression and its counter-attack shield simultaneously.</p>

<h2>Midfield Matchups and Over/Under Dynamics</h2>
<ul>
  <li><strong>Control vs Control (e.g. double pivot vs double pivot):</strong> Compresses the central corridor, reduces transition shots, and pushes match totals lower (higher <code>Under 2.5</code> probability).</li>
  <li><strong>Open Midfield (attacking #8s without a natural #6):</strong> Creates fast vertical turnovers and high-xG transitions in both directions (higher <code>BTTS</code> and <code>Over 2.5</code> probability).</li>
</ul>

<h2>Key Takeaway</h2>
<p>Midfield balance governs match tempo. Always check whether a team''s starting #6 is available — losing the defensive anchor changes both offensive ball progression and defensive transition exposure in a single stroke.</p>'
WHERE slug = 'central-midfield-roles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- [positions-and-roles] attacker-roles
UPDATE public.lessons
SET content = '<h2>How Forward Profiles Shape Chance Creation</h2>
<p>Not all forwards score or create in the same way. Pairing the wrong forward profile with a team''s midfield and full-back setup can starve an attack of high-xG chances even when the squad is full of expensive talent.</p>
<ul>
  <li><strong>Target Man / Poacher (#9):</strong> Pins both centre-backs, attacks cutbacks and crosses inside the 6-yard box (e.g. Erling Haaland, Victor Osimhen, Robert Lewandowski). Generates very high <code>xG per shot</code> (~0.18–0.23) on fewer touches.</li>
  <li><strong>False Nine / Link-Up Striker:</strong> Drops into midfield to create a 4v3 overload, dragging centre-backs out of position so inverted wingers can sprint into the vacated central space (e.g. Roberto Firmino at Liverpool, Lionel Messi at Barcelona, Kai Havertz in hybrid roles).</li>
  <li><strong>Inverted Winger:</strong> Right-footed on the left (or vice versa), cutting inside onto their stronger foot to shoot or combine in the half-space (e.g. Mohamed Salah, Bukayo Saka, Vin&iacute;cius J&uacute;nior).</li>
  <li><strong>Touchline Winger:</strong> Holds maximum width to isolate full-backs 1v1 and deliver byline cutbacks — crucial against deep 5-man low blocks.</li>
</ul>

<h2>Variance in Striker Finishing: Real Benchmarks</h2>
<p>Even world-class strikers experience brutal finishing streaks. Over full career samples (500+ shots), only a tiny elite tier (e.g. Son Heung-min, Lionel Messi, Harry Kane) consistently outperform xG by <strong>+15% to +25%</strong>. Most top-flight strikers finish within <strong>&plusmn;8% of their xG</strong> over multi-season horizons. When a striker scores 8 goals from 3.5 xG in October, the smart analytical move is to expect regression toward their shot-quality baseline — not assume they have permanently doubled their conversion rate.</p>

<h2>Key Takeaway</h2>
<p>Evaluate attackers by how their movement fits the team''s supply lines (crosses vs through balls vs cutbacks) and rely on non-penalty xG + xA per 90 rather than hot or cold finishing streaks.</p>'
WHERE slug = 'attacker-roles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- [understanding-formations] what-a-formation-number-means
UPDATE public.lessons
SET content = '<h2>Starting Shape vs Live Phase Shapes</h2>
<p>A formation like <code>4-3-3</code> or <code>4-2-3-1</code> is read from defence to attack (excluding the goalkeeper). Its most common misuse is treating it as a static map. In modern football, every team operates at least <strong>three distinct shapes</strong> in a single match:</p>
<ol>
  <li><strong>Out-of-possession defensive block:</strong> Often <code>4-4-2</code> or <code>4-5-1</code> to cover the width of the pitch cleanly.</li>
  <li><strong>In-possession build-up (rest defence):</strong> Frequently <code>3-2-5</code> or <code>2-3-5</code>, created by inverting a full-back or dropping a #6 between the centre-backs.</li>
  <li><strong>High-press shape:</strong> Frequently man-oriented <code>4-2-4</code> or <code>3-4-3</code> to match the opponent''s goalkeeper + centre-backs.</li>
</ol>

<h2>Same Formation Number, Opposite Football</h2>
<table>
  <thead>
    <tr><th>Club / Era</th><th>Listed Shape</th><th>In-Possession Shape</th><th>Avg. Possession</th><th>Directness</th></tr>
  </thead>
  <tbody>
    <tr><td>Manchester City (Guardiola)</td><td>4-3-3 / 4-2-3-1</td><td>3-2-5 (inverted FB)</td><td>~64–67%</td><td>Low (patient positional play)</td></tr>
    <tr><td>Liverpool (Klopp peak)</td><td>4-3-3</td><td>2-3-5 (overlapping FBs)</td><td>~58–61%</td><td>High (vertical transitions &amp; pressing)</td></tr>
    <tr><td>Crystal Palace / Mid-table 4-3-3</td><td>4-3-3</td><td>4-5-1 low block &rarr; counter</td><td>~43–46%</td><td>Very high (fast direct balls)</td></tr>
  </tbody>
</table>

<h2>Analytical Takeaway for Match Previews</h2>
<p>When previewing a match, ignore the graphics on TV broadcast lineups and instead ask: <em>"How many players do they commit ahead of the ball in possession, and how many stay back in rest defence?"</em> A team committing 6 players forward in a <code>2-2-6</code> produces vastly higher goal variance (both scored and conceded) than a cautious <code>3-2-5</code> or <code>4-4-2</code>.</p>

<h2>Key Takeaway</h2>
<p>A formation number is only a team''s starting coordinate. True tactical analysis tracks in-possession shape, out-of-possession block, and rest-defence structure — because those determine shot volume and transition risk.</p>'
WHERE slug = 'what-a-formation-number-means'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- [understanding-formations] the-4-3-3-control-and-width
UPDATE public.lessons
SET content = '<h2>Why the 4-3-3 Became Modern Football''s Reference Architecture</h2>
<p>The <code>4-3-3</code> balances the pitch geometrically better than almost any other starting shape: three forwards press the opponent''s back line and pin full-backs wide, three midfielders control the central triangles, and a flat back four covers the width of the penalty area.</p>

<h2>Attacking Mechanics: Half-Space Triangles</h2>
<p>In possession, a 4-3-3 naturally forms passing triangles on both flanks (Full-Back + #8 + Winger). By pinning the opponent''s full-back to the touchline, the winger opens the <strong>half-space channel</strong> for the #8 to receive between the lines — the single most dangerous pass in modern football because the receiver faces goal with options left, right, and centrally.</p>

<h2>Structural Vulnerabilities of the 4-3-3</h2>
<ul>
  <li><strong>Single-pivot isolation:</strong> If the two #8s push too high, the lone #6 has to cover 68 metres of horizontal width alone on turnovers. Teams playing a <code>4-2-3-1</code> or <code>3-4-2-1</code> target the space either side of the #6 with dual #10s.</li>
  <li><strong>Wide overloads on the counter:</strong> If both full-backs overlap simultaneously, a fast opposing winger can attack the space behind them 1v1 against a centre-back pulled wide.</li>
</ul>

<h2>Real-Data Scoring Pattern</h2>
<p>Elite 4-3-3 sides (Manchester City, Liverpool, Arsenal, Barcelona) typically rank top-3 in their leagues for <strong>field tilt</strong> (share of final-third touches, often &gt;65%) and <strong>corners won</strong> (6.5–7.8 per match). Against deep 5-4-1 low blocks, however, if their wide forwards lack 1v1 dribbling edge, their possession can turn into sterile U-shaped passing with low xG per shot.</p>

<h2>Key Takeaway</h2>
<p>The 4-3-3 excels at territorial control, pressing, and creating half-space triangles, but its structural weak point is the space on either side of the lone #6 during transitions.</p>'
WHERE slug = 'the-4-3-3-control-and-width'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- [understanding-formations] the-4-4-2-formation
UPDATE public.lessons
SET content = '<h2>Why the 4-4-2 Never Truly Died</h2>
<p>While fewer elite teams attack in a rigid <code>4-4-2</code>, it remains one of the most popular <strong>out-of-possession defensive shapes</strong> in world football — used defensively by Arsenal, Real Madrid, Atl&eacute;tico Madrid (Simeone), and dozens of mid-table Premier League and La Liga clubs.</p>

<h2>Defensive Geometry: Two Banks of Four</h2>
<p>Two compact horizontal lines of four players separated by 10–12 metres cover the entire 68-metre width of the pitch with minimal sprinting. Meanwhile, the two strikers screen passes into the opponent''s central pivot, forcing build-up out to the touchlines where the touchline acts as an extra defender.</p>
<ul>
  <li><strong>Strength:</strong> Exceptional horizontal compactness and immediate two-striker counter-attack threat when possession is won.</li>
  <li><strong>Weakness:</strong> Numerical inferiority in central midfield (2 vs 3) against a <code>4-3-3</code> or <code>4-2-3-1</code>, requiring huge physical work rate from the wide midfielders tucking inside.</li>
</ul>

<h2>Real-World Case Study: Atl&eacute;tico Madrid &amp; Leicester City 2015/16</h2>
<p>Leicester City''s historic 2015/16 Premier League title (81 points despite averaging just <strong>42.4% possession</strong> — the third lowest in the league) proved the potency of a disciplined 4-4-2 low/mid-block paired with elite vertical transitions (Jamie Vardy + Riyad Mahrez + N''Golo Kant&eacute;). In La Liga, Diego Simeone''s classic 4-4-2 routinely held opponents under <strong>0.80 xGA per match</strong>, driving La Liga''s notably lower scoring intercept (<code>exp(&mu;) = 1.03</code> vs Premier League''s <code>1.27</code> in PunterStat''s v2.0 model).</p>

<h2>Key Takeaway</h2>
<p>A well-drilled 4-4-2 trades possession for central compactness and direct two-striker counter-attacks. Against possession-heavy teams that struggle to break down narrow lines, disciplined 4-4-2 underdogs frequently outperform market expectations on the Asian Handicap and Under-goals markets.</p>'
WHERE slug = 'the-4-4-2-formation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- [understanding-formations] the-4-2-3-1-formation
UPDATE public.lessons
SET content = '<h2>The Double Pivot: Solving Central Vulnerability</h2>
<p>The <code>4-2-3-1</code> became Europe''s most widely used formation in the 2000s and 2010s (popularized by Mourinho''s Real Madrid/Chelsea, Heynckes''s Bayern Munich, and Deschamps''s 2018 World Cup-winning France) because its <strong>double pivot</strong> (two defensive/central midfielders) fixes the single-pivot exposure of a 4-3-3.</p>

<h2>How the 4-2-3-1 Balances Risk and Control</h2>
<ul>
  <li><strong>Two pivots protect the back four:</strong> When one pivot steps forward to press or carry the ball, the second stays home to screen the centre-backs — drastically cutting central counter-attack xG.</li>
  <li><strong>Dedicated #10 between the lines:</strong> Gives the team a specialist creator operating in Zone 14 (just outside the opponent''s penalty box), linking midfield to the lone striker.</li>
  <li><strong>Seamless defensive shift:</strong> Out of possession, the wide attackers drop alongside the double pivot to form a compact <code>4-4-1-1</code> or <code>4-4-2</code>.</li>
</ul>

<h2>Where the 4-2-3-1 Struggles</h2>
<p>If the opponent crowds central midfield with a high-pressing 4-3-3 and isolates the #10, the lone striker can become completely cut off from service. Additionally, if the #10 does not track back defensively, the two pivots can be overrun 2v3 by energetic opposition #8s.</p>

<h2>Key Takeaway</h2>
<p>The 4-2-3-1 is football''s premier balance formation — giving teams a strong defensive shield via the double pivot while retaining a dedicated central playmaker. Its performance hinges on whether the #10 finds pockets of space between the opposition''s midfield and defensive lines.</p>'
WHERE slug = 'the-4-2-3-1-formation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- [understanding-formations] back-three-systems
UPDATE public.lessons
SET content = '<h2>3-5-2 and 3-4-3: Width Through Wing-Backs, Security Through Three CBs</h2>
<p>Back-three systems (which defend as a back five when wing-backs drop) have surged across Serie A (Inter Milan, Atalanta), the Bundesliga (Bayer Leverkusen''s unbeaten 2023/24 title run), and the Premier League (Chelsea under Conte and Tuchel).</p>

<h2>Structural Comparison: 3-5-2 vs 3-4-3</h2>
<table>
  <thead>
    <tr><th>System</th><th>Midfield / Attack Split</th><th>Core Strength</th><th>Main Vulnerability</th></tr>
  </thead>
  <tbody>
    <tr><td>3-5-2 (e.g. Inter Milan)</td><td>3 CMs + 2 Strikers</td><td>Central midfield overload + two-striker box presence</td><td>Space behind wing-backs if opponent switches play rapidly</td></tr>
    <tr><td>3-4-3 / 3-4-2-1 (e.g. Leverkusen, Atalanta)</td><td>2 CMs + 2 Half-Space #10s + 1 #9</td><td>Box midfield (4v3) + natural pressing traps on wings</td><td>2-man central pivot can be stretched horizontally</td></tr>
  </tbody>
</table>

<h2>Why Back-Three Systems Disrupt Back-Four Opponents</h2>
<p>Against a standard <code>4-4-2</code> or <code>4-3-3</code>, a back three creates a natural <strong>3v2 build-up overload</strong> against two pressing forwards and pins the opponent''s full-backs with advancing wing-backs while two #10s occupy the half-spaces. In 2023/24, Xabi Alonso''s Bayer Leverkusen used a fluid 3-4-2-1 to go <strong>34 matches unbeaten</strong> in the Bundesliga (28W, 6D, 0L, +65 goal difference), overwhelming back-four defences with constant 5-lane attacking occupation.</p>

<h2>Key Takeaway</h2>
<p>Back-three systems offer natural defensive security against counter-attacks (five at the back out of possession) and wide overloads via wing-backs — but their effectiveness depends heavily on wing-back stamina and whether the outer centre-backs are comfortable defending wide 1v1s.</p>'
WHERE slug = 'back-three-systems'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-formations');

-- [pressing-systems-explained] what-pressing-means
UPDATE public.lessons
SET content = '<h2>Pressing Is Co-ordinated Space Denial, Not Mindless Running</h2>
<p>Pressing is the organised collective effort to win the ball back — or force an inaccurate long clearance — by restricting the ball-carrier''s time and passing lanes simultaneously. One player sprinting at a centre-back while teammates watch is <em>not</em> pressing; it is opening a passing lane.</p>

<h2>How Analysts Measure Pressing: PPDA</h2>
<p>The universal metric for pressing intensity is <strong>PPDA (Passes Allowed Per Defensive Action)</strong> in the opponent''s defensive 60% of the pitch. Lower PPDA = more aggressive press:</p>
<table>
  <thead>
    <tr><th>PPDA Range</th><th>Pressing Style</th><th>Typical Teams</th><th>Match Impact</th></tr>
  </thead>
  <tbody>
    <tr><td>6.5 – 9.0</td><td>Ultra-aggressive high press</td><td>Liverpool, Arsenal, Atalanta, Barcelona</td><td>High turnovers, high tempo, higher foul/card counts</td></tr>
    <tr><td>9.5 – 12.5</td><td>Selective mid-high press</td><td>Real Madrid, Inter Milan, Aston Villa</td><td>Controlled traps, balances energy over 90 mins</td></tr>
    <tr><td>13.0 – 18.0+</td><td>Passive mid/low block</td><td>Relegation fighters, deep counter sides</td><td>Concedes territory, protects box, slower tempo</td></tr>
  </tbody>
</table>

<h2>Pressing Triggers</h2>
<p>Coordinated teams do not press every pass; they wait for <strong>triggers</strong> — moments when the opponent''s passing options are naturally restricted: a backwards pass to the goalkeeper, a slow square pass to a full-back near the touchline, a heavy first touch, or a player receiving with their back to goal.</p>

<h2>Key Takeaway</h2>
<p>Measure pressing via PPDA and high turnovers rather than raw tackles. Effective pressing is triggered collectively on specific cues — and when two low-PPDA teams meet, expect elevated match tempo, turnovers, and shot volume.</p>'
WHERE slug = 'what-pressing-means'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- [pressing-systems-explained] high-press-explained
UPDATE public.lessons
SET content = '<h2>Winning the Ball Within 40 Metres of the Opponent''s Goal</h2>
<p>A high press pushes a team''s entire outfield block into the opponent''s half to disrupt build-up at the source. Why do elite managers accept the huge defensive risk of leaving 45 metres of open pitch behind their centre-backs? Because of <strong>shot-quality math</strong>:</p>
<ul>
  <li>A turnover won inside the opponent''s defensive third leads to a shot within 10 seconds roughly <strong>30–35% of the time</strong>.</li>
  <li>Even better, shots generated from high turnovers average <strong>~0.16–0.19 xG per shot</strong> — nearly double the ~0.09 xG average of organised open-play attacks against a set defence.</li>
</ul>

<h2>The Risk-Reward Trade-Off</h2>
<p>When a high press works, it smothers inferior build-up teams (producing lopsided 3–0 or 4–0 wins). When it gets bypassed by a press-resistant goalkeeper and midfield — or by direct balls to a fast striker — it produces instant <strong>high-xG breakaways</strong> the other way.</p>
<p><strong>Real-Data Pattern:</strong> High-press vs press-resistant-counter matchups (e.g. a high-line side facing a fast vertical counter team) consistently produce elevated <strong>Both Teams To Score (BTTS)</strong> and <strong>Over 2.5 Goals</strong> rates compared to league averages.</p>
<div data-block="stat" data-factor="btts_rate" data-league="D1"></div>

<h2>Key Takeaway</h2>
<p>The high press is the most efficient way to manufacture high-xG chances without needing Messi-level dribbling — but if the opponent can bypass the first wave cleanly, the space left behind creates massive counter-attack volatility.</p>'
WHERE slug = 'high-press-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- [pressing-systems-explained] gegenpressing-explained
UPDATE public.lessons
SET content = '<h2>The 5-Second Window of Maximum Disorganisation</h2>
<p>Popularized in Germany by Ralf Rangnick and Jürgen Klopp (<em>Gegenpressing</em> = counter-pressing), this tactic exploits a simple truth: <strong>the moment an opponent wins the ball is the exact moment they are most disorganised</strong>. Their players have just shifted from defensive positioning into attacking runs, leaving passing lanes exposed for 4 to 6 seconds.</p>
<blockquote>"No playmaker in the world can be as good as a good counter-pressing situation." — J&uuml;rgen Klopp</blockquote>

<h2>How Gegenpressing Works Geometrically</h2>
<ol>
  <li><strong>Compact attacking structure:</strong> You can only counter-press if 3–4 teammates are already within 10–15 metres of the ball when possession is lost.</li>
  <li><strong>Immediate swarm (0–5 seconds):</strong> The nearest player presses the ball-carrier while 2–3 teammates cut off the short outlet passes.</li>
  <li><strong>Bail-out rule:</strong> If the ball is not recovered within 5–6 seconds (or if the opponent completes two clean passes out of pressure), the team immediately drops into its compact mid-block rather than chasing blindly.</li>
</ol>

<h2>Why the Bundesliga Leads Europe in Goals</h2>
<p>The widespread adoption of gegenpressing across Germany is a primary reason the Bundesliga (<code>D1</code>) consistently averages <strong>~3.0–3.2 goals per match</strong> — the highest of Europe''s top five leagues — with high transition volume and a strong Dixon-Coles low-score correlation parameter (<code>&rho; = &minus;0.1479</code> in PunterStat''s v2.0 model).</p>

<h2>Key Takeaway</h2>
<p>Gegenpressing turns turnovers into instant attacking launches within 5 seconds. It demands elite fitness and tight attacking spacing — and when fatigue hits in the final 20 minutes, counter-pressing teams can suddenly open up if their recovery runs drop by half a second.</p>'
WHERE slug = 'gegenpressing-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- [pressing-systems-explained] defensive-blocks-explained
UPDATE public.lessons
SET content = '<h2>Mid-Block and Low Block: Controlling the Most Valuable Real Estate</h2>
<p>Sitting deep is often dismissed by fans as "parking the bus," yet statistically it is the most rational strategy available to an underdog or a team protecting a lead. Because <strong>over 75% of all goals are scored from inside the penalty area</strong>, a compact low block surrenders harmless possession 35 metres from goal in exchange for denying Zone 14 and the six-yard box.</p>

<h2>Comparing Defensive Block Heights</h2>
<table>
  <thead>
    <tr><th>Block Type</th><th>Engagement Line</th><th>Avg. xG/Shot Allowed</th><th>Typical Counter Threat</th></tr>
  </thead>
  <tbody>
    <tr><td>High Block</td><td>Opponent''s penalty box / 40m</td><td>Higher (~0.13–0.15) on fewer shots</td><td>Wins ball close to goal</td></tr>
    <tr><td>Mid-Block</td><td>Halfway line (45–60m)</td><td>Balanced (~0.10–0.11)</td><td>Strong medium-range transitions</td></tr>
    <tr><td>Low Block</td><td>Own defensive third (20–35m)</td><td>Lowest (~0.07–0.09) on more shots</td><td>Long-distance fast breaks (requires pace)</td></tr>
  </tbody>
</table>

<h2>How Low Blocks Break Down — and How They Survive</h2>
<ul>
  <li><strong>What kills a low block:</strong> Early goal conceded (forces the underdog to abandon the block and chase), elite set-piece delivery, and wide 1v1 dribblers who reach the byline for cutbacks.</li>
  <li><strong>Why low blocks frustrate favourites:</strong> If the match is still 0–0 at minute 60, the favourite''s shot quality often drops as frustration triggers low-percentage 0.03 xG long shots and hopeful crosses.</li>
</ul>

<h2>Key Takeaway</h2>
<p>A disciplined low block lowers opponent xG per shot dramatically. When an underdog with a compact low block faces a favourite that lacks set-piece dominance or byline dribblers, the match is far closer to a 0–0 or 1–0 grind than the headline talent gap suggests.</p>'
WHERE slug = 'defensive-blocks-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- [how-leagues-work] the-points-system
UPDATE public.lessons
SET content = '<h2>How Three Points for a Win Reshaped Risk-Taking</h2>
<p>Before England introduced <strong>3 points for a win</strong> in 1981 (adopted globally by FIFA in 1994/95), a win was worth 2 points and a draw 1. Under the old 2-1-0 system, two draws equalled one win — rewarding cautious away football. Under 3-1-0, a win is worth <strong>300% of a draw</strong>, making a 1-win + 1-loss split (3 points) strictly superior to two draws (2 points).</p>

<h2>The Expected-Points Math of Chasing a Late Winner</h2>
<p>Suppose a match is level at 1–1 in the 80th minute. If Team A stays conservative, the outcome probabilities are roughly 15% Win / 70% Draw / 15% Loss &rarr; <strong>1.15 expected points</strong>. If Team A pushes numbers forward, suppose probabilities shift to 30% Win / 40% Draw / 30% Loss &rarr; <strong>1.30 expected points</strong>! Under 3-1-0, symmetric risk-taking mathematically <em>increases</em> expected points.</p>

<h2>Tiebreakers: Goal Difference vs Head-to-Head</h2>
<table>
  <thead>
    <tr><th>Competition</th><th>Primary Tiebreaker</th><th>Tactical Implication</th></tr>
  </thead>
  <tbody>
    <tr><td>Premier League (<code>E0</code>), Bundesliga (<code>D1</code>), Ligue 1 (<code>F1</code>)</td><td>Goal Difference (GD)</td><td>Top clubs keep pushing for 4–0 / 5–0 wins to build GD cushion</td></tr>
    <tr><td>La Liga (<code>SP1</code>), Serie A (<code>I1</code>), UEFA Competitions</td><td>Head-to-Head (H2H)</td><td>Direct six-pointers between title/relegation rivals carry massive extra weight</td></tr>
  </tbody>
</table>
<p><strong>Real-World Example:</strong> Manchester City won the 2011/12 Premier League title over Manchester United strictly on Goal Difference (+64 vs +56) after both finished on 89 points. Conversely, in La Liga 2006/07, Real Madrid beat Barcelona to the title on Head-to-Head despite Barcelona having a +19 superior Goal Difference.</p>

<h2>Key Takeaway</h2>
<p>The 3-1-0 points system mathematically rewards late-game risk-taking, and knowing whether a league breaks ties by Goal Difference or Head-to-Head explains why teams either push for blowouts or lock down six-pointers.</p>'
WHERE slug = 'the-points-system'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- [how-leagues-work] promotion-and-relegation
UPDATE public.lessons
SET content = '<h2>The Highest-Stakes Incentive Structure in World Sport</h2>
<p>Unlike closed North American franchises (NBA, NFL), European and global football leagues operate open promotion and relegation pyramids. Dropping out of the Premier League into the Championship represents a revenue shock exceeding <strong>&pound;100 million+</strong> in broadcast distributions (even after parachute payments).</p>

<h2>Real Data: What Points Total Actually Guarantees Survival?</h2>
<p>The famous "40-point rule" in the 20-team Premier League is actually a conservative myth. Over the last 20 Premier League seasons (2005/06–2024/25):</p>
<ul>
  <li>The 18th-placed (relegated) team has averaged <strong>34.5 points</strong> — meaning <strong>36–38 points</strong> is typically enough to survive.</li>
  <li>Only once since 2003 (West Ham with 42 points in 2002/03) has a team with 40+ points been relegated.</li>
  <li>Newly promoted teams face a brutal structural jump: in both 2023/24 and 2024/25, all three promoted Premier League clubs went straight back down, highlighting the widening financial and squad-depth gap between tiers.</li>
</ul>

<h2>Late-Season Motivation ("Dead Rubbers" vs Desperation)</h2>
<p>In the final 6–8 matchdays (April–May), league tables split into three motivational zones: title/European contenders, relegation fighters, and <strong>"on the beach" mid-table clubs</strong> (11th–14th with nothing left to play for). Empirical analysis across Europe''s top five leagues shows that teams fighting relegation earn <strong>~0.25–0.35 more points per game</strong> against safe mid-table opponents than their full-season strength ratings predict — a real motivation effect, though bookmakers frequently <em>over-adjust</em> prices on desperate relegation sides in May.</p>

<h2>Key Takeaway</h2>
<p>Promotion and relegation create asymmetric late-season incentives. Always check what each club still has to play for in April and May — but compare that motivation against how much the betting market has already priced it in.</p>'
WHERE slug = 'promotion-and-relegation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- [how-leagues-work] european-qualification
UPDATE public.lessons
SET content = '<h2>The Three-Tier UEFA Club Pyramid</h2>
<p>Finishing in the top 6–8 of a major European domestic league unlocks UEFA club competitions — each with sharply different financial rewards and fixture-congestion profiles:</p>
<table>
  <thead>
    <tr><th>Competition</th><th>Typical Domestic Slots (Top-4 Leagues)</th><th>Revenue Impact</th><th>Travel &amp; Congestion Effect</th></tr>
  </thead>
  <tbody>
    <tr><td>UEFA Champions League (UCL)</td><td>Top 4 (plus 5th via UEFA coefficient)</td><td>&euro;50M–&euro;130M+</td><td>Tue/Wed fixtures; high intensity, manageable 4-day turnaround</td></tr>
    <tr><td>UEFA Europa League (UEL)</td><td>5th + Domestic Cup winner</td><td>&euro;15M–&euro;35M</td><td><strong>Thursday night trap</strong>: only ~64–72h before Sunday league match</td></tr>
    <tr><td>UEFA Conference League (UECL)</td><td>6th/7th (League Cup / playoff)</td><td>&euro;6M–&euro;18M</td><td>Long Eastern European travel; heavy rotation in group phase</td></tr>
  </tbody>
</table>

<h2>The "Thursday–Sunday" Europa League Hangover</h2>
<p>Data across the Premier League, La Liga, and Bundesliga shows that mid-sized clubs playing their first Europa League campaign (e.g. Brighton 2023/24, West Ham 2022/23, Union Berlin 2023/24) frequently drop <strong>8 to 15 domestic league points</strong> compared to the prior season. Playing away in Eastern Europe on Thursday night and kicking off domestically at 14:00 Sunday leaves minimal recovery time for squads without 20+ starting-calibre players.</p>

<h2>Key Takeaway</h2>
<p>European qualification is financially transformative, but for clubs without elite squad depth, Thursday-night Europa/Conference League football creates a measurable domestic performance drag in the following season.</p>'
WHERE slug = 'european-qualification'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- [cup-and-knockout-formats] single-leg-knockout-format
UPDATE public.lessons
SET content = '<h2>Why Single-Leg Knockouts Produce Massive Upsets</h2>
<p>Over a 38-game league season, the stronger team wins the title almost every time because variance averages out. In a single 90-minute knockout match (FA Cup, DFB-Pokal, AFCON knockouts, World Cup), variance dominates. Under a Poisson goal model, a team that is a full <strong>+1.0 expected goal stronger</strong> (e.g. <code>&lambda; = 1.85</code> vs <code>0.85</code>) still fails to win in 90 minutes roughly <strong>37% of the time</strong> (draw or loss)!</p>

<h2>Tactical Behaviour in One-Off Ties</h2>
<ul>
  <li><strong>Cautious first 60 minutes in finals:</strong> Because conceding first is devastating in a single-leg final, major finals (Champions League, World Cup, AFCON) average significantly fewer goals in regular time than group-stage games — 6 of the last 8 Champions League finals (2018–2025) finished with <strong>2 or fewer goals</strong> (<code>Under 2.5</code>).</li>
  <li><strong>Penalty shootout lottery:</strong> Once a match reaches extra time (120 minutes), fatigued legs reduce open-play shot quality further and ~45–50% of extra-time ties proceed to penalties, where the underdog''s win probability jumps close to 50/50 regardless of squad value.</li>
  <li><strong>Heavy rotation in early domestic cup rounds:</strong> Big clubs routinely make 7–9 starting XI changes in early FA Cup / EFL Cup / Copa del Rey ties, narrowing the true talent gap far below league-rating estimates.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Single-leg knockouts amplify variance and reward compact underdogs. Always verify starting lineups in early cup rounds and remember that major finals skew heavily toward lower scoring and draws after 90 minutes.</p>'
WHERE slug = 'single-leg-knockout-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- [cup-and-knockout-formats] two-leg-ties-format
UPDATE public.lessons
SET content = '<h2>Aggregate Strategy and the Abolition of Away Goals</h2>
<p>Two-legged knockout ties (UEFA Champions League R16–SF, Copa Libertadores, CAF Champions League) are 180-minute tactical chess matches. In 2021, UEFA abolished the 56-year-old <strong>Away Goals Rule</strong> — fundamentally changing how both legs are played:</p>
<ul>
  <li><strong>Before 2021 (Away Goals active):</strong> Home teams in the first leg were terrified of conceding even once (since a 1–1 home draw was a disaster), producing cagey, defensive first legs.</li>
  <li><strong>Since 2021 (Away Goals abolished):</strong> First-leg home sides attack more freely, while second-leg ties level on aggregate go straight to extra time — increasing the frequency of extra time in UEFA knockouts.</li>
</ul>

<h2>First Leg vs Second Leg Scoring Asymmetry</h2>
<p>Historical UEFA Champions League knockout data shows a persistent scoring gap between legs:</p>
<table>
  <thead>
    <tr><th>Knockout Leg</th><th>Avg. Goals / Match</th><th>Tactical Driver</th></tr>
  </thead>
  <tbody>
    <tr><td>First Leg</td><td>~2.45 – 2.60</td><td>Both managers avoid fatal early deficit; tie cannot be lost in 90 mins</td></tr>
    <tr><td>Second Leg</td><td>~2.95 – 3.15</td><td>Trailing side MUST abandon shape to chase aggregate deficit, opening huge transition space</td></tr>
  </tbody>
</table>
<p><strong>Crucial Second-Leg Insight:</strong> If Team A wins the first leg 2–0 away, they have zero incentive to win the second leg at home — a 0–1 home defeat still advances them 2–1 on aggregate! Evaluating 1X2 odds on a second leg without accounting for the aggregate scoreline is one of the most common mistakes in football analysis.</p>

<h2>Key Takeaway</h2>
<p>In two-legged ties, never analyse the second leg in isolation. Aggregate state dictates who must attack and who is happy to lose 0–1 and still advance — creating systematic scoring spikes in second legs.</p>'
WHERE slug = 'two-leg-ties-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- [cup-and-knockout-formats] champions-league-format
UPDATE public.lessons
SET content = '<h2>The Swiss-Model League Phase (2024/25 Onward)</h2>
<p>Starting in 2024/25, UEFA replaced the traditional 32-team, 4-team group stage with a <strong>36-team single League Phase</strong> (Swiss model). Each club plays 8 different opponents (4 home, 4 away — 2 from each of 4 seeding pots):</p>
<ul>
  <li><strong>Positions 1–8:</strong> Qualify automatically for the Round of 16 (and skip 2 high-intensity February playoff matches).</li>
  <li><strong>Positions 9–24:</strong> Enter a seeded two-legged Knockout Phase Play-off.</li>
  <li><strong>Positions 25–36:</strong> Eliminated completely (no drop-down to the Europa League anymore).</li>
</ul>

<h2>Why the New Format Changed Match Dynamics</h2>
<ol>
  <li><strong>Fewer dead rubbers on Matchdays 7 &amp; 8:</strong> Because Goal Difference across a 36-team table separates 8th from 9th (worth avoiding two extra playoff games) and 24th from 25th (worth survival), top clubs keep pushing for goals late in matches rather than resting after securing 10 points.</li>
  <li><strong>Higher early-round marquee clash rate:</strong> Pot 1 teams now play two other Pot 1 teams in the League Phase, producing elite tactical matchups from September onward.</li>
  <li><strong>Added fixture load:</strong> Clubs finishing 9th–24th play <strong>10 European matches before the Round of 16</strong> (up from 6), magnifying domestic fatigue in February and March.</li>
</ol>

<h2>Key Takeaway</h2>
<p>The 36-team Swiss-model Champions League increased Goal Difference urgency in the League Phase, eliminated the Europa League safety net, and added two extra knockout playoff matches for clubs ranked 9th–24th.</p>'
WHERE slug = 'champions-league-format'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- [home-advantage-unpacked] the-data-behind-home-advantage
UPDATE public.lessons
SET content = '<h2>Real Data: Home Advantage Across 39 Global Leagues</h2>
<p>Home advantage is one of the most durable empirical effects in sports science. Across PunterStat''s 221,382-match historical database, home teams win roughly <strong>44–46%</strong> of matches, draws occur <strong>25–27%</strong>, and away teams win <strong>28–30%</strong>. Yet home advantage is <em>not uniform</em> — our v2.0 Dixon-Coles MLE engine reveals dramatic league-by-league differences:</p>
<table>
  <thead>
    <tr><th>League</th><th>Code</th><th>Dixon-Coles <code>home_adv</code></th><th>Home Goal Multiplier</th><th>Why It Differs</th></tr>
  </thead>
  <tbody>
    <tr><td>Brasileir&atilde;o S&eacute;rie A</td><td><code>BRA</code></td><td>0.2999</td><td><strong>+35.0%</strong></td><td>Continental travel distances, heat/humidity, hostile crowds</td></tr>
    <tr><td>Bundesliga</td><td><code>D1</code></td><td>0.2698</td><td><strong>+31.0%</strong></td><td>95%+ stadium capacity, standing terraces, aggressive home pressing</td></tr>
    <tr><td>Liga Profesional (Argentina)</td><td><code>ARG</code></td><td>0.2665</td><td><strong>+30.5%</strong></td><td>Intense stadium atmosphere, physical duels, referee pressure</td></tr>
    <tr><td>La Liga</td><td><code>SP1</code></td><td>0.2652</td><td><strong>+30.4%</strong></td><td>Strong home territorial dominance outside top 3</td></tr>
    <tr><td>Premier League</td><td><code>E0</code></td><td>0.1896</td><td><strong>+20.9%</strong></td><td>Short domestic travel, elite away tactical preparation, VAR</td></tr>
    <tr><td>Serie A</td><td><code>I1</code></td><td>0.1693</td><td><strong>+18.4%</strong></td><td>Shared stadiums (San Siro, Olimpico), disciplined away tactics</td></tr>
    <tr><td>Ligue 1</td><td><code>F1</code></td><td>0.1415</td><td><strong>+15.2%</strong></td><td>Lower average attendance outside top clubs, PSG away dominance</td></tr>
  </tbody>
</table>
<div data-block="stat" data-factor="home_win_rate"></div>

<h2>The Long-Term Decline of Home Advantage</h2>
<p>In the 1990s, Premier League home win rates sat near 48–50%. Today they hover closer to <strong>43–45%</strong>. Better away-team travel logistics (charter flights, sports nutrition), standardized UEFA-grade pitches, video scouting, and VAR reducing crowd-driven referee bias have gradually trimmed home edge in Western Europe — while it remains huge in South America and Africa.</p>

<h2>Key Takeaway</h2>
<p>Never apply a single generic "home boost" across all leagues. Home advantage adds ~35% to expected home scoring in Brazil and ~31% in Germany, but only ~15% in Ligue 1 and ~21% in the Premier League.</p>'
WHERE slug = 'the-data-behind-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');

-- [home-advantage-unpacked] crowd-effect-home-advantage
UPDATE public.lessons
SET content = '<h2>The COVID-19 Natural Experiment: Proving the Crowd Effect</h2>
<p>For decades, analysts debated how much of home advantage came from the crowd versus pitch familiarity and travel. In 2020/21, the pandemic forced over <strong>1,500 top-flight European matches</strong> to be played in empty stadiums — creating the cleanest natural experiment in sports analytics history.</p>
<table>
  <thead>
    <tr><th>Metric (Big Five European Leagues)</th><th>Pre-COVID (With Fans)</th><th>2020/21 (Empty Stadiums)</th><th>Change</th></tr>
  </thead>
  <tbody>
    <tr><td>Home Win Rate</td><td>~45.8%</td><td>~40.6%</td><td><strong>&minus;5.2 percentage points</strong></td></tr>
    <tr><td>Away Win Rate</td><td>~28.4%</td><td>~33.1%</td><td><strong>+4.7 percentage points</strong></td></tr>
    <tr><td>Yellow Cards (Away minus Home)</td><td>+0.42 more for away</td><td>+0.11 more for away</td><td><strong>&minus;74% referee home bias</strong></td></tr>
  </tbody>
</table>

<h2>How Crowds Actually Shift Outcomes: Referee Bias</h2>
<p>Peer-reviewed studies (including Dohmen &amp; Sauermann and Bryson et al. 2021) proved that the single largest channel of the crowd effect is <strong>subconscious social pressure on the referee</strong>. With fans present, away teams receive roughly <strong>0.35–0.45 more yellow cards per match</strong>, concede more marginal fouls near the box, and face longer stoppage time when leading by 1 goal. When crowds vanished, away disciplinary bias nearly evaporated overnight.</p>
<p>Here is the live home win rate across every match in PunterStat''s historical dataset:</p>
<div data-block="stat" data-factor="home_win_rate"></div>

<h2>Key Takeaway</h2>
<p>Crowd noise is not a clich&eacute; — empty-stadium data proved fans account for roughly half of football''s home advantage, largely by influencing marginal referee decisions on fouls, cards, and stoppage time.</p>'
WHERE slug = 'crowd-effect-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');

-- [home-advantage-unpacked] travel-fatigue-home-advantage
UPDATE public.lessons
SET content = '<h2>Distance, Time Zones, Altitude, and Climate</h2>
<p>While domestic travel in England or the Netherlands rarely exceeds a 3-hour coach ride or 45-minute flight, travel becomes a massive performance variable in continental competitions (UEFA Europa/Conference League, CAF Champions League, Copa Libertadores) and geographically vast leagues (Brazil, MLS, Russia).</p>
<ul>
  <li><strong>Cross-continental flights &amp; time zones:</strong> Crossing 2+ time zones disrupts circadian rhythms and sleep quality for 24–48 hours, measurably reducing high-speed sprint output in the second half.</li>
  <li><strong>Altitude shock:</strong> Playing above 2,200m (e.g. Mexico City, Bogot&aacute;, Quito, La Paz at 3,640m) reduces oxygen availability by 20–35% for visiting squads who have not acclimatised, leading to severe late-game fade after minute 60.</li>
  <li><strong>Heat &amp; humidity:</strong> Afternoon kick-offs above 30&deg;C with high humidity (common in West/North African fixtures, summer tournaments, and Southern Europe) cut total team sprint distance by 10–15% and shift matches toward slower tempo and set-piece goals.</li>
</ul>

<h2>Rest-Day Asymmetry</h2>
<p>When Team A has <strong>6–7 days of rest</strong> and Team B played away in Europe <strong>3 days earlier</strong> (Thursday &rarr; Sunday), empirical studies across Europe''s top five leagues measure a net performance swing of roughly <strong>0.15 to 0.22 expected goals</strong> in favour of the rested side — especially visible in pressing intensity (PPDA rises by 1.5–2.5 points for the fatigued squad).</p>

<h2>Key Takeaway</h2>
<p>Always check travel distance, rest-day asymmetry (3 days vs 7 days), altitude, and kick-off heat — these environmental factors silently erode pressing intensity and late-game defensive concentration.</p>'
WHERE slug = 'travel-fatigue-home-advantage'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'home-advantage-unpacked');

-- [squad-rotation-and-fatigue] why-managers-rotate
UPDATE public.lessons
SET content = '<h2>The Physiology of 72-Hour Turnarounds</h2>
<p>Sports science tracking (GPS and blood-biomarker studies across UEFA clubs) shows that after a full 90-minute elite match, muscle glycogen depletion, micro-tears, and neuromuscular fatigue require <strong>72 to 96 hours</strong> for full recovery. When a club plays Wednesday night and Saturday lunchtime (a 62-hour turnaround), players step onto the pitch at only ~85–90% neuromuscular readiness — and hamstring injury risk triples.</p>

<h2>Rotation Patterns Across Competitions</h2>
<table>
  <thead>
    <tr><th>Fixture Scenario</th><th>Typical Starting XI Changes</th><th>Expected Strength Drop</th></tr>
  </thead>
  <tbody>
    <tr><td>Normal 7-day league week</td><td>0 – 2 changes</td><td>Baseline (0.00 xG)</td></tr>
    <tr><td>League match sandwiched between UCL knockout legs</td><td>3 – 5 changes</td><td>&minus;0.15 to &minus;0.30 xG</td></tr>
    <tr><td>Early Domestic Cup / Dead-rubber European Group Game</td><td>6 – 9 changes</td><td>&minus;0.40 to &minus;0.75 xG</td></tr>
  </tbody>
</table>

<h2>Why Blindly Betting Pre-Lineup Is Dangerous</h2>
<p>If a top club plays a Champions League quarter-final second leg on Tuesday, the manager will almost certainly rest 3–4 key starters on the preceding Saturday. Season-long power ratings assume the club''s <em>best XI</em> — so evaluating a heavily rotated lineup using full-season stats overestimates the favourite dramatically.</p>

<h2>Key Takeaway</h2>
<p>Rotation is dictated by the 72-hour recovery clock and upcoming fixture priority. Always check the next 5 days on a club''s calendar — not just the last 5 — to anticipate when key starters will be rested.</p>'
WHERE slug = 'why-managers-rotate'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');

-- [squad-rotation-and-fatigue] reading-the-starting-lineup
UPDATE public.lessons
SET content = '<h2>The 60-Minute Pre-Kickoff Information Window</h2>
<p>Official starting XIs are released <strong>60 to 75 minutes before kick-off</strong>. Markets react within seconds to headline striker injuries, yet often under-react to <em>structural</em> lineup clues hidden in the teamsheet:</p>
<ol>
  <li><strong>Defensive vs attacking full-back selection:</strong> Starting a centre-back at full-back (e.g. Nathan Ak&eacute; or Ben White) instead of an overlapping wing-back signals a cautious, lower-scoring game plan.</li>
  <li><strong>Double pivot vs dual #8s:</strong> Dropping an attacking midfielder to insert a second destroyer (#6) typically cuts expected match goals by ~0.15–0.25.</li>
  <li><strong>Target man vs false nine:</strong> Starting a physical #9 shifts attack patterns toward early crosses and corners; starting a false nine or pacey winger up front signals counter-attacking runs in behind.</li>
  <li><strong>Bench strength:</strong> Under the 5-substitution rule, a bench stacked with 3–4 regular starters means the team will surge strongly after minute 60 even if the starting XI looks conservative.</li>
</ol>

<h2>Why Market Closing Line Value (CLV) Reacts to Lineups</h2>
<p>Sharp betting markets (like Pinnacle''s closing line in PunterStat''s 157,752-row odds dataset) absorb lineup news rapidly. If you track whether your pre-match read aligns with lineup reality, waiting for confirmed XIs on cup ties and congested midweek fixtures prevents walking into 7-change rotation traps.</p>

<h2>Key Takeaway</h2>
<p>Read the starting XI for tactical intent — not just star names. Full-back profiles, midfield pivot count, and bench quality reveal how the manager plans to manage risk before a ball is kicked.</p>'
WHERE slug = 'reading-the-starting-lineup'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');

-- [squad-rotation-and-fatigue] fatigue-and-second-half-performance
UPDATE public.lessons
SET content = '<h2>Why More Goals Are Scored in the Second Half</h2>
<p>Across Europe''s top five leagues, roughly <strong>44–45% of goals</strong> occur in the first half and <strong>55–56% of goals</strong> occur in the second half — with the final 15 minutes + stoppage time (76''–90+'') alone accounting for roughly <strong>22–24% of all goals scored</strong>.</p>
<table>
  <thead>
    <tr><th>Match Window</th><th>Approx. Share of Total Goals</th><th>Primary Cause</th></tr>
  </thead>
  <tbody>
    <tr><td>1'' – 15''</td><td>~13.5%</td><td>Fresh legs, cautious opening shapes, high concentration</td></tr>
    <tr><td>16'' – 30''</td><td>~14.5%</td><td>Tactical patterns settle; first set-piece pressure</td></tr>
    <tr><td>31'' – 45''+</td><td>~16.5%</td><td>First-half stoppage time + mental lapses before half-time</td></tr>
    <tr><td>46'' – 60''</td><td>~16.0%</td><td>Half-time tactical adjustments take effect</td></tr>
    <tr><td>61'' – 75''</td><td>~17.0%</td><td>First wave of substitutions + drop in pressing compactness</td></tr>
    <tr><td>76'' – 90''+</td><td><strong>~22.5%</strong></td><td>Fatigue, game-state desperation, 8–11 mins stoppage time</td></tr>
  </tbody>
</table>

<h2>How Fatigue Breaks Defensive Shapes First</h2>
<p>When players fatigue after minute 65, defensive compactness suffers <em>before</em> attacking creativity does. A tired midfielder arriving 0.4 seconds late to close down Zone 14 or a tired full-back failing to step up for an offside trap yields far higher xG per shot than in minute 10. Teams with deep benches and strong aerobic conditioning (e.g. Liverpool, Bayer Leverkusen 2023/24, Real Madrid) systematically outscore opponents in the final 20 minutes.</p>

<h2>Key Takeaway</h2>
<p>Over 55% of football goals arrive after half-time, and nearly a quarter arrive after minute 75. Fatigue breaks defensive compactness first — making squad depth, 5-sub quality, and late-game conditioning decisive variables.</p>'
WHERE slug = 'fatigue-and-second-half-performance'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');
