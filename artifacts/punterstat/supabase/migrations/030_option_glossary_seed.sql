-- ============================================================
-- PunterStat — Option Glossary Seed Data
-- 21 bet-type entries across 5 categories.
-- Run after 029_option_glossary_schema.sql
-- ============================================================

-- ── Match Result ─────────────────────────────────────────────
insert into public.bet_type_glossary (
  category_id, slug, name, sort_order,
  explanation, worked_example, volatility_note, common_misreadings, is_published
)
select
  c.id,
  t.slug, t.name, t.sort_order,
  t.explanation, t.worked_example, t.volatility_note, t.common_misreadings,
  true
from public.bet_categories c
cross join (values

  ('match-result-1x2',
   '1X2 — Home / Draw / Away',
   1,
   'The simplest and most common football bet. You choose one of three outcomes: the home team wins (1), the match ends in a draw (X), or the away team wins (2). The market settles on the full-time result only — extra time and penalties are not counted unless stated otherwise.',
   'Arsenal host Brighton. The market prices are: Arsenal win (1) @ 1.80, Draw (X) @ 3.60, Brighton win (2) @ 4.50. You stake £10 on Arsenal to win. Arsenal win 2-1 at full time. Return = £10 × 1.80 = £18. Profit = £8. If the match had ended 1-1, your stake is lost.',
   'Low-to-medium volatility. Three outcomes mean no single result is rare. Draws happen in roughly 25–28% of top-league matches, which is why the draw price is often underestimated by casual bettors.',
   ARRAY[
     'Assuming extra time counts — it never does unless the market explicitly states "including extra time".',
     'Confusing short prices with certainty. A 1.20 favourite still loses roughly one time in five.',
     'Forgetting that bookmaker margins (overround) are highest on 1X2 markets — typically 5–8% on major leagues.',
     'Treating a draw as a "bad result" rather than a distinct bookable outcome worth pricing separately.'
   ]),

  ('match-result-double-chance',
   'Double Chance',
   2,
   'Covers two of the three possible 1X2 outcomes in a single bet. The three options are: 1X (home win or draw), X2 (draw or away win), and 12 (home win or away win — draw excluded). Because you are covering more ground, the odds are lower than a straight 1X2 selection, but you only lose if the one outcome you excluded occurs.',
   'Liverpool host Burnley. Liverpool are heavy favourites: 1X2 prices are 1.30 / 5.00 / 9.00. Double Chance 1X (Liverpool win or draw) is priced at 1.10. If you want more value, 12 (either team wins, no draw) prices at 1.22. You stake £20 on 1X. Liverpool win 3-0 — bet wins. Return = £20 × 1.10 = £22. Profit = £2.',
   'Lower volatility than 1X2 — you need the one excluded outcome to lose. 1X and X2 cover 70–75% of results in most leagues. The trade-off is compressed odds: margins are embedded across two outcomes instead of three, so value is rare.',
   ARRAY[
     'Treating it as a safe accumulator anchor — the odds are too short to contribute meaningfully to acca returns.',
     'Picking 12 (no draw) without understanding that draws occur in ~25% of matches, making this less safe than it looks.',
     'Assuming Double Chance eliminates all risk — you still lose if the excluded outcome occurs.',
     'Ignoring that bookmaker margins on DC markets can exceed 1X2 margins because casual bettors over-bet them.'
   ]),

  ('match-result-draw-no-bet',
   'Draw No Bet',
   3,
   'A two-outcome market that removes the draw entirely. If the match ends level, your stake is refunded in full. You back either the home side or the away side to win. The price sits between the 1X2 win price and the Double Chance price — better odds than Double Chance, but a push (refund) rather than a win on a draw.',
   'Manchester City host Wolves. 1X2: City 1.25, Draw 6.00, Wolves 11.00. Draw No Bet: City 1.11, Wolves 5.50. You stake £50 on City DNB at 1.11. City win 2-0: return = £55.50, profit = £5.50. Match draws 1-1: stake returned — £50 back, no profit, no loss. Wolves win: £50 lost.',
   'Lower volatility than 1X2 but not zero-risk. The refund on a draw means your worst-case frequency is roughly 25% of matches (stake returned) plus the away-win frequency (~30–35%). Effective loss rate for backing strong home favourites is around 30–35%.',
   ARRAY[
     'Assuming DNB makes a strong favourite "safe" — you still lose if the underdog wins outright.',
     'Comparing DNB odds to 1X2 odds and thinking DNB is expensive — the refund protection has real value that justifies the lower price.',
     'Stacking DNB bets in an accumulator — a draw on any leg refunds that leg but collapses the acca value dramatically.',
     'Confusing DNB with Asian Handicap 0 — they are mathematically identical, just presented differently by different bookmakers.'
   ]),

  ('match-result-to-qualify',
   'To Qualify / Match Winner',
   4,
   'Used in knockout competitions (FA Cup, Champions League, World Cup). The market is settled on who progresses — accounting for extra time and, if applicable, a penalty shootout. This is a two-way market: no draw is possible because a winner must be determined. Prices are typically tighter than regular 1X2 because the draw is absorbed into the two win outcomes.',
   'Chelsea play Juventus in the Champions League last 16, first leg 1-1. The To Qualify market for the tie (decided over both legs) prices Chelsea at 1.95 and Juventus at 1.85. You stake £25 on Chelsea at 1.95. After 90 minutes of the second leg the score is 1-1 (2-2 on aggregate). Extra time and penalties follow — Chelsea win the shootout. Bet wins. Return = £25 × 1.95 = £48.75.',
   'Medium volatility. Penalty shootouts introduce near-coin-flip variance that no model reliably prices well. Even a strong team has roughly a 45–55% chance once it reaches a shootout. This makes To Qualify a market where "expected" outcomes frequently fail.',
   ARRAY[
     'Confusing this with the Match Result (90 min) market — To Qualify includes extra time and penalties.',
     'Assuming the leg-one result is decisive — many ties are reversed in the second leg.',
     'Underestimating the shootout variance — even a much weaker side has ~45% chance once penalties begin.',
     'Ignoring away-goal rules (now abolished in UEFA competitions) — always check competition rules for how ties are broken.'
   ])

) as t(slug, name, sort_order, explanation, worked_example, volatility_note, common_misreadings)
where c.slug = 'match-result';


