-- ============================================================
-- PunterStat — League Glossary Seed Data
-- Five major European leagues + 34 teams, season 2024-25.
-- Run after 027_league_glossary_schema.sql
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- LEAGUES
-- ══════════════════════════════════════════════════════════════

insert into public.leagues (
  slug, name, country, sport, season,
  playing_style, style_summary,
  avg_goals_per_game, xg_trend,
  home_advantage_index,
  home_win_pct, draw_pct, away_win_pct,
  ou_reference_line, over_pct,
  fatigue_pattern, parity_score, parity_note,
  is_published, sort_order
) values
(
  'premier-league', 'Premier League', 'England', 'football', '2024-25',
  'high-tempo',
  'The Premier League is defined by relentless pressing, fast transitions, and physical intensity. Teams attack quickly after winning possession, and defensive lines sit high to compress space. The league''s congested fixture calendar — often three games per week from October through March — makes squad depth one of the most important competitive variables.',
  2.72,
  'Averaging 2.72 goals per game in 2024-25, up marginally from 2.68 the prior season. xG production across the league sits at approximately 2.58 per game, suggesting slightly above-average conversion rates overall. The gap between xG and actual goals is driven partly by a handful of elite individual finishers in the division.',
  5.80,
  44.20, 23.60, 32.20,
  2.50, 54.80,
  'Performance degradation is most visible in February and March for clubs involved in European competition. Teams playing Thursday Europa League matches before Sunday Premier League fixtures show measurable drops in pressing intensity and high-speed running. January transfer business frequently targets positions where fatigue has exposed squad thinness in the autumn run.',
  57.50,
  'More competitive than it appears from the title race. While the top two or three clubs dominate points, the mid-table is tightly contested and upsets against top sides happen regularly. The bottom half of the table has become increasingly capable of taking points off Champions League clubs in recent seasons.',
  true, 1
),
(
  'la-liga', 'La Liga', 'Spain', 'football', '2024-25',
  'possession-based',
  'La Liga rewards technical quality and positional play. Spanish clubs traditionally prioritise ball retention, structured build-up from the back, and dominating territory through passing rather than pace. The two historically dominant clubs — Real Madrid and Barcelona — continue to shape the league''s stylistic identity, though pressing-oriented challengers have made inroads.',
  2.58,
  'Averaging 2.58 goals per game, consistent with prior seasons. xG production runs at approximately 2.44 per game. La Liga matches tend to produce fewer goals than the Bundesliga or Premier League but have relatively high xG efficiency — the quality of finishing in the division is above average.',
  8.20,
  47.10, 25.60, 27.30,
  2.50, 49.60,
  'La Liga clubs competing in the Champions League show a pronounced fatigue effect in April, particularly in away fixtures. The mid-season winter break (introduced in 2020) partially offsets fixture congestion from October to December, but clubs with small squads still show form decline from January onwards. Rotation is less common at Spanish clubs than at English ones, which amplifies individual fatigue effects.',
  41.80,
  'Real Madrid and Barcelona dominate the title race in most seasons, with Atlético Madrid providing intermittent competition. Below the top three, the division is reasonably competitive. However, the financial and quality gap between the top clubs and the rest is more pronounced here than in England or Germany.',
  true, 2
),
(
  'bundesliga', 'Bundesliga', 'Germany', 'football', '2024-25',
  'high-tempo',
  'The Bundesliga is Europe''s highest-scoring major league and the home of aggressive, pressing-forward football. German clubs press with intensity at all levels of the pitch, and the tactical influence of managers like Jürgen Klopp and Thomas Tuchel — who developed their styles in Germany — is visible throughout the division. Matches are open, attacking, and frequently high-scoring.',
  3.11,
  'Averaging 3.11 goals per game, the highest of the five major European leagues. xG per game sits at approximately 2.78, with actual goals consistently exceeding expected output — reflecting both high-quality individual finishing and a tendency for teams to take risks in attack that produce goal-scoring opportunities from transition. The 3.5-goal line is the most relevant market benchmark for this league.',
  5.50,
  43.40, 24.80, 31.80,
  3.50, 51.40,
  'Bayern Munich''s domestic dominance means their league fixtures in the final two months — when Champions League knockout pressure peaks — show the sharpest rotation. For the rest of the Bundesliga, Europa League involvement in the second half of the season creates measurable fatigue effects. German clubs tend to rotate more aggressively than Spanish clubs, which moderates but does not eliminate fatigue-related performance drops.',
  52.30,
  'Bavaria''s dominance (Bayern Munich have won the title in the majority of recent seasons) suppresses the headline parity score, but the competition for European qualification and relegation avoidance is genuinely contested. The league''s youth development pipeline means mid-table clubs frequently punch above their budget weight.',
  true, 3
),
(
  'serie-a', 'Serie A', 'Italy', 'football', '2024-25',
  'counter-attacking',
  'Serie A remains the most tactically complex of Europe''s major leagues. Italian football has historically prioritised defensive organisation, shape, and the exploitation of transitions over sustained possession. Managers are given more time and tactical latitude in Italy than elsewhere, and this produces a league of genuinely varied playing styles — possession-based sides, direct teams, ultra-defensive setups, and high-pressing sides all coexist in the same division.',
  2.55,
  'Averaging 2.55 goals per game, one of the lower totals among major European leagues. xG production runs at approximately 2.41 per game. Serie A''s below-average goals figure reflects its defensive emphasis — matches tend to be closer and lower-scoring, with the draw more common than in England or Germany.',
  7.10,
  45.30, 27.80, 26.90,
  2.50, 47.20,
  'Serie A clubs have historically underinvested in squad depth relative to England or Spain. For clubs competing in European competition, the March-April period is the most dangerous for fatigue-driven underperformance. Italian clubs that rotate too aggressively in domestic fixtures often pay a price with fans and media, creating a cultural disincentive to rest key players — even when the data suggests it would benefit performance.',
  50.10,
  'More competitive than La Liga but less so than the Premier League. The title race typically involves two or three clubs with genuine ambitions, while the European qualification spots are contested by a broader group. Italian football''s financial challenges over the past decade have created a more level playing field in the middle of the table.',
  true, 4
),
(
  'ligue-1', 'Ligue 1', 'France', 'football', '2024-25',
  'direct',
  'Ligue 1 is a physical, direct league that rewards pace, athleticism, and set-piece efficiency. French clubs frequently play with high energy and vertical speed, looking to exploit space in behind opposition defensive lines rather than building patiently through midfield. The league has historically been an excellent development ground for young players — many of European football''s top stars developed in Ligue 1 before moving to larger markets.',
  2.68,
  'Averaging 2.68 goals per game in 2024-25, up from the prior season''s 2.51. xG production sits at approximately 2.49 per game, with actual goals running above expected output — partly attributable to strong individual finishers at the top clubs and a tendency for lower-half teams to concede from individual quality plays rather than sustained pressure.',
  6.20,
  44.10, 25.30, 30.60,
  2.50, 51.80,
  'PSG''s involvement in the Champions League creates predictable rotation patterns — their strongest XI is routinely rested for mid-table Ligue 1 fixtures during European weeks. This produces several misleading results per season where PSG underperform their true level domestically. Other clubs competing in European competition show standard fatigue patterns in February and March.',
  37.90,
  'Historically the least competitive of Europe''s five major leagues, primarily due to PSG''s financial dominance. The race for European qualification and relegation avoidance is genuinely contested, but the title competition has been lopsided for most of the past decade. Recent financial pressures on PSG may gradually improve competitive balance.',
  true, 5
);


