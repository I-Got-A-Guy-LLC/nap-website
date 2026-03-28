import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendConnectedWelcome,
  sendAmplifiedWelcome,
  sendCancellationConfirmed,
  sendReceipt,
  sendPaymentFailed,
  notifyPaymentFailed,
} from "@/lib/emails";

export const runtime = "nodejs";

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
        const metadata = session.metadata || {};

        // --- EVENT SPONSOR PAYMENT (Stripe checkout) ---
        if (metadata.type === "event_sponsor" && metadata.eventId) {
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
          }

          // Issue complimentary tickets for qualifying tiers
          const ticketCount = SPONSOR_TIER_TICKETS[tier] || 0;
          if (ticketCount > 0) {
            const sponsorEmail = metadata.email || customerEmail || "";
            const sponsorName = metadata.contactName || "";
            const tickets = Array.from({ length: ticketCount }, () => ({
              event_id: metadata.eventId,
              ticket_code: generateTicketCode(),
              purchaser_name: sponsorName,
              purchaser_email: sponsorEmail,
              quantity: 1,
              amount_paid: 0,
              status: "active",
            }));
            await supabase.from("tickets").insert(tickets);

            const { data: evt } = await supabase.from("events").select("tickets_sold").eq("id", metadata.eventId).single();
            if (evt) {
              await supabase.from("events").update({ tickets_sold: (evt.tickets_sold || 0) + ticketCount }).eq("id", metadata.eventId);
            }
          }

          // Notify admin
          await supabase.from("admin_notifications").insert({
            type: "sponsor_signup",
            message: `Sponsor paid (Stripe): ${metadata.businessName} (${tier}) — ${metadata.contactName} <${metadata.email || customerEmail}>`,
          }).then(() => {}, (err: any) => console.error("[webhook] Notification error:", err));

          console.log(`[webhook] Sponsor ${metadata.businessName} created as paid — ${ticketCount} comp tickets issued`);
          break;
        }

        // --- EVENT TICKET PURCHASE ---
        if (metadata.eventId) {
          const quantity = parseInt(metadata.quantity || "1");
          const eventId = metadata.eventId;

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

          // Increment tickets_sold
          const { data: evt } = await supabase.from("events").select("tickets_sold").eq("id", eventId).single();
          if (evt) {
            await supabase.from("events").update({ tickets_sold: (evt.tickets_sold || 0) + quantity }).eq("id", eventId);
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

        // Check if this is a sponsor invoice — issue comp tickets
        if (invoice.id) {
          const { data: sponsor } = await supabase
            .from("event_sponsors")
            .select("id, event_id, sponsor_name, sponsor_email, tier")
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

              const { data: evt } = await supabase.from("events").select("tickets_sold").eq("id", sponsor.event_id).single();
              if (evt) {
                await supabase.from("events").update({ tickets_sold: (evt.tickets_sold || 0) + ticketCount }).eq("id", sponsor.event_id);
              }
            }
            console.log(`[webhook] Sponsor ${sponsor.sponsor_name} paid — ${ticketCount} comp tickets issued`);
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
