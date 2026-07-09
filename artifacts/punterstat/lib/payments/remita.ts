// ============================================================
// PunterStat — Remita Integration (Nigeria)
// Generates Remittance Retrieval References (RRRs) that users
// pay via any Nigerian bank, USSD, or internet-banking app.
// Docs: https://remita.net/developers/
// ============================================================

import crypto from "crypto";
import type { PlanId } from "./types";
import { PLAN_CONFIG } from "./index";

// ── Config helpers ─────────────────────────────────────────────────────────

function cfg() {
  const merchantId  = process.env.REMITA_MERCHANT_ID;
  const apiKey      = process.env.REMITA_API_KEY;
  const serviceTypeId = process.env.REMITA_SERVICE_TYPE_ID;
  const baseUrl     = process.env.REMITA_BASE_URL ?? "https://remitademo.net";

  if (!merchantId || !apiKey || !serviceTypeId) {
    throw new Error(
      "Remita is not configured. Set REMITA_MERCHANT_ID, REMITA_API_KEY, and REMITA_SERVICE_TYPE_ID."
    );
  }
  return { merchantId, apiKey, serviceTypeId, baseUrl };
}

// ── Generate RRR ───────────────────────────────────────────────────────────
// Hash = SHA512(merchantId + serviceTypeId + orderId + amount + apiKey)

export interface GenerateRrrParams {
  planId: PlanId;
  userId: string;
  payerName: string;
  payerEmail: string;
  /** Optional payer phone (digits only, 11 chars for Nigerian numbers) */
  payerPhone?: string;
}

export interface RemitaRrrResult {
  rrr: string;
  orderId: string;
  /** Amount in NGN (whole naira) */
  amountNgn: number;
  /** Payment page URL to display to the user */
  paymentUrl: string;
  status: string;
}

export async function generateRemitaRrr({
  planId,
  userId,
  payerName,
  payerEmail,
  payerPhone,
}: GenerateRrrParams): Promise<RemitaRrrResult> {
  const { merchantId, apiKey, serviceTypeId, baseUrl } = cfg();
  const plan       = PLAN_CONFIG[planId];
  const amountNgn  = Math.round(plan.ngnKobo / 100); // kobo → naira
  const orderId    = `PS-${planId}-${userId.slice(0, 8)}-${Date.now()}`;

  // Compute authorisation hash
  const hash = crypto
    .createHash("sha512")
    .update(`${merchantId}${serviceTypeId}${orderId}${amountNgn}${apiKey}`)
    .digest("hex");

  const response = await fetch(
    `${baseUrl}/remita/exapp/api/v1/send/list`,
    {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `remitaConsumerKey ${merchantId},remitaConsumerToken ${hash}`,
      },
      body: JSON.stringify({
        serviceTypeId,
        amount:      String(amountNgn),
        orderId,
        payerName,
        payerEmail,
        payerPhone:  payerPhone ?? "",
        description: `PunterStat ${plan.name} Subscription`,
      }),
    }
  );

  const json = (await response.json()) as {
    statuscode: string;
    status: string;
    RRR?: string;
    rrr?: string;
  };

  const rrr = json.RRR ?? json.rrr;

  // "025" = success in Remita's status code system
  if (json.statuscode !== "025" || !rrr) {
    throw new Error(
      `Remita RRR generation failed: ${json.status ?? JSON.stringify(json)}`
    );
  }

  const paymentUrl = `${baseUrl}/remita/onlinepayment?rrr=${rrr}`;

  return { rrr, orderId, amountNgn, paymentUrl, status: json.status };
}

// ── Verify payment ─────────────────────────────────────────────────────────
// Poll this after a webhook notification or on return from bank payment.

export interface RemitaPaymentStatus {
  rrr: string;
  status: string;      // "01" = successful, "021" = pending, others = failed
  amount: number;
  orderId: string;
  payerName: string;
  payerEmail: string;
}

export async function verifyRemitaPayment(rrr: string): Promise<RemitaPaymentStatus> {
  const { merchantId, apiKey, baseUrl } = cfg();

  const hash = crypto
    .createHash("sha512")
    .update(`${merchantId}${rrr}${apiKey}`)
    .digest("hex");

  const response = await fetch(
    `${baseUrl}/remita/exapp/api/v1/send/list/${encodeURIComponent(rrr)}/status.reg`,
    {
      headers: {
        Authorization: `remitaConsumerKey ${merchantId},remitaConsumerToken ${hash}`,
      },
    }
  );

  const json = (await response.json()) as RemitaPaymentStatus & { status: string };
  return json;
}

/** Returns true if the Remita status code indicates a successful payment */
export function isRemitaPaymentSuccessful(statusCode: string): boolean {
  return statusCode === "01" || statusCode === "00";
}
