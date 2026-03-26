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
- **Decap CMS** — Content management at /admin
- **Netlify** — Hosting and deployment
- **League Spartan + Inter** — Typography via Google Fonts

## Project Structure

```
src/app/           — Pages (homepage, about, blog, events, city pages)
src/components/    — Reusable components (nav, footer, FAQ, city template)
src/lib/           — Data and utilities (city data, blog parser)
src/content/blog/  — Markdown blog posts
public/admin/      — Decap CMS configuration
public/images/     — Logos, photos, supporter logos
```

## Cities

| City | Day | Time | Venue | URL |
|------|-----|------|-------|-----|
| Manchester | Tuesday | 9:00am | FirstBank | /tn/manchester |
| Murfreesboro | Wednesday | 9:00am | Achieve | /tn/murfreesboro |
| Nolensville | Thursday | 8:30am | Waldo's | /tn/nolensville |
| Smyrna | Friday | 9:15am | Smyrna Public Library | /tn/smyrna |

## Deployment

The site deploys to Netlify via the `netlify.toml` configuration. Push to `main` to trigger a deploy.

## Content Management

- **Blog posts:** Add markdown files to `src/content/blog/` with frontmatter
- **CMS:** Access Decap CMS at `/admin` (requires Netlify Identity setup)
- **City data:** Update `src/lib/cityData.ts` for meeting details, leaders, FAQs

## License

Copyright I Got A Guy, LLC. All rights reserved.
