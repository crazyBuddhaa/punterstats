-- ============================================================
-- PunterStat — Migration 062: Curriculum Cleanup
-- 1. Resolve 2 cross-course duplicate slugs
-- 2. Clarify 2 overlapping lesson titles
-- 3. Add Key Takeaway sections to 11 Sports University case studies
-- 4. Re-sequence duplicate sort_order values cleanly 1..N
-- ============================================================

UPDATE public.lessons SET content = '<img src="/tactical-workstation.jpg" alt="European league statistical comparison dashboard" />
      <h2>The #1 Mistake on Nigerian Weekend Slips: Mixing Leagues Blindly</h2>
      <p>Every weekend, millions of Nigerian punters place "Over 2.5 Goals" or "BTTS / GG" across 8 different European leagues using the exact same intuition. Yet multi-season Opta and Football-Data records show that Europe''s major leagues operate in completely different statistical worlds:</p>
      <table>
        <thead>
          <tr>
            <th>European League</th>
            <th>Avg. Goals / Match</th>
            <th>Over 2.5 Goals %</th>
            <th>BTTS (GG) %</th>
            <th>Tactical &amp; Refereeing Identity</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>German Bundesliga</strong></td>
            <td><strong>3.12 – 3.22</strong></td>
            <td><strong>60% – 64%</strong></td>
            <td><strong>58% – 61%</strong></td>
            <td>Relentless end-to-end transitions, high defensive lines, teams still attack at 3–1.</td>
          </tr>
          <tr>
            <td><strong>English Premier League (EPL)</strong></td>
            <td><strong>2.95 – 3.20</strong></td>
            <td><strong>57% – 62%</strong></td>
            <td><strong>56% – 60%</strong></td>
            <td>High physical tempo, elite set-piece routines, 98+ minute matches with deep benches.</td>
          </tr>
          <tr>
            <td><strong>Dutch Eredivisie</strong></td>
            <td><strong>3.15 – 3.28</strong></td>
            <td><strong>61% – 65%</strong></td>
            <td><strong>57% – 60%</strong></td>
            <td>Expansive 4-3-3 attacking culture, wide-open spaces between midfield and defence.</td>
          </tr>
          <tr>
            <td><strong>Italian Serie A</strong></td>
            <td><strong>2.60 – 2.75</strong></td>
            <td><strong>48% – 52%</strong></td>
            <td><strong>50% – 53%</strong></td>
            <td>Tactical chess match, man-marking systems, teams protect 1–0 / 2–0 leads clinically.</td>
          </tr>
          <tr>
            <td><strong>Spanish La Liga</strong></td>
            <td><strong>2.50 – 2.64</strong></td>
            <td><strong>43% – 47%</strong></td>
            <td><strong>47% – 51%</strong></td>
            <td>Masterful 4-4-2 / 5-4-1 low blocks (Getafe, Mallorca, Real Sociedad, Atlético), frequent tactical fouls, lower ball-in-play time.</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <strong>Actionable Rule:</strong> An <code>Over 2.5 Goals</code> price of <code>1.75</code> in a mid-table Bundesliga or Eredivisie clash is often fair or +EV; that exact same <code>1.75</code> price in a mid-table Spanish La Liga clash is usually a massive bookmaker trap.
      </blockquote>

