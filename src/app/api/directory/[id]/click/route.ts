import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("directory_listings")
    .select("website_clicks_this_month, website_clicks_all_time")
    .eq("id", params.id)
    .single();

  if (data) {
    await supabase
      .from("directory_listings")
      .update({
        website_clicks_this_month: (data.website_clicks_this_month || 0) + 1,
        website_clicks_all_time: (data.website_clicks_all_time || 0) + 1,
      })
      .eq("id", params.id);
  }

  return NextResponse.json({ ok: true });
}
