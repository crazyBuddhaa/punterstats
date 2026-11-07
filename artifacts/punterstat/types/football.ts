export type NavPillar =
  | "home"
  | "matches"
  | "predictions"
  | "analysis"
  | "learning"
  | "teams-players"
  | "statistics"
  | "assist"; // Preserving Bet Assist tools (calculators, slip checker, tracker)

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface TeamFormMatch {
  opponent: string;
  score: string;
  result: "W" | "D" | "L";
  homeOrAway: "H" | "A";
  date: string;
}

export interface PlayerLineupItem {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  role: string;
  rating: number;
  goalsThisSeason: number;
  assistsThisSeason: number;
  shotsPer90: number;
  tacklesPer90: number;
  injuredOrSuspended?: boolean;
  statusNote?: string;
}

export interface InjurySuspension {
  playerName: string;
  team: string;
  position: string;
  reason: string;
  impactLevel: "critical" | "moderate" | "minor";
  expectedReturn: string;
}

export interface H2HMeeting {
  date: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeCorners: number;
  awayCorners: number;
  homeCards: number;
  awayCards: number;
  btts: boolean;
  over25: boolean;
  venue: string;
}

export interface MatchScoringInterval {
  interval: "0-15" | "16-30" | "31-45" | "46-60" | "61-75" | "76-90+";
  homeScored: number;
  homeConceded: number;
  awayScored: number;
  awayConceded: number;
}

export interface PlayerScoreMarket {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  anytimeOdds: number;
  anytimeProb: number;
  firstGoalOdds: number;
  firstGoalProb: number;
  shotsPer90: number;
  shotsOnTargetPer90: number;
  goalsLast5: number;
  evidence: string;
}

export interface DetailedMatchPrediction {
  market: string;
  selection: string;
  probability: number;
  odds: number;
  impliedProb: number;
  valueEdge: number;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  evidence: string;
  learnTopicId?: string;
}

export interface MatchCentreData {
  id: string;
  competition: string;
  competitionLogo?: string;
  round: string;
  kickoff: string;
  venue: string;
  status: MatchStatus;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  
  // Teams Overview
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    badge: string;
    leagueRank: number;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    homeRecord: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number };
    form: ("W" | "D" | "L")[];
    recentMatches: TeamFormMatch[];
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    badge: string;
    leagueRank: number;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gf: number;
    ga: number;
    gd: number;
    awayRecord: { played: number; won: number; drawn: number; lost: number; gf: number; ga: number };
    form: ("W" | "D" | "L")[];
    recentMatches: TeamFormMatch[];
  };

  // B. H2H Analysis
  h2h: {
    totalMeetings: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    avgGoals: number;
    bttsFrequencyPct: number;
    over25FrequencyPct: number;
    avgCorners: number;
    avgCards: number;
    meetings: H2HMeeting[];
    trends: string[];
  };

  // C. Lineup Analysis
  lineups: {
    isConfirmed: boolean; // Never show predicted as confirmed
    announcementTime?: string;
    homeFormation: string;
    awayFormation: string;
    homeStartingXI: PlayerLineupItem[];
    awayStartingXI: PlayerLineupItem[];
    homeSubstitutes: PlayerLineupItem[];
    awaySubstitutes: PlayerLineupItem[];
    injuriesAndSuspensions: InjurySuspension[];
    tacticalImplications: string;
  };

  // D. Goal Analysis
  goalAnalysis: {
    homeXg: number;
    awayXg: number;
    homeXga: number;
    awayXga: number;
    over05Prob: number;
    over15Prob: number;
    over25Prob: number;
    over35Prob: number;
    bttsYesProb: number;
    bttsNoProb: number;
    homeCleanSheetProb: number;
    awayCleanSheetProb: number;
    firstHalfGoalsAvg: number;
    secondHalfGoalsAvg: number;
    homeAvgGoalsScored: number;
    homeAvgGoalsConceded: number;
    awayAvgGoalsScored: number;
    awayAvgGoalsConceded: number;
  };

  // E. Corner Analysis
  cornerAnalysis: {
    matchAvgCorners: number;
    homeAvgCornersFor: number;
    homeAvgCornersAgainst: number;
    awayAvgCornersFor: number;
    awayAvgCornersAgainst: number;
    firstHalfAvgCorners: number;
    secondHalfAvgCorners: number;
    over85CornersProb: number;
    over95CornersProb: number;
    over105CornersProb: number;
    over115CornersProb: number;
    cornerDistributionNote: string;
  };

  // F. Shot Analysis
  shotAnalysis: {
    homeTotalShotsAvg: number;
    homeShotsOnTargetAvg: number;
    homeShotsOffTargetAvg: number;
    homeBlockedShotsAvg: number;
    homeInsideBoxPct: number;
    homeOutsideBoxPct: number;
    homeAccuracyPct: number;

    awayTotalShotsAvg: number;
    awayShotsOnTargetAvg: number;
    awayShotsOffTargetAvg: number;
    awayBlockedShotsAvg: number;
    awayInsideBoxPct: number;
    awayOutsideBoxPct: number;
    awayAccuracyPct: number;
  };

  // G. Scoring Frequency
  scoringFrequency: {
    intervals: MatchScoringInterval[];
    homeFirstTeamToScorePct: number;
    awayFirstTeamToScorePct: number;
    homeCleanSheetCount: number;
    awayCleanSheetCount: number;
    homeFailedToScoreCount: number;
    awayFailedToScoreCount: number;
  };

  // H. Match Tempo
  tempoAnalysis: {
    homePossessionPct: number;
    awayPossessionPct: number;
    attackingIntensityIndex: number; // 0-100
    dangerousAttacksAvg: { home: number; away: number };
    pressingIntensityPpda: { home: number; away: number }; // Passes per defensive action
    transitionSpeed: "Fast" | "Moderate" | "Calculated";
    momentumNarrative: string;
  };

  // I. Individual Performance
  keyPlayers: {
    home: PlayerLineupItem[];
    away: PlayerLineupItem[];
  };

  // J. Player to Score
  playerToScoreMarkets: PlayerScoreMarket[];

  // K. Comprehensive Predictions
  predictions: DetailedMatchPrediction[];
}

