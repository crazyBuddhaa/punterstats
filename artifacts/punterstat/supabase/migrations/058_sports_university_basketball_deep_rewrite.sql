-- ============================================================
-- PunterStat — Migration 058: Sports University Basketball Deep Rewrite (22 lessons)
-- Rewrites & expands 22 lessons with real-data benchmarks,
-- worked examples, HTML tables, and Key Takeaways.
-- ============================================================

-- [introduction-to-basketball] basketball-object-of-the-game
UPDATE public.lessons
SET content = '<h2>Possession Math: Why Basketball Is the Ultimate Sample-Size Sport</h2>
<p>Unlike football (~2.7 goals/match), a modern NBA game features <strong>97 to 101 possessions per team</strong> (and ~70–75 possessions in 40-minute FIBA/EuroLeague games), producing ~220–230 total points in the NBA. Because each team gets ~100 scoring opportunities per night, random luck averages out much faster inside a single game — which is why stronger basketball teams win far more consistently than stronger football teams.</p>

<h2>The Core Identity: Points = Possessions &times; Efficiency</h2>
<p>Every modern basketball model begins with two numbers:</p>
<ul>
  <li><strong>Pace:</strong> Possessions per 48 minutes (NBA average ~99; fast teams ~103+, slow teams ~95).</li>
  <li><strong>Offensive &amp; Defensive Rating (ORtg / DRtg):</strong> Points scored or allowed per 100 possessions (NBA average ~114–115; elite attacks ~120+, elite defences ~107–110).</li>
</ul>
<p><strong>Worked Example:</strong> Team A averages 118 points/game at a blazing pace of 104 (ORtg = <strong>113.5</strong>). Team B averages 111 points/game at a slow pace of 94 (ORtg = <strong>118.1</strong>). Raw points-per-game makes Team A look stronger, but per-possession math proves Team B''s offence is <strong>+4.6 points/100 possessions superior</strong> — a massive edge once both teams share the same number of possessions in a head-to-head game.</p>

<h2>Key Takeaway</h2>
<p>Never judge basketball teams by raw Points Per Game. Always normalize by <strong>Pace</strong> into Offensive Rating and Defensive Rating (points per 100 possessions) — because both teams get virtually the same number of possessions in any given game.</p>'
WHERE slug = 'basketball-object-of-the-game'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-basketball');

-- [introduction-to-basketball] basketball-court-zones-rules
UPDATE public.lessons
SET content = '<h2>The Shot-Value Revolution: Expected Points Per Shot by Zone</h2>
<p>Basketball''s 3-point arc (7.24m / 23.75 ft in the NBA; 6.75m in FIBA/EuroLeague) created a mathematical revolution known as <strong>Moreyball</strong>. Compare the expected points per shot across modern NBA zones:</p>
<table>
  <thead>
    <tr><th>Court Zone</th><th>NBA Avg. FG%</th><th>Point Value</th><th>Expected Points / Shot</th></tr>
  </thead>
  <tbody>
    <tr><td>Restricted Area (0–4 ft rim)</td><td>~65% – 67%</td><td>2 pts</td><td><strong>~1.32 pts/shot</strong></td></tr>
    <tr><td>Corner Three</td><td>~38% – 40%</td><td>3 pts</td><td><strong>~1.17 pts/shot</strong></td></tr>
    <tr><td>Above-the-Break Three</td><td>~35% – 36%</td><td>3 pts</td><td><strong>~1.07 pts/shot</strong></td></tr>
    <tr><td>Long Mid-Range (14–22 ft)</td><td>~41% – 43%</td><td>2 pts</td><td><strong>~0.84 pts/shot</strong></td></tr>
  </tbody>
</table>
<p>A 36% three-point shooter generates <strong>1.08 points per shot</strong> — equivalent to shooting <strong>54% on 2-pointers</strong>! That is why NBA three-point attempts jumped from ~18 per team/game in 2010 to <strong>35–42+ per team/game</strong> today, while long mid-range shots collapsed.</p>

<h2>Shot Clock, Bonus Fouls, and End-of-Game Dynamics</h2>
<ul>
  <li><strong>24-second shot clock (14-second offensive rebound reset):</strong> Forces constant pace and penalizes stagnant isolation offences.</li>
  <li><strong>Team Foul Bonus:</strong> After 4 team fouls in a quarter (5th foul onward), every non-shooting foul awards 2 free throws (~1.56 expected points at 78% FT%) — turning aggressive defending into an automatic scoring leak.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Modern basketball is a geometry optimization problem: teams that maximize rim attempts (~1.32 pts/shot) and corner threes (~1.17 pts/shot) while forcing opponents into mid-range jumpers (~0.84 pts/shot) build a structural scoring edge every quarter.</p>'
WHERE slug = 'basketball-court-zones-rules'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-basketball');

