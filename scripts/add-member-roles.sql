-- Add role field to members table
-- Run this in the Supabase SQL Editor

ALTER TABLE members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
-- Roles: 'super_admin', 'city_leader', 'licensee', 'member'

-- Set Rachel as super_admin
UPDATE members SET role = 'super_admin' WHERE email = 'hello@networkingforawesomepeople.com';

-- Set all leadership members as city_leader
UPDATE members SET role = 'city_leader' WHERE is_leadership = true AND email != 'hello@networkingforawesomepeople.com';

-- Allow multiple listings per member (remove unique constraint if exists)
ALTER TABLE directory_listings DROP CONSTRAINT IF EXISTS directory_listings_member_id_key;
