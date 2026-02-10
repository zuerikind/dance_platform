-- Minimal tests for Jack and Jill competitions (run after migrations).
-- Requirements (plan §9):
-- 1) RLS: School A admin cannot SELECT/UPDATE competitions or registrations where school_id = B.
-- 2) RLS: Student of school A cannot see school B's competitions or others' registrations.
-- 3) Unique: Insert two registrations for same (competition_id, student_id); second fails.
-- 4) Submit once: After SUBMITTED, student update to answers or status fails (enforced in RPC).
-- 5) Publish scope: Admin of school A cannot call publish for a competition of school B.

-- These are manual/expectation tests. Run with appropriate roles (set role, then run assertions).

-- Test 3: UNIQUE(competition_id, student_id)
-- As a user with insert on competition_registrations, insert same (competition_id, student_id) twice:
-- INSERT INTO competition_registrations (competition_id, school_id, student_id, answers) VALUES
--   ('<same-id>', '<school-id>', '<student-id>', '{}');
-- Second insert must fail with unique violation.

-- Test 4: Submit once
-- competition_registration_submit only updates where status = 'DRAFT'. Calling it again after
-- SUBMITTED returns no row (RPC returns to_jsonb(v_row) and v_row is empty). Frontend disables submit after first success.

-- Test 5: Publish scope
-- competition_publish_decisions checks is_school_admin(competition.school_id). If caller is admin of school A
-- and competition belongs to school B, the RPC returns NULL (no update).

-- RLS tests 1–2 require running as different auth.uid() (school A admin, school B admin, student A).
-- In Supabase dashboard or psql: set request.jwt.claim.sub to different UUIDs and verify SELECT/UPDATE
-- on competitions and competition_registrations return only allowed rows.
