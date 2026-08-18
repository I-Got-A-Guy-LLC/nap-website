// recap.ts
//
// NAP Facebook recap post composer. Increment 2 of 3: the composer only.
// No email sending and no cron here.
//
// Two exports:
//   formatRecapPost  pure. Takes already resolved rows plus the sponsor string
//                    and the qotw question, returns finished plain text. Unit
//                    testable against a fixture with no database.
//   buildRecapPost   async. Reads checkins flat, batch resolves members and
//                    listings, fetches the qotw question, then delegates to
//                    formatRecapPost.

import { getSupabaseAdmin } from "@/lib/supabase";
import { type ChapterSlug } from "@/lib/meetingSchedule";

// One normalized shape the formatter consumes, so it never branches on
// attendee_type. tier and isLeadership are populated only for matched members;
// guests and unmatched carry null tier and false isLeadership.
export type RecapAttendee = {
  name: string;
  business: string;
  ask: string;
  qotw: string;
  tier: string | null;
  isLeadership: boolean;
};

// Location sponsor per chapter. Hardcoded this increment, promotable to a table
// later. The map values render once on a single line.
const LOCATION_SPONSORS: Record<ChapterSlug, string> = {
  manchester: "FirstBank",
  murfreesboro: "Murfreesboro Strike & Spare",
  nolensville: "Waldo's Chicken & Beer",
  smyrna: "Almaville Apartment Homes Community Center",
};

// Per chapter header. Verbatim strings, self contained. Do NOT derive any of
// this from cityData. Leading glyphs are encoded as code points to avoid
// terminal corruption: U+1F64C hands, U+1F4CD pin, U+00B2 superscript two.
const CHAPTER_HEADER: Record<ChapterSlug, { title: string; blurb: string }> = {
  manchester: {
    title: "Napster (Manchester, Tuesdays)",
    blurb: "\u{1F64C}Thanks to everyone who came out to Napster this week. Free, No Attendance Policy, and Not Seat Specific. \u{1F4CD}Every Tuesday at 9:00am.",
  },
  murfreesboro: {
    title: "BORO NAP (Murfreesboro, Wednesdays)",
    blurb: "\u{1F64C}Thanks to everyone who came out to BORO NAP this week. Free Networking, No pressure, No Fees. \u{1F4CD}Every Wednesday at 9:00am.",
  },
  nolensville: {
    title: "N\u{00B2} (Nolensville, Thursdays)",
    blurb: "\u{1F64C}Thanks to everyone who joined us at N\u{00B2} this week. Free to attend, built for real conversations. \u{1F4CD}Every Thursday at 9:00am.",
  },
  smyrna: {
    title: "SNAP (Smyrna, Fridays)",
    blurb: "\u{1F64C}Thanks to everyone who came to SNAP this week. Genuinely free, no registration, no hard sell. \u{1F4CD}Every Friday at 9:00am.",
  },
};

// Section glyphs, encoded as code points. Connected requires the U+FE0F
// variation selector or it renders as a flat black glyph.
const EMOJI_AMPLIFIED = "\u{1F4A5}";
const EMOJI_CONNECTED = "\u{2604}\u{FE0F}";
const EMOJI_LEADERSHIP = "\u{1F3C6}";
const EMOJI_LOCATION = "\u{1F9ED}";

type PersonSection = "amplified" | "connected" | "leadership" | "attendees";

// Placement is mutually exclusive and evaluated in this priority order. Leaders
// are comped at tier amplified, so isLeadership must be checked before tier or a
// leader would land in Amplified.
function placeAttendee(a: RecapAttendee): PersonSection {
  if (a.isLeadership) return "leadership";
  if (a.tier === "amplified") return "amplified";
  if (a.tier === "connected") return "connected";
  return "attendees";
}

