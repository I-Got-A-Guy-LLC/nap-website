import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyTurnstile, callerIp } from "@/lib/turnstile";

export const runtime = "nodejs";

// Signup for people arriving from the Meetup group, linked only from Meetup.
//
// signup_source is written once, on insert, so someone already in `members`
// (a past check-in, a banner signup) keeps their original source. The "meetup"
// tag is added for everyone, new or existing, so the tag is what answers "who
// came through Meetup".
const SOURCE = "meetup";
const TAG = "meetup";

const CITY_SLUGS = ["manchester", "murfreesboro", "nolensville", "smyrna"];
const NOT_SURE = "not-sure";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// The newsletter banner stores the email local-part as full_name because it
// asks for nothing else. Treat that as blank so a real name can replace it,
// instead of "jsmith42" counting as a filled-in field.
function isPlaceholderName(fullName: string | null, email: string): boolean {
  const name = (fullName ?? "").trim().toLowerCase();
  return !name || name === email.split("@")[0];
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Request body must be valid JSON");
  }

  const firstName = String(body.first_name ?? "").trim().slice(0, 100);
  const lastName = String(body.last_name ?? "").trim().slice(0, 100);
  const email = String(body.email ?? "").trim().toLowerCase();
  const city = String(body.city ?? "").trim();
  const businessName = String(body.business_name ?? "").trim().slice(0, 200);
  const consent = body.consent === true;

  if (!firstName) return bad("First name is required");
  if (!EMAIL_SHAPE.test(email)) return bad("Enter a valid email address");
  if (!CITY_SLUGS.includes(city) && city !== NOT_SURE) return bad("Choose a city");

  if (!(await verifyTurnstile(body.turnstile_token, callerIp(request)))) {
    return NextResponse.json(
      { error: "Could not verify you are human. Please try again." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const fullName = lastName ? `${firstName} ${lastName}` : firstName;
  // "Not sure yet" saves no city, so they receive "All cities" broadcasts only.
  const citySlug = city === NOT_SURE ? null : city;
  const now = new Date().toISOString();

  const { data: existing, error: lookupErr } = await supabase
    .from("members")
    .select("id, full_name, business_name, city, tags, email_unsubscribed, opted_in_at")
    .eq("email", email)
    .maybeSingle();

  if (lookupErr) {
    console.error("welcome lookup error:", lookupErr);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  if (existing) {
    // Fill in only what is missing. Never overwrite a field the member or an
    // admin already filled in.
    const update: Record<string, unknown> = {};
    const tags: string[] = Array.isArray(existing.tags) ? existing.tags : [];
    if (!tags.includes(TAG)) update.tags = [...tags, TAG];
    if (isPlaceholderName(existing.full_name, email)) update.full_name = fullName;
    if (!existing.business_name && businessName) update.business_name = businessName;
    if (!existing.city && citySlug) update.city = citySlug;

    // A deliberate unsubscribe outranks a tick box, so it is never reversed here.
    if (consent && existing.email_unsubscribed !== true) {
      update.email_opted_in = true;
      if (!existing.opted_in_at) update.opted_in_at = now;
    }

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from("members").update(update).eq("id", existing.id);
      if (error) {
        console.error("welcome update error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
      }
    }
    // Same response whether or not the email was already on file, so the form
    // does not reveal who is in the members table.
    return NextResponse.json({ ok: true });
  }

  const insert: Record<string, unknown> = {
    email,
    full_name: fullName,
    business_name: businessName || null,
    city: citySlug,
    tier: "linked",
    signup_source: SOURCE,
    tags: [TAG],
    email_opted_in: consent,
  };
  if (consent) insert.opted_in_at = now;

  const { error } = await supabase.from("members").insert(insert);

  if (error) {
    // 23505 = a double submit raced the unique index on email. The first
    // submission succeeded, so this is a success from the visitor's side.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true });
    }
    console.error("welcome insert error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
