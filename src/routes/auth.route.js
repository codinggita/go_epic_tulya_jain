const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { validateRegister, validateLogin } = require("../middlewares/validate.middleware");
const { loginLimiter, registerLimiter } = require("../middlewares/rate-limiter.middleware");

const router = express.Router();


// Authentication routes
router.post("/register", registerLimiter, validateRegister, authController.register);
router.post("/login", loginLimiter, validateLogin, authController.login);
router.post("/logout", protect, authController.logout);
router.get("/profile", protect, authController.getProfile);
router.patch("/profile", protect, authController.updateProfile);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
