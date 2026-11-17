# GuruMera production cut-over checklist

Nothing in this list has been applied to production. It is the single place that collects every step to run
once all sprints are finished. Update it as each sprint lands.

## 1. Database (Neon): do this on a Neon branch first, then on main
Apply in this order. Never re-run `002_v230_public_hub.sql` after 004 (it re-opens the users-policy leak).

1. `database/migrations/004_sprint0_security.sql`
   - `psql "$OWNER_URL" -v app_password="'<strong password>'" -f database/migrations/004_sprint0_security.sql`
   - Creates the restricted role `gurumera_app` (NOBYPASSRLS), tightens RLS, MFA columns.
2. `database/migrations/005_onboarding.sql` (tenant_type, owner_user_id, grade 6-13 check, lookup indexes)
3. `database/migrations/006_teacher_audit.sql` (transcript_access_log table with RLS)
4. `database/migrations/007_parent_acknowledgements.sql` (parent_acknowledgements table with RLS)
5. `database/migrations/008_email_tokens.sql` (users.email_verified_at, email_tokens)
6. `database/production/lock_seed_accounts.sql` (deactivates every account that still has the published seed password)
7. Create your own super admin:
   `DATABASE_URL=<owner url> SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=<14+ chars> node services/api-gateway/scripts/create-super-admin.js`
8. Do NOT load `database/seed.sql` (dev only).

## 2. Environment variables (API gateway, AI gateway, web)
- `NODE_ENV=production`; `ENABLE_DEMO_MODE` unset/false; `NEXT_PUBLIC_ENABLE_DEMO` unset
- `DATABASE_URL` (owner) and `DATABASE_APP_URL` (role `gurumera_app`); use the Neon direct host if the pooler rejects session settings
- `JWT_SECRET` (32+ random chars), `AI_GATEWAY_API_KEY`, `AES_ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID` (API) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (web)
- `CORS_ORIGINS` = your exact web origins; `TRUST_PROXY` set to match your host
- `BREVO_API_KEY`, `EMAIL_FROM` (an address on a domain you have authenticated in Brevo), `EMAIL_FROM_NAME`, `APP_BASE_URL` (e.g. https://gurumera.com; used for links in emails)
- `HUB_GLOBAL_DAILY_AI_LIMIT`, `STUDENT_HOURLY_AI_LIMIT` (40), `SCHOOL_DAILY_AI_LIMIT` (6000), `TUTOR_DAILY_AI_LIMIT` (1500): AI cost caps; tune once pricing and the real LLM provider are known
- Teachers' `[[answer: ...]]` tags: tell teachers to use them so answers are enforced; the model itself never receives them
- The AI gateway must not be reachable from the internet; only the API gateway calls it.

## 3. Deploy
- `npm install` in `services/api-gateway` (adds helmet), rebuild all three services
- Smoke test after deploy: sign in as the new super admin (MFA enrol), create a school via /start/school, a tutor via /start/teacher, join via /join

## 4. Still open before launch
- Make sure the mailbox sales@gurumera.com exists and is monitored (pricing page, contact pop-up and schools page all point to it); leads from the schools form appear in the super-admin page
- Brevo setup: verify the gurumera.com sending domain (SPF, DKIM, DMARC DNS records) and send yourself a test reset email before launch; unauthenticated domains land in spam
- Emails are sent but sign-in is not blocked for unverified addresses (by design for now)
- HttpOnly cookie sessions (tokens are still in localStorage); needs the hosting layout
- Remove FERPA/COPPA and other unsupported claims from public pages; real privacy policy and terms (consult a Pakistani lawyer)
- Remaining sprints: coursework, teacher audit, parent view + acknowledgement, tutor-engine hardening, pricing
