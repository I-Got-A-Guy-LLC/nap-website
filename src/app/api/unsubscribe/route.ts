import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// GET validates the token and reports who it belongs to. It deliberately
// CHANGES NOTHING.
//
// It used to unsubscribe on GET, which meant any automated fetch of the link
// silently opted someone out. Corporate mail security (Outlook Safe Links and
// similar) prefetches URLs in incoming mail, so a member could be unsubscribed
// without ever opening the email. The action now requires an explicit POST,
// which a scanner will not issue.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("email, email_unsubscribed, notif_broadcasts")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    email: member.email,
    alreadyUnsubscribed: member.email_unsubscribed === true,
    broadcastsOff: member.notif_broadcasts === false,
  });
}

// POST applies the change. Two scopes, because an all-or-nothing opt-out loses
// people who only wanted the newsletter to stop: the site specifically promises
// meeting cancellation alerts, and those are worth keeping separate.
export async function POST(request: Request) {
  let body: { token?: string; scope?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { token, scope } = body;

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  if (scope !== "broadcasts" && scope !== "all") {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: member } = await supabase
    .from("members")
    .select("id, email")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!member) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  // "broadcasts" turns off the community newsletter only, leaving meeting
  // cancellations and event notices intact.
  //
  // "all" sets the hard unsubscribe every send path checks, and clears
  // email_opted_in so the admin list does not still show them as opted in.
  const update =
    scope === "broadcasts"
      ? { notif_broadcasts: false }
      : { email_unsubscribed: true, email_opted_in: false, notif_broadcasts: false };

  const { error } = await supabase.from("members").update(update).eq("id", member.id);

  if (error) {
    console.error("unsubscribe update failed:", error);
    return NextResponse.json({ error: "Could not update your preferences" }, { status: 500 });
  }

  return NextResponse.json({ success: true, scope });
}
