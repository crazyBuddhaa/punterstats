-- ============================================================
-- PunterStat — Football Sports University Expansion
-- Fills all empty/thin football courses with full lesson content.
-- Run after 024_add_expert_level.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- POSITIONS & ROLES (5 lessons)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Goalkeeper: Last Line and First Attacker',
  'goalkeeper-role',
  '<h2>The most specialised position in football</h2>
<p>The goalkeeper is the only outfield player permitted to use their hands — but only within their own penalty area. That single rule defines everything about the position. Goalkeepers operate in a different psychological and physical space to every other player on the pitch.</p>

<h2>Core responsibilities</h2>
<ul>
<li><strong>Shot-stopping</strong> — the obvious duty, but modern goalkeepers are evaluated on far more than raw saves. Expected Goals on Target (xGOT) measures how difficult the shots they face actually were.</li>
<li><strong>Command of the box</strong> — coming for crosses, punching or catching at the right moment. A goalkeeper who hesitates invites chaos into their own penalty area.</li>
<li><strong>Sweeping behind the defensive line</strong> — modern "sweeper-keepers" like Alisson and Ederson position themselves high, acting as an extra defender against balls played in behind.</li>
<li><strong>Distribution</strong> — initiating attacks through short passes, long balls, or throwing to trigger pressing traps. Some teams build entire defensive structures around a goalkeeper who can pass accurately to a wide centre-back under pressure.</li>
</ul>

<h2>The modern goalkeeper</h2>
<p>The position has transformed dramatically. In the 1980s, a goalkeeper who could throw accurately to a full-back was considered technically sophisticated. Today, top clubs demand goalkeepers who can play as an extra pass option in build-up, split the press with a driven ball to a striker''s feet, and make decisions with the composure of a midfielder.</p>
<p>When you watch a match, track the goalkeeper between shots. How high do they position? Do they come for crosses aggressively or stay on the line? Do they play short or long? These decisions reveal the entire team''s defensive philosophy.</p>

<h2>What goalkeepers can tell you analytically</h2>
<p>A goalkeeper who concedes fewer goals than expected (measured by Goals Allowed vs xGA) is either facing easier shots than the average team, or genuinely saving at an elite level. Over a large sample, this distinction becomes clearer. Single-season save percentages are notoriously unstable — treat them as a starting point, not a conclusion.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'positions-and-roles' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Centre-Backs: Reading the Game and Organising Defensively',
  'centre-backs-role',
  '<h2>The last outfield line of defence</h2>
<p>Centre-backs are the players most responsible for preventing goals. They typically operate in pairs (in a four-at-the-back system) or as a trio (in three-at-the-back systems). Their primary job is simple to state and difficult to execute: stop the opposition from scoring.</p>

<h2>Physical and cognitive demands</h2>
<p>The best centre-backs combine physical presence with exceptional reading of the game. Pace matters, but anticipation matters more. A centre-back who reads where the ball is going before it arrives will always outperform a faster but slower-thinking defender.</p>
<ul>
<li><strong>Aerial duels</strong> — winning headers at both ends of the pitch. Set pieces produce roughly 25-30% of all goals; centre-backs are central to defending them.</li>
<li><strong>Positioning</strong> — holding the defensive line, compressing space, and timing when to step out to press versus when to hold.</li>
<li><strong>Organisation</strong> — directing the defensive unit. Communication is a technical skill at this position. The best centre-backs are essentially on-pitch managers.</li>
<li><strong>Ball-playing ability</strong> — increasingly valuable. Possession-based systems require centre-backs who can receive under pressure, switch play, and drive forward with the ball when space allows.</li>
</ul>

<h2>The two-centre-back partnership</h2>
<p>In a 4-3-3 or 4-2-3-1, the two centre-backs divide responsibilities. Typically one is more aggressive (the "ball-winner") and one is more composed in possession (the "sweeper"). This complementary pairing — like Piqué and Puyol at Barcelona, or Kompany and Otamendi at Manchester City — creates a unit stronger than either player individually.</p>

<h2>What to watch for analytically</h2>
<p>Track how often a centre-back is caught out of position by balls played in behind. Is the defensive line too high? Too passive? How do they handle one-vs-one situations when the winger isolates them? Centre-back quality often shows up most clearly in high-pressure situations, not comfortable ones.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'positions-and-roles' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Full-Backs and Wing-Backs: The Evolution of a Position',
  'full-backs-wing-backs-role',
  '<h2>From defensive specialist to attacking weapon</h2>
<p>No position in football has changed more dramatically over the past thirty years than the full-back. In the 1990s, a full-back''s job was primarily defensive: stop the winger, stay in your lane. Today''s full-backs are expected to be essentially wide midfielders who can also defend.</p>

<h2>Traditional full-backs (in a back four)</h2>
<p>In systems that use a flat back four (4-3-3, 4-2-3-1, 4-4-2), full-backs operate on the left and right flanks of the defensive line. When the team has the ball, they push forward to provide width. When defending, they drop back and form the four-person defensive unit.</p>
<p>The key tension: how far forward should a full-back push? Go too high and you leave space in behind. Stay too deep and you fail to stretch the opposition or support attacks. The best full-backs read this balance instinctively.</p>

<h2>Wing-backs (in a back three)</h2>
<p>In 3-5-2 or 3-4-3 systems, wing-backs are the wide players in a five-person midfield line. Their remit is explicitly more attacking — they are the width of the team. When defending, they drop into a back five. When attacking, they function as wingers or wide midfielders.</p>
<p>Wing-backs need significantly more running capacity and attacking quality than traditional full-backs. The role requires players who can cross, run in behind, drive forward with the ball, AND track back across 30 metres to defend. Teams like Antonio Conte''s Chelsea used wing-backs who contributed regularly in terms of goal contributions while covering enormous distances per match.</p>

<h2>The "inverted full-back" concept</h2>
<p>Pep Guardiola''s Manchester City popularised a different idea: the inverted full-back. Instead of overlapping wide, players like João Cancelo moved inside into central midfield positions during build-up. This creates a numerical advantage in the middle of the pitch and allows wide forwards to occupy the flanks without interference. It is a more complex system that requires high footballing intelligence from the full-back.</p>

<h2>Analytical relevance</h2>
<p>Full-backs who regularly contribute crosses, key passes, and goal involvements in the final third are adding significant value. But always cross-reference with the defensive side — a full-back who contributes three assists but concedes two goals through the space they vacate may be net-negative. Evaluate both phases.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'positions-and-roles' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Central Midfield Roles: Destroyer, Playmaker, and Box-to-Box',
  'central-midfield-roles',
  '<h2>The engine room of any team</h2>
