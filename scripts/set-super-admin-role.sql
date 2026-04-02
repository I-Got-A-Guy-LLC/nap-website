-- Set super_admin role for the primary admin account
UPDATE members
SET role = 'super_admin'
WHERE email = 'hello@networkingforawesomepeople.com';
