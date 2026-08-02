import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    // The access cookie carries the token's own 15m maxAge, so the browser
    // usually drops it before the JWT can be seen as expired — this, not
    // TOKEN_EXPIRED, is the normal "needs a refresh" case.
    return res.status(401).json({
      status: "error",
      message: "Access token is missing",
      code: "TOKEN_MISSING",
    });
  }
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET_ACCESS_TOKEN,
    );
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }
};

/**
 * Error handling middleware for async operations
 * Should be last in middleware chain
 */
export const errorHandler = (err, req, res, next) => {
  // Expected client errors (rejected CORS origin, bad id, bad token) are routine
  // on a public API — log one line. Only unexpected failures get a stack trace,
  // so real bugs stay findable instead of buried under bot traffic.
  const EXPECTED = [
    "ValidationError",
    "CastError",
    "JsonWebTokenError",
    "TokenExpiredError",
  ];
  if ((err.statusCode && err.statusCode < 500) || EXPECTED.includes(err.name)) {
    console.warn(
      `${err.statusCode ?? err.name} ${req.method} ${req.originalUrl}: ${err.message}`,
    );
  } else {
    console.error("Error:", err);
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Validation error",
        errors: err.errors,
      });
  }

  // Malformed ObjectId (e.g. an invalid expense id in a route param)
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid expense id" });
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res
      .status(400)
      .json({ status: "error", message: `${field} already exists` });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "error", message: "Token expired" });
  }

  const statusCode = err.statusCode || 500;
  // Never echo an unexpected error's message to the client in production — it
  // can carry driver internals, query fragments or connection strings.
  const isSafeToExpose =
    statusCode < 500 || process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    status: "error",
    message: (isSafeToExpose && err.message) || "Internal server error",
  });
};
