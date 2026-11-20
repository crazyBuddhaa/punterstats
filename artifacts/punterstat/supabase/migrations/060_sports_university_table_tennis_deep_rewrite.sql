-- ============================================================
-- PunterStat — Migration 060: Sports University Table Tennis Deep Rewrite (8 lessons)
-- Rewrites & expands 8 lessons with real-data benchmarks,
-- worked examples, HTML tables, and Key Takeaways.
-- ============================================================

-- [table-tennis-rules-scoring] table-tennis-scoring
UPDATE public.lessons
SET content = '<h2>First to 11, Win by 2: Why Every Point Carries High Variance</h2>
<p>In 2001, the ITTF shortened table tennis games from 21 points to <strong>11 points</strong> (win by 2, with alternating serves every 2 points, and every 1 point at deuce 10–10). Matches on the World Table Tennis (WTT) tour are typically <strong>Best-of-5 games</strong> (first to 3) in Contender/early rounds and <strong>Best-of-7 games</strong> (first to 4) in Grand Smashes, World Championships, and Olympics.</p>

<h2>The Mathematics of Format Length (Bo5 vs Bo7)</h2>
<p>Short 11-point games create significantly higher upset rates than 21-point games — and Best-of-5 is far noisier than Best-of-7. Under an independent-point binomial model:</p>
<table>
  <thead>
    <tr><th>Better Player''s Point Win %</th><th>Single 11-Pt Game Win %</th><th>Best-of-5 Match Win %</th><th>Best-of-7 Match Win %</th></tr>
  </thead>
  <tbody>
    <tr><td>52% (slight edge)</td><td>55.4%</td><td>59.7%</td><td>61.6%</td></tr>
    <tr><td>55% (clear favourite)</td><td>63.3%</td><td>73.7%</td><td>77.7%</td></tr>
    <tr><td>58% (strong favourite)</td><td>70.7%</td><td>84.5%</td><td>88.7%</td></tr>
    <tr><td>62% (dominant elite)</td><td>79.4%</td><td>93.8%</td><td>96.5%</td></tr>
  </tbody>
</table>
<p><strong>Analytical insight:</strong> Notice how a 55% point-winner loses a single 11-point game <strong>36.7% of the time</strong>! That is why elite players (like Fan Zhendong, Wang Chuqin, or Sun Yingsha) regularly drop Game 1 while adapting to an opponent''s serve spin, yet still win Best-of-7 matches nearly 80%+ of the time. Overreacting to a 0–1 game deficit in Bo7 is a classic live-analysis error.</p>

<h2>Deuce (10–10) Dynamics</h2>
<p>At 10–10, service alternates every single point. Because the server holds a roughly <strong>53–56% point-win advantage</strong> at elite level (due to third-ball attack initiative), whoever gets ahead by 1 point on their own serve creates immediate match-point pressure.</p>

<h2>Key Takeaway</h2>
<p>11-point games are inherently noisy, which is why format length (Best-of-5 vs Best-of-7) dramatically changes favourite win probability. Always calibrate expectations to the match format rather than reacting emotionally to a single dropped game.</p>'
WHERE slug = 'table-tennis-scoring'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-rules-scoring');

-- [table-tennis-rules-scoring] table-tennis-service-rules
UPDATE public.lessons
SET content = '<h2>Why Service Is the Most Strictly Regulated Shot in Table Tennis</h2>
<p>Unlike tennis — where the serve is a 210 km/h speed weapon — table tennis serves are a <strong>spin-deception weapon</strong>. Because players stand barely 2.74 metres apart, the ITTF enforces strict legality rules so the receiver has a fair chance to read spin:</p>
<ul>
  <li><strong>Open palm &amp; visible ball:</strong> The ball must rest freely on an open, stationary palm behind the end line and above the playing surface.</li>
  <li><strong>16 cm vertical toss:</strong> The ball must be thrown nearly vertically at least 16 cm upward with no spin imparted by the fingers.</li>
  <li><strong>No body/arm obstruction:</strong> Since 2002, the server must remove their free arm immediately after tossing so the receiver has an unobstructed view of bat-to-ball contact.</li>
</ul>

