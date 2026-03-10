-- Run this in the Supabase SQL Editor to see which DB you're on and whether the function has the new message.
-- Compare "database" and "server_addr" with the output of: node supabase/scripts/run_sql_file.js (with DATABASE_URL set).

-- New logic is present if has_new_vars/has_full_phrase are true (strict LIKE can be false due to apostrophe encoding).
SELECT
  current_database() AS database,
  inet_server_addr()::text AS server_addr,
  (SELECT prosrc LIKE '%v_effective_balance%' FROM pg_proc WHERE proname = 'register_for_class') AS has_new_vars,
  (SELECT prosrc LIKE '%have enough classes in your package%' FROM pg_proc WHERE proname = 'register_for_class') AS has_full_phrase,
  (SELECT prosrc LIKE '%You don''t have enough classes in your package%' FROM pg_proc WHERE proname = 'register_for_class') AS has_new_message_strict;

-- Also list all register_for_class functions (schema, name, has_new_message):
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  (p.prosrc LIKE '%You don''t have enough classes in your package%') AS has_new_message
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'register_for_class'
ORDER BY n.nspname;
