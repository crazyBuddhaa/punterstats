import { timingSafeEqual } from "node:crypto";

/**
 * Verifies the `Authorization: Bearer <token>` header against `process.env.CRON_SECRET`
 * using constant-time buffer comparison (`crypto.timingSafeEqual`).
 *
 * Returns `false` when `CRON_SECRET` is missing/empty, the Authorization header is
 * missing/malformed, or the token does not match (including length mismatches,
 * handled by comparing same-length buffers so `timingSafeEqual` never throws).
 */
export function verifyCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length === 0) {
    return false;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.slice("Bearer ".length);
  const secretBuf = Buffer.from(secret, "utf8");
  const tokenBuf = Buffer.from(token, "utf8");

  if (tokenBuf.length !== secretBuf.length) {
    // Compare secretBuf against itself so timing remains constant and timingSafeEqual never throws
    timingSafeEqual(secretBuf, secretBuf);
    return false;
  }

  return timingSafeEqual(tokenBuf, secretBuf);
}