-- [introduction-to-basketball] basketball-turnovers
UPDATE public.lessons
SET content = '<h2>Why a Turnover Costs Far More Than a Missed Shot</h2>
<p>A missed shot still gives your team ~25–28% chance of an offensive rebound and lets your defence get set in the half-court (where opponents average ~0.96 points per possession). A <strong>live-ball turnover</strong> (steal or bad pass) gives you zero chance to score <em>and</em> hands the opponent a transition fast break averaging <strong>~1.25–1.35 points per possession</strong>!</p>

<h2>Quantifying the Turnover Swing</h2>
<ul>
  <li><strong>Live-ball turnover net cost:</strong> ~1.35 to 1.50 points of expected margin lost per turnover.</li>
  <li><strong>Dead-ball turnover (travel, 3-second violation, out of bounds):</strong> ~1.05 points lost (defence can at least set up).</li>
  <li><strong>Real-Data Benchmark:</strong> NBA Turnover Rate (TOV%) averages ~13.0–13.5% of possessions. A team that commits 16 turnovers vs an opponent''s 10 surrenders roughly <strong>6 extra scoring possessions (~7–8 points)</strong> before shooting percentages even enter the conversation.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Turnover differential is one of Dean Oliver''s Four Factors of basketball success. Separate live-ball steals (which ignite ~1.30 PPP fast breaks) from dead-ball turnovers when diagnosing why a team gets blown out despite shooting well.</p>'
WHERE slug = 'basketball-turnovers'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'introduction-to-basketball');

-- [basketball-positions-and-roles] basketball-five-positions
UPDATE public.lessons
SET content = '<h2>From Rigid 1–5 Labels to Functional Lineup Roles</h2>
<p>Traditionally, basketball assigned five roles: <strong>Point Guard (1)</strong>, <strong>Shooting Guard (2)</strong>, <strong>Small Forward (3)</strong>, <strong>Power Forward (4)</strong>, and <strong>Center (5)</strong>. While useful as shorthand, modern analytics groups players by <em>functional skillsets</em>: Primary Initiator, Movement Shooter, 3-and-D Wing, Stretch Big, and Rim-Running Anchor.</p>
<p>For example, Nikola Joki&cacute; is listed as a Center (5) yet leads his team in assists and initiates half-court offence like a Point Guard, while Luka Don&ccaron;i&cacute; is 6''7" (wing size) yet carries a 35%+ usage rate as a primary ball-handler.</p>

<h2>Lineup Balance &amp; Spacing</h2>
<p>A winning five-man lineup needs at least <strong>four credible shooters</strong> (or three elite shooters + a dominant roller) to keep help defenders out of the paint, plus at least one rim protector and one point-of-attack perimeter defender. Playing two non-shooters simultaneously shrinks driving lanes and drops team half-court Offensive Rating by <strong>5–8 points per 100 possessions</strong>.</p>

<h2>Key Takeaway</h2>
<p>Evaluate rosters by functional skills (ball-handling, shooting gravity, rim protection, switchability) rather than traditional 1–5 labels — lineup spacing synergy determines whether talent translates into efficient points.</p>'
WHERE slug = 'basketball-five-positions'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

-- [basketball-positions-and-roles] basketball-guard-positions
UPDATE public.lessons
SET content = '<h2>Point Guard vs Shooting Guard: Creation vs Gravity</h2>
<p>In traditional basketball, the Point Guard (PG) passed and the Shooting Guard (SG) scored. In modern basketball, both guard spots often share ball-handling, but their analytical impact diverges into <strong>on-ball creation</strong> versus <strong>off-ball shooting gravity</strong>:</p>
<ul>
  <li><strong>Lead Initiator / Point Guard:</strong> Controls pick-and-roll reads, paint touches, and Assist-to-Turnover ratio (e.g. Tyrese Haliburton, Shai Gilgeous-Alexander, Chris Paul). Elite PGs maintain a 3.0+ AST/TOV ratio while collapsing defences.</li>
  <li><strong>Off-Ball / Combo Shooting Guard:</strong> Warps defensive geometry by sprinting off pindown screens and shooting 38%+ on high-volume threes (e.g. Stephen Curry off-ball, Devin Booker, Anthony Edwards, Klay Thompson).</li>
</ul>

<h2>The Defensive Size Tax of Dual Small Guards</h2>
<p>Starting two guards under 6''3" creates high regular-season offensive firepower, but in playoff series opponents relentlessly hunt the smaller guard via pick-and-roll switches ("mismatch hunting"), often causing defensive rating to crater by +6 to +10 points/100 possessions in crunch time.</p>

<h2>Key Takeaway</h2>
<p>Assess backcourts on two-way balance: elite on-ball creation paired with off-ball shooting gravity drives offence, while guard size and screen navigation determine whether that backcourt survives playoff mismatch hunting.</p>'
WHERE slug = 'basketball-guard-positions'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