<p>Central midfielders are the most diverse positional group in football. The same positional label covers players with entirely different skill sets: the defensive midfielder who breaks up play, the deep-lying playmaker who dictates tempo from behind, the attacking midfielder who operates between the lines, and the box-to-box midfielder who covers the entire pitch in both directions.</p>

<h2>The defensive midfielder (DM / "6")</h2>
<p>The defensive midfielder sits in front of the back four or back three and acts as a shield. Their job is to intercept, tackle, press, and screen the defence from opposition attacks. They rarely get into the final third. Elite defensive midfielders — Casemiro, Rodri, Fabinho — are often undervalued publicly because their contributions don''t show in the goals column, but their absence is immediately felt. Teams concede significantly more when their defensive midfielder is injured.</p>

<h2>The deep-lying playmaker ("regista")</h2>
<p>Made famous by players like Andrea Pirlo and Xabi Alonso, the regista operates in deep midfield but controls the tempo of play through passing. Rather than pressing aggressively, they receive the ball and distribute it quickly, switching play or finding runners. They tend to have excellent passing range and footballing intelligence, but may be a defensive liability if exposed by a press.</p>

<h2>The box-to-box midfielder ("8")</h2>
<p>The most physically demanding midfield role. Box-to-box midfielders contribute in both penalty areas — tracking back to defend, pressing high, arriving late into the box to score, and providing a link between defence and attack. Players like Steven Gerrard, Frank Lampard, and Paul Pogba defined this role. They require both technical ability and exceptional running capacity.</p>

<h2>The attacking midfielder / "10"</h2>
<p>The number 10 traditionally operates between the opposition''s midfield and defensive lines — in the space that is hardest to defend. Their job is to receive the ball on the half-turn and create chances for strikers. In possession-based systems, this is one of the most technically demanding positions on the pitch: tight spaces, constant pressure, and split-second decision-making.</p>

<h2>Why this matters for analysis</h2>
<p>When evaluating a team''s midfield, identify which types of midfielder they are deploying and whether there is balance. A team with three attacking midfielders but no defensive protection will be exposed by teams who press high. A team with two defensive midfielders may be too conservative to create enough chances. The balance of the midfield unit is a primary driver of how a team performs across a season.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'positions-and-roles' and cat.slug = 'football-fundamentals';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Attackers: Strikers, Wingers, and the False Nine',
  'attacker-roles',
  '<h2>The players who make the difference at the top end</h2>
<p>Attacking positions in football span a wide range of functions. A traditional centre-forward, a wide winger, and a false nine all carry the label "attacker" but play completely different roles within a team''s system.</p>

<h2>The centre-forward / striker ("9")</h2>
<p>The traditional striker''s primary job is to score goals — to get into scoring positions in the penalty area and convert chances. Elite goal scorers like Erling Haaland or Robert Lewandowski are evaluated almost entirely on their penalty-box presence, finishing, and the quality of chances they generate (xG).</p>
<p>Some strikers are "target men" — physically strong players who hold up the ball, bring teammates into play, and win aerial duels. Others are pure movement strikers, making intelligent runs to exploit defensive lines without necessarily receiving the ball to feet.</p>

<h2>The false nine</h2>
<p>The false nine is a striker who drops deep into midfield to receive the ball, dragging centre-backs out of position and creating space for wide forwards to run in behind. Lionel Messi''s role at Pep Guardiola''s Barcelona perfected this concept. The confusion it creates defensively — does the centre-back follow the striker into midfield and leave a gap, or hold their position and let the striker receive freely? — is extremely difficult to resolve.</p>

<h2>Wingers</h2>
<p>Wide forwards can be broadly split into two types:</p>
<ul>
<li><strong>Traditional wingers</strong> — stay wide, beat their full-back with pace or dribbling, deliver crosses into the box.</li>
<li><strong>Inverted wingers</strong> — play on the opposite flank to their stronger foot. A right-footed player on the left cuts inside onto their stronger foot to shoot or pass. This creates goal threat (Arjen Robben, Mohamed Salah, Leroy Sané) but requires other players to cover the vacated space wide.</li>
</ul>

<h2>How attacking roles shape team structures</h2>
<p>The type of striker a team uses determines how the rest of the team sets up. A physical target man requires players who can deliver accurate crosses or long balls. A false nine requires midfielders willing to make late runs beyond them. A press-reliant striker (like Firmino at Liverpool) requires teammates who can capitalise on turnovers won high up the pitch.</p>
<p>When analysing a team''s attack, always ask: what does this striker need from the players around them, and is the team built to provide it?</p>',
  5, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'positions-and-roles' and cat.slug = 'football-fundamentals';


-- ══════════════════════════════════════════════════════════════
-- UNDERSTANDING FORMATIONS — additional lessons (3 more after existing 2)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The 4-4-2: Defensive Solidity and Midfield Width',
  'the-4-4-2-formation',
  '<h2>Football''s most recognisable formation</h2>
<p>The 4-4-2 dominated European and world football from the 1970s through to the mid-2000s. Two strikers, four midfielders in a flat line, four defenders. Its appeal was clarity: every player knew their defensive and offensive responsibilities. Its decline came as opponents discovered how to exploit the gaps it creates in central midfield.</p>

<h2>How the 4-4-2 works</h2>
<p>The two strikers press high and work as a unit — one drops deep to link play while the other attacks the box, or they work in tandem pressing centre-backs to force errors. The flat midfield four creates a bank of four that blocks through-balls and covers wide areas, but leaves the two central midfielders defending a large space if the opposition can play between the lines.</p>
<p>The wide midfielders in a 4-4-2 must do enormous work in both directions: supporting attacks down the flanks, delivering crosses, then tracking back to defend. The physical demands are significant.</p>

<h2>Strengths</h2>
<ul>
<li><strong>Two strikers create constant aerial and pressing threat</strong></li>
<li><strong>Compact defensive structure</strong> — difficult to break down when the team sits in two solid banks of four</li>
<li><strong>Wide midfielders provide natural width</strong> in attack without a specialist winger</li>
<li><strong>Simple to understand and organise</strong> — useful for teams that prioritise defensive organisation</li>
</ul>

<h2>Weaknesses</h2>
<ul>
<li><strong>Vulnerable in the "half-spaces"</strong> — the areas between the central and wide midfielders. Number 10s who operate in these spaces can hurt a flat 4-4-2.</li>
<li><strong>Central midfield overloaded</strong> — a 4-3-3 pressing high can isolate the two central midfielders with three of their own, giving the opposition numerical advantage in the middle.</li>
<li><strong>Wide midfielders exposed defensively</strong> — when they push forward, they leave their full-back exposed against a wide attacker.</li>
</ul>

