import { afterEach, describe, expect, it } from "vitest";
import { verifyCronRequest } from "../cron-auth";

function makeRequest(authorization?: string): Request {
  const headers = new Headers();
  if (authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return new Request("http://localhost:3000/api/cron/sync-season", { headers });
}

describe("verifyCronRequest", () => {
  const originalSecret = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  it("returns false when CRON_SECRET is missing or empty", () => {
    delete process.env.CRON_SECRET;
    expect(verifyCronRequest(makeRequest("Bearer undefined"))).toBe(false);
    expect(verifyCronRequest(makeRequest("Bearer secret123"))).toBe(false);

    process.env.CRON_SECRET = "";
    expect(verifyCronRequest(makeRequest("Bearer "))).toBe(false);
  });

  it("returns false when token is wrong (same length)", () => {
    process.env.CRON_SECRET = "super-secret-token-123";
    expect(verifyCronRequest(makeRequest("Bearer super-secret-token-124"))).toBe(false);
    expect(verifyCronRequest(makeRequest())).toBe(false);
    expect(verifyCronRequest(makeRequest("Basic super-secret-token-123"))).toBe(false);
  });

  it("returns false without throwing when token has wrong length", () => {
    process.env.CRON_SECRET = "super-secret-token-123";
    expect(verifyCronRequest(makeRequest("Bearer short"))).toBe(false);
    expect(
      verifyCronRequest(makeRequest("Bearer super-secret-token-123-extra-bytes")),
    ).toBe(false);
  });

  it("returns true when Bearer token matches CRON_SECRET", () => {
    process.env.CRON_SECRET = "super-secret-token-123";
    expect(verifyCronRequest(makeRequest("Bearer super-secret-token-123"))).toBe(true);
  });
});