<h2>Key Takeaway</h2>
<p>Every European league has its own scoring rate, home advantage, and tactical tempo; calibrate Over/Under and 1X2 expectations to each league''s statistical DNA rather than applying one rule across Europe.</p>' WHERE slug = 'european-leagues-statistical-dna' AND course_id = (SELECT id FROM public.courses WHERE slug = 'comparing-european-leagues-dna');
UPDATE public.lessons SET content = '<img src="/tactical-workstation.jpg" alt="Player load and squad rotation analytics" />
      <h2>1. The Infamous Saturday 1:30 PM WAT Premier League Early Kick-Off</h2>
      <p>In Nigerian football banter ("Never touch the early kick-off!"), the Saturday <strong>1:30 PM WAT (12:30 PM UK)</strong> Premier League match is famous for ruining weekend slips before 3:30 PM. There is hard physiological science behind why this slot produces so many upsets:</p>
      <ul>
        <li><strong>Less Than 65 Hours of Recovery After Wednesday Night UCL:</strong> When Arsenal, Manchester City, Liverpool, or Aston Villa play an away UEFA Champions League match on Wednesday night at 9:00 PM WAT, they land back in the UK early Thursday morning. Kicking off away from home at 1:30 PM WAT on Saturday gives players <strong>only ~62 hours</strong> between matches — well below the <strong>72–96 hours</strong> required for full muscle glycogen and hamstring recovery.</li>
        <li><strong>Subdued Early-Afternoon Tempo:</strong> First-half goal rates in the 1:30 PM WAT slot after international breaks or European midweeks are measurably lower as favourites rotate 2–3 starters and conserve energy.</li>
      </ul>
      <h2>2. The Thursday Night Europa / Conference League Hangover</h2>
      <p>Clubs competing in the UEFA Europa League or Conference League on Thursday night (especially after long flights to Turkey, Greece, Czechia, or Scandinavia) must play their domestic league match on Sunday afternoon. Unless the club has two elite players per position, their pressing intensity (PPDA) drops sharply after the <strong>60th minute on Sunday</strong>, making <strong>Second-Half Goals</strong> or <strong>Opponent +0.5/+1.0 Asian Handicap</strong> high-value angles.</p>

<h2>Key Takeaway</h2>
<p>Short 60–72 hour turnarounds (especially Thursday European away trips into early weekend kick-offs) measurably erode pressing intensity and favour well-rested underdogs.</p>' WHERE slug = 'fixture-congestion-and-travel-fatigue' AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');
UPDATE public.lessons SET content = '<img src="/tactical-workstation.jpg" alt="Tactical workstation showing pressing intensity zones and PPDA" />
      <h2>The 2024 Europa League Final Masterclass (Atalanta 3–0 Bayer Leverkusen)</h2>
      <p>Entering the 2024 UEFA Europa League Final in Dublin, Xabi Alonso''s Bayer Leverkusen were unbeaten in <strong>51 consecutive matches</strong> across all competitions and heavily backed by the public. Yet <strong>Gian Piero Gasperini''s Atalanta</strong> dismantled them <code>3–0</code> behind a historic hat-trick from Nigeria''s <strong>Ademola Lookman</strong>. Why?</p>
      <ul>
        <li><strong>Aggressive Man-for-Man Pressing (PPDA &lt; 8.5):</strong> Leverkusen''s entire build-up relied on short central combinations through Granit Xhaka and Exequiel Palacios. Atalanta locked on man-to-man across the entire pitch (Éderson and Koopmeiners suffocating Leverkusen''s pivot), forcing 18 high turnovers in Leverkusen''s half.</li>
        <li><strong>Isolating Lookman 1v1 in Transition:</strong> Because Leverkusen pushed their wing-backs high, every turnover left <strong>Ademola Lookman</strong> isolated 1v1 against a scrambling right-sided defender. Lookman scored from a back-post cut-back (12''), a curled right-footed strike after a high turnover (26''), and a blistering step-over left-footed finish on the counter (75'').</li>
      </ul>
      <blockquote>
        <strong>Key Lesson for Analysts:</strong> Never blindly back an "unbeaten streak" without checking the <strong>stylistic matchup</strong>. Teams that rely on slow, short build-up from the back often struggle against elite man-to-man pressing units like Atalanta, Liverpool, or Bournemouth.
      </blockquote>

