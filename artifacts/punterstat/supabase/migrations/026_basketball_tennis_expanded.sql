-- ============================================================
-- PunterStat — Basketball & Tennis Sports University Expansion
-- Fills thin basketball and tennis courses with full lesson content.
-- Run after 025_football_expanded.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- BASKETBALL POSITIONS & PLAYER ROLES — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Point Guard vs Shooting Guard: Different Responsibilities',
  'basketball-guard-positions',
  '<h2>The two guard positions</h2>
<p>In traditional basketball nomenclature, the five positions are numbered 1 through 5. The guards are the 1 (point guard) and 2 (shooting guard). Both play on the perimeter, both need to handle the ball, and both must be able to score — but their primary responsibilities are meaningfully different.</p>

<h2>The point guard ("1"): running the team</h2>
<p>The point guard is the primary ball-handler and the quarterback of the offence. Their core responsibilities:</p>
<ul>
<li><strong>Organising the offence</strong> — calling plays, identifying mismatches, directing teammates into correct positions</li>
<li><strong>Ball-handling under pressure</strong> — breaking defensive pressure, initiating half-court sets, and managing the shot clock</li>
<li><strong>Pick-and-roll operation</strong> — the pick-and-roll is basketball''s most common action, and the point guard is usually the ball-handler in it</li>
<li><strong>Facilitating for teammates</strong> — elite point guards like Chris Paul, Steve Nash, or the young Nikola Jokic create high-quality shots for others through passing, not just for themselves</li>
</ul>
<p>Modern point guards are expected to score as well as facilitate — the "scoring point guard" archetype (Russell Westbrook, Damian Lillard, Steph Curry) has become the dominant model. But their unique value remains the ability to elevate teammates.</p>

<h2>The shooting guard ("2"): scoring and off-ball movement</h2>
<p>The shooting guard''s primary purpose is scoring, particularly from mid-range and three-point range. Where a point guard creates for others and scores as a byproduct, the shooting guard is often the primary offensive target. Key responsibilities:</p>
<ul>
<li><strong>Off-ball movement</strong> — cutting to the basket, running off screens to get open for catch-and-shoot opportunities</li>
<li><strong>Pull-up jump shooting</strong> — the ability to create their own shot off the dribble when the defence closes out</li>
<li><strong>Secondary playmaking</strong> — picking up ball-handling duties when the point guard is pressured</li>
</ul>
<p>Michael Jordan, Kobe Bryant, Dwyane Wade, and James Harden are among the greatest shooting guards in NBA history — all defined by their ability to score in a wide variety of ways.</p>

<h2>How the distinction is blurring</h2>
<p>In the modern NBA, "guard" is often used as a single category, with the distinction between 1 and 2 becoming increasingly irrelevant. Many teams use two players who share ball-handling and scoring responsibilities fluidly. The best guards in today''s game — Steph Curry, Luka Dončić, Shai Gilgeous-Alexander — combine point guard creation skills with shooting guard scoring capacity in a single player.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-positions-and-roles' and cat.slug = 'basketball-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Small Forward and Power Forward: Versatility and Mismatches',
  'basketball-forward-positions',
  '<h2>The forward positions: 3 and 4</h2>
<p>Small forwards (3) and power forwards (4) occupy the wings and high post area. They are typically the most physically versatile players on the court — bigger than guards but more mobile than centers. This versatility makes them valuable in modern basketball''s mismatch-seeking style of play.</p>

<h2>The small forward ("3"): the swiss army knife</h2>
<p>Small forwards need to do a bit of everything. They guard the opposing team''s best perimeter scorer, contribute from three-point range, attack the basket off the dribble, and rebound effectively for their size. The position demands an unusually broad skill set:</p>
<ul>
<li><strong>Perimeter shooting</strong> — the "3-and-D" small forward archetype (three-point shooting and defence) has become enormously valuable in spacing-dependent offences</li>
<li><strong>Slashing and driving</strong> — getting to the basket in transition or off the dribble</li>
<li><strong>Defending multiple positions</strong> — a small forward who can guard both the 2 and the 4 (or even the 5) gives coaches enormous defensive flexibility</li>
</ul>
<p>LeBron James, Kawhi Leonard, and Scottie Pippen represent different eras of elite small forward play, each combining defensive excellence with diverse offensive contributions.</p>

<h2>The power forward ("4"): physical presence with skill</h2>
<p>Power forwards are the "big wing" — physically strong, able to play near the basket, but increasingly expected to stretch the floor with three-point shooting. The position has transformed dramatically in the modern era:</p>
<ul>
<li><strong>Traditional power forward</strong> — dominant rebounder, post scorer, physical defender near the basket (Charles Barkley, Karl Malone)</li>
<li><strong>Stretch power forward</strong> — can shoot threes, pulling the opposing center away from the basket and creating driving lanes (Dirk Nowitzki pioneered this; Kevin Durant extended it)</li>
<li><strong>Pass-first power forward</strong> — facilitating from the high post, creating out of pick-and-pop actions (Nikola Jokic redefines what a big man who passes can do)</li>
</ul>

<h2>Why mismatches matter for forwards</h2>
<p>When a power forward who can shoot threes is guarded by an opposing center who cannot defend the perimeter, a "mismatch" exists — and the attacking team exploits it by posting their forward up or spreading the center far from the basket. Mismatch hunting is central to modern NBA offence, and forwards who can operate in multiple modes (post up, shoot threes, drive, pass) are the most difficult players to defend without creating mismatches elsewhere.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-positions-and-roles' and cat.slug = 'basketball-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Center: Rim Protection, Rebounding, and Modern Evolution',
  'basketball-center-position',
  '<h2>The "5": the biggest player on the court</h2>
