import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import ReviewForm from "@/components/ReviewForm";

const cityColors: Record<string, string> = {
  manchester: "#71D4D1",
  murfreesboro: "#1F3149",
  nolensville: "#F5BE61",
  smyrna: "#FE6651",
};

const cityTextColors: Record<string, string> = {
  manchester: "#1F3149",
  murfreesboro: "#ffffff",
  nolensville: "#1F3149",
  smyrna: "#ffffff",
};

const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

async function getListing(id: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("directory_listings")
    .select(`
      *,
      members!inner(id, full_name, email, tier, is_leadership, leadership_city, is_nap_verified),
      categories:primary_category_id(name, slug)
    `)
    .eq("id", id)
    .single();
  return data;
}

async function getReviews(listingId: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: "Listing Not Found | NAP Directory" };

  const description = listing.tagline || (listing.description ? listing.description.slice(0, 160) : `${listing.business_name} in the Networking For Awesome People directory.`);

  return {
    title: `${listing.business_name} | NAP Directory`,
    description,
    openGraph: {
      title: `${listing.business_name} | NAP Directory`,
      description,
      url: `https://networkingforawesomepeople.com/directory/${params.id}`,
    },
    alternates: {
      canonical: `https://networkingforawesomepeople.com/directory/${params.id}`,
    },
  };
}

