-- ============================================================
-- PunterStat — Migration 059: Sports University Tennis Deep Rewrite (13 lessons)
-- Rewrites & expands 13 lessons with real-data benchmarks,
-- worked examples, HTML tables, and Key Takeaways.
-- ============================================================

-- [how-tennis-scoring-works] tennis-points-games-sets
UPDATE public.lessons
SET content = '<h2>Hierarchical Scoring: Why Winning More Points Does Not Guarantee Winning</h2>
<p>Tennis uses a nested, hierarchical scoring tree: <strong>Points &rarr; Games &rarr; Sets &rarr; Match</strong>. Because you only need to win 4 points (by 2) to win a game and 6 games (by 2, or 7–6 tiebreak) to win a set, points are <em>not</em> worth equal weight — a phenomenon known as <strong>point leverage</strong>.</p>
<p><strong>Famous Real-World Proof (Wimbledon 2019 Final):</strong> Roger Federer won <strong>218 total points</strong> to Novak Djokovic''s <strong>204 points</strong> (a +14 point advantage), won more games (36 to 32), and held two Championship Points on serve — yet Djokovic won the match 7–6, 1–6, 7–6, 4–6, 13–12 by winning the three tiebreaks. Because a 6–1 set and a 7–6 set both count as exactly 1 set, concentration of points matters far more than raw point totals.</p>

<h2>The Non-Linear Magnification Effect (Markov Chain Math)</h2>
<p>Because tennis requires winning repeated sub-contests, a small edge in point-win percentage magnifies dramatically into match-win probability — and magnifies even further in <strong>Best-of-5 (Men''s Grand Slams)</strong> versus <strong>Best-of-3 (ATP Tour / WTA)</strong>:</p>
<table>
  <thead>
    <tr><th>Player A Point Win %</th><th>Game Win %</th><th>Set Win %</th><th>Best-of-3 Match %</th><th>Best-of-5 Match %</th></tr>
  </thead>
  <tbody>
    <tr><td>51.0%</td><td>52.5%</td><td>56.3%</td><td>59.4%</td><td>61.8%</td></tr>
    <tr><td>53.0%</td><td>57.5%</td><td>68.3%</td><td>76.2%</td><td>81.5%</td></tr>
    <tr><td>55.0%</td><td>62.3%</td><td>78.4%</td><td>88.1%</td><td>92.9%</td></tr>
    <tr><td>58.0%</td><td>69.2%</td><td>89.6%</td><td>97.0%</td><td>99.0%</td></tr>
  </tbody>
</table>
<p>Look at that 55% row: winning just <strong>55% of points</strong> (only 11 out of every 20) turns into an <strong>88.1% Best-of-3 win rate</strong> and a <strong>92.9% Best-of-5 win rate</strong>! This is why tennis favourites win far more reliably than football favourites.</p>

<h2>Key Takeaway</h2>
<p>Tennis''s hierarchical scoring amplifies small point-level edges into huge match-win probabilities — especially in Best-of-5 Grand Slams — while creating dramatic leverage spikes on break points and set points.</p>'
WHERE slug = 'tennis-points-games-sets'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-tennis-scoring-works');

-- [how-tennis-scoring-works] tennis-tiebreak-explained
UPDATE public.lessons
SET content = '<h2>When Sets Reach 6–6: The 7-Point Sprint</h2>
<p>At 6–6 in a standard set, a <strong>7-point tiebreak</strong> (first to 7, win by 2) decides the set. Server A serves 1 point, then service alternates every 2 points, with players switching ends every 6 points. In deciding final sets of all four Grand Slams (standardized in 2022), a <strong>10-point Match Tiebreak</strong> is played at 6–6.</p>

<h2>Why Tiebreaks Compress the Talent Gap</h2>
<p>Because a tiebreak lasts only ~12–15 points, variance spikes sharply compared to a full set:</p>
<ul>
  <li>Even a heavy favourite who wins 55% of all points wins a single 7-point tiebreak only <strong>~62–64% of the time</strong> (compared to ~78% for a full set).</li>
  <li><strong>Servebot Tiebreak Edge:</strong> Giant servers (e.g. John Isner, Reilly Opelka, Giovanni Mpetshi Perricard) win ~88–92% of service games on hard/grass courts, pushing a huge share of their sets to 6–6. Once in a tiebreak, a single mini-break (winning 1 return point) often decides the set — making tiebreak-heavy matchups notoriously coin-flippy on Set 1 Winner markets.</li>
  <li><strong>Elite Returners'' Tiebreak Edge:</strong> Historically, Novak Djokovic has won over <strong>65% of his career tiebreaks</strong> (and went 29–5 in 2023 alone) by raising first-serve percentage and eliminating unforced errors under pressure.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Tiebreaks compress skill edges into a short high-variance sprint. When two dominant servers meet on fast hard or grass courts, expect high tiebreak probability, tighter set handicaps, and higher total games.</p>'
