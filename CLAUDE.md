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
