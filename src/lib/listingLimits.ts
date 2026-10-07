// Tier limits that more than one place has to agree about.
//
// The description used to be a Connected feature outright, which left 57 of 71
// live listings carrying nothing but a business name, a city and a phone number.
// Pages that thin are a liability for the whole directory, including the paid
// listings alongside them, so Linked now gets a short plain-text description.
// Long-form stays a Connected feature, as do the tagline, logo, website, socials
// and offers.
export const LINKED_DESCRIPTION_MAX = 300;

// Collapses newlines and runs of whitespace, then trims to the cap. Linked gets
// plain text only: no line breaks, so a free listing cannot be formatted into
// something that reads like a paid one.
export function clampLinkedDescription(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, LINKED_DESCRIPTION_MAX);
}

/**
 * The tier a newly created listing should carry.
 *
 * No creation path used to set this, so new rows arrived NULL and fell back to
 * the owner's member tier when rendered. That is exactly the behaviour the
 * per-listing column exists to replace: a member's second business would inherit
 * the first one's tier for nothing.
 *
 * A member's first listing takes their member tier, so someone who paid for
 * Connected or Amplified sees it on the business they bought it for. Every
 * additional listing starts at linked and has to be paid for on its own, which
 * is the rule Rachel set for leadership and comped members with more than one
 * business.
 */
export function newListingTier(
  memberTier: string | null | undefined,
  existingListingCount: number
): string {
  if (existingListingCount > 0) return "linked";
  const t = (memberTier || "").toLowerCase();
  return t === "amplified" || t === "connected" ? t : "linked";
}
