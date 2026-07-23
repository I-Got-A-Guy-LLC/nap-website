// meetingSchedule.ts
//
// Pure, dependency-free scheduling logic for chapter meeting days and
// scheduled closures. No imports, no database, no network. Every function
// takes an explicit date argument; nothing implicitly means "today" except
// todayInCentral().
//
// Design note: getScheduledClosure answers only "does a closure rule cover
// this chapter on this date", independent of whether the chapter meets that
// weekday. isMeetingHeld is the composition of the two. Keep them orthogonal.
//
// This module ships with no caller. It is dormant by design.

export type ChapterSlug = "manchester" | "murfreesboro" | "nolensville" | "smyrna";

export const CHAPTER_SLUGS: readonly ChapterSlug[] = [
  "manchester",
  "murfreesboro",
  "nolensville",
  "smyrna",
];

// Meeting weekday per chapter. 0=Sunday .. 6=Saturday.
// Values cross-checked against the dayOfWeek field in
// src/components/EventsViews.tsx and against 176 production qotw rows.
// The duplication of these weekday numbers here is deliberate (see CLAUDE.md);
// do not consolidate against any existing source.
export const MEETING_DAY_OF_WEEK: Record<ChapterSlug, number> = {
  manchester: 2,
  murfreesboro: 3,
  nolensville: 4,
  smyrna: 5,
};

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Parse an ISO date string into integer parts, failing loud on bad input.
// A silent false or null here would later suppress a zero-check-in alert
// permanently and invisibly, which is the exact failure mode this feature
// exists to prevent.
function parseIsoDate(isoDate: string): { year: number; month: number; day: number } {
  if (!ISO_DATE_RE.test(isoDate)) {
    throw new Error(`Invalid isoDate, expected YYYY-MM-DD: ${isoDate}`);
  }
  const [year, month, day] = isoDate.split("-").map((part) => Number(part));
  return { year, month, day };
}

// Weekday for a calendar date, read in UTC to avoid the off-by-one that
// new Date("YYYY-MM-DD").getDay() produces (UTC midnight read back in the
// runtime's local zone).
function weekdayUtc(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

// Fourth Thursday of November for a given year, computed from the calendar,
// never hardcoded per year. Returns the day-of-month.
function fourthThursdayOfNovember(year: number): number {
  const firstDow = weekdayUtc(year, 11, 1);
  const THURSDAY = 4;
  const firstThursday = 1 + ((THURSDAY - firstDow + 7) % 7);
  return firstThursday + 21;
}

// Returns YYYY-MM-DD for the current date in America/Chicago.
// Defined fresh here on purpose; not imported from anywhere.
export function todayInCentral(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function isMeetingDay(slug: ChapterSlug, isoDate: string): boolean {
  const { year, month, day } = parseIsoDate(isoDate);
  return weekdayUtc(year, month, day) === MEETING_DAY_OF_WEEK[slug];
}

// Returns a closure reason if a scheduled closure rule covers this date, else
// null. The rules apply to all four chapters, so slug does not affect the
// result; it is part of the signature for symmetry and future-proofing.
//
// Exactly three rules, nothing else, no extra holidays:
//   -  Winter break: December 25 through January 2 inclusive, spanning the
//      year boundary. reason "Winter break".
//   -  Thanksgiving: the fourth Thursday of November. reason "Thanksgiving".
//   -  July 4: month 7 day 4. reason "Independence Day".
export function getScheduledClosure(
  slug: ChapterSlug,
  isoDate: string,
): { reason: string } | null {
  const { year, month, day } = parseIsoDate(isoDate);

  // Winter break spans the year boundary.
  if ((month === 12 && day >= 25) || (month === 1 && day <= 2)) {
    return { reason: "Winter break" };
  }

  if (month === 11 && day === fourthThursdayOfNovember(year)) {
    return { reason: "Thanksgiving" };
  }

  if (month === 7 && day === 4) {
    return { reason: "Independence Day" };
  }

  return null;
}

export function isMeetingHeld(slug: ChapterSlug, isoDate: string): boolean {
  return isMeetingDay(slug, isoDate) && getScheduledClosure(slug, isoDate) === null;
}
