import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: listing, error } = await supabase
    .from("directory_listings")
    .select("*, members(id, full_name, email, tier, is_leadership)")
    .eq("id", params.id)
    .single();

  if (error || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  return NextResponse.json({ listing, categories: categories || [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const body = await request.json();

  // Remove protected fields
  delete body.id;
  delete body.member_id;
  delete body.members;
  delete body.created_at;

  // Normalize URLs
  const normalizeUrl = (url: string | undefined | null): string => {
    if (!url || !url.trim()) return "";
    const u = url.trim();
    if (u.startsWith("https://")) return u;
    if (u.startsWith("http://")) return "https://" + u.slice(7);
    if (u.startsWith("www.")) return "https://" + u;
    if (u.includes(".") && !u.startsWith("/")) return "https://" + u;
    return u;
  };

  if (body.website_url) body.website_url = normalizeUrl(body.website_url);
  if (body.logo_url) body.logo_url = normalizeUrl(body.logo_url);

  // Auto-generate slug if business_name changed
  if (body.business_name && !body.slug) {
    const baseSlug = body.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    const state = body.listing_state || "TN";
    const { data: existing } = await supabase
      .from("directory_listings")
      .select("slug, id")
      .eq("listing_state", state)
      .eq("slug", baseSlug)
      .maybeSingle();
    // Only change slug if it would conflict with a different listing
    if (!existing || existing.id === params.id) {
      body.slug = baseSlug;
    } else {
      body.slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
    }
  }

  const { error } = await supabase
    .from("directory_listings")
    .update(body)
    .eq("id", params.id);

  if (error) {
    console.error("Admin listing update error:", error);
    return NextResponse.json({ error: "Failed to update listing: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
