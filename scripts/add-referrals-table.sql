-- Create referrals table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES directory_listings(id) ON DELETE CASCADE,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referred_name TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  referred_phone TEXT,
  referred_business TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert referrals" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access referrals" ON referrals FOR ALL USING (true);