<h2>Real Data: The Third-Ball Attack Advantage</h2>
<p>On the WTT circuit, roughly <strong>55–65% of all rallies end within the first 4 strokes</strong> (serve, receive, 3rd ball, 4th ball). Elite servers win approximately <strong>54–58% of their own service points</strong> — not by hitting aces, but by forcing a weak, high return ("pop-up") that sets up a lethal 3rd-ball forehand loop.</p>
<p><strong>Tactical Tell:</strong> When a player wins 60%+ on their own serve but struggles to read the opponent''s short pendulum/reverse-pendulum serve (winning &lt;40% on return), games tend to stay tight and frequently go to 11–9 or deuce — pushing total match points higher.</p>

<h2>Key Takeaway</h2>
<p>Table tennis matches are largely decided in the first 3–4 strokes. Players who disguise backspin vs no-spin serves within the legal toss rules consistently control the third ball and hold a structural 4–8% point-win edge on serve.</p>'
WHERE slug = 'table-tennis-service-rules'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-rules-scoring');

-- [table-tennis-rules-scoring] table-tennis-doubles
UPDATE public.lessons
SET content = '<h2>Alternating Strokes: Why Doubles Is a Different Sport</h2>
<p>In table tennis doubles, partners must <strong>alternate hitting every single shot</strong> — you cannot have one partner cover the whole table. After striking the ball, a player must immediately clear out of the footwork lane so their partner can step in.</p>

<h2>The Left-Handed + Right-Handed Geometric Advantage</h2>
<p>One of the strongest structural edges in pro table tennis doubles is pairing a <strong>left-handed player with a right-handed player</strong> (e.g. Wang Chuqin / Sun Yingsha in mixed doubles, or Felix Lebrun / Alexis Lebrun vs left-right pairs):</p>
<ul>
  <li>Both players can keep their stronger forehands on the outside without crossing paths or colliding in the middle.</li>
  <li>Two right-handers must constantly circle around each other, creating a 0.2–0.3 second recovery delay that elite opponents target by aiming into the "crossover hip" (right side of one player, backhand of the other).</li>
</ul>

<h2>Diagonal Service Rules and Tactical Rotations</h2>
<p>Doubles serves must travel diagonally from the server''s right half-court to the receiver''s right half-court. After each game, the receiving order flips — meaning a pair that dominated Game 1 because Player A crushed Player C''s serve may suddenly struggle in Game 2 when Player A now has to receive Player D''s serve. This causes sharper game-to-game momentum swings than in singles.</p>

<h2>Key Takeaway</h2>
<p>Do not predict table tennis doubles by simply averaging two players'' singles rankings. Left-right handedness synergy, footwork clearance, and game-by-game service-order rotations drive massive performance gaps.</p>'
WHERE slug = 'table-tennis-doubles'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-rules-scoring');

-- [table-tennis-equipment] table-tennis-rubber
UPDATE public.lessons
SET content = '<h2>How 2 Millimetres of Rubber Dictates an Entire Matchup</h2>
<p>In almost no other sport does equipment alter ball physics as dramatically as table tennis rubbers. The ITTF approves over 1,500 rubbers, grouped into four functional families — and players use two different colours (traditionally red and black, or bright ITTF-approved colours) so opponents can see which surface struck the ball.</p>
<table>
  <thead>
    <tr><th>Rubber Type</th><th>Spin Generation</th><th>Sensitivity to Incoming Spin</th><th>Primary Archetype</th></tr>
  </thead>
  <tbody>
    <tr><td>Inverted (Smooth) — Sticky/Tensor</td><td>Maximum</td><td>High (must read spin accurately)</td><td>90%+ of modern elite attackers</td></tr>
    <tr><td>Short Pips (Pimples-Out)</td><td>Low–Medium</td><td>Low (flat, fast hitting)</td><td>Close-to-table hitters (e.g. Mima Ito BH)</td></tr>
    <tr><td>Long Pips</td><td>Reverses incoming spin</td><td>Very low</td><td>Modern choppers / defenders</td></tr>
    <tr><td>Anti-Spin</td><td>Minimal (dead ball)</td><td>Near zero</td><td>Disruptive blockers</td></tr>
  </tbody>
</table>

<h2>Why Pips-Out Players Cause Shock Upsets</h2>
<p>An attacker trained against smooth inverted rubbers expects heavy topspin to bounce high and kick forward. Against a <strong>short-pips backhand</strong> (like Mima Ito or Mattias Falck on forehand) or a <strong>long-pips chopper</strong> (like Han Ying or Ruwen Filus), the ball comes back flat, sinking, or with reversed spin. Players with limited practice against pips-out opponents frequently commit unforced errors into the net and lose to lower-ranked specialists.</p>

