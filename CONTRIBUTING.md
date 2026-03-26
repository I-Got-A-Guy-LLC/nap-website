# Contributing to Networking For Awesome People Website

## Development Setup

1. Clone the repo: `git clone https://github.com/I-Got-A-Guy-LLC/nap-website.git`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Open http://localhost:3000

## Branch Strategy

- `main` — Production branch, auto-deploys to Netlify
- Feature branches — Create from `main`, PR back to `main`

## Adding Content

### Blog Posts
Create a markdown file in `src/content/blog/` with this frontmatter:

```markdown
---
title: "Your Post Title"
slug: "your-post-slug"
author: "Author Name"
category: "Networking Tips"
date: "2026-01-01"
excerpt: "A brief description of the post."
---

Your markdown content here.
```

Categories: `Networking Tips`, `Introverts Welcome`, `Connections & Collaboration`, `Member Stories`

### Supporter Logos
1. Add the logo image to `public/images/supporters/`
2. Add a new entry in the Community Supporters section of `src/app/page.tsx`

### New City Pages
1. Add city data to `src/lib/cityData.ts`
2. Create `src/app/tn/[city]/page.tsx` (copy existing city page as template)
3. Update navigation, footer, and sitemap

## Code Style

- TypeScript strict mode
- Tailwind CSS for all styling — no custom CSS except globals.css
- "Networking For Awesome People" spelled out on first reference per page
- All buttons: `rounded-full`
- All cards: `rounded-xl`
- Navy (#1F3149) for text, Gold (#FBC761) for accents/CTAs
