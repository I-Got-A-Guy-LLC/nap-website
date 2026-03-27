"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

interface MemberInfo {
  tier: string;
  is_leadership: boolean;
  leadership_city?: string;
  is_nap_verified: boolean;
}

interface Listing {
  id: string;
  business_name: string;
  slug?: string;
  listing_state?: string;
  tagline?: string;
  description?: string;
  contact_name: string;
  city: string;
  website_url?: string;
  logo_url?: string;
  photos?: string[];
  members: MemberInfo | MemberInfo[];
  categories?: {
    name: string;
    slug: string;
  } | null;
}

const cityOptions = [
  { value: "", label: "All Cities" },
  { value: "manchester", label: "Manchester" },
  { value: "murfreesboro", label: "Murfreesboro" },
  { value: "nolensville", label: "Nolensville" },
  { value: "smyrna", label: "Smyrna" },
];

function getMemberInfo(listing: Listing): MemberInfo {
  // Supabase may return members as object or array — handle both
  try {
    if (!listing.members) return { tier: "linked", is_leadership: false, is_nap_verified: false };
    if (Array.isArray(listing.members)) return listing.members[0] || { tier: "linked", is_leadership: false, is_nap_verified: false };
    return listing.members;
  } catch {
    return { tier: "linked", is_leadership: false, is_nap_verified: false };
  }
}

function getCategoryName(listing: Listing): string {
  try {
    if (!listing.categories) return "";
    if (Array.isArray(listing.categories)) return (listing.categories as any)[0]?.name || "";
    return listing.categories.name || "";
  } catch {
    return "";
  }
}

export default function DirectoryBrowser() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/directory/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchListings();
  }, [city, category]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      const res = await fetch(`/api/directory?${params}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch {
      setListings([]);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const getTierDisplay = (member: MemberInfo) => {
    if (member.is_leadership) {
      return { label: "Leadership", color: "#FE6651", textColor: "white" };
    }
    if (member.tier === "amplified") return { label: "Amplified", color: "#FE6651", textColor: "white" };
    if (member.tier === "connected") return { label: "Connected", color: "#F5BE61", textColor: "#1F3149" };
    return { label: "Linked", color: "#1F3149", textColor: "white" };
  };

  return (
    <div>
      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-10">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses, categories, or services..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-3 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {cityOptions.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All Categories</option>
          {categories.filter((c) => !c.parent_id).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-gold text-navy font-bold px-8 py-3 rounded-full hover:bg-gold/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-navy/40">Loading directory...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-navy/50 text-lg mb-4">No listings found.</p>
          <p className="text-navy/40">The directory is just getting started. <Link href="/join" className="text-gold hover:underline">Be one of the first to join.</Link></p>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const member = getMemberInfo(listing);
            const tierInfo = getTierDisplay(member);
            const isTop = member.is_leadership || member.tier === "amplified";
            const isConnected = member.tier === "connected";
            const catName = getCategoryName(listing);

            return (
              <Link
                key={listing.id}
                href={listing.slug ? `/directory/${(listing.listing_state || "tn").toLowerCase()}/${listing.slug}` : `/directory/${listing.id}`}
                className={`block bg-white rounded-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                  isTop
                    ? "border-l-[3px] border-l-[#FE6651]"
                    : isConnected
                    ? "border-l-[3px] border-l-[#F5BE61]"
                    : "border-l-[3px] border-l-[#1F3149]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  {listing.logo_url && (isTop || isConnected) && (
                    <div className={`${isTop ? "w-16 h-16" : "w-11 h-11"} rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-100`}>
                      <img src={listing.logo_url} alt={listing.business_name} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className={`font-heading font-bold text-navy ${isTop ? "text-xl" : "text-lg"}`}>
                        {listing.business_name}
                      </h2>
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ backgroundColor: tierInfo.color, color: tierInfo.textColor }}
                      >
                        {tierInfo.label}
                      </span>
                      {member.is_nap_verified && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          NAP Verified
                        </span>
                      )}
                    </div>

                    {isTop && listing.tagline && (
                      <p className="text-navy/60 text-sm mb-2">{listing.tagline}</p>
                    )}

                    {(isTop || isConnected) && listing.description && (
                      <p className="text-navy/50 text-sm line-clamp-2 mb-2">{listing.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-navy/40">
                      {catName && <span>{catName}</span>}
                      {listing.city && <span className="capitalize">{listing.city}</span>}
                      {listing.website_url && (isTop || isConnected) && (
                        <span className="text-gold">Website</span>
                      )}
                    </div>
                  </div>

                  {/* Photo thumbnails for Amplified */}
                  {isTop && listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 && (
                    <div className="hidden md:flex gap-1 flex-shrink-0">
                      {listing.photos.slice(0, 3).map((photo, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