<h2>Who still uses it</h2>
<p>The flat 4-4-2 is less common at the elite level than it was, but it remains widely used at lower professional and semi-professional levels where defensive organisation matters more than tactical complexity. It resurfaces at the highest level as an out-of-possession shape — teams that use a 4-2-3-1 in possession often collapse into a defensive 4-4-2 when the opposition has the ball.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'understanding-formations' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The 4-2-3-1: The Double Pivot and Controlling Games',
  'the-4-2-3-1-formation',
  '<h2>The formation that defined the 2000s and 2010s</h2>
<p>The 4-2-3-1 became the dominant formation in international football and at the highest club level for roughly fifteen years. It solved the central midfield problem that plagued the flat 4-4-2 by introducing two defensive midfielders — a "double pivot" — who could cover the space, press together, and support attacks without leaving the team exposed.</p>

<h2>How it works</h2>
<p>The structure: goalkeeper, four defenders, two defensive midfielders (the "6" and another "6" or a box-to-box player), one attacking midfielder in the "10" role, two wide players (either wingers or wide attacking midfielders), and a single striker at the top. In attack, the double pivot allows the attacking midfielder and wide players to push high with defensive cover guaranteed underneath.</p>

<h2>The double pivot: why it matters</h2>
<p>With two midfielders sitting in front of the defence, the 4-2-3-1 offers something the 4-4-2 couldn''t: a reliable central defensive structure that doesn''t rely on a single midfielder tracking runners. If one pivot presses, the other covers. If one surges forward, the other holds. This rotational relationship requires excellent communication and positional discipline between the two players, but when it works it makes a team very difficult to break through the centre.</p>

<h2>The "10" role in a 4-2-3-1</h2>
<p>The attacking midfielder between the lines is the creative hub of this system. They need to receive facing forward in tight spaces, play quick combinations, and arrive late into the box. The position is demanding technically and requires excellent movement to find pockets of space between an opponent''s midfield and defence.</p>

<h2>Strengths and weaknesses</h2>
<ul>
<li><strong>Strength</strong> — excellent balance between attack and defence; the double pivot protects without sacrificing creativity</li>
<li><strong>Strength</strong> — flexible; can transition easily into a 4-4-2 or 4-5-1 out of possession</li>
<li><strong>Weakness</strong> — the lone striker can be isolated if the wide players are tracked back by opposition full-backs</li>
<li><strong>Weakness</strong> — heavily reliant on the quality of the number 10; a poor performer in that role collapses the system</li>
</ul>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'understanding-formations' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Back-Three Systems: 3-5-2 and 3-4-3',
  'back-three-systems',
  '<h2>Why teams choose three at the back</h2>
<p>Three-centre-back systems address a specific problem: how do you defend with depth while still having width in attack? By using three centre-backs instead of two, a team can afford to push their wide players — wing-backs — much higher up the pitch without leaving significant defensive exposure in wide areas.</p>

<h2>The 3-5-2</h2>
<p>Three centre-backs, two wing-backs who push to the touchlines, three central midfielders, and two strikers. In attack, the wing-backs behave like wingers. In defence, they drop back to create a five-person defensive line. The shape flips between a 3-5-2 in possession and a 5-3-2 out of possession.</p>
<p>The three central midfielders must cover significant ground. Typically one holds (the defensive midfielder) while the other two press and support attacks. The two strikers work in a classic partnership — one holds up, one runs in behind — or both press as a unit.</p>

<h2>The 3-4-3 / 3-4-2-1</h2>
<p>Variations used by teams that want more attacking options. Pep Guardiola''s Manchester City and Antonio Conte''s various teams have used three-back variants that create overloads in central areas. The 3-4-2-1 places two attacking midfielders in support of a central striker, with four midfielders behind them — creating a dense central presence that can overwhelm opposition in possession.</p>

<h2>When back-three systems excel</h2>
<ul>
<li><strong>Against teams that use a single striker</strong> — three centre-backs comfortably handle one forward with a spare man</li>
<li><strong>When wing-backs of sufficient quality exist</strong> — the system fails if wing-backs cannot defend one-vs-one at the back and contribute in the final third</li>
<li><strong>Transition football</strong> — the compact defensive structure allows quick transitions from deep positions</li>
</ul>

<h2>Vulnerabilities</h2>
<p>The wide areas between the wing-backs and the central midfielders are exploitable when the team is out of shape. Against teams that use two wingers who stay wide, the wing-backs can be pulled out of position, creating gaps between them and the centre-backs. Speed of defensive transition is essential — if the wing-backs are caught high when possession is lost, the space behind them is dangerous.</p>',
  5, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'understanding-formations' and cat.slug = 'tactical-analysis';


-- ══════════════════════════════════════════════════════════════
-- PRESSING SYSTEMS EXPLAINED (4 lessons)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'What Pressing Actually Means',
  'what-pressing-means',
  '<h2>Pressing is not just "running at the ball"</h2>
<p>When people talk about pressing in football, they often imagine players sprinting toward the ball aggressively. That''s one part of it — but real pressing is an organised, coordinated team action designed to win the ball in advantageous positions, not just prevent the opposition from playing comfortably.</p>

<h2>The logic of pressing</h2>
<p>When a team loses the ball, they face a choice: press immediately to win it back, or retreat into a defensive shape and wait. Pressing argues that winning the ball high up the pitch is more valuable — you start attacks close to the opponent''s goal with the defence out of position. Retreating is safer but means longer journeys to goal and more organised opponents to break down.</p>

<h2>Pressure, cover, and balance</h2>
<p>Effective pressing always involves three elements working together:</p>
<ul>
<li><strong>Pressure</strong> — the player nearest the ball closes down aggressively, reducing time and forcing a decision</li>
<li><strong>Cover</strong> — a second player covers the next most likely passing lane, cutting off the obvious escape route</li>
<li><strong>Balance</strong> — remaining players hold positions to ensure that if the press is beaten, the team''s defensive shape isn''t destroyed</li>
</ul>
<p>Without all three elements, pressing becomes disorganised running that creates more space for the opponent than it eliminates.</p>

<h2>Triggers</h2>
<p>Teams don''t press at all times — that would be physically unsustainable. Instead, they press on "triggers": specific situations where the chance of winning the ball is higher. Common triggers include:</p>
<ul>
<li>A back pass to the goalkeeper</li>
<li>An opponent receiving with their back to goal</li>
<li>A heavy touch that takes the ball away from a player''s body</li>
<li>A ball played into a congested area with limited passing options</li>
</ul>
<p>The best pressing teams recognise these triggers collectively and react simultaneously — one player presses, others immediately shift to cover passing lanes.</p>