<h2>Key Takeaway</h2>
<p>Man-oriented pressing systems like Atalanta''s can dismantle even elite unbeaten possession teams when they deny central build-up and force turnovers in the opponent''s half.</p>' WHERE slug = 'high-press-vs-mid-and-low-block' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET content = '<img src="/tactical-stadium.jpg" alt="Defensive line and inverted full-back structure" />
      <h2>Why Defensive Absences Move Betting Lines More Than Striker Absences</h2>
      <p>When a star striker is injured, a backup forward can still finish chances created by the team''s system. But when a team loses its <strong>ball-playing goalkeeper</strong>, its <strong>progressive left-sided centre-back</strong>, or its <strong>two-way full-back</strong>, the entire build-up structure collapses under high pressing:</p>
      <ul>
        <li><strong>The Sweeper-Keeper (Alisson, Ederson, David Raya):</strong> Operates 25–30 metres off his line to sweep through-balls and acts as an 11th outfield passer to bait the opponent''s press.</li>
        <li><strong>Wide / Progressive Centre-Backs (William Saliba, Gabriel, Virgil van Dijk, Calvin Bassey at Fulham):</strong> Defend 1v1 in huge spaces when full-backs push forward. At Fulham in the Premier League, Nigeria''s <strong>Calvin Bassey</strong> ranks among the league''s most effective ball-carrying left-sided centre-backs, stepping into midfield to break opposition blocks.</li>
        <li><strong>Two-Way &amp; Inverted Full-Backs (Trent Alexander-Arnold, Josko Gvardiol, Ola Aina at Nottingham Forest):</strong> Either step inside into central midfield to form a double pivot or lock down elite Premier League wingers 1v1 (where <strong>Ola Aina</strong> has posted elite tackle success and progressive carry numbers in the EPL).</li>
      </ul>

<h2>Key Takeaway</h2>
<p>Modern defenders and sweeper-keepers act as the first line of attack — always evaluate a back line''s press-resistance and progression quality alongside clean-sheet numbers.</p>' WHERE slug = 'modern-goalkeepers-and-defenders' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET content = '<img src="/tactical-stadium.jpg" alt="European league standings and tiebreaker analysis" />
      <h2>1. Goal Difference vs Head-to-Head: Know the League Rule Before You Bet</h2>
      <ul>
        <li><strong>Goal Difference First (Premier League, Bundesliga, Ligue 1, Eredivisie):</strong> When two teams finish level on points, overall <strong>Goal Difference (GD)</strong> decides the title, Champions League spots, and relegation. Title contenders leading 2–0 at home against a bottom-three side keep pressing for a 3rd and 4th goal to pad their GD.</li>
        <li><strong>Head-to-Head First (La Liga, Serie A):</strong> Points and goal difference in the <em>two direct matches between the tied clubs</em> decide the table before overall GD. Once a Serie A or La Liga team is 2–0 up against a non-rival, they have far less incentive to risk injuries chasing a 4–0 rout.</li>
      </ul>
      <h2>2. Matchdays 32 to 38: Why "Mid-Table Safe" Teams Become Unreliable Favourites</h2>
      <p>In April and May, teams sitting 9th to 13th in the Premier League, La Liga, or Serie A — mathematically safe from relegation and too far behind European qualification — frequently rotate goalkeepers, start academy teenagers, and pull out of 50/50 tackles. Meanwhile, 17th- and 18th-placed relegation fighters play with cup-final intensity. Backing a "better on paper" 10th-placed team away at a desperate relegation fighter in May is one of the most common bankroll leaks in football betting.</p>