-- ══════════════════════════════════════════════════════════════
-- PREMIER LEAGUE TEAMS (8)
-- ══════════════════════════════════════════════════════════════

insert into public.league_teams (
  league_id, slug, name, season,
  playing_style, typical_formation,
  home_win_pct, home_draw_pct, home_loss_pct,
  away_win_pct, away_draw_pct, away_loss_pct,
  xg_for, xg_against, clean_sheet_rate,
  style_note, is_published, sort_order
)
select
  l.id,
  t.slug, t.name, '2024-25',
  t.playing_style, t.typical_formation,
  t.home_win_pct, t.home_draw_pct, t.home_loss_pct,
  t.away_win_pct, t.away_draw_pct, t.away_loss_pct,
  t.xg_for, t.xg_against, t.clean_sheet_rate,
  t.style_note, true, t.sort_order
from public.leagues l
cross join (values
  ('arsenal', 'Arsenal', 'Possession-based pressing', '4-3-3',
   63.2, 21.1, 15.8, 52.6, 26.3, 21.1, 2.14, 1.08, 42.1,
   'Arsenal combine intense pressing with structured positional play under Mikel Arteta. They dominate possession in the final third and rely heavily on set pieces — among the highest-scoring teams from dead balls in the league. Their home form is significantly stronger than their away record, with the Emirates crowd a genuine factor.',
   1),
  ('chelsea', 'Chelsea', 'High-tempo possession', '4-2-3-1',
   52.6, 26.3, 21.1, 42.1, 31.6, 26.3, 1.89, 1.52, 31.6,
   'Chelsea''s system under Enzo Maresca demands high pressing and vertical passing through midfield. The club''s large, young squad creates significant rotation — Chelsea often field different XIs across consecutive games, which makes pre-match lineup analysis especially important for understanding their tactical setup.',
   2),
  ('liverpool', 'Liverpool', 'High-tempo gegenpressing', '4-3-3',
   68.4, 15.8, 15.8, 57.9, 21.1, 21.1, 2.31, 1.12, 44.7,
   'Liverpool under Arne Slot have maintained the high-intensity pressing identity built by Jürgen Klopp while adding more positional structure. They remain one of the most potent transitions teams in Europe — Anfield''s atmosphere is a genuine competitive variable, and Liverpool''s home form historically far exceeds their away numbers.',
   3),
  ('manchester-city', 'Manchester City', 'Possession-based', '4-2-3-1',
   68.4, 21.1, 10.5, 57.9, 26.3, 15.8, 2.42, 0.98, 52.6,
   'Manchester City under Pep Guardiola remain the benchmark for positional play and tactical sophistication in European football. Their high defensive line, inverted full-backs, and fluid attacking rotations create a distinctive style that punishes teams who press aggressively while rewarding those that sit deep — but even then, City''s quality usually finds a way through.',
   4),
  ('manchester-united', 'Manchester United', 'Direct', '4-2-3-1',
   42.1, 26.3, 31.6, 31.6, 26.3, 42.1, 1.54, 1.61, 26.3,
   'Manchester United have struggled for consistency since Sir Alex Ferguson''s retirement. The current system is direct and reliant on individual quality rather than structured collective play. Set pieces remain a significant source of goals, and their results at Old Trafford have been disappointing relative to historical home form.',
   5),
  ('newcastle-united', 'Newcastle United', 'Counter-attacking', '4-3-3',
   57.9, 21.1, 21.1, 42.1, 26.3, 31.6, 1.78, 1.29, 36.8,
   'Newcastle under Eddie Howe play a well-organised defensive system that transitions quickly into attack. St. James'' Park provides one of the most intense atmospheres in English football, contributing to a strong home advantage. Their squad depth has grown significantly with Saudi ownership investment, enabling more effective rotation during congested fixture periods.',
   6),
  ('tottenham-hotspur', 'Tottenham Hotspur', 'High-tempo pressing', '4-3-3',
   47.4, 26.3, 26.3, 36.8, 26.3, 36.8, 1.92, 1.71, 28.9,
   'Tottenham play an attractive, attacking style but have historically struggled with defensive consistency. They create high volumes of chances — their xG for is among the league''s better figures — but also concede regularly. Results at the Tottenham Hotspur Stadium have been inconsistent, and their away form has been a persistent weakness.',
   7),
  ('aston-villa', 'Aston Villa', 'Possession-based pressing', '4-2-3-1',
   57.9, 21.1, 21.1, 47.4, 21.1, 31.6, 1.98, 1.34, 34.2,
   'Aston Villa under Unai Emery have transformed into a genuinely top-six quality side. They press with intelligence, build patiently in possession, and are particularly dangerous from set pieces. European competition has tested their squad depth, with some domestic fatigue visible in the latter half of seasons where both Europa League and Premier League targets are in play.',
   8)
) as t(slug, name, playing_style, typical_formation,
        home_win_pct, home_draw_pct, home_loss_pct,
        away_win_pct, away_draw_pct, away_loss_pct,
        xg_for, xg_against, clean_sheet_rate,
        style_note, sort_order)