<p>Centers (position 5) are traditionally the tallest and most physically imposing players on a basketball team. Their historical role — stand near the basket, score from close range, block shots, rebound — has been fundamentally disrupted by the three-point revolution, but elite centers remain among the most valuable players in the sport.</p>

<h2>Traditional center responsibilities</h2>
<ul>
<li><strong>Rim protection</strong> — altering and blocking shots near the basket. Elite shot-blockers (Rudy Gobert, Joel Embiid, Dikembe Mutombo) deter opposition from attacking the paint, forcing them toward lower-efficiency mid-range jumpers</li>
<li><strong>Rebounding</strong> — controlling the glass at both ends. Centers who dominate the offensive glass create extra possessions; those who dominate the defensive glass prevent opponent second chances</li>
<li><strong>Post scoring</strong> — receiving the ball with their back to basket and using footwork, strength, and skill to score against a single defender</li>
<li><strong>Setting screens</strong> — the screen-setter in a pick-and-roll is usually the center; their size makes their screens difficult to fight through</li>
</ul>

<h2>The "stretch center" and the three-point revolution</h2>
<p>As three-point shooting became central to NBA strategy, teams began demanding that centers could at least threaten from the perimeter — drawing the opposing center away from the basket. A center who cannot shoot threes effectively anchors the paint in their own favour but also anchors the opposing center near the basket, where they are most effective. This fundamental tension has led to the emergence of "stretch centers" — big men who can shoot reliably from range.</p>

<h2>The modern "unicorn" center</h2>
<p>Nikola Jokic has redefined what a center can be. Listed at 6''11" and 284 pounds, Jokic leads the league in assists multiple times — a statistic historically dominated by point guards. His ability to pass out of the post, initiate offence from the elbow, shoot from mid-range, and rebound at elite levels makes him uniquely difficult to guard. He represents the endpoint of an evolution toward skill and basketball IQ over pure size and athleticism.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-positions-and-roles' and cat.slug = 'basketball-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Positionless Basketball: How the Modern Game Has Evolved',
  'positionless-basketball',
  '<h2>The death of rigid positions</h2>
<p>Fifty years ago, basketball positions were rigid and clearly defined. Centers stayed near the basket. Guards handled the ball on the perimeter. A center who could pass or a guard who played inside would have been exceptional. Today, the most valuable players in basketball are those who blur or eliminate positional boundaries entirely — and the most successful teams are built around this flexibility.</p>

<h2>Why positions became less relevant</h2>
<p>Three structural changes drove positional evolution:</p>
<ul>
<li><strong>The three-point line''s growing dominance</strong> — as three-pointers became more efficient than mid-range twos, teams needed all five players to be threats from the perimeter, not just guards. This forced big men to develop shooting skills previously considered irrelevant to their role.</li>
<li><strong>Switching defences</strong> — when a defensive team switches every screen (each defender takes whoever comes their way), all five offensive players need to be able to create a mismatch against any defender. A center who can only post up becomes a liability when their isolation defender is a mobile forward.</li>
<li><strong>The analytics revolution</strong> — advanced metrics showed that positional labels poorly predicted actual player value. Players who contributed in multiple ways were more valuable than position-appropriate specialists.</li>
</ul>

<h2>What "positionless" looks like in practice</h2>
<p>In a positionless lineup, five players might all be able to: handle the ball in ball-screen actions, shoot threes, drive to the basket, pass out of the post or the elbow, and switch defensively onto multiple positions. Golden State''s championship teams used this framework — at times starting five players who could each legitimately play three different positions.</p>

<h2>Why it matters for analysis</h2>
<p>When evaluating basketball players, positional labels are increasingly a starting point, not a conclusion. A player listed as a center who shoots 38% from three and averages 6 assists per game is not competing against other centers — they are competing against the best players at any position. For match analysis, lineups that create positional mismatches or achieve defensive switching across all five positions are structurally superior to those that create isolated mismatches only one or two can exploit.</p>',
  5, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-positions-and-roles' and cat.slug = 'basketball-fundamentals';


-- ══════════════════════════════════════════════════════════════
-- BASKETBALL OFFENSIVE SYSTEMS — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Motion Offense: Spacing, Cutting, and Ball Movement',
  'basketball-motion-offense',
  '<h2>What is motion offense?</h2>
<p>Motion offense is a system of basketball offence built on principles rather than set plays. Instead of running the same scripted action on every possession, motion offense teaches players to read the defence and make decisions based on what the defence gives them. The system emphasises constant movement, spacing, and ball movement to create open shots through collective action rather than individual heroics.</p>

<h2>The core principles</h2>
<ul>
<li><strong>Spacing</strong> — five players spread across the court, keeping the court wide and open. When players stand too close together, they make it easy for defences to help. Good spacing means each player''s defender must stay near them, reducing help opportunities.</li>
<li><strong>Ball movement</strong> — passing quickly to move the defence. One or two passes rarely create an open shot; three or four passes can collapse a defence that is chasing the ball. The adage is "the ball moves faster than any defender can run."</li>
<li><strong>Player movement</strong> — after passing, a player does not stand still. They cut to the basket (backdoor if their defender loses focus), set a screen for a teammate, or relocate to maintain spacing.</li>
<li><strong>Reads and counters</strong> — players respond to what the defence does. If a defender turns to watch the ball, the cutter goes backdoor. If help defence collapses, the ball is kicked to the open shooter.</li>
</ul>

<h2>The "five-out" motion offense</h2>
<p>The most spacing-intensive motion offense variant places all five players beyond the three-point arc ("five-out"). This maximises the area the defence must cover and creates the largest driving lanes. It is only viable when all five players can legitimately threaten from three-point range — otherwise the defence can ignore the non-shooters and pack the paint.</p>