<h2>Key Takeaway</h2>
<p>Know each league''s tiebreaker rules (Goal Difference vs Head-to-Head) and late-season motivation zones to separate genuine desperation from already-priced narratives.</p>' WHERE slug = 'npfl-and-european-league-structures' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');
UPDATE public.lessons SET content = '<img src="/academy-session.jpg" alt="Table tennis spin trajectory and tactical positioning" />
      <h2>Why Table Tennis Is One of the Most Volatile Live Markets</h2>
      <p>Table tennis (WTT Champions, WTT Contender, Olympic Games, and European short-format leagues) is heavily traded by Nigerian punters during daytime and late-night windows. To analyse it properly, understand three structural mechanics:</p>
      <ol>
        <li><strong>Short 11-Point Sets Create High Set-Loss Variance:</strong> Because a set ends at <code>11 points</code> (win by 2) and service rotates every <strong>2 points</strong>, a single net cord, edge ball, or misread pendulum serve can swing a set from <code>8–8</code> to <code>11–8</code> in 45 seconds. Even a <code>1.20</code> match favourite drops at least one set in over 55% of competitive WTT matches — making <strong>Over 3.5 Sets</strong> or <strong>Set Handicap +1.5/+2.5</strong> far safer than backing <code>3–0 Exact Score</code>.</li>
        <li><strong>Matchup Styles (Nigeria''s Quadri Aruna Benchmark):</strong> Nigeria''s <strong>Quadri Aruna</strong> — the first African ever to reach the <strong>ITTF World Top 10 (No. 10)</strong> and an Olympic Quarter-Finalist — generates extreme mid-distance forehand topspin. Against European loopers who trade mid-distance rallies, Aruna''s power dominates; against close-to-the-table fast backhand blockers who rush his pivot, rallies shorten dramatically.</li>
        <li><strong>Avoid Chasing Fast-Format Exhibition Leagues:</strong> Short-turnaround exhibition leagues (where players play 4–5 matches a day in small halls) carry high fatigue variance and wide bookmaker margins (8%–10%). Stick to official ITTF / WTT tour events where ranking motivation and prize money are transparent.</li>
      </ol>

<h2>Key Takeaway</h2>
<p>Short 11-point table tennis sets amplify variance — combine style matchups (forehand power vs two-wing control) with match format (Bo5 vs Bo7) before judging fair win probabilities.</p>' WHERE slug = 'quadri-aruna-and-modern-forehand-topspin' AND course_id = (SELECT id FROM public.courses WHERE slug = 'table-tennis-spin-and-wtt');
UPDATE public.lessons SET content = '<img src="/hero-pitch.jpg" alt="Court surface speed and ball bounce analytics" />
      <h2>Why Court Surface Is the #1 Variable in Tennis Analysis</h2>
      <p>In professional tennis, the three court surfaces — <strong>Hard (Australian Open, US Open), Clay (Roland Garros, Madrid, Rome), and Grass (Wimbledon, Halle, Queen''s)</strong> — change ball speed and bounce height so dramatically that a player''s hold percentage and win rate shift by 10%–18% across the calendar.</p>
      <table>
        <thead>
          <tr>
            <th>Player (Tour)</th>
            <th>Career Serve Hold %</th>
            <th>Hard Win %</th>
            <th>Clay Win %</th>
            <th>Grass Win %</th>
            <th>Betting &amp; Analytical Profile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Novak Djokovic (ATP)</strong></td>
            <td><strong>~86.7%</strong></td>
            <td>84.7%</td>
            <td>80.3%</td>
            <td>86.3%</td>
            <td>Historic return depth + tiebreak mastery across all surfaces.</td>
          </tr>
          <tr>
            <td><strong>Jannik Sinner (ATP)</strong></td>
            <td><strong>~88.5%+ (Peak)</strong></td>
            <td><strong>86%+</strong></td>
            <td>76.0%</td>
            <td>79.0%</td>
            <td>Relentless baseline pace on fast indoor/outdoor hard courts; very rarely broken twice in a match.</td>
          </tr>
          <tr>
            <td><strong>Carlos Alcaraz (ATP)</strong></td>
            <td><strong>~85.0%</strong></td>
            <td>78.5%</td>
            <td>84.3%</td>
            <td><strong>89.7%</strong></td>
            <td>Explosive court coverage + drop-shot variety makes him dominant on both clay and Wimbledon grass.</td>
          </tr>
          <tr>
            <td><strong>Iga Świątek (WTA)</strong></td>
            <td><strong>~79.5%</strong></td>
            <td>78.4%</td>
            <td><strong>85.8%</strong></td>
            <td>73.0%</td>
            <td>Heavy topspin forehand kicks high on clay (creating frequent <code>6–1, 6–2</code> Under 18.5 Games wins), but skids lower on grass.</td>
          </tr>
        </tbody>
      </table>
      <h2>ATP vs WTA Total Games Rule</h2>
      <p>ATP men hold serve roughly <strong>80%–84%</strong> of the time compared to <strong>64%–68%</strong> on the WTA Tour. Consequently, ATP matches between two big servers on fast courts frequently hit <code>Over 22.5 Games</code> via tiebreaks (<code>7–6, 6–4</code>), whereas WTA mismatches on clay or slow hard courts produce far more service breaks and <code>Under 20.5 Games</code> results.</p>

