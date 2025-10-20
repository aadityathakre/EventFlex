import express from "express";
import {
  adminRegister,
  getAllRoles,
  banUser,
  getPendingKYC,
  approveKYC,
  rejectKYC,
  getUserDocuments,
  verifyESignature,
  createBadge,
  getDisputes,
  resolveDispute,
  getAuditLogs,
  broadcastMessage,
  notifyUser,
  getNotifications,
  getUserAnalytics,
  getEventAnalytics,
  getPaymentAnalytics,
  getLeaderboard,
} from "../controllers/admin.controller.js";
import { verifyAdminToken } from "../middlewares/admin.middleware.js";

const router = express.Router();

// 🔐 Auth & Access Control
router.post("/register", adminRegister);

// 🧑‍💼 Role & User Management
router.get("/roles", verifyAdminToken, getAllRoles);
router.put("/ban-user/:userid", verifyAdminToken, banUser);

// ✅ Verification & Compliance
router.get("/kyc/pending", verifyAdminToken, getPendingKYC);
router.get("/kyc/approve/:userid", verifyAdminToken, approveKYC);
router.get("/kyc/reject/:userid", verifyAdminToken, rejectKYC);
router.get("/documents/:userid", verifyAdminToken, getUserDocuments);
router.get("/e-signature/verify/:userid", verifyAdminToken, verifyESignature);

// 🏅 Badge
router.post("/badges/create", verifyAdminToken, createBadge);

// ⚖️ Disputes & Audit
router.get("/disputes", verifyAdminToken, getDisputes);
router.post("/disputes/resolve/:id", verifyAdminToken, resolveDispute);
router.get("/audit-logs", verifyAdminToken, getAuditLogs);

// 📢 Notifications
router.post("/broadcast", verifyAdminToken, broadcastMessage);
router.post("/notify/:userid", verifyAdminToken, notifyUser);
router.get("/notifications", verifyAdminToken, getNotifications);

// 📊 Analytics
router.get("/analytics/users", verifyAdminToken, getUserAnalytics);
router.get("/analytics/events", verifyAdminToken, getEventAnalytics);
router.get("/analytics/payments", verifyAdminToken, getPaymentAnalytics);
router.get("/leaderboard", verifyAdminToken, getLeaderboard);

export default router;