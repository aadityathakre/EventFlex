import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/users.auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
const router = express.Router();

// auth user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyToken, logoutUser);

export default router;
