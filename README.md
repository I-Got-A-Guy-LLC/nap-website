# Networking For Awesome People

Official website for [Networking For Awesome People](https://networkingforawesomepeople.com) — a free weekly networking organization across four Middle Tennessee cities.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — Styling with custom brand colors
- **Supabase**: Database, auth, storage
- **Stripe**: Checkout for paid directory tiers (Connected, Amplified)
- **Vercel**: Hosting, deployment, and cron jobs
- **Resend**: Transactional email
- **League Spartan + Inter** — Typography via Google Fonts

## Project Structure

```
src/app/           Pages (homepage, about, blog, events, city pages, API routes)
src/components/    Reusable components (nav, footer, FAQ, city template)
src/lib/           Data and utilities (city data, blog parser, schemas, closures)
src/content/blog/  — Markdown blog posts
public/images/     — Logos, photos, supporter logos
```

## Cities

| City | Day | Time | Venue | URL |
|------|-----|------|-------|-----|
| Manchester | Tuesday | 9:00am | FirstBank | /tn/manchester |
| Murfreesboro | Wednesday | 8:30am / 9:00am | Strike & Spare Entertainment Complex | /tn/murfreesboro |
| Nolensville | Thursday | 9:00am | Waldo's Chicken and Beer | /tn/nolensville |
| Smyrna | Friday | 9:00am | Almaville Apartments Conference Center | /tn/smyrna |

## Deployment

The site deploys to Vercel. Push to `main` to trigger a production deploy.

## Content Management

- **Blog posts:** Add markdown files to `src/content/blog/` with frontmatter. The `metaTitle` must not include the brand suffix. The layout template appends it.
- **City data:** Update `src/lib/cityData.ts` for meeting details, leaders, FAQs
- **Holiday closures:** Edit `src/lib/holidayClosures.ts` to add or remove closures

## License

Copyright I Got A Guy, LLC. All rights reserved.
