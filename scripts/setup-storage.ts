/**
 * NAP — Create Supabase storage bucket for directory images
 * Usage: export $(grep -v '^#' .env.local | grep -v '^$' | xargs); npx tsx scripts/setup-storage.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data: existing } = await supabase.storage.getBucket("directory-images");

  if (existing) {
    console.log("✓ Bucket 'directory-images' already exists");
    return;
  }

  const { error } = await supabase.storage.createBucket("directory-images", {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  });

  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log("✓ Created bucket 'directory-images' (public, 5MB limit)");
}

main().catch(console.error);
