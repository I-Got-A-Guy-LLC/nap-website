-- Add onboarding_completed JSONB column to members table
-- Stores completion state for onboarding checklist steps
-- Example: {"profile": true, "listing": true, "photo": true, "notifications": true, "directory": true, "events": true, "connect": true}

ALTER TABLE members
ADD COLUMN IF NOT EXISTS onboarding_completed JSONB DEFAULT '{}';
