import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { clampLinkedDescription } from "@/lib/listingLimits";
import {
  tierOf,
  isLeadershipListing,
  rankListings,
  listingPath,
} from "@/lib/directoryRanking";

// Static segment, so these never collide with /directory/[state]/[slug].
// Revalidated rather than force-dynamic: a category page changes only when a
// listing is approved or edited, and these are meant to be fast crawl targets.
export const revalidate = 3600;

const BASE = "https://networkingforawesomepeople.com";

// "Other (suggest a category)" is an intake bucket for members who could not find
// their category, not a thing anyone searches for. It gets no page and no links.
const EXCLUDED_SLUG = "other";
const CITY_LABELS: Record<string, string> = {
  manchester: "Manchester",
  murfreesboro: "Murfreesboro",
  nolensville: "Nolensville",
  smyrna: "Smyrna",
};

type Category = { id: string; name: string; slug: string; parent_id: string | null };

async function getCategory(slug: string): Promise<Category | null> {
  if (slug === EXCLUDED_SLUG) return null;
  const supabase = getSupabaseAdmin();
  // Main categories only. A page per subcategory would mostly hold one listing,
  // and thin pages drag down the section they sit in. Subcategories roll up here.
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("slug", slug)
    .is("parent_id", null)
    .eq("is_active", true)
    .maybeSingle();
  return data ?? null;
}

async function getListings(categoryId: string) {
  const supabase = getSupabaseAdmin();
  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", categoryId);
  const ids = [categoryId, ...(children ?? []).map((c) => c.id)];

  const { data } = await supabase
    .from("directory_listings")
    .select(`
      id, business_name, slug, listing_state, city, tier, tagline, description,
      logo_url, contact_phone, website_url,
      members!inner(tier, is_leadership),
      categories:primary_category_id(name, slug)
    `)
    .eq("is_approved", true)
    .eq("is_active", true)
    .in("primary_category_id", ids)
    .range(0, 999);

  return rankListings(data ?? []);
}

