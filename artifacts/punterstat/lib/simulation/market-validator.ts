/**
 * Bet Simulator — Custom Market Validator & Scoreline Evaluator.
 *
 * Validates any user-entered football betting option and determines:
 *   1. `simulatable`      — Recognized full-time goal market we can evaluate across 1,000 simulated scorelines.
 *   2. `unsupported_data` — Valid real football market (e.g. 1st Half, Corners, Cards, Player Props) that
 *                           cannot be simulated accurately from full-time goal distributions alone.
 *   3. `invalid`          — Unrecognized or ambiguous input.
 */

export type MarketValidationStatus = "simulatable" | "unsupported_data" | "invalid";

export type ScorelineOutcome = "won" | "lost" | "void";

export interface MarketValidationResult {
  status: MarketValidationStatus;
  canonicalLabel: string;
  category: string;
  reason: string;
  suggestion?: string;
  evaluate?: (homeGoals: number, awayGoals: number) => ScorelineOutcome;
}

export const PRESET_SIM_MARKETS: readonly string[] = [
  "Home Win",
  "Draw",
  "Away Win",
  "1X",
  "X2",
  "12",
  "Over 1.5",
  "Over 2.5",
  "Under 2.5",
  "Under 3.5",
  "BTTS Yes",
  "BTTS No",
  "Home (2:0)",
  "Home (3:0)",
  "Away (0:2)",
  "Away (0:3)",
  "Home DNB",
  "Away DNB",
  "Home Over 0.5",
  "Away Over 0.5",
] as const;

function parseGoalLine(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 12) return null;
  return n;
}

function evalOver(goals: number, line: number): ScorelineOutcome {
  if (goals > line) return "won";
  if (goals === line) return "void";
  return "lost";
}

function evalUnder(goals: number, line: number): ScorelineOutcome {
  if (goals < line) return "won";
  if (goals === line) return "void";
  return "lost";
}

/** Check whether a market string matches a real football market that requires data beyond full-time goals. */
function detectUnsupportedRealMarket(lower: string): MarketValidationResult | null {
  if (/\b(1st\s*half|first\s*half|1h|ht\b|half[\s-]*time|ht\/ft|2nd\s*half|second\s*half|2h)\b/i.test(lower)) {
    return {
      status: "unsupported_data",
      canonicalLabel: "Half-Time / Period Market",
      category: "Period market",
      reason: "Valid football market, but our simulator only models full-time (90 min) scorelines right now.",
      suggestion: "Try the full-time version (e.g. 1X, X2, or Over 1.5).",
    };
  }
  if (/\b(corner|corners)\b/i.test(lower)) {
    return {
      status: "unsupported_data",
      canonicalLabel: "Corners Market",
      category: "Micro-market",
      reason: "Valid football market, but the match simulator runs on goals — corners aren't simulated per trial yet.",
      suggestion: "Use Slip Checker to analyze Corners markets on your ticket.",
    };
  }
  if (/\b(card|cards|yellow|red\s*card|booking|bookings|foul|fouls)\b/i.test(lower)) {
    return {
      status: "unsupported_data",
      canonicalLabel: "Cards / Bookings Market",
      category: "Micro-market",
      reason: "Valid football market, but cards & bookings aren't simulated in the goal-scoreline engine yet.",
      suggestion: "Use Slip Checker to analyze Cards markets on your ticket.",
    };
  }
  if (/\b(scorer|goalscorer|anytime|first\s*to\s*score|last\s*to\s*score|assist|shots?\s*on\s*target|player)\b/i.test(lower)) {
    return {
      status: "unsupported_data",
      canonicalLabel: "Player Prop Market",
      category: "Player prop",
      reason: "Valid football market, but player-level stats aren't in our current match dataset.",
      suggestion: "Try a team-goal market instead (e.g. Home Over 0.5 or Home Over 1.5).",
    };
  }
  if (/\b(penalty|penalties|offside|offsides|throw[\s-]*in|var\b|own\s*goal|minute|10\s*min|15\s*min)\b/i.test(lower)) {
    return {
      status: "unsupported_data",
      canonicalLabel: "Match Event Market",
      category: "Event market",
      reason: "Valid football market, but minute-by-minute event data isn't available in the simulator.",
      suggestion: "Try a full-time goal or handicap market instead.",
    };
  }
  return null;
}

/**
 * Parse a single atomic full-time goal predicate (used directly and inside combo markets).
 */
