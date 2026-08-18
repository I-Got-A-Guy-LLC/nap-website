import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidToken, unauthorized } from "@/lib/checkin-auth";

// Must stay in sync with the CHECK constraint on checkins.chapter_slug and cityData.ts.
const CHAPTER_SLUGS = ["manchester", "murfreesboro", "nolensville", "smyrna"] as const;
const ATTENDEE_TYPES = ["first_time_guest", "repeat_matched", "repeat_unmatched"] as const;

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// meeting_date must be a plain YYYY-MM-DD date string (matches the `date` column).
function isValidDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export async function POST(request: Request) {
  // Gate before parsing or validating anything, so unauthenticated callers cannot
  // probe the request schema through validation error messages.
  if (!isValidToken(request.headers.get("x-checkin-token"))) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Request body must be valid JSON");
  }

  const attendee_type = body.attendee_type;
  const chapter_slug = body.chapter_slug;
  const meeting_date = body.meeting_date;

  // --- shared validation across all three shapes ---
  if (!ATTENDEE_TYPES.includes(attendee_type as (typeof ATTENDEE_TYPES)[number])) {
    return bad(`attendee_type is required and must be one of: ${ATTENDEE_TYPES.join(", ")}`);
  }
  if (!CHAPTER_SLUGS.includes(chapter_slug as (typeof CHAPTER_SLUGS)[number])) {
    return bad(`chapter_slug is required and must be one of: ${CHAPTER_SLUGS.join(", ")}`);
  }
  if (!isValidDate(meeting_date)) {
    return bad("meeting_date is required and must be in YYYY-MM-DD format");
  }

  const supabase = getSupabaseAdmin();
  let row: Record<string, unknown>;

  if (attendee_type === "first_time_guest") {
    const { guest_name, guest_business_name, guest_email, guest_phone, ask_for_week, qotw_answer, consent_to_email } =
      body;
    if (!isNonEmptyString(guest_name)) return bad("first_time_guest requires guest_name");
    if (!isNonEmptyString(guest_business_name)) return bad("first_time_guest requires guest_business_name");
    if (!isNonEmptyString(guest_email)) return bad("first_time_guest requires guest_email");
    if (!isNonEmptyString(guest_phone)) return bad("first_time_guest requires guest_phone");
    if (!isNonEmptyString(ask_for_week)) return bad("first_time_guest requires ask_for_week");
    if (!isNonEmptyString(qotw_answer)) return bad("first_time_guest requires qotw_answer");
    // Optional: an absent or null value means consent was simply not given. Anything
    // other than a real JSON boolean ("true", "on", 1) is a client bug, not an
    // omission, so it is rejected rather than quietly treated as false.
    if (consent_to_email !== undefined && consent_to_email !== null && typeof consent_to_email !== "boolean") {
      return bad("consent_to_email must be a boolean if provided");
    }

    row = {
      attendee_type,
      chapter_slug,
      meeting_date,
      guest_name,
      guest_business_name,
      guest_email,
      guest_phone,
      ask_for_week,
      qotw_answer,
      consent_to_email: consent_to_email === true,
    };
  } else if (attendee_type === "repeat_matched") {
    const { member_id, listing_id, ask_for_week, qotw_answer } = body;
    if (!isNonEmptyString(member_id)) return bad("repeat_matched requires member_id");
    if (!isNonEmptyString(ask_for_week)) return bad("repeat_matched requires ask_for_week");
    if (!isNonEmptyString(qotw_answer)) return bad("repeat_matched requires qotw_answer");
    // listing_id is optional: a member with no directory listing still checks in
    // as a returning attendee, storing null. Present-but-malformed is still a
    // client bug and is rejected rather than quietly dropped.
    if (listing_id !== undefined && listing_id !== null && !isNonEmptyString(listing_id)) {
      return bad("listing_id must be a non-empty string if provided");
    }

    // Identity is never trusted from the client. Verify the listing exists and that
    // it belongs to the claimed member; name/business are derived from this match
    // (via the member_id FK), not accepted from the request body.
    if (isNonEmptyString(listing_id)) {
      const { data: listing, error: lookupErr } = await supabase
        .from("directory_listings")
        .select("id, member_id")
        .eq("id", listing_id)
        .maybeSingle();
      if (lookupErr) {
        console.error("checkin match lookup error:", lookupErr);
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
      }
      if (!listing) return bad("listing_id does not exist");
      if (listing.member_id !== member_id) return bad("listing_id does not belong to member_id");
    }

    row = {
      attendee_type,
      chapter_slug,
      meeting_date,
      member_id,
      listing_id: isNonEmptyString(listing_id) ? listing_id : null,
      ask_for_week,
      qotw_answer,
    };
  } else {
    // repeat_unmatched — no email/phone; must be explicitly flagged for follow-up.
    const { guest_name, ask_for_week, qotw_answer, flagged_for_leader_followup } = body;
    if (!isNonEmptyString(guest_name)) return bad("repeat_unmatched requires guest_name");
    if (!isNonEmptyString(ask_for_week)) return bad("repeat_unmatched requires ask_for_week");
    if (!isNonEmptyString(qotw_answer)) return bad("repeat_unmatched requires qotw_answer");
    if (flagged_for_leader_followup !== true) {
      return bad("repeat_unmatched requires flagged_for_leader_followup: true");
    }

    row = {
      attendee_type,
      chapter_slug,
      meeting_date,
      guest_name,
      ask_for_week,
      qotw_answer,
      flagged_for_leader_followup: true,
    };
  }

  const { data: inserted, error } = await supabase.from("checkins").insert(row).select("id").single();

  if (error) {
    // 23505 = unique_violation on (member_id, chapter_slug, meeting_date):
    // this person has already been checked in for this meeting.
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json(
        { error: "Already checked in for this meeting." },
        { status: 409 }
      );
    }
    console.error("checkin insert error:", error);
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
