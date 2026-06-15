const authService = require("../services/auth.service");
const { sendSuccess, sendError } = require("../utils/response.util");
const { asyncHandler } = require("../middlewares/error.middleware");

/**
 * Register User
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = await authService.register({ username, email, password, role });
  return sendSuccess(res, "User registered successfully.", user, 201);
});

/**
 * Login User
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, "Login successful.", result, 200);
});

/**
 * Logout User
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, "Refresh token is required.", null, 400);
  }
  await authService.logout(req.user._id, refreshToken);
  return sendSuccess(res, "Logged out successfully.", null, 200);
});

/**
 * Get User Profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  delete user.refreshTokens;
  return sendSuccess(res, "Profile fetched successfully.", user, 200);
});

/**
 * Update User Profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { username, email } = req.body;

  if (username) user.username = username;
  if (email) user.email = email;

  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;
  delete updatedUser.refreshTokens;

  return sendSuccess(res, "Profile updated successfully.", updatedUser, 200);
});

/**
 * Request Password Reset (Forgot Password)
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, "Email is required.", null, 400);
  }
  const otp = await authService.forgotPassword(email);
  return sendSuccess(res, "OTP sent for password reset.", { email, otp }, 200);
});

/**
 * Reset Password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return sendError(res, "Email, OTP, and newPassword are required.", null, 400);
  }
  await authService.resetPassword(email, otp, newPassword);
  return sendSuccess(res, "Password reset successfully.", null, 200);
});

/**
 * Send OTP
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, "Email is required.", null, 400);
  }
  const otp = await authService.sendOtp(email);
  return sendSuccess(res, "OTP verification sent successfully.", { email, otp }, 200);
});

/**
 * Verify OTP
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return sendError(res, "Email and OTP are required.", null, 400);
  }
  await authService.verifyOtp(email, otp);
  return sendSuccess(res, "OTP verified successfully.", null, 200);
});

/**
 * Refresh JWT Token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.headers["x-refresh-token"];
  if (!token) {
    return sendError(res, "Refresh token is missing.", null, 400);
  }
  const tokens = await authService.refreshAccessToken(token);
  return sendSuccess(res, "Token refreshed successfully.", tokens, 200);
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  refreshToken,
};
