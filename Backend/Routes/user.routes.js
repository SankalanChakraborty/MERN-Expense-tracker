import express from "express";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
} from "../Middlewares/rate.limiter.js";
import {
  userLogin,
  registerUser,
  userLogout,
  refreshToken,
  getUserData,
  updatePreferences,
  verifyOtp,
  resendOtp,
} from "../Controllers/user.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticateToken, getUserData);
router.patch("/preferences", authenticateToken, updatePreferences);
router.post("/register", registerLimiter, registerUser);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.post("/resend-otp", otpResendLimiter, resendOtp);
router.post("/login", loginLimiter, userLogin);
router.post("/logout", authenticateToken, userLogout);
router.post("/refresh", refreshLimiter, refreshToken);

export default router;
