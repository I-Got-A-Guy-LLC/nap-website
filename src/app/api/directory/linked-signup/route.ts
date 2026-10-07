import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { slugify, cleanBusinessName } from "@/lib/slug";
import { clampLinkedDescription } from "@/lib/listingLimits";
import { sendLinkedWelcome, notifyNewLinkedListing } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const { name, email, phone, business, city, category, description, password } = await request.json();

    if (!name || !email || !phone || !business || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "Please choose a business category" }, { status: 400 });
    }

    // Asked for at signup because every listing created before this arrived with
    // no description: 22 in the 60 days to 2026-10-07, every one of them blank.
    // It is the field that makes a listing findable, so collecting it at the one
    // moment the member is motivated beats chasing it afterwards.
    if (!description || !String(description).trim()) {
      return NextResponse.json({ error: "Please add a short description of what you do" }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // Validate the category server-side rather than trusting the posted id. A
    // bad id would otherwise fail the listing insert, which is only logged, so
    // the member would be created with no listing at all.
    const { data: categoryRow } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category)
      .eq("is_active", true)
      .maybeSingle();

    if (!categoryRow) {
      return NextResponse.json({ error: "Please choose a business category" }, { status: 400 });
    }

    // Check if member already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in instead." }, { status: 409 });
    }

    // Normalise once, then use for both the member record and the listing, so
    // the two can never disagree about the business name.
    const cleanName = cleanBusinessName(business);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create new member with password
    const { data: newMember, error: memberError } = await supabase
      .from("members")
      .insert({
        email: normalizedEmail,
        full_name: name,
        phone: phone || null,
        business_name: cleanName,
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

    // Auto-generate slug from business name. Third copy of this logic before it
    // was shared; all three trimmed after converting spaces to hyphens, which is
    // too late to remove a trailing space.
    const baseSlug = slugify(cleanName);
    const { data: slugExists } = await supabase
      .from("directory_listings")
      .select("slug")
      .eq("slug", baseSlug)
      .maybeSingle();
    const slug = slugExists ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : baseSlug;

    // Create directory listing (pending approval)
    const { error: listingError } = await supabase.from("directory_listings").insert({
      member_id: memberId,
      business_name: cleanName,
      contact_name: name,
      contact_email: email,
      contact_phone: phone || null,
      city,
      slug,
      primary_category_id: categoryRow.id,
      // Clamped server side to the same cap the portal and the listing page use,
      // so the form's maxLength is not the only thing enforcing it.
      description: clampLinkedDescription(String(description)),
      // Set explicitly. Left unset, the row arrived with tier NULL and fell back
      // to the owner's member tier at render time, which is the behaviour the
      // per-listing column replaces. This is the free signup, so it is linked.
      tier: "linked",
      listing_state: "TN",
      is_approved: false,
      approval_status: "pending",
    });

    if (listingError) {
      console.error("Listing creation error:", listingError);
    }

    // Deliberately no admin notification here. The listing is created with
    // approval_status "pending", and the admin dashboard already shows a live
    // pending-approvals count linking to /admin/approvals. That counter is the
    // better signal: it drops back to zero once the queue is cleared, whereas a
    // notification persists forever. This type had reached 65 rows.

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
