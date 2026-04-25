-- seed_data.sql
-- Populate the Event Booking System database with sample data.
-- Run AFTER alembic upgrade head:
--   sqlite3 event_booking.db < seed_data.sql

-- ── Events ────────────────────────────────────────────────────────────────────
INSERT INTO events (name, description, total_seats, available_seats, date) VALUES
  ('Tech Conference 2026',    'Annual technology and innovation conference', 100, 97, '2026-12-01 09:00:00'),
  ('Music Festival Night',    'Live performances by top local artists',       50, 48, '2026-11-15 18:00:00'),
  ('Python Workshop',         'Hands-on Python for beginners and intermediates', 30, 28, '2026-10-20 10:00:00'),
  ('Startup Pitch Day',       'Pitch your startup idea to investors',          20, 20, '2026-09-05 14:00:00'),
  ('Small Exclusive Meetup',  'Intimate networking event - very limited seats', 5,  5, '2026-08-10 17:00:00');

-- ── Bookings ──────────────────────────────────────────────────────────────────
-- Tech Conference 2026 (event_id = 1) - 3 bookings
INSERT INTO bookings (event_id, user_name, booking_date) VALUES
  (1, 'Alice Johnson',   '2026-07-01 10:00:00'),
  (1, 'Bob Smith',       '2026-07-02 11:00:00'),
  (1, 'Carol White',     '2026-07-03 12:00:00');

-- Music Festival Night (event_id = 2) – 2 bookings
INSERT INTO bookings (event_id, user_name, booking_date) VALUES
  (2, 'David Brown',     '2026-07-04 09:30:00'),
  (2, 'Eva Martinez',    '2026-07-05 14:15:00');

-- Python Workshop (event_id = 3) – 2 bookings
INSERT INTO bookings (event_id, user_name, booking_date) VALUES
  (3, 'Frank Lee',       '2026-07-06 08:00:00'),
  (3, 'Grace Kim',       '2026-07-07 09:45:00');