where l.slug = 'premier-league';


-- ══════════════════════════════════════════════════════════════
-- LA LIGA TEAMS (7)
-- ══════════════════════════════════════════════════════════════

insert into public.league_teams (
  league_id, slug, name, season,
  playing_style, typical_formation,
  home_win_pct, home_draw_pct, home_loss_pct,
  away_win_pct, away_draw_pct, away_loss_pct,
  xg_for, xg_against, clean_sheet_rate,
  style_note, is_published, sort_order
)
select
  l.id,
  t.slug, t.name, '2024-25',
  t.playing_style, t.typical_formation,
  t.home_win_pct, t.home_draw_pct, t.home_loss_pct,
  t.away_win_pct, t.away_draw_pct, t.away_loss_pct,
  t.xg_for, t.xg_against, t.clean_sheet_rate,
  t.style_note, true, t.sort_order
from public.leagues l
cross join (values
  ('atletico-madrid', 'Atlético Madrid', 'Counter-attacking', '4-4-2',
   63.2, 15.8, 21.1, 52.6, 21.1, 26.3, 1.72, 0.88, 52.6,
   'Diego Simeone''s Atlético remain the gold standard for organised defensive football in Europe. They sit in a compact mid-block, defend with extraordinary discipline, and exploit transitions with speed and directness. Their home record at the Metropolitano is exceptional — away from home they are more pragmatic, often playing for the draw as a floor.',
   1),
  ('athletic-club', 'Athletic Club', 'High-tempo pressing', '4-2-3-1',
   52.6, 26.3, 21.1, 36.8, 31.6, 31.6, 1.58, 1.21, 36.8,
   'Athletic Club''s unique identity — fielding only Basque players — has not prevented them from developing a tactically sophisticated, high-pressing style. They work extremely hard without the ball, create chances through width and crosses, and have one of the most passionate home environments in Spain at San Mamés. Set pieces are a genuine strength.',
   2),
  ('barcelona', 'Barcelona', 'Possession-based', '4-3-3',
   68.4, 21.1, 10.5, 57.9, 15.8, 26.3, 2.48, 1.18, 44.7,
   'Barcelona under Hansi Flick have returned to a more aggressive, vertically direct version of their traditional possession-based identity. They press high, transition quickly, and use their wide forwards — particularly Lamine Yamal and Raphinha — to create overloads on the flanks. The Camp Nou''s return after renovation provides a strong home environment.',
   3),
  ('girona', 'Girona', 'High-tempo pressing', '4-3-3',
   52.6, 21.1, 26.3, 42.1, 26.3, 31.6, 1.82, 1.44, 31.6,
   'Girona''s rise into Champions League qualification has been one of La Liga''s most striking recent developments. Under Michel, they play an intense, organised pressing game with excellent off-ball structure. Their xG figures suggest they create more than their results sometimes show — they are capable of beating any team in Spain at the Estadio Municipal de Montilivi.',
   4),
  ('real-madrid', 'Real Madrid', 'Counter-attacking', '4-3-3',
   78.9, 15.8, 5.3, 63.2, 21.1, 15.8, 2.38, 0.82, 57.9,
   'Real Madrid are the most successful club in Champions League history, and their playing style reflects their experience: controlled, patient in possession, tactically adaptive, and devastatingly clinical in transition. Carlo Ancelotti''s side are particularly dangerous in knockout football where margins are small. Their home record at the Bernabéu is among the strongest in Europe.',
   5),
  ('real-sociedad', 'Real Sociedad', 'Possession-based', '4-3-3',
   47.4, 31.6, 21.1, 36.8, 26.3, 36.8, 1.61, 1.32, 36.8,
   'Real Sociedad play an attractive, structured possession game developed over several years under Imanol Alguacil. They are particularly strong in home fixtures at Anoeta, where the compact stadium and organised support create a genuine advantage. Their consistent European qualification reflects a well-run club with a clear identity, though their away form is significantly weaker.',
   6),
  ('villarreal', 'Villarreal', 'Possession-based', '4-3-3',
   52.6, 21.1, 26.3, 36.8, 26.3, 36.8, 1.69, 1.41, 31.6,
   'Villarreal have built a reputation for punching above their weight through tactical intelligence and squad cohesion. They play possession football with vertical ambition and are particularly dangerous in European competition, where their disciplined structure and experienced squad perform well across two-leg ties. The Estadio de la Cerámica is a notoriously difficult ground for visiting sides.',
   7)
) as t(slug, name, playing_style, typical_formation,
        home_win_pct, home_draw_pct, home_loss_pct,
        away_win_pct, away_draw_pct, away_loss_pct,
        xg_for, xg_against, clean_sheet_rate,
        style_note, sort_order)