<h2>Why it matters for match analysis</h2>
<p>A team that presses effectively can look far better than their raw quality suggests. Conversely, a technically superior team that fails to organise its press will concede ground easily. When analysing matches, watch the moments a team loses the ball. Do they press immediately as a unit, or do individual players press while others jog? The answer tells you a lot about the team''s defensive structure.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'pressing-systems-explained' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The High Press: Winning the Ball in Dangerous Areas',
  'high-press-explained',
  '<h2>What is the high press?</h2>
<p>The high press is a defensive strategy in which a team aggressively presses opponents in their own defensive third or defensive half — the highest areas of the pitch, nearest the opponent''s goal. Rather than retreating to a defensive shape, the pressing team commits multiple players to hunting the ball immediately after losing it.</p>

<h2>The strategic logic</h2>
<p>When you win the ball high up the pitch, you are already in the opponent''s defensive territory. The opposing team has players forward and their defence is disorganised. A quick combination or direct run at goal follows. Jürgen Klopp''s Liverpool teams became famous for generating a significant portion of their goals directly from high press recoveries — winning the ball within ten seconds of losing it and immediately creating a chance.</p>

<h2>Physical requirements</h2>
<p>The high press is exhausting. Pressing in high areas requires forwards and attacking midfielders to sprint repeatedly, not just during the press but to reset and press again. Teams that press high often have higher average heart rates throughout matches and tend to fatigue more in the second half or when playing multiple games per week. This is why rotation and squad depth are not optional for pressing teams — they are structural necessities.</p>

<h2>How to press effectively in high areas</h2>
<p>The striker leads the press, cutting off passing angles to force the ball into a channel or back to the goalkeeper. Wide forwards simultaneously press the full-backs, preventing easy switches of play. The midfield squeezes the central areas. Critically: if the opponent beats the first press, the team must be able to quickly recover their defensive shape rather than being caught stretched.</p>

<h2>Counter-measures</h2>
<p>Teams that struggle against the high press typically:</p>
<ul>
<li>Use a long ball over the press to bypass the pressure and relieve it</li>
<li>Play quickly one or two touch to move through the press before it organises</li>
<li>Use a goalkeeper comfortable playing out from the back to keep the ball moving</li>
<li>Target the space behind pressing defenders who have pushed high</li>
</ul>
<p>When a team starts launching long balls that bypass their technical midfielders, it is often a sign they have been forced to abandon their press by a well-organised opponent.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'pressing-systems-explained' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Gegenpressing: Counter-Pressing the Moment You Lose the Ball',
  'gegenpressing-explained',
  '<h2>Pressing immediately after losing possession</h2>
<p>Gegenpressing — from the German "counter-pressing" — is a specific tactical concept popularised by Jürgen Klopp at Borussia Dortmund and later Liverpool. The principle is deceptively simple: the best moment to win the ball back is in the five seconds immediately after you lose it.</p>

<h2>Why those five seconds matter</h2>
<p>When a team loses the ball, the opponent has just received it and is likely disorganised. The player who just won it needs to look up, process their options, and distribute. Their teammates are still reacting. In those seconds, the opposition is at their most vulnerable. A well-organised gegenpressing team has already rehearsed exactly where each player should move the instant possession is lost — not to randomly chase the ball, but to cut off passing options and force a turnover.</p>

<h2>The famous Klopp quote</h2>
<p>Klopp described gegenpressing as "the best playmaker in the world." His argument: no set piece or designed combination creates better opportunities than winning the ball ten or fifteen metres from the opposition''s goal with the defence still disorganised. Why spend five passes building up to a chance when you can take the ball back immediately in a dangerous position?</p>

<h2>How it works in practice</h2>
<p>When possession is lost:</p>
<ul>
<li>The nearest two or three players immediately close down the ball-carrier with maximum intensity</li>
<li>Players who cannot reach the ball quickly shift to block the most dangerous passing lanes</li>
<li>The team compresses into a tight unit, reducing the space the opponent can exploit</li>
<li>If the ball is won, the team immediately transitions to attack from a high position</li>
<li>If the press fails within five to ten seconds, the team drops into a organised defensive block rather than continuing to chase</li>
</ul>

<h2>What makes it different from a high press</h2>
<p>The high press is a sustained defensive approach used while the opponent has the ball in their own half. Gegenpressing is specifically the immediate reaction to losing possession — it can happen anywhere on the pitch, and it lasts only seconds before either succeeding or transitioning to a different defensive mode. Many teams use gegenpressing as one component within a broader high-pressing philosophy.</p>

<h2>The physical cost</h2>
<p>Gegenpressing requires extremely high fitness levels and cognitive sharpness. Players must recognise when possession is lost and react correctly every time — not just once. In the 87th minute of a match with three games in six days, maintaining this discipline is the difference between elite pressing teams and those who only press effectively in the first half.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'pressing-systems-explained' and cat.slug = 'tactical-analysis';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Mid-Block and Low Block: When Teams Sit Deep',
  'defensive-blocks-explained',
  '<h2>Not every team presses — and that''s a legitimate choice</h2>
<p>High pressing gets the tactical headlines, but a significant proportion of professional football is played by teams who choose to sit deep and defend in compact blocks. This is not passive, disorganised defending — it is a deliberate strategic choice designed to limit space, frustrate opponents, and create opportunities on the counter-attack.</p>

<h2>The mid-block</h2>
<p>A mid-block means the team defends from their own half, typically between the halfway line and roughly 35 metres from goal. The defensive shape is compact — two banks of four or five — with limited pressing in the opponent''s half. The team allows the opponent to have the ball in central and wide positions but defends the space in front of the penalty area tightly.</p>
<p>The mid-block is the most common defensive shape in professional football. It offers a balance between defensive security and the ability to press when the opponent makes mistakes or plays into dangerous areas. Teams like Diego Simeone''s Atlético Madrid have made the mid-block into an art form — suffocating opposition attacks by denying space in central areas while remaining organised enough to counter-attack with pace when they win the ball.</p>

<h2>The low block</h2>
<p>A low block means the entire team defends within their own penalty area or just outside it. Essentially everyone behind the ball. The team concedes possession, concedes territory, and accepts that the opposition will have chances — but bets on the goalkeeper and defensive organisation being strong enough to keep the score 0-0 long enough to earn a draw or nick a goal on the break.</p>
<p>Low-block defending is often seen in games where a promoted team hosts a Champions League side, or a team in the bottom three faces a top-four opponent. The gap in quality makes possession-based football non-viable, so the pragmatic choice is to defend deeply and look for a set piece or counter-attack.</p>

