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
        "id, full_name, business_name, email, city, tier, status, subscription_status, renewal_date, is_nap_verified, is_leadership, is_comped, comp_reason, comp_expires_at"
      )
      .order("created_at", { ascending: false });

    if (tier) {
      query = query.eq("tier", tier);
    }
    if (city) {
      query = query.eq("city", city);
    }
    if (status) {
      query = query.eq("status", status);
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
