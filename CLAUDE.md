# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MERN expense tracker ("Expensely"). Two independent apps in one repo with no shared workspace/package — `Backend/` and `Frontend/` each have their own `package.json`, `node_modules`, and lockfile, and are run/installed separately.

## Commands

**Backend** (run from `Backend/`):
- `npm start` — runs `nodemon server.js` (connects to Mongo, then listens on `process.env.PORT`)
- No test suite is configured (`npm test` is a stub that exits 1)
- No lint script configured
- Requires a `.env` with `PORT`, `MONGO_URI`, `JWT_SECRET_ACCESS_TOKEN`, `JWT_SECRET_REFRESH_TOKEN`

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

**Auth flow**: login issues both an access token (15m) and refresh token (7d) as httpOnly cookies (`Utils/cookieOptions.js`); the refresh token is also persisted on the `User` document so it can be invalidated (logout sets it to `null`, and `/auth/refresh` checks the cookie value against the stored one before issuing a new access token). `authenticateToken` middleware reads the `accessToken` cookie and returns `401` with `code: "TOKEN_EXPIRED"` specifically when the JWT is expired (vs `403` for any other invalid-token case) — that code is meant to be the client's signal to call `/auth/refresh`. Rate limiting on login/register/refresh lives in `Middlewares/rate.limiter.js` and is skipped in `NODE_ENV=development`.

CORS in `app.js` is hardcoded to `http://localhost:5173` with `credentials: true` — update this if the frontend's dev origin or deployed origin changes.

### Frontend (React 19 + TypeScript + Vite)

**Never call `fetch` directly from a component.** All network access goes through `src/api/client.ts`'s `apiRequest()`, which sets `credentials: "include"` + JSON headers, and — critically — catches a `401` carrying `code: "TOKEN_EXPIRED"`, calls `/auth/refresh`, and replays the original request once. Concurrent refreshes are de-duped behind a single shared promise (the dashboard fires several requests at mount). Failures throw `ApiError` (carrying `status` + server `message`), which pages catch to drive toasts. `setSessionExpiredHandler()` lets `AuthContext` clear the user when refresh itself fails, without this module importing React Router. Typed wrappers live in `api/auth.ts`, `api/expenses.ts`, `api/budgets.ts`.

**State**: three contexts, not prop drilling. `AuthContext` (user + login/logout/updateCurrency, restores session via `/auth/me` on mount) is app-wide; `ExpenseContext` and `BudgetContext` are mounted only around the authenticated layout route. Both cache their list once per session and mutate it locally after a write instead of refetching. Both also clear their list **during render** (not in an effect) when `user` goes null — that's deliberate, so one account's data is never briefly visible to the next.

**Routing**: `App.tsx` has a layout route wrapping `ProtectedRoute → ExpenseProvider → BudgetProvider → AppLayout`; `AppLayout` renders the sidebar plus an `<Outlet/>`, so `/dashboard`, `/expenses`, `/budgets` and `/settings` all share one sidebar instance and one data cache. `PublicOnlyRoute` bounces signed-in users off `/login` and `/register`. Unknown paths and `/` redirect to `/dashboard`.

**Currency**: persisted per user on the backend (`User.currency`), read through the `useCurrency()` hook, and rendered via `formatCurrency`/`formatCompact` from `utils/currency.ts`. Components take pre-formatted strings where practical (e.g. `OverviewCards`' `value` prop) so they never hardcode a symbol — there should be no literal `₹` anywhere in components.

**Styling**: hand-written CSS per component/page, no framework. The shared design tokens in `App.css`'s `:root` are the whole system — cards compose `--surface-panel` + `--border-hairline` + `--shadow-elevated` + `--highlight-top` (a translucent gradient with an inset top highlight, which is what reads as "glass" rather than a flat fill). Reusable page furniture (`.page-header`, `.surface-card`) also lives in `App.css`. Breakpoints are literal repeated values (CSS custom properties can't be used in `@media` conditions) — 1024px collapses the sidebar to an icon rail, 640px turns it into a fixed bottom tab bar and the expense table into stacked cards via `td::before { content: attr(data-label) }`.
