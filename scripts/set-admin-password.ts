/**
 * NAP — Set password for a member
 * Usage: source .env.local && npx tsx scripts/set-admin-password.ts email@example.com YourPassword123
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/set-admin-password.ts <email> <password>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  // Hash the password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Check if member exists
  const { data: member, error: findError } = await supabase
    .from("members")
    .select("id, email, full_name")
    .eq("email", email)
    .single();

  if (findError || !member) {
    console.error(`No member found with email: ${email}`);
    process.exit(1);
  }

  // Update password
  const { error: updateError } = await supabase
    .from("members")
    .update({ password_hash: passwordHash })
    .eq("id", member.id);

  if (updateError) {
    console.error("Failed to update password:", updateError.message);
    process.exit(1);
  }

  console.log(`\n✓ Password set for ${member.full_name} (${email})`);
  console.log("  You can now sign in at /login with email and password.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
