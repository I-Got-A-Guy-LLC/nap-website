-- Add submitter columns to events table
-- Run this in the Supabase SQL Editor

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS submitter_name TEXT,
  ADD COLUMN IF NOT EXISTS submitter_email TEXT,
  ADD COLUMN IF NOT EXISTS submitter_phone TEXT;
