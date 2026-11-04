-- Role-based workforce additions.
-- Run this once against the Neon PostgreSQL database before deploying the API.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_key TEXT;

CREATE INDEX IF NOT EXISTS shifts_employee_start_time_idx
  ON shifts (employee_id, start_time);

CREATE INDEX IF NOT EXISTS attendance_user_clock_in_idx
  ON attendance (user_id, clock_in_at);
