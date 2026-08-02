// middlewares/rateLimiter.middleware.js

import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, try again later",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => ipKeyGenerator(req.ip), // Key by IP
  skip: (req, res) => process.env.NODE_ENV === "development", // Skip in dev
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many login attempts, try again later",
    });
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV === "development",
  // Must be JSON: the frontend parses every error body as JSON and falls back
  // to a generic "Something went wrong" when that fails — which would hide the
  // real reason and invite the user to retry into the same wall.
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many registration attempts, try again later",
    });
  },
});

// Guards the 6-digit code against online brute force. The per-user attempt
// counter in verifyOtp is the other half of this: one caps guesses per account,
// this caps them per IP across accounts.
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development",
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many verification attempts, try again later",
    });
  },
});

// Keeps the mail quota (and the user's inbox) from being used as a weapon.
export const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development",
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many code requests, try again in a few minutes",
    });
  },
});

export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many refresh attempts, try again in a moment",
    });
  },
});