-- [basketball-positions-and-roles] basketball-forward-positions
UPDATE public.lessons
SET content = '<h2>Why 6''6"–6''9" Two-Way Wings Rule Modern Basketball</h2>
<p>Small Forwards (3) and Power Forwards (4) have merged into the most valuable archetype in basketball: the <strong>two-way wing</strong> (e.g. Jayson Tatum, Kawhi Leonard, OG Anunoby, Jaylen Brown, Kevin Durant). Wings bridge the physical gap between guards and centers — tall enough to contest bigs and rebound, quick enough to stay in front of perimeter creators.</p>

<h2>The 3-and-D Wing Multiplier</h2>
<p>A "3-and-D" forward who shoots 38%+ on catch-and-shoot threes while guarding the opponent''s best scorer rarely posts flashy 25 PPG box scores, yet consistently ranks top-20 in <strong>Adjusted Plus-Minus (EPM / RAPM)</strong>. Their value scales seamlessly alongside superstars because they require minimal ball usage (~14–16% USG) while elevating both spacing and switchable defence.</p>

<h2>Key Takeaway</h2>
<p>Championship rosters are built around versatile 6''6"–6''9" wings who can shoot threes and guard 3–4 positions. Losing a premier 3-and-D wing to injury quietly hurts both perimeter defence and floor spacing simultaneously.</p>'
WHERE slug = 'basketball-forward-positions'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

-- [basketball-positions-and-roles] basketball-center-position
UPDATE public.lessons
SET content = '<h2>Rim Protection, Rebounding, and the Stretch-Five Evolution</h2>
<p>The Center (5) remains the single highest-leverage <strong>defensive</strong> position in basketball because the rim is the highest-efficiency shot on the court (~66% FG, 1.32 pts/shot). An elite rim protector (e.g. Victor Wembanyama, Rudy Gobert, Anthony Davis) lowers opponent field-goal percentage at the rim by <strong>8 to 14 percentage points</strong> — worth roughly &minus;4 to &minus;6 points per 100 possessions on defence alone.</p>

<h2>Two Modern Center Archetypes</h2>
<table>
  <thead>
    <tr><th>Center Archetype</th><th>Offensive Role</th><th>Defensive Role</th><th>Examples</th></tr>
  </thead>
  <tbody>
    <tr><td>Rim-Running Drop Anchor</td><td>Vertical lob threat, hard screens, offensive glass</td><td>Drop coverage, elite rim deterrence</td><td>Rudy Gobert, Jarrett Allen, Dereck Lively</td></tr>
    <tr><td>Stretch / Playmaking Five</td><td>5-out spacing (35%+ 3PT) or elbow hub passing</td><td>Switch/hedge versatility or positional IQ</td><td>Nikola Joki&cacute;, Kristaps Porzi&ncaron;&gcedil;is, Joel Embiid</td></tr>
  </tbody>
</table>
<p><strong>Tactical Trade-Off ("Played Off the Floor"):</strong> Traditional non-shooting drop centers dominate regular-season paint defence, but against 5-out shooting lineups (like the 2024 champion Boston Celtics), pulling the center 25 feet from the rim neutralizes their rim protection.</p>

<h2>Key Takeaway</h2>
<p>Centers anchor team defence more than any other position. Watch the matchup between a team''s drop-coverage center and an opponent''s 5-out shooting — that single tactical clash often decides playoff series and game totals.</p>'
WHERE slug = 'basketball-center-position'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

-- [basketball-positions-and-roles] positionless-basketball
UPDATE public.lessons
SET content = '<h2>Five-Out Spacing and Switch-Everything Lineups</h2>
<p>Positionless basketball (pioneered by the Golden State Warriors'' "Death Lineup" and perfected by the 2023/24 Boston Celtics, who posted a historic <strong>+11.3 Net Rating</strong>) replaces rigid roles with five players who can all dribble, pass, shoot threes, and switch defensively across multiple positions.</p>

<h2>Why Positionless Lineups Break Traditional Defences</h2>
<ul>
  <li><strong>Zero hiding spots on defence:</strong> If all five offensive players shoot 36%+ from three, the defence cannot "help off" a weak shooter to crowd the paint.</li>
  <li><strong>Switch-everything neutralizes screens:</strong> Defensively, switching 1 through 5 eliminates open pull-up threes and rolling layups from pick-and-rolls, forcing opponents into low-efficiency late-clock isolations.</li>
  <li><strong>Vulnerability:</strong> Small-ball positionless lineups can get punished on the <strong>offensive glass</strong> by physical twin-tower frontcourts (giving up 32%+ offensive rebound rates).</li>
</ul>

<h2>Key Takeaway</h2>
<p>Positionless basketball maximizes offensive spacing and defensive switchability, trading size for skill and speed. Check offensive rebounding rates when a small-ball team faces a dominant physical frontcourt.</p>'
WHERE slug = 'positionless-basketball'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

