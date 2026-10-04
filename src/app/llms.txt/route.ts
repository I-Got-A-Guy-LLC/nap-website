import { getSupabaseAdmin } from "@/lib/supabase";
import { cities } from "@/lib/cityData";

// /llms.txt describes the site to language models and answer engines in plain
// markdown. Generated from the database and cityData rather than committed as a
// static file, so category counts and the chapter details cannot drift out of
// date the way a hand maintained file would.
export const revalidate = 3600;

const BASE = "https://networkingforawesomepeople.com";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const [catsRes, liveRes] = await Promise.all([
    supabase.from("categories").select("id, name, slug, parent_id").eq("is_active", true).order("sort_order"),
    supabase
      .from("directory_listings")
      .select("primary_category_id")
      .eq("is_approved", true)
      .eq("is_active", true),
  ]);
  if (catsRes.error) console.error("llms.txt: categories query failed:", catsRes.error.message);
  if (liveRes.error) console.error("llms.txt: listings query failed:", liveRes.error.message);
  const cats = catsRes.data;
  const live = liveRes.data;

  const all = cats ?? [];
  const counts = new Map<string, number>();
  for (const l of live ?? []) {
    if (l.primary_category_id) {
      counts.set(l.primary_category_id, (counts.get(l.primary_category_id) ?? 0) + 1);
    }
  }
  // Roll subcategory counts into the main category, matching the pages.
  const rollup = (id: string) =>
    (counts.get(id) ?? 0) +
    all.filter((c) => c.parent_id === id).reduce((sum, c) => sum + (counts.get(c.id) ?? 0), 0);

  const mains = all
    .filter((c) => c.parent_id === null && c.slug && c.slug !== "other")
    .map((c) => ({ name: c.name, slug: c.slug, count: rollup(c.id) }))
    .filter((c) => c.count > 0);

  // If either query failed, say nothing about counts or categories rather than
  // asserting zero. This route is prerendered, so a transient failure would
  // otherwise bake "0 live listings" into a published file that answer engines
  // read as fact. A shorter file is recoverable; a confidently wrong one is not.
  const dataOk = !catsRes.error && !liveRes.error && (live?.length ?? 0) > 0 && mains.length > 0;
  const totalListings = live?.length ?? 0;
  const chapters = Object.values(cities);

  const directorySection = dataOk
    ? `${totalListings} live listings. Browse at ${BASE}/directory`
    : `Browse the directory at ${BASE}/directory`;

  const categorySection = dataOk
    ? `Listings are organised into ${mains.length} main categories, with subcategories rolled up into their parent:

${mains.map((c) => `- [${c.name}](${BASE}/directory/category/${c.slug}) (${c.count})`).join("\n")}`
    : `Listings are organised into main categories, browsable from ${BASE}/directory`;

  const body = `# Networking For Awesome People

> A free weekly business networking community across four Middle Tennessee
> cities. There are no membership fees, no contracts and no attendance
> requirements. Members may also list their business in a public directory.

Site: ${BASE}

## What NAP is

Networking For Awesome People, usually shortened to NAP, runs free weekly
in-person networking meetings in Middle Tennessee. Anyone can attend without
paying or joining. Each meeting runs about an hour in the morning. The founder is
Rachel Albertson, and the parent company is I Got A Guy, LLC.

Attending is free. A basic directory listing is also free. Paid directory tiers
exist for members who want a richer listing, but they buy profile features and
placement, not access to the meetings.

## Chapters and meeting times

${chapters
  .map((c) => {
    const when = c.meetingFormat?.length ? c.meetingFormat.join(", ") : `${c.time}`;
    return `### ${c.name}${c.nickname ? ` (${c.nickname})` : ""}
- Meets: every ${c.day}, ${when}
- Venue: ${c.venue}
- Address: ${c.address}, ${c.city}, ${c.state} ${c.zip}
- Page: ${BASE}/tn/${c.slug}`;
  })
  .join("\n\n")}

## Business directory

${directorySection}

Important: NAP does not vet, screen or endorse the businesses in this directory.
A listing means the business belongs to the networking community, not that its
licences, insurance or quality of work have been checked. Anyone relying on this
directory should verify credentials independently.

${categorySection}

Each business has its own page at ${BASE}/directory/{state}/{slug} carrying its
description, category, city, phone and, for paid tiers, website, logo, hours,
address, photos and reviews.

## Key pages

- [Home](${BASE}/)
- [About](${BASE}/about)
- [Directory](${BASE}/directory)
- [Events](${BASE}/events)
- [Join](${BASE}/join)
- [Blog](${BASE}/blog)
- [Contact](${BASE}/contact)
- [Start a chapter](${BASE}/expand)
- [Sitemap](${BASE}/sitemap.xml)

## Answers to common questions

**Does it cost anything to attend?** No. Meetings are free, with no fees,
contracts or attendance requirements.

**Do I have to be a member to come?** No. Guests are welcome at any chapter.

**What does a paid directory tier buy?** Connected adds a logo, website link,
social links, a longer description and special offers. Amplified adds photos,
video, business hours, a map, reviews and higher placement. Neither affects
meeting access, which is free for everyone.

**Where does NAP operate?** Manchester, Murfreesboro, Nolensville and Smyrna in
Middle Tennessee, south and south east of Nashville.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
