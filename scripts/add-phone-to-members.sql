-- Add phone column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS phone TEXT;
