import express from "express";
import {
  getMyEvents,
  checkIn,
  getAttendanceHistory,
} from "../controllers/gig.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/my-events", verifyToken, authorizeRoles("gig"), getMyEvents);
router.post("/check-in/:eventId", verifyToken, authorizeRoles("gig"), checkIn);
router.get("/attendance-history", verifyToken, authorizeRoles("gig"), getAttendanceHistory);

export default router;