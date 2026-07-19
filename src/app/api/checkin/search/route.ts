import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidToken, unauthorized } from "@/lib/checkin-auth";

// The four chapter slugs. These must stay in sync with the CHECK constraint on
// checkins.chapter_slug and the keys in src/lib/cityData.ts. Chapter is stored on
// members.city as the lowercase slug (e.g. "murfreesboro"), which is what we scope on.
const CHAPTER_SLUGS = ["manchester", "murfreesboro", "nolensville", "smyrna"] as const;

export async function GET(request: Request) {
  // Gate before parsing or validating anything, so unauthenticated callers cannot
  // probe the query schema through validation error messages. The token travels in
  // a header rather than the query string: this route returns member PII, and query
  // params land in server/proxy access logs and leak via the Referer header.
  if (!isValidToken(request.headers.get("x-checkin-token"))) return unauthorized();

  const { searchParams } = new URL(request.url);
  const chapterSlug = searchParams.get("chapter_slug");
  const q = searchParams.get("q");

  if (!chapterSlug || !CHAPTER_SLUGS.includes(chapterSlug as (typeof CHAPTER_SLUGS)[number])) {
    return NextResponse.json(
      { error: `chapter_slug is required and must be one of: ${CHAPTER_SLUGS.join(", ")}` },
      { status: 400 }
    );
  }
  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: "q is required and must be at least 2 characters" },
      { status: 400 }
    );
  }

  // Sanitize q before embedding it in a PostgREST or() filter: strip the delimiter
  // characters ( , ( ) \ ) and the ILIKE wildcards ( % _ ) so user input cannot
  // alter the query structure.
  const safeQ = q.replace(/[,()\\%_]/g, " ").trim();
  if (safeQ.length < 2) {
    return NextResponse.json(
      { error: "q must contain at least 2 searchable characters" },
      { status: 400 }
    );
  }

  // Service-role client is created server-side only; the key never reaches the client.
  const supabase = getSupabaseAdmin();

  // Scope to the chapter via members.city (holds the chapter slug), match the name
  // against full_name or business_name, and embed each member's listings via the
  // members -> directory_listings foreign key.
  const { data, error } = await supabase
    .from("members")
    .select("id, full_name, business_name, directory_listings(id, business_name)")
    .eq("city", chapterSlug)
    .or(`full_name.ilike.%${safeQ}%,business_name.ilike.%${safeQ}%`);

  if (error) {
    console.error("checkin search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  const results = (data ?? []).map((m: {
    id: string;
    full_name: string | null;
    business_name: string | null;
    directory_listings: { id: string; business_name: string | null }[] | null;
  }) => ({
    member_id: m.id,
    name: m.full_name,
    business_name: m.business_name,
    // Always an array, even when a member has exactly one listing, so the frontend
    // never needs a special single-listing case.
    listings: (m.directory_listings ?? []).map((l) => ({
      id: l.id,
      business_name: l.business_name,
    })),
  }));

  // Zero matches is an expected state (it triggers the frontend "unmatched" flow),
  // not a failure — return an empty array with a 200.
  return NextResponse.json(results);
}