WHERE slug = 'tennis-tiebreak-explained'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-tennis-scoring-works');

-- [how-tennis-scoring-works] tennis-service-breaks
UPDATE public.lessons
SET content = '<h2>Hold % vs Break %: The Fundamental Equation of Tennis</h2>
<p>In tennis, holding serve is the baseline expectation and breaking serve is the decisive currency. However, the balance between holding and breaking differs dramatically between the <strong>ATP (Men''s)</strong> and <strong>WTA (Women''s)</strong> tours:</p>
<table>
  <thead>
    <tr><th>Tour / Surface Benchmark</th><th>Avg. Service Hold %</th><th>Avg. Return Break %</th><th>Analytical Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td>ATP Grass (Wimbledon)</td><td>~83% – 85%</td><td>~15% – 17%</td><td>One break almost guarantees the set; huge tiebreak rate</td></tr>
    <tr><td>ATP Hard Court</td><td>~80% – 82%</td><td>~18% – 20%</td><td>Balanced serve advantage; 1–2 breaks per set</td></tr>
    <tr><td>ATP Clay (Roland-Garros)</td><td>~74% – 77%</td><td>~23% – 26%</td><td>Returns neutralize serve; long baseline battles</td></tr>
    <tr><td>WTA Hard / Clay</td><td>~63% – 68%</td><td>~32% – 37%</td><td>Breaks are frequent; 3–0 leads are far less safe than on ATP</td></tr>
  </tbody>
</table>

<h2>Real-Data Live-Probability Trap</h2>
<p>On the ATP Tour on grass, going up a single break (3–1) lifts a player''s set-win probability to <strong>~86–90%</strong>. On the WTA Tour on clay, going up a single break (3–1) lifts set-win probability to only <strong>~72–76%</strong> because break-backs happen roughly a third of the time! Applying ATP mental models to WTA live matches causes massive mispricing of comeback probability.</p>

<h2>Key Takeaway</h2>
<p>Always evaluate matches through <strong>Hold % + Break %</strong> (often summed into a combined Dominance Ratio) and adjust for ATP vs WTA hold-rate baselines.</p>'
WHERE slug = 'tennis-service-breaks'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-tennis-scoring-works');

-- [tennis-court-surfaces] tennis-three-surfaces
UPDATE public.lessons
SET content = '<h2>How Court Friction and Bounce Transform the Same Two Players</h2>
<p>Tennis is unique among global sports because the playing surface physically changes ball speed, bounce height, and footwork traction from month to month. Court speed is formally quantified by the ITF''s <strong>Court Pace Index (CPI)</strong>:</p>
<table>
  <thead>
    <tr><th>Surface</th><th>Typical CPI</th><th>Bounce Profile</th><th>ATP Avg. Aces / Match</th><th>Rally Length</th><th>Favoured Archetype</th></tr>
  </thead>
  <tbody>
    <tr><td>Red Clay (Roland-Garros, Monte-Carlo)</td><td>22 – 28 (Slow)</td><td>High, heavy topspin kick</td><td>~4 – 6</td><td>Longest (~5.2+ shots)</td><td>Heavy-topspin baseliners, elite movers &amp; returners</td></tr>
    <tr><td>Hard Court (US Open, AO, Indoor)</td><td>33 – 44 (Medium–Fast)</td><td>True, predictable, medium</td><td>~9 – 12</td><td>Medium (~4.1 shots)</td><td>All-court aggressive baseliners, strong 1st-serve + FH</td></tr>
    <tr><td>Grass (Wimbledon, Halle, Queen''s)</td><td>38 – 45+ (Fast, low)</td><td>Low, skidding, slight irregularity</td><td>~13 – 16</td><td>Shortest (~3.3 shots)</td><td>Big servers, flat hitters, slice &amp; net specialists</td></tr>
  </tbody>
