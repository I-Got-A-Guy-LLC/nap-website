-- NextAuth.js required tables for Supabase Adapter
-- Run this in the Supabase SQL Editor AFTER setup-database.sql

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

-- Disable RLS on auth tables (NextAuth manages these directly)
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (NextAuth uses service role key)
CREATE POLICY "Service role full access" ON verification_tokens FOR ALL USING (true);
CREATE POLICY "Service role full access" ON accounts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON sessions FOR ALL USING (true);
