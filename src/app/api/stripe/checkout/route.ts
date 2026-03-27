import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { priceId, tier, billingInterval, email, name, city } =
      await request.json();

    if (!priceId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or retrieve Stripe customer by email
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

    // Create checkout session
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/join/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/join`,
      metadata: { tier, billingInterval, city, name },
      subscription_data: {
        metadata: { tier, city },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