<h2>Why teams use motion over set plays</h2>
<p>Set plays are precise but predictable — scouted teams know exactly what is coming and can defend it specifically. Motion offense requires the defence to react to an emergent, continuously changing system. There is no single "key player" to take away. There is no single "key action" to disrupt. The offence adapts to whatever the defence gives, which makes it extremely difficult to game-plan against.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-offensive-systems' and cat.slug = 'basketball-strategy';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Isolation and Post-Up: Individual Creation Within Team Systems',
  'basketball-isolation-post',
  '<h2>When individuals attack mismatches one-on-one</h2>
<p>Team motion and ball movement are fundamental to basketball offence, but they do not eliminate the value of individual skill. Isolation plays and post-up actions are deliberate choices to give a superior offensive player space to operate one-on-one against a single defender — creating opportunities through talent differentials rather than structural advantages.</p>

<h2>Isolation offense</h2>
<p>In an isolation set, teammates spread to the corners and wings to keep their defenders occupied, while one player operates one-on-one in the middle of the court or on the wing. The ball-handler has space, a clear lane, and a single opponent to beat.</p>
<p>Isolation is most valuable when:</p>
<ul>
<li>A mismatch has been created by a screen (a slow center defending a quick guard)</li>
<li>A star player has a clear talent advantage over their defender</li>
<li>Late in games when precise, controlled ball-handling is needed to manage the clock</li>
</ul>
<p>The NBA analytics community has long argued that isolation is the least efficient offensive play type in basketball — defenders can commit fully to stopping one player without worrying about rotations. This is statistically correct on average. But for the top 5-10 individual creators in the world (LeBron, Harden, Durant), isolation efficiency exceeds league average because their talent advantage is simply greater than any defensive scheme.</p>

<h2>Post-up offense</h2>
<p>Post-up offense operates near the basket rather than at the perimeter. A skilled post player receives the ball with their back to the basket, uses footwork (drop steps, up-and-unders, jump hooks) and physical strength to create a shot against a single defender. Historically, elite post scorers (Hakeem Olajuwon, Tim Duncan, Shaquille O''Neal) were among the most dominant forces in basketball.</p>
<p>Post offense has declined in the modern NBA as three-point shooting has made the post area less efficient on a per-possession basis. However, it remains a vital counter-punch: a defense that commits too heavily to stopping the three-point line can be attacked via post-up actions, particularly when a large offensive player faces a smaller defender who was placed there through a switching defense.</p>

<h2>Using isolation and post within a team system</h2>
<p>The best offences use isolation and post-up actions as part of a broader system — not as the entire system. When every possession is an isolation, defenders know exactly where to focus attention. When isolation is used selectively after ball movement has compromised defensive positioning, it is significantly more effective. The combination of collective movement and individual creation is what makes elite offences so difficult to defend.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-offensive-systems' and cat.slug = 'basketball-strategy';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Transition Offense: Fast Breaks and Early Sets',
  'basketball-transition-offense',
  '<h2>Attacking before the defence organises</h2>
<p>Transition offense refers to attacking in the moments immediately after gaining possession — before the opposing defence has retreated and set up. It is among the most efficient offensive situations in basketball because the defence is outnumbered, disorganised, or both. Teams that excel in transition can generate easy baskets that require minimal half-court execution.</p>

<h2>The classic fast break</h2>
<p>The fast break is the purest form of transition offense: a team gains possession (off a rebound, steal, or made basket) and immediately pushes the ball up the court before the opposing team can retreat. The ideal fast break is a numbers advantage — 3-on-2, 2-on-1 — where the attacking team has more players than defenders in the immediate vicinity of the basket.</p>
<p>The attacking team''s decision-making is critical: when to go fast, when to slow down, when to finish at the rim versus pull up for a jumper, when to kick to an open wing versus attack the basket. Poor transition decision-making — forcing a layup attempt into a set defence — eliminates the advantage entirely.</p>

<h2>Early offense: the second wave</h2>
<p>Not every possession starts with a clear fast break advantage. "Early offense" is the concept of pushing the pace even when it is not a pure fast break — running to offensive positions before the defence is fully set, attacking the scrambling moments before defensive rotations are complete. Teams that have slow offensive starts (walking the ball up, calling timeout to set a play) sacrifice these advantageous windows entirely.</p>

<h2>Who generates transition opportunities?</h2>
<p>Transition offense begins with defence — specifically with players who rebound and immediately outlet the ball, or with perimeter players who anticipate steals and begin their sprint before possession is secured. Centres who rebound and initiate transition with a quick outlet pass, guards who sprint ahead of the play before the rebound is taken, and wings who read when to go are all essential to a functioning transition system.</p>

<h2>Pace and transition volume</h2>
<p>Teams that play at faster pace (more possessions per 48 minutes) create more transition opportunities simply by having more possessions. Pace is not only an aesthetic choice — it is a strategic weapon for teams with athletic advantages over opponents. A fast team playing a slow game has given up its primary competitive edge.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-offensive-systems' and cat.slug = 'basketball-strategy';


-- ══════════════════════════════════════════════════════════════
-- BASKETBALL DEFENSIVE SCHEMES — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Zone Defense: 2-3, 3-2, 1-3-1 and When to Use Each',
  'basketball-zone-defense',
  '<h2>What is zone defense?</h2>
<p>In zone defense, each player guards a specific area of the court (a "zone") rather than a specific opposing player. Defenders shift and rotate based on where the ball moves, ensuring the zone is always occupied. This contrasts with man-to-man defense, where each defender is personally responsible for one opposing player regardless of where they go.</p>