-- ── Goals Markets ─────────────────────────────────────────────
insert into public.bet_type_glossary (
  category_id, slug, name, sort_order,
  explanation, worked_example, volatility_note, common_misreadings, is_published
)
select
  c.id,
  t.slug, t.name, t.sort_order,
  t.explanation, t.worked_example, t.volatility_note, t.common_misreadings,
  true
from public.bet_categories c
cross join (values

  ('goals-over-under-2-5',
   'Over / Under 2.5 Goals',
   1,
   'You bet on whether the total number of goals scored by both teams in a match will be more than 2.5 (Over) or fewer than 2.5 (Under). Because goals are whole numbers, "2.5" is a split point — there is no push. Over wins if 3 or more goals are scored; Under wins if 0, 1, or 2 goals are scored. The 2.5 line is the most traded total in football.',
   'Tottenham vs West Ham. Market: Over 2.5 @ 1.85, Under 2.5 @ 2.00. You stake £20 on Over 2.5. Final score: Tottenham 3-1 West Ham (4 goals total). Over 2.5 wins. Return = £20 × 1.85 = £37. Profit = £17. Had the score been 1-0 or 1-1 (1 or 2 goals), Under wins and your £20 is lost.',
   'Medium volatility. Roughly 50–55% of Premier League matches produce 3 or more goals, which is why Over and Under are priced similarly. Low-scoring leagues (Serie A, Atletico-era La Liga) produce higher Under hit rates. Single-match variance is high — a penalty awarded in the 89th minute can flip the result.',
   ARRAY[
     'Thinking 2.5 goals is a lot — in most top leagues, more than half of matches go Over 2.5.',
     'Forgetting that own goals count toward the total.',
     'Assuming form tables predict totals — defensive teams playing each other can still produce high-scoring anomalies.',
     'Stacking Over 2.5 accumulators without accounting for variance — each individual match has ~45–50% failure rate.'
   ]),

  ('goals-over-under-1-5',
   'Over / Under 1.5 Goals',
   2,
   'The same structure as Over/Under 2.5 but set at a lower threshold. Over 1.5 wins if 2 or more goals are scored (any result other than 0-0 or 1-0 to either team). Under 1.5 wins only if the match ends 0-0 or 1-0. Because goalless and single-goal draws are relatively rare, Over 1.5 is a shorter-priced, higher-frequency bet than Over 2.5.',
   'Burnley vs Crystal Palace. Over 1.5 @ 1.40, Under 1.5 @ 2.90. You stake £50 on Over 1.5. Final score: 0-0. Under 1.5 wins. You lose £50 despite Over 1.5 winning roughly 80% of the time in top leagues. This illustrates that frequency does not mean safety — the 20% failure cases are real.',
   'Lower volatility than 2.5 line because the hit rate is around 80% in most top leagues. However, the short price (typically 1.30–1.50) means you need an extremely high strike rate to profit. A single 0-0 or 1-0 result in an accumulator eliminates all progress.',
   ARRAY[
     'Treating Over 1.5 as a certainty because "teams always score" — roughly 1 in 5 matches goes Under 1.5.',
     'Using Over 1.5 as an acca builder without checking league averages — Serie A and Greek Super League produce more Unders than the Premier League.',
     'Ignoring that bookmakers price heavy favourites into short odds and embed high margins on this market.',
     'Assuming injury to a key striker is irrelevant — team goal output drops measurably when top scorers miss.'
   ]),

  ('goals-btts',
   'Both Teams to Score (BTTS)',
   3,
   'A yes/no market on whether both teams score at least one goal during the match. BTTS Yes wins if both sides get on the scoresheet at any point in normal time — regardless of the final score. BTTS No wins if either team (or both) fails to score. A 3-0 result settles as BTTS No despite being a high-scoring game, because one team scored zero.',
   'Arsenal vs Chelsea. BTTS Yes @ 1.70, BTTS No @ 2.10. You stake £30 on BTTS Yes. Final score: Arsenal 2-1 Chelsea. Both teams scored — BTTS Yes wins. Return = £51. Now imagine Arsenal win 2-0. Chelsea scored zero — BTTS No wins and your £30 is lost, even though the game produced goals.',
   'Medium-to-high volatility. In the Premier League roughly 55% of matches see both teams score. But clean sheets happen about 30% of the time for any given team across a season, making BTTS No an underestimated outcome. A single dominant performance from either team can produce a clean sheet regardless of overall form.',
   ARRAY[
     'Assuming attacking teams guarantee BTTS Yes — elite teams often win comfortably with clean sheets against weaker opposition.',
     'Confusing BTTS with Over 2.5 — a 2-0 result is Over 2.5 No and BTTS No simultaneously; a 1-1 is Over 2.5 No but BTTS Yes.',
     'Ignoring defensive form: a team with 8 clean sheets in 12 home games is a strong BTTS No candidate regardless of the opponent''s attack rating.',
     'Stacking BTTS Yes accumulators — each leg has roughly a 45% failure rate, so a 4-leg acca has only ~9% chance of landing.'
   ]),

  ('goals-first-team-score',
   'First Team to Score',
   4,
   'You bet on which team will score the first goal of the match — or select "No Goal" (draw). This is not about the winner: the team that scores first can still lose. The market settles the moment the first goal is registered. Own goals count — if an own goal is scored, the team that conceded it is credited as having scored.',
   'Real Madrid host Atletico Madrid. First Team to Score: Real Madrid @ 1.60, Atletico @ 2.50, No Goal @ 8.00. You stake £20 on Real Madrid. Atletico score an own goal in the 5th minute — Real Madrid are credited as first scorers and your bet wins. Return = £32. Profit = £12.',
   'Medium-to-high volatility. First goal timing is essentially unpredictable — a shock early goal from the underdog is always possible. The No Goal option (~8–10% of matches) represents genuine value in low-scoring league matchups.',
   ARRAY[
     'Forgetting that own goals count — always check the bookmaker''s own-goal rule for this market before betting.',
     'Conflating first scorer with match winner — the team that scores first loses the match in roughly 20–25% of cases.',
     'Assuming strong home favourites "always score first" — first-goal timing is weakly correlated with overall dominance.',
     'Ignoring that No Goal prices are often better value than they appear in defensive matchups.'
   ]),

  ('goals-total-exact',
   'Total Goals — Exact Number',
   5,
   'You predict the exact total number of goals in a match (e.g. exactly 2 goals, exactly 3 goals). Because you are selecting a single point rather than a range, the odds are much higher than Over/Under — but hitting an exact total is genuinely rare. Common bands: 0 goals, 1 goal, 2 goals, 3 goals, 4 goals, 5+ goals.',
   'Everton vs Brentford. Exact total goals market: 0 goals @ 10.00, 1 goal @ 5.50, 2 goals @ 4.00, 3 goals @ 4.50, 4 goals @ 6.00, 5+ goals @ 7.00. You stake £10 on exactly 2 goals at 4.00. Final score: 1-1 (2 goals total). Bet wins. Return = £40. Profit = £30. Had the score been 2-0 (still 2 goals) the bet also wins.',
   'High volatility. Each exact total has a hit rate of roughly 15–25% depending on the band. Even the most probable band (2 or 3 goals in most leagues) wins less than one time in four. This market is best used for single bets seeking value, not as part of accumulator strategies.',
   ARRAY[
     'Treating this like an Over/Under bet — you need exactly that number, not "at least" or "at most".',
     'Assuming the most common scoreline determines the most common total — 2-1 and 1-1 both produce 3 and 2 goals respectively, so check total distributions not scoreline distributions.',
     'Building accumulators from exact-total selections — combined probabilities become tiny within two or three legs.',
     'Ignoring that the "5+ goals" band is a catch-all with a longer tail than bettors expect in cup games and derbies.'
   ])

) as t(slug, name, sort_order, explanation, worked_example, volatility_note, common_misreadings)
where c.slug = 'goals-markets';


