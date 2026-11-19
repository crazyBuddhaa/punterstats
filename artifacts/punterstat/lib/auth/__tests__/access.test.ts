import { describe, it, expect } from "vitest";
import { hasTierAccess, resolveSubscriptionTier } from "../access";

describe("free < pro < premium < admin tier access control", () => {
  it("resolves free, pro, premium, and admin tiers accurately", () => {
    expect(resolveSubscriptionTier({ role: "user", plan: "free" })).toBe("free");
    expect(resolveSubscriptionTier({ role: "user", plan: "pro" })).toBe("pro");
    expect(resolveSubscriptionTier({ role: "premium", plan: "pro" })).toBe("pro");
    expect(resolveSubscriptionTier({ role: "user", plan: "premium" })).toBe("premium");
    expect(resolveSubscriptionTier({ role: "premium" })).toBe("premium");
    expect(resolveSubscriptionTier({ role: "admin", plan: "free" })).toBe("admin");
  });

  it("enforces strict hierarchy: free < pro < premium < admin", () => {
    const freeUser = { role: "user" as const, plan: "free" as const };
    const proUser = { role: "user" as const, plan: "pro" as const };
    const premiumUser = { role: "user" as const, plan: "premium" as const };
    const adminUser = { role: "admin" as const, plan: "free" as const };

    expect(hasTierAccess(freeUser, "free")).toBe(true);
    expect(hasTierAccess(freeUser, "pro")).toBe(false);
    expect(hasTierAccess(freeUser, "premium")).toBe(false);

    expect(hasTierAccess(proUser, "free")).toBe(true);
    expect(hasTierAccess(proUser, "pro")).toBe(true);
    expect(hasTierAccess(proUser, "premium")).toBe(false);

    expect(hasTierAccess(premiumUser, "free")).toBe(true);
    expect(hasTierAccess(premiumUser, "pro")).toBe(true);
    expect(hasTierAccess(premiumUser, "premium")).toBe(true);
    expect(hasTierAccess(premiumUser, "admin")).toBe(false);

    expect(hasTierAccess(adminUser, "premium")).toBe(true);
    expect(hasTierAccess(adminUser, "admin")).toBe(true);
  });
});
