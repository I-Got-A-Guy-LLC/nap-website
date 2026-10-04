import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rankListings, visibleInCity } from "@/lib/directoryRanking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const tier = searchParams.get("tier") || "";
  const page = parseInt(searchParams.get("page") || "1");
  // DirectoryBrowser renders every listing it receives and has no next-page
  // control, so any default below the directory size silently hides the tail.
  // Keep this above the total listing count until real pagination UI exists.
  const limit = parseInt(searchParams.get("limit") || "200");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("directory_listings")
    .select(`
      *,
      members!inner(tier, is_leadership, leadership_city, is_nap_verified),
      categories:primary_category_id(name, slug)
    `)
    .eq("is_approved", true)
    .eq("is_active", true);

  if (search) {
    query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%,contact_name.ilike.%${search}%,tags.cs.{${search}}`);
  }

  // The city rule is applied after the fetch, not here, because Amplified and
  // Connected listings are network-wide and must survive a city filter. See the
  // filter below.

  if (category) {
    // The browse dropdown only offers main categories, but most listings sit on
    // a subcategory, so an exact match hides them. Roll children up: selecting a
    // main finds everything beneath it. Harmless when the selected category is
    // itself a leaf -- the child lookup simply returns nothing.
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category);
    const categoryIds = [category, ...(children ?? []).map((c) => c.id)];
    query = query.in("primary_category_id", categoryIds);
  }

  if (tier) {
    query = query.eq("tier", tier);
  }

  // Deliberately NOT paginated at the database. Tier ranking and the city rule
  // below both operate on the whole result set, so slicing here would decide
  // which listings survive by alphabetical accident before either rule runs.
  // That is what hid Amplified listings sorting past the default limit.
  // The upper bound is a runaway guard, not a page size.
  query = query.order("business_name", { ascending: true }).range(0, 999);

  const { data: listings, error } = await query;

  if (error) {
    console.error("Directory query error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  // Tier, the city rule and the ranking all live in src/lib/directoryRanking.ts
  // so the category landing pages rank identically. A business must not change
  // position depending on which surface you reached it through.
  const visible = visibleInCity(listings || [], city);
  const sorted = rankListings(visible);

  // Paginate last, so page 1 is the top of the ranking rather than the top of
  // the alphabet.
  const paginated = sorted.slice(offset, offset + limit);

  return NextResponse.json({
    listings: paginated,
    total: sorted.length,
    page,
    limit,
  });
}
