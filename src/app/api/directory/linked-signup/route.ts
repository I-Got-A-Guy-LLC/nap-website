import { NextResponse } from "next/server";
import crypto from "crypto";
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
          subscription_status: "active",
        })
        .select("id")
        .single();

      if (memberError) {
        console.error("Member creation error:", memberError);
        return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
      }
      memberId = newMember.id;
    }

    // Auto-generate slug from business name
    const baseSlug = business
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    const { data: slugExists } = await supabase
      .from("directory_listings")
      .select("slug")
      .eq("slug", baseSlug)
      .maybeSingle();
    const slug = slugExists ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    // Create directory listing (pending approval)
    const { error: listingError } = await supabase.from("directory_listings").insert({
      member_id: memberId,
      business_name: business,
      contact_name: name,
      contact_email: email,
      city,
      slug,
      listing_state: "TN",
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

    // Generate invite token for password setup (7-day expiry)
    const token = crypto.randomBytes(32).toString("hex").slice(0, 32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("member_invites").insert({
      email,
      token,
      expires_at: expiresAt,
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://networkingforawesomepeople.com";
    const setPasswordUrl = `${baseUrl}/auth/set-password?token=${token}`;

    // Send emails
    await sendLinkedWelcome(email, name, setPasswordUrl);
    await notifyNewLinkedListing(name, business);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Linked signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