-- [basketball-offensive-systems] basketball-pick-and-roll
UPDATE public.lessons
SET content = '<h2>Basketball''s Most Frequent Action (~20–30% of Half-Court Plays)</h2>
<p>The Pick-and-Roll (PnR) forces two defenders to solve an impossible geometry puzzle in 1.5 seconds. Depending on how the defence reacts, the ball-handler has three high-value reads:</p>
<ol>
  <li><strong>Defence goes UNDER the screen:</strong> Pull-up three-pointer (deadly against guards shooting 37%+ off the dribble).</li>
  <li><strong>Big plays DROP coverage:</strong> Floaters, mid-range pull-ups, or snake-dribbling to draw a foul.</li>
  <li><strong>Defence BLITZES / HEDGES hard:</strong> Pocket pass to the rolling big in a <strong>4-on-3 short-roll advantage</strong> (the signature Draymond Green / Bam Adebayo / Nikola Joki&cacute; read), leading to a lob or corner three.</li>
</ol>

<h2>Real Data: PnR Efficiency Benchmarks</h2>
<p>League-average NBA PnR ball-handler efficiency sits around <strong>0.88–0.92 points per possession (PPP)</strong>, while elite PnR roll-men average <strong>1.15–1.25 PPP</strong>. When a team pairs an elite pull-up shooter with a high-IQ short-roll passer, their PnR offence becomes virtually unguardable without surrendering corner threes.</p>

<h2>Key Takeaway</h2>
<p>Read every basketball matchup through PnR coverage: how the opponent guards the ball-screen (Drop, Switch, Blitz, or Ice) directly determines whether the ball-handler, the rolling big, or the corner shooters will explode in the box score.</p>'
WHERE slug = 'basketball-pick-and-roll'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

-- [basketball-offensive-systems] basketball-motion-offense
UPDATE public.lessons
SET content = '<h2>Constant Cutting, Screens, and 300+ Passes Per Game</h2>
<p>Motion offences (exemplified by the 2014 San Antonio Spurs, Steve Kerr''s Golden State Warriors, and top EuroLeague clubs like Real Madrid and Olympiacos) replace one-player ball dominance with continuous off-ball cuts, dribble handoffs (DHOs), and pin-down screens.</p>

<h2>Why Motion Offences Outperform Raw Star Power</h2>
<ul>
  <li><strong>Exhausts defenders mentally and physically:</strong> Defending 4 off-ball screens in 14 seconds causes communication breakdowns ("two players go to the shooter, leaving the cutter wide open at the rim").</li>
  <li><strong>Higher Assisted Field Goal % (AST%):</strong> Elite motion teams assist on <strong>65–72%</strong> of their made baskets (vs ~54–58% for isolation-heavy teams), generating much higher catch-and-shoot three-point accuracy (~39% vs ~33% off the dribble).</li>
  <li><strong>Trade-off:</strong> High pass volume raises turnover risk (motion teams often rank bottom-10 in TOV%) and can stall against switch-everything playoff defences that blow up passing lanes.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Motion offences turn ball movement into high-percentage catch-and-shoot threes and backdoor layups, but watch their turnover rate when facing aggressive, lengthy switching defences.</p>'
WHERE slug = 'basketball-motion-offense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

-- [basketball-offensive-systems] basketball-isolation-post
UPDATE public.lessons
SET content = '<h2>Why Isolation and Post-Ups Still Matter in Playoff Crunch Time</h2>
<p>On paper, isolation (ISO) and post-up plays look inefficient: NBA league-average isolation yields ~0.90 PPP and post-ups ~0.93 PPP — well below transition (~1.15 PPP) or spot-up threes (~1.05 PPP). So why do champions still rely on elite ISO/post creators (Shai Gilgeous-Alexander, Luka Don&ccaron;i&cacute;, Nikola Joki&cacute;, Jayson Tatum) in the final 5 minutes?</p>
<ul>
  <li><strong>Turnover immunity:</strong> ISOs generate dramatically fewer turnovers (~6–7% TOV%) than complex motion sets (~15%+ TOV%).</li>
  <li><strong>Switch-beater:</strong> When a playoff defence switches every screen cleanly, motion and PnR stall — only a player who can beat a mismatch 1v1 or command a double-team in the post forces defensive rotation.</li>
  <li><strong>Double-team gravity:</strong> A post hub like Nikola Joki&cacute; or Joel Embiid scores ~1.10+ PPP directly AND generates ~1.25+ PPP on pass-outs whenever opponents send a second defender.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Regular-season offences thrive on pace and motion, but playoff half-court games are decided by low-turnover isolation and post-up creators who can crack switch-everything defences.</p>'
WHERE slug = 'basketball-isolation-post'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

