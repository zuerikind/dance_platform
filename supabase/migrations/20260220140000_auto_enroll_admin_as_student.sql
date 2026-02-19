-- =============================================================================
-- Let admins register as students at their school (e.g. teachers who take
-- classes). When an admin with no prior student enrollment at this school
-- calls auto_enroll_student, we create the enrollment and copy name/email/phone
-- from their admin row so the student card is populated.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.students;
  v_new_id   text;
  v_new_row  jsonb;
  v_name    text;
  v_email   text;
  v_phone   text;
  v_admin   public.admins%ROWTYPE;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(p.name, v_existing.name), COALESCE(p.email, v_existing.email), COALESCE(p.phone, v_existing.phone)
      INTO v_name, v_email, v_phone
      FROM public.student_profiles p
      WHERE p.user_id = p_user_id
      LIMIT 1;
    v_name := COALESCE(v_name, v_existing.name);
    v_email := COALESCE(v_email, v_existing.email);
    v_phone := COALESCE(v_phone, v_existing.phone);
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'name', v_name,
      'email', v_email,
      'phone', v_phone,
      'password', v_existing.password,
      'paid', v_existing.paid,
      'package', v_existing.package,
      'balance', v_existing.balance,
      'balance_private', v_existing.balance_private,
      'active_packs', COALESCE(v_existing.active_packs, '[]'::jsonb),
      'package_expires_at', v_existing.package_expires_at,
      'school_id', v_existing.school_id,
      'user_id', v_existing.user_id,
      'created_at', v_existing.created_at
    );
  END IF;

  -- New enrollment: try profile first, then admin row (so teachers get their name/email)
  SELECT p.name, p.email, p.phone
    INTO v_name, v_email, v_phone
    FROM public.student_profiles p
    WHERE p.user_id = p_user_id
    LIMIT 1;

  IF v_name IS NULL AND v_email IS NULL AND v_phone IS NULL THEN
    -- Prefer admin row for this school (teacher taking classes at own school)
    SELECT * INTO v_admin
    FROM public.admins
    WHERE user_id = p_user_id AND school_id = p_school_id
    LIMIT 1;
    IF NOT FOUND THEN
      -- Fallback: any admin row for this user (e.g. admin of school A signs up as student at school B)
      SELECT * INTO v_admin
      FROM public.admins
      WHERE user_id = p_user_id
      ORDER BY school_id
      LIMIT 1;
    END IF;
    IF FOUND THEN
      v_name := coalesce(nullif(trim(v_admin.display_name), ''), v_admin.username);
      v_email := v_admin.email;
      v_phone := v_admin.phone;
    END IF;
  END IF;

  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (id, name, email, phone, password, paid, package, balance, balance_private, active_packs, package_expires_at, school_id, user_id, created_at)
  VALUES (v_new_id, nullif(trim(v_name), ''), nullif(trim(v_email), ''), nullif(trim(v_phone), ''), NULL, false, null, 0, 0, '[]'::jsonb, null, p_school_id, p_user_id, now());

  SELECT COALESCE(p.name, s.name), COALESCE(p.email, s.email), COALESCE(p.phone, s.phone)
    INTO v_name, v_email, v_phone
    FROM public.students s
    LEFT JOIN public.student_profiles p ON p.user_id = s.user_id
    WHERE s.id = v_new_id AND s.school_id = p_school_id
    LIMIT 1;

  SELECT jsonb_build_object(
    'id', v_new_id,
    'name', v_name,
    'email', v_email,
    'phone', v_phone,
    'password', NULL,
    'paid', false,
    'package', NULL,
    'balance', 0,
    'balance_private', 0,
    'active_packs', '[]'::jsonb,
    'package_expires_at', NULL,
    'school_id', p_school_id,
    'user_id', p_user_id,
    'created_at', now()
  ) INTO v_new_row;
  RETURN v_new_row;
END;
$$;

COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS
  'Create student enrollment for school; only callable by same user (auth.uid()). If caller is admin (this school or any school) with no student profile, name/email/phone are copied from admin row.';

-- =============================================================================
-- Backfill: students with user_id but null name (e.g. admin who enrolled at
-- another school before we copied from any-admin). Set name/email/phone from
-- first admin row for that user_id or from student_profiles.
-- =============================================================================
UPDATE public.students s
SET
  name = coalesce(nullif(trim(s.name), ''), v.name),
  email = coalesce(nullif(trim(s.email), ''), v.email),
  phone = coalesce(nullif(trim(s.phone), ''), v.phone)
FROM (
  SELECT DISTINCT ON (s2.id)
    s2.id,
    coalesce(nullif(trim(a.display_name), ''), a.username) AS name,
    a.email,
    a.phone
  FROM public.students s2
  JOIN public.admins a ON a.user_id = s2.user_id
  WHERE s2.user_id IS NOT NULL
    AND trim(coalesce(s2.name, '')) = ''
    AND trim(coalesce(s2.email, '')) = ''
  ORDER BY s2.id, a.school_id
) v
WHERE s.id = v.id;

UPDATE public.students s
SET
  name = coalesce(nullif(trim(s.name), ''), p.name),
  email = coalesce(nullif(trim(s.email), ''), p.email),
  phone = coalesce(nullif(trim(s.phone), ''), p.phone)
FROM public.student_profiles p
WHERE p.user_id = s.user_id
  AND s.user_id IS NOT NULL
  AND (trim(coalesce(s.name, '')) = '' OR trim(coalesce(s.email, '')) = '');
