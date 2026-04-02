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

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ codes: [] });

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("event_promo_codes")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ codes: data || [] });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, code, discountType, discountValue, maxUses, expiresAt } = await request.json();

  if (!eventId || !code || !discountType || discountValue === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("event_promo_codes").insert({
    event_id: eventId,
    code: code.toUpperCase(),
    discount_type: discountType,
    discount_value: discountValue,
    max_uses: maxUses || 1,
    expires_at: expiresAt || null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A code with this name already exists for this event" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  await supabase.from("event_promo_codes").delete().eq("id", id);

  return NextResponse.json({ success: true });
}
