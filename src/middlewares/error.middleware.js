const { sendError } = require("../utils/response.util");

/**
 * Common wrapper function for async express routes to eliminate try-catch blocks
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error encountered:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorDetails = null;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
    errorDetails = Object.values(err.errors).map((val) => val.message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate value field entered";
    errorDetails = err.keyValue;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, authorization denied";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired, please log in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails || err.message || err,
  });
};

module.exports = {
  asyncHandler,
  errorHandler,
};
