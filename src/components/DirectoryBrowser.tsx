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
  // Supabase may return members as object or array  -  handle both
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
        <div className="text-center py-12 text-navy">Loading directory...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-navy text-lg mb-4">No listings found.</p>
          <p className="text-navy">The directory is just getting started. <Link href="/join" className="text-gold hover:underline">Be one of the first to join.</Link></p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`block bg-white rounded-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg border-t-[3px] ${
                  isTop
                    ? "border-t-[#FE6651]"
                    : isConnected
                    ? "border-t-[#F5BE61]"
                    : "border-t-[#1F3149]"
                }`}
              >
                {/* Logo */}
                {listing.logo_url && (isTop || isConnected) && (
                  <div className={`${isTop ? "w-14 h-14" : "w-10 h-10"} rounded-lg overflow-hidden bg-white border border-gray-100 mb-3`}>
                    <img src={listing.logo_url} alt={`${listing.business_name} logo`} className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="font-heading font-bold text-navy text-base leading-tight">
                    {listing.business_name}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tierInfo.color, color: tierInfo.textColor }}
                  >
                    {tierInfo.label}
                  </span>
                  {member.is_nap_verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      NAP Verified
                    </span>
                  )}
                </div>

                {isTop && listing.tagline && (
                  <p className="text-navy/70 text-sm mb-2 line-clamp-1">{listing.tagline}</p>
                )}

                {(isTop || isConnected) && listing.description && (
                  <p className="text-navy/60 text-xs line-clamp-2 mb-2">{listing.description}</p>
                )}

                {/* Photo thumbnails for Amplified */}
                {isTop && listing.photos && Array.isArray(listing.photos) && listing.photos.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {listing.photos.slice(0, 3).map((photo, i) => (
                      <div key={i} className="w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <img src={photo} alt={`${listing.business_name} photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-navy/50 mt-auto pt-2 border-t border-gray-50">
                  {catName && <span className="truncate">{catName}</span>}
                  {catName && listing.city && <span>&middot;</span>}
                  {listing.city && <span className="capitalize">{listing.city}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
