-- NAP Directory — Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- ============================================================
-- 2. MEMBERS
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  business_name TEXT,
  city TEXT,
  tier TEXT NOT NULL DEFAULT 'linked',
  is_leadership BOOLEAN NOT NULL DEFAULT false,
  leadership_city TEXT,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  billing_interval TEXT,
  current_period_end TIMESTAMPTZ,
  is_nap_verified BOOLEAN NOT NULL DEFAULT false,
  linked_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_stripe_customer ON members(stripe_customer_id);

-- ============================================================
-- 3. DIRECTORY LISTINGS
-- ============================================================
CREATE TABLE directory_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  logo_url TEXT,
  photos TEXT[],
  video_url TEXT,
  business_hours JSONB,
  address TEXT,
  city TEXT,
  state TEXT NOT NULL DEFAULT 'TN',
  zip TEXT,
  lat DECIMAL,
  lng DECIMAL,
  special_offers TEXT,
  referral_form_url TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  primary_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  additional_category_ids UUID[],
  tags TEXT[],
  other_category_suggestion TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  views_this_month INTEGER NOT NULL DEFAULT 0,
  views_all_time INTEGER NOT NULL DEFAULT 0,
  website_clicks_this_month INTEGER NOT NULL DEFAULT 0,
  website_clicks_all_time INTEGER NOT NULL DEFAULT 0,
  show_analytics BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_listings_member ON directory_listings(member_id);
CREATE INDEX idx_listings_category ON directory_listings(primary_category_id);
CREATE INDEX idx_listings_city ON directory_listings(city);
CREATE INDEX idx_listings_approved ON directory_listings(is_approved, is_active);

-- ============================================================
-- 4. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES directory_listings(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);

-- ============================================================
-- 5. CATEGORY SUGGESTIONS
-- ============================================================
CREATE TABLE category_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  suggested_name TEXT NOT NULL,
  suggested_parent TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. ADMIN NOTIFICATIONS
-- ============================================================
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_notifications_unread ON admin_notifications(is_read) WHERE is_read = false;

-- ============================================================
-- 7. SLUG GENERATION FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(trim(input), '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 8. FULL-TEXT SEARCH INDEX ON DIRECTORY LISTINGS
-- ============================================================
ALTER TABLE directory_listings
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(business_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(city, '')), 'B')
  ) STORED;

CREATE INDEX idx_listings_search ON directory_listings USING GIN(search_vector);

-- ============================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================

-- Members RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read own data"
  ON members FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Members can update own data"
  ON members FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Directory Listings RLS
ALTER TABLE directory_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read approved active listings"
  ON directory_listings FOR SELECT
  USING (is_approved = true AND is_active = true);

CREATE POLICY "Members can read own listings"
  ON directory_listings FOR SELECT
  USING (auth.uid()::text = member_id::text);

CREATE POLICY "Members can update own listings"
  ON directory_listings FOR UPDATE
  USING (auth.uid()::text = member_id::text)
  WITH CHECK (auth.uid()::text = member_id::text);

CREATE POLICY "Members can insert own listings"
  ON directory_listings FOR INSERT
  WITH CHECK (auth.uid()::text = member_id::text);

-- Reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 10. UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_listings_updated_at
  BEFORE UPDATE ON directory_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