export async function generateStaticParams() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("categories")
    .select("slug")
    .is("parent_id", null)
    .eq("is_active", true);
  return (data ?? [])
    .filter((c) => c.slug && c.slug !== EXCLUDED_SLUG)
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Category Not Found | NAP Directory" };

  const listings = await getListings(category.id);
  const n = listings.length;
  // Lead with the category and the region, because that is what people type.
  const title = `${category.name} in Middle Tennessee | NAP Directory`;
  const description =
    n > 0
      ? `${n} ${category.name.toLowerCase()} ${n === 1 ? "business" : "businesses"} in Manchester, Murfreesboro, Nolensville and Smyrna, Tennessee, all members of Networking For Awesome People.`
      : `${category.name} businesses in Middle Tennessee, from the Networking For Awesome People directory.`;

  return {
    title,
    description,
    // A category with nothing in it is a page with nothing to offer. Keep it out
    // of the index until a business joins, but keep following its links so the
    // other category pages are still discoverable through it.
    ...(n === 0 ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url: `${BASE}/directory/category/${category.slug}` },
    alternates: { canonical: `${BASE}/directory/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const supabase = getSupabaseAdmin();
  const listings = await getListings(category.id);

  // Sibling categories, for crawlable internal links. The browse page filters
  // client side, so without links like these a crawler has no path between
  // categories at all.
  const { data: siblings } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .eq("is_active", true)
    .neq("id", category.id)
    .neq("slug", EXCLUDED_SLUG)
    .order("sort_order");

  const cities = Array.from(
    new Set(listings.map((l) => l.city).filter((c): c is string => Boolean(c)))
  )
    .map((c) => CITY_LABELS[c] || c)
    .sort();

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} in Middle Tennessee`,
    url: `${BASE}/directory/category/${category.slug}`,
    about: category.name,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: l.business_name,
          url: `${BASE}${listingPath(l)}`,
        },
      })),
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Directory", item: `${BASE}/directory` },
      { "@type": "ListItem", position: 2, name: category.name, item: `${BASE}/directory/category/${category.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <section className="bg-navy py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          <Link href="/directory" className="text-white hover:underline text-sm mb-6 inline-block">
            &larr; Back to Directory
          </Link>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4">
            {category.name} in Middle Tennessee
          </h1>
          <p className="text-white text-lg">
            {listings.length === 0 ? (
              <>
                No {category.name.toLowerCase()} listings yet.{" "}
                <Link href="/join" className="text-gold font-bold hover:underline">
                  Be the first.
                </Link>
              </>
            ) : (
              <>
                {listings.length} {listings.length === 1 ? "business" : "businesses"}
                {cities.length > 0 && <> in {cities.join(", ")}</>}
              </>
            )}
          </p>
        </div>
      </section>

      <section className="bg-white py-10 md:py-16 px-4">
        <div className="w-[90%] max-w-[1000px] mx-auto">
          {/* Answer the obvious question in prose, in the first paragraph, since
              that is what both a reader and an answer engine look for. */}
          <p className="text-navy leading-relaxed mb-10 max-w-[70ch]">
            Looking for {category.name.toLowerCase()} near you? Every business below belongs
            to a member of Networking For Awesome People, a free weekly networking community
            that meets in Manchester, Murfreesboro, Nolensville and Smyrna. There are no fees
            to attend and no contracts, so the people listed here are the ones who show up.
          </p>

          {listings.length > 0 && (
            <div className="divide-y divide-gray-100">
              {listings.map((listing) => {
                const tier = tierOf(listing);
                const isLeader = isLeadershipListing(listing);
                const isPaid = tier === "amplified" || tier === "connected";
                const blurb = listing.description
                  ? tier === "linked"
                    ? clampLinkedDescription(listing.description)
                    : listing.description
                  : isPaid
                    ? listing.tagline || ""
                    : "";
                const catName = Array.isArray(listing.categories)
                  ? listing.categories[0]?.name
                  : (listing.categories as { name?: string } | null)?.name;

                return (
                  <div key={listing.id} className="py-6 first:pt-0 flex gap-4 md:gap-6">
                    <div className="flex-shrink-0">
                      {isPaid && listing.logo_url ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={listing.logo_url} alt={`${listing.business_name} logo`} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-navy/10 flex items-center justify-center">
                          <span className="text-navy/30 font-heading font-bold text-xl">
                            {(listing.business_name || "?").charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link href={listingPath(listing)} className="group">
                          <h2 className="font-heading font-bold text-lg text-navy group-hover:text-gold transition-colors">
                            {listing.business_name}
                          </h2>
                        </Link>
                        {isLeader && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FBC761] text-[#1F3149]">
                            NAP Leader
                          </span>
                        )}
                        {!isLeader && tier === "amplified" && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FE6651", color: "#ffffff" }}>
                            Amplified
                          </span>
                        )}
                        {!isLeader && tier === "connected" && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F5BE61", color: "#1F3149" }}>
                            Connected
                          </span>
                        )}
                      </div>

                      <p className="text-navy/60 text-sm mb-1">
                        {[catName, CITY_LABELS[listing.city || ""] || listing.city].filter(Boolean).join(" · ")}
                      </p>

                      {blurb && <p className="text-navy text-sm leading-relaxed max-w-[70ch]">{blurb}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Crawlable paths between categories. */}
          {siblings && siblings.length > 0 && (
            <nav className="mt-14 pt-10 border-t border-gray-200" aria-label="Other categories">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Other categories</h2>
              <div className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/directory/category/${s.slug}`}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-navy text-sm hover:bg-gold/20 transition-colors"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          <div className="mt-12 rounded-xl bg-gray-50 p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold text-navy mb-2">
              Run {category.name.toLowerCase().startsWith("a") ? "an" : "a"} {category.name.toLowerCase()} business?
            </h2>
            <p className="text-navy mb-4 max-w-[70ch]">
              A basic listing in this directory is free. Come to a meeting, add your business,
              and people searching this page can find you.
            </p>
            <Link
              href="/join"
              className="inline-block bg-gold text-navy font-bold px-6 py-3 rounded-full hover:bg-gold/90 transition-colors"
            >
              Join free
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
