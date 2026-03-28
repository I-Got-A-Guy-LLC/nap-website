-- Add unsubscribe fields to members table
-- Run this in the Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS email_unsubscribed BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT;

-- Generate tokens for all existing members
UPDATE members SET unsubscribe_token = encode(gen_random_bytes(16), 'hex') WHERE unsubscribe_token IS NULL;
