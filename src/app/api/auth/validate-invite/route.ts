import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, error: "No token provided" });
  }

  const supabase = getSupabaseAdmin();

  const { data: invite } = await supabase
    .from("member_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (!invite) {
    return NextResponse.json({ valid: false, error: "Invalid invite link." });
  }

  if (invite.used_at) {
    return NextResponse.json({
      valid: false,
      error: "This invite has already been used. Please sign in instead.",
    });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({
      valid: false,
      error: "This invite link has expired. Please ask your admin to resend it.",
    });
  }

  // Get member name for the welcome message
  const { data: member } = await supabase
    .from("members")
    .select("full_name")
    .eq("email", invite.email)
    .single();

  return NextResponse.json({
    valid: true,
    name: member?.full_name || "",
  });
}
