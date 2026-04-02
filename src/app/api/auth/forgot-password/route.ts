import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendPasswordReset } from "@/lib/emails";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // Look up member (don't reveal whether email exists)
    const { data: member } = await supabase
      .from("members")
      .select("id, full_name")
      .eq("email", normalizedEmail)
      .single();

    if (member) {
      // Generate reset token (1-hour expiry)
      const token = crypto.randomBytes(32).toString("hex").slice(0, 32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      await supabase.from("member_invites").insert({
        email: normalizedEmail,
        token,
        expires_at: expiresAt,
      });

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://networkingforawesomepeople.com";
      const resetUrl = `${baseUrl}/auth/set-password?token=${token}`;

      await sendPasswordReset(normalizedEmail, member.full_name, resetUrl);
    }

    // Always return success (don't reveal whether email exists)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
