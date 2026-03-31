import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

const TIER_PRICES: Record<string, number> = {
  supporting: 250,
  community: 100,
};

export async function POST(request: Request) {
  try {
    const { slug, tier, name, email, businessName } = await request.json();

    if (!slug || !tier || !name || !email || !businessName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const amount = TIER_PRICES[tier];
    if (!amount) {
      return NextResponse.json({ error: "Invalid tier for self-serve checkout." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Look up event by slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, slug")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `${event.title} - ${tierLabel} Sponsor`,
            description: `${tierLabel} sponsorship for ${event.title}`,
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
        eventId: event.id,
        slug,
        tier,
        businessName,
        contactName: name,
        email,
        phone: "",
        notes: "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("[sponsor-checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
