-- Add slug column to directory_listings
-- Run this in the Supabase SQL Editor

ALTER TABLE directory_listings ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on state + slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_state_slug
  ON directory_listings(listing_state, slug)
  WHERE slug IS NOT NULL;
