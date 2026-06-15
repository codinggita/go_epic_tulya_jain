const express = require("express");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middlewares/auth.middleware");
const { sendSuccess, sendError } = require("../utils/response.util");

const router = express.Router();



/**
 * POST /jwt/generate-token
 * Generates a mock or custom token for testing
 */
router.post("/generate-token", (req, res) => {
  const { id, role } = req.body;
  if (!id || !role) {
    return sendError(res, "User ID and Role are required.", null, 400);
  }
  const token = jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
  return sendSuccess(res, "Token generated successfully.", { token }, 200);
});

/**
 * POST /jwt/verify-token
 * Verifies a token and returns decoded payload
 */
router.post("/verify-token", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return sendError(res, "Token is required.", null, 400);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return sendSuccess(res, "Token verified.", decoded, 200);
  } catch (error) {
    return sendError(res, "Token verification failed.", error, 401);
  }
});

/**
 * POST /jwt/refresh-token
 * Verify refresh token and issue new access token
 */
router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, "Refresh token is required.", null, 400);
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, role: "user" }, // Mock or look up role if needed
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "15m" }
    );
    return sendSuccess(res, "Access token refreshed.", { accessToken }, 200);
  } catch (error) {
    return sendError(res, "Invalid refresh token.", error, 401);
  }
});

/**
 * GET /jwt/profile
 * Access JWT protected profile
 */
router.get("/profile", protect, (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.refreshTokens;
  return sendSuccess(res, "JWT profile accessed successfully.", user, 200);
});

/**
 * GET /jwt/dashboard
 * Access JWT protected dashboard
 */
router.get("/dashboard", protect, (req, res) => {
  return sendSuccess(
    res,
    "Access granted to JWT Dashboard.",
    {
      stats: {
        activeUsers: 42,
        serverUptime: process.uptime(),
      },
    },
    200
  );
});

/**
 * GET /jwt/admin
 * Access admin protected route
 */
router.get("/admin", protect, authorize("admin"), (req, res) => {
  return sendSuccess(res, "Access granted to admin-only dashboard.", { isAdmin: true }, 200);
});

/**
 * GET /jwt/user
 * Access user protected route
 */
router.get("/user", protect, authorize("user", "admin"), (req, res) => {
  return sendSuccess(res, "Access granted to user-only area.", { role: req.user.role }, 200);
});

/**
 * GET /jwt/check-role/admin
 * Verify admin role
 */
router.get("/check-role/admin", protect, authorize("admin"), (req, res) => {
  return sendSuccess(res, "Admin role verified successfully.", { isAdmin: true }, 200);
});

module.exports = router;
