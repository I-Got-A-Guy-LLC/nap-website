import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { notifyNewReview, sendNewReviewNotification } from "@/lib/emails";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reviewer_name, reviewer_email, rating, review_text } = body;

    if (!reviewer_name || !reviewer_email || !rating) {
      return NextResponse.json(
        { error: "Name, email, and rating are required." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Get listing and member info
    const { data: listing, error: listingError } = await supabase
      .from("directory_listings")
      .select("id, business_name, member_id, members!inner(full_name, email)")
      .eq("id", params.id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 }
      );
    }

    // Insert review (pending approval by default)
    const { error: insertError } = await supabase.from("reviews").insert({
      listing_id: params.id,
      reviewer_name,
      reviewer_email,
      rating,
      review_text: review_text || null,
      is_approved: false,
    });

    if (insertError) {
      console.error("Review insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to submit review." },
        { status: 500 }
      );
    }

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      type: "new_review",
      title: `New ${rating}-star review for ${listing.business_name}`,
      message: `${reviewer_name} left a ${rating}-star review for ${listing.business_name}.`,
      metadata: {
        listing_id: params.id,
        reviewer_name,
        rating,
      },
    });

    // Send notification emails (fire-and-forget)
    const member = listing.members as any;
    await Promise.allSettled([
      notifyNewReview(listing.business_name, reviewer_name, rating),
      sendNewReviewNotification(member.email, member.full_name, reviewer_name, rating),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Review route error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
