import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("directory_listings")
    .select("views_this_month, views_all_time")
    .eq("id", params.id)
    .single();

  if (data) {
    await supabase
      .from("directory_listings")
      .update({
        views_this_month: (data.views_this_month || 0) + 1,
        views_all_time: (data.views_all_time || 0) + 1,
      })
      .eq("id", params.id);
  }

  return NextResponse.json({ ok: true });
}
