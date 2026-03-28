import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateTicketCode } from "@/lib/events";
import { sendTicketConfirmation } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const { eventId, quantity, promoCode, attendeeName, attendeeEmail, attendeePhone } = await request.json();

    if (!eventId || !quantity || quantity < 1 || quantity > 4) {
      return NextResponse.json({ error: "Invalid request. Quantity must be between 1 and 4." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: event, error } = await supabase
      .from("events")
      .select("id, slug, title, ticket_price, capacity, tickets_sold, status, event_date, start_time, end_time, location_name")
      .eq("id", eventId)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    if (event.status !== "published") {
      return NextResponse.json({ error: "This event is not available for purchase." }, { status: 400 });
    }

    const spotsRemaining = event.capacity - event.tickets_sold;
    if (quantity > spotsRemaining) {
      return NextResponse.json({ error: `Only ${spotsRemaining} spot${spotsRemaining === 1 ? "" : "s"} remaining.` }, { status: 400 });
    }

    // Validate promo code if provided
    let finalUnitPrice = Number(event.ticket_price);
    let promoId: string | null = null;

    if (promoCode) {
      const { data: promo } = await supabase
        .from("event_promo_codes")
        .select("*")
        .eq("event_id", eventId)
        .ilike("code", promoCode.trim().toUpperCase())
        .maybeSingle();

      if (!promo) {
        return NextResponse.json({ error: "Invalid promo code" }, { status: 400 });
      }
      if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
        return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
      }
      if (promo.uses_count >= promo.max_uses) {
        return NextResponse.json({ error: "This promo code has been fully redeemed" }, { status: 400 });
      }

      promoId = promo.id;
      if (promo.discount_type === "percent") {
        finalUnitPrice = finalUnitPrice * (1 - Number(promo.discount_value) / 100);
      } else {
        finalUnitPrice = Math.max(0, finalUnitPrice - Number(promo.discount_value));
      }
    }

    // If 100% off — skip Stripe, create tickets directly
    if (finalUnitPrice <= 0) {
      if (!attendeeName || !attendeeEmail) {
        return NextResponse.json({ error: "Name and email are required for free tickets" }, { status: 400 });
      }

      const tickets = Array.from({ length: quantity }, () => ({
        event_id: event.id,
        ticket_code: generateTicketCode(),
        purchaser_name: attendeeName,
        purchaser_email: attendeeEmail,
        purchaser_phone: attendeePhone || null,
        quantity: 1,
        amount_paid: 0,
        status: "active",
        stripe_session_id: `free_${Date.now()}`,
      }));

      await supabase.from("tickets").insert(tickets);

      // Increment tickets_sold
      const { data: evt } = await supabase.from("events").select("tickets_sold").eq("id", event.id).single();
      if (evt) {
        await supabase.from("events").update({ tickets_sold: (evt.tickets_sold || 0) + quantity }).eq("id", event.id);
      }

      // Increment promo uses
      if (promoId) {
        const { data: pc } = await supabase.from("event_promo_codes").select("uses_count").eq("id", promoId).single();
        if (pc) {
          await supabase.from("event_promo_codes").update({ uses_count: (pc.uses_count || 0) + 1 }).eq("id", promoId);
        }
      }

      // Send confirmation email
      console.log("[checkout] Sending free ticket confirmation to", attendeeEmail);
      await sendTicketConfirmation(
        attendeeEmail,
        attendeeName,
        event.title,
        event.event_date || "",
        event.start_time || "",
        event.end_time || "",
        event.location_name || "",
        tickets[0].ticket_code,
        quantity
      ).catch((err) => console.error("[checkout] Email send error:", err));

      return NextResponse.json({
        free: true,
        ticketCodes: tickets.map((t) => t.ticket_code),
        sessionId: tickets[0].stripe_session_id,
      });
    }

    // Paid checkout via Stripe
    const unitAmount = Math.round(finalUnitPrice * 100);

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `${event.title} — Ticket`,
            description: `${quantity} ticket${quantity === 1 ? "" : "s"} to ${event.title}${promoCode ? ` (code: ${promoCode})` : ""}`,
          },
          unit_amount: unitAmount,
        },
        quantity,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/events/${event.slug}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
      metadata: {
        eventId: event.id,
        quantity: String(quantity),
        promoId: promoId || "",
      },
    });

    // Increment promo uses on checkout creation (will be confirmed by webhook)
    if (promoId) {
      const { data: pc } = await supabase.from("event_promo_codes").select("uses_count").eq("id", promoId).single();
      if (pc) {
        await supabase.from("event_promo_codes").update({ uses_count: (pc.uses_count || 0) + 1 }).eq("id", promoId);
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    console.error("Event checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
