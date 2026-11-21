import { describe, expect, it } from "vitest";
import {
  normalizeDecodedSelection,
  parseConvertBetCodesResponse,
  resolveBookmakerKey,
  type CbcRetrieveResponse,
} from "../booking-code";

describe("ConvertBetCodes booking-code helpers", () => {
  it("resolves canonical keys and legacy aliases", () => {
    expect(resolveBookmakerKey("sportybet:ng")).toBe("sportybet:ng");
    expect(resolveBookmakerKey("sportybet")).toBe("sportybet:ng");
    expect(resolveBookmakerKey("onexbet")).toBe("1xbet:ng");
    expect(resolveBookmakerKey("betking")).toBe("betking:ng");
    expect(resolveBookmakerKey("sportybet_gh")).toBe("sportybet:gh");
    expect(resolveBookmakerKey("bet9ja")).toBe("bet9ja");
    expect(resolveBookmakerKey("unknown_bookie")).toBeNull();
  });

  it("normalizes 1xBet/22Bet shorthand selections cleanly", () => {
    expect(normalizeDecodedSelection("1x2", "W1")).toBe("Home Win");
    expect(normalizeDecodedSelection("1x2", "W2")).toBe("Away Win");
    expect(normalizeDecodedSelection("Double Chance", "2X")).toBe("X2");
    expect(normalizeDecodedSelection("GG/NG", "GG")).toBe("BTTS Yes");
    expect(
      normalizeDecodedSelection("Team 2, Result + Total", "Team 2 To Win And Total > (1.5) - Yes"),
    ).toBe("Away & Over 1.5");
  });

  it("parses a ConvertBetCodes retrieve_bet_code payload into normalized legs", () => {
    const sample: CbcRetrieveResponse = {
      status: 200,
      message: "success",
      data: {
        home: { bookie: "22bet:ng", odds: 7.3, no_of_entries: 3 },
        lists: [
          {
            home: {
              item_name: "Deportivo Alaves - Real Betis",
              home_team: "Deportivo Alaves",
              away_team: "Real Betis",
              sport_id: "soccer",
              tournament_name: "Spain. La Liga",
              market_name: "Double Chance",
              outcome_name: "2X",
              odd_value: 1.555,
              item_utc_date: "2026-10-08 16:30:00",
            },
          },
          {
            home: {
              item_name: "Arsenal - Manchester City",
              home_team: "Arsenal",
              away_team: "Manchester City",
              sport_id: "soccer",
              tournament_name: "England. Premier League",
              market_name: "Team 2, Result + Total",
              outcome_name: "Team 2 To Win And Total > (1.5) - Yes",
              odd_value: 3.26,
              item_utc_date: "2026-10-08 15:30:00",
            },
          },
          {
            home: {
              item_name: "Bayern Munich - Freiburg",
              home_team: "Bayern Munich",
              away_team: "Freiburg",
              sport_id: "soccer",
              tournament_name: "Germany. Bundesliga",
              market_name: "1x2",
              outcome_name: "W1",
              odd_value: 1.44,
              item_utc_date: "2026-10-08 15:30:00",
            },
          },
        ],
      },
    };

    const legs = parseConvertBetCodesResponse(sample);
    expect(legs).toHaveLength(3);
    expect(legs[0]).toMatchObject({
      event: "Deportivo Alaves vs Real Betis",
      selection: "X2",
      odds: 1.555,
      isFootball: true,
    });
    expect(legs[1]).toMatchObject({
      event: "Arsenal vs Manchester City",
      selection: "Away & Over 1.5",
      odds: 3.26,
    });
    expect(legs[2]).toMatchObject({
      event: "Bayern Munich vs Freiburg",
      selection: "Home Win",
      odds: 1.44,
    });
  });

  it("parses a ConvertBetCodes conversion_v2 fallback payload", () => {
    const convPayload: CbcRetrieveResponse = {
      status: 200,
      message: "success",
      data: {
        errors: [],
        conversion: {
          booking_code: "ABC123",
          dump: {
            home: { bookie: "sportybet:ng", odds: 2.1, no_of_entries: 1 },
            lists: [
              {
                home: {
                  item_name: "Arsenal - Chelsea",
                  home_team: "Arsenal",
                  away_team: "Chelsea",
                  sport_id: "soccer",
                  market_name: "1X2",
                  outcome_name: "Home",
                  odd_value: 2.1,
                },
              },
            ],
          },
        },
      },
    };

    const legs = parseConvertBetCodesResponse(convPayload);
    expect(legs).toHaveLength(1);
    expect(legs[0]).toMatchObject({
      event: "Arsenal vs Chelsea",
      selection: "Home Win",
      odds: 2.1,
    });
  });
});
