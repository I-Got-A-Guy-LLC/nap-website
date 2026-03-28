-- Add included_items column to events table
-- Run this in the Supabase SQL Editor

ALTER TABLE events ADD COLUMN IF NOT EXISTS included_items JSONB;

UPDATE events
SET included_items = '["Range time and a personal target", "Mix and mingle time with fellow professionals", "Come for the networking, stay for the fun"]'::jsonb
WHERE slug = 'range-night-2026';
