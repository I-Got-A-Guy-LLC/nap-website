import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { eventId, quantity } = await request.json();

    if (!eventId || !quantity || quantity < 1 || quantity > 4) {
      return NextResponse.json(
        { error: "Invalid request. Quantity must be between 1 and 4." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: event, error } = await supabase
      .from("events")
      .select("id, slug, title, ticket_price, capacity, tickets_sold, status")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { error: "This event is not available for purchase." },
        { status: 400 }
      );
    }

    const spotsRemaining = event.capacity - event.tickets_sold;
    if (quantity > spotsRemaining) {
      return NextResponse.json(
        {
          error: `Only ${spotsRemaining} spot${spotsRemaining === 1 ? "" : "s"} remaining.`,
        },
        { status: 400 }
      );
    }

    const unitAmount = Math.round(event.ticket_price * 100);

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${event.title} — Ticket`,
              description: `${quantity} ticket${quantity === 1 ? "" : "s"} to ${event.title}`,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/events/${event.slug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
      metadata: {
        eventId: event.id,
        quantity: String(quantity),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("Event checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
