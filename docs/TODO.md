# NAP site, technical reference

The master task list lives in the NAP claude.ai Project as claude/NAP_Roadmap.md.
Do not track tasks here.

What follows is technical reference: architecture notes and design decisions that
inform future work.

See also `docs/directory-seo-plan.md` for the directory SEO plan and decisions.

---

## Holiday closure systems

Two separate holiday closure systems exist and should be merged:

- `src/lib/meetingSchedule.ts`: holiday rules used by the automated recap cron
  (`src/app/api/cron/recap-post/route.ts`). Controls whether a recap email is
  sent on a given day.
- `src/lib/holidayClosures.ts`: visitor-facing closure config used by
  `HolidayBanner`, `CityClosureNotice`, `EventsViews`, and the `exceptDate`
  additions in event schema files. Controls what visitors see on the site.

The `chapter_closures` Supabase table and `src/lib/closures.ts` also exist but
are unused by either system.

## Automated recap posts

A Vercel cron at 10:30am Central (Tue–Fri) calls `/api/cron/recap-post`, which
uses `chaptersMeetingOn()` and `isMeetingHeld()` from
`src/lib/meetingSchedule.ts` to auto-detect the day's chapter and send the
recap. Zero check-ins trigger an alert email to the configured address instead
of sending a recap. Manual override (with explicit `chapter` and `meeting_date`
query params) still works.

## Check-in token sharing

All four chapters share one `CHECKIN_QR_TOKEN`, so every QR code is equivalent:
a Manchester code works at Smyrna and records the wrong chapter. One leaked or
misprinted code means rotating the token and reprinting all four. Relevant
files: `src/lib/checkin-auth.ts`, the check-in and search routes, and
`/admin/checkin-codes`.

## Unsubscribe scope

No unsubscribe link in `emailWrapper`. Broadcasts build their own link and
nothing else carries one. Reviewed 2026-10-03 and deliberately left alone: of
the other email types, 7 go to admin, 2 go to chapter leaders and 21 are
transactional, where an unsubscribe link is not wanted. Revisit only if a new
marketing email type is added.

## Directory revalidation

`/directory` and the category pages revalidate hourly, so a newly approved
listing takes up to an hour to appear on them. Its own page is immediate. A
one-line change if instant matters more than a database query per page view.

## Stale docs

`docs/checkout-e2e-test.md` is out of date. Written before the webhook stopped
creating listings and started creating invites. Paid tiers (Connected,
Amplified) are now live via Stripe checkout; product schemas on `/join` are
`InStock`.
