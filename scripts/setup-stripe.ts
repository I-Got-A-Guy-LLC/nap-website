/**
 * NAP Directory — Create Stripe Products & Prices
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

async function main() {
  // ── Connected tier ────────────────────────────────────────
  const connectedProduct = await stripe.products.create({
    name: "NAP Directory — Connected",
  });

  const connectedYearly = await stripe.prices.create({
    product: connectedProduct.id,
    unit_amount: 30000, // $300.00
    currency: "usd",
    recurring: { interval: "year" },
    nickname: "Connected — Yearly",
  });

  const connectedMonthly = await stripe.prices.create({
    product: connectedProduct.id,
    unit_amount: 3000, // $30.00
    currency: "usd",
    recurring: { interval: "month" },
    nickname: "Connected — Monthly",
  });

  // ── Amplified tier ────────────────────────────────────────
  const amplifiedProduct = await stripe.products.create({
    name: "NAP Directory — Amplified",
  });

  const amplifiedYearly = await stripe.prices.create({
    product: amplifiedProduct.id,
    unit_amount: 50000, // $500.00
    currency: "usd",
    recurring: { interval: "year" },
    nickname: "Amplified — Yearly",
  });

  const amplifiedMonthly = await stripe.prices.create({
    product: amplifiedProduct.id,
    unit_amount: 5000, // $50.00
    currency: "usd",
    recurring: { interval: "month" },
    nickname: "Amplified — Monthly",
  });

  // ── Print results ─────────────────────────────────────────
  console.log("\n=== Stripe Price IDs ===\n");
  console.log(`Connected  — Yearly  ($300/yr):  ${connectedYearly.id}`);
  console.log(`Connected  — Monthly ($30/mo):   ${connectedMonthly.id}`);
  console.log(`Amplified  — Yearly  ($500/yr):  ${amplifiedYearly.id}`);
  console.log(`Amplified  — Monthly ($50/mo):   ${amplifiedMonthly.id}`);
  console.log(
    "\nAdd these to your .env as NEXT_PUBLIC_STRIPE_PRICE_CONNECTED_YEARLY, etc.\n"
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
