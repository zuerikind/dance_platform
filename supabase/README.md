# Supabase setup for Bailadmin

## Running the security migration

1. Open your [Supabase project](https://supabase.com/dashboard) → **SQL Editor**.
2. Open `supabase/migrations/20260210000000_security_schema_and_rls.sql` in this repo.
3. Copy its full contents and paste into a **New query** in the SQL Editor.
4. Run the query (Run or Ctrl+Enter).

Then follow the **POST-MIGRATION STEPS** at the bottom of that SQL file (create Auth users for admins, add platform devs to `platform_admins`, etc.).

## What the migration does

- Adds `user_id` (references `auth.users`) to `students` and `admins`.
- Creates `platform_admins` table to restrict God Mode access.
- Enables Row Level Security (RLS) on all relevant tables.
- Defines policies so:
  - Students only see their own row; admins see their school’s data; platform admins see everything.
  - Passwords are no longer used for login from the app (Auth handles it).