// Sort key for alphabetical by last name. Names are single full name strings
// with no separate last name column, so take the last whitespace token after
// dropping a trailing generational suffix (Jr, Sr, II, III, IV, case
// insensitive, optional period). Single token names key on the whole string.
function lastNameKey(name: string): string {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return (tokens[0] ?? "").toLowerCase();
  let last = tokens.pop() as string;
  if (/^(jr|sr|ii|iii|iv)\.?$/i.test(last) && tokens.length >= 1) {
    last = tokens.pop() as string;
  }
  return last.toLowerCase();
}

function sortByLastName(people: RecapAttendee[]): RecapAttendee[] {
  return [...people].sort((a, b) => {
    const ka = lastNameKey(a.name);
    const kb = lastNameKey(b.name);
    if (ka !== kb) return ka.localeCompare(kb);
    // Stable tie break on the full name, so "Jessy Casaus" precedes
    // "Jessy Casaus Jr." while both sit adjacent under C.
    return a.name.localeCompare(b.name);
  });
}

function renderPerson(a: RecapAttendee, emoji: string): string {
  const prefix = emoji ? `${emoji} ` : "";
  const lines = [`${prefix}${a.name}, ${a.business}`];
  if (a.ask) lines.push(`Ask: ${a.ask}`);
  if (a.qotw) lines.push(`Answer: ${a.qotw}`);
  return lines.join("\n");
}

function renderPersonSection(label: string, emoji: string, people: RecapAttendee[]): string {
  const blocks = sortByLastName(people).map((p) => renderPerson(p, emoji)).join("\n\n");
  return `${label}\n${blocks}`;
}

export function formatRecapPost(input: {
  chapterSlug: ChapterSlug;
  attendees: RecapAttendee[];
  locationSponsor: string;
  qotwQuestion: string | null;
}): string {
  const { chapterSlug, attendees, locationSponsor, qotwQuestion } = input;
  const header = CHAPTER_HEADER[chapterSlug];

  // Line 2 is the blurb, with the question clause appended only when a question
  // exists. When qotwQuestion is null, nothing is appended.
  const questionClause = qotwQuestion
    ? ` Our Question of the Week was: ${qotwQuestion}`
    : "";
  const headerBlock = `${header.title}\n${header.blurb}${questionClause}\nHere is who joined us:`;

  const buckets: Record<PersonSection, RecapAttendee[]> = {
    amplified: [],
    connected: [],
    leadership: [],
    attendees: [],
  };
  for (const a of attendees) buckets[placeAttendee(a)].push(a);

  // Display order: Amplified, Connected, Leadership, Location Sponsor,
  // Attendees. Empty person sections are omitted; Location Sponsor always
  // renders.
  const sections: string[] = [];
  if (buckets.amplified.length > 0) {
    sections.push(renderPersonSection("Amplified Member:", EMOJI_AMPLIFIED, buckets.amplified));
  }
  if (buckets.connected.length > 0) {
    sections.push(renderPersonSection("Connected Member:", EMOJI_CONNECTED, buckets.connected));
  }
  if (buckets.leadership.length > 0) {
    sections.push(renderPersonSection("Leadership:", EMOJI_LEADERSHIP, buckets.leadership));
  }
  sections.push(`Location Sponsor:\n${EMOJI_LOCATION} ${locationSponsor}`);
  if (buckets.attendees.length > 0) {
    sections.push(renderPersonSection("Attendees:", "", buckets.attendees));
  }

  return `${headerBlock}\n\n${sections.join("\n\n")}`;
}

type CheckinRow = {
  attendee_type: string;
  member_id: string | null;
  listing_id: string | null;
  guest_name: string | null;
  guest_business_name: string | null;
  ask_for_week: string | null;
  qotw_answer: string | null;
};

