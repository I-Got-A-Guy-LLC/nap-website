// Shared directory rules. The browse API and the category landing pages must
// agree on tier, ranking and URLs, or the same business appears at a different
// position depending on how you arrived.

type AnyListing = {
  tier?: string | null;
  slug?: string | null;
  id?: string;
  listing_state?: string | null;
  business_name?: string | null;
  city?: string | null;
  members?: { tier?: string | null; is_leadership?: boolean | null } | { tier?: string | null; is_leadership?: boolean | null }[] | null;
};

/** The member row, whether PostgREST returned it as an object or a single-element array. */
export function memberOf(listing: AnyListing) {
  const m = Array.isArray(listing?.members) ? listing.members[0] : listing?.members;
  return m ?? null;
}

/**
 * Tier belongs to the LISTING, not the person, because pricing is per business.
 * Someone with two businesses can hold Amplified on one and Linked on the other.
 * The member tier is a fallback for rows created before the column existed.
 */
export function tierOf(listing: AnyListing): string {
  return listing?.tier ?? memberOf(listing)?.tier ?? "linked";
}

/** Leadership carries Amplified privileges, but only where the listing itself is Amplified. */
export function isLeadershipListing(listing: AnyListing): boolean {
  return Boolean(memberOf(listing)?.is_leadership) && tierOf(listing) === "amplified";
}

/** Amplified and Connected are network-wide and survive a city filter. Linked is chapter-scoped. */
export const NETWORK_WIDE_TIERS = ["amplified", "connected"];

export function visibleInCity<T extends AnyListing>(listings: T[], city: string): T[] {
  if (!city) return listings;
  return listings.filter((l) => NETWORK_WIDE_TIERS.includes(tierOf(l)) || l.city === city);
}

/** amplified (0) > connected (1) > linked (2). */
export function tierPriority(listing: AnyListing): number {
  const t = tierOf(listing);
  if (t === "amplified") return 0;
  if (t === "connected") return 1;
  return 2;
}

/** Tier first, then alphabetical inside each tier. Returns a new array. */
export function rankListings<T extends AnyListing>(listings: T[]): T[] {
  return [...listings].sort((a, b) => {
    const diff = tierPriority(a) - tierPriority(b);
    if (diff !== 0) return diff;
    return (a.business_name || "").localeCompare(b.business_name || "");
  });
}

export function listingPath(listing: AnyListing): string {
  if (!listing.slug) return `/directory/${listing.id}`;
  return `/directory/${(listing.listing_state || "tn").toLowerCase()}/${listing.slug}`;
}
