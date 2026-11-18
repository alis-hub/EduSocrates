#!/usr/bin/env node
/**
 * Applies the security and feature migrations (004 and later) to a database, in order, once each.
 * No psql needed. Safe to re-run: applied migrations are recorded in schema_migrations and every
 * migration is also written to be idempotent.
 *
 *   DATABASE_URL="<owner connection string>" \
 *   APP_DB_PASSWORD="<password to give the restricted gurumera_app role>" \
 *   node scripts/apply-migrations.js [--lock-seed-accounts]
 *
 * It never touches schema.sql, seed.sql, 002 or 003 (those were loaded already, and re-running 002
 * after 004 would re-open a data leak).
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DIR = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
const LOCK_SQL = path.join(__dirname, '..', '..', '..', 'database', 'production', 'lock_seed_accounts.sql');
const url = process.env.DATABASE_URL;
const appPassword = process.env.APP_DB_PASSWORD || '';

if (!url) { console.error('Set DATABASE_URL (owner connection string).'); process.exit(1); }
if (appPassword.length < 16) { console.error('Set APP_DB_PASSWORD to a random password of at least 16 characters.'); process.exit(1); }
if (/[\s'"\\]/.test(appPassword)) { console.error('APP_DB_PASSWORD must not contain spaces, quotes or backslashes (it goes into a connection URL).'); process.exit(1); }

const files = fs.readdirSync(DIR)
  .filter((f) => /^\d{3}_.+\.sql$/.test(f) && Number(f.slice(0, 3)) >= 4)
  .sort();

(async () => {
  const db = new Client({ connectionString: url, ssl: /sslmode=require|neon\.tech/.test(url) ? { rejectUnauthorized: true } : undefined });
  await db.connect();
  const who = (await db.query('select current_user, current_database() as db')).rows[0];
  console.log(`Connected to database "${who.db}" as ${who.current_user}`);
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
  const done = new Set((await db.query('select name from schema_migrations')).rows.map((r) => r.name));

  for (const f of files) {
    if (done.has(f)) { console.log(`  skip   ${f} (already applied)`); continue; }
    let sql = fs.readFileSync(path.join(DIR, f), 'utf8');
    // 004 uses psql-only \if / variables to set the role password. Do the same job here.
    sql = sql.replace(/\\if :\{\?app_password\}[\s\S]*?\\endif/, `ALTER ROLE gurumera_app PASSWORD ${db.escapeLiteral(appPassword)};`);
    if (/^\\/m.test(sql)) throw new Error(`${f} still contains psql meta-commands`);
    try {
      await db.query('BEGIN');
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (name) VALUES ($1)', [f]);
      await db.query('COMMIT');
      console.log(`  applied ${f}`);
    } catch (e) {
      await db.query('ROLLBACK').catch(() => {});
      console.error(`  FAILED ${f}: ${e.message}`);
      process.exit(1);
    }
  }

  if (process.argv.includes('--lock-seed-accounts')) {
    await db.query(fs.readFileSync(LOCK_SQL, 'utf8'));
    console.log('  demo accounts locked');
  }

  // Verification
  const role = (await db.query(`select rolcanlogin, rolbypassrls, rolsuper from pg_roles where rolname='gurumera_app'`)).rows[0];
  const noRls = (await db.query(`select count(*)::int n from pg_tables t where schemaname='public' and tablename in ('email_tokens','transcript_access_log','parent_acknowledgements') and not rowsecurity`)).rows[0].n;
  const seeds = (await db.query(`select count(*)::int n from users where is_active and password_hash='$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a'`)).rows[0].n;
  console.log('\nChecks');
  console.log(`  gurumera_app role: ${role ? `login=${role.rolcanlogin} bypassrls=${role.rolbypassrls} superuser=${role.rolsuper}` : 'MISSING'}`);
  console.log(`  new tables without row security: ${noRls}`);
  console.log(`  active accounts still using the published demo password: ${seeds}${seeds ? '  <-- run again with --lock-seed-accounts' : ''}`);
  const ok = role && role.rolcanlogin && !role.rolbypassrls && !role.rolsuper && noRls === 0;
  console.log(ok ? '\nOK' : '\nPROBLEM: see above');
  await db.end();
  process.exit(ok ? 0 : 2);
})().catch((e) => { console.error(e.message); process.exit(1); });