-- ── Handicaps ─────────────────────────────────────────────────
insert into public.bet_type_glossary (
  category_id, slug, name, sort_order,
  explanation, worked_example, volatility_note, common_misreadings, is_published
)
select
  c.id,
  t.slug, t.name, t.sort_order,
  t.explanation, t.worked_example, t.volatility_note, t.common_misreadings,
  true
from public.bet_categories c
cross join (values

  ('handicap-asian-whole',
   'Asian Handicap — Whole Goal Lines',
   1,
   'A whole-goal Asian Handicap (e.g. -1, +1) gives one team a virtual deficit or advantage at kick-off. If the adjusted result lands exactly on zero — for example, backing a -1 favourite who wins by exactly one goal — the bet is a push and stakes are returned. This eliminates the draw and most "exact margin" outcomes, leaving essentially a two-way market with a push condition.',
   'Liverpool (-1) vs Southampton (+1) @ 1.95 each side. You back Liverpool at -1. Liverpool win 2-0. Adjusted score: Liverpool 1-0 — bet wins. Return = £19.50 per £10 staked. Now Liverpool win 1-0. Adjusted: 0-0 — push, stake refunded. Liverpool draw 1-1. Adjusted: 0-1 — Southampton cover, your bet loses.',
   'Lower volatility than 1X2 because the market eliminates the draw. Push conditions (winning by exactly the handicap margin) occur in roughly 10–15% of cases. The two live outcomes are roughly 45%/45% with a 10% push zone, depending on the handicap line.',
   ARRAY[
     'Confusing a push with a loss — a push returns stakes in full; it is not a losing bet.',
     'Assuming a -1 line means the team needs to win by two — they need to win by more than one, with exactly one triggering the push.',
     'Treating Asian Handicap as complex because of the push — it is simply 1X2 with the draw redistributed.',
     'Not checking whether the bookmaker uses Asian rules (push on exact line) or European rules (push counted as a loss) — always verify.'
   ]),

  ('handicap-asian-half',
   'Asian Handicap — Half Goal Lines',
   2,
   'The most common Asian Handicap format. Lines sit at half-goal intervals (-0.5, -1.5, +0.5, +1.5), which eliminates any push — every bet either wins or loses. Backing a team at -0.5 means they simply must win the match. Backing at +1.5 means they must win or lose by no more than one goal.',
   'Backing Chelsea at -1.5 vs Wolves @ 2.20. Chelsea must win by 2 or more. Chelsea win 2-0: adjusted score 0.5 — Chelsea cover, bet wins at 2.20. Chelsea win 1-0: adjusted -0.5 — Chelsea fail to cover, bet loses. No push is possible with a half-line. Alternatively, backing Wolves +1.5 @ 1.70 — Wolves cover if they win, draw, or lose by exactly one.',
   'Similar volatility to 1X2 because no push is possible — every event settles. Half-goal lines create a clean binary outcome. The most volatile selections are strong favourites at -1.5 or greater, where the favourite must win by a specific margin.',
   ARRAY[
     'Confusing -0.5 (must win) with -1 (win by 2 or push) — the half versus whole distinction changes the bet fundamentally.',
     'Treating +0.5 as equivalent to DNB — +0.5 loses if the team loses, whereas DNB refunds on a draw.',
     'Assuming Asian Handicap odds are always better than 1X2 — they redistribute value rather than creating it.',
     'Ignoring that the line moves with market action — the same team may shift from -0.5 to -1 as money comes in, changing the bet entirely.'
   ]),

  ('handicap-asian-quarter',
   'Asian Handicap — Quarter Goal Lines',
   3,
   'The most precise Asian Handicap format. Lines fall at quarter intervals (-0.75, -1.25, +0.25, +0.75). The bet is split equally across two adjacent lines — half at the lower, half at the upper. A -0.75 bet splits into -0.5 and -1: if the team wins by exactly one goal, half the stake wins (the -0.5 half) and the other half is pushed (the -1 half), returning a half-stake net win.',
   'You stake £20 on City at -0.75 @ 1.90. City win 1-0. Split: £10 on -0.5 wins at 1.90 (return £19), £10 on -1 pushes (return £10). Total return = £29 — net gain = £9 on a £20 stake (~0.45 profit per unit rather than 0.90). City win 2-0: both halves win, full return = £38. City draw or lose: both halves lose, full £20 gone.',
   'Lower variance than whole or half lines because partial outcomes (half-win, half-push) smooth out the result. Useful for bettors who want to take a position between two lines without committing to either extreme.',
   ARRAY[
     'Thinking a half-win is a full win — a -0.75 bet on a team that wins by one goal returns roughly half the expected profit.',
     'Confusing quarter-ball notation across bookmakers — some display -0.75 as (-0.5, -1) split explicitly; others show only -0.75.',
     'Believing quarter lines are exotic or high-risk — they are simply averages of two adjacent lines and often reduce variance.',
     'Overlooking that the odds on quarter lines sit between the two adjacent whole/half lines — they carry less value per unit than the extremes.'
   ]),

  ('handicap-european',
   'European Handicap',
   4,
   'A whole-goal handicap applied to the 1X2 market, but unlike Asian Handicap, there is no push. A -1 European Handicap means the team starts the game 1-0 down in your bet. If they win by exactly one goal, the adjusted result is 0-0 — which counts as a draw, not a refund. This creates a three-way market (handicap home win, handicap draw, handicap away win) with the draw retained.',
   'Barcelona (-2) vs Getafe (+2). European Handicap prices: Barcelona win @ 2.00, Draw @ 3.50, Getafe win @ 4.00. You back Barcelona at -2. Barcelona win 3-1 (adjusted 1-1): that is a handicap draw — your bet on Barcelona to win the handicap loses. Barcelona win 4-0 (adjusted 2-0): Barcelona win the handicap — bet wins at 2.00.',
   'Higher volatility than Asian Handicap because the draw is retained as a genuine outcome rather than a push. On -2 lines, the "handicap draw" zone (winning by exactly 2) occurs in 10–15% of matches, increasing the losing frequency compared to equivalent Asian Handicap bets.',
   ARRAY[
     'Assuming a push applies on European Handicap — it does not. Winning by the exact handicap margin results in a draw, not a refund.',
     'Conflating European and Asian -1 handicaps — Asian -1 pushes on a one-goal win; European -1 loses on a one-goal win (result = draw).',
     'Forgetting to check which format the bookmaker is using — the same "-1" label has completely different settlement rules.',
     'Ignoring the three-way market structure — European Handicap draws are a legitimate betting option worth pricing separately.'
   ])

) as t(slug, name, sort_order, explanation, worked_example, volatility_note, common_misreadings)
where c.slug = 'handicaps';


