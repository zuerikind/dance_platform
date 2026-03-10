-- Set a temporary password for bmqz11@gmail.com
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Enable pgcrypto (needed for crypt/gen_salt — safe to run, no-op if already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- STEP 2: Set the password
UPDATE auth.users
SET encrypted_password = crypt('Bailoheels', gen_salt('bf'))
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';

-- STEP 3: Verify it was updated (check updated_at changed)
SELECT id, email, email_confirmed_at, updated_at
FROM auth.users
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';
