/**
 * Issue comp ticket for Kayce Broach (Supporting sponsor, Range Night)
 * Run: npx tsx scripts/issue-kayce-ticket.ts
 */
import { readFileSync } from "fs";
// Load .env.local manually
const envContent = readFileSync(".env.local", "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing env vars. Need SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!resendKey) {
  console.warn("RESEND_API_KEY not set — ticket will be created but email will not be sent");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = resendKey ? new Resend(resendKey) : null;

const EVENT_ID = "dd887bb2-7910-46b6-9cf9-277d2f180d98";
const NAME = "Kayce Broach";
const EMAIL = "kkfitness@gmail.com";

function generateTicketCode(): string {
  return Array.from(
    { length: 8 },
    () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]
  ).join("");
}

async function main() {
  // 1. Get event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("title, event_date, start_time, end_time, location_name")
    .eq("id", EVENT_ID)
    .single();

  if (eventError || !event) {
    console.error("Event not found:", eventError);
    process.exit(1);
  }
  console.log(`Event: ${event.title}`);

  // 2. Insert ticket
  const ticketCode = generateTicketCode();
  const { error: ticketError } = await supabase.from("tickets").insert({
    event_id: EVENT_ID,
    ticket_code: ticketCode,
    purchaser_name: NAME,
    purchaser_email: EMAIL,
    quantity: 1,
    amount_paid: 0,
    status: "active",
  });

  if (ticketError) {
    console.error("Ticket insert error:", ticketError);
    process.exit(1);
  }
  console.log(`Ticket created: ${ticketCode}`);

  // 3. Recount and update tickets_sold
  const { count: activeCount } = await supabase
    .from("tickets")
    .select("id", { count: "exact", head: true })
    .eq("event_id", EVENT_ID)
    .eq("status", "active");

  await supabase
    .from("events")
    .update({ tickets_sold: activeCount ?? 0 })
    .eq("id", EVENT_ID);

  console.log(`tickets_sold updated to ${activeCount}`);

  // 4. Generate QR code and upload to Supabase storage
  const checkinUrl = `https://networkingforawesomepeople.com/checkin/${ticketCode}`;
  const qrBuffer = await QRCode.toBuffer(checkinUrl, { width: 300, margin: 2 });

  const fileName = `qr-${ticketCode}.png`;
  const { error: uploadError } = await supabase.storage
    .from("ticket-qr-codes")
    .upload(fileName, qrBuffer, { contentType: "image/png", upsert: true });

  let qrUrl = "";
  if (uploadError) {
    console.warn("QR upload failed (will use inline):", uploadError.message);
  } else {
    const { data: urlData } = supabase.storage
      .from("ticket-qr-codes")
      .getPublicUrl(fileName);
    qrUrl = urlData?.publicUrl || "";
  }

  // 5. Send ticket confirmation email (skip if no Resend key)
  if (!resendKey) {
    console.log("Skipping email (no RESEND_API_KEY). Ticket created successfully.");
    console.log("Done!");
    return;
  }
  const formattedDate = new Date(event.event_date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const qrImage = qrUrl
    ? `<img src="${qrUrl}" alt="QR Code" width="200" height="200" style="display:block;margin:0 auto 16px;" />`
    : "";

  const html = `
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

  const { error: emailError } = await resend!.emails.send({
    from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
    to: EMAIL,
    subject: `Your ticket for ${event.title}`,
    html,
  });

  if (emailError) {
    console.error("Email send error:", emailError);
  } else {
    console.log(`Ticket confirmation email sent to ${EMAIL}`);
  }

  console.log("Done!");
}

main().catch(console.error);
