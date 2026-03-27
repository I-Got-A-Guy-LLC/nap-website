import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendLinkedApproved, sendLinkedRejected } from "@/lib/emails";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "rachel@networkingforawesomepeople.com"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listingId, action, reason } = await request.json();

    if (!listingId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get the listing with member info
    const { data: listing, error: fetchError } = await supabase
      .from("directory_listings")
      .select("*, member_id")
      .eq("id", listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      await supabase
        .from("directory_listings")
        .update({
          is_approved: true,
          approval_status: "approved",
        })
        .eq("id", listingId);

      // Send approval email
      await sendLinkedApproved(
        listing.contact_email,
        listing.contact_name
      );

      // Create admin notification
      await supabase.from("admin_notifications").insert({
        type: "listing_approved",
        reference_id: listingId,
        message: `Listing approved: ${listing.business_name}`,
      });
    } else {
      // Reject
      await supabase
        .from("directory_listings")
        .update({
          approval_status: "rejected",
        })
        .eq("id", listingId);

      // Send rejection email
      await sendLinkedRejected(
        listing.contact_email,
        listing.contact_name,
        reason || "Your listing did not meet our guidelines."
      );

      // Create admin notification
      await supabase.from("admin_notifications").insert({
        type: "listing_rejected",
        reference_id: listingId,
        message: `Listing rejected: ${listing.business_name}. Reason: ${reason || "N/A"}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
