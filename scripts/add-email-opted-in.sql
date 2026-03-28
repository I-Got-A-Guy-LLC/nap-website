-- Add email_opted_in field to members table
-- Run this in the Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS email_opted_in BOOLEAN DEFAULT false;
