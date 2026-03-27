import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import ListingReferralButton from "@/components/ListingReferralButton";

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function safeMember(listing: any) {
  if (!listing?.members) return { tier: "linked", is_leadership: false, is_nap_verified: false, leadership_city: null };
  const m = Array.isArray(listing.members) ? listing.members[0] : listing.members;
  return m || { tier: "linked", is_leadership: false, is_nap_verified: false, leadership_city: null };
}

function safeCategoryName(listing: any): string {
  try {
    if (!listing?.categories) return "";
    const c = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
    return c?.name || "";
  } catch { return ""; }
}

function parseHours(raw: any): Record<string, any> {
  if (!raw) return {};
  let data = raw;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { return {}; } }
  if (typeof data !== "object") return {};
  return data;
}

async function getListing(state: string, slug: string) {
  const supabase = getSupabaseAdmin();

  // UUID pattern check — if state looks like a UUID, it's an old /directory/[id] link
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(state)) {
    const { data } = await supabase
      .from("directory_listings")
      .select(`*, members(id, full_name, email, tier, is_leadership, leadership_city, is_nap_verified), categories:primary_category_id(name, slug)`)
      .eq("id", state)
      .maybeSingle();
    return data;
  }

  // Try by state + slug
  const { data } = await supabase
    .from("directory_listings")
    .select(`*, members(id, full_name, email, tier, is_leadership, leadership_city, is_nap_verified), categories:primary_category_id(name, slug)`)
    .eq("listing_state", state.toUpperCase())
    .eq("slug", slug)
    .maybeSingle();
  if (data) return data;

  // Fallback: try slug alone (in case state is wrong)
  const { data: bySlug } = await supabase
    .from("directory_listings")
    .select(`*, members(id, full_name, email, tier, is_leadership, leadership_city, is_nap_verified), categories:primary_category_id(name, slug)`)
    .eq("slug", slug)
    .maybeSingle();
  return bySlug;
}