</table>

<h2>Real-World Surface Rating Splits (Surface Elo)</h2>
<p>Rafael Nadal''s career win rate on clay was an astonishing <strong>90.5% (484–51)</strong> versus ~77.5% on hard courts and ~79.2% on grass. Conversely, big-serving grass specialists (like Matteo Berrettini or Hubert Hurkacz) routinely play 150–200 Elo points stronger on grass and indoor hard than on slow red clay. Blending a player''s overall Elo with their <strong>surface-specific Elo</strong> improves tennis prediction accuracy dramatically over raw ATP/WTA rankings.</p>

<h2>Key Takeaway</h2>
<p>Never evaluate a tennis player using overall rankings alone. Check surface-specific Hold %, Break %, and recent surface win rates — a top-15 clay specialist can legitimately be an underdog against a #45 grass specialist at Wimbledon.</p>'
WHERE slug = 'tennis-three-surfaces'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-court-surfaces');

-- [tennis-serve-return-strategy] tennis-serve-importance
UPDATE public.lessons
SET content = '<h2>The Only Shot Under Complete Player Control</h2>
<p>The serve is the sole stroke in tennis unaffected by the opponent''s prior shot. On the ATP Tour, roughly <strong>65–70% of all points end within 0 to 4 shots</strong> (serve, return, serve+1, return+1) — meaning serve quality and the immediate "Serve + 1" forehand decide the majority of matches.</p>

<h2>First Serve vs Second Serve: The Massive Cliff</h2>
<table>
  <thead>
    <tr><th>Metric (ATP Tour Average)</th><th>1st Serve</th><th>2nd Serve</th><th>Gap</th></tr>
  </thead>
  <tbody>
    <tr><td>In-Play %</td><td>~61% – 64%</td><td>~91% – 93% (7–9% double faults)</td><td>—</td></tr>
    <tr><td>Points Won When In Play</td><td><strong>~72% – 75%</strong></td><td><strong>~51% – 53%</strong></td><td><strong>~21% drop!</strong></td></tr>
  </tbody>
</table>
<p><strong>Analytical Goldmine — 2nd Serve Points Won %:</strong> Elite players separate themselves on the <em>second serve</em>. Novak Djokovic, Jannik Sinner, and Carlos Alcaraz routinely win <strong>56–59% of 2nd-serve points</strong> (neutralizing the opponent''s attack), while vulnerable servers drop to 44–47% — creating constant break-point pressure whenever their 1st-serve % dips below 58%.</p>

<h2>Key Takeaway</h2>
<p>Look past raw Ace counts. First-serve points won (~73% ATP avg) combined with <strong>second-serve points won (&gt;55% = elite)</strong> is the cleanest predictor of who will hold serve reliably under pressure.</p>'
WHERE slug = 'tennis-serve-importance'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

-- [tennis-serve-return-strategy] tennis-return-of-serve
UPDATE public.lessons
SET content = '<h2>Why Elite Returners Dominate Over Full Seasons</h2>
<p>Big servers win lots of tiebreaks, but <strong>elite returners win Grand Slams</strong>. Consider the "Big Three" (Djokovic, Nadal, Federer) plus modern stars (Alcaraz, Sinner, Swiatek): every single one ranked top-5 on tour in <strong>Return Games Won %</strong> and <strong>2nd-Serve Return Points Won %</strong>.</p>

<h2>Key Return Metrics &amp; Benchmarks</h2>
<ul>
  <li><strong>Returns In Play %:</strong> Average ATP players get ~68–72% of 1st serves back in play. Elite returners (Djokovic, de Minaur, Medvedev) get <strong>78–83%</strong> back deep into the court, forcing the server to play extra rally balls.</li>
  <li><strong>2nd-Serve Return Points Won %:</strong> On ATP, winning <strong>53%+</strong> of opponent 2nd serves is elite; on WTA, elite returners like Iga &Sacute;wi&aogon;tek routinely win <strong>58–62%</strong> of opponent 2nd serves, producing frequent 6–1 and 6–2 sets.</li>
  <li><strong>Return Position (Deep vs Tight):</strong> Standing 3–4 metres behind the baseline (e.g. Daniil Medvedev, Dominic Thiem) neutralizes 220 km/h flat serves on hard courts, but leaves huge vulnerability to body serves and serve-and-volley drop volleys.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Great returners create a high floor — they rarely have "off days" the way serve-dependent players do when their 1st-serve % drops. Matchups between an elite returner and a weak 2nd-serve opponent heavily favour the returner on game handicaps.</p>'
