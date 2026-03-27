-- Add password column to members table
-- Run this in the Supabase SQL Editor
ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT;
