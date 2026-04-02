import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

export async function GET(
  _request: Request,
  { params }: { params: { sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const { data: sponsor } = await supabase
    .from("event_sponsors")
    .select("stripe_session_id")
    .eq("id", params.sponsorId)
    .single();

  if (!sponsor?.stripe_session_id) {
    return NextResponse.json({ error: "No Stripe session found for this sponsor" }, { status: 404 });
  }

  try {
    const checkoutSession = await stripe().checkout.sessions.retrieve(sponsor.stripe_session_id);
    const paymentIntentId = checkoutSession.payment_intent;

    if (paymentIntentId) {
      return NextResponse.json({
        url: `https://dashboard.stripe.com/payments/${paymentIntentId}`,
      });
    }

    return NextResponse.json({ error: "No payment intent found on session" }, { status: 404 });
  } catch (err: any) {
    console.error("Payment URL lookup error:", err.message);
    return NextResponse.json({ error: "Failed to retrieve payment info" }, { status: 500 });
  }
}
