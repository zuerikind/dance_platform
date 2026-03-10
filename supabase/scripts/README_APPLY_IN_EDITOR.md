# Applying register_for_class via SQL Editor

The Supabase SQL Editor can split multi-statement scripts on `;`, so the `CREATE FUNCTION` never runs correctly and the function stays unchanged. The Node script may hit **ETIMEDOUT** if your network blocks port 5432.

## Option A: SQL Editor only (use when Node script times out)

Run **one** file as a single statement so the Editor does not split it:

1. In Supabase → **SQL Editor**, open a new query.
2. Copy the **entire** contents of **`editor_step2_create_only.sql`** (from `CREATE OR REPLACE` through `$$;`).
3. Paste into the Editor and click **Run**. You should see success.
4. Verify: `SELECT prosrc LIKE '%You don''t have enough classes in your package%' AS has_new_message FROM pg_proc WHERE proname = 'register_for_class';` → should return **true**.

No DROP needed: `CREATE OR REPLACE` updates the function in place.

## Option B: Run with psql (if you have it)

This sends the whole script in one go so the function is actually replaced.

1. **Get your database connection string**
   - Supabase Dashboard → your project → **Project Settings** (gear) → **Database**
   - Under **Connection string** choose **URI** and copy it
   - Replace `[YOUR-PASSWORD]` with your database password

2. **From your project root** (where this repo is), run:

   ```bash
   psql "postgresql://postgres:YOUR_PASSWORD@db.fziyybqhecfxhkagknvg.supabase.co:5432/postgres" -f supabase/scripts/apply_register_for_class_only.sql
   ```

   (Use the exact URI from the dashboard; the host might be `db.xxx.supabase.co`.)

3. **Check** in the SQL Editor:

   ```sql
   SELECT prosrc LIKE '%You don''t have enough classes in your package%' AS has_new_message
   FROM pg_proc WHERE proname = 'register_for_class';
   ```
   You should get `true`.

## Option B: Run one statement at a time in the Editor

If you don't have `psql`:

1. Run **only** this in a new tab (copy exactly, one statement):

   ```sql
   DROP FUNCTION IF EXISTS public.register_for_class(text, bigint, uuid, date);
   ```
   Click Run. You should see success.

2. Then open `apply_register_for_class_only.sql`, select **only** the `CREATE FUNCTION` block (from `CREATE FUNCTION` through `$$;` — do **not** include the GRANTs yet). Paste into the Editor and Run.

3. If step 2 fails or the check still returns false, use **Option A** (psql).
