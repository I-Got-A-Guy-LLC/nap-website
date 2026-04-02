-- Insert missed sponsor: Kayce Broach, Supporting $250, paid via Stripe on 2026-04-02
INSERT INTO event_sponsors (
  event_id,
  sponsor_name,
  sponsor_email,
  sponsor_business,
  tier,
  amount,
  payment_method,
  payment_status,
  paid_at
) VALUES (
  'dd887bb2-7910-46b6-9cf9-277d2f180d98',
  'Kayce Broach',
  'kkfitness@gmail.com',
  'KK Fitness Training',
  'supporting',
  250.00,
  'stripe',
  'paid',
  NOW()
);
