# NAP site backlog

Things known to be worth doing, not yet done. Nothing here is urgent unless
marked. Verified against the live database on 2026-10-03.

See also `docs/directory-seo-plan.md`, which covers the directory work and the
decisions behind it. Phases 0, 1 and 2 of that plan are complete.

---

## Has a deadline attached

- **MARKED: Stripe upgrades write `members.tier`, not the listing tier.**
  `checkout.session.completed` in `src/app/api/stripe/webhook/route.ts` upgrades
  the member record. The directory, the listing page and the portal editor all
  read `directory_listings.tier` now, so the first person to actually buy an
  upgrade will pay 300 or 500 dollars and keep displaying as a free Linked
  listing. Self-serve checkout is live, so this fires on the first real purchase.
  The checkout needs to carry a listing id and set the tier on that listing.

  No current member is affected. Kayce Broach is the only person with two
  listings, and hers are deliberately split: KK Fitness Training Amplified,
  Keystone Hormones Linked.

- **Nothing sets `directory_listings.tier` explicitly at creation.** Zero rows
  are NULL today, so a database default is covering it, but no creation path in
  `src/` names the value. A paid member creating their first listing depends on
  that default being right. Worth setting explicitly in the Linked signup, portal
  save and admin create paths.

## Rachel's own records

- **Two `Rachel Albertson` member records.** Decision made 2026-10-03:
  consolidate onto `rachel@inforulesm.com`. Move the Inforule listing and the 10
  check-ins across, copy the password hash, set `role = super_admin`, then retire
  the `hello@networkingforawesomepeople.com` row.

  Handle carefully. `hello@` is the row that actually works: it holds the
  password, `role = super_admin` and the Inforule listing. `rachel@` has no
  password at all and cannot log in. Do it as one reversible step, capturing the
  old values first and verifying login before retiring anything.

## Directory content, waiting on Rachel

- **5 listings have no description** because the business name does not say what
  they do: Job Seekers, Arash Law, Ali's Creations, Me After We, Dinner Through A
  Straw. One sentence each is enough to draft from.

- **3 paying members have no description** and already have the field: FirstBank
  and Cynthia's Consulting on Amplified, Eagle Communications on Connected. Worth
  a nudge rather than a draft, since their listings currently show less than the
  free ones.

- **Arash Law has no city**, so it is missing from every city view and its page
  title falls back to "Middle Tennessee".

- **Heritage Signs & Displays of Charlotte, NC** carries a North Carolina city in
  its business name while listed under Manchester.

- **PLANW3ST has no category**, as instructed, so it appears on no category page
  and is reachable only through search and the sitemap.

- **Beauty & Personal Care has no members at all.** That category page is
  `noindex` until someone joins. A membership gap rather than a data problem: no
  salons, barbers, nail techs, estheticians or spas.

## Check-in

- **Per-chapter check-in tokens.** Deferred by Rachel 2026-10-03. All four
  chapters share one `CHECKIN_QR_TOKEN`, so every QR code is equivalent: a
  Manchester code works at Smyrna and records the wrong chapter. One leaked or
  misprinted code means rotating the token and reprinting all four. Touches
  `src/lib/checkin-auth.ts`, the check-in and search routes, and
  `/admin/checkin-codes`.

- **A QR code reportedly showed a login screen** instead of the check-in form.
  Tony Lane raised it, the member entered their details manually, and the cause
  was never traced.

- **Nolensville lost 2026-09-24 entirely** because the printed QR code was
  missing. Accepted as permanently empty. `/admin/checkin-codes` exists so it is
  recoverable on the spot now, which is why that page was built.

## Email and consent

- **No unsubscribe link in `emailWrapper`.** Broadcasts build their own link and
  nothing else carries one. Reviewed 2026-10-03 and deliberately left alone: of
  the other email types, 7 go to admin, 2 go to chapter leaders and 21 are
  transactional, where an unsubscribe link is not wanted. Revisit only if a new
  marketing email type is added.

- **No membership or billing notification preference.** The four `notif_*`
  columns cover cancellations, events, broadcasts and digest. Renewal and billing
  mail honours none of them, though it does now check `email_bounced_at`.

- **`bethmcgill1229@gmail.com` has no real name**, only the email local part,
  because the newsletter form asks for nothing else. Ask her directly if it
  matters.

## Data hygiene

- **62 members have `subscription_status = 'active'` with no Stripe
  subscription.** These are the manually added members. Harmless today because
  none has a `current_period_end`, so no renewal email can target them, but the
  field asserts something nothing backs. Worth clearing so the number means what
  it says.

## Features that exist but are not wired up

- **`chapter_closures` table and `src/lib/closures.ts`.** A complete,
  closure-aware scheduling layer combining holiday rules with ad-hoc closures.
  Nothing imports it and the table is empty. This is what the SNAP September 4
  closure should have used instead of a hardcoded banner component.

- **Recap posts are manual by choice.** `chaptersMeetingOn()` exists and would
  support a cron, but auto-sending would have posted Nolensville on 2026-09-10
  with 3 check-ins before a fourth arrived, and Manchester on 2026-08-18 with no
  leadership section. Sending when asked produces better posts.

- **`docs/checkout-e2e-test.md` is out of date.** Written before the webhook
  stopped creating listings and started creating invites.

## Directory SEO, remaining

Everything in phases 0 to 2 of `docs/directory-seo-plan.md` is done. What was
deliberately left:

- **City plus category pages**, for example
  `/directory/murfreesboro/insurance`. Local search volume concentrates there,
  but with 1 to 17 businesses per category today most combinations would be
  empty or hold a single listing. Revisit when the directory is larger.

- **`/directory` and the category pages revalidate hourly**, so a newly approved
  listing takes up to an hour to appear on them. Its own page is immediate. A
  one-line change if instant matters more than a database query per page view.

---

## Resolved on 2026-10-03

Kept briefly so the same ground is not re-covered.

Unsubscribe rewritten to require an explicit choice and offer a newsletter-only
opt-out. Unsubscribe tokens backfilled, 0 members now missing one. Renewal
reminders fixed, with a bounce guard on every send. Bounce and complaint handling
added. Broadcast consent gaps closed. Checkout restored and live. The
`billing_interval` mismatch fixed. Stripe price IDs confirmed present in Vercel.
Newsletter signup now stamps `signup_source`. Laura Allmen deduplicated, 1 row
remains. Slug generation consolidated. Per-listing tiers enforced on the listing
page, the portal editor and the browse list. Free listings given a 300 character
description. Categories assigned to all but one listing. Sitemap grew from 28
URLs to 113. 14 category landing pages built. `/directory` server rendered.
`llms.txt` added. Schema reduced from 5 LocalBusiness blocks per page to 1.
