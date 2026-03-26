# Networking For Awesome People — Website

## Project Overview
Custom website for Networking For Awesome People (networkingforawesomepeople.com), a free weekly networking organization across four Middle Tennessee cities. Owned by I Got A Guy, LLC, founded by Rachel Albertson.

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + @tailwindcss/typography
- **CMS:** Decap CMS (config at /public/admin/)
- **Hosting:** Netlify (config at netlify.toml)
- **Fonts:** League Spartan (headings), Inter (body) via next/font/google
- **Markdown:** gray-matter + remark + remark-html for blog posts

## Brand Rules
- Always write "Networking For Awesome People" in full on first reference per page
- "NAP" may be used after first full reference
- City nicknames: BORO NAP (Murfreesboro), SNAP (Smyrna), N2 (Nolensville)
- Never lead a heading or paragraph with "NAP" alone without spelling it out first on that page

## Brand Colors
- Navy: #1F3149 (primary)
- Gold: #FBC761 (accent/CTAs)
- Manchester teal: #71D4D1
- Murfreesboro navy: #1F3149
- Nolensville amber: #F5BE61 (always use navy text on amber for contrast)
- Smyrna coral: #FE6651
- Light Gray: #F5F5F5

## URL Structure
City pages use `/tn/[city]` format (not `/cities/[city]`). This is future-proofed for multi-state expansion — add `/tx/`, `/fl/`, etc. as needed. 301 redirects from old `/cities/` URLs are configured in next.config.mjs.

## Key Directories
```
src/
  app/
    page.tsx              # Homepage (8 sections)
    about/page.tsx        # About page
    blog/page.tsx         # Blog index with category filter
    blog/[slug]/page.tsx  # Individual blog post template
    events/page.tsx       # Events with 3-view toggle (Cards/List/Calendar)
    tn/                   # Tennessee city pages
      manchester/page.tsx
      murfreesboro/page.tsx
      nolensville/page.tsx
      smyrna/page.tsx
    join/                 # Placeholder
    contact/              # Placeholder
    sitemap.ts            # Auto-generated sitemap
  components/
    Navigation.tsx        # Teal nav, sticky, logo, cities dropdown
    Footer.tsx            # Navy footer, gold headings, 4 columns
    ScrollReveal.tsx      # Intersection Observer fade-in animation
    FAQAccordion.tsx      # Reusable accordion component
    CityPageTemplate.tsx  # Shared 7-section city page template
    BlogGrid.tsx          # Blog index grid with category filter
    EventsViews.tsx       # Cards/List/Calendar toggle views
  lib/
    cityData.ts           # All city-specific data (meetings, leaders, FAQs)
    blog.ts               # Blog post parsing (gray-matter + remark)
  content/
    blog/                 # Markdown blog posts with frontmatter
    cities/               # Decap CMS city content (unused currently)
public/
  admin/                  # Decap CMS admin panel
    config.yml            # CMS collections config
    index.html            # CMS entry point
  images/
    nap-logo.png          # Brand logo
    hero-bg.png           # Homepage hero background
    rachel-albertson.jpg   # Founder headshot
    community-bg.png      # Community supporters section background
    supporters/           # Member business logos
  robots.txt
```

## SEO/AEO Implementation
Every page includes:
- next/metadata for title, description, OG tags, canonical URL
- JSON-LD structured data (Organization, LocalBusiness, Event, FAQPage, BlogPosting)
- Headings written as natural search queries for AEO/voice search
- FAQ sections with FAQPage schema on homepage, about, city pages, events

## City Meeting Data
- Manchester: Tuesdays 9:00am, FirstBank, 1500 Hillsboro Blvd, Manchester TN 37355
- Murfreesboro: Wednesdays 9:00am, Achieve, 1630 S Church St #100, Murfreesboro TN 37130
- Nolensville: Thursdays 8:30am, Waldo's, 7238 Nolensville Road, Nolensville TN 37135
- Smyrna: Fridays 9:15am, Smyrna Public Library, 400 Enon Springs Rd W, Smyrna TN 37167

## Common Tasks
- **Add a blog post:** Create a .md file in src/content/blog/ with frontmatter (title, slug, author, category, date, excerpt)
- **Add a supporter logo:** Drop image in public/images/supporters/, add entry in src/app/page.tsx community supporters section
- **Add a new city:** Add data to src/lib/cityData.ts, create page at src/app/tn/[city]/page.tsx
- **Add a new state:** Create folder at src/app/[state]/, add city pages inside
- **Update meeting details:** Edit src/lib/cityData.ts — it propagates to city pages, schemas, and templates
- **Replace photo placeholders:** Swap files in public/images/ and update src references

## Remaining Pages to Build
- /join — Linked/Connected/Amplified pricing tiers
- /contact — Contact form
- /bring-nap-to-your-city — Licensing interest page
- 404 — Branded error page

## GitHub
Repository: github.com/I-Got-A-Guy-LLC/nap-website
