import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res
      .status(401)
      .json({ status: "error", message: "Access token is missing" });
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
  console.error("Error:", err);

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

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};
