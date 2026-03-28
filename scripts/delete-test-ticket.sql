-- Delete test ticket and decrement tickets_sold
-- Run this in the Supabase SQL Editor

DELETE FROM tickets WHERE ticket_code = 'QJVZHQ6D';

UPDATE events
SET tickets_sold = GREATEST(0, tickets_sold - 1)
WHERE slug = 'range-night-2026';
