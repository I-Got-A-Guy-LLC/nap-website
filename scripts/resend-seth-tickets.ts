/**
 * One-time script: Resend comp ticket email to Seth (seth@connell.legal)
 *
 * Usage: npx tsx scripts/resend-seth-tickets.ts
 *
 * Requires RESEND_API_KEY and NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * in .env or .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import QRCode from "qrcode";

const SETH_EMAIL = "seth@connell.legal";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  // Find Seth's tickets
  const { data: tickets, error: ticketErr } = await supabase
    .from("tickets")
    .select("ticket_code, event_id")
    .eq("purchaser_email", SETH_EMAIL)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (ticketErr || !tickets || tickets.length === 0) {
    console.error("No tickets found for", SETH_EMAIL, ticketErr);
    process.exit(1);
  }

  console.log(`Found ${tickets.length} tickets for ${SETH_EMAIL}:`, tickets.map((t) => t.ticket_code));

  const eventId = tickets[0].event_id;
  const ticketCodes = tickets.map((t) => t.ticket_code);

  // Fetch event details
  const { data: evt, error: evtErr } = await supabase
    .from("events")
    .select("title, event_date, start_time, end_time, location_name, location_address")
    .eq("id", eventId)
    .single();

  if (evtErr || !evt) {
    console.error("Event not found:", eventId, evtErr);
    process.exit(1);
  }

  console.log("Event:", evt.title, "on", evt.event_date);

  const formattedDate = new Date(evt.event_date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Generate QR codes
  let qrHtml = "";
  for (const code of ticketCodes) {
    try {
      const checkinUrl = `https://networkingforawesomepeople.com/admin/events/${eventId}/checkin?code=${code}`;
      const qrBuffer = await QRCode.toBuffer(checkinUrl, { width: 200, margin: 2, type: "png" });
      const fileName = `tickets/qr-${code}.png`;
      await supabase.storage.from("directory-images").upload(fileName, qrBuffer, {
        contentType: "image/png", upsert: true,
      });
      const { data: { publicUrl } } = supabase.storage.from("directory-images").getPublicUrl(fileName);
      qrHtml += `
        <div style="text-align:center;margin:16px 0;display:inline-block;width:48%;">
          <p style="font-family:monospace;font-size:18px;font-weight:bold;margin:0 0 8px;color:#1F3149;">${code}</p>
          <img src="${publicUrl}" alt="QR Code for ${code}" width="160" height="160" style="display:inline-block;" />
        </div>
      `;
      console.log(`QR uploaded for ${code}:`, publicUrl);
    } catch (err) {
      console.error(`QR generation failed for ${code}:`, err);
      qrHtml += `
        <div style="text-align:center;margin:16px 0;display:inline-block;width:48%;">
          <p style="font-family:monospace;font-size:18px;font-weight:bold;margin:0;color:#1F3149;">${code}</p>
        </div>
      `;
    }
  }

  const ticketCodesHtml = ticketCodes.map((code) =>
    `<span style="font-family:monospace;font-size:24px;font-weight:bold;letter-spacing:3px;color:#1F3149;">${code}</span>`
  ).join("<br/>");

  // Send the email
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error: sendErr } = await resend.emails.send({
    from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
    to: SETH_EMAIL,
    subject: `🎟️ Your Complimentary Tickets — ${evt.title}`,
    html: `
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
            <h2 style="margin:0 0 16px;color:#0a1628;">Your Complimentary Tickets 🎉</h2>
            <p>Hey Seth,</p>
            <p>Thank you for sponsoring <strong>${evt.title}</strong>! Here are your <strong>${ticketCodes.length} complimentary tickets</strong>:</p>

            <div style="background:#1F3149;color:white;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="color:#FBC761;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your Ticket Codes</p>
              ${ticketCodesHtml}
            </div>

            <div style="text-align:center;margin:24px 0;">
              ${qrHtml}
            </div>

            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#666;font-size:14px;width:100px;">Event:</td><td style="padding:8px 0;font-weight:bold;">${evt.title}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Date:</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Time:</td><td style="padding:8px 0;font-weight:bold;">${evt.start_time} – ${evt.end_time}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Location:</td><td style="padding:8px 0;font-weight:bold;">${evt.location_name}${evt.location_address ? "<br/>" + evt.location_address : ""}</td></tr>
            </table>

            <div style="background:#FBC761;border-radius:12px;padding:16px 24px;margin:24px 0;text-align:center;">
              <p style="margin:0;font-weight:bold;color:#1F3149;">Show this email or your QR code at the door</p>
            </div>

            <p style="color:#666;font-size:14px;">Questions? Reply to this email or contact us at hello@networkingforawesomepeople.com.</p>
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
</html>`,
  });

  if (sendErr) {
    console.error("Email send failed:", sendErr);
    process.exit(1);
  }

  console.log(`\nDone! Comp ticket email sent to ${SETH_EMAIL} with codes: ${ticketCodes.join(", ")}`);
}

main();
