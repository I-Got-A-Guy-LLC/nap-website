import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Campaign tag. Entry into the draw means carrying this tag, NOT merely existing
// in `members`. That distinction matters: 120+ people are already in that table,
// and keying off existence would tell an existing member "you're already
// entered" when they are not, and silently leave them out of the draw.
const CAMPAIGN_TAG = "depot-days-2026";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Cloudflare Turnstile. Fails closed: if TURNSTILE_SECRET_KEY is unset, no
// submission is accepted. A prize form with no bot check is considerably more
// attractive to bots than a plain newsletter box, and the newsletter box
// collected ten in three weeks.
async function verifyTurnstile(token: unknown, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || typeof token !== "string" || token.length === 0) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("turnstile verify failed:", err);
    return false;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Request body must be valid JSON");
  }

  const firstName = String(body.first_name ?? "").trim();
  const lastName = String(body.last_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const consent = body.consent === true;

  if (!firstName) return bad("First name is required");
  if (!lastName) return bad("Last name is required");
  if (!EMAIL_SHAPE.test(email)) return bad("Enter a valid email address");
  if (phone.replace(/\D/g, "").length < 10) return bad("Enter a valid phone number");

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    null;

  if (!(await verifyTurnstile(body.turnstile_token, ip))) {
    return NextResponse.json(
      { error: "Could not verify you are human. Please try again." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const fullName = `${firstName} ${lastName}`;
  const now = new Date().toISOString();

  const { data: existing, error: lookupErr } = await supabase
    .from("members")
    .select("id, tags, email_unsubscribed, email_opted_in, opted_in_at, phone")
    .eq("email", email)
    .maybeSingle();

  if (lookupErr) {
    console.error("depot-days lookup error:", lookupErr);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  if (existing) {
    const tags: string[] = Array.isArray(existing.tags) ? existing.tags : [];

    if (tags.includes(CAMPAIGN_TAG)) {
      return NextResponse.json({ ok: true, already_entered: true });
    }

    const update: Record<string, unknown> = { tags: [...tags, CAMPAIGN_TAG] };

    // Fill in a phone only if we do not already have one. Never overwrite a
    // number already on a member's record from a raffle form.
    if (!existing.phone) update.phone = phone;

    // A deliberate unsubscribe outranks a tick box on an event form, so it is
    // never reversed here. They still get the tag and still enter the draw.
    if (consent && existing.email_unsubscribed !== true) {
      update.email_opted_in = true;
      if (!existing.opted_in_at) update.opted_in_at = now;
    }

    const { error } = await supabase.from("members").update(update).eq("id", existing.id);
    if (error) {
      console.error("depot-days update error:", error);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, already_entered: false });
  }

  // New contact. signup_source records how they first reached us and is written
  // once; the campaign itself lives in tags so a second event next year simply
  // adds another tag rather than needing a new source value.
  const insert: Record<string, unknown> = {
    email,
    full_name: fullName,
    phone,
    tier: "linked",
    signup_source: "event",
    tags: [CAMPAIGN_TAG],
    email_opted_in: consent,
  };
  if (consent) insert.opted_in_at = now;

  const { error } = await supabase.from("members").insert(insert);

  if (error) {
    // 23505 = someone submitted twice in the same instant and the unique index
    // on email caught the second one. Their first submission succeeded, so this
    // is a success from the entrant's point of view.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, already_entered: true });
    }
    console.error("depot-days insert error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, already_entered: false });
}
