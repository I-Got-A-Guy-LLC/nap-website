-- Add structured coupon/special offer fields to directory_listings
-- Run this in the Supabase SQL Editor

ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS offer_headline TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS offer_details TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS offer_promo_code TEXT;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS offer_expires_at DATE;
ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS offer_nap_only BOOLEAN DEFAULT false;
