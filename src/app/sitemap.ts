import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { getSupabaseAdmin } from "@/lib/supabase";

// Directory listings are fetched at request time, so a newly approved listing
// appears without a redeploy.
export const revalidate = 3600;

async function listingEntries(baseUrl: string): Promise<MetadataRoute.Sitemap> {
  // Every live listing page was missing from the sitemap. The pages are server
  // rendered and carry their own canonical and schema, but nothing crawlable
  // linked to them: the directory browse is a client component, so the only
  // other inbound links are behind a login. They were effectively orphaned.
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("directory_listings")
      .select("slug, listing_state, updated_at, created_at, tier")
      .eq("is_approved", true)
      .eq("is_active", true)
      .not("slug", "is", null);

    if (error) {
      console.error("sitemap: listing fetch failed:", error.message);
      return [];
    }

    return (data ?? [])
      .filter((l) => l.slug)
      .map((l) => ({
        url: `${baseUrl}/directory/${(l.listing_state || "TN").toLowerCase()}/${l.slug}`,
        lastModified: new Date(l.updated_at || l.created_at || Date.now()),
        changeFrequency: "monthly" as const,
        // Paid listings carry more content, so they are the stronger pages.
        priority: l.tier === "amplified" ? 0.7 : l.tier === "connected" ? 0.65 : 0.6,
      }));
  } catch (err) {
    // A sitemap that loses its listings is bad. A sitemap that 500s is worse,
    // because then the whole file is unavailable to a crawler.
    console.error("sitemap: listing fetch threw:", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://networkingforawesomepeople.com";

  const blogPosts = getAllPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const listings = await listingEntries(baseUrl);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/tn/manchester`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tn/murfreesboro`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tn/nolensville`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/tn/smyrna`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...blogPosts,
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...listings,
    { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/expand`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
