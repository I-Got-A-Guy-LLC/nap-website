import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" });
  }

  const supabase = getSupabaseAdmin();

  const { data: promo } = await supabase
    .from("event_promo_codes")
    .select("*")
    .eq("event_id", params.eventId)
    .ilike("code", code)
    .maybeSingle();

  if (!promo) {
    return NextResponse.json({ valid: false, error: "Invalid promo code" });
  }

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This promo code has expired" });
  }

  if (promo.uses_count >= promo.max_uses) {
    return NextResponse.json({ valid: false, error: "This promo code has been fully redeemed" });
  }

  // Calculate final price
  const { data: event } = await supabase
    .from("events")
    .select("ticket_price")
    .eq("id", params.eventId)
    .single();

  const ticketPrice = Number(event?.ticket_price || 0);
  let finalPrice = ticketPrice;

  if (promo.discount_type === "percent") {
    finalPrice = ticketPrice * (1 - Number(promo.discount_value) / 100);
  } else {
    finalPrice = Math.max(0, ticketPrice - Number(promo.discount_value));
  }

  return NextResponse.json({
    valid: true,
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
    finalPrice: Math.round(finalPrice * 100) / 100,
    promoId: promo.id,
  });
}