<h2>The 2-3 zone: the most common zone in basketball</h2>
<p>Two players on the top of the key, three players across the baseline. The 2-3 protects the paint and denies easy access to the basket. It is particularly effective against teams that score primarily in the paint or lack reliable three-point shooting.</p>
<p><strong>Strengths:</strong> Protects the rim, limits post-up scoring, controls the glass. <strong>Weaknesses:</strong> The short corners and high post are vulnerable — teams who can catch the ball at the elbow of the free-throw line and make quick decisions can find open shooters consistently.</p>

<h2>The 3-2 zone</h2>
<p>Three defenders on the perimeter, two near the basket. This reverses the priority — protecting the three-point line at the cost of some interior coverage. Used less frequently, typically against teams with elite three-point shooting that a standard 2-3 would struggle to contest.</p>

<h2>The 1-3-1 zone</h2>
<p>One guard at the top, three players forming a wide middle layer, one player at the baseline. When executed correctly with athletic, long defenders, the 1-3-1 can create traps in the corners and is very difficult to navigate with set half-court plays. However, it requires specific player profiles to execute and can be vulnerable against teams with patient ball movement and good shooting from the wings.</p>

<h2>When teams use zone defense</h2>
<ul>
<li><strong>When a key defender is in foul trouble</strong> — zone reduces individual defensive burden, protecting important players from picking up additional fouls</li>
<li><strong>To disrupt the opposing team''s rhythm</strong> — switching from man-to-man to zone mid-game forces the offence to adapt, potentially creating turnovers</li>
<li><strong>Against teams that struggle to shoot</strong> — if the opponent cannot make threes, zone is far less risky</li>
<li><strong>To control pace</strong> — zone defence typically slows the game down, which suits teams who want to limit possessions</li>
</ul>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-defensive-schemes' and cat.slug = 'basketball-strategy';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Switching Defense: Advantages, Trade-offs, and Modern Usage',
  'basketball-switching-defense',
  '<h2>What is a switching defense?</h2>
<p>In a switching defense, when an opposing player sets a screen, the two defenders simply switch their assignments — each takes whoever comes to their area — rather than fighting through the screen. The result: no defensive confusion, no gaps, no delayed recoveries. Switching eliminates many of the problems that screens cause for man-to-man defense.</p>

<h2>Why switching became dominant</h2>
<p>The three-point revolution and pace-and-space offence made screening actions more dangerous than ever. When a center sets a screen for a guard, traditional "hedge and recover" defence requires the big defender to jump out and slow the ball-handler while their own centre-counterpart sprints back into position. This takes time, and against quick ball-handlers and shooters, that time creates open threes.</p>
<p>A switching team eliminates that problem entirely — the guard takes whoever comes off the screen, and the big man picks up the screener. No confusion, no gap. Teams like the Golden State Warriors, Boston Celtics, and Miami Heat have built dominant defences around switching principles.</p>

<h2>The trade-offs</h2>
<p>Switching creates its own vulnerabilities:</p>
<ul>
<li><strong>Size mismatches</strong> — if a center ends up defending a guard in open space, or a guard is asked to defend a center near the basket, the mismatch favours the offence. Switching teams must accept some mismatches or have players who are versatile enough to defend multiple positions adequately.</li>
<li><strong>Mismatch hunting</strong> — smart offensive teams deliberately engineer matchups through screening sequences. A team that knows you switch will run actions designed to create the most favourable mismatch possible and then exploit it immediately.</li>
</ul>

<h2>What makes switching viable</h2>
<p>Switching only works when all five defenders can guard their switching assignments without being destroyed. This requires physically versatile players — typically those who are neither too slow to guard the perimeter nor too small to defend the post. The "3-and-D" player archetype (a wing who can shoot and defend multiple positions) is enormously valuable in switching systems precisely because they can switch onto guards or forwards without creating an obvious mismatch.</p>

<h2>Analytics and switching</h2>
<p>Teams now track exactly which switching matchups their opponents create and whether those matchups are being exploited. A defensive switching scheme that creates mismatches being used for 35% of possessions but holding those to below-average efficiency is working. One creating mismatches that score at well above average efficiency needs adjustment — either the switching principle is wrong for that team, or specific players are misidentified as capable switchers.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-defensive-schemes' and cat.slug = 'basketball-strategy';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Help Defense, Rotations, and Communication',
  'basketball-help-defense',
  '<h2>Defense is five players, not one-on-one five times</h2>
<p>The most common misconception about basketball defense is that it is simply five separate one-on-one battles. In reality, great defense is a coordinated system where every player is simultaneously guarding their direct opponent AND positioned to help if a teammate is beaten. Help defense — the art of rotating to cover for beaten teammates — is what separates good teams from great ones.</p>

<h2>The help position</h2>
<p>When your assigned player does not have the ball, you don''t stand next to them — you "help" by positioning yourself where you can see both your player and the ball, and can react to help your teammate if necessary. The standard help position is on the "weak side" of the court — the side away from the ball — standing roughly in the paint or at the edge of it, ready to step up if the ball-handler drives.</p>

<h2>Rotations: the chain reaction of help defense</h2>
<p>When one defender leaves their player to help, they create an open opponent. Another defender must rotate to cover that player. This chain reaction — called "rotations" — is what makes defense complex and communication essential. A single defensive breakdown at one link in the chain leaves someone open:</p>
<ol>
<li>Guard is beaten off the dribble driving right</li>
<li>Center helps to stop the drive at the rim</li>
<li>The center''s player is now open for an alley-oop or dump-off pass</li>
<li>A wing must rotate to cover the center''s player</li>
<li>That wing''s player is now open in the corner</li>
<li>Another player must rotate to contest the corner three</li>
</ol>
<p>Against great offensive teams, executing all of these rotations correctly in half a second is the difference between a contested shot and an open three.</p>

