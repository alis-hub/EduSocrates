#!/usr/bin/env node
/**
 * Creates (or resets) the platform super admin with a password YOU choose.
 *
 *   DATABASE_URL="<owner connection string>" \
 *   SUPER_ADMIN_EMAIL="you@yourdomain.com" \
 *   SUPER_ADMIN_PASSWORD="a long unique passphrase" \
 *   node scripts/create-super-admin.js
 *
 * On first sign-in the account must enrol an authenticator app (MFA) before it can do anything.
 */
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const HUB_TENANT = '00000000-0000-0000-0000-000000000000';
const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD || '';

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { console.error('Set SUPER_ADMIN_EMAIL to a valid email.'); process.exit(1); }
if (password.length < 14 || password.length > 72) { console.error('SUPER_ADMIN_PASSWORD must be 14-72 characters.'); process.exit(1); }
if (!process.env.DATABASE_URL) { console.error('Set DATABASE_URL (owner connection).'); process.exit(1); }

(async () => {
  const db = new Client({ connectionString: process.env.DATABASE_URL, ssl: /sslmode=require|neon\.tech/.test(process.env.DATABASE_URL) ? { rejectUnauthorized: true } : undefined });
  await db.connect();
  const hash = await bcrypt.hash(password, 12);
  const r = await db.query(
    `INSERT INTO users (school_id, role, email, password_hash, first_name, last_name, is_active, mfa_enabled, mfa_secret)
     VALUES ($1, 'SUPER_ADMIN', $2, $3, 'Platform', 'Admin', TRUE, FALSE, NULL)
     ON CONFLICT (school_id, email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, is_active = TRUE, mfa_enabled = FALSE, mfa_secret = NULL
     RETURNING id, email`,
    [HUB_TENANT, email, hash],
  );
  console.log('Super admin ready:', r.rows[0].email, '— sign in and set up your authenticator app.');
  await db.end();
})().catch((e) => { console.error('Failed:', e.message); process.exit(1); });
