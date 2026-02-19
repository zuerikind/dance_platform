# Student Implementation & Cross-School Security Review

## Summary

Students are **correctly implemented** and **school isolation is enforced** in most places. Login and data access are scoped to the selected school. A few RPCs used for class registration lack caller authorization and should be fixed.

---

## 1. Student implementation

- **Login flow** (`app.js` → `loginStudent`):
  - User selects a **school** (e.g. from discovery or list), then sees the auth screen.
  - Credentials: **email** (auth-email) + **password** (auth-pass). Login uses **Supabase Auth** only (`signInWithPassword`); there is no legacy name/username+password RPC path in the app.
  - After Auth success:
    - `get_student_by_user_id(uid, state.currentSchool.id)` loads the enrollment for **that school**.
    - If none: `auto_enroll_student(uid, state.currentSchool.id)` creates an enrollment for that school (multi-school design).
  - **School context** is always `state.currentSchool.id` (the school chosen before login). A student cannot “log into” a different school’s data without selecting that school first; enrollment is then either existing or created via `auto_enroll_student`.

- **Multi-school (by design)**:
  - One Auth identity can have multiple `students` rows (one per school).
  - `auto_enroll_student` enforces `auth.uid() = p_user_id` (only the signed-in user can enroll themselves).
  - `get_student_by_user_id` and `get_all_student_enrollments` in `20260214180000_rpc_authorization.sql` restrict access to the same user or school/platform admin.

- **Legacy students (no Auth)**:
  - DB has `get_student_by_credentials` and `get_student_by_username_credentials` (name/username + password + school_id), but the **app never calls them**. Students without a Supabase Auth account cannot log in with the current UI.

---

## 2. School isolation – where it’s correct

- **RLS (students, classes, subscriptions, etc.)**
  - Students: select/update only own row (`user_id = auth.uid()`) or school/platform admin.
  - Classes/subscriptions: admins or students of that school (`s.school_id = … AND s.user_id = auth.uid()`).
  - Class registrations: student can only see/change rows where the student row has `user_id = auth.uid()`.

- **RPCs (after `20260214180000_rpc_authorization.sql`)**  
  School or platform admin (or owner) checks where relevant:
  - `get_school_students`, `get_school_admins`, `get_school_classes`, `get_school_subscriptions`: require `is_school_admin(p_school_id)` or `is_platform_admin()`.
  - `get_school_classes` / `get_school_subscriptions` (in `20260214200000_student_read_classes_subscriptions.sql`): also allow students **enrolled at that school** (`s.school_id = p_school_id AND s.user_id = auth.uid()`).
  - `get_student_by_id`, `get_student_by_user_id`: own row or school/platform admin.
  - `get_all_student_enrollments`: only `auth.uid() = p_user_id`.
  - `create_payment_request`: school admin, platform admin, or the student who owns that `student_id` in that `school_id`.
  - `apply_student_package`, `activate_package_for_student`, `deduct_student_classes`: school or platform admin only; student’s school is validated.
  - `admin_insert_for_school`: requires `is_school_admin(p_school_id)` or `is_platform_admin()` (in `20260216000000_admin_email_login.sql`).

- **Login**
  - Credentials are validated per school: Auth identifies the user; enrollment is always for `state.currentSchool.id`. No cross-school data is returned for a different school without the user explicitly selecting that school and (if needed) auto-enrolling.

---

## 3. Gaps and recommendations

### 3.1 Critical: class registration RPCs (no caller check)

- **`register_for_class(p_student_id, p_class_id, p_school_id, p_class_date)`**  
  Only checks that the student and class exist in the school. It does **not** check that the caller is that student (`s.user_id = auth.uid()`) or a school admin.  
  **Risk:** Any authenticated (or anon) user can register **any** student for **any** class in any school.

- **`cancel_class_registration(p_registration_id, p_student_id)`**  
  Only checks that the registration exists and belongs to that student. No check that the caller is that student or an admin.  
  **Risk:** Anyone who knows a registration id and student id can cancel that registration.

**Recommendation:** Add authorization in both RPCs: allow only if the caller is the student (`students.user_id = auth.uid()` for that `p_student_id` / school) or a school/platform admin for that school.

### 3.2 Moderate: admin-only RPCs callable by anyone

- **`get_class_registrations_for_date(p_school_id, p_class_date)`**  
  Returns all registrations for that school and date. No check that the caller is an admin of that school.  
  **Risk:** Information disclosure: any user can list who is registered for classes at any school on any date.

**Recommendation:** Restrict to school or platform admin for `p_school_id`.

### 3.3 Optional: legacy student login

- Students without Auth (`user_id` NULL) cannot log in because the app only uses `signInWithPassword` and never calls `get_student_by_credentials` or `get_student_by_username_credentials`.  
  If you need legacy login, add a fallback in the app that calls one of these RPCs when Auth fails and then sets session/state accordingly (and ensure the RPCs remain restricted by `school_id`).

### 3.4 Admin (teacher) as student at their school

Admins can register as students at their own school so teachers can take classes too. **Flow:** select the school → **Student Login** (not Admin Login) → same email + password as admin. Auth signs them in; `auto_enroll_student` creates a student enrollment for that school. The migration `20260220140000_auto_enroll_admin_as_student.sql` copies name/email/phone from the admin row into the new student row when the user has no existing student profile, so the student card is populated. They can then use balance, QR, and class registration like any other student; to switch back to admin, they use Admin Login with the same credentials.

### 3.5 By design: self-enrollment in any school

- `auto_enroll_student` allows a signed-in user to create an enrollment in **any** school (only `auth.uid() = p_user_id` is enforced). This matches the “global student accounts” / multi-school design. If some schools should not allow open self-enrollment, you’d need a separate mechanism (e.g. school flag or invite-only) and an extra check in `auto_enroll_student`.

---

## 4. Conclusion

- **Students:** Implemented correctly; login and enrollment are tied to the selected school and Auth identity.
- **Different school sign-in:** Security is in place: school is chosen before login, and RLS + RPC authorization enforce school isolation for data access and mutations.
- **Remaining work:** Add caller authorization to `register_for_class`, `cancel_class_registration`, and `get_class_registrations_for_date` so that only the owning student or school/platform admin can perform or read those operations.
