import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(
        `
        id,
        ticket_code,
        quantity,
        stripe_session_id,
        events (
          id,
          title,
          slug,
          event_date,
          start_time,
          end_time,
          location_name,
          location_address
        )
      `
      )
      .eq("stripe_session_id", sessionId)
      .single();

    if (error || !ticket) {
      return NextResponse.json(
        { error: "Ticket not found." },
        { status: 404 }
      );
    }

    // Flatten the joined event data
    const response = {
      ticket_code: ticket.ticket_code,
      quantity: ticket.quantity,
      event: ticket.events,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch ticket";
    console.error("Ticket lookup error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
