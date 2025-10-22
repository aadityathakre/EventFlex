import express from "express";
import { registerUser, softDeleteUser, restoreUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/v1/users/register
router.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);

// Soft delete user (admin only)
router.delete(
  "/soft-delete/:userId",
  verifyToken,
  authorizeRoles("admin"),
  softDeleteUser
);

// Restore user (admin only)
router.put(
  "/restore/:userId",
  verifyToken,
  authorizeRoles("admin"),
  restoreUser
);

export default router;