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
