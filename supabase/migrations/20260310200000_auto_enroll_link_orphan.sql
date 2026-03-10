-- Fix: auto_enroll_student now claims admin-created orphan rows (user_id IS NULL, same email)
-- before falling back to creating a blank new enrollment.
--
-- Scenario this fixes:
--   1. Admin manually adds student at School A → row has user_id=NULL, may have packages/balance.
--   2. Student signs up at School B → auth user created, School B row linked.
--   3. Student logs in at School A → old code created a BLANK new row, losing all packages.
--   New code: finds the email-matched orphan, links the auth user to it, returns it intact.

CREATE OR REPLACE FUNCTION public.auto_enroll_student(p_user_id uuid, p_school_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing   public.students;
  v_orphan     public.students;
  v_new_id     text;
  v_new_row    jsonb;
  v_name       text;
  v_email      text;
  v_phone      text;
  v_auth_email text;
BEGIN
  -- Only the signed-in user can enroll themselves at a school
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN NULL;
  END IF;

  -- 1. Already properly enrolled at this school (happy path)
  SELECT * INTO v_existing
  FROM public.students
  WHERE user_id = p_user_id AND school_id = p_school_id
  LIMIT 1;

  IF FOUND THEN
    SELECT COALESCE(p.name, v_existing.name),
           COALESCE(p.email, v_existing.email),
           COALESCE(p.phone, v_existing.phone)
      INTO v_name, v_email, v_phone
      FROM public.student_profiles p
      WHERE p.user_id = p_user_id
      LIMIT 1;
    v_name  := COALESCE(v_name,  v_existing.name);
    v_email := COALESCE(v_email, v_existing.email);
    v_phone := COALESCE(v_phone, v_existing.phone);
    RETURN jsonb_build_object(
      'id',                 v_existing.id,
      'name',               v_name,
      'email',              v_email,
      'phone',              v_phone,
      'password',           v_existing.password,
      'paid',               v_existing.paid,
      'package',            v_existing.package,
      'balance',            v_existing.balance,
      'balance_private',    v_existing.balance_private,
      'active_packs',       COALESCE(v_existing.active_packs, '[]'::jsonb),
      'package_expires_at', v_existing.package_expires_at,
      'school_id',          v_existing.school_id,
      'user_id',            v_existing.user_id,
      'created_at',         v_existing.created_at
    );
  END IF;

  -- 2. Look for an admin-created orphan row: same email, user_id IS NULL, same school.
  --    This happens when an admin added the student manually before they created an account.
  --    We take the oldest such row (most likely to have packages/balance from real use).
  v_auth_email := lower(trim((SELECT email FROM auth.users WHERE id = p_user_id)));

  IF v_auth_email IS NOT NULL AND v_auth_email <> '' THEN
    SELECT * INTO v_orphan
    FROM public.students
    WHERE school_id = p_school_id
      AND user_id IS NULL
      AND lower(trim(email)) = v_auth_email
    ORDER BY created_at ASC
    LIMIT 1;

    IF FOUND THEN
      -- Link the auth user to this existing row, preserving all packages and balance
      UPDATE public.students
        SET user_id = p_user_id
        WHERE id = v_orphan.id
          AND school_id = p_school_id
          AND user_id IS NULL;

      -- Upsert into student_profiles so cross-school data is consistent
      INSERT INTO public.student_profiles (user_id, name, email, phone, created_at, updated_at)
        VALUES (
          p_user_id,
          COALESCE(trim(v_orphan.name), ''),
          v_orphan.email,
          v_orphan.phone,
          now(),
          now()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          name       = COALESCE(nullif(trim(EXCLUDED.name), ''), student_profiles.name),
          email      = COALESCE(EXCLUDED.email, student_profiles.email),
          phone      = COALESCE(EXCLUDED.phone, student_profiles.phone),
          updated_at = now();

      RETURN jsonb_build_object(
        'id',                 v_orphan.id,
        'name',               v_orphan.name,
        'email',              v_orphan.email,
        'phone',              v_orphan.phone,
        'password',           v_orphan.password,
        'paid',               v_orphan.paid,
        'package',            v_orphan.package,
        'balance',            v_orphan.balance,
        'balance_private',    v_orphan.balance_private,
        'active_packs',       COALESCE(v_orphan.active_packs, '[]'::jsonb),
        'package_expires_at', v_orphan.package_expires_at,
        'school_id',          v_orphan.school_id,
        'user_id',            p_user_id,
        'created_at',         v_orphan.created_at
      );
    END IF;
  END IF;

  -- 3. Truly new enrollment — create a blank row, profile will fill name/email/phone
  v_new_id := 'STUD-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
  INSERT INTO public.students (
    id, name, email, phone, password, paid, package,
    balance, balance_private, active_packs, package_expires_at,
    school_id, user_id, created_at
  )
  VALUES (
    v_new_id, NULL, NULL, NULL, NULL, false, null,
    0, 0, '[]'::jsonb, null,
    p_school_id, p_user_id, now()
  );

  SELECT COALESCE(p.name,  s.name),
         COALESCE(p.email, s.email),
         COALESCE(p.phone, s.phone)
    INTO v_name, v_email, v_phone
    FROM public.students s
    LEFT JOIN public.student_profiles p ON p.user_id = s.user_id
    WHERE s.id = v_new_id AND s.school_id = p_school_id
    LIMIT 1;

  RETURN jsonb_build_object(
    'id',                 v_new_id,
    'name',               v_name,
    'email',              v_email,
    'phone',              v_phone,
    'password',           NULL,
    'paid',               false,
    'package',            NULL,
    'balance',            0,
    'balance_private',    0,
    'active_packs',       '[]'::jsonb,
    'package_expires_at', NULL,
    'school_id',          p_school_id,
    'user_id',            p_user_id,
    'created_at',         now()
  );
END;
$$;

COMMENT ON FUNCTION public.auto_enroll_student(uuid, uuid) IS
  'Enroll user at school. Priority: (1) existing linked row, (2) email-matched orphan row '
  '(admin-created, user_id IS NULL) which gets linked in place preserving packages/balance, '
  '(3) fresh blank row. Only callable by the signed-in user themselves.';

GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.auto_enroll_student(uuid, uuid) TO authenticated;
