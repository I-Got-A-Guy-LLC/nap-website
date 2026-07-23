import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendGuestHandoff, type GuestHandoffEntry } from "@/lib/emails";

const CHAPTER_NAMES: Record<string, string> = {
  manchester: "Manchester",
  murfreesboro: "Murfreesboro",
  nolensville: "Nolensville",
  smyrna: "Smyrna",
};

const RECIPIENT_ENV: Record<string, string> = {
  manchester: "GUEST_HANDOFF_TO_MANCHESTER",
  murfreesboro: "GUEST_HANDOFF_TO_MURFREESBORO",
  nolensville: "GUEST_HANDOFF_TO_NOLENSVILLE",
  smyrna: "GUEST_HANDOFF_TO_SMYRNA",
};

function recipientsFor(slug: string): string[] {
  const raw = process.env[RECIPIENT_ENV[slug]] || "";
  return raw.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: guests, error } = await supabase
    .from("checkins")
    .select(
      "id, chapter_slug, meeting_date, guest_name, guest_business_name, guest_email, guest_phone, ask_for_week"
    )
    .eq("attendee_type", "first_time_guest")
    .is("guest_handoff_sent_at", null);

  if (error) {
    console.error("guest-handoff query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const results = {
    groupsSent: 0,
    guestsSent: 0,
    groupsSkippedNoRecipients: 0,
    groupsFailed: 0,
  };

  if (!guests || guests.length === 0) {
    return NextResponse.json({ ...results, message: "No unsent guests" });
  }

  // Group unsent guests by (chapter_slug, meeting_date). In the normal daily case each
  // chapter that met has exactly one group; a missed run splits into per-date groups.
  const groups = new Map<
    string,
    { chapter_slug: string; meeting_date: string; ids: string[]; entries: GuestHandoffEntry[] }
  >();
  for (const g of guests) {
    const key = `${g.chapter_slug}__${g.meeting_date}`;
    let grp = groups.get(key);
    if (!grp) {
      grp = { chapter_slug: g.chapter_slug, meeting_date: g.meeting_date, ids: [], entries: [] };
      groups.set(key, grp);
    }
    grp.ids.push(g.id);
    grp.entries.push({
      guest_name: g.guest_name,
      guest_business_name: g.guest_business_name,
      guest_email: g.guest_email,
      guest_phone: g.guest_phone,
      ask_for_week: g.ask_for_week,
    });
  }

  for (const grp of Array.from(groups.values())) {
    const to = recipientsFor(grp.chapter_slug);
    if (to.length === 0) {
      // No configured recipient: do NOT stamp, so nothing is lost. Log and skip.
      console.error(
        `guest-handoff: no recipients configured for chapter ${grp.chapter_slug}; skipping ${grp.ids.length} guest(s)`
      );
      results.groupsSkippedNoRecipients++;
      continue;
    }

    try {
      await sendGuestHandoff({
        chapterName: CHAPTER_NAMES[grp.chapter_slug] || grp.chapter_slug,
        meetingDate: grp.meeting_date,
        guests: grp.entries,
        to,
      });
    } catch (sendErr) {
      // Send failed: leave rows unstamped so the next run retries. Do not stamp.
      console.error(`guest-handoff: send failed for ${grp.chapter_slug} ${grp.meeting_date}:`, sendErr);
      results.groupsFailed++;
      continue;
    }

    // Stamp only after a successful send.
    const { error: stampErr } = await supabase
      .from("checkins")
      .update({ guest_handoff_sent_at: new Date().toISOString() })
      .in("id", grp.ids);

    if (stampErr) {
      // Email went out but stamping failed: these may re-send next run (a duplicate),
      // which is the safe-side failure vs losing them. Log loudly.
      console.error(
        `guest-handoff: STAMP FAILED after send for ${grp.chapter_slug} ${grp.meeting_date} ids=${grp.ids.join(",")}:`,
        stampErr
      );
    }

    results.groupsSent++;
    results.guestsSent += grp.ids.length;
  }

  return NextResponse.json(results);
}
