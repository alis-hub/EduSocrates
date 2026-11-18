# GuruMera production cut-over guide

Hosting: **Neon** (database) + **Render** (API, AI service, Redis) + **Vercel** (web) + **Brevo** (email).
Do this once, after all sprints are merged. Nothing here has been applied yet. Read it top to bottom first.
Never paste secrets into chat, git, or screenshots. Put them straight into the Render / Vercel / Neon dashboards.

Time needed: about 2 to 3 hours, mostly waiting for DNS and domain verification.

---

## 0. Before you start

You need accounts and access for: Neon, Render, Vercel, Brevo, Google Cloud (for Google sign-in), your domain's DNS
(where gurumera.com is managed), and an AI provider key (Gemini or OpenAI) if you want real tutoring instead of canned replies.

Paid plans are required in two places. Render's free web service sleeps when idle, which breaks sign-in and live
whiteboards, so use **Starter** for the API and AI service (about $7 each per month at the time of writing; check current prices).

Merge the work: open a pull request from `sprint-0-security` into `main` on GitHub and merge it.
Render and Vercel will deploy from `main`.

## 1. Make secrets (on your computer)

Run this in PowerShell once per secret and keep the outputs in a password manager:

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

You need three:

| Name | Used for |
|---|---|
| `APP_DB_PASSWORD` | password of the restricted database role (use the hex string; no symbols to escape) |
| `AI_GATEWAY_API_KEY` | shared secret between the API and the AI service |
| `SUPER_ADMIN_PASSWORD` | choose your own long passphrase (14+ characters) for your platform admin login |

Render generates `JWT_SECRET` and `AES_ENCRYPTION_KEY` for you.

## 2. Database (Neon)

1. In the Neon console, **create a branch** of your main branch and name it `pre-launch-backup`. This is your instant backup.
2. Get the **owner connection string** of the main branch, using the **direct** host (the one without `-pooler`).
   Keep it only in your terminal for the next steps.
3. In PowerShell, in the repository folder:

        cd services/api-gateway
        npm ci
        $env:DATABASE_URL = "<owner connection string>"
        $env:APP_DB_PASSWORD = "<APP_DB_PASSWORD from step 1>"
        node scripts/apply-migrations.js --lock-seed-accounts

   Expected end of output:

        gurumera_app role: login=true bypassrls=false superuser=false
        new tables without row security: 0
        active accounts still using the published demo password: 0
        OK

   This applies migrations 004 to 008 once each, switches on the restricted role, and disables every demo account
   (they all share a published password). It is safe to run again. It never touches `schema.sql`, `seed.sql`, `002` or `003`.
   **Never re-run `002_v230_public_hub.sql` on this database**; it would re-open a data leak.

   Tip: do a dry run first against a Neon branch copy of main, then run it on main.

4. Create your own platform admin:

        $env:SUPER_ADMIN_EMAIL = "you@yourdomain.com"
        $env:SUPER_ADMIN_PASSWORD = "<your passphrase>"
        node scripts/create-super-admin.js

   On first sign-in you will be asked to set up an authenticator app. Do it straight away.
5. Close the PowerShell window afterwards so the variables are gone.
6. The app connection string for Render is the same host and database, with the restricted role:

        postgresql://gurumera_app:<APP_DB_PASSWORD>@<direct host>/<database>?sslmode=require

## 3. Google sign-in

