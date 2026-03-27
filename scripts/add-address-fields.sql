-- Add structured address fields to directory_listings
-- Run this in the Supabase SQL Editor

ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS suite TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS listing_city TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS listing_state TEXT DEFAULT 'TN';
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS zip_code TEXT;