function resolveAttendee(
  row: CheckinRow,
  memberById: Map<string, { full_name: string | null; business_name: string | null; tier: string | null; is_leadership: boolean }>,
  listingById: Map<string, { business_name: string | null }>,
): RecapAttendee {
  const ask = row.ask_for_week ?? "";
  const qotw = row.qotw_answer ?? "";

  if (row.attendee_type === "repeat_matched") {
    const member = row.member_id ? memberById.get(row.member_id) : undefined;
    const listing = row.listing_id ? listingById.get(row.listing_id) : undefined;
    return {
      name: member?.full_name ?? "(no name)",
      // A member with no directory listing falls back to the business name on
      // their member record before the placeholder.
      business: listing?.business_name ?? member?.business_name ?? "(no business listed)",
      ask,
      qotw,
      tier: member?.tier ?? null,
      isLeadership: member?.is_leadership ?? false,
    };
  }

  if (row.attendee_type === "first_time_guest") {
    return {
      name: row.guest_name ?? "(no name)",
      business: row.guest_business_name ?? "(no business listed)",
      ask,
      qotw,
      tier: null,
      isLeadership: false,
    };
  }

  // repeat_unmatched: a name but no member link and no business.
  return {
    name: row.guest_name ?? "(no name)",
    business: "(no business listed)",
    ask,
    qotw,
    tier: null,
    isLeadership: false,
  };
}

export async function buildRecapPost(
  slug: ChapterSlug,
  meetingDate: string,
): Promise<string> {
  const supabase = getSupabaseAdmin();

  // Flat read of every check-in for this chapter and date. No embed: checkins
  // foreign keys are unverified, so members and listings are resolved in a
  // separate batch below.
  const { data: checkinData, error: checkinErr } = await supabase
    .from("checkins")
    .select(
      "attendee_type, member_id, listing_id, guest_name, guest_business_name, ask_for_week, qotw_answer",
    )
    .eq("chapter_slug", slug)
    .eq("meeting_date", meetingDate);
  if (checkinErr) {
    console.error("recap checkins query error:", checkinErr);
    throw new Error("Failed to read check-ins");
  }
  const rows = (checkinData ?? []) as CheckinRow[];

  // Only matched rows carry member_id and listing_id.
  const memberIds = Array.from(
    new Set(rows.filter((r) => r.attendee_type === "repeat_matched" && r.member_id).map((r) => r.member_id as string)),
  );
  const listingIds = Array.from(
    new Set(rows.filter((r) => r.attendee_type === "repeat_matched" && r.listing_id).map((r) => r.listing_id as string)),
  );

  const memberById = new Map<string, { full_name: string | null; business_name: string | null; tier: string | null; is_leadership: boolean }>();
  if (memberIds.length > 0) {
    const { data: members, error: memberErr } = await supabase
      .from("members")
      .select("id, full_name, business_name, tier, is_leadership")
      .in("id", memberIds);
    if (memberErr) {
      console.error("recap members query error:", memberErr);
      throw new Error("Failed to resolve members");
    }
    for (const m of members ?? []) {
      memberById.set(m.id, {
        full_name: m.full_name,
        business_name: m.business_name,
        tier: m.tier,
        is_leadership: m.is_leadership,
      });
    }
  }

  const listingById = new Map<string, { business_name: string | null }>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingErr } = await supabase
      .from("directory_listings")
      .select("id, business_name")
      .in("id", listingIds);
    if (listingErr) {
      console.error("recap listings query error:", listingErr);
      throw new Error("Failed to resolve listings");
    }
    for (const l of listings ?? []) {
      listingById.set(l.id, { business_name: l.business_name });
    }
  }

  // Question of the week text lives in its own table. A missing row is an
  // expected state (a chapter may not have set a question), so treat both a
  // null row and a query error as no question and omit the clause.
  const { data: qotwRow, error: qotwErr } = await supabase
    .from("qotw")
    .select("question")
    .eq("chapter_slug", slug)
    .eq("meeting_date", meetingDate)
    .maybeSingle();
  if (qotwErr) {
    console.error("recap qotw query error:", qotwErr);
  }
  const qotwQuestion = qotwRow?.question ?? null;

  const attendees = rows.map((r) => resolveAttendee(r, memberById, listingById));

  return formatRecapPost({
    chapterSlug: slug,
    attendees,
    locationSponsor: LOCATION_SPONSORS[slug],
    qotwQuestion,
  });
}