export interface PredictionFeedItem {
  id: string;
  matchId: string;
  fixtureTitle: string;
  competition: string;
  kickoff: string;
  category: "match-results" | "goals" | "corners" | "player-markets" | "other";
  market: string;
  selection: string;
  probability: number;
  odds: number;
  impliedProb: number;
  valueEdge: number;
  confidence: "High" | "Medium" | "Low";
  confidenceExplanation: string;
  evidence: string[];
  actualOutcome?: "Won" | "Lost" | "Pending";
  sampleSize: string;
  educationalLink?: {
    topicId: string;
    label: string;
  };
}

export interface TeamProfile {
  id: string;
  name: string;
  league: string;
  badge: string;
  stadium: string;
  manager: string;
  rank: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  xG: number;
  xGA: number;
  avgPossession: number;
  avgCorners: number;
  avgShotsOnTarget: number;
  cleanSheets: number;
  bttsRatePct: number;
  over25RatePct: number;
  homeWinPct: number;
  awayWinPct: number;
  strengths: string[];
  weaknesses: string[];
  tacticalStyle: string;
  squad: PlayerLineupItem[];
  recentResults: TeamFormMatch[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  position: "GK" | "DF" | "MF" | "FW";
  nationality: string;
  age: number;
  appearances: number;
  minutes: number;
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  shotsPer90: number;
  shotsOnTargetPct: number;
  keyPassesPer90: number;
  passAccuracyPct: number;
  tacklesPer90: number;
  interceptionsPer90: number;
  yellowCards: number;
  redCards: number;
  recentPerformances: {
    opponent: string;
    date: string;
    minutes: number;
    goals: number;
    assists: number;
    rating: number;
  }[];
}

export interface LearningQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningLessonDetail {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  relatedStatTerm?: string;
  quiz?: LearningQuizQuestion[];
}

export interface LearningPath {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  lessonIds: string[];
  badgeName: string;
}

export interface MatchCaseStudy {
  id: string;
  title: string;
  fixture: string;
  date: string;
  theme: string;
  summary: string;
  tacticalNarrative: string;
  statisticalFindings: string[];
  lessonsLearned: string;
}
