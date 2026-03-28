import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== "hello@networkingforawesomepeople.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const allowed = [
    "title", "description", "status", "event_date", "start_time", "end_time",
    "location_name", "location_address", "city", "state", "capacity",
    "ticket_price", "is_free", "image_url", "included_items",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("events")
    .update(updates)
    .eq("id", params.eventId);

  if (error) {
    console.error("Event update error:", error);
    return NextResponse.json({ error: "Failed to update event: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
