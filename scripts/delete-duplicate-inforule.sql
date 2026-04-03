-- Delete the duplicate "Inforule Social Media" listing (the bare one with no description/logo).
-- Keep the listing that has full content.
-- Preview first:
-- SELECT id, business_name, description, logo_url, created_at
-- FROM directory_listings
-- WHERE business_name ILIKE '%inforule%';

DELETE FROM directory_listings
WHERE business_name ILIKE '%Inforule Social Media%'
  AND (description IS NULL OR description = '')
  AND (logo_url IS NULL OR logo_url = '');