-- ── Correct Score ─────────────────────────────────────────────
insert into public.bet_type_glossary (
  category_id, slug, name, sort_order,
  explanation, worked_example, volatility_note, common_misreadings, is_published
)
select
  c.id,
  t.slug, t.name, t.sort_order,
  t.explanation, t.worked_example, t.volatility_note, t.common_misreadings,
  true
from public.bet_categories c
cross join (values

  ('correct-score-exact',
   'Exact Correct Score',
   1,
   'You predict the precise final scoreline — for example, 2-1 to the home team. There is no margin for error: 2-1 is a different result from 3-1, 2-0, or 1-0. Because scores are highly specific, odds are large — typically 6.00 to 30.00+ for common scores, and much higher for unusual ones. Settlement is on the full-time score only; extra time is excluded unless stated.',
   'You back Brentford to beat Brighton 1-0 @ 7.50. Stake: £10. Brentford win 1-0 at full time — bet wins. Return = £75. Profit = £65. Had Brentford won 2-0, 3-0, or the match ended 1-1, your bet is lost regardless of the correct result direction. The 1-0 home win is the most common individual scoreline in most top leagues at ~10–12% frequency, making it the most popular correct score selection.',
   'Very high volatility. Even the most common scoreline (1-0) occurs only 10–12% of the time. Correct score is essentially a high-odds novelty market — useful for entertainment value but structurally disadvantaged by very high bookmaker margins, which can exceed 20% on this market.',
   ARRAY[
     'Assuming the favourite''s most likely scoreline is a good value bet — bookmakers heavily margin correct score markets, so popular lines like 1-0 or 2-1 are consistently overpriced.',
     'Forgetting that extra time is excluded — a 1-1 that goes to extra time and ends 2-1 settles as a draw (1-1) for correct score purposes.',
     'Treating correct score as a serious strategy — hit rates of 10–15% on individual selections make sustained profitability extremely difficult.',
     'Ignoring that the most popular selections (1-0, 2-1, 2-0) carry the highest margins — less obvious scores like 3-2 or 2-2 sometimes represent better mathematical value despite appearing riskier.'
   ]),

  ('correct-score-halftime',
   'Half-Time Score',
   2,
   'The same as Exact Correct Score but settled on the scoreline at the end of the first 45 minutes only. Half-time scores are typically lower and less varied than full-time scores — the most frequent half-time results are 0-0 (~35–40%), 1-0, and 0-1. Because the range of outcomes is narrower, prices are lower than full-time correct score but still offer multi-fold returns.',
   'Everton vs Wolves. Half-Time Correct Score: 0-0 @ 2.40, 1-0 Everton @ 5.00, 0-1 Wolves @ 6.00, 1-1 @ 9.00, other @ 15.00+. You back 0-0 at half time @ 2.40, stake £20. Half-time: 0-0 — bet wins. Return = £48. Profit = £28. If Wolves lead 1-0 at half time, your bet is lost regardless of the full-time result.',
   'High volatility, lower than full-time correct score but still significant. 0-0 at half time occurs in a third to 40% of matches in most leagues, making it genuinely frequent — but the price (2.20–2.60) reflects that and margins remain high.',
   ARRAY[
     'Assuming the half-time leader always wins — the half-time leader loses the match in roughly 15–20% of cases.',
     'Conflating this with full-time correct score — settlement is strictly at 45+stoppage minutes; goals in extra half-time stoppage that are disallowed or occur before official confirmation can occasionally cause confusion.',
     'Underestimating 0-0 frequency at half time — ~35–40% of matches are goalless at the break, making 0-0 genuinely the most common individual half-time result.',
     'Using half-time correct score inside an accumulator — combined probabilities collapse rapidly, and bookmaker margins compound across legs.'
   ]),

  ('correct-score-scorecast',
   'Scorecast',
   3,
   'A combination bet linking a named player to score the first goal AND the correct full-time result. Both parts must be correct for the bet to win. Because it combines two separate low-probability events, the odds are very high — typically 15.00 to 150.00. Scorecast is popular for weekend football coupons precisely because of the large potential returns from small stakes.',
   'You back Mohamed Salah to score first AND Liverpool to win 2-1 @ 28.00. Stake: £5. Salah scores in the 12th minute. Final score: Liverpool 2-1 Arsenal. Both conditions met — bet wins. Return = £140. Profit = £135. If Salah scores but Liverpool win 3-0 instead, the correct score part fails and the bet loses. If another Liverpool player scores first but the score is 2-1, the first scorer part fails.',
   'Extremely high volatility. Two independent improbable events must both occur. First-scorer markets carry roughly 6–10% hit rates per player in isolation; combine with a specific scoreline at 5–15% and the joint probability is often under 2%. Bookmaker margins on Scorecast can exceed 30%.',
   ARRAY[
     'Assuming Scorecast is a reasonable regular strategy — it is fundamentally an entertainment product with extremely high built-in margins.',
     'Not realising that both conditions must be exact — first scorer AND specific score, not just both teams having those results.',
     'Confusing Scorecast with Wincast — Wincast only requires the player to score anytime (not first) plus the correct team to win, making it easier to land but at lower odds.',
     'Placing large stakes on Scorecast because the odds look attractive — the margin embedded in the price typically exceeds what individual market prices would imply by a significant factor.'
   ])

) as t(slug, name, sort_order, explanation, worked_example, volatility_note, common_misreadings)
where c.slug = 'correct-score';


