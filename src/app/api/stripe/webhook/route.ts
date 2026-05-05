import { NextResponse } from "next/server";
import { Resend } from "resend";
import QRCode from "qrcode";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendConnectedWelcome,
  sendAmplifiedWelcome,
  sendCancellationConfirmed,
  sendReceipt,
  sendPaymentFailed,
  notifyPaymentFailed,
  sendSponsorConfirmation,
  sendTicketConfirmation,
  notifySponsorPayment,
  notifyTicketSale,
} from "@/lib/emails";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Sponsor comp ticket email (all codes + QR codes in one email)
// ---------------------------------------------------------------------------

async function sendSponsorCompTickets(
  email: string,
  name: string,
  ticketCodes: string[],
  eventTitle: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  locationName: string,
  locationAddress: string,
  eventId: string,
) {
  const formattedDate = new Date(eventDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // Generate QR codes for each ticket
  const supabase = getSupabaseAdmin();
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
    } catch (err) {
      console.log(`[webhook] QR generation failed for ${code}:`, err);
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

  const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  await resend.emails.send({
    from: "Networking For Awesome People <members@networkingforawesomepeople.com>",
    to: email,
    subject: `🎟️ Your Complimentary Tickets — ${eventTitle}`,
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
            <p>Hey ${name},</p>
            <p>Thank you for sponsoring <strong>${eventTitle}</strong>! Here are your <strong>${ticketCodes.length} complimentary tickets</strong>:</p>

            <div style="background:#1F3149;color:white;border-radius:12px;padding:24px;text-align:center;margin:24px 0;">
              <p style="color:#FBC761;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your Ticket Codes</p>
              ${ticketCodesHtml}
            </div>

            <div style="text-align:center;margin:24px 0;">
              ${qrHtml}
            </div>

            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#666;font-size:14px;width:100px;">Event:</td><td style="padding:8px 0;font-weight:bold;">${eventTitle}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Date:</td><td style="padding:8px 0;font-weight:bold;">${formattedDate}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Time:</td><td style="padding:8px 0;font-weight:bold;">${startTime} – ${endTime}</td></tr>
              <tr><td style="padding:8px 0;color:#666;font-size:14px;">Location:</td><td style="padding:8px 0;font-weight:bold;">${locationName}${locationAddress ? "<br/>" + locationAddress : ""}</td></tr>
            </table>

            <div style="background:#FBC761;border-radius:12px;padding:16px 24px;margin:24px 0;text-align:center;">
              <p style="margin:0;font-weight:bold;color:#1F3149;">Show this email or your QR code at the door</p>
            </div>

            <p style="color:#666;font-size:14px;">Questions? Reply to this email or contact us at the link below.</p>
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

  console.log(`[webhook] Sponsor comp ticket email sent to ${email} with ${ticketCodes.length} codes`);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail =
          session.customer_details?.email || session.customer_email;
        let metadata = session.metadata || {};

        // If metadata is empty, retrieve the full session from Stripe
        // (some webhook payloads don't include metadata)
        if (!metadata.type && session.id) {
          try {
            const fullSession = await stripe().checkout.sessions.retrieve(session.id);
            metadata = fullSession.metadata || {};
            console.log("[webhook] Retrieved session metadata:", JSON.stringify(metadata));
          } catch (retrieveErr: any) {
            console.error("[webhook] Failed to retrieve session:", retrieveErr.message);
          }
        }

        console.log("[webhook] checkout.session.completed:", session.id, "metadata.type:", metadata.type, "metadata.eventId:", metadata.eventId);

        // --- EVENT SPONSOR PAYMENT (Stripe checkout) ---
        if (metadata.type === "event_sponsor" && metadata.eventId) {
          // Idempotency: skip if sponsor already exists for this session
          const { data: existingSponsor } = await supabase
            .from("event_sponsors")
            .select("id")
            .eq("stripe_session_id", session.id)
            .limit(1);

          if (existingSponsor && existingSponsor.length > 0) {
            console.log(`[webhook] Sponsor already exists for session ${session.id} - skipping`);
            break;
          }

          const { SPONSOR_TIER_TICKETS, generateTicketCode } = await import("@/lib/events");
          const tier = metadata.tier || "";
          const amount = (session.amount_total || 0) / 100;

          // Create the sponsor record now that payment succeeded
          const { error: sponsorInsertError } = await supabase
            .from("event_sponsors")
            .insert({
              event_id: metadata.eventId,
              sponsor_name: metadata.contactName || "",
              sponsor_email: metadata.email || customerEmail || "",
              sponsor_phone: metadata.phone || null,
              sponsor_business: metadata.businessName || "",
              tier,
              amount,
              notes: metadata.notes || null,
              payment_method: "stripe",
              payment_status: "paid",
              paid_at: new Date().toISOString(),
              stripe_session_id: session.id,
            });

          if (sponsorInsertError) {
            console.error("[webhook] Sponsor insert error:", sponsorInsertError);
            break;
          }

          const ticketCount = SPONSOR_TIER_TICKETS[tier] || 0;
          const sEmail = metadata.email || customerEmail || "";
          const sName = metadata.contactName || "";
          let compTickets: { ticket_code: string }[] = [];

          // Issue complimentary tickets (wrapped so it can't crash the handler)
          try {
            if (ticketCount > 0) {
              compTickets = Array.from({ length: ticketCount }, () => ({
                event_id: metadata.eventId,
                ticket_code: generateTicketCode(),
                purchaser_name: sName,
                purchaser_email: sEmail,
                quantity: 1,
                amount_paid: 0,
                status: "active",
              }));
              await supabase.from("tickets").insert(compTickets);

              const { count: activeCount } = await supabase
                .from("tickets")
                .select("id", { count: "exact", head: true })
                .eq("event_id", metadata.eventId)
                .eq("status", "active");
              await supabase.from("events").update({ tickets_sold: activeCount ?? 0 }).eq("id", metadata.eventId);
            }
          } catch (ticketErr: any) {
            console.error("[webhook] Comp ticket error (sponsor still created):", ticketErr.message);
          }

          // Send emails (wrapped so they can't crash the handler)
          try {
            const { data: evtDetails } = await supabase
              .from("events")
              .select("title, event_date, location_name, location_address, start_time, end_time")
              .eq("id", metadata.eventId)
              .single();

            if (evtDetails && sEmail) {
              await sendSponsorConfirmation(
                sEmail, sName, metadata.businessName || "", tier,
                evtDetails.title, evtDetails.event_date || "",
                evtDetails.location_name || "", ticketCount
              ).catch((err: any) => console.error("[webhook] Sponsor email error:", err));

              if (ticketCount > 0 && compTickets.length > 0) {
                await sendSponsorCompTickets(
                  sEmail, sName,
                  compTickets.map((t) => t.ticket_code),
                  evtDetails.title,
                  evtDetails.event_date || "", evtDetails.start_time || "",
                  evtDetails.end_time || "", evtDetails.location_name || "",
                  evtDetails.location_address || "",
                  metadata.eventId
                ).catch((err: any) => console.error("[webhook] Sponsor comp ticket email error:", err));
              }

              // Notify admin via email
              await notifySponsorPayment(
                sName, metadata.businessName || "", tier, amount,
                evtDetails.title, metadata.eventId
              ).catch((err: any) => console.error("[webhook] Admin sponsor email error:", err));
            }
          } catch (emailErr: any) {
            console.error("[webhook] Email send error (sponsor still created):", emailErr.message);
          }

          // Notify admin in dashboard
          await supabase.from("admin_notifications").insert({
            type: "sponsor_signup",
            message: `Sponsor paid (Stripe): ${metadata.businessName} (${tier})  -  ${metadata.contactName} <${metadata.email || customerEmail}>`,
          }).then(() => {}, (err: any) => console.error("[webhook] Notification error:", err));

          console.log(`[webhook] Sponsor ${metadata.businessName} created as paid  -  ${ticketCount} comp tickets issued`);
          break;
        }

        // --- EVENT TICKET PURCHASE ---
        if (metadata.eventId) {
          const quantity = parseInt(metadata.quantity || "1");
          const eventId = metadata.eventId;

          // Idempotency: skip if tickets already exist for this session
          const { data: existingTickets } = await supabase
            .from("tickets")
            .select("id")
            .eq("stripe_session_id", session.id)
            .limit(1);

          if (existingTickets && existingTickets.length > 0) {
            console.log(`[webhook] Tickets already exist for session ${session.id} - skipping`);
            break;
          }

          // Generate ticket codes
          const tickets = [];
          for (let i = 0; i < quantity; i++) {
            const code = Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
            tickets.push({
              event_id: eventId,
              ticket_code: code,
              purchaser_name: session.customer_details?.name || customerEmail || "",
              purchaser_email: customerEmail || "",
              quantity: 1,
              amount_paid: (session.amount_total || 0) / 100 / quantity,
              stripe_session_id: session.id,
              status: "active",
            });
          }

          const { error: ticketError } = await supabase.from("tickets").insert(tickets);
          if (ticketError) console.error("Error creating tickets:", ticketError);

          // Increment tickets_sold — count actual ticket rows for accuracy
          const { count: ticketCount } = await supabase
            .from("tickets")
            .select("id", { count: "exact", head: true })
            .eq("event_id", eventId)
            .eq("status", "active");

          const { error: updateError } = await supabase
            .from("events")
            .update({ tickets_sold: ticketCount ?? 0 })
            .eq("id", eventId);

          if (updateError) {
            console.error(`[webhook] Failed to update tickets_sold for event ${eventId}:`, updateError);
          } else {
            console.log(`[webhook] Updated tickets_sold to ${ticketCount} for event ${eventId}`);
          }

          // Send ticket confirmation email
          const { data: evt } = await supabase.from("events").select("title, event_date, start_time, end_time, location_name, location_address").eq("id", eventId).single();
          if (customerEmail && tickets.length > 0 && evt) {
            await sendTicketConfirmation(
              customerEmail,
              session.customer_details?.name || customerEmail.split("@")[0],
              evt.title,
              evt.event_date || "",
              evt.start_time || "",
              evt.end_time || "",
              evt.location_name || "",
              tickets[0].ticket_code,
              quantity,
              evt.location_address || "",
              eventId
            ).catch((err: any) => console.error("[webhook] Ticket email error:", err));
            // Notify Rachel of the sale
            try {
              await notifyTicketSale(
                session.customer_details?.name || customerEmail?.split("@")[0] || "Unknown",
                customerEmail || "",
                quantity,
                tickets.map((t) => t.ticket_code),
                (session.amount_total || 0) / 100,
                evt.title,
                eventId,
              );
            } catch (notifyErr: any) {
              console.error("[webhook] Ticket sale notification error:", notifyErr.message);
            }
          } else if (!evt) {
            console.error(`[webhook] Could not fetch event ${eventId} for confirmation email`);
          }

          console.log(`[webhook] Created ${quantity} tickets for event ${eventId}`);
          break;
        }

        // --- MEMBERSHIP PURCHASE ---
        const { tier, city, name, billingInterval } = metadata;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        const { data: member, error: memberError } = await supabase
          .from("members")
          .upsert(
            {
              email: customerEmail,
              full_name: name,
              city,
              tier,
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              subscription_status: "active",
              billing_interval: billingInterval,
              is_approved: true,
            },
            { onConflict: "email" }
          )
          .select()
          .single();

        if (memberError) {
          console.error("Error upserting member:", memberError);
        }

        const isPaidTier = tier === "connected" || tier === "amplified";
        const { error: listingError } = await supabase
          .from("directory_listings")
          .insert({
            member_id: member?.id,
            business_name: name,
            contact_name: name,
            contact_email: customerEmail,
            city,
            is_approved: isPaidTier,
          });

        if (listingError) {
          console.error("Error creating directory listing:", listingError);
        }

        if (customerEmail) {
          if (tier === "connected") {
            await sendConnectedWelcome(customerEmail, name || "");
          } else if (tier === "amplified") {
            await sendAmplifiedWelcome(customerEmail, name || "");
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const { tier } = subscription.metadata || {};

        const { error } = await supabase
          .from("members")
          .update({
            tier,
            subscription_status: subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const { data: member } = await supabase
          .from("members")
          .select("email, full_name")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        const { error } = await supabase
          .from("members")
          .update({
            tier: "linked",
            subscription_status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error downgrading subscription:", error);
        }

        if (member?.email) {
          await sendCancellationConfirmed(
            member.email,
            member.full_name || ""
          );
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;
        const amount = (invoice.amount_paid / 100).toFixed(2);
        const date = new Date().toLocaleDateString("en-US");

        if (customerEmail) {
          await sendReceipt(customerEmail, customerEmail.split("@")[0], `$${amount}`, date);
        }

        // Check if this is a sponsor invoice  -  issue comp tickets
        if (invoice.id) {
          const { data: sponsor } = await supabase
            .from("event_sponsors")
            .select("id, event_id, sponsor_name, sponsor_email, sponsor_business, tier")
            .eq("stripe_invoice_id", invoice.id)
            .maybeSingle();

          if (sponsor) {
            const { SPONSOR_TIER_TICKETS, generateTicketCode } = await import("@/lib/events");
            const ticketCount = SPONSOR_TIER_TICKETS[sponsor.tier] || 0;

            await supabase.from("event_sponsors").update({
              payment_status: "paid",
              paid_at: new Date().toISOString(),
            }).eq("id", sponsor.id);

            if (ticketCount > 0) {
              const tickets = Array.from({ length: ticketCount }, () => ({
                event_id: sponsor.event_id,
                ticket_code: generateTicketCode(),
                purchaser_name: sponsor.sponsor_name,
                purchaser_email: sponsor.sponsor_email,
                quantity: 1,
                amount_paid: 0,
                status: "active",
              }));
              await supabase.from("tickets").insert(tickets);

              const { count: activeCount } = await supabase
                .from("tickets")
                .select("id", { count: "exact", head: true })
                .eq("event_id", sponsor.event_id)
                .eq("status", "active");
              await supabase.from("events").update({ tickets_sold: activeCount ?? 0 }).eq("id", sponsor.event_id);
            }
            // Notify admin via email
            try {
              const { data: evtForNotify } = await supabase
                .from("events")
                .select("title")
                .eq("id", sponsor.event_id)
                .single();
              if (evtForNotify) {
                await notifySponsorPayment(
                  sponsor.sponsor_name,
                  sponsor.sponsor_business || "",
                  sponsor.tier,
                  (invoice.amount_paid || 0) / 100,
                  evtForNotify.title,
                  sponsor.event_id
                );
              }
            } catch (notifyErr: any) {
              console.error("[webhook] Admin sponsor email error:", notifyErr.message);
            }

            console.log(`[webhook] Sponsor ${sponsor.sponsor_name} paid  -  ${ticketCount} comp tickets issued`);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerEmail = invoice.customer_email;

        if (customerEmail) {
          const memberName = customerEmail.split("@")[0];
          await sendPaymentFailed(customerEmail, memberName);
          await notifyPaymentFailed(memberName, "payment");
        }

        break;
      }
    }
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