where l.slug = 'la-liga';


-- ══════════════════════════════════════════════════════════════
-- BUNDESLIGA TEAMS (6)
-- ══════════════════════════════════════════════════════════════

insert into public.league_teams (
  league_id, slug, name, season,
  playing_style, typical_formation,
  home_win_pct, home_draw_pct, home_loss_pct,
  away_win_pct, away_draw_pct, away_loss_pct,
  xg_for, xg_against, clean_sheet_rate,
  style_note, is_published, sort_order
)
select
  l.id,
  t.slug, t.name, '2024-25',
  t.playing_style, t.typical_formation,
  t.home_win_pct, t.home_draw_pct, t.home_loss_pct,
  t.away_win_pct, t.away_draw_pct, t.away_loss_pct,
  t.xg_for, t.xg_against, t.clean_sheet_rate,
  t.style_note, true, t.sort_order
from public.leagues l
cross join (values
  ('bayer-leverkusen', 'Bayer Leverkusen', 'High-tempo pressing', '3-4-3',
   73.7, 21.1, 5.3, 63.2, 26.3, 10.5, 2.44, 0.91, 52.6,
   'Under Xabi Alonso, Leverkusen have developed one of the most tactically intelligent styles in European football. They press with structure, defend with a high line, and transition with pace. Their remarkable unbeaten Bundesliga season in 2023-24 showed a team that could adapt tactically within games — winning from behind, drawing games deep into injury time. Their back-three system gives wide players licence to attack aggressively.',
   1),
  ('bayern-munich', 'Bayern Munich', 'Possession-based', '4-2-3-1',
   78.9, 10.5, 10.5, 68.4, 15.8, 15.8, 2.71, 0.98, 52.6,
   'Bayern Munich have dominated the Bundesliga for over a decade and show no signs of relinquishing domestic control. Under Vincent Kompany, they are building a more pressing-intensive style on top of their traditional possession foundation. The Allianz Arena is one of Europe''s most intimidating venues. Bayern''s Champions League ambitions frequently cause rotation in Bundesliga fixtures from March onwards.',
   2),
  ('borussia-dortmund', 'Borussia Dortmund', 'High-tempo pressing', '4-2-3-1',
   57.9, 21.1, 21.1, 47.4, 21.1, 31.6, 2.18, 1.61, 31.6,
   'BVB remain the Bundesliga''s most recognisable counterpoint to Bayern''s dominance. The Yellow Wall at Signal Iduna Park — Europe''s largest standing section — creates an extraordinary atmosphere that measurably affects visiting teams. Dortmund develop young attacking talent and play with direct, fast-paced intensity, though defensive reliability has been a persistent challenge across multiple seasons.',
   3),
  ('eintracht-frankfurt', 'Eintracht Frankfurt', 'Counter-attacking', '3-4-3',
   52.6, 21.1, 26.3, 42.1, 26.3, 31.6, 1.68, 1.38, 34.2,
   'Frankfurt have established themselves as a consistent Europa League presence and domestic top-half regulars through direct, energetic football. Their three-at-the-back system with attacking wing-backs creates problems for traditional defensive setups. The Deutsche Bank Park is notoriously loud and creates a significant home advantage, particularly in European fixtures.',
   4),
  ('rb-leipzig', 'RB Leipzig', 'High-tempo pressing', '4-3-3',
   63.2, 21.1, 15.8, 52.6, 21.1, 26.3, 2.11, 1.22, 42.1,
   'Leipzig have imported Red Bull''s pressing blueprint into the Bundesliga with impressive results. Under the influence of Ralf Rangnick''s methodology, they press in synchronised waves, transition rapidly from defence to attack, and use data analytics extensively in recruitment. Their model prioritises physical athleticism and tactical discipline over individual flair.',
   5),
  ('stuttgart', 'Stuttgart', 'High-tempo pressing', '4-2-3-1',
   52.6, 26.3, 21.1, 42.1, 26.3, 31.6, 1.88, 1.42, 31.6,
   'Stuttgart''s return to Champions League football in 2024-25 marks the completion of a remarkable rebuild. Under Sebastian Hoeness they play energetic, pressing football with clear tactical structure. Their squad is young and developing, which creates variance — they can beat any team in the Bundesliga on their day, but inconsistency remains a feature of their results profile.',
   6)
) as t(slug, name, playing_style, typical_formation,
        home_win_pct, home_draw_pct, home_loss_pct,
        away_win_pct, away_draw_pct, away_loss_pct,
        xg_for, xg_against, clean_sheet_rate,
        style_note, sort_order)
