/**
 * Relative by design. In production Vercel rewrites /api/* to the Render
 * backend, and in development Vite proxies it (see vite.config.ts) — so the
 * browser always sees a same-origin request and the auth cookies stay
 * first-party. Set VITE_API_BASE_URI only to point at a backend directly,
 * which reintroduces CORS and third-party cookies.
 */
export const API_BASE_URI = import.meta.env.VITE_API_BASE_URI ?? "/api/v1";

export const API_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

export const API_RESPONSE = {
  SUCCESS: "success",
  ERROR: "error",
};