async function getReviews(listingId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("reviews").select("*").eq("listing_id", listingId).order("created_at", { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }: { params: { state: string; slug: string } }): Promise<Metadata> {
  const listing = await getListing(params.state, params.slug);
  if (!listing) return { title: "Listing Not Found | NAP Directory" };
  const description = listing.tagline || (listing.description ? listing.description.slice(0, 160) : `${listing.business_name} in the Networking For Awesome People directory.`);
  return {
    title: `${listing.business_name} | NAP Directory`,
    description,
    openGraph: { title: `${listing.business_name} | NAP Directory`, description, url: `https://networkingforawesomepeople.com/directory/${params.state}/${params.slug}` },
    alternates: { canonical: `https://networkingforawesomepeople.com/directory/${params.state}/${params.slug}` },
  };
}

export default async function DirectoryListingPage({ params }: { params: { state: string; slug: string } }) {
  const listing = await getListing(params.state, params.slug);
  if (!listing || !listing.is_approved) notFound();

  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://networkingforawesomepeople.com";
    await fetch(`${baseUrl}/api/directory/${listing.id}/view`, { method: "POST" });
  } catch { /* non-critical */ }

  const reviews = await getReviews(listing.id);
  const member = safeMember(listing);
  const tier = member.tier || "linked";
  const isLeadership = member.is_leadership || false;
  const isAmplified = tier === "amplified" || isLeadership;
  const isConnected = tier === "connected" || isAmplified;
  const catName = safeCategoryName(listing);
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews : 0;

  const badge = (() => {
    if (isLeadership) return { label: "Leadership", color: "#FE6651", textColor: "#ffffff" };
    if (tier === "amplified") return { label: "Amplified", color: "#FE6651", textColor: "#ffffff" };
    if (tier === "connected") return { label: "Connected", color: "#F5BE61", textColor: "#1F3149" };
    return { label: "Linked", color: "#1F3149", textColor: "#ffffff" };
  })();

  const hours = parseHours(listing.business_hours);
  const hasHours = Object.values(hours).some((h: any) => h?.open);
  const socialLinks: { platform: string; url: string }[] = [];
  if (listing.social_facebook) socialLinks.push({ platform: "Facebook", url: listing.social_facebook });
  if (listing.social_instagram) socialLinks.push({ platform: "Instagram", url: listing.social_instagram });
  if (listing.social_linkedin) socialLinks.push({ platform: "LinkedIn", url: listing.social_linkedin });
  if (listing.social_twitter) socialLinks.push({ platform: "Twitter", url: listing.social_twitter });
  const addressParts = [listing.street_address, listing.suite, listing.listing_city, listing.listing_state, listing.zip_code].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : listing.address;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "LocalBusiness",
    name: listing.business_name, description: listing.description || listing.tagline || "",
  };
  if (fullAddress) jsonLd.address = fullAddress;
  if (listing.website_url) jsonLd.url = listing.website_url;
  if (listing.logo_url) jsonLd.image = listing.logo_url;
  if (totalReviews > 0) jsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: totalReviews };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-navy py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto">
          <Link href="/directory" className="text-gold hover:underline text-sm mb-6 inline-block">&larr; Back to Directory</Link>
          <div className="flex items-start gap-6">
            {isConnected && listing.logo_url && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-white/10">
                <img src={listing.logo_url} alt={listing.business_name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-heading text-3xl md:text-5xl font-bold text-white">{listing.business_name}</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: badge.color, color: badge.textColor }}>{badge.label}</span>
                {member.is_nap_verified && <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">NAP Verified</span>}
              </div>
              {listing.tagline && <p className="text-gold text-lg italic mb-2">{listing.tagline}</p>}
              <div className="flex items-center gap-4 text-white/50 text-sm">
                {catName && <span>{catName}</span>}
                {listing.city && <span className="capitalize">{listing.city}</span>}
                {totalReviews > 0 && <span className="text-gold">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))} ({totalReviews})</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto space-y-10">
          {listing.description && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-3">About</h2>
              <p className="text-navy/70 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Referral button — Connected + Amplified */}
          {isConnected && (
            <ListingReferralButton listingId={listing.id} businessName={listing.business_name} />
          )}

          {isConnected && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-navy/70">
                {listing.contact_name && <div><span className="font-bold text-navy block mb-0.5">Contact</span>{listing.contact_name}</div>}
                {listing.contact_email && <div><span className="font-bold text-navy block mb-0.5">Email</span><a href={`mailto:${listing.contact_email}`} className="text-gold hover:underline">{listing.contact_email}</a></div>}
                {listing.contact_phone && <div><span className="font-bold text-navy block mb-0.5">Phone</span><a href={`tel:${listing.contact_phone}`} className="text-gold hover:underline">{listing.contact_phone}</a></div>}
                {listing.website_url && <div><span className="font-bold text-navy block mb-0.5">Website</span><a href={listing.website_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{listing.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a></div>}
              </div>
            </div>
          )}

          {!isConnected && listing.contact_name && (
            <div className="bg-gray-50 rounded-xl p-6"><h2 className="font-heading text-xl font-bold text-navy mb-3">Contact</h2><p className="text-navy/70">{listing.contact_name}</p></div>
          )}

          {isAmplified && listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.photos.map((photo: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]"><img src={photo} alt={`${listing.business_name} photo ${i + 1}`} className="w-full h-full object-cover" /></div>
                ))}
              </div>
            </div>
          )}

          {isAmplified && listing.video_url && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Video</h2>
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-100"><iframe src={listing.video_url} className="w-full h-full" allowFullScreen title={`${listing.business_name} video`} /></div>
            </div>
          )}

          {isAmplified && hasHours && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Business Hours</h2>
              <div className="space-y-2 text-sm">
                {dayLabels.map((day) => {
                  const h = hours[day.toLowerCase()];
                  const isOpen = h && typeof h === "object" && h.open;
                  return <div key={day} className="flex justify-between text-navy/70"><span className="font-medium text-navy">{day}</span><span>{isOpen ? `${h.openTime || "9:00"} – ${h.closeTime || "17:00"}` : "Closed"}</span></div>;
                })}
              </div>
            </div>
          )}

          {isAmplified && fullAddress && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Location</h2>
              <p className="text-navy/70 text-sm mb-4">{fullAddress}</p>
              <div className="rounded-xl overflow-hidden"><iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`} width="100%" height="300" style={{ border: 0 }} loading="lazy" title="Location" /></div>
            </div>
          )}

          {isAmplified && listing.special_offers && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-3">Special Offers</h2>
              <p className="text-navy/70 whitespace-pre-line">{listing.special_offers}</p>
            </div>
          )}

          {isConnected && socialLinks.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Follow Us</h2>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ platform, url }) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="bg-navy text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-navy/80 transition-colors">{platform}</a>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-10">
            <h2 className="font-heading text-2xl font-bold text-navy mb-6">Reviews</h2>
            {totalReviews > 0 ? (
              <>
                <div className="bg-gray-50 rounded-xl p-6 mb-8 flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-heading text-4xl font-bold text-navy">{avgRating.toFixed(1)}</p>
                    <p className="text-gold text-lg">{"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}</p>
                    <p className="text-navy/40 text-sm">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <ReviewList reviews={reviews} />
              </>
            ) : (
              <p className="text-navy/40 mb-8">No reviews yet. Be the first to leave one!</p>
            )}
            <ReviewForm listingId={listing.id} />
          </div>
        </div>
      </section>
    </>
  );
}