<h2>Communication: the most underrated defensive skill</h2>
<p>Defensive communication — calling out screens, ball-handler location, switching assignments, and rotation responsibilities — prevents the confusion that creates open shots. Watch championship-level defense and you will see five players constantly talking to each other. Teams that go quiet on defense — where individuals are left to figure out their assignments alone — are teams that give up open looks at the worst moments.</p>

<h2>Why help defense shows up in analytics</h2>
<p>Defensive Rating (points allowed per 100 possessions) is the cleanest summary measure of team defense. Teams with excellent help defense systems hold opponents to below-average efficiency even against creative offensive teams. When a team''s Defensive Rating improves significantly after adding a new player, it is often not because that player is defending brilliantly one-on-one — it is because their presence, communication, and positioning elevate the defensive coordination of everyone around them.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-defensive-schemes' and cat.slug = 'basketball-strategy';


-- ══════════════════════════════════════════════════════════════
-- READING THE BOX SCORE — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Assists and Turnovers: Ball Movement Quality and Decision-Making',
  'basketball-assists-turnovers',
  '<h2>Assists: the currency of ball movement</h2>
<p>An assist is credited when a player makes a pass that directly leads to a made basket, with the receiver taking no more than one or two dribbles before scoring. Assists measure a player''s ability to create scoring opportunities for teammates — and they are one of the most team-dependent statistics in basketball.</p>

<h2>What assist numbers actually reflect</h2>
<p>A player''s assist total depends heavily on context:</p>
<ul>
<li><strong>The team''s offensive system</strong> — a point guard in a pass-heavy, motion-based offence will accumulate more assists than one playing in an isolation-heavy system, regardless of comparable playmaking ability</li>
<li><strong>The quality of teammates</strong> — good shooters who make the catches their playmaker creates convert a higher percentage of the opportunities into assists</li>
<li><strong>Role within the offence</strong> — players who primarily function as off-ball cutters and shooters won''t accumulate assists even if they are valuable offensive players</li>
</ul>

<h2>Assist-to-Turnover ratio: context matters</h2>
<p>A player who averages 10 assists per game but also 5 turnovers per game is less efficient than one who averages 7 assists and 2 turnovers. The assist-to-turnover ratio (AST/TO) provides context: a ratio above 3:1 is generally considered excellent; below 2:1 suggests careless ball-handling relative to creation. NBA averages sit around 2.5:1 for playmakers.</p>

<h2>Turnovers: the most costly box score event</h2>
<p>Turnovers are among the most damaging events in basketball because they are not just missed shots — they are surrendered possessions. A missed shot gives the opponent one possession; a turnover gives them one possession immediately without even requiring them to make a defensive play. Modern analytics estimates that each turnover costs a team approximately 1 point relative to a completed possession.</p>
<p>High-usage offensive players (those who handle the ball a lot) will naturally accumulate more turnovers than low-usage players. Turnover rate (turnovers per 100 possession chances) normalises for usage and provides a fairer comparison. A star player averaging 4 turnovers per game on 30 usage is often less problematic than a role player averaging 3 turnovers on 15 usage.</p>

<h2>Potential assists and hockey assists</h2>
<p>Advanced tracking now captures "potential assists" — passes that would have been assists had the receiver made the shot — and "hockey assists" — the pass before the assist. These metrics separate a playmaker''s creation quality from their teammates'' conversion rate, giving a clearer picture of true playmaking value independent of shooter efficiency.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'reading-the-box-score' and cat.slug = 'basketball-analytics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Steals, Blocks, and the Limits of Defensive Box Score Stats',
  'basketball-defensive-stats',
  '<h2>What defensive box score stats capture — and what they miss</h2>
<p>The standard box score defensive statistics — steals and blocks — measure only the most visible and dramatic defensive events. They completely ignore the vast majority of defensive actions that make a player great: correct positioning, on-ball contest quality, help rotations, communication, and deterrence. Understanding both what these stats show and what they miss is essential for accurate player evaluation.</p>

<h2>Steals: high-risk, high-reward gambling</h2>
<p>A steal is recorded when a defensive player takes the ball from an opponent, forcing a turnover. Steal leaders tend to be quick, anticipatory defenders who gamble on deflections and passing lanes — players like Chris Paul, Gary Payton, or Kawhi Leonard. High steal totals reflect excellent defensive instincts and hand speed.</p>
<p>But steals come with a cost: players who gamble for steals frequently are also players who get beat when the gamble fails, leaving their teammates exposed. A player who averages 3 steals per game but gambles on 8 attempts — giving up significant advantages on the failed attempts — may be a net-negative defender. Steals alone cannot answer this question.</p>

<h2>Blocks: impact deterrence</h2>
<p>Blocks measure explicit shot-altering — physically rejecting a shot attempt. Elite shot-blockers (Rudy Gobert, Anthony Davis, Myles Turner) deter opponents from attacking the rim even when they don''t actually block the shot, because the threat of rejection changes offensive decision-making. This deterrence effect — known as "ghost blocks" in some analytics circles — is real and significant, but entirely invisible in the box score.</p>
<p>A center who averages 1 block per game but deters 4 other rim attempts per game has a far larger defensive impact than a player who actually blocks 2 per game but shows no deterrence effect. Tracking data can now capture contested shots near the rim as a proxy for deterrence quality.</p>

