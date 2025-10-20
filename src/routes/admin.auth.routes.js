import express from "express";
import {
  adminLogin,
  refreshAdminAccessToken,
  logoutAdmin,
} from "../controllers/admin.auth.controller.js";
import { verifyAdminToken } from "../middlewares/admin.middleware.js";
const router = express.Router();

// 🔐 Auth & Access Control
router.post("/login", adminLogin);
router.post("/refresh-token", refreshAdminAccessToken);
router.post("/logout", verifyAdminToken, logoutAdmin);

export default router;
