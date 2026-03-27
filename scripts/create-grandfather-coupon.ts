/**
 * NAP — Create Stripe coupons for grandfathered and leadership members
 * Usage: export $(grep -v '^#' .env.local | grep -v '^$' | xargs); npx tsx scripts/create-grandfather-coupon.ts
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function main() {
  // FOUNDING2024 — 100% off for 12 months, once per customer
  const founding = await stripe.coupons.create({
    id: "FOUNDING2024",
    percent_off: 100,
    duration: "repeating",
    duration_in_months: 12,
    max_redemptions: 50,
    name: "Founding Member — 1 Year Free",
  });
  console.log(`✓ Created coupon: ${founding.id} — 100% off for 12 months`);

  // LEADERSHIP — 100% off forever
  const leadership = await stripe.coupons.create({
    id: "LEADERSHIP",
    percent_off: 100,
    duration: "forever",
    name: "Leadership — Always Free",
  });
  console.log(`✓ Created coupon: ${leadership.id} — 100% off forever`);

  console.log("\n=== Coupon Codes ===");
  console.log("FOUNDING2024 — Share with existing paid members (1 free year)");
  console.log("LEADERSHIP   — For leadership members using Stripe checkout");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
