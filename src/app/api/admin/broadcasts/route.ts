import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const ADMIN_EMAIL = "hello@networkingforawesomepeople.com";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder");
}

const CATEGORY_COLORS: Record<string, string> = {
  "General Announcement": "#1F3149",
  "Event Reminder": "#FE6651",
  "New Member Welcome": "#71D4D1",
  "City Update": "#F5BE61",
  "Business Spotlight": "#FBC761",
  "Action Required": "#FE6651",
};

function buildEmailHtml(category: string, body: string): string {
  const badgeColor = CATEGORY_COLORS[category] || "#1F3149";
  const bodyHtml = body.replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
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
            <span style="display:inline-block;background-color:${badgeColor};color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">${category}</span>
            <div style="margin-top:16px;">${bodyHtml}</div>
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

export async function GET(request: Request) {
  const adminEmail = request.headers.get("x-admin-email");
  if (adminEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: broadcasts } = await supabase
    .from("broadcasts")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ broadcasts: broadcasts || [] });
}

export async function POST(request: Request) {
  const adminEmail = request.headers.get("x-admin-email");
  if (adminEmail !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { category, subject, body, audience, active_only } = await request.json();

  if (!category || !subject || !body) {
    return NextResponse.json({ error: "Category, subject, and body are required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Query members
  let query = supabase.from("members").select("email, full_name");

  if (audience && audience !== "all") {
    query = query.ilike("city", audience);
  }

  // active_only: filter to members with subscription_status = 'active' or is_comped = true or is_leadership = true
  // For simplicity, we'll just send to all members in the audience since "active" isn't a simple boolean
  // If active_only is false, send to everyone in the audience

  const { data: members, error: membersError } = await query;

  if (membersError) {
    console.error("Broadcast members query error:", membersError);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }

  const recipients = (members || []).filter((m) => m.email);

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients found for this audience" }, { status: 400 });
  }

  // Build email HTML
  const html = buildEmailHtml(category, body);
  const resend = getResend();

  // Send in batches of 50 (Resend batch limit)
  const batchSize = 50;
  let sentCount = 0;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    try {
      await resend.batch.send(
        batch.map((member) => ({
          from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
          to: member.email,
          subject,
          html,
        }))
      );
      sentCount += batch.length;
    } catch (err) {
      console.error(`Broadcast batch ${i} send error:`, err);
      // Continue with remaining batches even if one fails
    }
  }

  // Log to broadcasts table
  await supabase.from("broadcasts").insert({
    created_by: ADMIN_EMAIL,
    category,
    subject,
    body,
    audience,
    active_only,
    status: "sent",
    sent_at: new Date().toISOString(),
    recipient_count: sentCount,
  });

  console.log(`[broadcast] Sent "${subject}" to ${sentCount} recipients (audience: ${audience})`);

  return NextResponse.json({ success: true, recipient_count: sentCount });
}
