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

The Join page (`/join`) has live Stripe checkout buttons for Connected ($300/yr) and Amplified ($500/yr) tiers, but no real paying customer has ever completed this flow. All current paid members were added manually to Supabase. Before promoting the Join page, removing the "Directory billing is coming soon" banner, or directing real visitors to sign up, the full flow must be tested: Stripe checkout → webhook fires → member record created in Supabase → welcome email sends → portal login works → directory listing appears at correct tier.
