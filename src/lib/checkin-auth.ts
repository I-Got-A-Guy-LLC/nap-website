import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * Validate the shared check-in QR token against process.env.CHECKIN_QR_TOKEN.
 *
 * Attendees scan a QR link carrying this secret at the door, so there is no
 * logged-in session to check — the token is the only gate on the check-in routes.
 *
 * Both sides are SHA-256 hashed before comparison so that timingSafeEqual always
 * receives equal-length buffers (it throws on a length mismatch) and the length of
 * the real token is never leaked by the comparison itself.
 *
 * Fails closed: if CHECKIN_QR_TOKEN is unset or empty, no request is authorized.
 */
export function isValidToken(provided: string | null): boolean {
  const expected = process.env.CHECKIN_QR_TOKEN;
  if (!expected || !provided) return false;
  return timingSafeEqual(
    createHash("sha256").update(provided).digest(),
    createHash("sha256").update(expected).digest()
  );
}

/**
 * Generic 401 for the check-in routes.
 *
 * Deliberately identical whether the token was missing or simply wrong — the
 * response must not reveal which case occurred.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
