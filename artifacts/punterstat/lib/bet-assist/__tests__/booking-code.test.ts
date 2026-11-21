import { describe, expect, it } from "vitest";
import { getBookmakerMeta, resolveBookmakerKey } from "../booking-code";

describe("ManageBetCodes booking-code helpers", () => {
  it("resolves canonical keys and aliases", () => {
    expect(resolveBookmakerKey("sportybet")).toBe("sportybet");
    expect(resolveBookmakerKey("sportybet:ng")).toBe("sportybet");
    expect(resolveBookmakerKey("1xbet:ng")).toBe("onexbet");
    expect(resolveBookmakerKey("betking:ng")).toBe("betking");
    expect(resolveBookmakerKey("sportybet:gh")).toBe("sportybet_gh");
    expect(resolveBookmakerKey("football.com")).toBe("football.com");
    expect(resolveBookmakerKey("bet9ja")).toBe("bet9ja");
    expect(resolveBookmakerKey("unknown_bookie")).toBeNull();
  });

  it("returns bookmaker metadata for valid keys", () => {
    expect(getBookmakerMeta("sportybet")).toMatchObject({
      key: "sportybet",
      label: "SportyBet (NG)",
      name: "SportyBet",
    });
    expect(getBookmakerMeta("unknown")).toBeNull();
  });
});