-- ── Player Props ──────────────────────────────────────────────
insert into public.bet_type_glossary (
  category_id, slug, name, sort_order,
  explanation, worked_example, volatility_note, common_misreadings, is_published
)
select
  c.id,
  t.slug, t.name, t.sort_order,
  t.explanation, t.worked_example, t.volatility_note, t.common_misreadings,
  true
from public.bet_categories c
cross join (values

  ('player-anytime-scorer',
   'Anytime Goalscorer',
   1,
   'A bet on a named player to score at least one goal at any point in the match. It does not matter when they score, how many goals they score, or whether their team wins. Own goals do not count. Substitutes who score count — but if the player does not take the field at all, most bookmakers void the bet and return stakes.',
   'Harry Kane is listed at 2.10 to score anytime vs Fulham. You stake £25. Kane scores with a header in the 55th minute — bet wins. Return = £52.50. Profit = £27.50. If Kane plays but does not score (0 goals), or only gets an assist, the bet loses. If Kane is listed in the starting line-up but substituted off without scoring, the bet still loses unless voided (check bookmaker rules on early substitutions).',
   'Medium-to-high volatility. Top strikers score in roughly 35–45% of matches. When including midfielders or wide players, anytime scorer rates drop to 15–25%. Prices typically reflect this — a first-choice striker priced at 2.00 has an implied probability of 50% but may genuinely score in only 40% of games, embedding a bookmaker margin.',
   ARRAY[
     'Assuming assists or key contributions count — only goals count; an assist does not trigger a win.',
     'Not checking substitution void rules — some bookmakers void if the player is subbed off before a specific minute (often 75); others require the player to not appear at all for a void.',
     'Overlooking that penalties count — a player who barely touches the ball but converts a penalty in the 90th minute wins the bet.',
     'Confusing anytime with first scorer — anytime is significantly easier to land and priced accordingly lower.'
   ]),

  ('player-first-scorer',
   'First Goalscorer',
   2,
   'You name a specific player to score the first goal of the match. Only one player can win this market per match. Own goals are excluded — if an own goal opens the scoring, the first goalscorer market is typically settled on the next goal scored by an outfield player (check bookmaker rules). If your player scores second, the bet loses. Non-appearance voids.',
   'Erling Haaland is priced at 3.75 as first goalscorer vs Crystal Palace. You stake £10. Haaland scores in the 8th minute — bet wins. Return = £37.50. Profit = £27.50. If Bernardo Silva scores in the 3rd minute and Haaland scores in the 50th, your bet on Haaland loses despite him scoring. If Haaland does not play, stake returned.',
   'High volatility. Only one player can be first scorer, and the probability is highly game-state dependent. A striker may have a 40% anytime scorer rate but only an 8–10% first scorer rate. Early substitutions, own goals, and random goal timing all inject variance that is essentially unmodelable.',
   ARRAY[
     'Assuming the top scorer is the most likely first scorer — goal timing is random; the first goal is not biased toward the team''s best scorer.',
     'Not reading the own goal rule — bookmakers differ widely on whether an own goal voids first scorer or is skipped.',
     'Treating first scorer as a reliable value play — the margin on first scorer markets is consistently high (often 15–25% overround).',
     'Stacking first scorer picks in a multiple — the probability that a specific player scores first across three matches simultaneously is extremely small.'
   ]),

  ('player-to-be-carded',
   'Player to Receive a Card',
   3,
   'You bet on a named player to receive at least one yellow or red card at any point during the match. The market is almost always settled on yellow cards (cautions) rather than requiring a red. A red card counts as a win (a red is preceded by either a yellow or issued directly). The player must take the field for the bet to stand.',
   'A defensive midfielder known for aggressive play is listed at 3.50 to receive a card vs a physically combative opponent. You stake £15. The player receives a yellow card in the 34th minute for a late challenge — bet wins. Return = £52.50. Profit = £37.50. If the player plays the full 90 minutes without a booking, the bet loses. If the player does not take the field, stake is voided and returned.',
   'High volatility. Yellow card rates for aggressive midfielders peak at around 20–30% per game — meaning even the most bookable players fail to receive a card in 70–80% of matches. Referee tendencies, opposition style, and match context (a dead-rubber vs a cup final) dramatically alter booking rates in ways that statistical averages do not capture.',
   ARRAY[
     'Assuming high-foul-rate players are certain to be carded — referees vary enormously in their thresholds for cautioning players.',
     'Overlooking that late substitution can prevent a card — a player taken off in the 30th minute has far fewer opportunities to commit a bookable offence.',
     'Ignoring that second yellows (leading to red) settle as a win — the bet is on receiving any card, not surviving the match.',
     'Not checking whether the bookmaker settles on yellow-only or any card — most settle on the first card received regardless of colour.'
   ]),

  ('player-shots-on-target',
   'Player Shots on Target',
   4,
   'An over/under bet on how many shots on target a specific player will register in the match. The most common lines are Over/Under 0.5 (at least one shot on target) or Over/Under 1.5. A shot is on target if it would have gone in had the goalkeeper not intervened, or if it goes in as a goal. Shots that hit the post or go wide are not on target even if close.',
   'Mohamed Salah is listed: Over 0.5 shots on target @ 1.55, Over 1.5 @ 2.40, Under 0.5 @ 2.30. You stake £20 on Over 1.5 (at least 2 shots on target). Salah has 2 shots on target: one saved, one goal — bet wins. Return = £48. Profit = £28. If Salah has 1 shot on target (a goal), Over 1.5 loses even though he scored.',
   'Medium-to-high volatility on the 1.5 line; lower on the 0.5 line. Shot volume depends heavily on match state — a team that goes 2-0 up early may see their striker play conservatively; a team chasing the game creates more shooting opportunities for their attacker. This context-dependency makes model predictions less reliable.',
   ARRAY[
     'Assuming a goalscorer always hits Over 1.5 shots on target — a player can score with their only shot of the match.',
     'Confusing shots on target with total shots — blocked shots and efforts wide or over the bar do not count toward on-target totals.',
     'Ignoring match state — a dominant team going 3-0 up often takes its foot off the gas, reducing individual player shot counts.',
     'Not checking if the line is per-game or per-half — some bookmakers offer half-time shot markets under the same label; always confirm the settlement period.'
   ]),

  ('player-assists',
   'Player Assists',
   5,
   'A bet on a named player to register at least one assist in the match. An assist is credited to the player who makes the final pass directly leading to a goal. Definitions vary by bookmaker — some use Opta''s "key pass" definition (last pass before goal), others are stricter. Own goals do not generate an assist. The player must appear in the match.',
   'Kevin De Bruyne is listed at 3.00 to register an assist. You stake £20. De Bruyne plays a through ball to Haaland who scores — assist credited. Return = £60. Profit = £40. If De Bruyne''s pass goes to a player who shoots, the ball deflects off a defender, and then Haaland taps in, most bookmakers will credit the deflected player''s effort rather than De Bruyne — check the specific bookmaker''s assist definition before staking.',
   'High volatility. Even the most creative midfielders register assists in only 20–30% of matches. Assist markets are highly dependent on team goal output — a match that ends 0-0 or 1-0 where the scorer found the net themselves generates no assist opportunity. Multiple goals in a match increase the probability but remain uncertain.',
   ARRAY[
     'Assuming a creative player guarantees an assist — assists require both a goal to be scored AND that player''s pass to be the final one.',
     'Not reading the bookmaker''s specific assist definition — definitions differ on whether second assists (passes leading to the key pass) count, and whether own goals triggered by a pass count.',
     'Stacking assist accumulators — assist rates are low per match (~20–30% for top creators) and each leg depends on the team scoring at all.',
     'Ignoring that De Bruyne-style creators often play deeper when a team is winning comfortably — role and match state significantly affect assist opportunity.'
   ])

) as t(slug, name, sort_order, explanation, worked_example, volatility_note, common_misreadings)
where c.slug = 'player-props';
