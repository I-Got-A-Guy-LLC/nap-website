import { NextResponse } from "next/server";
import { buildRecapPost } from "@/lib/recap";
import { getRecapRecipients, sendRecapPost, sendRecapZeroAlert } from "@/lib/emails";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  CHAPTER_SLUGS,
  type ChapterSlug,
  chaptersMeetingOn,
  isMeetingHeld,
  todayInCentral,
} from "@/lib/meetingSchedule";

// Return the count of check-in rows for a chapter on a date.
async function checkinCount(slug: ChapterSlug, meetingDate: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("checkins")
    .select("id", { count: "exact", head: true })
    .eq("chapter_slug", slug)
    .eq("meeting_date", meetingDate);
  if (error) {
    console.error("checkinCount error:", error);
    return 0;
  }
  return count ?? 0;
}

export async function GET(request: Request) {
  // Fail-closed bearer auth, identical to the guest-handoff cron route so the
  // same secret carries into the scheduled cron in 3c. If CRON_SECRET is unset,
  // or the header does not exactly match, return 401 and do nothing.
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get("chapter");
  const meetingDate = searchParams.get("meeting_date");

  // --- Auto-detect path (cron) ---
  // When called without params, determine today's chapter and send automatically.
  if (!chapter && !meetingDate) {
    const today = todayInCentral();
    const chapters = chaptersMeetingOn(today);

    if (chapters.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No chapter meets today", date: today });
    }

    const results: Array<{ chapter: string; sent: boolean; zeroAlert?: boolean; skipped?: string }> = [];

    for (const slug of chapters) {
      if (!isMeetingHeld(slug, today)) {
        results.push({ chapter: slug, sent: false, skipped: "Scheduled closure" });
        continue;
      }

      const count = await checkinCount(slug, today);

      if (count === 0) {
        await sendRecapZeroAlert({ chapter: slug, meetingDate: today });
        results.push({ chapter: slug, sent: false, zeroAlert: true });
        continue;
      }

      const post = await buildRecapPost(slug, today);
      const recipients = getRecapRecipients(slug);
      if (recipients.length === 0) {
        results.push({ chapter: slug, sent: false, skipped: "No recipients configured" });
        continue;
      }
      await sendRecapPost({ chapter: slug, meetingDate: today, post, to: recipients });
      results.push({ chapter: slug, sent: true });
    }

    return NextResponse.json({ auto: true, date: today, results });
  }

  // --- Manual path (existing behavior) ---
  if (!chapter || !meetingDate) {
    return NextResponse.json(
      { error: "Provide both chapter and meeting_date, or omit both for auto-detect" },
      { status: 400 }
    );
  }
  if (!CHAPTER_SLUGS.includes(chapter as ChapterSlug)) {
    return NextResponse.json(
      { error: `chapter must be one of: ${CHAPTER_SLUGS.join(", ")}` },
      { status: 400 }
    );
  }

  // Compose the post (read only).
  const post = await buildRecapPost(chapter as ChapterSlug, meetingDate);

  // Manual send path: send=true emails the composed post to the chapter
  // recipients. Without it, behavior is unchanged and the post is returned as
  // plain text for inspection.
  if (searchParams.get("send") === "true") {
    const recipients = getRecapRecipients(chapter);
    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients configured for chapter" },
        { status: 400 }
      );
    }
    await sendRecapPost({ chapter, meetingDate, post, to: recipients });
    return NextResponse.json({ post, sent: true, recipients });
  }

  return NextResponse.json({ post, sent: false });
}