function parseAtomicMarket(
  raw: string,
  homeName: string,
  awayName: string,
): { label: string; category: string; evaluate: (h: number, a: number) => ScorelineOutcome } | null {
  let s = raw.trim();
  if (!s) return null;

  // Strip common bookmaker prefixes like "1X2: ", "Double Chance: ", "GG/NG: ", "Handicap 3:0 - "
  const ehPrefix = s.match(/^(?:european\s+)?handicap\s*\(?(\d+)\s*:\s*(\d+)\)?\s*[-:]?\s*(home|away|draw|1|2|x)$/i);
  if (ehPrefix) {
    const hStart = Number(ehPrefix[1]);
    const aStart = Number(ehPrefix[2]);
    const pick = ehPrefix[3].toLowerCase();
    const sideLabel = pick === "1" || pick === "home" ? "Home" : pick === "2" || pick === "away" ? "Away" : "Draw";
    return {
      label: `${sideLabel} (${hStart}:${aStart})`,
      category: "European Handicap",
      evaluate: (h, a) => {
        const adjH = h + hStart;
        const adjA = a + aStart;
        if (sideLabel === "Home") return adjH > adjA ? "won" : "lost";
        if (sideLabel === "Away") return adjA > adjH ? "won" : "lost";
        return adjH === adjA ? "won" : "lost";
      },
    };
  }

  s = s
    .replace(/^(?:1x2|match\s*result|full\s*time|double\s*chance|dc|over\/under|o\/u|totals?|gg\/ng|btts|both\s*teams\s*to\s*score|draw\s*no\s*bet|dnb)\s*[:\-]\s*/i, "")
    .trim();

  const lower = s.toLowerCase();
  const hLow = homeName.trim().toLowerCase();
  const aLow = awayName.trim().toLowerCase();

  // Replace explicit team names with "home" / "away" for flexible parsing
  const teamNormalized = (() => {
    let out = lower;
    if (hLow.length >= 3 && out.includes(hLow)) {
      out = out.split(hLow).join("home");
    }
    if (aLow.length >= 3 && out.includes(aLow)) {
      out = out.split(aLow).join("away");
    }
    return out;
  })();

  // 1. European Handicap: "Home (2:0)", "Away (0:2)", "Draw (1:0)"
  const ehMatch = teamNormalized.match(/^(home|away|draw|1|2|x)\s*\(\s*(\d+)\s*:\s*(\d+)\s*\)$/i);
  if (ehMatch) {
    const pick = ehMatch[1].toLowerCase();
    const hStart = Number(ehMatch[2]);
    const aStart = Number(ehMatch[3]);
    const sideLabel = pick === "1" || pick === "home" ? "Home" : pick === "2" || pick === "away" ? "Away" : "Draw";
    return {
      label: `${sideLabel} (${hStart}:${aStart})`,
      category: "European Handicap",
      evaluate: (h, a) => {
        const adjH = h + hStart;
        const adjA = a + aStart;
        if (sideLabel === "Home") return adjH > adjA ? "won" : "lost";
        if (sideLabel === "Away") return adjA > adjH ? "won" : "lost";
        return adjH === adjA ? "won" : "lost";
      },
    };
  }

  // 2. Asian / signed handicap: "Home -1.5", "Away +1.5", "Home +2", "Away -1"
  const ahMatch = teamNormalized.match(/^(home|away)\s*([+-]\d+(?:\.\d+)?)$/);
  if (ahMatch) {
    const side = ahMatch[1];
    const line = Number(ahMatch[2]);
    if (Number.isFinite(line) && Math.abs(line) <= 6) {
      const sign = line >= 0 ? `+${line}` : `${line}`;
      return {
        label: `${side === "home" ? "Home" : "Away"} ${sign}`,
        category: "Handicap",
        evaluate: (h, a) => {
          const diff = side === "home" ? h + line - a : a + line - h;
          if (diff > 0) return "won";
          if (diff === 0) return "void";
          return "lost";
        },
      };
    }
  }

  // 3. Correct Score: "Correct Score 2-1", "CS 1:1", "2-1", "0:0"
  const csMatch = teamNormalized.match(/^(?:correct\s*score|cs)?\s*(\d)\s*[-:]\s*(\d)$/);
  if (csMatch && !/^(1|2)$/.test(teamNormalized)) {
    const targetH = Number(csMatch[1]);
    const targetA = Number(csMatch[2]);
    return {
      label: `Correct Score ${targetH}-${targetA}`,
      category: "Correct Score",
      evaluate: (h, a) => (h === targetH && a === targetA ? "won" : "lost"),
    };
  }

  // 4. Team Goals: "Home Over 0.5", "Away Under 1.5", "Home Team Goals Over 1.5"
  const teamTotal = teamNormalized.match(
    /^(home|away)(?:\s+team)?(?:\s+goals?)?\s+(over|under|o|u)\s*(\d+(?:\.\d+)?)(?:\s+goals?)?$/,
  );
  if (teamTotal) {
    const side = teamTotal[1];
    const dir = teamTotal[2].startsWith("o") ? "Over" : "Under";
    const line = parseGoalLine(teamTotal[3]);
    if (line !== null) {
      return {
        label: `${side === "home" ? "Home" : "Away"} ${dir} ${line}`,
        category: "Team Goals",
        evaluate: (h, a) => {
          const g = side === "home" ? h : a;
          return dir === "Over" ? evalOver(g, line) : evalUnder(g, line);
        },
      };
    }
  }

  // 5. Win to Nil / Clean Sheet
  if (/^home\s+(?:to\s+)?win\s+to\s+nil$/.test(teamNormalized)) {
    return {
      label: "Home Win to Nil",
      category: "Team Special",
      evaluate: (h, a) => (h > a && a === 0 ? "won" : "lost"),
    };
  }
  if (/^away\s+(?:to\s+)?win\s+to\s+nil$/.test(teamNormalized)) {
    return {
      label: "Away Win to Nil",
      category: "Team Special",
      evaluate: (h, a) => (a > h && h === 0 ? "won" : "lost"),
    };
  }
  if (/^home\s+clean\s+sheet(?:\s+yes)?$/.test(teamNormalized)) {
    return {
      label: "Home Clean Sheet",
      category: "Team Special",
      evaluate: (_h, a) => (a === 0 ? "won" : "lost"),
    };
  }
  if (/^away\s+clean\s+sheet(?:\s+yes)?$/.test(teamNormalized)) {
    return {
      label: "Away Clean Sheet",
      category: "Team Special",
      evaluate: (h) => (h === 0 ? "won" : "lost"),
    };
  }

  // 6. Draw No Bet
  if (/^(home\s+dnb|dnb\s+home|home\s+draw\s+no\s+bet|draw\s+no\s+bet\s+home)$/.test(teamNormalized)) {
    return {
      label: "Home DNB",
      category: "Draw No Bet",
      evaluate: (h, a) => (h > a ? "won" : h === a ? "void" : "lost"),
    };
  }
  if (/^(away\s+dnb|dnb\s+away|away\s+draw\s+no\s+bet|draw\s+no\s+bet\s+away)$/.test(teamNormalized)) {
    return {
      label: "Away DNB",
      category: "Draw No Bet",
      evaluate: (h, a) => (a > h ? "won" : h === a ? "void" : "lost"),
    };
  }

  // 7. Double Chance
  if (/^(1x|home\s+or\s+draw|draw\s+or\s+home)$/.test(teamNormalized)) {
    return { label: "1X", category: "Double Chance", evaluate: (h, a) => (h >= a ? "won" : "lost") };
  }
  if (/^(x2|2x|draw\s+or\s+away|away\s+or\s+draw)$/.test(teamNormalized)) {
    return { label: "X2", category: "Double Chance", evaluate: (h, a) => (a >= h ? "won" : "lost") };
  }
  if (/^(12|home\s+or\s+away|away\s+or\s+home|either\s+team\s+to\s+win)$/.test(teamNormalized)) {
    return { label: "12", category: "Double Chance", evaluate: (h, a) => (h !== a ? "won" : "lost") };
  }

  // 8. 1X2
  if (/^(home\s+win|home\s+to\s+win|home|1|w1)$/.test(teamNormalized)) {
    return { label: "Home Win", category: "1X2", evaluate: (h, a) => (h > a ? "won" : "lost") };
  }
  if (/^(away\s+win|away\s+to\s+win|away|2|w2)$/.test(teamNormalized)) {
    return { label: "Away Win", category: "1X2", evaluate: (h, a) => (a > h ? "won" : "lost") };
  }
  if (/^(draw|x|tie)$/.test(teamNormalized)) {
    return { label: "Draw", category: "1X2", evaluate: (h, a) => (h === a ? "won" : "lost") };
  }

  // 9. BTTS / GG-NG
  if (/^(btts\s*yes|btts|gg|both\s+teams\s+to\s+score(?:\s+yes)?|yes)$/.test(teamNormalized)) {
    return { label: "BTTS Yes", category: "BTTS", evaluate: (h, a) => (h > 0 && a > 0 ? "won" : "lost") };
  }
  if (/^(btts\s*no|ng|no\s*btts|both\s+teams\s+to\s+score\s+no|no)$/.test(teamNormalized)) {
    return { label: "BTTS No", category: "BTTS", evaluate: (h, a) => (h === 0 || a === 0 ? "won" : "lost") };
  }

  // 10. Total Goals Over/Under (including whole-number Asian totals like "Over 2")
  const totalMatch = teamNormalized.match(/^(over|under|o|u)\s*(\d+(?:\.\d+)?)(?:\s+goals?)?$/);
  if (totalMatch) {
    const dir = totalMatch[1].startsWith("o") ? "Over" : "Under";
    const line = parseGoalLine(totalMatch[2]);
    if (line !== null) {
      return {
        label: `${dir} ${line}`,
        category: "Total Goals",
        evaluate: (h, a) => (dir === "Over" ? evalOver(h + a, line) : evalUnder(h + a, line)),
      };
    }
  }

  // 11. Odd / Even total goals
  if (/^(odd|odd\s+goals)$/.test(teamNormalized)) {
    return { label: "Odd Goals", category: "Total Goals", evaluate: (h, a) => ((h + a) % 2 === 1 ? "won" : "lost") };
  }
  if (/^(even|even\s+goals)$/.test(teamNormalized)) {
    return { label: "Even Goals", category: "Total Goals", evaluate: (h, a) => ((h + a) % 2 === 0 ? "won" : "lost") };
  }

  return null;
}

