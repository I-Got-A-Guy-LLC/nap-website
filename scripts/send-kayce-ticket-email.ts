/**
 * Send ticket confirmation email to Kayce Broach (ticket already exists)
 * Run: RESEND_API_KEY=re_xxx npx tsx scripts/send-kayce-ticket-email.ts
 */
import { readFileSync } from "fs";
const envContent = readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
}

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!resendKey) {
  console.error("Missing RESEND_API_KEY. Pass it as: RESEND_API_KEY=re_xxx npx tsx scripts/send-kayce-ticket-email.ts");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendKey);

const EVENT_ID = "dd887bb2-7910-46b6-9cf9-277d2f180d98";
const EMAIL = "kkfitness@gmail.com";
const NAME = "Kayce Broach";

async function main() {
  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("title, event_date, start_time, end_time, location_name")
    .eq("id", EVENT_ID)
    .single();

  if (!event) { console.error("Event not found"); process.exit(1); }

  // Fetch existing ticket
  const { data: ticket } = await supabase
    .from("tickets")
    .select("ticket_code")
    .eq("event_id", EVENT_ID)
    .eq("purchaser_email", EMAIL)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!ticket) { console.error("Ticket not found"); process.exit(1); }

  const ticketCode = ticket.ticket_code;
  console.log(`Found ticket: ${ticketCode} for ${event.title}`);

  // Generate QR code
  const checkinUrl = `https://networkingforawesomepeople.com/checkin/${ticketCode}`;
  const qrBuffer = await QRCode.toBuffer(checkinUrl, { width: 300, margin: 2 });

  // Upload QR to Supabase storage
  const fileName = `qr-${ticketCode}.png`;
  await supabase.storage.from("ticket-qr-codes").upload(fileName, qrBuffer, { contentType: "image/png", upsert: true });
  const { data: urlData } = supabase.storage.from("ticket-qr-codes").getPublicUrl(fileName);
  const qrUrl = urlData?.publicUrl || "";

  const formattedDate = new Date(event.event_date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const qrImage = qrUrl
    ? `<img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block;margin:0 auto 16px;" />`
    : "";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background-color:#0a1628;padding:24px 32px;border-radius:12px 12px 0 0;text-align:center;">
          <h1 style="margin:0;color:#c8a951;font-size:20px;font-weight:700;">Networking For Awesome People</h1>
        </td></tr>
        <tr><td style="background-color:#ffffff;padding:32px;font-size:15px;line-height:1.6;color:#333333;">
          <h2 style="margin:0 0 16px;color:#0a1628;">Your Complimentary Ticket</h2>
          <p>Hi ${NAME},</p>
          <p>Thank you for your Supporting sponsorship! Here is your complimentary ticket for <strong>${event.title}</strong>.</p>
          <div style="background-color:#f8f9fa;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
            ${qrImage}
            <p style="font-size:24px;font-weight:700;color:#0a1628;letter-spacing:4px;margin:0 0 8px;">${ticketCode}</p>
            <p style="font-size:13px;color:#666;margin:0;">Show this QR code or ticket code at the door</p>
          </div>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${event.start_time || ""}${event.end_time ? ` - ${event.end_time}` : ""}</p>
          <p><strong>Location:</strong> ${event.location_name || ""}</p>
          <p><strong>Tickets:</strong> 1</p>
        </td></tr>
        <tr><td style="background-color:#0a1628;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center;">
          <p style="margin:0;color:#8899aa;font-size:12px;">&copy; Networking For Awesome People. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const { error: emailError } = await resend.emails.send({
    from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
    to: EMAIL,
    subject: `Your ticket for ${event.title}`,
    html,
  });

  if (emailError) {
    console.error("Email send error:", emailError);
    process.exit(1);
  }

  console.log(`Ticket confirmation email sent to ${EMAIL}`);
  console.log("Done!");
}

main().catch(console.error);
