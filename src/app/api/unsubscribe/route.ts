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

  await supabase
    .from("members")
    .update({ email_unsubscribed: true })
    .eq("id", member.id);

  return NextResponse.json({ success: true });
}
