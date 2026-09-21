import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    // "member"     -> has a directory listing
    // "subscriber" -> no listing; signed up for email only
    // absent/"all" -> everyone
    // Membership is derived from the listing join rather than stored, so a
    // subscriber who gets a listing becomes a member here with nothing to sync.
    const contactType = searchParams.get("contact_type");
    // Campaign tag, e.g. "depot-days-2026". Matched with array containment.
    const tag = searchParams.get("tag");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("members")
      .select(
        "*, directory_listings(id, business_name, is_approved, slug, listing_state)"
      )
      .order("created_at", { ascending: false });

    if (tier) {
      query = query.eq("tier", tier);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (status) {
      query = query.eq("subscription_status", status);
    }
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data: membersRaw, error } = await query;

    // Filter on the derived membership after the fetch. PostgREST cannot express
    // "has at least one related row" as a filter on the parent without an inner
    // join, and an inner join here would drop the very subscribers this page now
    // needs to show.
    const members =
      contactType === "member"
        ? (membersRaw ?? []).filter((m) => (m.directory_listings?.length ?? 0) > 0)
        : contactType === "subscriber"
          ? (membersRaw ?? []).filter((m) => (m.directory_listings?.length ?? 0) === 0)
          : membersRaw;

    if (error) {
      console.error("Members fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    // Every tag in use, so the filter dropdown populates itself as new campaigns
    // are added rather than needing a hardcoded list. Queried separately because
    // the main query above may already be filtered by tag.
    const { data: tagRows } = await supabase
      .from("members")
      .select("tags")
      .not("tags", "is", null);
    const availableTags = Array.from(
      new Set((tagRows ?? []).flatMap((r) => (Array.isArray(r.tags) ? r.tags : [])))
    ).sort();

    return NextResponse.json({ members: members || [], availableTags });
  } catch (error) {
    console.error("Members GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { full_name, email, business_name, city, tier, is_comped, comp_reason, comp_expires_at } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if member already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      return NextResponse.json({ error: "A member with this email already exists" }, { status: 409 });
    }

    const { data: member, error } = await supabase
      .from("members")
      .insert({
        full_name,
        email: email.toLowerCase().trim(),
        business_name: business_name || null,
        city: city || null,
        tier: tier || "linked",
        subscription_status: "active",
        is_comped: is_comped || false,
        comp_reason: comp_reason || null,
        comp_expires_at: comp_expires_at || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Member creation error:", error);
      return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Members POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId, ...fields } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      "full_name",
      "email",
      "phone",
      "business_name",
      "city",
      "tier",
      "is_nap_verified",
      "is_leadership",
      "leadership_city",
      "admin_notes",
      "is_comped",
      "comp_reason",
      "comp_expires_at",
    ];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in fields) {
        updateData[key] = fields[key];
      }
    }

    // Normalize email if being updated
    if (updateData.email && typeof updateData.email === "string") {
      updateData.email = (updateData.email as string).toLowerCase().trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: member, error } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", memberId)
      .select()
      .single();

    if (error) {
      console.error("Member update error:", error);
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Members PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Listings cascade-delete automatically via FK constraint
    const { error } = await supabase
      .from("members")
      .delete()
      .eq("id", memberId);

    if (error) {
      console.error("Member delete error:", error);
      return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Members DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
