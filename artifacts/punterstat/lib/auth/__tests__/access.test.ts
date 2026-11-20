import { describe, expect, it } from "vitest";
import { hasPlanAccess, resolveUserTier } from "../access";

describe("auth/access 4-tier plan resolution", () => {
  it("resolves free, pro, premium, and admin tiers accurately", () => {
    expect(resolveUserTier(null, null)).toBe("free");
    expect(resolveUserTier({ role: "user" }, null)).toBe("free");
    expect(resolveUserTier({ role: "user" }, { plan: "pro", status: "active" })).toBe("pro");
    expect(resolveUserTier({ role: "user" }, { plan: "premium", status: "trialing" })).toBe("premium");
    expect(resolveUserTier({ role: "user" }, { plan: "premium", status: "cancelled" })).toBe("free");
    expect(resolveUserTier({ role: "premium" }, null)).toBe("premium");
    expect(resolveUserTier({ role: "admin" }, { plan: "free", status: "cancelled" })).toBe("admin");
  });

  it("enforces strict free < pro < premium < admin ordering", () => {
    expect(hasPlanAccess("free", "free")).toBe(true);
    expect(hasPlanAccess("free", "pro")).toBe(false);
    expect(hasPlanAccess("free", "premium")).toBe(false);

    expect(hasPlanAccess("pro", "pro")).toBe(true);
    expect(hasPlanAccess("pro", "premium")).toBe(false);

    expect(hasPlanAccess("premium", "pro")).toBe(true);
    expect(hasPlanAccess("premium", "premium")).toBe(true);

    expect(hasPlanAccess("admin", "premium")).toBe(true);
  });
});
