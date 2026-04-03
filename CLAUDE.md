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
