# NAP site backlog

Things known to be worth doing, not yet done. Newest concerns first.
Nothing here is urgent unless marked.

---

## Check-in

- **Per-chapter check-in tokens.** All four chapters currently share one
  `CHECKIN_QR_TOKEN`, so every QR code is equivalent: a Manchester code works at
  Smyrna and just records the wrong chapter. One leaked or misprinted code means
  rotating the token and reprinting all four. Per-chapter tokens would let one be
  rotated alone. Touches `src/lib/checkin-auth.ts`, the check-in and search
  routes, and `/admin/checkin-codes`.

- **Nolensville lost 2026-09-24 entirely** because the printed QR code was
  missing and nobody could check in. `/admin/checkin-codes` now exists so this
  is recoverable on the spot, but the incident is why that page was built.

## Email and consent

- **Unsubscribe link is missing from `emailWrapper`.** Only broadcasts carry
  one. Recap emails, welcome emails, renewal reminders and comp notices all ship
  without it. One change in `src/lib/emails.ts` covers ~30 email types.

- **Renewal reminders can never fire.** `src/app/api/cron/renewal-reminders`
  filters on `members.current_period_end`, which nothing in the codebase ever
  writes. The Stripe webhook receives it on `customer.subscription.updated` and
  `invoice.payment_succeeded` and discards it. The cron has been running daily
  and matching zero rows.

- **No membership or billing notification preference.** The four `notif_*`
  columns cover cancellations, events, broadcasts and digest. Renewal mail
  honours none of them, nor `email_unsubscribed`.

- **`bethmcgill1229@gmail.com` has no real name**, only the email local part,
  because the newsletter signup route derives `full_name` that way. Ask her
  directly if it matters.

- **`newsletter-signup` route does not set `signup_source`.** Rows created
  through the site banner land with NULL rather than `'newsletter'`. The
  historical backfill fixed existing rows; new ones still arrive unstamped.

## Data hygiene

- **Two `Rachel Albertson` member records**, both amplified, comped, leadership,
  Murfreesboro, never expiring. The `hello@` record claims NAP as its business
  but owns the Inforule listing; the `rachel@` record claims Inforule and owns
  nothing. Legitimate as two businesses, but the names and listings are crossed.

- **`Laura Allmen` is a genuine duplicate** (gmail and yahoo, same business,
  same listing). Receives every broadcast twice.

- **62 members have `subscription_status = 'active'` with no Stripe
  subscription.** Asserted rather than backed by anything.

## Checkout

- **`checkout-test` branch is stashed, not merged.** Restores the Stripe
  checkout handler and Get Started buttons on `/join`. Diff was reviewed and the
  build passed. Paid tiers currently route to `/contact?interest=<tier>`.

- **`billing_interval` mismatch.** `PricingCards.tsx` writes `"annual"`;
  `admin/page.tsx` reads `"year"` for its MRR calculation. Every annual buyer
  would be counted at the monthly rate once self-serve checkout ships.

- **`docs/checkout-e2e-test.md` is out of date.** Written before the webhook
  stopped creating listings and started creating invites.

## Features that exist but are not wired up

- **`chapter_closures` table and `src/lib/closures.ts`.** A complete,
  closure-aware scheduling layer combining holiday rules with ad-hoc closures.
  Nothing imports it and the table is empty. This is what the SNAP September 4
  closure should have used instead of a hardcoded banner component.

- **Recap posts are manual by choice.** `chaptersMeetingOn()` exists and would
  support a cron, but auto-sending would have posted Nolensville on 2026-09-10
  with 3 check-ins before a fourth arrived, and Manchester on 2026-08-18 with no
  leadership section. Sending when asked produces better posts.