<h2>Counter-attacking off defensive blocks</h2>
<p>Both mid and low blocks are often paired with a counter-attacking strategy. When the team wins the ball deep in their own half, fast forwards immediately run at the opponent''s defence, which is still advancing from its high position. This transition — from defence to attack in seconds — is where these systems score most of their goals. Speed, directness, and a clinical striker are essential for making this work.</p>

<h2>Why this matters analytically</h2>
<p>Possession statistics can be deeply misleading when one team is deliberately defending in a block. 70% possession for the dominant team sounds impressive — but if they''re playing against a low block, that possession is mostly in wide areas or in front of a packed defence. Expected Goals (xG) is a far better indicator of whether the dominant team is actually creating danger, versus just recycling the ball without penetrating.</p>',
  4, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'pressing-systems-explained' and cat.slug = 'tactical-analysis';


-- ══════════════════════════════════════════════════════════════
-- HOW LEAGUES WORK (3 lessons)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Points System and Why Three Points Changed Football',
  'the-points-system',
  '<h2>How league standings are calculated</h2>
<p>In almost every professional football league in the world, standings are determined by a points system:</p>
<ul>
<li><strong>Win</strong> → 3 points</li>
<li><strong>Draw</strong> → 1 point each</li>
<li><strong>Loss</strong> → 0 points</li>
</ul>
<p>Over the course of a season, teams accumulate points across all their matches. The team with the most points at the end of the season wins the league.</p>

<h2>The shift from two to three points for a win</h2>
<p>This seems obvious today, but it was not always the case. Until 1981 in England (and 1994 in international football), a win earned only two points — the same as two draws. This meant a team could comfortably settle for a draw rather than risk losing while chasing a win. The result was often cautious, low-scoring, defensive football.</p>
<p>When three points for a win was introduced, the mathematics changed dramatically. Winning became significantly more valuable relative to drawing. Two draws yield 2 points; a win and a loss yield 3 points. Teams now had a powerful incentive to play for the win rather than protect a draw, which made football more attacking and more exciting as a strategic question.</p>

<h2>Tiebreakers when points are equal</h2>
<p>When two or more teams finish on the same points, leagues use different tiebreakers. The Premier League uses:</p>
<ol>
<li>Goal difference (goals scored minus goals conceded)</li>
<li>Goals scored</li>
<li>Head-to-head record</li>
</ol>
<p>Goal difference means that scoring goals — not just winning — has strategic value. Winning 4-0 is meaningfully better than winning 1-0 across a season, because goal difference can determine who wins the title, who qualifies for Europe, or who gets relegated.</p>

<h2>The analytical implications</h2>
<p>Because three points reward decisive results, football has a significant "luck" element that other sports lack. A team that dominates 10 matches but loses late goals in three of them may finish below a team that performs similarly but wins close games. Over a large number of matches (a full season), quality tends to prevail — but over shorter runs, variance is enormous. Understanding that the points system amplifies volatility is essential for interpreting league tables.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-leagues-work' and cat.slug = 'competitions-structure';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Promotion, Relegation, and the Race to Stay Up',
  'promotion-and-relegation',
  '<h2>The mechanism that makes every position meaningful</h2>
<p>Football''s promotion and relegation system is one of its defining features — and one that makes it structurally unique compared to American sports. At the end of every season, the bottom-placed teams in each division drop down (are relegated) to the division below, while the top-placed teams in lower divisions rise up (are promoted). Your position in the league table is never irrelevant because it determines whether you compete at that level next season.</p>

<h2>How relegation works in the Premier League</h2>
<p>The three lowest-ranked teams at the end of the 20-team Premier League season are relegated to the Championship (the second tier). Three clubs are promoted from the Championship to replace them. This means:</p>
<ul>
<li>The bottom three always go down regardless of points total</li>
<li>The exact number of points needed to stay up varies by season — some years 35 points is enough; others a team might need 42</li>
<li>It is the relative position that matters, not an absolute points target</li>
</ul>

<h2>The financial stakes</h2>
<p>Relegation from the Premier League is catastrophic financially for most clubs. The difference in broadcasting revenue between the Premier League and the Championship is enormous — clubs that drop down lose tens of millions in TV money immediately. This is why the final months of the season are so tense among the bottom clubs. The phrase "parachute payments" refers to a transitional financial support system for relegated clubs, acknowledging that the financial drop is too severe to navigate without a cushion.</p>

<h2>Promotion from lower divisions</h2>
<p>In the Championship, promotion works differently: the top two teams earn automatic promotion to the Premier League. Teams finishing 3rd through 6th enter a playoff — a knockout mini-tournament — for the third promotion spot. The Championship playoff final has been called "the most valuable match in football" due to the gap in revenue between the two divisions.</p>

<h2>Why this creates unique dynamics for analysis</h2>
<p>Teams at different points of the table have entirely different objectives, which changes their tactics. A bottom-three club facing relegation may be willing to accept a 0-0 draw in a way that a mid-table club in the same position would not. A relegated team''s remaining fixtures often become "dead rubber" matches that their opponents treat differently. These incentive structures shape real results and are essential context when analysing league matches.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-leagues-work' and cat.slug = 'competitions-structure';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'European Qualification: Champions League, Europa League, and Conference League',
  'european-qualification',
  '<h2>Beyond the domestic title: European competition</h2>
<p>Finishing high in a domestic league earns clubs entry into European competitions organised by UEFA. For most clubs in England, Spain, Germany, Italy, and France, European qualification is one of the main objectives of a season — often more commercially valuable than a domestic cup win.</p>

<h2>The three UEFA club competitions</h2>
<ul>
<li><strong>UEFA Champions League</strong> — the most prestigious club competition in world football. Reserved for league champions and high-finishing runners-up from top European leagues. In England, typically the top four Premier League teams qualify.</li>
<li><strong>UEFA Europa League</strong> — the second tier. Entry for clubs finishing 5th and 6th in the Premier League, plus FA Cup and League Cup winners. Also receives teams eliminated in Champions League qualification rounds.</li>
<li><strong>UEFA Conference League</strong> — the third tier, introduced in 2021. Entry typically for 7th-place Premier League finishers and domestic cup runners-up from qualifying nations.</li>
</ul>

<h2>What European qualification means financially</h2>
<p>Champions League participation generates enormous revenue — groups stage participation alone guarantees tens of millions in prize money and broadcasting fees. Clubs that qualify regularly can use this financial advantage to attract better players, creating a competitive gap that reinforces their league position. Teams that oscillate between Champions League and Europa League qualification face a compounding disadvantage: lower income, lower player attraction, and harder competition to break back into the top four.</p>

