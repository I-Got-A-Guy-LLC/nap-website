import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");
    const city = searchParams.get("city");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("members")
      .select(
        "*"
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

    const { data: members, error } = await query;

    if (error) {
      console.error("Members fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch members" },
        { status: 500 }
      );
    }

    return NextResponse.json({ members: members || [] });
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
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
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
  if (
    !session?.user?.email ||
    session.user.email !== "hello@networkingforawesomepeople.com"
  ) {
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
