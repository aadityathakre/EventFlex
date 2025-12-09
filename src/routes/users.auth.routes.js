import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  sendOTP,
  verifyOtp,
  resetPassword,
  googleAuth,
} from "../controllers/users.auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

// auth user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyToken, logoutUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google-auth", googleAuth);

export default router;
