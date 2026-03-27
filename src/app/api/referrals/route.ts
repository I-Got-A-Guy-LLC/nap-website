import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendReferralNotification } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { listingId, referrerName, referrerEmail, referredName, referredEmail, referredPhone, referredBusiness, notes } = body;

    if (!listingId || !referrerName || !referrerEmail || !referredName || !referredEmail) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get listing info for the email
    const { data: listing } = await supabase
      .from("directory_listings")
      .select("business_name, contact_email, contact_name")
      .eq("id", listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Save referral
    const { error } = await supabase.from("referrals").insert({
      listing_id: listingId,
      referrer_name: referrerName,
      referrer_email: referrerEmail,
      referred_name: referredName,
      referred_email: referredEmail,
      referred_phone: referredPhone || null,
      referred_business: referredBusiness || null,
      notes: notes || null,
    });

    if (error) {
      console.error("Referral save error:", error);
      return NextResponse.json({ error: "Failed to save referral" }, { status: 500 });
    }

    // Send email notification to listing owner
    if (listing.contact_email) {
      await sendReferralNotification(
        listing.contact_email,
        listing.contact_name || listing.business_name,
        listing.business_name,
        referrerName,
        referrerEmail,
        referredName,
        referredEmail,
        referredPhone,
        referredBusiness,
        notes
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
