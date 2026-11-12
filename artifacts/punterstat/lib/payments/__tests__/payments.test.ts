import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import Stripe from "stripe";
import { getPlanConfig, addOneMonth, PLAN_CONFIG } from "../index";
import {
  verifyPaystackWebhook,
  paystackStatusToSubscriptionStatus,
  getPaystackPlanCode,
} from "../paystack";
import {
  constructStripeWebhookEvent,
  extractStripeMetadata,
  getStripePriceId,
} from "../stripe";
import { isRemitaPaymentSuccessful } from "../remita";

describe("lib/payments", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("plan resolution & addOneMonth", () => {
    it("resolves premium and pro plans and returns null for unknown plans", () => {
      expect(getPlanConfig("premium")).toEqual(PLAN_CONFIG.premium);
      expect(getPlanConfig("pro")).toEqual(PLAN_CONFIG.pro);
      expect(getPlanConfig("free")).toBeNull();
      expect(getPlanConfig("invalid")).toBeNull();
    });

    it("adds one calendar month without mutating the input Date", () => {
      const start = new Date("2025-05-15T12:00:00.000Z");
      const next = addOneMonth(start);
      expect(start.toISOString()).toBe("2025-05-15T12:00:00.000Z");
      expect(next.getUTCMonth()).toBe(5); // June (0-indexed)
      expect(next.getUTCDate()).toBe(15);
    });

    it("resolves provider plan codes and price IDs from environment variables", () => {
      process.env.PAYSTACK_PREMIUM_PLAN_CODE = "PLN_prem_123";
      process.env.STRIPE_PRO_PRICE_ID = "price_pro_456";
      expect(getPaystackPlanCode("premium")).toBe("PLN_prem_123");
      expect(getStripePriceId("pro")).toBe("price_pro_456");
    });
  });

  describe("Paystack webhook signature verification (HMAC-SHA512)", () => {
    const testSecret = "sk_test_paystack_known_vector_secret";
    const sampleBody = JSON.stringify({
      event: "charge.success",
      data: { id: 987654, reference: "PS-premium-12345678", amount: 1500000, currency: "NGN" },
    });

    it("verifies a valid HMAC-SHA512 signature vector", () => {
      process.env.PAYSTACK_SECRET_KEY = testSecret;
      const validSig = crypto
        .createHmac("sha512", testSecret)
        .update(sampleBody)
        .digest("hex");

      expect(verifyPaystackWebhook(sampleBody, validSig)).toBe(true);
    });

    it("rejects tampered payloads, wrong-length signatures, and empty signatures", () => {
      process.env.PAYSTACK_SECRET_KEY = testSecret;
      const validSig = crypto
        .createHmac("sha512", testSecret)
        .update(sampleBody)
        .digest("hex");

      expect(verifyPaystackWebhook(sampleBody + " ", validSig)).toBe(false);
      expect(verifyPaystackWebhook(sampleBody, validSig.slice(0, -2) + "00")).toBe(false);
      expect(verifyPaystackWebhook(sampleBody, "short_sig")).toBe(false);
      expect(verifyPaystackWebhook(sampleBody, "")).toBe(false);
    });

    it("maps Paystack subscription statuses accurately", () => {
      expect(paystackStatusToSubscriptionStatus("active")).toBe("active");
      expect(paystackStatusToSubscriptionStatus("non-renewing")).toBe("cancelled");
      expect(paystackStatusToSubscriptionStatus("cancelled")).toBe("cancelled");
      expect(paystackStatusToSubscriptionStatus("completed")).toBe("expired");
      expect(paystackStatusToSubscriptionStatus("attention")).toBe("expired");
    });
  });

  describe("Stripe webhook signature verification & metadata extraction", () => {
    it("verifies a signed Stripe webhook payload and rejects invalid signatures", () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_12345";
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret_vector";

      const payload = JSON.stringify({
        id: "evt_test_webhook_1",
        object: "event",
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_1" } },
      });

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2026-06-24.dahlia",
      });
      const header = stripe.webhooks.generateTestHeaderString({
        payload,
        secret: process.env.STRIPE_WEBHOOK_SECRET,
      });

      const event = constructStripeWebhookEvent(payload, header);
      expect(event.id).toBe("evt_test_webhook_1");
      expect(event.type).toBe("checkout.session.completed");

      expect(() =>
        constructStripeWebhookEvent(payload, "t=12345,v1=deadbeef")
      ).toThrow();
    });

    it("extracts valid Stripe metadata and rejects missing or unknown plans", () => {
      expect(extractStripeMetadata({ userId: "user-1", plan: "premium" })).toEqual({
        userId: "user-1",
        plan: "premium",
      });
      expect(extractStripeMetadata({ userId: "user-1", plan: "invalid" })).toBeNull();
      expect(extractStripeMetadata(null)).toBeNull();
    });
  });

  describe("Remita status verification", () => {
    it("recognises 00 and 01 as successful Remita payment codes", () => {
      expect(isRemitaPaymentSuccessful("00")).toBe(true);
      expect(isRemitaPaymentSuccessful("01")).toBe(true);
      expect(isRemitaPaymentSuccessful("021")).toBe(false);
      expect(isRemitaPaymentSuccessful("025")).toBe(false);
    });
  });
});
