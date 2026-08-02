# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MERN expense tracker ("Expensely"). Two independent apps in one repo with no shared workspace/package — `Backend/` and `Frontend/` each have their own `package.json`, `node_modules`, and lockfile, and are run/installed separately.

## Commands

**Backend** (run from `Backend/`):
- `npm run dev` — nodemon with reload. `npm start` is `node server.js` (production; do not change it back to nodemon)
- `npm run test:integration` — full auth/expense/budget suite against a throwaway in-memory MongoDB. No config or network needed; run this after touching auth
- No lint script configured
- Copy `.env.example` → `.env`. `server.js` exits at boot if `MONGO_URI` or either JWT secret is missing

**Frontend** (run from `Frontend/`):
- `npm run dev` — Vite dev server (defaults to port 5173, which the backend's CORS config hardcodes as the allowed origin)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint (flat config, TS + react-hooks + react-refresh rules)
- `npm run preview` — preview the production build
- No test suite configured

There's no root-level script — the two apps must be started separately in two terminals for local dev.

## Architecture

### Backend (Express 5 + Mongoose, ESM)

Standard Routes → Controllers → Models layering:
- `app.js` wires middleware (cors, json, cookie-parser) and mounts routers; `errorHandler` (from `Middlewares/auth.middleware.js`) is mounted last and must stay last — it's the central place Mongoose validation errors, duplicate-key errors, and JWT errors get turned into JSON responses.
- `server.js` is the actual entrypoint: calls `connectDB()` then `app.listen`.
- All routes are mounted under the prefix in `enum.js` (`API_BASE_URI.ROUTE = "/api/v1"`): `/api/v1/auth/*`, `/api/v1/expense/*`, `/api/v1/budget/*`.
- `enum.js` holds `ExpenseType` (the Mongoose enum for both `expense.model.js` and `budget.model.js`) and `SUPPORTED_CURRENCIES` (the enum for `user.model.js`'s `currency` field). The frontend keeps its own mirrors — `Frontend/src/constants/categories.ts` and `Frontend/src/utils/currency.ts` — so **both sides must be updated together** when categories or currencies change; the API rejects anything outside its enum.
- Budgets are standing monthly caps, one per (user, category), enforced by a unique compound index; `setBudget` upserts on that pair rather than creating duplicates. There is no per-month budget record — "this month's spend" is computed on the frontend by filtering expenses.
- Ownership checks on `expense`/`budget` edit+delete return **404** (not 403) when the document belongs to another user, so a non-owner can't distinguish "missing" from "not yours".

**Auth flow**: registration creates an **unverified** user and emails a 6-digit OTP (`Utils/mailer.js`, `Utils/otp.js`); `/auth/login` returns `403` + `code: "EMAIL_NOT_VERIFIED"` until `/auth/verify-otp` succeeds. OTPs are bcrypt-hashed, expire in 10 minutes, and allow 5 attempts. Login then issues an access token (15m) and refresh token (7d) as httpOnly cookies (`Utils/cookieOptions.js`); the refresh token is persisted on the `User` doc so logout can revoke it.

> **`select: false` is a recurring trap in `user.model.js`.** `password`, `refreshToken`, `otpHash`, `otpExpiresAt` and `otpAttempts` are all hidden by default, so any query that *reads* them must opt in with `.select("+field")`. Forgetting this doesn't error — the field is silently `undefined` and the comparison fails. That exact bug made `/auth/refresh` return 403 for every request.

Rate limiting lives in `Middlewares/rate.limiter.js` and is skipped in `NODE_ENV=development`.

**Deployment** (see `DEPLOYMENT.md`): Vercel serves the frontend and rewrites `/api/*` to Render, so the browser sees one origin and the auth cookies stay first-party — this is deliberate, since split domains would make them third-party and Safari/Brave/Firefox would block login. `app.js` therefore needs no CORS for normal traffic; `CLIENT_ORIGINS` is only a safety net for direct API access. `TRUST_PROXY` controls client-IP resolution behind those two proxy hops — get it wrong and the rate limiters either key every visitor together or become spoofable. `GET /api/v1/health` echoes the resolved IP for checking.

### Frontend (React 19 + TypeScript + Vite)

**Never call `fetch` directly from a component.** All network access goes through `src/api/client.ts`'s `apiRequest()`, which sets `credentials: "include"` + JSON headers, and — critically — recovers expired sessions: on **any** `401` it calls `/auth/refresh` and replays the original request once. Concurrent refreshes are de-duped behind a single shared promise (the dashboard fires several requests at mount). Failures throw `ApiError` (carrying `status` + server `message`), which pages catch to drive toasts. `setSessionExpiredHandler()` lets `AuthContext` clear the user when refresh itself fails, without this module importing React Router. Typed wrappers live in `api/auth.ts`, `api/expenses.ts`, `api/budgets.ts`.

> **Don't narrow that 401 check to `code === "TOKEN_EXPIRED"`.** The access cookie is set with the same 15m `maxAge` as the JWT it carries, so the browser drops it *before* the server can ever see an expired token — the normal expiry case arrives as a **missing** cookie (`code: "TOKEN_MISSING"`), and gating on `TOKEN_EXPIRED` makes refresh dead code that leaves users stuck on "Access token is missing" after 15 minutes. `NO_REFRESH_PATHS` excludes `/auth/login`, `/auth/register` and `/auth/refresh`, whose 401s are genuine and must not trigger a retry.

**State**: three contexts, not prop drilling. `AuthContext` (user + login/logout/updateCurrency, restores session via `/auth/me` on mount) is app-wide; `ExpenseContext` and `BudgetContext` are mounted only around the authenticated layout route. Both cache their list once per session and mutate it locally after a write instead of refetching. Both also clear their list **during render** (not in an effect) when the user goes null — deliberate, so one account's data is never briefly visible to the next. Both key their fetch effect on `user?.id`, **not the `user` object**: `AuthContext` returns a fresh object on every profile write, so depending on the object would refetch every expense and budget whenever someone changes their currency.

**Confirmations**: use `Components/ConfirmDialog.tsx` (escape/overlay dismissal, focused confirm button, `isBusy` state, `tone="danger"`), never `window.confirm`. Expense deletion is wrapped in `hooks/useExpenseDelete.ts`, which owns the dialog state, the API call and the toast — spread its `dialogProps` onto a `<ConfirmDialog />` and pass `requestDelete` as `ExpenseTable`'s `onDelete`.

**API base URL is relative on purpose.** `constants.ts` resolves to `/api/v1`; Vite proxies it in dev (`vite.config.ts`) and Vercel rewrites it in production. Never hardcode `http://localhost:8080` — that reintroduces CORS and breaks first-party cookies.

**Routing**: `App.tsx` has a layout route wrapping `ProtectedRoute → ExpenseProvider → BudgetProvider → AppLayout`; `AppLayout` renders the sidebar plus an `<Outlet/>`, so `/dashboard`, `/expenses`, `/budgets` and `/settings` all share one sidebar instance and one data cache. `PublicOnlyRoute` bounces signed-in users off `/login` and `/register`. Unknown paths and `/` redirect to `/dashboard`.

**Currency**: persisted per user on the backend (`User.currency`), read through the `useCurrency()` hook, and rendered via `formatCurrency`/`formatCompact` from `utils/currency.ts`. Components take pre-formatted strings where practical (e.g. `OverviewCards`' `value` prop) so they never hardcode a symbol — there should be no literal `₹` anywhere in components.

**Styling**: hand-written CSS per component/page, no framework. The shared design tokens in `App.css`'s `:root` are the whole system — cards compose `--surface-panel` + `--border-hairline` + `--shadow-elevated` + `--highlight-top` (a translucent gradient with an inset top highlight, which is what reads as "glass" rather than a flat fill). Reusable page furniture (`.page-header`, `.surface-card`) also lives in `App.css`. Breakpoints are literal repeated values (CSS custom properties can't be used in `@media` conditions) — 1024px collapses the sidebar to an icon rail, 640px turns it into a fixed bottom tab bar and the expense table into stacked cards via `td::before { content: attr(data-label) }`.
