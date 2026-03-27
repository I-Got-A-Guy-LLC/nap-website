import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notifyCategorySuggestion, sendCategorySuggestionReceived } from "@/lib/emails";

// GET — Fetch current member's listing + categories for the edit form
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: member } = await supabase
      .from("members")
      .select("*")
      .eq("email", session.user.email)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { data: listing } = await supabase
      .from("directory_listings")
      .select("*")
      .eq("member_id", member.id)
      .maybeSingle();

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug, parent_id")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    return NextResponse.json({
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        tier: member.tier,
        is_leadership: member.is_leadership,
      },
      listing: listing || null,
      categories: categories || [],
    });
  } catch (error) {
    console.error("GET listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Create or update the member's listing (upsert)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: member } = await supabase
      .from("members")
      .select("id, full_name, email, tier, is_leadership")
      .eq("email", session.user.email)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const body = await request.json();

    // Extract category suggestion
    const categorySuggestion = body.category_suggestion;
    delete body.category_suggestion;

    // Remove fields that shouldn't be set by the user
    delete body.id;
    delete body.member_id;
    delete body.views_this_month;
    delete body.views_all_time;
    delete body.website_clicks_this_month;
    delete body.website_clicks_all_time;

    // Auto-combine address fields into the legacy address column
    if (body.street_address) {
      const parts = [
        body.street_address,
        body.suite,
        body.listing_city,
        `${body.listing_state || "TN"} ${body.zip_code || ""}`.trim(),
      ].filter(Boolean);
      body.address = parts.join(", ");
    }

    // Set approval based on tier
    const isPaid = member.tier === "connected" || member.tier === "amplified" || member.is_leadership;

    // Check if listing exists
    const { data: existingListing, error: findError } = await supabase
      .from("directory_listings")
      .select("id, is_approved")
      .eq("member_id", member.id)
      .maybeSingle();

    console.log("[listing] Member:", member.id, member.email, "Tier:", member.tier);
    console.log("[listing] Existing listing:", existingListing?.id || "NONE");
    if (findError) console.log("[listing] Find error:", findError.message);

    if (existingListing) {
      // UPDATE existing listing
      if (isPaid) {
        body.is_approved = true;
        body.approval_status = "approved";
      }
      // For linked, keep existing approval status

      const { error: updateError } = await supabase
        .from("directory_listings")
        .update(body)
        .eq("id", existingListing.id);

      if (updateError) {
        console.error("[listing] Update error:", updateError.message, updateError.code);
        return NextResponse.json({ error: "Failed to update listing: " + updateError.message }, { status: 500 });
      }
      console.log("[listing] Updated listing:", existingListing.id);
    } else {
      // INSERT new listing
      console.log("[listing] No existing listing — creating new one");
      body.member_id = member.id;
      body.is_approved = isPaid;
      body.approval_status = isPaid ? "approved" : "pending";
      body.is_active = true;

      // Ensure required field
      if (!body.business_name) body.business_name = member.full_name;
      if (!body.contact_name) body.contact_name = member.full_name;

      const { data: newListing, error: insertError } = await supabase
        .from("directory_listings")
        .insert(body)
        .select("id")
        .single();

      if (insertError) {
        console.error("[listing] Insert error:", insertError.message, insertError.code, insertError.details);
        return NextResponse.json({ error: "Failed to create listing: " + insertError.message }, { status: 500 });
      }
      console.log("[listing] Created listing:", newListing?.id);
    }

    // Handle category suggestion
    if (categorySuggestion && categorySuggestion.trim()) {
      await supabase.from("category_suggestions").insert({
        member_id: member.id,
        suggested_name: categorySuggestion.trim(),
      });

      await supabase.from("admin_notifications").insert({
        type: "category_suggestion",
        reference_id: member.id,
        message: `${member.full_name} suggested a new category: "${categorySuggestion.trim()}"`,
      });

      await Promise.allSettled([
        notifyCategorySuggestion(member.full_name, categorySuggestion.trim()),
        sendCategorySuggestionReceived(member.email, member.full_name),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
