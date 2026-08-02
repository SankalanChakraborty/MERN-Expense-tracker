import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./Routes/user.routes.js";
import expenseRouter from "./Routes/expense.route.js";
import budgetRouter from "./Routes/budget.route.js";
import { API_BASE_URI } from "./enum.js";
import { errorHandler } from "./Middlewares/auth.middleware.js";

dotenv.config();

const app = express();

/**
 * In production the app sits behind proxies (Vercel's rewrite, then Render's
 * load balancer), so `req.ip` is the proxy's address unless Express is told
 * how many hops to trust. Getting this wrong breaks the rate limiters: too low
 * and every visitor shares one key, too high and clients can spoof X-Forwarded-For.
 * Tune with TRUST_PROXY and confirm against GET /api/v1/health, which echoes the
 * IP Express resolved.
 */
const trustProxy = process.env.TRUST_PROXY;
app.set("trust proxy", trustProxy ? Number(trustProxy) : false);

/**
 * This list controls which *websites* may call the API from a browser with
 * cookies attached — it has nothing to do with where users are located.
 * Normal traffic is same-origin (Vercel rewrites /api/* to this service) and
 * carries no Origin header at all, so it is allowed regardless of this list.
 *
 * The localhost default is development-only on purpose: shipping it as the
 * production fallback would be meaningless, and defaulting to "*" would let
 * any site on the internet call this API with a signed-in user's cookies.
 */
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ?? (isProduction ? "" : "http://localhost:5173")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && allowedOrigins.length === 0) {
  console.warn(
    "CLIENT_ORIGINS is not set. Proxied same-origin traffic still works, but " +
      "direct cross-origin browser calls will be rejected. Set it to your " +
      "frontend URL (e.g. https://expensely.vercel.app).",
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin/proxied/server-side requests arrive without an Origin header.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      // Tagged so errorHandler returns a clean 403 instead of a generic 500.
      const error = new Error(`Origin ${origin} is not allowed by CORS`);
      error.statusCode = 403;
      return callback(error);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Liveness probe: wakes the free-tier dyno, reports whether Mongo is actually
// connected (the port opens before the handshake completes), and echoes the
// resolved client IP so trust-proxy can be verified.
const DB_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

app.get(`${API_BASE_URI.ROUTE}/health`, (req, res) => {
  const db = DB_STATES[mongoose.connection.readyState] ?? "unknown";
  // 503 while the database isn't usable, so a platform health check doesn't
  // treat a half-started service as healthy.
  res.status(db === "connected" ? 200 : 503).json({
    status: db === "connected" ? "success" : "error",
    db,
    uptime: Math.round(process.uptime()),
    clientIp: req.ip,
    forwardedFor: req.headers["x-forwarded-for"] ?? null,
  });
});

app.use(`${API_BASE_URI.ROUTE}/auth`, userRouter);
app.use(`${API_BASE_URI.ROUTE}/expense`, expenseRouter);
app.use(`${API_BASE_URI.ROUTE}/budget`, budgetRouter);
app.use(errorHandler);

export default app;
