-- Events system tables
-- Run this in the Supabase SQL Editor

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'special',
  status TEXT NOT NULL DEFAULT 'draft',
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location_name TEXT,
  location_address TEXT,
  city TEXT,
  state TEXT DEFAULT 'TN',
  capacity INTEGER,
  tickets_sold INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  ticket_price DECIMAL(10,2),
  image_url TEXT,
  created_by UUID REFERENCES members(id),
  requires_approval BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL,
  purchaser_name TEXT NOT NULL,
  purchaser_email TEXT NOT NULL,
  purchaser_phone TEXT,
  quantity INTEGER DEFAULT 1,
  amount_paid DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'active',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event sponsors table
CREATE TABLE IF NOT EXISTS event_sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_email TEXT NOT NULL,
  sponsor_phone TEXT,
  sponsor_business TEXT,
  tier TEXT NOT NULL,
  amount DECIMAL(10,2),
  payment_method TEXT DEFAULT 'invoice',
  stripe_invoice_id TEXT,
  stripe_payment_link TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published events" ON events FOR SELECT USING (status = 'published' OR status = 'sold_out');
CREATE POLICY "Service role full access events" ON events FOR ALL USING (true);
CREATE POLICY "Service role full access tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Service role full access sponsors" ON event_sponsors FOR ALL USING (true);

-- Seed Range Night event
INSERT INTO events (
  title, slug, description, event_type, status,
  event_date, start_time, end_time,
  location_name, location_address, city, state,
  capacity, ticket_price, is_free
) VALUES (
  'Range Night',
  'range-night-2026',
  'Join Networking For Awesome People for an exciting evening at the range! Your ticket includes range time, a target, and mix and mingle time with fellow professionals. Come for the networking, stay for the fun.',
  'special',
  'published',
  '2026-04-20',
  '5:30 PM',
  '7:30 PM',
  'The Range',
  'TBD',
  'Murfreesboro',
  'TN',
  30,
  15.00,
  false
) ON CONFLICT (slug) DO NOTHING;

-- Seed Connell Law as Presenting Sponsor
INSERT INTO event_sponsors (
  event_id, sponsor_name, sponsor_email, sponsor_business,
  tier, amount, payment_method, payment_status
)
SELECT id, 'Connell Law', 'contact@connelllaw.com', 'Connell Law, PLC',
  'presenting', 500.00, 'invoice', 'pending'
FROM events WHERE slug = 'range-night-2026'
ON CONFLICT DO NOTHING;
