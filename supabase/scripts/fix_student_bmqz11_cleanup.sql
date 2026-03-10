-- Cleanup: remove the duplicate row for bmqz11@gmail.com
-- Run STEP 1 first to see exactly what both rows look like, then decide which to delete.
-- ─────────────────────────────────────────────────────────────────────────────

-- STEP 1: Inspect both rows in full detail
SELECT
  id,
  email,
  user_id,
  password IS NOT NULL AS has_password,
  package,
  balance,
  balance_private,
  active_packs,
  paid,
  school_id,
  created_at
FROM students
WHERE email = 'bmqz11@gmail.com'
ORDER BY created_at;


-- STEP 2: Delete the duplicate — the row that is NOT STUD-B0F1
-- Safe: only deletes rows with no package AND no active_packs AND no balance.
-- If it still won't delete after Step 1, use Step 3 instead.
DELETE FROM students
WHERE email = 'bmqz11@gmail.com'
  AND id <> 'STUD-B0F1'
  AND package IS NULL
  AND (active_packs IS NULL OR active_packs = '[]'::jsonb)
  AND balance = 0
  AND balance_private = 0;


-- STEP 3: If the duplicate still has some data and you are sure it is the wrong row,
-- replace <STUD-DUPLICATE-ID> with the actual id from Step 1 and run this instead.
-- DELETE FROM students
-- WHERE id = '<STUD-DUPLICATE-ID>'
--   AND email = 'bmqz11@gmail.com'
--   AND id <> 'STUD-B0F1';


-- STEP 4: Confirm — should be exactly one row
SELECT id, email, user_id, package, balance, active_packs, school_id, created_at
FROM students
WHERE email = 'bmqz11@gmail.com'
ORDER BY created_at;
