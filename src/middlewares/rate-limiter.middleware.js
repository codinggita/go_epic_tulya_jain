const rateLimit = require("express-rate-limit");

// Standard message when limit is exceeded
const createLimitMessage = (action) => ({
  success: false,
  message: `Too many requests to ${action}. Please try again after a minute.`,
});

// General requests rate limiter (60 per minute)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: createLimitMessage("API endpoints"),
});

// Auth login limiter (5 per minute)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: createLimitMessage("login"),
});

// Auth register limiter (3 per minute)
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: createLimitMessage("register"),
});

// Search limiter (20 per minute)
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: createLimitMessage("search"),
});

// Admin dashboard limiter (10 per minute)
const adminDashboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: createLimitMessage("admin dashboard"),
});

// Problem submission limiter (10 per minute for POST)
const problemSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: createLimitMessage("create problems"),
});

// Delete dataset limiter (5 per minute)
const deleteDatasetLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: createLimitMessage("delete datasets"),
});

// Bulk import limiter (3 per minute)
const importLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: createLimitMessage("bulk import"),
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  searchLimiter,
  adminDashboardLimiter,
  problemSubmissionLimiter,
  deleteDatasetLimiter,
  importLimiter,
};
