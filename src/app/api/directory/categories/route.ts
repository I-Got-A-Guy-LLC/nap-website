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

  return NextResponse.json({ categories: categories || [] });
}
