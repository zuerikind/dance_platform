-- Fix student bmqz11@gmail.com
-- Auth user:  c9339a2c-10e8-46b1-a599-f8ad4a6f8792
-- Student row with classes: STUD-B0F1
-- School: 531f09f2-bc82-4185-b005-4ad7f86e00aa
--
-- Run STEP 1 first to verify, then run STEPS 2-5, then STEP 6 to confirm.
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: See all rows for this student before touching anything
SELECT id, email, user_id, password IS NOT NULL AS has_password,
       package, balance, active_packs, school_id, created_at
FROM students
WHERE email = 'bmqz11@gmail.com'
ORDER BY created_at;


-- STEP 2: Link auth user to her real row (STUD-B0F1, the one with classes)
UPDATE students
SET user_id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792'
WHERE id = 'STUD-B0F1'
  AND school_id = '531f09f2-bc82-4185-b005-4ad7f86e00aa'
  AND user_id IS NULL;


-- STEP 3: Upsert student_profiles so cross-school data is consistent
INSERT INTO student_profiles (user_id, name, email, phone, created_at, updated_at)
SELECT
  'c9339a2c-10e8-46b1-a599-f8ad4a6f8792',
  s.name,
  s.email,
  s.phone,
  now(),
  now()
FROM students s
WHERE s.id = 'STUD-B0F1'
  AND s.school_id = '531f09f2-bc82-4185-b005-4ad7f86e00aa'
ON CONFLICT (user_id) DO UPDATE SET
  name       = COALESCE(EXCLUDED.name, student_profiles.name),
  email      = COALESCE(EXCLUDED.email, student_profiles.email),
  phone      = COALESCE(EXCLUDED.phone, student_profiles.phone),
  updated_at = now();


-- STEP 4: Delete any blank duplicate rows auto_enroll_student may have created
-- (only deletes rows with no package and no balance — safe guard)
DELETE FROM students
WHERE email = 'bmqz11@gmail.com'
  AND school_id = '531f09f2-bc82-4185-b005-4ad7f86e00aa'
  AND id <> 'STUD-B0F1'
  AND package IS NULL
  AND balance = 0
  AND (active_packs IS NULL OR active_packs = '[]'::jsonb);


-- STEP 5: Confirm her email in auth so login works
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE id = 'c9339a2c-10e8-46b1-a599-f8ad4a6f8792';


-- STEP 6: Final check — should see exactly ONE row at her school
SELECT id, email, user_id, password IS NOT NULL AS has_password,
       package, balance, active_packs, school_id, created_at
FROM students
WHERE email = 'bmqz11@gmail.com'
ORDER BY created_at;