<h2>What the box score cannot measure at all</h2>
<ul>
<li><strong>Positioning</strong> — being in the right place eliminates the need for dramatic recovery plays</li>
<li><strong>Communication</strong> — calling out screens, rotations, and assignments</li>
<li><strong>Shot quality against</strong> — a defender who forces difficult mid-range shots is more valuable than one who contests open threes poorly</li>
<li><strong>Defensive rebounding</strong> — technically captured as rebounds, but defensive rebounding position and effort are not visible</li>
</ul>
<p>This is why Defensive Rating, Defensive Real Plus/Minus, and similar metrics exist — to capture total defensive impact beyond what the box score can show. Always pair standard defensive stats with context from advanced metrics.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'reading-the-box-score' and cat.slug = 'basketball-analytics';


-- ══════════════════════════════════════════════════════════════
-- ADVANCED EFFICIENCY METRICS — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Player Efficiency Rating (PER): What It Measures and Where It Falls Short',
  'basketball-per-metric',
  '<h2>What is PER?</h2>
<p>Player Efficiency Rating (PER) was developed by basketball statistician John Hollinger and popularised in the early 2000s. It attempts to summarise a player''s complete statistical contribution in a single number, normalised to a league average of 15. A PER of 20 is very good; a PER of 25 is elite; a PER of 30 or above is all-time historical territory.</p>

<h2>What PER measures</h2>
<p>PER combines positive contributions (points, rebounds, assists, steals, blocks) with negative ones (turnovers, missed shots) using a formula that weights each event by an estimated value. It also adjusts for pace — ensuring that a player on a fast-paced team is not unfairly rewarded compared to one on a slow team — and for playing time.</p>

<h2>PER''s genuine value</h2>
<p>For high-level screening of player productivity, PER is useful. It clearly distinguishes elite players (30 PER) from average starters (15 PER) from fringe roster players (8-10 PER). For quickly assessing whether a player is performing at a high level in raw statistical terms, it is a reasonable starting point.</p>

<h2>Where PER falls short</h2>
<p>PER has significant and well-documented weaknesses that the analytics community has largely moved past:</p>
<ul>
<li><strong>Defence is poorly captured</strong> — blocks and steals are the only defensive inputs. The entire quality of a player''s defensive positioning, communication, and help rotations is invisible in PER.</li>
<li><strong>No context for shot quality</strong> — PER does not distinguish between a player who creates open threes for teammates and one who forces contested mid-range shots at the same frequency.</li>
<li><strong>Team context ignored</strong> — a player on a great team benefits from better spacing, better screening, and more open shots. PER does not control for team quality.</li>
<li><strong>Heavily skewed toward high-volume players</strong> — since PER is based on counting stats, players who take more shots, make more passes, and appear more in the box score naturally accumulate higher PER even at the same efficiency level.</li>
</ul>

<h2>What to use instead</h2>
<p>Modern basketball analytics has largely replaced PER with impact-based metrics — Real Plus-Minus (RPM), BPM (Box Plus/Minus), RAPTOR, and LEBRON — that attempt to measure a player''s total impact on team performance rather than just their individual statistical contributions. These are not perfect either, but they capture defensive impact, lineup context, and opponent quality in ways PER cannot.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-advanced-metrics' and cat.slug = 'basketball-analytics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'On/Off Splits: Measuring a Player''s True Lineup Impact',
  'basketball-on-off-splits',
  '<h2>What are on/off splits?</h2>
<p>On/off splits measure how a team performs when a specific player is on the court versus off it. The core question: does the team score more, defend better, and win more often with this player playing than without them? This approach captures impact that individual statistics cannot — the teammate elevation, defensive organisation, and spacing effects that a player creates without ever touching the box score.</p>

<h2>Reading on/off data</h2>
<p>On/off data is typically presented as Net Rating — points scored per 100 possessions minus points allowed per 100 possessions. If a team has a Net Rating of +8 with Player X on the court and -3 with Player X off the court, that is an 11-point swing — Player X is clearly enormously impactful even if their raw statistics are modest.</p>
<p>This is how players like Draymond Green at Golden State became analytically celebrated despite relatively modest scoring averages. When Draymond was on the court, the Warriors'' defensive and offensive organisation was dramatically better. When he was off it — often due to foul trouble — the team''s performance declined significantly. On/off splits made this visible when traditional stats could not.</p>

<h2>The problem: sample size and lineup quality</h2>
<p>On/off splits are heavily influenced by who a player shares the court with. A reserve player who only plays with the starters will have great on-court numbers because their teammates are excellent. A starter who plays many minutes with weak bench lineups will have worse off-court numbers than their actual impact warrants.</p>
<p>True on/off analysis requires large samples (multiple thousands of minutes) and statistical adjustments for the quality of teammates and opponents faced. Single-season on/off splits can be dominated by noise and should be treated cautiously. Multi-year averages and adjusted plus/minus metrics (which control for teammates and opponents simultaneously) are more reliable.</p>

<h2>Practical use for analysis</h2>
<p>On/off splits are most useful for answering specific questions: Does this team''s defence collapse without its defensive anchor? Does this team''s offence improve dramatically when the ball-handler rests? When a player is injured, what on/off data exists that suggests how much impact their absence will have? Used as contextual evidence alongside other metrics, on/off splits are among the most informative tools available for understanding player value beyond the counting statistics.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'basketball-advanced-metrics' and cat.slug = 'basketball-analytics';


-- ══════════════════════════════════════════════════════════════
-- TENNIS — SERVE AND RETURN STRATEGY — additional lessons
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Return of Serve: Tennis''s Most Underrated Shot',
  'tennis-return-of-serve',
  '<h2>The return: where matches are actually won and lost</h2>
<p>The serve dominates tennis commentary. First serve percentage, aces, double faults — these are the statistics that fill broadcast discussions. But the return of serve is equally determinative of match outcomes, and it receives far less analytical attention. A player who cannot return effectively will lose regardless of how well they play in baseline rallies, because they will rarely get to play those rallies at all.</p>

