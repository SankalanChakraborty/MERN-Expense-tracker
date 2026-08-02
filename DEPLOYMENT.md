# Deploying Expensely

**Topology:** frontend on Vercel, backend on Render, MongoDB on Atlas.
Vercel rewrites `/api/*` to Render, so the browser only ever talks to **one
origin**. That matters: the auth cookies stay first-party, which keeps login
working in Safari, Brave and Firefox — all of which block third-party cookies.

```
                    https://<you>.vercel.app
browser ──────────► ├── /*        Vercel CDN (React build)
                    └── /api/*    rewrite ──► https://<you>.onrender.com ──► Atlas
```

Everything below is free tier. Expect one caveat: **Render's free instance
sleeps after ~15 minutes idle**, so the first request after a quiet period takes
about 50 seconds. Subsequent requests are fast.

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a user, copy the password.
3. **Network Access** → allow `0.0.0.0/0`. Render's egress IP is dynamic, so an
   IP allowlist will not work.
4. Copy the connection string; it becomes `MONGO_URI`.

## 2. Brevo (verification emails)

1. Sign up at brevo.com — 300 emails/day free, no card, no domain needed.
2. **Senders, Domains & Dedicated IPs → Senders** → add and confirm the address
   you want mail to come from.
3. **SMTP & API → SMTP** → copy the login and the SMTP key.

That maps to:

| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | the SMTP login Brevo shows |
| `SMTP_PASS` | the SMTP **key** (not your account password) |
| `MAIL_FROM` | `"Expensely" <your-verified@address>` |

Any SMTP provider works — only these five values change.

## 3. Backend on Render

1. **New → Web Service**, connect the repo.
2. Root directory `Backend`, build `npm ci --omit=dev`, start `npm start`.
   (Or use **New → Blueprint**, which reads `render.yaml` and sets all of this.)
   `--omit=dev` matters: `mongodb-memory-server` is a devDependency that
   downloads a full MongoDB binary at install time.
3. Health check path: `/api/v1/health`.
4. Environment variables:

```
NODE_ENV=production
MONGO_URI=<from Atlas>
JWT_SECRET_ACCESS_TOKEN=<see below>
JWT_SECRET_REFRESH_TOKEN=<different value>
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<Brevo SMTP login>
SMTP_PASS=<Brevo SMTP key>
MAIL_FROM="Expensely" <your-verified@address>
TRUST_PROXY=1
CLIENT_ORIGINS=https://<your-app>.vercel.app     # add after step 4
```

Generate each secret separately — they must differ:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Do **not** set `PORT`; Render injects it.

## 4. Frontend on Vercel

1. **Add New → Project**, import the repo.
2. Root directory `Frontend`. Framework preset Vite (build `npm run build`,
   output `dist`) — Vercel detects this automatically.
3. Edit `Frontend/vercel.json` and replace the placeholder with your real Render
   URL:

```json
{ "source": "/api/:path*",
  "destination": "https://YOUR-SERVICE.onrender.com/api/:path*" }
```

4. Deploy, then go back and set `CLIENT_ORIGINS` on Render to the Vercel URL.

No frontend env vars are needed — the app calls `/api/v1` relative by design.

---

## 5. Verify the deploy

```bash
# 1. Backend is awake and reachable directly
curl https://YOUR-SERVICE.onrender.com/api/v1/health

# 2. The Vercel rewrite reaches it (this is the one that matters)
curl https://YOUR-APP.vercel.app/api/v1/health

# 3. Deep links don't 404 — proves the SPA fallback
curl -o /dev/null -w "%{http_code}\n" https://YOUR-APP.vercel.app/budgets
```

Then in a browser: register → check the inbox for the 6-digit code → verify →
sign in → add an expense → reload the page (you should stay signed in).

**Check `clientIp` in the health response.** If every visitor shows the same
address, the rate limiters are keying everyone together — raise `TRUST_PROXY`
until it resolves to real visitor IPs.

---

## Notes and gotchas

- **Existing accounts.** `isVerified` defaults to `false`, so any user created
  before email verification existed must verify on next sign-in. They can do it
  from the login screen (wrong password → verify prompt → *Resend code*). To
  start clean instead, drop the `users` collection in Atlas.
- **Cold starts.** The first request after idle takes ~50s. An uptime pinger
  (UptimeRobot, cron-job.org) hitting `/api/v1/health` every 10 minutes keeps it
  warm, though it does consume free-tier hours.
- **Secrets.** `Backend/.env` is gitignored; `Backend/.env.example` documents the
  shape. Never commit real values — set them in the Render dashboard.
- **HTTPS is required.** In production, cookies are set `secure: true`. Over
  plain HTTP the browser silently drops them and every request looks logged out.
  Both Vercel and Render provide HTTPS by default.
- **Rate limits in production.** Login 5 / 15 min, register 23 / hr, OTP verify
  20 / 15 min, OTP resend 5 / 15 min, refresh 10 / min. These are skipped in
  development.

## Local development

```bash
cd Backend  && cp .env.example .env && npm install && npm run dev   # :8080
cd Frontend && npm install && npm run dev                          # :5173
```

Vite proxies `/api` to `:8080`, so local dev is same-origin too and CORS never
applies. With no SMTP configured, the verification code is printed to the
backend console instead of emailed.

Run the backend integration suite (spins up a throwaway MongoDB, no config
needed):

```bash
cd Backend && npm run test:integration
```