-- [basketball-offensive-systems] basketball-transition-offense
UPDATE public.lessons
SET content = '<h2>The Highest-Efficiency Play Type in Basketball</h2>
<p>In the NBA, half-court offence averages roughly <strong>0.96–0.99 points per possession (PPP)</strong>, whereas transition / fast-break offence averages <strong>1.13–1.18 PPP</strong> — and jumps to <strong>1.28+ PPP</strong> specifically off live-ball steals! Pushing the ball before the opponent''s rim protector gets set produces layups, dunks, and wide-open trailer threes.</p>

<h2>Early Offence vs Pure Fast Breaks</h2>
<ul>
  <li><strong>Live-ball turnover break (1.28+ PPP):</strong> Numbers advantage (3-on-2, 2-on-1); almost always ends at the rim or free-throw line.</li>
  <li><strong>Secondary break / "Early Offence" (first 7 seconds):</strong> Even after a defensive rebound or made basket, fast-paced teams (e.g. Indiana Pacers, Oklahoma City Thunder) run drag screens and hit-ahead passes before the defence matches up — creating mismatches and boosting game totals by 8–12 points.</li>
  <li><strong>Transition defence trade-off:</strong> Teams that crash 3 players onto the offensive glass sacrifice transition defence; disciplined teams send 2 guards back on every shot to limit opponent transition frequency below 13% of possessions.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Transition possessions are worth ~+0.20 PPP more than half-court possessions. Track opponent transition frequency and live-ball turnover rates when projecting pace and Over/Under game totals.</p>'
WHERE slug = 'basketball-transition-offense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

-- [basketball-defensive-schemes] basketball-man-vs-zone
UPDATE public.lessons
SET content = '<h2>Accountability vs Spatial Protection</h2>
<p>Every basketball defensive scheme sits on a spectrum between <strong>Man-to-Man</strong> (each defender guards a specific player) and <strong>Zone</strong> (each defender guards an area of the floor). In the NBA, teams play man-to-man roughly <strong>92–95%</strong> of possessions, while in FIBA/EuroLeague and NCAA college basketball, zone usage is far higher (20–35%).</p>
<table>
  <thead>
    <tr><th>Scheme</th><th>Primary Strength</th><th>Primary Weakness</th><th>Best Used Against</th></tr>
  </thead>
  <tbody>
    <tr><td>Man-to-Man</td><td>Tighter closeouts on 3PT shooters, clear rebounding box-outs</td><td>Vulnerable to elite 1v1 creators &amp; repeated screening</td><td>High-volume 3PT shooting teams</td></tr>
    <tr><td>Zone Defense</td><td>Protects paint, hides slow defenders, conserves fouls</td><td>Open gaps in corners/high post; weaker defensive rebounding</td><td>Poor 3PT shooting teams or teams reliant on rim drives</td></tr>
  </tbody>
</table>

<h2>Why Zone Works as a Rhythm-Breaker</h2>
<p>Even in the NBA, coaches like Erik Spoelstra (Miami Heat) deploy surprise 2–3 zone stretches for 8–12 possessions per game — not because zone is universally superior, but because forcing an offence to abruptly switch from pick-and-roll reads to zone-attack spacing stalls rhythm and shaves 4–6 seconds off every shot clock.</p>

<h2>Key Takeaway</h2>
<p>Man-to-man defends the three-point line and defensive glass best; zone protects the paint and hides weak 1v1 defenders. Always check a team''s 3-point shooting % and offensive rebounding rate when facing a zone-heavy opponent.</p>'
WHERE slug = 'basketball-man-vs-zone'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

-- [basketball-defensive-schemes] basketball-zone-defense
UPDATE public.lessons
SET content = '<h2>2-3, 3-2, and 1-3-1: Choosing the Right Zone Geometry</h2>
<ul>
  <li><strong>2-3 Zone:</strong> Two guards up top, three defenders across the baseline/paint. Maximum rim protection and rebounding stability; vulnerable to high-post flash passes (free-throw line) and corner threes.</li>
  <li><strong>3-2 / 1-2-2 Zone:</strong> Three defenders high around the three-point arc, two down low. Better against perimeter shooting; vulnerable to baseline cuts and corner overloads.</li>
  <li><strong>1-3-1 Trapping Zone:</strong> High-risk chaos defence with a point chaser, three across the middle, and a baseline sweeper. Forces high live-ball turnovers but surrenders wide-open corner threes (~1.17 pts/shot) if the offence skips the ball cleanly.</li>
</ul>

<h2>How Offences Crack a Zone</h2>
<p>The universal zone-buster is a <strong>high-post playmaker</strong> catching at the free-throw line ("nail"). Once the ball touches the middle of a 2-3 zone, all five defenders collapse inward — leaving either a 10-foot jumper, a dump-off dunk to the short corner, or a kick-out to an uncontested corner three.</p>

