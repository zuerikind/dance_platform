# Supabase setup for Bailadmin

## Running the security migration

1. Open your [Supabase project](https://supabase.com/dashboard) → **SQL Editor**.
2. Open `supabase/migrations/20260210000000_security_schema_and_rls.sql` in this repo.
3. Copy its full contents and paste into a **New query** in the SQL Editor.
4. Run the query (Run or Ctrl+Enter).

Then follow the **POST-MIGRATION STEPS** at the bottom of that SQL file (create Auth users for admins, add platform devs to `platform_admins`, etc.).

### RPC migration (required for students + legacy admins)

Run this so the app works for **students** (schedule, shop, buy pack, bank details) and **legacy admins** (payment requests, bank settings):

1. In SQL Editor, open **New query**.
2. Paste the **full** contents of `supabase/migrations/20260210100000_login_credentials_rpc.sql`.
3. Run the query.

This adds: login credential checks, `get_school_classes`, `get_school_subscriptions`, `get_school_admin_settings`, `create_payment_request`, `get_school_payment_requests`, `update_payment_request_status`, `delete_payment_request`, plus **admin management** (`admin_insert_for_school`, `admin_delete_for_school`), **classes** (`class_insert_for_school`, `class_update_field`, `class_delete_for_school`), **plans** (`subscription_insert_for_school`, `subscription_update_field`, `subscription_delete_for_school`), and **transfer details** (`admin_setting_upsert`) so legacy admins can add admins, edit classes, edit plans, and save bank details. If you see "Could not find the function" in the app, this migration was not run or needs to be re-run.

## What the migration does

- Adds `user_id` (references `auth.users`) to `students` and `admins`.
- Creates `platform_admins` table to restrict God Mode access.
- Enables Row Level Security (RLS) on all relevant tables.
- Defines policies so:
  - Students only see their own row; admins see their school’s data; platform admins see everything.
  - Passwords are no longer used for login from the app (Auth handles it).