/**
 * Validate any user-entered betting option and return whether it can be simulated
 * with our current full-time Dixon-Coles goal model.
 */
export function validateSimulationMarket(
  rawInput: string,
  homeTeam = "",
  awayTeam = "",
): MarketValidationResult {
  const input = rawInput.trim();
  if (!input) {
    return {
      status: "invalid",
      canonicalLabel: "",
      category: "Empty",
      reason: "Enter a betting option or choose a preset.",
    };
  }

  const lower = input.toLowerCase();

  // 1. Check for recognized real markets that need data beyond full-time goals
  const unsupported = detectUnsupportedRealMarket(lower);
  if (unsupported) return unsupported;

  // 2. Check for OR combos: "Home or Over 2.5", "Away or Over 2.5"
  if (/\bor\b/i.test(input) && !/^(home\s+or\s+draw|draw\s+or\s+home|draw\s+or\s+away|away\s+or\s+draw|home\s+or\s+away|away\s+or\s+home)$/i.test(input)) {
    const parts = input.split(/\s+or\s+/i).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      const left = parseAtomicMarket(parts[0], homeTeam, awayTeam);
      const right = parseAtomicMarket(parts[1], homeTeam, awayTeam);
      if (left && right) {
        return {
          status: "simulatable",
          canonicalLabel: `${left.label} or ${right.label}`,
          category: "Combo (OR)",
          reason: "Valid full-time combo — ready to simulate across 1,000 trials.",
          evaluate: (h, a) => {
            const r1 = left.evaluate(h, a);
            const r2 = right.evaluate(h, a);
            if (r1 === "won" || r2 === "won") return "won";
            if (r1 === "void" || r2 === "void") return "void";
            return "lost";
          },
        };
      }
    }
  }

  // 3. Check for AND combos: "Home & Over 1.5", "1X & Under 3.5", "Away + BTTS"
  if (/\band\b|[&+]/i.test(input) && !/[+-]\d/.test(input)) {
    const parts = input.split(/\s*(?:\band\b|[&+])\s*/i).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 2) {
      const left = parseAtomicMarket(parts[0], homeTeam, awayTeam);
      const right = parseAtomicMarket(parts[1], homeTeam, awayTeam);
      if (left && right) {
        return {
          status: "simulatable",
          canonicalLabel: `${left.label} & ${right.label}`,
          category: "Combo (AND)",
          reason: "Valid full-time combo — ready to simulate across 1,000 trials.",
          evaluate: (h, a) => {
            const r1 = left.evaluate(h, a);
            const r2 = right.evaluate(h, a);
            if (r1 === "lost" || r2 === "lost") return "lost";
            if (r1 === "won" && r2 === "won") return "won";
            return "void";
          },
        };
      }
    }
  }

  // 4. Atomic full-time goal market
  const atomic = parseAtomicMarket(input, homeTeam, awayTeam);
  if (atomic) {
    return {
      status: "simulatable",
      canonicalLabel: atomic.label,
      category: atomic.category,
      reason: `Recognized (${atomic.category}) — ready to simulate with current match data.`,
      evaluate: atomic.evaluate,
    };
  }

  return {
    status: "invalid",
    canonicalLabel: "",
    category: "Unrecognized",
    reason: 'Unrecognized option — try e.g. "Home (2:0)", "Over 2.5", "BTTS Yes", "Home Over 0.5", or "1X & Under 3.5".',
  };
}