<h2>How allocation rules vary by country</h2>
<p>UEFA allocates spots based on a country''s coefficient — a rolling five-year measure of how well clubs from that nation perform in European competitions. England and Spain typically receive four Champions League spots; smaller leagues may only earn automatic entry for their champion. This system means the quality of European competition varies significantly by national league.</p>

<h2>The "top-four race" as a season narrative</h2>
<p>In England especially, the race for Champions League qualification (top four) often generates as much drama as the title race itself. It involves more clubs, runs until the final weeks, and has massive financial consequences. Understanding this structure helps explain why matches in February or March between mid-table clubs can carry significant weight — a run of wins can launch a team from 7th into European contention.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'how-leagues-work' and cat.slug = 'competitions-structure';


-- ══════════════════════════════════════════════════════════════
-- CUP & KNOCKOUT FORMATS (3 lessons)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Single-Leg Knockouts: Why Every Match Becomes a Final',
  'single-leg-knockout-format',
  '<h2>The knockout format in its purest form</h2>
<p>In a single-leg knockout match, one game determines who advances. There are no second chances, no aggregate scores to overturn. Win and you progress; draw and you play extra time and possibly a penalty shootout; lose and you are out. This format is used in domestic cups (the FA Cup, the Copa del Rey), the latter stages of major tournaments (World Cup knockouts), and some early rounds of European competition.</p>

<h2>What single-leg formats do to tactics</h2>
<p>A single-leg knockout fundamentally changes how teams approach a match compared to a league fixture. Key differences:</p>
<ul>
<li><strong>Risk tolerance changes</strong> — a team that normally plays cautiously in the league may need to chase a goal in the 70th minute rather than settle for a draw</li>
<li><strong>The underdog factor is amplified</strong> — in a league, a weaker team might expect to take 1 or 2 points from 6 against a stronger opponent over two meetings. In a single knockout match, all it takes is one good performance and a stroke of fortune</li>
<li><strong>Squad rotation becomes a strategic weapon</strong> — top clubs managing multiple competitions often rotate heavily for cup games, especially against lower-ranked opposition, which increases genuine upset probability</li>
</ul>

<h2>The FA Cup''s unique character</h2>
<p>The FA Cup uses single-leg knockouts with replays for drawn matches (though the replay system has been phased out in recent rounds). This means giant-killings — lower league clubs defeating top flight teams — are a structural feature of the competition. The combination of one-game knockout format, venue advantage for lower-league home sides, and squad rotation by Premier League teams creates conditions where an upset every round is statistically expected.</p>

<h2>Extra time and penalties</h2>
<p>When a single-leg knockout ends level after 90 minutes, most competitions proceed to 30 minutes of extra time (two 15-minute halves) and, if still level, a penalty shootout. Penalties are a lottery of skill and nerve that introduces a significant random element — strong teams lose cup ties on penalties regularly. The statistical evidence suggests that penalty outcomes are only weakly predictable, making "cup runs ended on penalties" as much a feature as an anomaly.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'cup-and-knockout-formats' and cat.slug = 'competitions-structure';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Two-Leg Ties: Aggregate Scores and Away Goals',
  'two-leg-ties-format',
  '<h2>The two-leg structure in European competition</h2>
<p>Major European club competitions (Champions League, Europa League) use two-leg knockout ties in their round of 16, quarter-final, and semi-final stages. Each team plays one game at home and one away. The team with the higher aggregate score (total goals across both legs) advances. This format creates a very different strategic environment from single-leg knockouts.</p>

<h2>Home and away in a two-leg tie</h2>
<p>Playing the first leg at home versus away changes the strategic calculus significantly. A team playing the first leg away faces the question of whether to be pragmatic (secure a 0-0 or 1-0 and protect the advantage for the home leg) or aggressive (score goals that give an early aggregate advantage). Similarly, a team playing the first leg at home must balance attack with defensive awareness — a 2-0 home win is strong, but conceding a soft goal to make it 2-1 changes the tie considerably.</p>

<h2>The away goals rule — and its removal</h2>
<p>For decades, UEFA used the "away goals rule" as a tiebreaker when aggregate scores were level: goals scored away from home counted double. This created specific tactical situations — most notably that teams who conceded at home under the old rule suddenly faced enormous pressure, while teams playing away had extra incentive to score. UEFA abolished the away goals rule in 2021, so tied aggregates now go directly to extra time and penalties. This change has meaningfully shifted late-game tactics in two-leg ties.</p>

<h2>The arithmetic of comebacks</h2>
<p>Two-leg ties produce some of the most dramatic football because teams trail after the first leg but know another 90 minutes remains. A 3-0 first-leg deficit is considered almost insurmountable — but not impossible. Barcelona overcame a 4-0 deficit against PSG in 2017. Liverpool overturned a 3-0 deficit against Barcelona in 2019. These "miracle nights" are part of the cultural fabric of European football, though statistically they remain very rare.</p>

<h2>Strategic implications</h2>
<p>For analysis, aggregate score context is essential. A team trailing 0-2 away with 60 minutes left is playing a completely different match to the same score in a single-leg knockout — they know they still have a home leg. This means a team might accept a third goal (making the aggregate 0-3) less urgently than they would in a single-match elimination. These contextual dynamics affect how you interpret live match statistics and tactical decisions.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'cup-and-knockout-formats' and cat.slug = 'competitions-structure';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Champions League Format: Groups, Knockouts, and Seeding',
  'champions-league-format',
  '<h2>The structure of the world''s premier club competition</h2>
<p>The UEFA Champions League has undergone significant restructuring over the years, and from 2024/25 onwards uses a new "league phase" format. Understanding the format at each stage helps contextualise how matches and results should be interpreted throughout the season.</p>

<h2>The 2024/25+ league phase format</h2>
<p>From 2024/25, the Champions League abandoned the traditional group stage (four teams per group) and replaced it with a single 36-team league phase. Every team plays eight matches against eight different opponents (four home, four away). At the end of the league phase:</p>
<ul>
<li><strong>Top 8 teams</strong> — advance directly to the round of 16</li>
<li><strong>Teams ranked 9th to 24th</strong> — enter a two-leg playoff round to reach the round of 16</li>
<li><strong>Teams ranked 25th to 36th</strong> — are eliminated</li>
</ul>
<p>This means every league phase match counts toward advancement, regardless of the opponent — there are no "easier group stage games."</p>

