/**
 * NAP — Create Stripe product and price for Range Night tickets
 * Usage: export $(grep -v '^#' .env.local | grep -v '^$' | xargs); npx tsx scripts/setup-range-night-stripe.ts
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  const product = await stripe.products.create({
    name: "Range Night 2026 — NAP Special Event Ticket",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1500, // $15.00
    currency: "usd",
  });

  console.log("\n=== Range Night Stripe Setup ===");
  console.log(`Product ID: ${product.id}`);
  console.log(`Price ID:   ${price.id}`);
  console.log("\nAdd to Vercel as: STRIPE_PRICE_RANGE_NIGHT_TICKET");
}

main().catch((err) => { console.error(err); process.exit(1); });