WHERE slug = 'tennis-return-of-serve'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

-- [tennis-serve-return-strategy] tennis-patterns-of-play
UPDATE public.lessons
SET content = '<h2>Tennis as a Repeating Pattern Engine</h2>
<p>Elite coaches (like Craig O''Shannessy''s Brain Game Tennis analytics) break tennis into repeatable geometric patterns rather than improvised highlights:</p>
<ul>
  <li><strong>Serve Wide &rarr; Open Court (+1):</strong> Pulling the returner off the sideline opens 8+ metres of empty court for a high-percentage cross-court or down-the-line winner on shot 3.</li>
  <li><strong>Lefty Ad-Court Slider:</strong> Left-handed servers (e.g. Rafael Nadal, Ben Shelton, Jack Draper) slice wide to a right-hander''s backhand on the Ad (left) side — crucial because every game point at 40–30, Ad-In, and 30–40 is played in the Ad court!</li>
  <li><strong>Heavy Topspin to One-Handed Backhand:</strong> Targeting high-bouncing forehands at a one-handed backhand (especially on clay) forces short defensive slices that set up inside-out forehand winners.</li>
</ul>

<h2>Head-to-Head Pattern Asymmetries</h2>
<p>This is why specific head-to-head (H2H) records can look wildly lopsided between similarly ranked players: if Player A''s bread-and-butter pattern attacks Player B''s weakest wing (e.g. heavy topspin forehand into a high one-handed backhand), Player A can dominate 8–1 in H2H even if their overall rankings are identical.</p>

<h2>Key Takeaway</h2>
<p>Check handedness (lefty vs righty), backhand type (one-handed vs two-handed), and H2H records on the same surface — recurring geometric patterns explain why certain matchups stay one-sided year after year.</p>'
WHERE slug = 'tennis-patterns-of-play'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

-- [tennis-serve-return-strategy] tennis-net-play-serve-volley
UPDATE public.lessons
SET content = '<h2>Why Pure Serve-and-Volley Faded — and How Modern Net Play Returned</h2>
<p>In the 1990s (Pete Sampras, Patrick Rafter, Stefan Edberg), over 40% of Wimbledon points involved serve-and-volley. Polyester strings (which allow huge topspin passing shots) and slower grass/hard courts pushed pure serve-and-volley below 5% in the 2010s. Yet <strong>selective net play</strong> is surging again among modern champions like Carlos Alcaraz and Jannik Sinner.</p>

<h2>The Data on Selective Net Approaches</h2>
<ul>
  <li>Tour players who approach the net selectively (after a deep forcing shot or wide serve) win roughly <strong>66–72% of net points</strong> — significantly above their ~50% baseline rally win rate.</li>
  <li><strong>Tactical weapon against deep returners:</strong> Against opponents standing 4 metres behind the baseline (e.g. Medvedev, Zverev), mixing in serve-and-volley 15–20% of the time on fast courts forces them to step forward and disrupts their entire return rhythm.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Pure serve-and-volley is rare today, but players who finish points cleanly at the net (~68%+ net points won) shorten rallies, conserve stamina in Best-of-5 matches, and neutralize deep-standing returners.</p>'
WHERE slug = 'tennis-net-play-serve-volley'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-serve-return-strategy');

-- [tennis-playing-styles] tennis-playing-archetypes
UPDATE public.lessons
SET content = '<h2>The Four Core Playing Archetypes</h2>
<table>
  <thead>
    <tr><th>Archetype</th><th>Signature Traits</th><th>Best Surface</th><th>Example Players</th></tr>
  </thead>
  <tbody>
    <tr><td>Aggressive Baseliner</td><td>Dictates from baseline with heavy FH/BH, high winner count</td><td>Hard / Clay</td><td>Jannik Sinner, Aryna Sabalenka, Iga &Sacute;wi&aogon;tek</td></tr>
    <tr><td>Counterpuncher / Pusher</td><td>Elite court speed, low unforced errors, extends rallies</td><td>Slow Hard / Clay</td><td>Alex de Minaur, Daniil Medvedev, Coco Gauff</td></tr>
    <tr><td>Big Server / First-Strike</td><td>Dominant 1st serve + short 0–4 shot points, tiebreak specialist</td><td>Grass / Indoor Hard</td><td>Hubert Hurkacz, Elena Rybakina, Ben Shelton</td></tr>
    <tr><td>All-Court Tactician</td><td>Adapts between baseline power, drop shots, slice, and net play</td><td>All Surfaces</td><td>Carlos Alcaraz, Novak Djokovic, Ons Jabeur</td></tr>
  </tbody>
