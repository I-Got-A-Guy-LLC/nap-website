/**
 * Send a welcome invite email to a new member added by admin.
 *
 * Usage:  npx tsx scripts/send-welcome-invite.ts bruce@email.com
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://networkingforawesomepeople.com";
const FROM = "Networking For Awesome People <members@networkingforawesomepeople.com>";

// ---------------------------------------------------------------------------
// Email template (matches project branding)
// ---------------------------------------------------------------------------

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background-color:#0a1628;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
            <h1 style="margin:0;color:#c8a951;font-size:20px;font-weight:700;">Networking For Awesome People</h1>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;padding:32px;font-size:15px;line-height:1.6;color:#333333;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background-color:#0a1628;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0;color:#8899aa;font-size:12px;">&copy; Networking For Awesome People. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function goldButton(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background-color:#c8a951;border-radius:9999px;padding:12px 32px;"><a href="${url}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">${label}</a></td></tr></table>`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const email = process.argv[2]?.toLowerCase().trim();

  if (!email) {
    console.error("Usage: npx tsx scripts/send-welcome-invite.ts <email>");
    process.exit(1);
  }

  // Look up member
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .select("id, email, full_name, tier")
    .eq("email", email)
    .single();

  if (memberErr || !member) {
    console.error(`No member found with email: ${email}`);
    process.exit(1);
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString("hex").slice(0, 32);
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  // Store invite
  const { error: insertErr } = await supabase
    .from("member_invites")
    .insert({ email: member.email, token, expires_at: expiresAt });

  if (insertErr) {
    console.error("Failed to create invite:", insertErr.message);
    process.exit(1);
  }

  // Send welcome email
  const tierLabel = member.tier.charAt(0).toUpperCase() + member.tier.slice(1);
  const setPasswordUrl = `${SITE_URL}/auth/set-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: member.email,
    subject: "Welcome to Networking For Awesome People — Set Up Your Account",
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#0a1628;">Welcome to the network, ${member.full_name}!</h2>
      <p>You've been added as a <strong>${tierLabel}</strong> member of Networking For Awesome People.</p>
      <p>Click the button below to set your password and access your member portal.</p>
      ${goldButton(setPasswordUrl, "Set Up My Account")}
      <p style="color:#888;font-size:13px;">This link expires in 48 hours. If it has expired, ask your admin to resend the invite.</p>
    `),
  });

  console.log(`Welcome invite sent to ${member.email} (token: ${token})`);
}

main();