<h2>Key Takeaway</h2>
<p>Always check rubber setups before evaluating head-to-head matchups. Pips-out and long-pips specialists disrupt standard topspin rhythms and create asymmetric matchup edges that world rankings alone do not capture.</p>'
WHERE slug = 'table-tennis-rubber'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-equipment');

-- [table-tennis-spin] table-tennis-spin-types
UPDATE public.lessons
SET content = '<h2>The Magnus Effect on a 2.7-Gram Ball</h2>
<p>A 40+ mm plastic table tennis ball weighs just <strong>2.7 grams</strong> yet can spin at <strong>120 to 150 revolutions per second</strong> (7,000–9,000 RPM) on an elite forehand loop. At that mass-to-spin ratio, the aerodynamic Magnus force bends the ball''s trajectory dramatically in mid-air and off the bounce.</p>
<ul>
  <li><strong>Topspin:</strong> Air pressure pushes the ball downward sharply, allowing attackers to hit at 100+ km/h while still curving the ball onto the table. On contact with the opponent''s bat, the ball kicks <em>upward</em> — requiring a closed bat angle.</li>
  <li><strong>Backspin (Underspin):</strong> Generates lift so the ball floats longer, then grips the table and slows down. On contact with the opponent''s bat, it dives <em>downward into the net</em> — requiring an open bat angle or heavy upward brush.</li>
  <li><strong>Sidespin &amp; Corkspin:</strong> Curves laterally in flight and jumps sideways off the opponent''s racket. Combined with backspin or topspin on pendulum serves, it forces weak returns if misread by even 5 degrees of bat angle.</li>
</ul>

<h2>The 40+ Plastic Ball Era (Post-2014)</h2>
<p>When the ITTF switched from celluloid to larger 40+ ABS plastic balls, peak spin dropped by roughly <strong>10–15%</strong>, making it slightly easier to counter-attack aggressively close to the table and rewarding compact backhand flicks ("chiquita" banana flicks) over pure heavy-spin play.</p>

<h2>Key Takeaway</h2>
<p>Spin is the hidden currency of table tennis. Reading whether an opponent''s serve or chop carries heavy backspin versus deceptive no-spin decides more points than raw shot speed.</p>'
WHERE slug = 'table-tennis-spin-types'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-spin');

-- [table-tennis-core-strokes] table-tennis-topspin-loop
UPDATE public.lessons
SET content = '<h2>Why the Topspin Loop Rules Modern Table Tennis</h2>
<p>The topspin loop — brushing upward and forward rapidly over the ball to impart heavy topspin — is the foundation of modern attacking table tennis because it solves the sport''s core geometric problem: <strong>how to hit hard while maintaining high margin for error over a 15.25 cm net</strong>.</p>

<h2>Opening Against Backspin vs Counter-Looping</h2>
<ol>
  <li><strong>First-ball opening loop (against backspin):</strong> The most technically demanding stroke in the sport. The player must drop their shoulder, accelerate sharply upward to overcome the opponent''s backspin, and clear the net without popping the ball up for a counter-attack.</li>
  <li><strong>Backhand banana flick ("Chiquita"):</strong> Modern stars (e.g. Fan Zhendong, Lin Shidong, Felix Lebrun) now flick short backspin serves directly into topspin rallies on the 2nd ball — neutralizing the server''s 3rd-ball advantage.</li>
  <li><strong>Mid-distance counter-looping:</strong> Once both players are in topspin-to-topspin exchanges, rally speed exceeds 90 km/h and footwork + recovery balance decide the point.</li>
</ol>

<h2>Analytical Signal: First-Attack Conversion Rate</h2>
<p>In WTT match breakdowns, the player who lands the <strong>first quality topspin attack</strong> wins roughly <strong>62–68% of those rallies</strong>. Players with a reliable two-wing opening loop (both forehand and backhand) are far more consistent across tournaments than one-wing forehand-only loopers who can be pinned to their backhand corner.</p>

<h2>Key Takeaway</h2>
<p>Track who initiates the first quality topspin attack (especially via backhand receive flicks). Winning the initiative on ball 2 or 3 gives a ~65% rally-win edge at the elite level.</p>'
WHERE slug = 'table-tennis-topspin-loop'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-core-strokes');