<h2>Key Takeaway</h2>
<p>Zones live or die by the opponent''s corner three-point shooting and high-post passing IQ. Against cold shooting teams, a 2-3 zone can hold scoring under 0.90 PPP; against elite spacing, it gets shredded rapidly.</p>'
WHERE slug = 'basketball-zone-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

-- [basketball-defensive-schemes] basketball-switching-defense
UPDATE public.lessons
SET content = '<h2>Why Switching 1-Through-5 Became the Playoff Gold Standard</h2>
<p>In a switching defence, whenever an offensive player sets a screen, the two defenders simply trade assignments instead of fighting over the pick. This instantly neutralizes the two deadliest pick-and-roll outcomes: open pull-up threes and rolling layups.</p>

<h2>The Statistical Signature of Switch-Heavy Defences</h2>
<ul>
  <li><strong>Drastically lower opponent Assisted FG%:</strong> Switching forces offences out of team motion into 1-on-1 isolations.</li>
  <li><strong>Slower pace &amp; lower shot-clock efficiency:</strong> Offences burn 8–10 seconds hunting a favourable mismatch ("matchup hunting"), often settling for contested late-clock jumpers.</li>
  <li><strong>The Catch — Personnel &amp; Rebounding Tax:</strong> Switching fails catastrophically if you have a slow drop center or a 6''0" guard who gets hunted relentlessly. Switching also pulls your center out to the 3-point line, often hurting defensive rebounding percentage by 2–4%.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Switch-everything defences suffocate pick-and-roll and motion offences, but require five mobile, strong defenders — and often create defensive rebounding vulnerabilities when bigs get pulled to the perimeter.</p>'
WHERE slug = 'basketball-switching-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

-- [basketball-defensive-schemes] basketball-help-defense
UPDATE public.lessons
SET content = '<h2>Five Players Moving on a String</h2>
<p>No defender in the world can stop an elite NBA ball-handler 1-on-1 with 45 feet of space. Elite defences (e.g. Oklahoma City Thunder, Boston Celtics, Minnesota Timberwolves) succeed through <strong>synchronized help-and-recover rotations</strong>:</p>
<ol>
  <li><strong>Tagging the roller:</strong> The weak-side corner defender ("low man") steps into the paint to bump the rolling center so he cannot catch an easy lob.</li>
  <li><strong>X-Out ("Scram" / Cross-Rotation):</strong> If the ball-handler kicks the ball out to the weak-side corner, the wing defender rotates down to the corner while the low man sprints out to the wing — covering both shooters without giving up a layup.</li>
  <li><strong>Peel switching:</strong> When a perimeter defender gets beaten off the dribble, the nearest wing defender "peels" onto the driver while the beaten defender sprints to the open shooter.</li>
</ol>

<h2>Why Chemistry Beats Individual Defensive Reputation</h2>
<p>Teams that suffer frequent injuries or mid-season trades routinely see their Defensive Rating slip by 3–5 points/100 possessions even if individual talent stays high — because split-second help rotations require verbal communication and shared instincts built over months.</p>

<h2>Key Takeaway</h2>
<p>Great team defence is rotational, not purely 1-on-1. Continuity, length on the wings, and fast low-man tagging separate top-5 defences from talented squads that leak wide-open corner threes.</p>'
WHERE slug = 'basketball-help-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

-- [reading-the-box-score] basketball-points-rebounds
UPDATE public.lessons
SET content = '<h2>Why Raw Points and Rebounds Can Mislead You</h2>
<p>A player averaging 24 PPG on 22 shots (42% FG, 31% 3PT) is actually <em>hurting</em> his team''s offence compared to a player averaging 19 PPG on 12 shots (52% FG, 41% 3PT). Similarly, raw rebounds per game hide the huge difference between <strong>contested vs uncontested rebounds</strong> and <strong>offensive vs defensive rebounds</strong>.</p>

<h2>Offensive vs Defensive Rebounding Value</h2>
<table>
  <thead>
    <tr><th>Rebound Type</th><th>League Avg. %</th><th>True Value</th><th>Analytical Note</th></tr>
  </thead>
  <tbody>
    <tr><td>Offensive Rebound (ORB%)</td><td>~24% – 27% of misses</td><td><strong>Extremely high</strong> (~+1.10 pts/ORB)</td><td>Creates a fresh 14-sec possession &amp; high-FG putbacks</td></tr>
    <tr><td>Defensive Rebound (DRB%)</td><td>~73% – 76% of misses</td><td>Team stat &gt; individual stat</td><td>Often inflated by guards grabbing uncontested boards while bigs box out</td></tr>
  </tbody>