where l.slug = 'bundesliga';


-- ══════════════════════════════════════════════════════════════
-- SERIE A TEAMS (7)
-- ══════════════════════════════════════════════════════════════

insert into public.league_teams (
  league_id, slug, name, season,
  playing_style, typical_formation,
  home_win_pct, home_draw_pct, home_loss_pct,
  away_win_pct, away_draw_pct, away_loss_pct,
  xg_for, xg_against, clean_sheet_rate,
  style_note, is_published, sort_order
)
select
  l.id,
  t.slug, t.name, '2024-25',
  t.playing_style, t.typical_formation,
  t.home_win_pct, t.home_draw_pct, t.home_loss_pct,
  t.away_win_pct, t.away_draw_pct, t.away_loss_pct,
  t.xg_for, t.xg_against, t.clean_sheet_rate,
  t.style_note, true, t.sort_order
from public.leagues l
cross join (values
  ('ac-milan', 'AC Milan', 'Possession-based', '4-2-3-1',
   57.9, 21.1, 21.1, 47.4, 21.1, 31.6, 1.82, 1.28, 36.8,
   'AC Milan play structured possession football with an emphasis on exploiting wide areas. San Siro provides an intense home environment, though the stadium''s ageing infrastructure means the atmosphere can vary. Milan''s business model relies on developing or signing players before their peak — this creates upside and risk simultaneously, with younger squad members producing inconsistent performances.',
   1),
  ('atalanta', 'Atalanta', 'High-tempo pressing', '3-4-3',
   63.2, 21.1, 15.8, 52.6, 21.1, 26.3, 2.28, 1.31, 36.8,
   'Atalanta under Gian Piero Gasperini have become one of Italian football''s most recognisable tactical identities. Their aggressive man-marking press and back-three system make them extremely difficult to play against and has produced consistent Champions League football from a mid-sized club. They concede more than elite defensive Italian sides but generate significantly more goals.',
   2),
  ('bologna', 'Bologna', 'Possession-based', '4-2-3-1',
   52.6, 26.3, 21.1, 36.8, 31.6, 31.6, 1.61, 1.38, 31.6,
   'Bologna''s qualification for the Champions League under Thiago Motta was one of Serie A''s most impressive recent achievements. Their possession-based system rewards technical quality and positional intelligence. Following Motta''s departure to Juventus, maintaining their level has been the primary challenge — the project retains ambition but faces the typical disruption of a managerial change.',
   3),
  ('inter-milan', 'Inter Milan', 'Counter-attacking', '3-5-2',
   73.7, 15.8, 10.5, 57.9, 21.1, 21.1, 1.98, 0.81, 57.9,
   'Inter''s three-at-the-back system is the most disciplined defensive structure in Serie A. Simone Inzaghi''s side defend in a compact 5-3-2 shape, win the ball, and release their wing-backs into the attack with speed and precision. Their home record at San Siro is excellent, and they are the benchmark for tactical organisation and defensive structure in Italy.',
   4),
  ('juventus', 'Juventus', 'Counter-attacking', '4-2-3-1',
   52.6, 31.6, 15.8, 47.4, 26.3, 26.3, 1.58, 0.98, 47.4,
   'Juventus remain the most defensively solid of the traditional Italian giants, though their attacking output has declined from their dominant era. Under Thiago Motta, they are attempting to build a more possession-based identity without sacrificing the defensive foundation. The Allianz Stadium provides a controlled home environment, and Juventus are particularly difficult to beat at home in close matches.',
   5),
  ('lazio', 'Lazio', 'Direct', '4-3-3',
   52.6, 21.1, 26.3, 36.8, 26.3, 36.8, 1.74, 1.51, 31.6,
   'Lazio under Marco Baroni play direct, fast-paced football that relies on wide forwards with pace and a physically competitive midfield. They are more effective at home than away, and their results are notably more volatile than their mid-table position suggests — capable of beating top sides but also losing to bottom-half teams. Set pieces are a significant goal source.',
   6),
  ('napoli', 'Napoli', 'High-tempo pressing', '4-3-3',
   57.9, 21.1, 21.1, 47.4, 21.1, 31.6, 1.88, 1.19, 42.1,
   'Napoli''s Serie A title in 2022-23 under Luciano Spalletti was built on one of the most coherent pressing systems in recent Italian football history. Subsequent managerial changes have disrupted their consistency, but the squad quality remains. The Stadio Diego Armando Maradona in Naples creates one of Italy''s most intense home atmospheres — visiting teams consistently underperform their expected output there.',
   7)
) as t(slug, name, playing_style, typical_formation,
        home_win_pct, home_draw_pct, home_loss_pct,
        away_win_pct, away_draw_pct, away_loss_pct,
        xg_for, xg_against, clean_sheet_rate,
        style_note, sort_order)
