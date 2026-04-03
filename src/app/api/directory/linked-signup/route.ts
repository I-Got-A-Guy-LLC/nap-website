import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendLinkedWelcome, notifyNewLinkedListing } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const { name, email, phone, business, city, password } = await request.json();

    if (!name || !email || !phone || !business || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // Check if member already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new member with password
    const { data: newMember, error: memberError } = await supabase
      .from("members")
      .insert({
        email: normalizedEmail,
        full_name: name,
        phone: phone || null,
        business_name: business,
        city,
        tier: "linked",
        subscription_status: "active",
        password_hash: passwordHash,
      })
      .select("id")
      .single();

    if (memberError) {
      console.error("Member creation error:", memberError);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }
    const memberId = newMember.id;

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
      contact_phone: phone || null,
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

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://networkingforawesomepeople.com";
    const loginUrl = `${baseUrl}/login`;

    // Send emails — account is ready to use immediately
    await sendLinkedWelcome(email, name, loginUrl);
    await notifyNewLinkedListing(name, business);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Linked signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
