import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const tierPrices: Record<string, number> = {
  presenting: 500,
  supporting: 250,
  community: 100,
  "in-kind": 0,
};

export async function POST(request: Request) {
  try {
    const {
      eventId,
      slug,
      businessName,
      contactName,
      email,
      phone,
      tier,
      notes,
      paymentMethod,
    } = await request.json();

    if (!businessName || !contactName || !email || !tier) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const amount = tierPrices[tier] || 0;

    // Save to event_sponsors table — use correct column names
    const { error: insertError } = await supabase
      .from("event_sponsors")
      .insert({
        event_id: eventId,
        sponsor_name: contactName,
        sponsor_email: email,
        sponsor_phone: phone || null,
        sponsor_business: businessName,
        tier,
        amount,
        notes: notes || null,
        payment_method: paymentMethod === "stripe" ? "stripe" : "invoice",
        payment_status: "pending",
      });

    if (insertError) {
      console.error("[sponsor] Insert error:", insertError.message, insertError.code, insertError.details);
      return NextResponse.json({ error: "Failed to save sponsorship: " + insertError.message }, { status: 500 });
    }

    // Notify Rachel
    const { error: notifError } = await supabase.from("admin_notifications").insert({
      type: "sponsor_signup",
      message: `New sponsor: ${businessName} (${tier}) — ${contactName} <${email}>`,
    });
    if (notifError) console.error("[sponsor] Notification error:", notifError.message);

    // If paying online via Stripe
    if (paymentMethod === "stripe" && amount > 0) {
      const session = await stripe().checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Event Sponsorship — ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        }],
        customer_email: email,
        success_url: `${process.env.NEXTAUTH_URL}/events/${slug}/sponsor?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/events/${slug}/sponsor`,
        metadata: { type: "event_sponsor", eventId: eventId || "", tier, businessName },
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process sponsorship";
    console.error("[sponsor] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
