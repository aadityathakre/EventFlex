import express from "express";
import {
  adminLogin,
  getAllRoles,
  banUser,
  getPendingKYC,
  approveKYC,
  rejectKYC,
  getUserDocuments,
  verifyESignature,
} from "../controllers/admin.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 🔐 Auth & Access Control
router.post("/login", adminLogin);
router.get("/roles", verifyToken, authorizeRoles("admin"), getAllRoles);
router.put("/ban-user/:userid", verifyToken, authorizeRoles("admin"), banUser);

// ✅ Verification & Compliance
router.get("/kyc/pending", verifyToken, authorizeRoles("admin"), getPendingKYC);
router.get("/kyc/approve/:userid", verifyToken, authorizeRoles("admin"), approveKYC);
router.post("/kyc/reject/:userid", verifyToken, authorizeRoles("admin"), rejectKYC);
router.get("/documents/:userid", verifyToken, authorizeRoles("admin"), getUserDocuments);
router.get("/e-signature/verify/:userid", verifyToken, authorizeRoles("admin"), verifyESignature);

export default router;