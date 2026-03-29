import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SPONSOR_TIER_TICKETS, generateTicketCode } from "@/lib/events";

export async function POST(
  _request: Request,
  { params }: { params: { sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Get sponsor
  const { data: sponsor } = await supabase
    .from("event_sponsors")
    .select("*, events(id, title, tickets_sold)")
    .eq("id", params.sponsorId)
    .single();

  if (!sponsor) {
    return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
  }

  // Mark as paid
  await supabase
    .from("event_sponsors")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: sponsor.payment_method === "invoice" ? sponsor.payment_method : "cash",
    })
    .eq("id", params.sponsorId);

  // Issue complimentary tickets
  const ticketCount = SPONSOR_TIER_TICKETS[sponsor.tier] || 0;
  if (ticketCount > 0 && sponsor.event_id) {
    const tickets = Array.from({ length: ticketCount }, () => ({
      event_id: sponsor.event_id,
      ticket_code: generateTicketCode(),
      purchaser_name: sponsor.sponsor_name,
      purchaser_email: sponsor.sponsor_email,
      quantity: 1,
      amount_paid: 0,
      status: "active",
    }));

    await supabase.from("tickets").insert(tickets);

    // Increment tickets_sold
    const event = Array.isArray(sponsor.events) ? sponsor.events[0] : sponsor.events;
    if (event) {
      await supabase
        .from("events")
        .update({ tickets_sold: (event.tickets_sold || 0) + ticketCount })
        .eq("id", sponsor.event_id);
    }
  }

  return NextResponse.json({ success: true, ticketsIssued: ticketCount });
}

// PATCH  -  update sponsor fields (logo_url, website_url, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { sponsorId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const allowed = ["logo_url", "website_url", "sponsor_name", "sponsor_email", "sponsor_phone", "sponsor_business", "notes"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  await supabase.from("event_sponsors").update(updates).eq("id", params.sponsorId);

  return NextResponse.json({ success: true });
}