<h2>Key Takeaway</h2>
<p>Court surface fundamentally alters Hold % and Break %; evaluate ATP and WTA matchups using surface-specific serve/return splits rather than overall tour rankings.</p>' WHERE slug = 'serve-hold-and-break-percentages-by-surface' AND course_id = (SELECT id FROM public.courses WHERE slug = 'tennis-surfaces-and-serve-metrics');
UPDATE public.lessons SET slug = 'bookmaker-margins-and-line-shopping-naira' WHERE slug = 'the-overround-explained' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET content = '<img src="/betting-analytics-desk.jpg" alt="Basketball efficiency and pace analytics" />
      <h2>How Sharp Analysts Price NBA Point Spreads &amp; Over/Under Totals</h2>
      <p>NBA basketball is the second most popular global sport on Nigerian betting platforms (especially overnight and early-morning slips). Unlike football, where a team can win with luck, an NBA game has <strong>~98 to 104 possessions per team</strong> — meaning efficiency and schedule spots dictate outcomes.</p>
      <h3>1. Pace × Offensive Rating = Projected Total</h3>
      <ul>
        <li><strong>Pace:</strong> Number of possessions per 48 minutes. Fast teams (Indiana Pacers, Atlanta Hawks, Memphis Grizzlies) push 102+ possessions; slower half-court teams (New York Knicks, Orlando Magic) play around 95–96 possessions.</li>
        <li><strong>Offensive &amp; Defensive Rating (ORTG / DRTG):</strong> Points scored or allowed per 100 possessions (e.g., Boston Celtics and Oklahoma City Thunder posting <code>118+ ORTG</code> and <code>&lt;110 DRTG</code>).</li>
        <li><strong>The Back-to-Back (B2B) Road Spot:</strong> When an NBA team plays the <strong>second night of a back-to-back on the road</strong> (especially at high altitude in Denver or Utah, or after an overtime game the night before), their 3-point shooting percentage drops by ~2.4% in the 4th quarter and stars are frequently rested on the late injury report.</li>
      </ul>
      <h3>2. Crucial Rule Alert: NBA (48 Mins) vs FIBA / Olympics / EuroLeague (40 Mins)</h3>
      <p>Never use NBA scoring intuition on international or European basketball! NBA games are <strong>48 minutes</strong> (typical totals <code>218.5–238.5</code>), whereas FIBA/Olympic and EuroLeague games are <strong>40 minutes</strong> with no defensive 3-second rule in the paint (typical totals <code>145.5–166.5</code>). For example, when Coach <strong>Rena Wakama''s D''Tigress</strong> made history at the <strong>Paris 2024 Olympics</strong> as the first African basketball team to reach an Olympic Quarter-Final — beating #3 Australia <code>75–62</code> (137 total points) and #5 Canada <code>79–70</code> (149 total points) — they won by forcing <strong>26 turnovers in each game</strong> in a gritty 40-minute FIBA defensive format.</p>

