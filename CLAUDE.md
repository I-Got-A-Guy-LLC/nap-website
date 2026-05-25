# NAP Website — Claude Code Instructions

## Protected Files

Do not modify these files unless Rachel explicitly names them in the prompt:

- `src/app/portal/listing/page.tsx` — Member listing editor (working)
- `src/app/api/stripe/webhook/route.ts` — Stripe webhook (critical)
- `src/lib/emails.ts` — Email templates (working)
- `src/app/events/range-night-2026/` — Range Night event (live)
- `src/app/admin/events/[eventId]/checkin/CheckInDashboard.tsx` — Event check-in dashboard

## Rules

- Always show every file changed and exactly what changed
- Never modify more files than the prompt requires
- Always run `npm run build` before pushing to verify the build passes
- Stripe is in LIVE mode — never modify webhook or checkout logic without explicit instruction
- Never change working UI components without explicit instruction

## Active Branches

- `main` — production, auto-deploys via Vercel
- `sponsor-multi-ticket-webhook` — unmerged WIP (commit ea29c15). Contains:
  - New `sendSponsorCompTickets` function in `src/app/api/stripe/webhook/route.ts` — generates QR codes for each comp ticket, uploads to Supabase storage, sends a single email with all ticket codes via Resend
  - `scripts/resend-seth-tickets.ts` — one-time recovery script for Seth Connell's tickets (already executed)
  - `scripts/fix-member-invites-rls.ts` — RLS migration enabling service-role-only access on `member_invites` table (likely already executed against live Supabase; verify state before re-running — re-run will fail on duplicate policy)

DO NOT merge to main without first testing end-to-end with a real multi-ticket sponsor checkout in Stripe test mode. The webhook handles live Stripe events.

## Untested Checkout Flow

The Join page (`/join`) has live Stripe checkout buttons for Connected ($300/yr) and Amplified ($500/yr) tiers, but no real paying customer has ever completed this flow. All current paid members were added manually to Supabase. Bug fixes landed 2026-05-24: removed the `customer_creation` parameter (incompatible with `mode: "subscription"`), corrected the price-ID env var prefix to `NEXT_PUBLIC_STRIPE_PRICE_*` so the client bundle can read them, removed the "Directory billing is coming soon" banner, and switched checkout to open in a new tab. Before directing real visitors to sign up, the full flow must still be tested end-to-end: Stripe checkout → webhook fires → member record created in Supabase → welcome email sends → portal login works → directory listing appears at correct tier.

## Stripe Price ID Env Vars

Client-side price IDs in `src/components/PricingCards.tsx` are read via `process.env.NEXT_PUBLIC_STRIPE_PRICE_*`. The `NEXT_PUBLIC_` prefix is required so Next.js inlines them into the browser bundle — without it, the Join page button silently bails with "Checkout is not yet configured." The 4 expected names: `NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_ANNUAL`, `NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_MONTHLY`, `NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_ANNUAL`, `NEXT_PUBLIC_STRIPE_PRICE_AMPLIFIED_MONTHLY`.

## Per-City Meeting Format and Entry Note (Murfreesboro pattern)

When a city's meeting time has a multi-segment format (e.g., open-networking window before the meeting), use the optional `meetingFormat?: string[]` field on the city's entry in `src/lib/cityData.ts`. Each array element renders on its own line in the city page "When" card via `CityPageTemplate.tsx`. Currently only Murfreesboro uses this: `["8:30am Open Networking", "9:00am Meeting Starts"]`. The same city also uses optional `entryNote?: string` for parking/entrance instructions, rendered under the address in the "Where" card.

Because city venue/time data is duplicated across several files (NOT just `cityData.ts`), the multi-line format requires parallel updates wherever Murfreesboro's time renders. Each consumer has its own field name and local render logic:

- `src/components/CityPageTemplate.tsx` — consumes `city.meetingFormat` directly (city page "When" card).
- `src/app/page.tsx` — home page city panels: each panel has its own local `timeLines?: string[]` field; render guarded by `city.timeLines && city.timeLines.length > 0`.
- `src/app/about/page.tsx` — locations array: each location has `timeLines?: string[]`; same guard pattern.
- `src/app/contact/page.tsx` — `cityLinks` array: Murfreesboro's `detail` is a `string[]` while others are `string`; render uses `Array.isArray(c.detail)`.
- `src/components/EventsViews.tsx` — `CityEvent` interface has `meetingFormat?: string[]`; card view and list/table cells branch on `e.meetingFormat`. Calendar view and inline "this week" summaries intentionally stay single-time.
- `src/app/layout.tsx` and the homepage FAQ prose — both times are mentioned inline in the sentence (no array).
- `src/app/not-found.tsx` — stays single-time (compact label).

The hero subtitle in `CityPageTemplate.tsx` also intentionally stays single-time (`{city.time}`) because adding two lines clutters the single-line summary; the "When" card directly below carries the detail.

If a future city needs the same treatment, replicate the same field+guard pattern in each of the consumers above. Do not introduce additional fields or new shared abstractions for this — the duplication is deliberate to avoid coupling unrelated data shapes.
