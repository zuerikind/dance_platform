-- One-time fix: student STUD-7B08 at school 51c47315 had 2 private lessons accepted
-- before deduct-on-accept migration was applied, so balance_private stayed 5.
-- This deducts 3 (1h + 2h) so remaining shows 2. Run once after applying
-- 20260313100000_private_class_deduct_on_accept.sql.
-- Usage: run in Supabase SQL editor or psql (replace with your connection).

SELECT public.deduct_student_classes(
  'STUD-7B08',
  '51c47315-b7c7-4ea3-a4db-9ba68bd46593'::uuid,
  3,
  'private'
);
