# Directory audit: SEO then AEO

Baseline measured 2026-10-03 against live Supabase and the live site. Nothing in
here has been changed yet.

## Where things stand

71 live listings. 57 Linked, 2 Connected, 12 Amplified. None pending or inactive.

Field completeness across all 71:

| Field | Filled |
|---|---|
| phone | 66 |
| primary category | 61 |
| tagline | 31 |
| logo | 15 |
| description | 12 |
| website | 12 |
| description over 150 chars | 9 |
| tags | 7 |
| street address | 4 |
| additional categories | 4 |

Categories: 132 total, 16 main and 116 sub.

## The structural problem

Three findings that matter more than any individual listing's content.

**1. No listing page is in the sitemap.** The sitemap has 28 URLs. 18 are blog
posts. Zero are listings. All 71 listing pages are absent.

**2. Crawlers see an empty directory.** `/directory` renders `DirectoryBrowser`,
a client component that fetches results with `useState` and `fetch`. The raw HTML
contains zero business names, confirmed against the live site. So the only
crawlable links to listing pages come from the portal and admin, which are behind
login. The 71 listing pages are effectively orphaned: not in the sitemap, not
linked from any public HTML.

**3. There is no indexable URL for any category.** Filters in `DirectoryBrowser`
are component state, never reflected in the URL. So there is no page that can
ever rank for "insurance agent Murfreesboro TN" or any of the other 131
category-shaped searches people actually type.

The individual listing pages are built correctly, which is the good news. They
are server rendered, carry a canonical URL, per-listing title and description,
and LocalBusiness JSON-LD. The plumbing is right. Nothing points at them.

## Secondary findings

**Tags are gated by tier.** The portal tag editor allows 2 for Connected and 4
for Amplified. Linked gets none, and the listing page renders no tags for Linked.
So 57 of 71 listings structurally cannot have tags. Tags also feed directory
search, so this gating affects findability on the site itself, not just Google.

**JSON-LD is thin.** It emits name, description, address as a flat string, url,
image, and aggregateRating. Missing: `telephone`, `address` as a real
PostalAddress object, `areaServed`, `sameAs` for socials, and any category or
service information.

**10 live listings have no category.** All arrived through `/join/linked`, which
never asks for one. Every future free signup repeats this.

**No llms.txt.** Relevant to part 2.

## Plan

### Phase 0 — data, before any code

Nothing downstream works if the data is wrong, and category pages built on bad
categories just publish the mistakes.

1. Close the leak: `/join/linked` must collect a category. Otherwise this list
   grows while we work.
2. Assign categories to the 10 uncategorized listings.
3. Rachel reviews all 71 for correct primary category, useful additional
   categories, and tags.
4. Decide the tag policy (see Decisions).

### Phase 1 — SEO

1. **Sitemap: add all 71 listing pages**, with `lastModified` from
   `updated_at`. Smallest change, largest immediate effect, since it is what
   un-orphans them.
2. **Category landing pages.** Indexable, server rendered, one per category:
   an H1 like "Insurance Agents in Middle Tennessee", intro copy, and the
   listing cards in HTML. These are the pages that can actually rank, and they
   give every listing a crawlable inbound link. Also solves finding 3.
3. **Server-render listings on `/directory`** so the browse page is not an
   empty shell, with the client filter layered on top.
4. **Better title tags.** Today: "Business Name | NAP Directory". Better:
   "Business Name, Category in City TN | NAP". Categories and cities are what
   people search.
5. **Descriptions for the 59 listings without one.** The biggest labor item and
   the one that most limits how well anything ranks.
6. **Enrich the JSON-LD** with telephone, structured PostalAddress, areaServed,
   and sameAs.

Order matters. 1 is an hour. 2 and 3 are the real build. 5 is ongoing and can run
in parallel with everything.

### Phase 2 — AEO

Answer engines need to extract facts and trust them, which needs Phase 1 done.

1. **llms.txt** describing NAP, the four chapters, and the directory.
2. **Answer-shaped category pages.** "Who are the insurance agents in
   Murfreesboro?" wants a page whose first paragraph answers exactly that, with
   named businesses. Mostly a copy decision on top of Phase 1 item 2.
3. **FAQPage schema** on category pages.
4. **Organization schema** sitewide with consistent name, address, phone, and
   sameAs, so NAP resolves as one entity rather than four unlinked chapters.
5. **Confirm no listing fact requires JavaScript.** Most crawlers that feed
   answer engines do not run it.

## Decisions made 2026-10-03

**D1. Member records: consolidate onto rachel@inforulesm.com.** Make it the one
real account. Move the Inforule listing and the 10 check-ins across, copy the
password hash, set `role = super_admin`, then retire the
hello@networkingforawesomepeople.com row. This touches Rachel's own admin login,
so it runs as a single reversible step with the old row's values captured first
and login verified before the old row is retired.

**D2. Tags: store for all tiers, display stays paid.** Every listing can carry
tags so they feed on-site search, meta content and schema. Visible tag chips on
the listing page remain a Connected and Amplified perk.

**D3. Free listings get a short visible description.** 300 characters, plain text,
no links or line breaks, rendered on the page. Long-form description stays a
Connected feature. Tagline display stays paid, so Linked gets the plain About
paragraph and not the hero line. Placement in directory results stays tier
weighted and is not touched, which keeps the strongest paid lever intact.

Rationale: 57 of 71 pages otherwise carry only a name, a city and a phone number.
Thin pages risk Google discounting the whole directory section, which would hurt
the 12 Amplified members who paid to be found there. Connected still retains
seven of its eight unlocks.

**D4. Build category landing pages.** Indexable, server rendered, one per
category. Build these at the 16 main categories, not all 132. 61 listings spread
across 33 categories means most individual categories hold one or two listings,
and the directory route already rolls subcategories up into their main.

**D5. Tier is a property of the listing, not the member.** Leadership carries the
same privileges as Amplified, but on one listing only. The listing page and the
portal editor both read `member.tier` and OR in `is_leadership`, so every listing
a member owned inherited the privileges of their best one: Kayce Broach's
Keystone Hormones is stored as linked and was rendering Amplified photos and
business hours on the live site. Both now read `listing.tier`, falling back to the
member tier only for rows that predate the column, which matches what the
directory ranking route already did. All 11 leadership members already have their
main listing at amplified, so this changed entitlement for exactly one listing out
of 71.

Still open: city plus category pages (`/directory/murfreesboro/insurance`).
Deferred to a later phase, after category pages prove out.

## Build order

Phase 0 and the sitemap are cheap. Do not add the 57 thin pages to the sitemap
until they have descriptions, or the sitemap change works against us.

1. Close the `/join/linked` category leak.
2. Categories for the 10 uncategorized listings.
3. Schema and gating change: 300 char description for Linked, tags stored for all
   tiers.
4. Rachel reviews all 71 for category, additional categories and tags.
5. Descriptions written for the Linked listings.
6. Sitemap: add all listing pages, once they have content.
7. Server render listings on `/directory` so it is not an empty shell.
8. Category landing pages.
9. Title tags: "Business Name, Category in City TN | NAP".
10. Enrich JSON-LD: telephone, PostalAddress, areaServed, sameAs.
11. Phase 2 AEO: llms.txt, answer shaped category copy, FAQPage, Organization
    schema.
