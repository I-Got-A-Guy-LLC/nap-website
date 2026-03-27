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
        const { tier, city, name, billingInterval } = session.metadata || {};
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        // Upsert member record
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

        // Create blank directory listing
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

        // Send welcome email based on tier
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
