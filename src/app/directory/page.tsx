import type { Metadata } from "next";
import Link from "next/link";
import DirectoryBrowser from "@/components/DirectoryBrowser";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rankListings } from "@/lib/directoryRanking";

// The browse list itself is a client component, so a crawler sees an empty shell
// here. The server rendered category links below are the only crawlable path
// into the directory, and they give every listing an inbound link by way of its
// category page.
export const revalidate = 3600;

async function getMainCategories() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .is("parent_id", null)
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).filter((c) => c.slug && c.slug !== "other");
}

// The unfiltered, ranked first view, rendered on the server so the HTML contains
// the directory rather than a loading state. The client component takes over as
// soon as someone filters. Same select and same ranking as /api/directory, so
// hydration shows the identical list.
async function getInitialListings() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("directory_listings")
    .select(`
      *,
      members!inner(tier, is_leadership, leadership_city, is_nap_verified),
      categories:primary_category_id(name, slug)
    `)
    .eq("is_approved", true)
    .eq("is_active", true)
    .order("business_name", { ascending: true })
    .range(0, 999);
  return rankListings(data ?? []);
}

export const metadata: Metadata = {
  title: "Business Directory | Networking For Awesome People",
  description:
    "Browse the Networking For Awesome People business directory. Find trusted professionals across Middle Tennessee  -  Manchester, Murfreesboro, Nolensville, and Smyrna.",
  openGraph: {
    title: "Business Directory | Networking For Awesome People",
    description: "Browse the Networking For Awesome People business directory. Find trusted professionals across Middle Tennessee.",
    url: "https://networkingforawesomepeople.com/directory",
    images: ["/images/og-default.jpg"],
  },
  alternates: {
    canonical: "https://networkingforawesomepeople.com/directory",
  },
};

export default async function DirectoryPage() {
  const [categories, initialListings] = await Promise.all([
    getMainCategories(),
    getInitialListings(),
  ]);
  return (
    <>
      <section className="bg-navy py-16 md:py-24 px-4">
        <div className="w-[90%] mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4">
            Business Directory
          </h1>
          <p className="text-white text-lg md:text-xl italic">
            Find trusted professionals across Middle Tennessee
          </p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-white pt-10 md:pt-14 px-4">
          <div className="w-[90%] max-w-[1200px] mx-auto">
            <h2 className="font-heading text-xl font-bold text-navy mb-4">Browse by category</h2>
            <nav className="flex flex-wrap gap-2" aria-label="Directory categories">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/directory/category/${c.slug}`}
                  className="px-3 py-1.5 rounded-full bg-gray-100 text-navy text-sm hover:bg-gold/20 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>
      )}

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[1200px] mx-auto">
          <DirectoryBrowser initialListings={initialListings} />
        </div>
      </section>
    </>
  );
}
