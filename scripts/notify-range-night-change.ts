/**
 * One-time script: Notify all Range Night ticket holders about the date/venue change.
 *
 * Usage:
 *   Dry run (default — lists recipients, sends nothing):
 *     npx tsx scripts/notify-range-night-change.ts
 *
 *   Send for real:
 *     npx tsx scripts/notify-range-night-change.ts --send
 *
 * Requires RESEND_API_KEY and NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from "fs";
// Load .env.local manually
try {
  const envContent = readFileSync(".env.local", "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch { /* ignore */ }

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const EVENT_SLUG = "range-night-2026";
const SUBJECT = "Important Event Date & Location Change";

const BODY_HTML = `
<p>Hello!</p>
<p>Due to unforeseen issues at Bullseye Range, we have had to move our Range Night event to a new time and place.</p>
<p>Now: <strong>Wednesday, April 22, 2026 at Black Frog Arms (915 N Thompson Ln, Murfreesboro, TN 37129)</strong>, still 5:30p to 7:30p.</p>
<p>We appreciate your ability to be flexible during this time.</p>
<p>Rachel</p>
`;

function buildEmailHtml(): string {
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
            <span style="display:inline-block;background-color:#FE6651;color:#ffffff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Event Update</span>
            <div style="margin-top:16px;">${BODY_HTML}</div>
          </td>
        </tr>
        <tr>
          <td style="background-color:#0a1628;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0;color:#8899aa;font-size:12px;">&copy; 2026 Networking For Awesome People. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function main() {
  const send = process.argv.includes("--send");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: event, error: evtErr } = await supabase
    .from("events")
    .select("id, title, event_date, location_name")
    .eq("slug", EVENT_SLUG)
    .single();

  if (evtErr || !event) {
    console.error("Event not found:", EVENT_SLUG, evtErr);
    process.exit(1);
  }

  console.log(`Event: ${event.title} (${event.id})`);
  console.log(`Current DB values  -  date: ${event.event_date}, venue: ${event.location_name}`);

  const { data: tickets, error: tErr } = await supabase
    .from("tickets")
    .select("purchaser_name, purchaser_email")
    .eq("event_id", event.id)
    .eq("status", "active");

  if (tErr) {
    console.error("Ticket query failed:", tErr);
    process.exit(1);
  }

  if (!tickets || tickets.length === 0) {
    console.log("No active tickets found.");
    return;
  }

  // Dedupe by lowercased email — one person may have bought multiple tickets
  const byEmail = new Map<string, { name: string; email: string }>();
  for (const t of tickets) {
    if (!t.purchaser_email) continue;
    const key = t.purchaser_email.toLowerCase().trim();
    if (!byEmail.has(key)) {
      byEmail.set(key, { name: t.purchaser_name || "", email: t.purchaser_email });
    }
  }

  const recipients = Array.from(byEmail.values());
  console.log(`\n${tickets.length} active tickets across ${recipients.length} unique email addresses:\n`);
  for (const r of recipients) {
    console.log(`  - ${r.name} <${r.email}>`);
  }

  if (!send) {
    console.log(`\nDry run only. Pass --send to actually email these ${recipients.length} people.`);
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error("Missing RESEND_API_KEY in env");
    process.exit(1);
  }

  const resend = new Resend(resendKey);
  const html = buildEmailHtml();

  console.log(`\nSending to ${recipients.length} recipients...`);

  const batchSize = 50;
  let sent = 0;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    try {
      await resend.batch.send(
        batch.map((r) => ({
          from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
          to: r.email,
          subject: SUBJECT,
          html,
        }))
      );
      sent += batch.length;
      console.log(`  batch ${i / batchSize + 1}: sent ${batch.length}`);
    } catch (err) {
      console.error(`  batch ${i / batchSize + 1} FAILED:`, err);
    }
  }

  console.log(`\nDone. Sent ${sent}/${recipients.length} emails.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
