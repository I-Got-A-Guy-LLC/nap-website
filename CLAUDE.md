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
- `checkout-test` — merged into main, safe to delete
- `stripe-e2e-test` — local only, never pushed
- `sponsor-multi-ticket-webhook` — unmerged WIP (commit ea29c15). Contains:
  - New `sendSponsorCompTickets` function in `src/app/api/stripe/webhook/route.ts` — generates QR codes for each comp ticket, uploads to Supabase storage, sends a single email with all ticket codes via Resend
  - `scripts/resend-seth-tickets.ts` — one-time recovery script for Seth Connell's tickets (already executed)
  - `scripts/fix-member-invites-rls.ts` — RLS migration enabling service-role-only access on `member_invites` table (likely already executed against live Supabase; verify state before re-running — re-run will fail on duplicate policy)

DO NOT merge to main without first testing end-to-end with a real multi-ticket sponsor checkout in Stripe test mode. The webhook handles live Stripe events.

## Tier belongs to the listing, not the member

Pricing is per business listing. A member can own two businesses and hold
Amplified on one and Linked on the other, so **never read `members.tier` to decide
what to show**. Read `directory_listings.tier`, falling back to `members.tier`
only for rows created before the column existed.

This rule was broken in four separate places in one week, each a different file
deriving tier its own way: the listing page rendered Amplified photos and hours on
a Linked listing, the portal editor opened the full Amplified editor on it, the
browse list badged it "NAP Leader", and the browse list showed its tagline in gold
so free listings looked paid. Check this list before adding a fifth surface.

Shared helpers, use these rather than writing the logic again:

- `src/lib/directoryRanking.ts` — `tierOf`, `isLeadershipListing`, `rankListings`,
  `visibleInCity`, `listingPath`. Used by `/api/directory` and the category pages.
- `src/lib/listingLimits.ts` — `newListingTier` for creation,
  `clampLinkedDescription` and `LINKED_DESCRIPTION_MAX` for the free-tier cap.

Surfaces that must respect the listing tier:

- `src/app/directory/[state]/[slug]/page.tsx` — the listing page
- `src/components/DirectoryBrowser.tsx` — badges, tagline, description
- `src/app/directory/category/[slug]/page.tsx` — category landing pages
- `src/app/api/directory/route.ts` — ranking and the city rule
- `src/app/portal/listing/page.tsx` — which fields the editor offers

The rules themselves:

- **Leadership carries Amplified privileges on ONE listing**, the one whose tier
  is `amplified`. It is not a property of the person. A leader's second business
  is Linked unless paid for. Kayce Broach is the live example: KK Fitness
  Training Amplified, Keystone Hormones Linked.
- **A member's first listing takes their member tier**, so someone who paid sees
  it on the business they bought it for. Every additional listing starts at
  `linked`. Enforced by `newListingTier` in all three creation paths.
- **Store for all tiers, display by tier.** Tags and descriptions are saved for
  everyone so they feed on-site search, meta tags and schema; whether they render
  is decided at display time. Do not gate the write.

## Checkout state (updated 2026-10-07)

Self-serve checkout is live. `/join` has working Stripe buttons for Connected
($300/yr) and Amplified ($500/yr), the four `NEXT_PUBLIC_STRIPE_PRICE_*` vars are
confirmed present in Vercel, and there is one active Stripe subscriber. Every
other paid member is comped leadership, added manually.

What works end to end:

- **A new member buying a paid tier.** Checkout fires the webhook, which upserts
  the member at the paid tier and creates a `member_invites` row plus a welcome
  email with a set-password link. When they then create their listing,
  `newListingTier` gives it their member tier, so it displays as paid.
- **Cancellation.** `customer.subscription.deleted` downgrades `members.tier`
  AND the member's listings to `linked`, skipping comped members so a leadership
  benefit is never revoked by a Stripe event.

What is still broken:

- **An existing member upgrading.** The upgrade buttons in `/portal/billing` and
  the listing editor link to `/join`, so an upgrader re-runs public signup. They
  are charged and `members.tier` updates, but their existing listing keeps its
  old tier and displays as free, and they receive a "set your password" invite
  email they do not need. Fixing this needs checkout to carry a listing id in
  `metadata` and `subscription_data.metadata`, and the webhook to set
  `directory_listings.tier` on that listing.

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
- the homepage FAQ prose — both times are mentioned inline in the sentence (no array). `src/app/layout.tsx` no longer carries meeting times: the chapter schemas moved to `src/lib/siteSchema.ts` and render on the home page.
- `src/app/not-found.tsx` — stays single-time (compact label).

The hero subtitle in `CityPageTemplate.tsx` also intentionally stays single-time (`{city.time}`) because adding two lines clutters the single-line summary; the "When" card directly below carries the detail.

If a future city needs the same treatment, replicate the same field+guard pattern in each of the consumers above. Do not introduce additional fields or new shared abstractions for this — the duplication is deliberate to avoid coupling unrelated data shapes.
