import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("directory_listings")
    .select("business_name, logo_url, contact_name")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
