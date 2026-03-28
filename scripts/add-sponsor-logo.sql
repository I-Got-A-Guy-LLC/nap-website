-- Add logo_url and website_url to event_sponsors
-- Run this in the Supabase SQL Editor

ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS website_url TEXT;

UPDATE event_sponsors
SET website_url = 'https://connell.legal'
WHERE sponsor_business = 'Connell Law, PLC';
