export interface LeagueInfo {
  name: string;
  country: string;
  tier: number;
}

export const LEAGUE_MAP: Record<string, LeagueInfo> = {
  E0:  { name: "Premier League",      country: "England",  tier: 1 },
  E1:  { name: "Championship",        country: "England",  tier: 2 },
  E2:  { name: "League One",          country: "England",  tier: 3 },
  E3:  { name: "League Two",          country: "England",  tier: 4 },
  EC:  { name: "National League",     country: "England",  tier: 5 },
  SP1: { name: "La Liga",             country: "Spain",    tier: 1 },
  SP2: { name: "Segunda División",    country: "Spain",    tier: 2 },
  D1:  { name: "Bundesliga",          country: "Germany",  tier: 1 },
  D2:  { name: "2. Bundesliga",       country: "Germany",  tier: 2 },
  I1:  { name: "Serie A",             country: "Italy",    tier: 1 },
  I2:  { name: "Serie B",             country: "Italy",    tier: 2 },
  F1:  { name: "Ligue 1",             country: "France",   tier: 1 },
  F2:  { name: "Ligue 2",             country: "France",   tier: 2 },
  N1:  { name: "Eredivisie",          country: "Netherlands", tier: 1 },
  B1:  { name: "First Division A",    country: "Belgium",  tier: 1 },
  P1:  { name: "Primeira Liga",       country: "Portugal", tier: 1 },
  T1:  { name: "Süper Lig",           country: "Turkey",   tier: 1 },
  SC0: { name: "Scottish Premiership",country: "Scotland", tier: 1 },
  SC1: { name: "Scottish Championship",country:"Scotland", tier: 2 },
  SC2: { name: "Scottish League One", country: "Scotland", tier: 3 },
  SC3: { name: "Scottish League Two", country: "Scotland", tier: 4 },
  G1:  { name: "Super League",        country: "Greece",   tier: 1 },
  // African domestic leagues (SportsAPIPro)
  NG1: { name: "Nigeria Premier Football League", country: "Nigeria",      tier: 1 },
  DZ1: { name: "Algerian Ligue 1",                country: "Algeria",      tier: 1 },
  EG1: { name: "Egyptian Premier League",         country: "Egypt",        tier: 1 },
  SN1: { name: "Senegal Ligue 1",                 country: "Senegal",      tier: 1 },
  MA1: { name: "Botola Pro",                      country: "Morocco",      tier: 1 },
  TN1: { name: "Tunisian Ligue 1",                country: "Tunisia",      tier: 1 },
  ZA1: { name: "Betway Premiership (PSL)",        country: "South Africa", tier: 1 },
  GH1: { name: "Ghana Premier League",            country: "Ghana",        tier: 1 },
  KE1: { name: "FKF Premier League",              country: "Kenya",        tier: 1 },
  // Continental club competitions (SportsAPIPro)
  UCL:   { name: "UEFA Champions League",   country: "Europe",        tier: 1 },
  UEL:   { name: "UEFA Europa League",      country: "Europe",        tier: 1 },
  UECL:  { name: "UEFA Conference League",  country: "Europe",        tier: 1 },
  CAFCL: { name: "CAF Champions League",    country: "Africa",        tier: 1 },
  LIB:   { name: "Copa Libertadores",       country: "South America", tier: 1 },
  // Global top flights (SportsAPIPro)
  SAU: { name: "Saudi Pro League",          country: "Saudi Arabia",  tier: 1 },
  AUS: { name: "A-League Men",              country: "Australia",     tier: 1 },
  KOR: { name: "K League 1",                country: "South Korea",   tier: 1 },
  COL: { name: "Categoría Primera A",       country: "Colombia",      tier: 1 },
  // Global Extra leagues (football-data.co.uk/new/)
  ARG: { name: "Liga Profesional",        country: "Argentina",   tier: 1 },
  AUT: { name: "Austrian Bundesliga",     country: "Austria",     tier: 1 },
  BRA: { name: "Brasileirão Série A",     country: "Brazil",      tier: 1 },
  CHN: { name: "Chinese Super League",    country: "China",       tier: 1 },
  DNK: { name: "Danish Superliga",        country: "Denmark",     tier: 1 },
  FIN: { name: "Veikkausliiga",           country: "Finland",     tier: 1 },
  IRL: { name: "League of Ireland",       country: "Ireland",     tier: 1 },
  JPN: { name: "J1 League",               country: "Japan",       tier: 1 },
  MEX: { name: "Liga MX",                 country: "Mexico",      tier: 1 },
  NOR: { name: "Eliteserien",             country: "Norway",      tier: 1 },
  POL: { name: "Ekstraklasa",             country: "Poland",      tier: 1 },
  ROU: { name: "Liga I",                  country: "Romania",     tier: 1 },
  RUS: { name: "Russian Premier League",  country: "Russia",      tier: 1 },
  SWE: { name: "Allsvenskan",             country: "Sweden",      tier: 1 },
  SWZ: { name: "Swiss Super League",      country: "Switzerland", tier: 1 },
  USA: { name: "MLS",                     country: "USA",         tier: 1 },
};

export function leagueName(code: string): string {
  return LEAGUE_MAP[code]?.name ?? code;
}

/**
 * Derive football season label from a match date.
 * Football seasons run August–May; a July date kicks off the new season.
 * Returns "2023/24" style label.
 */
export function deriveSeason(matchDate: string): string {
  const d = new Date(matchDate);
  if (isNaN(d.getTime())) return "unknown";
  const year  = d.getFullYear();
  const month = d.getMonth() + 1; // 1-indexed
  const startYear = month >= 7 ? year : year - 1;
  const endYY = String(startYear + 1).slice(2).padStart(2, "0");
  return `${startYear}/${endYY}`;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