</table>

<h2>Style Matchup Matrix</h2>
<ul>
  <li><strong>Counterpuncher vs Aggressive Baseliner:</strong> If the aggressive player is slightly off on timing (high unforced errors), the counterpuncher absorbs pace and wins comfortably; if the aggressive player is peaking on fast hard, they blow the counterpuncher off court.</li>
  <li><strong>Big Server vs Counterpuncher:</strong> Often produces extreme set-score variance — tight 7–6 sets when the server''s 1st serve lands &gt;65%, or sudden 6–2 blowouts when it drops below 55%.</li>
</ul>

<h2>Key Takeaway</h2>
<p>Classify every matchup by archetype + surface interaction. Knowing who generates pace and who absorbs pace predicts rally length, break frequency, and tiebreak probability.</p>'
WHERE slug = 'tennis-playing-archetypes'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-playing-styles');

-- [tennis-grand-slams] tennis-four-grand-slams
UPDATE public.lessons
SET content = '<h2>Comparing the Four Majors</h2>
<table>
  <thead>
    <tr><th>Grand Slam</th><th>Month</th><th>Surface &amp; Speed</th><th>Unique Analytical Factor</th></tr>
  </thead>
  <tbody>
    <tr><td>Australian Open (Melbourne)</td><td>January</td><td>Medium-Fast Hard (GreenSet)</td><td>Early-season rust vs fresh legs; extreme daytime heat (35&deg;C+)</td></tr>
    <tr><td>Roland-Garros (Paris)</td><td>May–June</td><td>Slow Red Clay</td><td>Heaviest physical grind; cold/damp evening sessions deaden ball bounce</td></tr>
    <tr><td>Wimbledon (London)</td><td>July</td><td>Fast Low-Bounce Grass</td><td>Short 3-week grass prep; court wears down from Week 1 to Week 2</td></tr>
    <tr><td>US Open (New York)</td><td>Aug–Sept</td><td>Medium-Fast Hard (Laykold)</td><td>End-of-season fatigue; humid night sessions &amp; loud Arthur Ashe crowd</td></tr>
  </tbody>
</table>

<h2>Why Men''s Grand Slams (Best-of-5) Have Fewer Upsets</h2>
<p>In Best-of-3 ATP Masters events, a top-10 seed loses in Round 1–3 roughly 25–30% of the time. In Best-of-5 Grand Slams, needing to win 3 sets amplifies both statistical edge (via the Markov chain magnification) and physical fitness — making 5-set upsets by lower-ranked players significantly rarer.</p>

<h2>Key Takeaway</h2>
<p>Each Grand Slam has its own speed, weather, and seasonal fatigue profile. Best-of-5 format on the men''s side strongly favours fitter, higher-rated players over 4+ hour matches.</p>'
WHERE slug = 'tennis-four-grand-slams'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-grand-slams');

-- [tennis-rankings-system] tennis-rankings-calculation
UPDATE public.lessons
SET content = '<h2>The 52-Week Rolling Window</h2>
<p>ATP and WTA rankings are <strong>not</strong> live skill ratings — they are rolling 52-week point totals (best 19 tournaments on ATP, best 18 on WTA). Every Monday, points earned in the same calendar week one year ago expire and are replaced by this year''s result:</p>
<ul>
  <li><strong>Grand Slam Winner:</strong> 2,000 pts (Finalist: 1,300 ATP / 1,300 WTA)</li>
  <li><strong>Masters 1000 / WTA 1000 Winner:</strong> 1,000 pts</li>
  <li><strong>ATP/WTA 500 Winner:</strong> 500 pts · <strong>250 Winner:</strong> 250 pts</li>
