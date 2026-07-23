// closures.ts
//
// Closure-aware scheduling layer. This combines the free, pure holiday rules
// from meetingSchedule.ts with ad-hoc closures stored in the chapter_closures
// table (reachable only via the service-role client).
//
// Use wasMeetingHeld from THIS module in callers. It is the closure-aware
// version: it knows about both holiday rules and ad-hoc database closures.
// isMeetingHeld in meetingSchedule.ts knows only about holiday rules. The
// names are deliberately different so the wrong one cannot be imported by
// accident.

import { getSupabaseAdmin } from "@/lib/supabase";
import {
  type ChapterSlug,
  getScheduledClosure,
  isMeetingDay,
} from "@/lib/meetingSchedule";

export type ClosureSource = "scheduled" | "adhoc";

export type ClosureInfo = { reason: string; source: ClosureSource };

export async function getClosure(
  slug: ChapterSlug,
  isoDate: string,
): Promise<ClosureInfo | null> {
  // Holiday rules are free and always win. When one applies, return it and do
  // not query the database at all.
  const scheduled = getScheduledClosure(slug, isoDate);
  if (scheduled) {
    return { reason: scheduled.reason, source: "scheduled" };
  }

  // Ad-hoc closures. meeting_cancelled = true is a REQUIRED filter, not
  // optional: a row with meeting_cancelled = false is a venue change (the
  // meeting still happened, elsewhere) and must not count as a closure.
  const { data, error } = await getSupabaseAdmin()
    .from("chapter_closures")
    .select("reason")
    .eq("chapter_slug", slug)
    .eq("meeting_date", isoDate)
    .eq("meeting_cancelled", true)
    .maybeSingle();

  if (error) {
    // Fail open, not closed. This feeds a zero-check-in alert. Throwing would
    // 500 the cron and produce silence, which is the exact failure this
    // feature exists to catch. Failing open produces at worst one unnecessary
    // alert; over-alerting beats silent under-alerting. This is deliberately
    // the OPPOSITE of meetingSchedule.ts, which throws on a malformed date: a
    // bad date is a programmer error, a failed query is a runtime condition.
    console.error("closures.getClosure query failed, failing open", error);
    return null;
  }

  if (data) {
    return { reason: data.reason, source: "adhoc" };
  }

  return null;
}

export async function wasMeetingHeld(
  slug: ChapterSlug,
  isoDate: string,
): Promise<boolean> {
  return isMeetingDay(slug, isoDate) && (await getClosure(slug, isoDate)) === null;
}
