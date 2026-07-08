-- ============================================================
-- PunterStat — Basketball & Tennis: Add Key Takeaway sections
-- Stage 2 of lesson content expansion (19 lessons from migration 026)
-- Appends <h2>Key Takeaway</h2> HTML blocks to existing HTML content.
-- Run after 041_football_fundamentals_key_takeaways.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- BASKETBALL POSITIONS & ROLES (4 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The most analytically significant development in guard play over the past decade is the collapse of the traditional PG/SG distinction. Modern NBA evaluation focuses on three position-agnostic metrics shared by all guards: three-point efficiency (eFG% from the perimeter), playmaking ratio (assists per turnover), and defensive switch coverage range. The PG's historic monopoly on ball-handling has dissolved — shooting guards like James Harden led the league in assists; Devin Booker runs primary ball-handler duties without the traditional label. What matters analytically is perimeter creation quality (pull-up shooting, pick-and-roll execution), not nomenclature. When evaluating backcourts, measure combined turnover rate, three-point attempt rate, and transition contribution as shared metrics, and set aside the PG/SG label as an insufficient descriptor of modern positional function.</p>
$KT$
WHERE slug = 'basketball-guard-positions'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Power forward is the most positionally displaced role in modern basketball. The traditional back-to-the-basket PF is effectively extinct at the elite level: stretch fours who shoot three-pointers at high frequency have replaced them because floor spacing opens driving lanes for guards and wings. NBA tracking data shows that teams deploying at least two reliable three-point shooters in their frontcourt generate measurably higher eFG% from all areas — the spacing effect is real and quantified. For analysts evaluating forwards, the key modern metrics are three-point attempt and make rates combined with defensive versatility: can this player guard positions 1–4 in switch situations, and can they protect the rim in drop coverage? These two factors together define modern forward value far more accurately than traditional rebounding and scoring metrics.</p>
$KT$
WHERE slug = 'basketball-forward-positions'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The center position's evolution from rim-anchored specialist to stretch-five is the single largest tactical shift in basketball over 15 years. The catalyst was three-point data: once NBA analytics demonstrated that spacing the floor with a shooting center added more offensive efficiency than a traditional post scorer, the role transformed. Nikola Jokic represents the current extreme — a center who regularly leads the NBA in assists, shoots efficiently from mid-range, and anchors his offense through passing rather than scoring. His on/off splits across peak seasons (approximately +10 net rating per 100 possessions over 2,000+ minutes) are among the largest and most statistically robust individual impact measurements in professional sport. The analytical implication: evaluate centers on off-ball spacing (three-point attempt rate), screen assist rate, and defensive versatility across coverage types — not rebounds and blocks, which measure only one dimension of what the modern position requires.</p>
$KT$
WHERE slug = 'basketball-center-position'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The positionless era's analytical impact is most visible in lineup construction data. NBA teams now routinely deploy five-man units where all players can handle, shoot from three, and switch defensively — and these lineups consistently outperform traditional position-locked ones in net rating (points scored minus points allowed per 100 possessions). The Golden State Warriors' small-ball lineup (Draymond Green at center, four shooters surrounding him) posted a net rating of approximately +40 in 2014–15 — outscoring opponents by 40 points per 100 possessions. This extreme efficiency demonstrated that all-position versatility produces synergistic returns that rigid positional rosters cannot replicate. The practical analytical point: when evaluating any NBA roster, measure each player's positional coverage range — how many defensive matchup types they can effectively handle — as a multiplier on their individual offensive contributions. Wide coverage range is disproportionately valuable because it expands the number of high-efficiency lineup combinations available to a coaching staff.</p>
$KT$
WHERE slug = 'positionless-basketball'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-positions-and-roles');


-- ══════════════════════════════════════════════════════════════
-- BASKETBALL OFFENSIVE SYSTEMS (3 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Motion offense's effectiveness is best understood through shot quality data. NBA tracking shows that the average contested three-pointer carries an eFG% of approximately 31%, while an uncontested catch-and-shoot three from the same location carries approximately 42% — an 11-percentage-point gap generated purely by the quality of the shot creation process. Motion offenses, designed to produce more uncontested looks through screening and cutting, consistently generate higher proportions of the latter. The coaching discipline is persuading players not to take available contested shots in favour of continuing movement that generates uncontested ones — an intangible discipline with measurable results. Teams that track "shot quality above league average" as a metric and build offensive systems around maximising it consistently outperform teams that track points per possession from fixed plays, because shot quality is a more stable underlying variable than made-shot variance.</p>
$KT$
WHERE slug = 'basketball-motion-offense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The decline of isolation as a primary system — NBA isolation frequency fell from approximately 15–18% of plays in the early 2010s to 8–12% in recent seasons — reflects what the data reveals: isolation plays produce fewer points per possession on average than pick-and-roll actions or spot-up shots. However, isolation remains essential as a secondary weapon for creating mismatches. Elite isolation scorers (Durant, Harden, Kawhi Leonard) produce above-league-average efficiency in isolation, making it rational when deployed selectively. Post-up play has declined further, but the data shows it remains highly efficient for specialists who generate shooting fouls at high rates — the foul-drawing component of post play is consistently undervalued in field goal efficiency statistics. Evaluate post-up players on free throw generation rate and total points-per-post-possession, not shooting percentage alone. The most impactful post players in modern basketball earn their value primarily at the free throw line, not from made field goals.</p>
$KT$
WHERE slug = 'basketball-isolation-post'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Transition offense is the highest-efficiency source of scoring in basketball. NBA data consistently shows that shots within the first 6 seconds of a possession — before the defence has organised — produce significantly better expected outcomes than shots taken in half-court sets. Teams leading the league in transition pace consistently generate top-quartile offensive efficiency even without elite half-court creation, because the quality of early-clock shots compensates for lower half-court execution. Analytically, transition rate and early-offense frequency are among the most predictive team-level offensive variables per season. Critically, transition defense (limiting opponent transition opportunities through disciplined retreating after shot attempts) shows up in net rating but almost never in individual box-score statistics — making it one of the most systematically underweighted variables in public team and player assessment.</p>
$KT$
WHERE slug = 'basketball-transition-offense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-offensive-systems');


-- ══════════════════════════════════════════════════════════════
-- BASKETBALL DEFENSIVE SCHEMES (3 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Zone defense's primary analytical vulnerability is the corner three-pointer. The corner three is typically the highest-percentage three-point location on the floor (approximately 39% vs 35% from other three-point locations) — yet many 2-3 zone schemes specifically funnel offensive players toward the corners by protecting the paint. Teams that can "shoot the gaps" in zone — quick reversal passes followed by corner kick-outs — generate efficient open corner threes at higher rates against zone than against man-to-man defense. Zone effectiveness therefore depends critically on the offensive team's three-point shooting quality from corner locations. When scouting a zone-using team, check their opponents' corner three-point attempt rate and make rate: teams allowing high-frequency, high-quality corner threes against zone are deploying it against the wrong matchup and will concede above-average offensive efficiency.</p>
$KT$
WHERE slug = 'basketball-zone-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Switching defense represents a fundamental trade-off: you eliminate pick-and-roll coverage confusion (reducing "empty actions" — possessions where defensive disorganisation concedes free layups or corner threes by approximately 40–50%) at the cost of accepting mismatches in isolation. The effectiveness of switching depends entirely on roster construction. Teams with switchable wings who can defend both guards and power forwards (Kawhi Leonard, Mikal Bridges, Jimmy Butler) can switch more aggressively with minimal mismatch cost. Teams without this versatility face degraded efficiency in small-on-big matchup situations specifically. When evaluating a team's switching scheme, track their defensive efficiency specifically in "switch-created mismatch" possessions — this is where the cost of switching materialises and where the roster construction question is answered concretely by game data rather than scouting opinion.</p>
$KT$
WHERE slug = 'basketball-switching-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Help defense quality separates good defensive teams from elite ones more reliably than any individual defensive statistic — and it is the least reflected factor in traditional box scores. Individual defensive statistics (steals and blocks) capture fewer than 20% of all defensive events. A player who consistently takes charges, forces baseline isolations, makes correct rotation decisions, and communicates switch assignments will register almost no box-score defensive statistics while being genuinely elite. The measurable footprint of good help defense is found in team-level data: defensive rotation speed (ground covered per second by off-ball defenders on specific play types), opponent eFG% from non-primary actions, and frequency of "open" shots conceded per defensive possession. When evaluating any player's defensive contribution, supplement steals and blocks with on/off defensive rating splits — a player whose team's defensive rating improves by 3+ points when they are on the court is contributing substantially to defensive structure, whatever the box score shows.</p>
$KT$
WHERE slug = 'basketball-help-defense'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-defensive-schemes');


-- ══════════════════════════════════════════════════════════════
-- READING THE BOX SCORE (2 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The assist-to-turnover ratio is widely cited but easily misapplied. A 3:1 ratio does not make a player more valuable than a 2:1 ratio without context: it depends on what kinds of plays generate those assists and turnovers. A player running high-risk, high-reward creation — generating assisted corner threes and drive-and-kicks at an above-average rate — may produce more net positive expected value than a conservative player who only assists easy shots while maintaining a clean turnover rate. The correct evaluation framework treats assists by the expected point value of the shots generated minus the expected cost of turnovers (opponent transition attempts). Assist/turnover ratio alone measures only ball security — a useful but incomplete signal of offensive contribution. Supplement it with assist rate (percentage of teammates' made field goals a player was on the court for that they assisted) and the shot locations of their assists to understand the quality, not just the quantity, of their playmaking.</p>
$KT$
WHERE slug = 'basketball-assists-turnovers'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'reading-the-box-score');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The fundamental problem with basketball defensive statistics is that good defense frequently produces no box-score event. A well-timed rotation that forces a hurried corner three attempt registers as nothing. A steal from gamble-defense that leaves a lane open registers as a positive, despite potentially being net-negative for the team. NBA teams with tracking data now use Defensive Rating (points allowed per 100 possessions when that player is on-court), shot contest frequency, and disruption rate (shots altered without blocked) to supplement box-score stats. For public analysis, the most accessible and reliable supplement to steals and blocks is on/off defensive rating split: how does the team's defensive efficiency change when this player is on vs off the floor? A player whose team's defensive rating improves by 2+ points when they are on court is contributing substantially to defensive structure, regardless of what the box score shows. This single split is more informative than a full season of defensive statistics watching for most players.</p>
$KT$
WHERE slug = 'basketball-defensive-stats'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'reading-the-box-score');


-- ══════════════════════════════════════════════════════════════
-- BASKETBALL ADVANCED METRICS (2 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>PER's fundamental limitation is measuring production volume without adequately penalising inefficiency. A player taking 25 shots and making 10 can rate higher than one taking 10 shots and making 7, despite the latter being considerably more efficient. PER also dramatically underweights three-point shooting efficiency and virtually ignores defensive contributions. Modern basketball analytics has largely moved past PER as a primary evaluation tool, replacing it with BPM (Box Plus/Minus), VORP (Value Over Replacement Player), and tracking-based metrics like RAPTOR. Treat PER as a rough volume-adjusted scoring indicator for high-usage players — useful as a first filter — but always supplement with eFG% (efficiency), usage rate (volume context), and on/off splits (true team impact). A player with high PER and negative on/off net rating is a volume scorer who hurts their team when on the floor — a contradiction that PER alone is structurally unable to reveal.</p>
$KT$
WHERE slug = 'basketball-per-metric'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-advanced-metrics');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>On/off splits are the closest approximation basketball analytics has to a controlled experiment on player value — but they require large sample sizes and opponent quality adjustment to interpret reliably. The standard reliability threshold is approximately 500+ on-court minutes before drawing conclusions, with adjustments for the quality of opposing lineups faced. Nikola Jokic's on/off splits across his peak seasons — approximately +10 net rating per 100 possessions across 2,000+ minutes annually — are among the most statistically robust individual impact measurements in professional sport. Used correctly, on/off splits are more predictive of long-run team success than any individual box-score metric, because they directly measure the outcome that matters — whether the team scores more or concedes fewer points with this player on the court. Used incorrectly — in small samples, without opponent adjustment — they produce highly misleading conclusions. Always report sample size alongside an on/off split.</p>
$KT$
WHERE slug = 'basketball-on-off-splits'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-advanced-metrics');


-- ══════════════════════════════════════════════════════════════
-- TENNIS SERVE & RETURN STRATEGY (3 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Return of serve statistics reveal more about match dominance than aggregate match scores suggest. In ATP matches on hard courts, the average break of serve occurs in approximately 23–26% of return games — but elite returners like Novak Djokovic sustain break rates of 30–34%, a structural advantage that compounds across three or five sets. The critical metric separating elite returners from average ones is not return winners but "return depth rate" — placing the return consistently into the court at sufficient depth to neutralise the serve-plus-one structure. Djokovic's ability to neutralise first serves and absorb pace creates return games where he begins each rally on near-equal terms rather than defending from a compromised position. For predictive analysis, a player's return game strength against specific serve patterns (flat, kicker, wide slice) is more predictive of break opportunities than aggregate return statistics, because most elite servers have a dominant serve direction that must be specifically countered.</p>
$KT$
WHERE slug = 'tennis-return-of-serve'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Pattern-based analysis has become the dominant coaching framework at the elite level because ATP tracking data quantifies what observation alone cannot: top-20 players each have 3–4 dominant point constructions that account for 60–70% of their outright winners — recognisable shot sequences they build toward from specific court positions. Rafael Nadal's cross-court forehand to the backhand followed by an inside-out forehand winner accounts for a disproportionate share of his clay-court won points; opponents know it, and he still executes it — because it is built on positional superiority that the pattern itself creates. The analytical implication for match prediction: when a player's primary pattern is structurally suppressed by an opponent's footwork or court positioning, their win probability drops measurably — a factor that aggregate head-to-head records capture without explaining. Understanding which player's preferred patterns will be available, and which will be countered, is the key tactical question in any match analysis.</p>
$KT$
WHERE slug = 'tennis-patterns-of-play'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Net play's decline as a primary system — serve-and-volley is now deployed by fewer than 5% of ATP professionals as a primary tactical framework, down from near-universal usage before the polyester string and slow hardcourt era — reflects measurable changes in court speed and ball physics, not a coaching preference shift. Slower hardcourts and heavy topspin made passing shots more reliable, raising the structural cost of the net approach. However, selective net play has seen a genuine resurgence in tracking data: elite players now approach the net 3–5 times per set on specifically favourable tactical windows, and ATP net approach efficiency at the elite level is approximately 65–70% — substantially higher than baseline rally win rates. The measurable analytical implication: players with above-average net approach frequency combined with above-average net efficiency add a tactically exploitable dimension to their game that changes the pattern distribution of any match and can specifically be quantified and predicted.</p>
$KT$
WHERE slug = 'tennis-net-play-serve-volley'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');


-- ══════════════════════════════════════════════════════════════
-- TENNIS MENTAL GAME (2 lessons)
-- ══════════════════════════════════════════════════════════════

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>The non-linearity of tennis scoring creates measurable pressure point effects. A game at 30-40 (break point) is played under substantially different conditions than 30-30 (deuce), despite representing only a one-point score difference. Research consistently shows that serving players win break-point games at a meaningfully lower rate than their overall service game win rate — the specific scoreline creates performance divergence that is measurable across large match samples. In WTA hardcourt matches, tiebreak outcomes are disproportionately determined by performance at 5-5 and 6-6: players who have demonstrated high break-point save rates throughout the set frequently maintain composure in tiebreak pressure situations, while players who conceded breaks under pressure in earlier games show reduced tiebreak performance. Break-point save rate and tiebreak record in close tiebreaks (those reaching 6-6) are among the most stable individual pressure performance indicators available, and more predictive for tight-match outcomes than aggregate win/loss records against similar opponents.</p>
$KT$
WHERE slug = 'tennis-momentum-pressure'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-mental-game');

UPDATE public.lessons
SET content = content || $KT$

<h2>Key Takeaway</h2>
<p>Clutch performance in tennis is quantifiable through pressure-point differential: the difference between a player's overall point win rate and their win rate specifically on high-leverage points (break points, set points, match points). Players with a consistently positive differential are genuine pressure performers; those with a negative differential underperform systematically under pressure. Novak Djokovic's career break-point conversion differential — consistently positive across 15+ seasons, measured across thousands of matches — represents one of the most durable individual performance signals in any sport. For betting analysis, the most predictive clutch metric in close matches is the current-season break-point save rate rather than career averages, because current form and confidence interact with underlying mental conditioning. A player in peak form saves break points at higher rates even if their historical clutch record is average — the in-season signal is fresher and more condition-specific than career data, particularly on specific surfaces where confidence is highest.</p>
$KT$
WHERE slug = 'tennis-clutch-performance'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-mental-game');
