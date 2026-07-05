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
} from "../Controllers/user.controller.js";
import { authenticateToken } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, userLogin);
router.post("/logout", authenticateToken, userLogout);
router.post("/refresh", refreshLimiter, refreshToken);

export default router;
