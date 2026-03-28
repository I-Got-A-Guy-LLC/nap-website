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

    const amount = tierPrices[tier] || 0;
    const supabase = getSupabaseAdmin();

    // --- STRIPE (pay online now) ---
    if (paymentMethod === "stripe" && amount > 0) {
      // Do NOT save to event_sponsors yet — webhook will handle it after payment
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
        metadata: {
          type: "event_sponsor",
          eventId: eventId || "",
          slug: slug || "",
          tier,
          businessName,
          contactName,
          email,
          phone: phone || "",
          notes: notes || "",
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // --- INVOICE or IN-KIND ---
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
        payment_method: tier === "in-kind" ? "in-kind" : "invoice",
        payment_status: "invoiced",
      });

    if (insertError) {
      console.error("[sponsor] Insert error:", insertError.message);
      return NextResponse.json({ error: "Failed to save sponsorship: " + insertError.message }, { status: 500 });
    }

    // Notify admin
    await supabase.from("admin_notifications").insert({
      type: "sponsor_signup",
      message: `New sponsor (invoice): ${businessName} (${tier}) — ${contactName} <${email}>`,
    }).then(() => {}, (err) => console.error("[sponsor] Notification error:", err));

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process sponsorship";
    console.error("[sponsor] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
