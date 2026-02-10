# Student ID vs User ID – Why `user_id` Was NULL and Where It’s Used

## Two different IDs on `students`

| Column       | Type   | Meaning |
|-------------|--------|--------|
| **`students.id`** | text   | **Student row ID** (e.g. `STUD-A1B2`). Primary key of the student in your app. Used in payment requests, packs, QR, etc. This is **always** set when a student exists. |
| **`students.user_id`** | uuid   | **Supabase Auth user ID** (`auth.users.id`). Links this student row to a real Supabase Auth account so they can log in with email/password via Auth and RLS can identify “this row belongs to the logged-in user.” Can be **NULL** if signup fell back to the legacy path. |

So when you said “the user id of all students is still NULL,” that refers to **`students.user_id`**, not `students.id`. The student row **does** have an `id` (e.g. `STUD-XXXX`); it just didn’t have `user_id` set.

---

## Where `user_id` is used

1. **Login (Auth path)**  
   When a student logs in with name + password, the app first tries **Supabase Auth** (`signInWithPassword` with a pseudo-email). If that succeeds, it loads the student by **`user_id = auth.uid()`**. If `user_id` is NULL, that Auth-based path never finds the row, so the app falls back to the legacy login (name + password + school checked against the DB via RPC).

2. **RLS (Row Level Security)**  
   Policies on `students` use `user_id = auth.uid()` so that:
   - A student can **select/update only their own row** when logged in via Auth.
   - Without `user_id`, the student has no Auth session, so they can’t satisfy “own row” via Auth; they rely on legacy login and RPCs that bypass RLS (e.g. `get_student_by_credentials`, `get_student_by_id`).

3. **Other tables**  
   Some policies (e.g. classes, subscriptions) allow access if a student in that school has `user_id = auth.uid()`. So `user_id` is what ties “this Auth user” to “this student row” and thus to the school and its data.

So: **`user_id` is needed for Auth-based login and for RLS to treat the student as “the current user.”** Without it, students still exist and can use the app via the legacy name+password flow, but they are not linked to any Supabase Auth user.

---

## Why `user_id` was NULL for new signups

When a **new student registers** (email, phone, password), the app does:

1. **Preferred path:**  
   - Call **Supabase Auth `signUp`** (with a pseudo-email like `name+schoolId@students.bailadmin.local`).  
   - If that succeeds, **insert** into `students` with `user_id = authUser.id`.  
   - If that insert succeeds → the new student has **`user_id`** set.

2. **Fallback path:**  
   - If **Auth fails** (e.g. rate limit, “confirm email” required, etc.) or the **insert fails** (e.g. RLS, session not set yet), the app calls **`create_student_legacy`** RPC.  
   - That RPC only inserts: `id`, name, email, phone, password, paid, package, balance, school_id, created_at. It **does not set `user_id`**.  
   - So every time the fallback was used, the student was created **without** `user_id` → **user_id stayed NULL**.

So in practice: **any time signUp failed or the first insert failed, the student was created via `create_student_legacy` and therefore with `user_id` NULL.** That’s why even new students (with email, phone, password) often had no “user id” in the DB.

---

## What was changed

1. **Admin-created students**  
   - When an **admin** adds a student (Membresías → + Alumno), the app now uses **`create_student_legacy`** and asks for name, phone, **email** (optional), and password. The row is created with **`user_id` NULL**.  
   - **`user_id` is set when that student first goes to the app and clicks “Sign up”** with the **same name and password** (and school). The app then links the new Auth user to the existing row via **`link_student_auth`**, so the row gets **`user_id`** without creating a duplicate.

2. **New RPC: `create_student_with_auth`**  
   - Creates a student row **including `user_id`**; only callable by that Auth user. Used when signUp succeeds but the direct table insert fails.

3. **New RPC: `link_student_auth`**  
   - Sets **`user_id = auth.uid()`** on an existing student row that has **`user_id` NULL**. Used when an admin-created student first signs up (same name+password+school) so the existing row is linked to the new Auth user.

4. **App signup flow**  
   - After `signUp` succeeds, the app first checks for an **existing student** with the same name+password+school (e.g. created by admin). If found and **`user_id`** is NULL, it calls **`link_student_auth`** and uses that row (now with **`user_id`** set).  
   - Otherwise it tries the normal **insert**, then **`create_student_with_auth`**, then **`create_student_legacy`**.

5. **Supabase Auth settings**  
   - In **Authentication → Providers → Email**, consider **disabling “Confirm email”** so the session is set right after `signUp` and **`link_student_auth`** / **`create_student_with_auth`** can run successfully.

---

## Summary

- **Student ID** = `students.id` (e.g. `STUD-XXXX`). Always present; used everywhere in the app (payments, packs, QR, etc.).
- **User ID** = `students.user_id` = Supabase Auth user. Used for Auth login and RLS; was often NULL because the fallback creation path (`create_student_legacy`) never set it.
- **Fix:** When signUp succeeds but insert fails, the app now creates the student via **`create_student_with_auth`** so new registrations get **`user_id`** set when possible. Run the new migration so the RPC exists in your project.
