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
  contact_phone?: string;
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
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());

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

  const togglePhone = (id: string) => {
    setRevealedPhones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-[280px] flex-shrink-0">
        <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
          <h2 className="font-heading text-lg font-bold text-navy mb-1">Find</h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-navy text-xs font-bold mb-1">What do you need:</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or Keyword"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-navy text-xs font-bold mb-1">Search by city:</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {cityOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-navy text-xs font-bold mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">All Categories</option>
                {categories.filter((c) => !c.parent_id).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-gold text-navy font-bold py-2.5 rounded-full hover:bg-gold/90 transition-colors text-sm"
            >
              Search Now
            </button>
          </form>

          {/* Join CTA */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-heading text-base font-bold text-navy mb-2">Join Our Community</h3>
            <ol className="text-sm text-navy/70 space-y-1 mb-4 list-decimal list-inside">
              <li>Register a member account</li>
              <li>Create a searchable listing</li>
              <li>Connect with more clients</li>
            </ol>
            <Link
              href="/join"
              className="block w-full text-center bg-navy text-white font-bold py-2.5 rounded-full hover:bg-navy/90 transition-colors text-sm"
            >
              Get Listed Today
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Results count */}
        {!loading && (
          <p className="text-sm text-navy/50 mb-2">
            {listings.length} Result{listings.length !== 1 ? "s" : ""}
          </p>
        )}
        <h2 className="font-heading text-2xl font-bold text-navy mb-6">Results</h2>

        {loading ? (
          <div className="text-center py-12 text-navy/50">Loading directory...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-navy text-lg mb-4">No listings found.</p>
            <p className="text-navy/60">The directory is just getting started. <Link href="/join" className="text-gold hover:underline">Be one of the first to join.</Link></p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listings.map((listing) => {
              const member = getMemberInfo(listing);
              const isTop = member.is_leadership || member.tier === "amplified";
              const isConnected = member.tier === "connected";
              const catName = getCategoryName(listing);
              const listingUrl = listing.slug
                ? `/directory/${(listing.listing_state || "tn").toLowerCase()}/${listing.slug}`
                : `/directory/${listing.id}`;
              const phoneRevealed = revealedPhones.has(listing.id);

              return (
                <div
                  key={listing.id}
                  className="py-6 first:pt-0 flex gap-4 md:gap-6"
                >
                  {/* Logo / Avatar */}
                  <div className="flex-shrink-0">
                    {listing.logo_url ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                        <img src={listing.logo_url} alt={`${listing.business_name} logo`} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-navy/10 flex items-center justify-center">
                        <span className="text-navy/30 font-heading font-bold text-xl">
                          {listing.business_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={listingUrl} className="group">
                      <h3 className="font-heading font-bold text-lg text-navy group-hover:text-gold transition-colors">
                        {listing.business_name}
                      </h3>
                    </Link>

                    {listing.tagline && (
                      <p className="text-gold text-sm mt-0.5">{listing.tagline}</p>
                    )}

                    {catName && (
                      <p className="text-navy/40 text-xs mt-0.5">{catName}</p>
                    )}

                    {listing.description && (isTop || isConnected) && (
                      <p className="text-navy/70 text-sm mt-2 line-clamp-2">{listing.description}</p>
                    )}

                    {listing.city && (
                      <p className="text-navy/50 text-xs mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        <span className="capitalize">{listing.city}</span>
                      </p>
                    )}

                    {/* Phone revealed inline on mobile */}
                    {phoneRevealed && listing.contact_phone && (
                      <p className="text-navy text-sm font-medium mt-2 md:hidden">
                        {listing.contact_phone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                    <Link
                      href={listingUrl}
                      className="bg-navy text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-navy/90 transition-colors whitespace-nowrap"
                    >
                      View Listing
                    </Link>
                    {listing.contact_phone && (
                      <button
                        onClick={() => togglePhone(listing.id)}
                        className="border border-gray-200 text-navy text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap flex items-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {phoneRevealed ? listing.contact_phone : "Show Phone Number"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
