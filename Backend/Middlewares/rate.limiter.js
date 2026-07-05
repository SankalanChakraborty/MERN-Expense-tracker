// middlewares/rateLimiter.middleware.js

import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req, res) => req.ip, // Key by IP
  skip: (req, res) => process.env.NODE_ENV === "development", // Skip in dev
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many login attempts, try again later",
    });
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: "Too many registration attempts, try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV === "development",
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts
  message: "Too many refresh attempts",
  standardHeaders: true,
  legacyHeaders: false,
});