</table>
<p><strong>Real-World Example (Steven Adams / Brook Lopez Effect):</strong> Centers like Brook Lopez or Steven Adams often grab modest personal rebound totals while their <em>team''s</em> Defensive Rebound % jumps by +4% to +6% whenever they are on court — because they physically box out opposing bigs so teammates collect uncontested rebounds cleanly.</p>

<h2>Key Takeaway</h2>
<p>Always pair Points with shooting efficiency (TS%) and Usage Rate, and evaluate rebounding via <strong>Team ORB% / DRB%</strong> and contested rebounds rather than raw individual rebound totals.</p>'
WHERE slug = 'basketball-points-rebounds'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'reading-the-box-score');

-- [reading-the-box-score] basketball-assists-turnovers
UPDATE public.lessons
SET content = '<h2>Measuring Playmaking Quality Beyond Raw Assists</h2>
<p>A raw assist requires a teammate to make the shot — meaning an identical wide-open pass to a 42% corner shooter produces far more assists than the same pass to a 31% shooter. Modern tracking adds two sharper lenses:</p>
<ul>
  <li><strong>Potential Assists &amp; Secondary ("Hockey") Assists:</strong> Captures players who create open shots consistently even when teammates have an off shooting night.</li>
  <li><strong>Assist-to-Turnover Ratio (AST/TOV) &amp; Assist % (AST%):</strong> Elite floor generals (e.g. Tyrese Haliburton, Chris Paul, Nikola Joki&cacute;) pair high Assist % (35–45% of teammate buckets) with low Turnover % (&lt;12%), generating clean offence without gifting transition fast breaks.</li>
</ul>

<h2>Team Assist Ratio and Offensive Sustainability</h2>
<p>In the NBA, teams that rank top-10 in <strong>Assist-to-Turnover Ratio (&gt;2.0)</strong> consistently sustain stronger playoff offence than turnover-prone high-pace teams, because low-turnover ball security travels cleanly into slower half-court playoff games.</p>

<h2>Key Takeaway</h2>
<p>Judge playmaking by Assist-to-Turnover ratio, Potential Assists, and how cleanly a creator generates rim and corner-three looks — not raw assist totals inflated by high usage or hot teammate shooting.</p>'
WHERE slug = 'basketball-assists-turnovers'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'reading-the-box-score');

-- [reading-the-box-score] basketball-defensive-stats
UPDATE public.lessons
SET content = '<h2>Why Steals and Blocks Only Show ~10% of Defence</h2>
<p>Box scores only record <strong>Steals</strong> and <strong>Blocks</strong> — yet a defender might contest 18 shots cleanly, force 6 shot-clock violations, and deter 10 rim drives without recording a single steal or block! Worse, gambling for steals often leaves teammates scrambling 4-on-5 and surrendering easy layups.</p>

<h2>Superior Defensive Metrics Used by Pro Analysts</h2>
<ul>
  <li><strong>Opponent Rim FG% Differential (DFG% vs Expected):</strong> Measures how much a rim protector lowers opponent finishing within 6 feet of the basket (elite anchors drop opponent rim FG% by &minus;8% to &minus;14%).</li>
  <li><strong>Deflections &amp; Contested Shots per 36:</strong> Captures active hands and closeout effort far more reliably than steals alone.</li>
  <li><strong>Defensive EPM / DARKO / Defensive On-Off:</strong> Multi-season regularized impact metrics that isolate whether a team''s actual points allowed per 100 possessions improve when that player is on the floor.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Never crown a player an elite defender based on steals or blocks per game. True defensive impact is measured by rim deterrence, opponent shot-quality suppression, and multi-season Defensive On/Off impact.</p>'
WHERE slug = 'basketball-defensive-stats'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'reading-the-box-score');

-- [basketball-advanced-metrics] basketball-true-shooting-pct
UPDATE public.lessons
SET content = '<h2>Why Field Goal % (FG%) Is Obsolete</h2>
<p>Traditional FG% treats a 2-pointer and a 3-pointer identically and ignores free throws completely. <strong>True Shooting Percentage (TS%)</strong> solves both flaws by measuring total points scored per shooting possession:</p>
<p><code>TS% = Points / (2 &times; (FGA + 0.44 &times; FTA))</code></p>
<p><em>(The <code>0.44</code> coefficient empirically accounts for and-ones, technical free throws, and 3-shot fouls across NBA play-by-play data.)</em></p>

<h2>Worked Real-Data Comparison</h2>
<table>
  <thead>
    <tr><th>Player Profile</th><th>2PT</th><th>3PT</th><th>FT</th><th>Points</th><th>FG%</th><th>True Shooting % (TS%)</th></tr>
  </thead>
  <tbody>
    <tr><td>Old-School Mid-Range Scorer</td><td>9 / 18 (50%)</td><td>0 / 2 (0%)</td><td>2 / 3 (67%)</td><td>20 pts</td><td>45.0%</td><td><strong>46.9%</strong> (far below avg)</td></tr>
    <tr><td>Modern 3PT + FT Creator</td><td>3 / 7 (43%)</td><td>4 / 10 (40%)</td><td>7 / 8 (88%)</td><td>25 pts</td><td>41.2%</td><td><strong>60.9%</strong> (elite!)</td></tr>
  </tbody>