Google Cloud Console, APIs and Services, Credentials, your OAuth Web client:
- Authorised JavaScript origins: `https://gurumera.com` and `https://www.gurumera.com`
- Copy the **Client ID**. It is used in Render (`GOOGLE_CLIENT_ID`) and Vercel (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`).

## 4. Email (Brevo)

1. Brevo, Senders and domains, add and **authenticate `gurumera.com`**. Add the SPF, DKIM and DMARC DNS records Brevo shows. Wait until it says verified.
2. Create an API key (SMTP and API, API keys). This is `BREVO_API_KEY`.
3. The sender is `no-reply@gurumera.com` (an address on the verified domain). Also make sure the `sales@gurumera.com` mailbox exists.

## 5. API, AI service and Redis (Render)

1. Render dashboard, **New, Blueprint**, pick the GuruMera repository and the `main` branch. Render reads `render.yaml`
   and proposes three things: `gurumera-api`, `gurumera-ai` (private) and `gurumera-redis`.
2. Fill in the values it asks for (they are marked in the file as `sync: false`):

   | Service | Variable | Value |
   |---|---|---|
   | gurumera-api | `DATABASE_URL` | owner connection string (direct host) |
   | gurumera-api | `DATABASE_APP_URL` | the `gurumera_app` string from step 2.6 |
   | gurumera-api | `AI_GATEWAY_API_KEY` | from step 1 |
   | gurumera-api | `GOOGLE_CLIENT_ID` | from step 3 |
   | gurumera-api | `BREVO_API_KEY` | from step 4 |
   | gurumera-ai | `AI_GATEWAY_API_KEY` | **exactly the same value** as on the API |
   | gurumera-ai | `GEMINI_API_KEY` or `OPENAI_API_KEY` | your AI provider key (and `DEFAULT_PROVIDER` to match) |

3. Apply the blueprint and wait until both services show **Live**. Check `https://<your-render-url>/api/v1/health` returns `{"status":"ok"}`.
4. On `gurumera-api`, Settings, **Custom Domains**, add `api.gurumera.com`. Render shows a DNS target.
5. If the API fails to start, read its logs. It refuses to run with a weak or missing `JWT_SECRET` or `AI_GATEWAY_API_KEY`;
   that is deliberate.

## 6. Web (Vercel)

1. Vercel, **Add New Project**, import the repository. Set **Root Directory** to `services/web`. Framework: Next.js. Production branch: `main`.
2. Environment variables (Production):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://api.gurumera.com/api/v1` |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | from step 3 |

   Do **not** set `NEXT_PUBLIC_ENABLE_DEMO`. Demo logins must not exist in production.
3. Deploy, then add the domains `gurumera.com` and `www.gurumera.com` (make `www` redirect to the main domain).

## 7. DNS

At your DNS provider (follow the exact values Vercel and Render show; these are the usual shapes):

| Name | Type | Points to |
|---|---|---|
| `gurumera.com` | A (or ALIAS) | the value Vercel shows |
| `www` | CNAME | the value Vercel shows |
| `api` | CNAME | the value Render shows |
| Brevo records | TXT / CNAME | from step 4 |

**Important:** the web app and the API must both live under `gurumera.com` (as above). Sign-in sessions are stored in a
protected cookie shared between `gurumera.com` and `api.gurumera.com`. If you instead used the default `*.vercel.app` and
`*.onrender.com` addresses, browsers would block the cookie and nobody could stay signed in.

Wait for Vercel and Render to show the domains as verified with HTTPS.

## 8. Smoke test (do all of it, in a private browser window)

1. `https://gurumera.com` loads; the footer privacy link opens the policy; the pricing page shows "Contact sales".
2. **Sign in as your super admin**: you must be asked to set up an authenticator app; afterwards the super-admin page opens.
3. Try a demo login such as `admin@horizon.edu` / the old demo password: it must **fail**.
4. **Set up a test school** at `/start/school` with a throwaway email you can read. You should get a "Confirm your email" message within a minute (check spam). Click it.
5. **Reset password**: use "Forgot password" for that email, open the emailed link, set a new password, sign in with it.
6. **Tutor flow**: `/start/teacher`, make a class, copy the join code. In a second browser, `/join` with that code to create a student.
7. As the teacher, publish coursework with a `[[answer: ...]]` in the AI notes. As the student, open it and chat; ask for the answer directly. The tutor must not state it.
8. Open a whiteboard room in two browsers; drawing appears in both.
9. In the browser developer tools, Application tab: there must be a `gm_session` cookie marked **HttpOnly** and **Secure**, and **no** access token in Local Storage.
10. Invite a parent from the school admin page; the parent receives an email, accepts, sees the child, and acknowledges a graded result.

If something fails, check in this order: Render API logs, Render AI logs, the browser Network tab, Brevo's logs.

## 9. Roll back

- **Web**: Vercel, Deployments, pick the previous one, **Promote to Production** (instant).
- **API / AI**: Render, the service, Events, **Rollback** to the previous deploy.
- **Database**: the migrations only add things and tighten rules; they do not delete data, so you normally do not need to roll back.
  If the database itself is damaged, restore from the `pre-launch-backup` Neon branch.

## 10. First week

- Watch Render's logs and Brevo's delivery report each day.
- Check AI usage against the daily caps (`SCHOOL_DAILY_AI_LIMIT`, `TUTOR_DAILY_AI_LIMIT`, `STUDENT_HOURLY_AI_LIMIT`) and your AI provider bill; adjust in Render.
- Have a Pakistani lawyer review the privacy policy and terms.
- Ask teachers to use the `[[answer: ...]]` tag so answers are enforced.
