import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Resend signs webhooks with Svix. Rather than pull in the svix package for one
// HMAC check, verify it directly: the signed payload is `{id}.{timestamp}.{body}`
// and the secret is base64 after the "whsec_" prefix.
//
// Fails closed. If RESEND_WEBHOOK_SECRET is unset, every request is rejected,
// matching how the check-in and cron routes behave.
const TOLERANCE_SECONDS = 5 * 60;

function verifySignature(
  body: string,
  id: string | null,
  timestamp: string | null,
  signatureHeader: string | null
): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !id || !timestamp || !signatureHeader) return false;

  // Reject stale deliveries so a captured request cannot be replayed later.
  const sent = Number(timestamp);
  if (!Number.isFinite(sent)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - sent) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key)
    .update(`${id}.${timestamp}.${body}`)
    .digest("base64");

  // The header is a space-separated list of `v1,<sig>` entries: Svix sends more
  // than one during secret rotation, and any match is valid.
  for (const entry of signatureHeader.split(" ")) {
    const candidate = entry.split(",")[1];
    if (!candidate) continue;
    const a = Buffer.from(candidate);
    const b = Buffer.from(expected);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const body = await request.text();

  if (
    !verifySignature(
      body,
      request.headers.get("svix-id"),
      request.headers.get("svix-timestamp"),
      request.headers.get("svix-signature")
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: {
      email_id?: string;
      to?: string[];
      subject?: string;
      bounce?: { type?: string; subType?: string; message?: string };
    };
  };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = event.type ?? "";
  // Only bounces and complaints change anything. Delivery and open events are
  // acknowledged with a 200 so Resend stops retrying, but nothing is recorded:
  // storing every open would grow unboundedly for no current benefit.
  if (type !== "email.bounced" && type !== "email.complained") {
    return NextResponse.json({ ok: true, ignored: type });
  }

  const recipients = (event.data?.to ?? []).filter(Boolean);
  if (recipients.length === 0) {
    return NextResponse.json({ ok: true, note: "no recipient on event" });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const bounceType = event.data?.bounce?.type ?? null;

  // Only a PERMANENT bounce means the address is dead. Transient ones are full
  // mailboxes and greylisting, which resolve on their own; suppressing on those
  // would quietly drop real members after one bad day at their mail provider.
  const isHardBounce = type === "email.bounced" && bounceType === "Permanent";
  const isComplaint = type === "email.complained";

  for (const raw of recipients) {
    const email = String(raw).trim().toLowerCase();

    // Log every event, including for addresses that are not members, so a
    // forwarded or stale address still leaves a trace instead of vanishing.
    await supabase.from("email_events").insert({
      event_type: type,
      email,
      bounce_type: bounceType,
      subject: event.data?.subject ?? null,
      resend_id: event.data?.email_id ?? null,
      raw: event,
    });

    if (!isHardBounce && !isComplaint) continue;

    const update: Record<string, unknown> = {};
    if (isHardBounce) update.email_bounced_at = now;
    if (isComplaint) {
      update.email_complained_at = now;
      // A spam complaint is an explicit "stop", so it also sets the hard
      // unsubscribe. A bounce deliberately does not: the address is broken, but
      // the person never asked to be removed, and a corrected address should
      // just work.
      update.email_unsubscribed = true;
      update.email_opted_in = false;
    }

    const { error } = await supabase.from("members").update(update).eq("email", email);
    if (error) {
      console.error("resend webhook member update failed:", email, error);
    }
  }

  return NextResponse.json({ ok: true, type, handled: recipients.length });
}
