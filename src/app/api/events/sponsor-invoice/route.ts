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
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Save to event_sponsors table
    const { error: insertError } = await supabase
      .from("event_sponsors")
      .insert({
        event_id: eventId,
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
        tier,
        notes: notes || null,
        payment_method: paymentMethod,
        status: paymentMethod === "invoice" ? "pending_invoice" : "pending_payment",
      });

    if (insertError) {
      console.error("Sponsor insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save sponsorship." },
        { status: 500 }
      );
    }

    // Send notification email to hello@networkingforawesomepeople.com
    // Using Supabase edge function or a simple insert into a notifications table
    try {
      await supabase.from("notifications").insert({
        type: "sponsor_signup",
        recipient: "hello@networkingforawesomepeople.com",
        subject: `New Sponsor Signup: ${businessName} (${tier})`,
        body: `Business: ${businessName}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nTier: ${tier}\nPayment: ${paymentMethod}\nNotes: ${notes || "None"}`,
        sent: false,
      });
    } catch {
      // Notification failure should not block the sponsor signup
      console.error("Failed to queue sponsor notification");
    }

    // If paying online via Stripe
    const tierPrice = tierPrices[tier] || 0;
    if (paymentMethod === "stripe" && tierPrice > 0) {
      const session = await stripe().checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Event Sponsorship — ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} sponsor for event`,
              },
              unit_amount: tierPrice * 100,
            },
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${process.env.NEXTAUTH_URL}/events/${slug}/sponsor?success=true`,
        cancel_url: `${process.env.NEXTAUTH_URL}/events/${slug}/sponsor`,
        metadata: {
          type: "event_sponsor",
          eventId: eventId || "",
          tier,
          businessName,
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // Invoice method — Rachel sends invoice manually
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to process sponsorship";
    console.error("Sponsor signup error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
