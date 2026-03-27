-- Add comped member fields to members table
-- Run this in the Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS is_comped BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS comp_reason TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS comp_expires_at TIMESTAMPTZ;

-- Set existing leadership as comped
UPDATE members
SET is_comped = true, comp_reason = 'Leadership'
WHERE is_leadership = true;
