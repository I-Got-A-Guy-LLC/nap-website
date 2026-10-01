// Slug generation for directory listings.
//
// This exists as one shared function because there used to be two near-identical
// copies, in the portal save route and the admin create route, and they had
// already drifted: one called .trim() in the wrong place and the other did not
// trim at all.
//
// The original bug was ordering. The old code ran:
//
//   .replace(/\s+/g, "-")   <- a trailing space becomes a hyphen here
//   .replace(/-+/g, "-")
//   .trim()                 <- too late; there is no whitespace left to trim
//
// so "Shady Tree Bookkeeping " produced "shady-tree-bookkeeping-". That trailing
// hyphen then collided on the uniqueness check, a random suffix was appended,
// and the result was "people-helping-people--3k2x".
//
// Trimming happens FIRST here, and leading/trailing hyphens are stripped at the
// end as a second guard for names that start or end with punctuation.

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Business names arrive with stray whitespace often enough that it has caused
// two separate cleanups. Normalise on the way in rather than repairing later:
// trim the ends and collapse any internal runs of whitespace to a single space.
export function cleanBusinessName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
