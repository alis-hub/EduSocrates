-- Run ONCE on any database that was loaded with database/seed.sql (including Neon).
-- Every seeded account shares the published password "Password123!". This disables them all:
-- they can no longer sign in, and nobody can use them to enrol their own authenticator app.
-- Idempotent. Real accounts (with their own password hashes) are not touched.
--
--   psql "<owner connection string>" -f database/production/lock_seed_accounts.sql

UPDATE users
SET is_active = FALSE,
    password_hash = '!locked-' || id::text
WHERE password_hash = '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a';

-- Review what is left:
SELECT role, email, is_active FROM users ORDER BY role, email;
