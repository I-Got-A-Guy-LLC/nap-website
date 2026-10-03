import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
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

  // Clear email_opted_in as well as setting the unsubscribe flag. Every send
  // path gates on email_unsubscribed, so leaving opted_in true changed nothing
  // functionally, but the two then disagreed: the admin members list reads
  // email_opted_in and would show someone who had just unsubscribed as
  // "Opted in".
  await supabase
    .from("members")
    .update({ email_unsubscribed: true, email_opted_in: false })
    .eq("id", member.id);

  return NextResponse.json({ success: true });
}
