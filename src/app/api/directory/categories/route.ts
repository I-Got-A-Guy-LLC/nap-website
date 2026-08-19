import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ categories: [] });
  }

  const all = categories || [];

  // Only offer categories that actually return results. A main category counts as
  // populated when it, or any of its subcategories, has a live listing -- the same
  // rollup the directory route applies when filtering. Without this the dropdown
  // offers options that lead to an empty page.
  const { data: live, error: liveError } = await supabase
    .from("directory_listings")
    .select("primary_category_id")
    .eq("is_approved", true)
    .eq("is_active", true)
    .not("primary_category_id", "is", null);

  // Fail open: a counting failure should degrade to the full list, never an
  // empty filter that makes the directory look broken.
  if (liveError) {
    console.error("Categories listing-count error:", liveError);
    return NextResponse.json({ categories: all });
  }

  const used = new Set((live || []).map((l) => l.primary_category_id));
  const populated = all.filter(
    (c) =>
      c.parent_id === null &&
      (used.has(c.id) || all.some((k) => k.parent_id === c.id && used.has(k.id)))
  );

  return NextResponse.json({ categories: populated });
}
