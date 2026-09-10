import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    query = query.eq("members.tier", tier);
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

  // Amplified and Connected are network-wide: they appear under every city
  // filter, not just their own chapter. Linked stays chapter-scoped.
  const NETWORK_WIDE_TIERS = ["amplified", "connected"];
  const visible = (listings || []).filter((l: any) => {
    if (!city) return true;
    if (NETWORK_WIDE_TIERS.includes(l.members?.tier)) return true;
    return l.city === city;
  });

  // Enforce tier priority: leadership/amplified (0) > connected (1) > linked (2)
  // Alphabetical by business_name within each group.
  const sorted = visible.sort((a: any, b: any) => {
    const aPriority = a.members?.is_leadership || a.members?.tier === "amplified" ? 0 : (a.members?.tier === "connected" ? 1 : 2);
    const bPriority = b.members?.is_leadership || b.members?.tier === "amplified" ? 0 : (b.members?.tier === "connected" ? 1 : 2);
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (a.business_name || "").localeCompare(b.business_name || "");
  });

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