<h2>What makes a great return</h2>
<p>An elite return of serve requires a unique combination of skills that differ meaningfully from the rest of tennis:</p>
<ul>
<li><strong>Reaction time</strong> — on a 220 km/h first serve, the returner has less than 0.5 seconds from ball release to ball contact. There is almost no conscious decision-making available. The return is largely reflexive, relying on pattern recognition built through thousands of repetitions.</li>
<li><strong>Positioning reads</strong> — experienced returners read the server''s body position, toss location, and racquet angle to anticipate direction before the ball is struck. Moving half a step in the right direction before contact transforms an unreturnable serve into a manageable one.</li>
<li><strong>Simplification under pressure</strong> — the best returners do not try to do too much. A consistent, deep return that starts a rally is often more valuable than an attempted winner that goes into the net.</li>
</ul>

<h2>Return metrics and what they reveal</h2>
<p>Return games won (the percentage of games won when the player is receiving) is one of the cleanest summary statistics in tennis. The best returners in the history of the game — Novak Djokovic, Andre Agassi, Andy Murray — consistently win 40-45% or more of return games even against elite servers. Average professional returners win around 30-35% of return games. The difference determines whether a match is competitive or comfortable.</p>

<h2>How returners adapt to different serve styles</h2>
<p>Against a flat power server, the returner prioritises compact swing, early preparation, and neutralising rather than attacking the return. Against a heavy kick server, the returner must move forward to take the ball before it rises to an uncomfortable height, or step back and absorb the bounce. Against a slice server, the ball stays low and can skid — requiring a different contact point entirely. The best returners adapt their technique across all three serve types within a single match, sometimes within a single service game.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-serve-return-strategy' and cat.slug = 'tennis-tactics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Patterns of Play: Reading and Exploiting Tendencies',
  'tennis-patterns-of-play',
  '<h2>Tennis as a chess match of patterns</h2>
<p>At the professional level, tennis is not a game of random shot selection. Players build patterns — sequences of shots designed to create a specific opening — and they repeat those patterns because the best patterns work. Equally, every player has tendencies under pressure: a preferred direction on a big second serve, a reflexive crosscourt forehand when pushed wide. The ability to identify and exploit these tendencies is what separates good tactical players from great ones.</p>

<h2>Common tactical patterns</h2>
<ul>
<li><strong>Serve wide, attack the open court</strong> — serving wide to the deuce side pulls the returner off the court; the server then hits behind them into the vacated space. Simple but effective, especially on fast surfaces where the wide serve creates more angle.</li>
<li><strong>Body serve into the backhand</strong> — jamming the returner with a serve directed at their body is more difficult to redirect with power. It generates a weak return that sets up an aggressive second shot.</li>
<li><strong>Open up the backhand, attack with the forehand</strong> — many players'' backhands are weaker under pressure. Build the point by pushing them repeatedly to the backhand until a short ball appears, then attack with the forehand.</li>
<li><strong>The short ball trap</strong> — deliberately playing a slightly short ball to invite the opponent to the net, then passing them. Against net-comfortable opponents, this pattern is reversed: approach behind an aggressive approach shot.</li>
</ul>

<h2>Pressure and pattern breakdown</h2>
<p>Patterns become most visible — and most exploitable — under pressure. A player who hits 70% of their second serves to the backhand in regular rallies may hit 90% there on break points, because they revert to their most trusted shot when the stakes rise. Experienced opponents notice this and shift position accordingly. This is why match statistics on directional tendencies, broken down by high-pressure situations versus neutral ones, are genuinely useful analytical tools rather than aesthetic curiosities.</p>

<h2>Tactical adjustment between sets</h2>
<p>The best tactical players adapt between sets. If a pattern is working — the opponent''s crosscourt backhand is consistently breaking down — they continue. If a pattern is failing — the opponent is reading the serve direction and attacking the return — they change. The ability to diagnose what is and is not working, and adapt without being asked, is one of the markers of elite tennis intelligence. Players who rigidly persist with a failing game plan out of stubbornness are giving up free points.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-serve-return-strategy' and cat.slug = 'tennis-tactics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Net Play and the Serve-and-Volley Tactic',
  'tennis-net-play-serve-volley',
  '<h2>Attacking the net: a different dimension</h2>
<p>Modern baseline tennis dominates the professional game, but net play remains a potent weapon — and a strategically important variation. Players who can threaten the net force opponents to change their patterns, increase the pace of their passing shots, and attempt lower-percentage lobs. Even the threat of net approach changes how an opponent plays the entire match.</p>

<h2>The serve-and-volley tactic</h2>
<p>Serve-and-volley means serving, then immediately sprinting forward to the net to volley the return before it lands. This tactic removes time from the returner — they must make a passing shot or lob decision immediately under pressure, rather than setting up in a comfortable rally. It was dominant in the 1970s and 1980s (John McEnroe, Stefan Edberg, Pete Sampras) but declined as slower surfaces, heavier strings, and more physical baseline players made it less effective.</p>
<p>On grass — Wimbledon especially — serve-and-volley remains viable because the low, fast bounce makes it genuinely difficult to thread a passing shot at pace. On clay, the higher bounce and slower pace give returners time to set up, making serve-and-volley significantly riskier.</p>

<h2>Approach shots and net approach</h2>
<p>More common in the modern game is the "approach shot" — when a short ball presents itself in a rally, the player attacks it deep into a corner and follows it to the net. The logic: a well-struck approach shot pushed deep to the backhand corner creates a very difficult pass for the opponent. The attacker need only be in reasonable volleying position to finish the point.</p>
<p>The approach shot direction is critical: typically into the open court or behind the opponent as they try to recover. An approach shot that allows the opponent to easily run around and hit an inside-out forehand is an approach shot that will be punished.</p>