export default async function DirectoryListingPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);

  if (!listing || !listing.is_approved) {
    notFound();
  }

  // Track view (fire-and-forget on the server)
  try {
    await fetch(`${process.env.NEXTAUTH_URL}/api/directory/${params.id}/view`, { method: "POST" });
  } catch {
    // Non-critical — don't block page render
  }

  const reviews = await getReviews(params.id);
  const member = listing.members;
  const tier = member.tier;
  const isLeadership = member.is_leadership;
  const isAmplified = tier === "amplified" || isLeadership;
  const isConnected = tier === "connected" || isAmplified;

  // Review stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews : 0;

  // Tier badge
  const getTierBadge = () => {
    if (isLeadership) {
      const color = cityColors[member.leadership_city || listing.city] || "#1F3149";
      const textColor = cityTextColors[member.leadership_city || listing.city] || "#1F3149";
      return { label: "Leadership", color, textColor };
    }
    if (tier === "amplified") return { label: "Amplified", color: "#FE6651", textColor: "#ffffff" };
    if (tier === "connected") return { label: "Connected", color: "#F5BE61", textColor: "#1F3149" };
    return { label: "Linked", color: "#1F3149", textColor: "#ffffff" };
  };

  const badge = getTierBadge();

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.business_name,
    description: listing.description || listing.tagline || "",
    ...(listing.address && { address: listing.address }),
    ...(listing.city && {
      areaServed: {
        "@type": "City",
        name: listing.city.charAt(0).toUpperCase() + listing.city.slice(1),
      },
    }),
    ...(listing.website_url && { url: listing.website_url }),
    ...(listing.logo_url && { image: listing.logo_url }),
    ...(listing.contact_phone && { telephone: listing.contact_phone }),
    ...(listing.contact_email && { email: listing.contact_email }),
    ...(totalReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: totalReviews,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <section className="bg-navy py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto">
          <Link href="/directory" className="text-gold hover:underline text-sm mb-6 inline-block">
            &larr; Back to Directory
          </Link>
          <div className="flex items-start gap-6">
            {isConnected && listing.logo_url && (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-white/10">
                <img src={listing.logo_url} alt={listing.business_name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-heading text-3xl md:text-5xl font-bold text-white">
                  {listing.business_name}
                </h1>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: badge.color, color: badge.textColor }}
                >
                  {badge.label}
                </span>
                {member.is_nap_verified && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">
                    NAP Verified
                  </span>
                )}
              </div>
              {listing.tagline && (
                <p className="text-gold text-lg italic mb-2">{listing.tagline}</p>
              )}
              <div className="flex items-center gap-4 text-white/50 text-sm">
                {listing.categories && <span>{listing.categories.name}</span>}
                {listing.city && <span className="capitalize">{listing.city}</span>}
                {totalReviews > 0 && (
                  <span className="text-gold">
                    {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}{" "}
                    ({totalReviews})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-12 md:py-20 px-4">
        <div className="w-[90%] max-w-[900px] mx-auto space-y-10">

          {/* Description */}
          {listing.description && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-3">About</h2>
              <p className="text-navy/70 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>
          )}

          {/* Contact Info — Connected + Amplified */}
          {isConnected && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-navy/70">
                {listing.contact_name && (
                  <div>
                    <span className="font-bold text-navy block mb-0.5">Contact</span>
                    {listing.contact_name}
                  </div>
                )}
                {listing.contact_email && (
                  <div>
                    <span className="font-bold text-navy block mb-0.5">Email</span>
                    <a href={`mailto:${listing.contact_email}`} className="text-gold hover:underline">
                      {listing.contact_email}
                    </a>
                  </div>
                )}
                {listing.contact_phone && (
                  <div>
                    <span className="font-bold text-navy block mb-0.5">Phone</span>
                    <a href={`tel:${listing.contact_phone}`} className="text-gold hover:underline">
                      {listing.contact_phone}
                    </a>
                  </div>
                )}
                {listing.website_url && (
                  <div>
                    <span className="font-bold text-navy block mb-0.5">Website</span>
                    <a
                      href={listing.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                      onClick={undefined}
                      data-listing-id={listing.id}
                      data-track-click="website"
                    >
                      {listing.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </div>
                )}
              </div>
              {listing.referral_form_url && (
                <div className="mt-6">
                  <a
                    href={listing.referral_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gold text-navy font-bold px-6 py-3 rounded-full hover:bg-gold/90 transition-colors text-sm"
                  >
                    Send a Referral
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Photos Gallery — Amplified only */}
          {isAmplified && listing.photos && listing.photos.length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.photos.map((photo: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]">
                    <img src={photo} alt={`${listing.business_name} photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Embed — Amplified only */}
          {isAmplified && listing.video_url && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Video</h2>
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
                <iframe
                  src={listing.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={`${listing.business_name} video`}
                />
              </div>
            </div>
          )}

          {/* Business Hours — Amplified only */}
          {isAmplified && listing.business_hours && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Business Hours</h2>
              <div className="space-y-2 text-sm">
                {dayLabels.map((day) => {
                  const hours = listing.business_hours?.[day.toLowerCase()];
                  return (
                    <div key={day} className="flex justify-between text-navy/70">
                      <span className="font-medium text-navy">{day}</span>
                      <span>{hours || "Closed"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Map Placeholder — Amplified only */}
          {isAmplified && listing.address && (
            <div className="bg-gray-50 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Location</h2>
              <p className="text-navy/70 text-sm mb-4">{listing.address}</p>
              <div className="rounded-xl bg-gray-200 h-64 flex items-center justify-center text-navy/30">
                Map coming soon
              </div>
            </div>
          )}

          {/* Special Offers — Amplified only */}
          {isAmplified && listing.special_offers && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold text-navy mb-3">Special Offers</h2>
              <p className="text-navy/70 whitespace-pre-line">{listing.special_offers}</p>
            </div>
          )}

          {/* Social Links — Amplified only */}
          {isAmplified && listing.social_links && Object.keys(listing.social_links).length > 0 && (
            <div>
              <h2 className="font-heading text-xl font-bold text-navy mb-4">Follow Us</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(listing.social_links).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-navy text-white text-sm font-bold px-4 py-2 rounded-full hover:bg-navy/80 transition-colors capitalize"
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section — All tiers */}
          <div className="border-t border-gray-200 pt-10">
            <h2 className="font-heading text-2xl font-bold text-navy mb-6">Reviews</h2>

            {totalReviews > 0 ? (
              <>
                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8 flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-heading text-4xl font-bold text-navy">{avgRating.toFixed(1)}</p>
                    <p className="text-gold text-lg">
                      {"★".repeat(Math.round(avgRating))}{"☆".repeat(5 - Math.round(avgRating))}
                    </p>
                    <p className="text-navy/40 text-sm">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6 mb-10">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-navy">{review.reviewer_name}</span>
                        <span className="text-navy/30 text-sm">
                          {new Date(review.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-gold text-sm mb-2">
                        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                      </p>
                      {review.review_text && (
                        <p className="text-navy/70 text-sm leading-relaxed">{review.review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-navy/40 mb-8">No reviews yet. Be the first to leave one!</p>
            )}

            {/* Review Form */}
            <ReviewForm listingId={params.id} />
          </div>
        </div>
      </section>
    </>
  );
}
