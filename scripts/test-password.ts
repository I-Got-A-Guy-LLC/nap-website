/**
 * Test password verification against Supabase
 * Usage: source .env.local && npx tsx scripts/test-password.ts email@example.com YourPassword
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/test-password.ts <email> <password>");
    process.exit(1);
  }

  console.log("Testing login for:", email);

  const { data: member, error } = await supabase
    .from("members")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error) {
    console.error("Supabase error:", error.message, error.code);
    process.exit(1);
  }

  if (!member) {
    console.error("No member found with email:", email);
    process.exit(1);
  }

  console.log("Member found:", member.id, member.full_name);
  console.log("Has password_hash:", !!member.password_hash);

  if (!member.password_hash) {
    console.error("No password_hash set. Run set-admin-password.ts first.");
    process.exit(1);
  }

  console.log("Hash (first 20 chars):", member.password_hash.substring(0, 20));
  console.log("Hash length:", member.password_hash.length);

  const valid = await bcrypt.compare(password, member.password_hash);
  console.log("bcrypt.compare result:", valid);

  if (valid) {
    console.log("\n✓ Password is CORRECT — login should work");
  } else {
    console.log("\n✗ Password is WRONG — hash does not match");
    console.log("Try resetting with: npx tsx scripts/set-admin-password.ts", email, "<new-password>");
  }
}

main().catch(console.error);
