import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { priceId, tier, billingInterval, email, name, city, couponCode } =
      await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Build checkout session options
    const sessionParams: Record<string, unknown> = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/join/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/join`,
      metadata: { tier, billingInterval, city, name },
      subscription_data: {
        metadata: { tier, city },
      },
      allow_promotion_codes: !couponCode, // Allow Stripe's built-in promo if no code passed
    };

    // If email provided, find or create customer
    if (email) {
      const existingCustomers = await stripe().customers.list({
        email,
        limit: 1,
      });

      let customer;
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe().customers.create({
          email,
          name,
          metadata: { city },
        });
      }
      sessionParams.customer = customer.id;
    } else {
      // No email  -  let Stripe collect it
      sessionParams.customer_creation = "always";
      sessionParams.customer_email = undefined;
    }

    // Apply coupon code if provided
    if (couponCode) {
      sessionParams.discounts = [{ coupon: couponCode }];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe().checkout.sessions.create(sessionParams as any);

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