<h2>Key Takeaway</h2>
<p>Normalize basketball matchups by Pace, Offensive/Defensive Rating, and back-to-back rest spots — and never apply 48-minute NBA pace assumptions to 40-minute FIBA games.</p>' WHERE slug = 'turnover-forcing-and-defensive-pressure' AND course_id = (SELECT id FROM public.courses WHERE slug = 'basketball-pace-and-four-factors');
UPDATE public.lessons SET content = '<img src="/academy-session.jpg" alt="UEFA Champions League 36-team table and knockout bracket" />
      <h2>1. How the 36-Team UEFA Swiss Format Eliminated "Dead Rubbers"</h2>
      <p>Under the old 4-team UEFA Champions League group stage, elite clubs like Manchester City, Bayern Munich, or Real Madrid often qualified after Matchday 4 and fielded reserve sides on Matchdays 5 and 6. Under the <strong>36-team single-table League Phase (8 matches per team)</strong>:</p>
      <ul>
        <li><strong>Positions 1 to 8:</strong> Advance directly to the Round of 16, skipping the dangerous February play-off round.</li>
        <li><strong>Positions 9 to 24:</strong> Enter a two-legged knockout play-off (seeded by exact league position).</li>
        <li><strong>Positions 25 to 36:</strong> Eliminated from Europe completely (no drop-down into the Europa League!).</li>
        <li><strong>The Goal-Difference Squeeze:</strong> Because 6 to 8 clubs finish tied on the exact same points (e.g., 15 pts around 8th place or 10–11 pts around 24th place), <strong>overall Goal Difference is the primary tiebreaker</strong>. Heavy favourites facing Pot 4 underdogs now push for 4th and 5th goals late in the second half.</li>
      </ul>
      <h2>2. First Leg vs Second Leg in UEFA Knockouts</h2>
      <p>Since UEFA abolished the away-goals rule, <strong>First Legs</strong> average roughly <strong>0.35 to 0.45 fewer goals per game</strong> than <strong>Second Legs</strong>. In the first leg, visiting managers are happy to take a <code>0–0</code>, <code>1–1</code>, or narrow <code>0–1</code> deficit back to their home stadium; in the second leg, trailing teams must abandon their defensive shape after the 60th minute, opening the floodgates for late goals and extra time.</p>

<h2>Key Takeaway</h2>
<p>In two-legged UEFA ties and the 36-team Swiss League Phase, aggregate scorelines and goal-difference cutoffs dictate tactical risk far more than raw team strength.</p>' WHERE slug = 'two-legged-ties-and-tournament-brackets' AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');
UPDATE public.lessons SET content = '<img src="/nigeria-football-tactics.jpg" alt="Vertical counter-attacking transition lines on football pitch" />
      <h2>When Tactical Styles Collide to Create Goals</h2>
      <p>The highest-scoring fixtures in European football rarely happen when two cautious teams meet. They happen when a team playing an <strong>ultra-high defensive line (40+ metres from goal)</strong> faces an opponent with <strong>elite vertical transition speed</strong>:</p>
      <ul>
        <li><strong>Extreme High-Line Teams:</strong> Hansi Flick''s Barcelona, Ange Postecoglou''s Tottenham, Bayern Munich, and PSV Eindhoven. Their offside traps compress the pitch, creating massive attacking xG — but any mistimed step gives fast wingers (Vinícius Jr, Mohamed Salah, Bryan Mbeumo, Ademola Lookman, Nicolas Jackson) a clean 1v1 breakaway from the halfway line.</li>
        <li><strong>The 8-Second Rule:</strong> Shots taken within 8 seconds of a turnover carry <strong>45% higher xG</strong> than shots against a set defence. When two high-transition teams meet in the Premier League or Bundesliga, both teams routinely exceed <code>1.60 xG</code> even if the opening 20 minutes are scoreless.</li>
      </ul>

