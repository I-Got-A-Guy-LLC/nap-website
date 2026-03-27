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
      .single();

    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name");

    return NextResponse.json({
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        tier: member.tier,
        is_leadership: member.is_leadership,
      },
      listing,
      categories: categories || [],
    });
  } catch (error: any) {
    console.error("GET listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Update the member's listing
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

    // Extract category suggestion before stripping it from the listing update
    const categorySuggestion = body.category_suggestion;
    delete body.category_suggestion;

    // Ensure member can only update their own listing
    const { data: existingListing } = await supabase
      .from("directory_listings")
      .select("id, is_approved")
      .eq("member_id", member.id)
      .single();

    if (!existingListing) {
      return NextResponse.json({ error: "No listing found for this member" }, { status: 404 });
    }

    // For paid tiers, listing stays approved. For linked, keep current approval status.
    const isPaid = member.tier === "connected" || member.tier === "amplified" || member.is_leadership;
    if (isPaid) {
      body.is_approved = true;
    }
    // For linked, don't change is_approved — keep whatever it currently is

    const { error: updateError } = await supabase
      .from("directory_listings")
      .update(body)
      .eq("id", existingListing.id);

    if (updateError) {
      console.error("Listing update error:", updateError);
      return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }

    // Handle category suggestion
    if (categorySuggestion && categorySuggestion.trim()) {
      await supabase.from("admin_notifications").insert({
        type: "category_suggestion",
        title: `Category suggestion: ${categorySuggestion.trim()}`,
        message: `${member.full_name} suggested a new category: "${categorySuggestion.trim()}"`,
        metadata: {
          member_id: member.id,
          suggestion: categorySuggestion.trim(),
        },
      });

      // Send notification emails (fire-and-forget)
      await Promise.allSettled([
        notifyCategorySuggestion(member.full_name, categorySuggestion.trim()),
        sendCategorySuggestionReceived(member.email, member.full_name),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH listing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
