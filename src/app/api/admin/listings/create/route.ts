import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId, businessName, city, primaryCategoryId, tagline } = await request.json();

  if (!memberId || !businessName) {
    return NextResponse.json({ error: "Member ID and business name are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Check member exists
  const { data: member } = await supabase
    .from("members")
    .select("id, full_name, email")
    .eq("id", memberId)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Check no listing already exists
  const { data: existing } = await supabase
    .from("directory_listings")
    .select("id")
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "This member already has a listing" }, { status: 409 });
  }

  // Generate slug
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const { data: listing, error } = await supabase
    .from("directory_listings")
    .insert({
      member_id: memberId,
      business_name: businessName,
      contact_name: member.full_name,
      contact_email: member.email,
      city: city || null,
      primary_category_id: primaryCategoryId || null,
      tagline: tagline || null,
      slug,
      listing_state: "TN",
      is_approved: true,
      approval_status: "approved",
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Admin listing create error:", error);
    return NextResponse.json({ error: "Failed to create listing: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, listingId: listing.id });
}
