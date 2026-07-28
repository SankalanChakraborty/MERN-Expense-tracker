import express from "express";
import {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} from "../Middlewares/rate.limiter.js";
import {
  userLogin,
  registerUser,
  userLogout,
  refreshToken,
  getUserData,
} from "../Controllers/user.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticateToken, getUserData);
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, userLogin);
router.post("/logout", authenticateToken, userLogout);
router.post("/refresh", refreshLimiter, refreshToken);

export default router;
