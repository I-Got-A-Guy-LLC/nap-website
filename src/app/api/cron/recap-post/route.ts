import { NextResponse } from "next/server";
import { buildRecapPost } from "@/lib/recap";
import { CHAPTER_SLUGS, type ChapterSlug } from "@/lib/meetingSchedule";

export async function GET(request: Request) {
  // Fail-closed bearer auth, identical to the guest-handoff cron route so the
  // same secret carries into the scheduled cron in 3c. If CRON_SECRET is unset,
  // or the header does not exactly match, return 401 and do nothing.
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Manual/test only this increment: both params are required. The scheduled
  // auto-detect path (today-in-Central plus meeting-day detection) is 3c and is
  // deliberately not built here.
  const { searchParams } = new URL(request.url);
  const chapter = searchParams.get("chapter");
  const meetingDate = searchParams.get("meeting_date");

  if (!chapter || !meetingDate) {
    return NextResponse.json(
      { error: "chapter and meeting_date query params are required" },
      { status: 400 }
    );
  }
  if (!CHAPTER_SLUGS.includes(chapter as ChapterSlug)) {
    return NextResponse.json(
      { error: `chapter must be one of: ${CHAPTER_SLUGS.join(", ")}` },
      { status: 400 }
    );
  }

  // Read only. Compose the post and return it as plain text. This return-as-text
  // behavior is temporary 3a scaffolding and will be replaced by the Resend send
  // in 3b.
  const post = await buildRecapPost(chapter as ChapterSlug, meetingDate);
  return new Response(post, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