<h2>The impact on match dynamics</h2>
<p>Players who mix net approaches into predominantly baseline games create tactical discomfort. The opponent must now simultaneously defend against both deep baseline shots and sudden net rushes — two completely different patterns requiring different positioning and responses. This versatility is one reason all-court players (Roger Federer, Stefan Edberg) have historically performed above expectation on multiple surfaces, even those not perfectly suited to their baseline game.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-serve-return-strategy' and cat.slug = 'tennis-tactics';


-- ══════════════════════════════════════════════════════════════
-- TENNIS MENTAL GAME — new course under Tennis Tactics
-- ══════════════════════════════════════════════════════════════

insert into public.courses (category_id, title, slug, description, level, is_published, sort_order)
select id, 'The Mental Game in Tennis', 'tennis-mental-game',
  'How psychology, pressure management, and momentum shape tennis outcomes at every level of the game.',
  'intermediate', true, 3
from public.course_categories where slug = 'tennis-tactics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Momentum, Pressure Points, and Why Tennis Scores Are Not Linear',
  'tennis-momentum-pressure',
  '<h2>Why tennis scoring creates drama</h2>
<p>Tennis has a unique scoring structure that makes it psychologically unlike almost any other sport. In football, one goal represents one unit of scoring. In basketball, one basket represents two or three points. In tennis, one point at 40-40 (deuce) in a fifth-set tiebreak is worth the entire match, while one point at 0-0 in the first game is worth essentially nothing. This asymmetry makes tennis extraordinarily sensitive to momentum swings and pressure at key moments.</p>

<h2>Break points: the pivotal currency</h2>
<p>A break point is any point where the returner can win the service game — converting it means gaining a game advantage. Research consistently shows that break point conversion rates are among the most predictive statistics in tennis. A player who converts break points at 45% versus one who converts at 30% will win dramatically more matches even with identical underlying shot quality, because they capitalise on opportunities more efficiently under the specific pressure of a break point.</p>

<h2>The momentum debate</h2>
<p>Sports psychology research on momentum is genuinely contested. The classic "hot hand" fallacy literature suggests that consecutive success is not predictive of future success — each point is statistically near-independent. However, tennis creates psychological conditions that may make momentum more real than in purely physical, reaction-based sports:</p>
<ul>
<li>Unforced errors increase under sustained pressure</li>
<li>Decision-making becomes more conservative as players protect leads</li>
<li>Crowd energy at important moments influences both players differently</li>
<li>Body language and visible confidence (or lack of it) affect opponent risk-taking</li>
</ul>

<h2>The "7-6 in the third" pattern</h2>
<p>Data shows that players who win a close tiebreak often perform better in the following set — not because the tiebreak gave them information about who is better, but because winning a coin-flip-close set provides a psychological boost that measurably improves subsequent performance. The player who lost the tiebreak faces both a score deficit and a psychological burden. This is one of the clearest observed momentum effects in professional tennis data.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-mental-game' and cat.slug = 'tennis-tactics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Handling Pressure: Clutch Performance and Choking in Tennis',
  'tennis-clutch-performance',
  '<h2>Why some players perform better under pressure</h2>
<p>Pressure in tennis is specific and measurable. The same player who hits clean winners at 30-0 may double fault at 30-40 on a big second serve. This is not a mystery of character — it reflects well-understood psychological and physiological mechanisms that affect skilled performance under high-stakes conditions.</p>

<h2>What happens physiologically under pressure</h2>
<p>When the stakes rise — a match point, a break point, a deciding set — the body''s stress response activates. Cortisol and adrenaline rise. Heart rate increases. Muscle tension increases. These responses were evolutionarily useful for physical threats but are counterproductive for fine motor skills like tennis strokes. Increased muscle tension makes the smooth, fluid mechanics of a tennis stroke harder to execute. This is why double fault rates and unforced error rates reliably increase on high-pressure points across professional tennis.</p>

<h2>"Choking" versus "normal pressure decline"</h2>
<p>All players perform slightly worse under the highest-pressure points — even the greatest. The question is by how much. A player who maintains 90% of their normal performance level under extreme pressure is performing excellently. A player who drops to 60% of their normal level under the same pressure is choking — the pressure is meaningfully overwhelming their ability to execute.</p>
<p>Players historically identified as "clutch" (Novak Djokovic, Rafael Nadal, Serena Williams) maintain performance levels under pressure that are statistically exceptional. Players identified as "poor under pressure" show measurably larger performance gaps between neutral and high-pressure points. This is a genuine skill difference, not simply narrative bias.</p>

<h2>What "mental toughness" actually consists of</h2>
<p>Tennis''s mental demands are trainable, not fixed. The psychological skills that underpin clutch performance include:</p>
<ul>
<li><strong>Process focus</strong> — thinking about the next shot, not the consequences of winning or losing</li>
<li><strong>Physiological regulation</strong> — controlling breathing between points, using pre-serve routines to regulate arousal</li>
<li><strong>Attitude to errors</strong> — elite players reset after errors rather than ruminating; the point is over, the next one is separate</li>
<li><strong>Acceptance of uncertainty</strong> — pressure is reduced when the outcome is accepted as uncertain rather than treated as a catastrophe</li>
</ul>
<p>When you watch a match closely, the between-point behaviour — how a player bounces the ball before serving, whether they make eye contact with the crowd, whether they talk to themselves after errors — gives you genuine information about their psychological state.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'tennis-mental-game' and cat.slug = 'tennis-tactics';
