import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendLinkedWelcome, notifyNewLinkedListing } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const { name, email, business, city } = await request.json();

    if (!name || !email || !business || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if member already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("email", email)
      .single();

    let memberId: string;

    if (existing) {
      memberId = existing.id;
      // Update existing member
      await supabase
        .from("members")
        .update({ full_name: name, business_name: business, city })
        .eq("id", memberId);
    } else {
      // Create new member
      const { data: newMember, error: memberError } = await supabase
        .from("members")
        .insert({
          email,
          full_name: name,
          business_name: business,
          city,
          tier: "linked",
        })
        .select("id")
        .single();

      if (memberError) {
        console.error("Member creation error:", memberError);
        return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
      }
      memberId = newMember.id;
    }

    // Create directory listing (pending approval)
    const { error: listingError } = await supabase.from("directory_listings").insert({
      member_id: memberId,
      business_name: business,
      contact_name: name,
      contact_email: email,
      city,
      is_approved: false,
      approval_status: "pending",
    });

    if (listingError) {
      console.error("Listing creation error:", listingError);
    }

    // Create admin notification
    await supabase.from("admin_notifications").insert({
      type: "new_linked",
      reference_id: memberId,
      message: `New Linked listing: ${business} by ${name} (${city})`,
    });

    // Send emails
    await sendLinkedWelcome(email, name);
    await notifyNewLinkedListing(name, business);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Linked signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
