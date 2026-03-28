-- Broadcasts table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'General Announcement',
    'Event Reminder',
    'New Member Welcome',
    'City Update',
    'Business Spotlight',
    'Action Required'
  )),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all',
  active_only BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  recipient_count INTEGER
);

-- RLS
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to broadcasts"
  ON broadcasts FOR ALL
  USING (true)
  WITH CHECK (true);