</table>
<p>Notice the shock: Player B has a <strong>lower FG% (41.2% vs 45.0%)</strong> yet is a vastly more efficient scorer (<strong>60.9% TS% vs 46.9% TS%</strong>) — scoring 5 more points on fewer shooting possessions! Modern NBA league-average TS% sits around <strong>57.5%–58.0%</strong>; anything above <strong>62%</strong> at high usage (like Nikola Joki&cacute;, Shai Gilgeous-Alexander, or Stephen Curry) is historic efficiency.</p>

<h2>Key Takeaway</h2>
<p>Replace FG% with <strong>True Shooting % (TS%)</strong> and <strong>Effective Field Goal % (eFG%)</strong> whenever evaluating scorers. Three-pointers and free throws warp scoring efficiency far more than raw field-goal percentage reveals.</p>'
WHERE slug = 'basketball-true-shooting-pct'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-advanced-metrics');

-- [basketball-advanced-metrics] basketball-per-metric
UPDATE public.lessons
SET content = '<h2>What PER Measures — and Why Modern Analytics Moved Past It</h2>
<p>John Hollinger''s <strong>Player Efficiency Rating (PER)</strong> was a landmark early all-in-one stat normalized so league average equals <strong>15.0</strong> (20+ = All-Star, 25+ = MVP candidate). It sums positive box-score contributions (points, rebounds, assists, steals, blocks) and subtracts misses and turnovers on a per-minute, pace-adjusted basis.</p>

<h2>Three Fatal Flaws of PER</h2>
<ol>
  <li><strong>Nearly blind to defence:</strong> Because PER only sees steals, blocks, and defensive rebounds, a terrible positional defender who gambles for steals grades out higher than an elite 3-and-D wing who locks down stars cleanly.</li>
  <li><strong>Rewards inefficient volume shooting:</strong> Mathematically, PER increases slightly even when a player takes shots at roughly 32–35% FG — below break-even team efficiency!</li>
  <li><strong>Ignores off-ball spacing gravity:</strong> A 42% shooter standing in the corner creates huge value for teammates without touching the box score.</li>
</ol>
<p>Modern front offices and sharp analysts therefore prefer <strong>EPM (Estimated Plus-Minus)</strong>, <strong>DARKO</strong>, or <strong>BPM + RAPM</strong> blends, which combine box-score priors with play-by-play lineup impact.</p>

<h2>Key Takeaway</h2>
<p>PER is a quick pace-adjusted box-score summary (15.0 = average), not a complete player valuation. Always cross-check PER against True Shooting % and play-by-play impact metrics (EPM / On-Off) to avoid overrating empty-calorie scorers.</p>'
WHERE slug = 'basketball-per-metric'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-advanced-metrics');

-- [basketball-advanced-metrics] basketball-on-off-splits
UPDATE public.lessons
SET content = '<h2>Measuring What Actually Happens to the Scoreboard</h2>
<p><strong>On/Off Net Rating</strong> compares a team''s point differential per 100 possessions when a player is <em>on the court</em> versus when they are <em>on the bench</em>. It captures invisible value that box scores miss completely: off-ball shooting gravity, rim deterrence, defensive communication, and screen-setting.</p>

<h2>Real-World Superstar On/Off Impact</h2>
<p>Elite engine players like Nikola Joki&cacute; (Denver Nuggets), Giannis Antetokounmpo, or Joel Embiid routinely post <strong>+12 to +18 points per 100 possessions</strong> On/Off swings — meaning their team plays like a 60-win contender with them on court and a lottery team during the 12 minutes they sit.</p>

<h2>Two Traps When Reading Raw On/Off Splits</h2>
<ul>
  <li><strong>Backup quality distortion:</strong> A starter with a terrible backup looks artificially amazing in raw On/Off, whereas a star backed up by a strong Sixth Man looks artificially modest.</li>
  <li><strong>Small-sample 3-point noise:</strong> Over a 10-game window, opponent 3-point shooting luck (e.g. opponents randomly shooting 44% vs 29% from three) overwhelms true defensive On/Off signal. Trust On/Off splits over <strong>1,000+ minutes</strong> or use Regularized Adjusted Plus-Minus (RAPM / EPM).</li>
</ul>

<h2>Key Takeaway</h2>
<p>On/Off Net Rating reveals a player''s true two-way lineup impact — especially for injury adjustments when a high-impact star sits — provided you account for backup quality and require large minute samples.</p>'
WHERE slug = 'basketball-on-off-splits'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-advanced-metrics');
