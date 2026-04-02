import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Must be leadership or admin
    const supabase = getSupabaseAdmin();
    const isAdmin =
      (session as any).role === "super_admin";

    if (!isAdmin) {
      const { data: member } = await supabase
        .from("members")
        .select("is_leadership")
        .eq("email", session.user.email)
        .single();

      if (!member?.is_leadership) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { ticketCode, action } = await request.json();

    if (!ticketCode || !["checkin", "undo"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Provide ticketCode and action (checkin or undo)." },
        { status: 400 }
      );
    }

    if (action === "checkin") {
      const { data: ticket, error } = await supabase
        .from("event_tickets")
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: session.user.email,
        })
        .eq("ticket_code", ticketCode)
        .select("*")
        .single();

      if (error) {
        console.error("Check-in error:", error);
        return NextResponse.json(
          { error: "Failed to check in" },
          { status: 500 }
        );
      }

      return NextResponse.json({ ticket });
    }

    // Undo check-in
    const { data: ticket, error } = await supabase
      .from("event_tickets")
      .update({
        checked_in_at: null,
        checked_in_by: null,
      })
      .eq("ticket_code", ticketCode)
      .select("*")
      .single();

    if (error) {
      console.error("Undo check-in error:", error);
      return NextResponse.json(
        { error: "Failed to undo check-in" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Check-in route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
