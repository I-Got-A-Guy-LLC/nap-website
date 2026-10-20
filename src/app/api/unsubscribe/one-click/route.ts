import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// One-click unsubscribe (RFC 8058), the target of the List-Unsubscribe header on
// broadcasts. Gmail and Yahoo show their own "Unsubscribe" button and, when it
// is pressed, POST here with the body "List-Unsubscribe=One-Click". The token
// and preference come from the URL, because the mail provider sends nothing else.
//
// POST only. A GET changes nothing, for the same reason as /api/unsubscribe:
// link scanners prefetch URLs in incoming mail and must not opt anyone out.
//
// It turns off the one preference governing the broadcast it came from (the
// newsletter, or event reminders), matching what the visible "Unsubscribe from
// broadcasts" link offers. Meeting cancellation alerts are left alone.
const ALLOWED_PREFS = ["notif_broadcasts", "notif_events"];

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const pref = searchParams.get("pref") ?? "notif_broadcasts";

  if (!token || !ALLOWED_PREFS.includes(pref)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const { error } = await supabase
    .from("members")
    .update({ [pref]: false })
    .eq("id", member.id);

  if (error) {
    console.error("one-click unsubscribe update failed:", error);
    return NextResponse.json({ error: "Could not update your preferences" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
