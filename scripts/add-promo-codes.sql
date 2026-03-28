-- Event promo codes table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS event_promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_code_event ON event_promo_codes(event_id, UPPER(code));

ALTER TABLE event_promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access promo_codes" ON event_promo_codes FOR ALL USING (true);