<h2>Key Takeaway</h2>
<p>High-line pressing sides facing fast direct counter-attackers create the strongest structural BTTS (GG) and Over 2.5 environments in football.</p>' WHERE slug = 'counter-attacking-and-transitions' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET slug = 'converting-bookmaker-prices-to-probability' WHERE slug = 'from-odds-to-probability' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET content = '<img src="/academy-session.jpg" alt="Midfield triangle and tactical role board" />
      <h2>The Most Important Player on the Pitch Is the #6 Anchor</h2>
      <p>Look at Manchester City''s win rate with vs without <strong>Rodri</strong>: with Rodri in the starting XI, City''s Premier League loss rate sat below 11%; whenever Rodri was suspended or injured, their goals conceded per game and counter-attack xG conceded spiked by over 35%.</p>
      <table>
        <thead>
          <tr>
            <th>Midfield Role</th>
            <th>Premier League &amp; European Examples</th>
            <th>What Happens When This Player Is Missing</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>The #6 Defensive Anchor / Rest-Defence Shield</strong></td>
            <td>Rodri (Man City), Moisés Caicedo (Chelsea), Ryan Gravenberch (Liverpool), Wilfred Ndidi (Leicester)</td>
            <td>Opposition counter-attacks run straight at the back four; BTTS (GG) and Over 2.5 probabilities rise sharply.</td>
          </tr>
          <tr>
            <td><strong>The Progressive #8 / Half-Space Creator</strong></td>
            <td>Martin Ødegaard (Arsenal), Kevin De Bruyne, Jude Bellingham (Real Madrid), Alex Iwobi (Fulham)</td>
            <td>Team struggles to break down 5-4-1 low blocks; possession becomes sterile sideways passing (U-shaped build-up).</td>
          </tr>
          <tr>
            <td><strong>Inside Forward / Half-Space Winger</strong></td>
            <td>Bukayo Saka (Arsenal), Mohamed Salah (Liverpool), Vinícius Jr (Real Madrid), Ademola Lookman (Atalanta)</td>
            <td>Penalty-box entries and cut-back xG drop; team becomes overly reliant on low-percentage crosses.</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <strong>Soccernet.ng &amp; OptaNigeria Lineup Checklist:</strong> Always wait for confirmed starting XIs 60 minutes before kick-off. If a favourite is missing its starting #6 anchor away from home, backing the favourite at <code>1.55</code> is almost always negative Expected Value (-EV).
      </blockquote>

<h2>Key Takeaway</h2>
<p>A team''s balance between its #6 destroyer and creative #8s controls transition exposure — losing the starting defensive anchor shifts both goals scored and conceded.</p>' WHERE slug = 'midfield-engines-and-wing-profiles' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET title = 'Value-Focused Feature Engineering for Edge Discovery' WHERE slug = 'feature-engineering-betting-models' AND course_id = (SELECT id FROM public.courses WHERE slug = 'building-a-predictive-edge');
UPDATE public.lessons SET title = 'Line-Shopping Execution Across Multiple Bookmakers' WHERE slug = 'managing-multiple-bookmaker-accounts' AND course_id = (SELECT id FROM public.courses WHERE slug = 'odds-comparison-line-shopping');

-- Re-sequence sort_order for [understanding-odds-formats]
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'converting-bookmaker-prices-to-probability' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'american-moneyline-odds' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'converting-between-odds-formats' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'reading-odds-boards-quickly' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'odds-across-different-sports' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'spread-and-totals-odds' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'exchange-odds-vs-bookmaker-odds' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'pricing-discrepancies-across-bookmakers' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'how-bookmakers-set-odds' AND course_id = (SELECT id FROM public.courses WHERE slug = 'understanding-odds-formats');

-- Re-sequence sort_order for [handicap-and-asian-handicap]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'draw-no-bet-and-asian-handicap-lines' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'asian-handicap-core-mechanics' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'why-sharps-prefer-asian-handicap' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'converting-1x2-to-asian-handicap' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'handicap-betting-other-sports' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'asian-handicap-line-movement' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'handicap-betting-strategies' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'draw-no-bet-underused-tool' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'modelling-ah-probability-distributions' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'expert-ah-portfolio' AND course_id = (SELECT id FROM public.courses WHERE slug = 'handicap-and-asian-handicap');

