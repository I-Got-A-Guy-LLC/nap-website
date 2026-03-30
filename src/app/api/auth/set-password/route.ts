import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Validate token
  const { data: invite } = await supabase
    .from("member_invites")
    .select("*")
    .eq("token", token)
    .single();

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid invite token." },
      { status: 400 }
    );
  }

  if (invite.used_at) {
    return NextResponse.json(
      { error: "This invite has already been used." },
      { status: 400 }
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This invite link has expired." },
      { status: 400 }
    );
  }

  // Hash password and save
  const passwordHash = await bcrypt.hash(password, 12);

  const { error: updateErr } = await supabase
    .from("members")
    .update({ password_hash: passwordHash })
    .eq("email", invite.email);

  if (updateErr) {
    return NextResponse.json(
      { error: "Failed to set password. Please try again." },
      { status: 500 }
    );
  }

  // Mark invite as used
  await supabase
    .from("member_invites")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ success: true });
}