-- [table-tennis-pro-structure] table-tennis-ittf-wtt
UPDATE public.lessons
SET content = '<h2>The Modern WTT Tour Hierarchy</h2>
<p>Since 2021, World Table Tennis (WTT) restructured professional table tennis into a tennis-style pyramid where ranking points, prize money, and match formats scale sharply by tier:</p>
<table>
  <thead>
    <tr><th>Event Tier</th><th>Winner Ranking Points</th><th>Typical Format</th><th>Field Strength &amp; Motivation</th></tr>
  </thead>
  <tbody>
    <tr><td>Olympics / World Championships / WTT Grand Smash</td><td>2,000 pts</td><td>Best-of-7 (singles)</td><td>Peak motivation; full Chinese/Asian/European elite</td></tr>
    <tr><td>WTT Finals</td><td>1,500 pts</td><td>Bo5 / Bo7</td><td>Top 16 players of the season only</td></tr>
    <tr><td>WTT Champions</td><td>1,000 pts</td><td>Bo5 (Bo7 SF/F)</td><td>Top 32 singles-only showcase</td></tr>
    <tr><td>WTT Star Contender / Contender</td><td>600 / 400 pts</td><td>Best-of-5</td><td>Mixed fields; top stars often skip or test new tactics</td></tr>
    <tr><td>WTT Feeder</td><td>125 pts</td><td>Best-of-5</td><td>Developing prospects &amp; regional players; high variance</td></tr>
  </tbody>
</table>

<h2>Why Tour Tier Matters Analytically</h2>
<p>Just like ATP 250s vs Grand Slams, motivation and format length diverge sharply across WTT tiers. In a Best-of-5 WTT Contender event right before a Grand Smash or Olympics, top-10 players frequently suffer upset losses because 11-point Bo5 variance is high and peak preparation is timed for the 2,000-point majors.</p>

<h2>Key Takeaway</h2>
<p>Always check the WTT tournament tier and match format (Bo5 vs Bo7). Upset frequency is substantially higher in 400-point Best-of-5 Contender/Feeder events than in Best-of-7 Grand Smashes and World Championships.</p>'
WHERE slug = 'table-tennis-ittf-wtt'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-pro-structure');

-- [table-tennis-elite-styles] table-tennis-elite-archetypes
UPDATE public.lessons
SET content = '<h2>Style Matchups Beat Raw World Rankings</h2>
<p>In table tennis, two players ranked #8 and #25 do not have a fixed win probability across all opponents — <strong>style-vs-style geometry</strong> can swing true win probability by 15–25 percentage points.</p>
<table>
  <thead>
    <tr><th>Archetype</th><th>Core Weapons</th><th>Favourable Matchup</th><th>Vulnerable Matchup</th></tr>
  </thead>
  <tbody>
    <tr><td>Two-Wing Balanced Attacker</td><td>Fast backhand flicks + explosive forehand counter-loops</td><td>One-wing attackers &amp; passive blockers</td><td>Ultra-fast close-to-table disruptors</td></tr>
    <tr><td>Forehand-Dominant Looper</td><td>Massive FH power, heavy pivot footwork</td><td>Mid-distance rally players</td><td>Fast BH-to-wide-FH placement players</td></tr>
    <tr><td>Modern Chopper / Defender</td><td>Heavy backspin chops (long pips) + sudden FH counter-hits</td><td>Impatient power hitters who lack spin patience</td><td>Patient loop-push-loop tacticians (Chinese school)</td></tr>
    <tr><td>Close-to-Table Pips Blocker</td><td>Early timing, flat redirection, tempo disruption</td><td>Slow-swinging heavy topspin loopers</td><td>High-spin deep placements that push them off the table</td></tr>
  </tbody>
</table>

<h2>Real-World Matchup Example: Attacker vs Chopper</h2>
<p>When a European power attacker meets an elite defender (e.g. Han Ying, Suh Hyo-won, or Ruwen Filus), matches routinely feature long physical rallies where the attacker must loop 6–10 heavy backspin chops per point. If the attacker has a strong head-to-head record against choppers, they cruise; if they historically struggle against long pips, a #15 attacker can lose 0–3 to a #45 defender.</p>

<h2>Key Takeaway</h2>
<p>Before trusting world rankings in table tennis, classify both players'' archetypes (two-wing attacker, forehand looper, pips blocker, or chopper) and check their historical record specifically against that style.</p>'
WHERE slug = 'table-tennis-elite-archetypes'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-elite-styles');