<h2>Seeding and the draw</h2>
<p>Seeding in the Champions League determines which teams can be drawn against each other in the knockout stages. Seeds are determined by the UEFA club coefficient (a five-year rolling performance measure). Higher-seeded teams host the second leg of knockout ties — historically a significant advantage, though the removal of the away goals rule has reduced the magnitude of that edge somewhat.</p>

<h2>From the round of 16 onwards</h2>
<p>From the round of 16 to the semi-finals, ties are played over two legs. The final is a single game at a neutral venue (predetermined at the start of the season). Unlike league matches, final venue matters — the team whose home country hosts the final effectively has an additional advantage through supporter attendance.</p>

<h2>Why understanding the format matters for analysis</h2>
<p>The stakes and incentives at different stages of the Champions League differ enormously. A team that has already secured top-8 placement with one league phase game remaining may rotate heavily, making that final fixture much less representative of their true strength. Similarly, a team on the qualification bubble treats the same match completely differently. Format knowledge is context; context is essential for interpreting results accurately.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'cup-and-knockout-formats' and cat.slug = 'competitions-structure';


-- ══════════════════════════════════════════════════════════════
-- HOME ADVANTAGE UNPACKED — additional lessons (after existing lesson 1)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'The Crowd Effect: Noise, Atmosphere, and Referee Influence',
  'crowd-effect-home-advantage',
  '<h2>Does the crowd actually change outcomes?</h2>
<p>The intuitive answer is yes — and the data broadly supports it. But the mechanisms are more nuanced and interesting than simple "home support = better performance." The crowd influences the game through several distinct channels, each with different magnitudes.</p>

<h2>Direct player performance effects</h2>
<p>Home players perform better in front of their own supporters — this is a robust finding across many studies. The proposed mechanisms include:</p>
<ul>
<li><strong>Familiarity comfort</strong> — playing in a venue you train near, sleep near, and have succeeded in previously reduces cognitive load</li>
<li><strong>Arousal and motivation</strong> — crowd noise raises adrenaline and performance in tasks requiring physical effort (though very high arousal can impair fine motor control and decision-making)</li>
<li><strong>Territory effects</strong> — teams are more aggressive and committed in home territory, a finding that translates across many competitive species, not just humans</li>
</ul>

<h2>Referee bias: the most documented channel</h2>
<p>The most compelling research evidence for crowd effects comes from studies of referee decision-making. Studies across multiple leagues have found that referees:</p>
<ul>
<li>Award more injury time when the home team is losing</li>
<li>Give fewer yellow cards to home players</li>
<li>Award penalty kicks and free kicks in favour of home teams at rates slightly above neutral expectation</li>
</ul>
<p>The crucial experiment came from the COVID-19 pandemic. When stadiums played without crowds (2020-21 seasons), home advantage dropped significantly in multiple European leagues — not to zero, but measurably lower. This strongly suggests the crowd was doing real causal work, particularly through referee influence.</p>

<h2>The crowd effect varies by stadium</h2>
<p>Not all stadiums create equal home advantage. A compact, enclosed ground where supporter noise concentrates near the pitch creates a more intense atmosphere than a large open stadium where sound dissipates. Anfield, Dortmund''s Westfalenstadion, and Galatasaray''s Türk Telekom Stadium are famous for creating environments that visibly affect opposition players and officials.</p>

<h2>Analytical implications</h2>
<p>Home advantage exists and is real, but it varies: by the quality of the crowd atmosphere, by the identity of the teams, and by match stakes (cup finals at neutral venues still show a pseudo-home-advantage effect for teams with larger supporter sections). When modelling expected results, treat home advantage as a genuine variable — but not a constant one.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'home-advantage-unpacked' and cat.slug = 'match-dynamics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Travel Fatigue, Fixture Scheduling, and Environmental Factors',
  'travel-fatigue-home-advantage',
  '<h2>Why away teams are already at a disadvantage before kick-off</h2>
<p>Beyond the psychological and atmospheric effects of playing away, visiting teams face concrete logistical disadvantages that influence match outcomes. These are factors that are often underweighted in casual analysis but appear consistently in research data.</p>

<h2>Travel and sleep disruption</h2>
<p>Away travel — even for domestic matches — disrupts sleep patterns, hydration, and routine. For international away fixtures, timezone differences and long-haul flights compound these effects. A squad that travels six hours, arrives late at a hotel, and sleeps in unfamiliar beds before a noon kick-off is already physically compromised compared to home players who slept in their own beds and ate their usual pre-match meal.</p>
<p>Research shows that sleep quality and quantity are among the most significant predictors of athletic performance. Teams that travel east (losing hours) show more performance degradation than those travelling west. Premier League clubs playing European Thursday games before Sunday fixtures face a compressed recovery window that is particularly brutal.</p>

<h2>Altitude: an extreme environmental factor</h2>
<p>At altitude, the air is thinner — less oxygen per breath. Players fatigue more rapidly, decision-making deteriorates earlier in matches, and recovery time between explosive efforts increases. This creates a massive home advantage for clubs based at altitude — La Paz in Bolivia (3,600m), Quito in Ecuador (2,800m), and Bogotá in Colombia (2,600m) are notoriously difficult venues. Visiting national teams have historically struggled dramatically at these altitudes, particularly in World Cup qualifying.</p>

<h2>Surface and facility familiarity</h2>
<p>Home teams train on, or near, their match pitch. They know the bounce, the grip, the width. Away teams may encounter artificial turf when they only play on grass, or vice versa. Pitch dimensions vary — a team that plays on a narrower pitch may struggle when they encounter the wider dimensions of another club''s stadium, where their defensive compactness leaves more space wide.</p>

<h2>The fixture list asymmetry</h2>
<p>Home advantage is also partly a scheduling effect. When a team has played three away matches in a row, fatigue and psychological displacement accumulate. Home games provide a "reset" — familiar environment, shorter travel, crowd support. Teams on long away runs tend to underperform relative to expectation, while a long home run tends to lift performance above baseline. Tracking this context is valuable for any serious match analysis.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'home-advantage-unpacked' and cat.slug = 'match-dynamics';


-- ══════════════════════════════════════════════════════════════
-- SQUAD ROTATION & FATIGUE (3 lessons)
-- ══════════════════════════════════════════════════════════════

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Why Managers Rotate: The Science of Fixture Congestion',
  'why-managers-rotate',
  '<h2>Playing two or three matches per week is physically unsustainable</h2>
<p>A professional footballer in a top European club may play 60 or more matches per season across league, domestic cups, and European competition. Human physiology sets hard limits on how frequently high-intensity athletic performance can be repeated. Managers who ignore these limits see injury rates rise and performance deteriorate — typically at the worst possible time in the calendar.</p>

