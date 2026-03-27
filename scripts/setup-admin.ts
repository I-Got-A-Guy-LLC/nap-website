/**
 * NAP Directory — Set up Rachel's admin account
 * Usage: source .env.local && npx tsx scripts/setup-admin.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const email = "hello@networkingforawesomepeople.com";

  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("email", email)
    .single();

  const memberData = {
    email,
    full_name: "Rachel Albertson",
    tier: "amplified",
    is_leadership: true,
    leadership_city: "murfreesboro",
    is_nap_verified: true,
    business_name: "I Got A Guy, LLC",
    city: "murfreesboro",
  };

  if (existing) {
    const { error } = await supabase
      .from("members")
      .update(memberData)
      .eq("id", existing.id);

    if (error) {
      console.error("Failed to update:", error.message);
      process.exit(1);
    }
    console.log(`✓ Updated existing member: ${email} (ID: ${existing.id})`);
  } else {
    const { data, error } = await supabase
      .from("members")
      .insert(memberData)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create:", error.message);
      process.exit(1);
    }
    console.log(`✓ Created admin member: ${email} (ID: ${data.id})`);
  }

  console.log("\nRachel's account is ready:");
  console.log("  - Tier: Amplified");
  console.log("  - Leadership: true (Murfreesboro)");
  console.log("  - NAP Verified: true");
  console.log("  - Login via magic link at /login");
  console.log("  - Admin dashboard at /admin");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
