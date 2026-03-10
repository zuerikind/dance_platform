-- Diagnose and fix auth login for bmqz11@gmail.com
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Check her auth record
SELECT
  id,
  email,
  email_confirmed_at,
  last_sign_in_at,
  created_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_anonymous
FROM auth.users
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';


-- STEP 2: Check if she has a usable password in auth
-- (identities table shows how she was created — email/password vs magic link etc.)
SELECT
  id,
  user_id,
  provider,
  created_at,
  updated_at
FROM auth.identities
WHERE user_id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';


-- STEP 3: Force-confirm her email so signInWithPassword works
-- (safe to run even if already confirmed)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';


-- STEP 4: Confirm the fix
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';
