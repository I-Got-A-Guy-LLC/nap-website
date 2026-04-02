import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: member } = await supabase
    .from("members")
    .select("id, email, full_name, tier")
    .eq("id", params.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const tierLabel = member.tier.charAt(0).toUpperCase() + member.tier.slice(1);

  await getResend().emails.send({
    from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
    to: member.email,
    subject: "Your NAP directory listing is ready to set up!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1F3149;padding:24px 32px;text-align:center;">
          <h1 style="color:#FBC761;margin:0;font-size:24px;">Networking For Awesome People</h1>
        </div>
        <div style="padding:32px;background:#ffffff;">
          <h2 style="color:#1F3149;margin:0 0 16px;">Hey ${member.full_name}! 👋</h2>
          <p style="color:#333;line-height:1.6;">Your <strong>${tierLabel}</strong> membership with Networking For Awesome People is active, and your directory listing is waiting to be set up.</p>
          <p style="color:#333;line-height:1.6;">Complete your listing to start getting found by Middle Tennessee professionals who are looking for referral partners just like you.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="https://networkingforawesomepeople.com/login" style="background:#FBC761;color:#1F3149;padding:14px 32px;border-radius:100px;text-decoration:none;font-weight:bold;font-size:16px;">Set Up My Listing</a>
          </div>
          <p style="color:#666;font-size:14px;">Sign in with your email (${member.email}) and you'll be taken to your member portal where you can fill in your business details.</p>
        </div>
        <div style="background:#f4f4f7;padding:16px 32px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">Networking For Awesome People · Because regular networking is, well, regular.</p>
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}
