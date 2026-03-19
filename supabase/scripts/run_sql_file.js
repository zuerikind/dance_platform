#!/usr/bin/env node
/**
 * Run apply_register_for_class_only.sql against the Supabase DB.
 * node-pg runs only ONE statement per query(), so we parse the file and run each statement separately.
 *
 * Set DATABASE_URL (use Direct connection / port 5432 from Supabase Dashboard → Settings → Database).
 * Then: node supabase/scripts/run_sql_file.js supabase/scripts/apply_register_for_class_only.sql
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sqlPath = process.argv[2] || path.join(__dirname, 'apply_register_for_class_only.sql');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('Set DATABASE_URL with your Supabase database URI (including password).');
  console.error('Use the "Direct connection" URI (port 5432) from Dashboard → Project Settings → Database.');
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(process.cwd(), sqlPath), 'utf8');

// node-pg only executes ONE statement per query(). Split the file into single statements.
// 1) DROP FUNCTION ... ;
const dropMatch = sql.match(/DROP FUNCTION IF EXISTS public\.register_for_class\([^)]+\)[^;]*;/);
// 2) CREATE FUNCTION ... $$ body $$;  (one block - do not split on ; inside $$)
const createMatch = sql.match(/CREATE FUNCTION public\.register_for_class[\s\S]+?\$\$;/);
// 3) GRANT lines
const grantMatches = sql.match(/GRANT EXECUTE ON FUNCTION public\.register_for_class[^;]+;/g) || [];

if (!dropMatch || !createMatch) {
  console.error('Could not parse DROP or CREATE from the SQL file.');
  process.exit(1);
}

const statements = [dropMatch[0].trim(), createMatch[0].trim(), ...grantMatches.map((g) => g.trim())];

const client = new Client({ connectionString: databaseUrl });

const checkQuery = `
  SELECT
    current_database() AS db,
    inet_server_addr()::text AS server_addr,
    (SELECT prosrc LIKE '%You don''t have enough classes in your package%' FROM pg_proc WHERE proname = 'register_for_class') AS has_new_message
  FROM (SELECT 1) t
`;

async function run() {
  await client.connect();

  // Run each statement separately
  for (let i = 0; i < statements.length; i++) {
    await client.query(statements[i]);
    console.log('Executed statement', i + 1, 'of', statements.length);
  }

  const res = await client.query(checkQuery);
  const row = res.rows[0];
  console.log('');
  console.log('On this connection:');
  console.log('  database    =', row.db);
  console.log('  server_addr =', row.server_addr);
  console.log('  has_new_message =', row.has_new_message);

  if (row.has_new_message) {
    console.log('');
    console.log('SUCCESS: Function was updated. Run the same check in Supabase SQL Editor.');
    console.log('If the Editor still shows false, it is connected to a different database (e.g. another branch).');
  } else {
    console.log('');
    console.log('Function body still old on this connection. Check that DATABASE_URL is the same project as the SQL Editor.');
  }

  await client.end();
}

run().catch((err) => {
  console.error(err);
  client.end().catch(() => {});
  process.exit(1);
});
