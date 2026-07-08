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
  G1:  { name: "Super League",        country: "Greece",   tier: 1 },
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
