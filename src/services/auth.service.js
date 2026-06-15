const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Generate Access and Refresh JWT Tokens
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );

  return { accessToken, refreshToken };
};

/**
 * Register User
 */
const register = async ({ username, email, password, role }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already registered");
  }

  const user = await User.create({
    username,
    email,
    password,
    role: role || "user",
  });

  // Exclude password from the returned object
  const userObj = user.toObject();
  delete userObj.password;

  return userObj;
};

/**
 * Login User
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const tokens = generateTokens(user);

  // Save refresh token to user document
  user.refreshTokens.push(tokens.refreshToken);
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshTokens;

  return { user: userObj, ...tokens };
};

/**
 * Logout User
 */
const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
    await user.save();
  }
};

/**
 * Refresh Access Token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new Error("Invalid refresh token");
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Replace old refresh token with new refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    return tokens;
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
};

/**
 * Send OTP Verification
 */
const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  return otp;
};

/**
 * Verify OTP
 */
const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.otp || user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (new Date() > user.otpExpiry) {
    throw new Error("OTP has expired");
  }

  // Clear OTP fields upon successful verification
  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  return true;
};

/**
 * Request Password Reset (Forgot Password)
 */
const forgotPassword = async (email) => {
  return await sendOtp(email); // Re-use OTP generation for simplicity
};

/**
 * Reset Password
 */
const resetPassword = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  await verifyOtp(email, otp);

  // Set new password
  user.password = newPassword;
  await user.save();

  return true;
};

module.exports = {
  register,
  login,
  logout,
  refreshAccessToken,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  generateTokens,
};