<h2>The physiology of recovery</h2>
<p>After a high-intensity match, the body requires time to:</p>
<ul>
<li>Replenish glycogen stores in muscles (24–48 hours minimum)</li>
<li>Repair micro-damage to muscle fibres from sprinting, jumping, and contact (48–72 hours)</li>
<li>Restore neuromuscular function — the ability to generate explosive force — which can take 72+ hours after very intense matches</li>
</ul>
<p>In a schedule of three matches per week, the time between games is simply insufficient for complete physiological recovery. This is not a question of player effort or professionalism — it is basic biology.</p>

<h2>The consequence of under-rotating</h2>
<p>Teams that fail to rotate enough accumulate a "fatigue debt" among their key players. The effects are measurable:</p>
<ul>
<li>Sprint speeds and distance covered in the final 15–30 minutes of matches decline</li>
<li>Decision-making quality deteriorates — fatigued players make poorer choices in split-second situations</li>
<li>Injury rates rise, particularly soft-tissue injuries (hamstring strains, muscle tears) that occur when fatigued players overextend</li>
</ul>
<p>The clubs with the largest squads and the most depth — Manchester City, Real Madrid, Bayern Munich — rotate most freely and maintain performance most consistently. Clubs that rely on a small core of 13–14 players throughout a congested schedule typically show performance drops in the February–April period when fixture loads peak.</p>

<h2>Rotation as tactical intelligence</h2>
<p>Managers who rotate well are making calibrated decisions: which players can recover in 72 hours, which ones need 96? Which upcoming match is more important? Which players perform better with rest? A manager who plays their best XI every single match regardless of schedule is not maximising performance — they are gambling with fitness and degrading quality at the most important moments.</p>',
  1, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'squad-rotation-and-fatigue' and cat.slug = 'match-dynamics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Reading the Starting Lineup Before a Match',
  'reading-the-starting-lineup',
  '<h2>The lineup as information</h2>
<p>When a team announces its starting XI, it reveals far more than just who is playing. A carefully read lineup communicates tactical intent, fitness concerns, squad rotation decisions, and managerial priorities. Learning to interpret lineups is a core analytical skill.</p>

<h2>What to look for</h2>
<p><strong>Who is resting?</strong> — If a manager leaves a first-choice player out before a more important upcoming fixture, the team may be fielding a weakened side. Context matters: a team that faced a top-four opponent three days ago and now plays a mid-table side may rest three or four key players.</p>

<p><strong>Who is returning?</strong> — A player returning from injury may start but operate with restrictions on their physical output. Look for them being substituted in the 60th–70th minute regardless of the game state — often a sign they were on a planned minutes limit.</p>

<p><strong>Formation signals</strong> — The lineup itself reveals the formation. Three centre-backs listed suggests a back-three system. Two strikers alongside a lone forward suggests a 4-2-3-1 or 4-3-3. The identities of the players and their typical positions give you the structure before the match begins.</p>

<p><strong>Positional clues</strong> — A winger listed in a central midfield position indicates either tactical flexibility or an unusual positional shift designed to exploit a specific opponent. Attackers listed out wide when they normally play centrally suggests a different attacking shape.</p>

<h2>The "surprise selection" as tactical information</h2>
<p>When a manager picks an unexpected player — a youth academy prospect, a rarely-used squad member — it often signals a specific tactical purpose. The unusual pick is designed to exploit something about the opposition: pace against a slow defence, aerial ability against teams who defend from corners poorly, or defensive screening against a particular threat. Always ask "why this player?" when a surprise selection appears.</p>

<h2>Limitations</h2>
<p>Lineups can be deceptive. Some managers deliberately name surprising lineups that do not reflect their intended tactical shape, only to reorganise once play begins. The starting positions on a team sheet are declarations, not guarantees of actual positioning during the match. The formation listed by media organisations is often an interpretation, not an official statement from the club.</p>',
  2, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'squad-rotation-and-fatigue' and cat.slug = 'match-dynamics';

insert into public.lessons (course_id, title, slug, content, sort_order, is_published)
select c.id,
  'Fatigue Patterns and Second-Half Performance',
  'fatigue-and-second-half-performance',
  '<h2>Matches are not uniform across 90 minutes</h2>
<p>Football analysis that treats each of the 90 minutes equally misses a structural reality: matches change as fatigue accumulates. The patterns of goals, chances created, and tactical effectiveness shift across the course of a match in ways that are measurable and predictable.</p>

<h2>When goals are most likely to be scored</h2>
<p>Research consistently finds that the highest goal frequency in football occurs in the final fifteen minutes (75–90) and injury time. This is not a random distribution — it reflects the combined effects of:</p>
<ul>
<li><strong>Physical fatigue</strong> — defensive lines become less organised, pressing intensity drops, individual concentration lapses increase</li>
<li><strong>Tactical desperation</strong> — teams that are losing push more players forward, creating counter-attack opportunities that didn''t exist earlier</li>
<li><strong>Substitutes</strong> — fresh legs entering the match create mismatches and energy differentials against fatigued opponents</li>
</ul>

<h2>The fatigue window: 60–75 minutes</h2>
<p>Interestingly, the period between 60 and 75 minutes often sees a temporary lull in activity as both teams manage fatigue before managers make substitutions. This is when players are running least and decision-making is most compromised. Clever managers use this window to make personnel changes that reinvigorate their team before the opposition adjusts.</p>

<h2>How teams on short rest perform differently</h2>
<p>Teams playing their third match in seven days show measurable performance degradation, particularly:</p>
<ul>
<li>Total distance covered drops by 5–10%</li>
<li>High-speed running (above 25 km/h) drops more significantly — up to 20%</li>
<li>The drop is most severe in the second half, as fatigued players who were managing their effort in the first half begin to reach physical limits</li>
</ul>
<p>Tracking fixture density for both teams ahead of a match is therefore directly relevant to predicting second-half dynamics.</p>

<h2>Substitutions as a fatigue management tool</h2>
<p>With five substitutions now permitted in most competitions, the ability to introduce fresh players in the 55th–70th minute has become a significant tactical weapon. Teams with deeper, higher-quality squads can effectively field a "second team" in the final third of matches — maintaining intensity while fatigued opponents continue to deteriorate. This has widened the competitive gap between resource-rich and resource-poor clubs in many leagues.</p>',
  3, true
from public.courses c
join public.course_categories cat on cat.id = c.category_id
where c.slug = 'squad-rotation-and-fatigue' and cat.slug = 'match-dynamics';