-- Re-sequence sort_order for [implied-probability-explained]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'expected-goals-xg-for-betting-models' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'the-overround-explained' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'applying-implied-probability-to-bets' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'probability-vs-frequency' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'multiple-outcomes-conditional-probability' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'calibrating-probability-estimates' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'market-efficiency-where-it-fails' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'advanced-probability-modelling' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'cross-market-probability-consistency' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'complete-probability-framework' AND course_id = (SELECT id FROM public.courses WHERE slug = 'implied-probability-explained');

-- Re-sequence sort_order for [squad-rotation-and-fatigue]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'fixture-congestion-and-travel-fatigue' AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'reading-the-starting-lineup' AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'fatigue-and-second-half-performance' AND course_id = (SELECT id FROM public.courses WHERE slug = 'squad-rotation-and-fatigue');

-- Re-sequence sort_order for [positions-and-roles]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'modern-goalkeepers-and-defenders' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'centre-backs-role' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'midfield-engines-and-wing-profiles' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'full-backs-wing-backs-role' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'central-midfield-roles' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'attacker-roles' AND course_id = (SELECT id FROM public.courses WHERE slug = 'positions-and-roles');

-- Re-sequence sort_order for [pressing-systems-explained]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'high-press-vs-mid-and-low-block' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'high-press-explained' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'counter-attacking-and-transitions' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'gegenpressing-explained' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'defensive-blocks-explained' AND course_id = (SELECT id FROM public.courses WHERE slug = 'pressing-systems-explained');

-- Re-sequence sort_order for [how-leagues-work]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'npfl-and-european-league-structures' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'promotion-and-relegation' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'european-qualification' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-leagues-work');

-- Re-sequence sort_order for [cup-and-knockout-formats]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'two-legged-ties-and-tournament-brackets' AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'two-leg-ties-format' AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'champions-league-format' AND course_id = (SELECT id FROM public.courses WHERE slug = 'cup-and-knockout-formats');

-- Re-sequence sort_order for [singles-doubles-accumulators]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'the-mathematics-of-nigerian-accumulators' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'doubles-how-combined-bets-work' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'accumulators-mechanics-myths' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'trebles-trixies-and-patents' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'each-way-betting-when-it-makes-sense' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'system-bets-heinz-goliath' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'builder-bets-same-game-multis' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'bankers-in-accumulators' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'exchange-accumulator-strategy' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'advanced-combination-strategy' AND course_id = (SELECT id FROM public.courses WHERE slug = 'singles-doubles-accumulators');

-- Re-sequence sort_order for [how-bookmaker-margins-work]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'bookmaker-margins-and-line-shopping-naira' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'calculating-the-margin-step-by-step' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'why-margins-vary-by-market' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'true-odds-vs-offered-price' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'comparing-margins-across-bookmakers' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'margin-and-long-run-roi' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'de-vigging-fair-odds' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'sharp-vs-soft-margin-profiles' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'margin-aware-market-selection' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'using-margin-to-hunt-value' AND course_id = (SELECT id FROM public.courses WHERE slug = 'how-bookmaker-margins-work');

-- Re-sequence sort_order for [finding-value-bets]
UPDATE public.lessons SET sort_order = 2 WHERE slug = 'what-is-expected-value-ev' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 3 WHERE slug = 'expected-value-formula' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 4 WHERE slug = 'closing-line-value-clv' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 5 WHERE slug = 'spotting-value-in-practice' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 6 WHERE slug = 'common-sources-of-betting-value' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 7 WHERE slug = 'edge-stakes-expected-profit' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 8 WHERE slug = 'value-vs-confidence-distinction' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 9 WHERE slug = 'systematic-value-hunting' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 10 WHERE slug = 'value-at-different-odds-ranges' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 11 WHERE slug = 'testing-validating-value-edge' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
UPDATE public.lessons SET sort_order = 12 WHERE slug = 'sustainable-value-betting-operation' AND course_id = (SELECT id FROM public.courses WHERE slug = 'finding-value-bets');