</ul>

<h2>Why Rankings Lag Behind True Current Form</h2>
<ol>
  <li><strong>Injury returns ("Protected Ranking"):</strong> A top-10 player returning from a 6-month injury may be ranked #85 while playing at a top-15 level — creating massive mispricing if you rely on ranking numbers.</li>
  <li><strong>One-Tournament Spike:</strong> A player who made a shock Grand Slam semi-final (800 pts) 10 months ago can sit in the top 30 despite going 12–20 since.</li>
  <li><strong>Surface Blindness:</strong> Rankings sum clay, hard, and grass points together, masking extreme surface specialists.</li>
</ol>

<h2>Key Takeaway</h2>
<p>Treat ATP/WTA rankings as a lagging 12-month trophy cabinet, not a live strength model. Surface-adjusted Elo and recent 3-month Hold/Break % are far sharper indicators of current playing level.</p>'
WHERE slug = 'tennis-rankings-calculation'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-rankings-system');

-- [tennis-mental-game] tennis-momentum-pressure
UPDATE public.lessons
SET content = '<h2>Why Tennis Scores Are Non-Linear — and Momentum Is Often an Illusion</h2>
<p>Commentators constantly cite "momentum" when a player wins 3 games in a row. Yet empirical studies of over 100,000 ATP/WTA matches (including Klaassen &amp; Magnus''s landmark econometric work on Wimbledon) found that <strong>point-to-point autocorrelation is tiny</strong> (around 1–2%).</p>
<p>What <em>does</em> exist is <strong>structural leverage</strong>: winning a point at <code>0–0</code> shifts match win probability by ~1.5%, whereas winning a break point at <code>4–4, 30–40</code> in the deciding set shifts match win probability by <strong>15–22% in a single stroke</strong>.</p>

<h2>The Serve-First Scoreboard Pressure Effect</h2>
<p>Serving first in a set (1–0, 2–1, 4–3, 5–4) forces the opponent to serve to stay in the set at 4–5 and 5–6. While statistically modest (~1–2% extra set-win probability on ATP), players with shaky second serves show measurable drops in 1st-serve % when serving to stay in a set or match.</p>

<h2>Key Takeaway</h2>
<p>Separate genuine leverage points (break points, serving for the set) from narrative "momentum." Most mid-match swings in tennis are simply normal binomial variance amplified by non-linear scoring.</p>'
WHERE slug = 'tennis-momentum-pressure'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-mental-game');

-- [tennis-mental-game] tennis-clutch-performance
UPDATE public.lessons
SET content = '<h2>Is "Clutch" Real in Tennis Data?</h2>
<p>Break Points Saved % and Break Points Converted % are among the noisiest stats in tennis over small samples (because a player may face only 4–8 break points in a match). Over <strong>multi-year career samples</strong>, however, genuine pressure separation emerges:</p>
<ul>
  <li><strong>Tour average break-point conversion:</strong> Roughly <strong>38–42%</strong> on ATP (close to normal return-point win % on 1st/2nd serves blended).</li>
  <li><strong>Elite pressure performers (e.g. Novak Djokovic, Rafael Nadal):</strong> Raise their 1st-serve % and cut unforced error rates by 15–20% on break points and in tiebreaks, sustaining a repeatable +3–5% clutch edge over thousands of pressure points.</li>
  <li><strong>"Choking" mechanism (Double-Fault Spikes):</strong> Under extreme scoreboard pressure (serving for a match at 5–4), tight muscles shorten the service motion — causing double-fault rates to jump from ~4% to 8–12% for vulnerable servers.</li>
</ul>

<h2>Analytical Trap: Overreacting to Single-Match Break-Point Luck</h2>
<p>If Player A goes <code>1/11 (9%)</code> on break points and loses a close match despite winning more total points and generating 11 break chances, casual observers call them "mentally weak." Statistically, generating 11 break points is a <strong>strong positive signal of return dominance</strong> — and conversion rates almost always regress toward ~40% in the next round.</p>

<h2>Key Takeaway</h2>
<p>Evaluate players on how many break points they <em>create</em> and <em>concede</em> (repeatable skill), not single-match break-point conversion % (high-variance noise). Only trust clutch adjustments over multi-season samples.</p>'
WHERE slug = 'tennis-clutch-performance'
  AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-mental-game');