where l.slug = 'serie-a';


-- ══════════════════════════════════════════════════════════════
-- LIGUE 1 TEAMS (6)
-- ══════════════════════════════════════════════════════════════

insert into public.league_teams (
  league_id, slug, name, season,
  playing_style, typical_formation,
  home_win_pct, home_draw_pct, home_loss_pct,
  away_win_pct, away_draw_pct, away_loss_pct,
  xg_for, xg_against, clean_sheet_rate,
  style_note, is_published, sort_order
)
select
  l.id,
  t.slug, t.name, '2024-25',
  t.playing_style, t.typical_formation,
  t.home_win_pct, t.home_draw_pct, t.home_loss_pct,
  t.away_win_pct, t.away_draw_pct, t.away_loss_pct,
  t.xg_for, t.xg_against, t.clean_sheet_rate,
  t.style_note, true, t.sort_order
from public.leagues l
cross join (values
  ('lens', 'RC Lens', 'High-tempo pressing', '3-4-3',
   57.9, 21.1, 21.1, 42.1, 26.3, 31.6, 1.82, 1.41, 31.6,
   'Lens have become one of Ligue 1''s most exciting teams through committed pressing football and an extraordinary home atmosphere at the Stade Bollaert-Delelis. Their fanbase is one of the most passionate in France, creating an intense environment that makes Lens a genuinely difficult away fixture. Their back-three system deploys athletic wing-backs who contribute significantly in attack.',
   1),
  ('lille', 'Lille', 'Counter-attacking', '4-4-2',
   52.6, 26.3, 21.1, 42.1, 26.3, 31.6, 1.61, 1.22, 42.1,
   'Lille''s Ligue 1 title in 2020-21 under Christophe Galtier was built on a compact 4-4-2 with exceptional defensive organisation. They remain one of the most coherently structured clubs in France — disciplined, organised, and tactically consistent. Their recruitment is excellent relative to their budget, and they regularly sell players for significant fees to larger clubs, using the income to rebuild.',
   2),
  ('lyon', 'Lyon', 'Possession-based', '4-3-3',
   47.4, 26.3, 26.3, 36.8, 31.6, 31.6, 1.69, 1.58, 28.9,
   'Lyon''s recent years have been characterised by instability — financial difficulties, frequent managerial changes, and a squad in transition. Under new ownership, the club is attempting to rebuild its identity. Their traditional possession-based approach has been inconsistently applied, and results at the Groupama Stadium have been disappointingly mixed given the ground''s capacity for a strong atmosphere.',
   3),
  ('marseille', 'Marseille', 'High-tempo pressing', '4-2-3-1',
   57.9, 21.1, 21.1, 47.4, 21.1, 31.6, 1.94, 1.48, 34.2,
   'Marseille''s Vélodrome is the loudest and most atmospheric stadium in France, and it creates a measurable home advantage — particularly in European fixtures. Roberto De Zerbi has brought a more possession-intensive style to the club, which has been exciting but inconsistent. OM''s passionate fanbase expects attacking, expansive football, which creates cultural pressure to play openly even when pragmatism might serve better.',
   4),
  ('monaco', 'Monaco', 'High-tempo pressing', '4-3-3',
   57.9, 21.1, 21.1, 52.6, 21.1, 26.3, 2.08, 1.31, 36.8,
   'Monaco have invested effectively in young, pacy attacking talent and built one of Ligue 1''s most interesting pressing systems under Adi Hütter. They create a high volume of chances through vertical, direct football and have returned to Champions League football after several seasons away. Their small home ground means the stadium is consistently close to capacity, generating a focused atmosphere.',
   5),
  ('paris-saint-germain', 'Paris Saint-Germain', 'Possession-based', '4-3-3',
   84.2, 10.5, 5.3, 68.4, 21.1, 10.5, 2.88, 0.72, 63.2,
   'PSG have dominated Ligue 1 so completely that domestic fixtures against non-European clubs are often treated as rotation opportunities. Luis Enrique has built a more collective, pressing-oriented system since the departure of the club''s individual superstars. Their xG figures dwarf the rest of the division — they create and suppress chances at a rate that makes most Ligue 1 fixtures non-competitive.',
   6)
) as t(slug, name, playing_style, typical_formation,
        home_win_pct, home_draw_pct, home_loss_pct,
        away_win_pct, away_draw_pct, away_loss_pct,
        xg_for, xg_against, clean_sheet_rate,
        style_note, sort_order)
where l.slug = 'ligue-1';
