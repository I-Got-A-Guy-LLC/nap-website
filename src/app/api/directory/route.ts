import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";
  const tier = searchParams.get("tier") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = (page - 1) * limit;

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("directory_listings")
    .select(`
      *,
      members!inner(tier, is_leadership, leadership_city, is_nap_verified),
      categories:primary_category_id(name, slug)
    `, { count: "exact" })
    .eq("is_approved", true)
    .eq("is_active", true);

  if (search) {
    query = query.or(`business_name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
  }

  if (city) {
    query = query.eq("city", city);
  }

  if (category) {
    query = query.eq("primary_category_id", category);
  }

  if (tier) {
    query = query.eq("members.tier", tier);
  }

  // Sort: Amplified/Leadership first, then Connected, then Linked
  // Within each tier, sort by category name A-Z
  query = query
    .order("members(is_leadership)", { ascending: false })
    .order("members(tier)", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: listings, count, error } = await query;

  if (error) {
    console.error("Directory query error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }

  // Manual sort for tier priority: amplified/leadership > connected > linked
  // tierOrder handled inline below
  const sorted = (listings || []).sort((a: any, b: any) => {
    const aIsTop = a.members?.is_leadership || a.members?.tier === "amplified" ? 0 : (a.members?.tier === "connected" ? 1 : 2);
    const bIsTop = b.members?.is_leadership || b.members?.tier === "amplified" ? 0 : (b.members?.tier === "connected" ? 1 : 2);
    if (aIsTop !== bIsTop) return aIsTop - bIsTop;
    const aCat = a.categories?.name || "zzz";
    const bCat = b.categories?.name || "zzz";
    return aCat.localeCompare(bCat);
  });

  return NextResponse.json({
    listings: sorted,
    total: count || 0,
    page,
    limit,
  });
}
