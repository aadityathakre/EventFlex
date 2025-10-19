import express from "express";
import {
  registerHost,
  loginHost,
  uploadHostDocs,
  submitESignature,
  verifyAadhaarSandbox,
} from "../controllers/host.controller.js";
import {
  createEvent,
  editEvent,
  getEventDetails,
  getHostEvents,
  completeEvent,
} from "../controllers/host.controller.js";

import {
  inviteOrganizer,
  approveOrganizer,
  getAssignedOrganizers,
  startChatWithOrganizer,
} from "../controllers/host.controller.js";

import {
  depositToEscrow,
  getEscrowStatus,
  verifyAttendance,
  getWalletBalance,
} from "../controllers/host.controller.js";

import { getHostDashboard } from "../controllers/host.controller.js";

import {
  getLeaderboard,
  getEventReviews,
} from "../controllers/host.controller.js";

import { getHostProfile } from "../controllers/host.controller.js";

import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Auth & Verification Routes
router.post("/register", registerHost);
router.post("/login", loginHost);
router.post(
  "/upload-docs",
  verifyToken,
  authorizeRoles("host"),
  uploadHostDocs
);
router.post(
  "/e-signature",
  verifyToken,
  authorizeRoles("host"),
  submitESignature
);
router.post(
  "/aadhaar/verify",
  verifyToken,
  authorizeRoles("host"),
  verifyAadhaarSandbox
);

//create events edit get details completed events routes
router.post("/events/create", verifyToken, authorizeRoles("host"), createEvent);
router.put("/events/:id/edit", verifyToken, authorizeRoles("host"), editEvent);
router.get("/events/:id", verifyToken, authorizeRoles("host"), getEventDetails);
router.get("/hosts/events", verifyToken, authorizeRoles("host"), getHostEvents);
router.post(
  "/events/complete/:id",
  verifyToken,
  authorizeRoles("host"),
  completeEvent
);

//organizer related routes
router.post(
  "/invite-organizer",
  verifyToken,
  authorizeRoles("host"),
  inviteOrganizer
);
router.post(
  "/approve-organizer/:id",
  verifyToken,
  authorizeRoles("host"),
  approveOrganizer
);
router.get(
  "/organizers",
  verifyToken,
  authorizeRoles("host"),
  getAssignedOrganizers
);
router.post(
  "/chat/:organizerId",
  verifyToken,
  authorizeRoles("host"),
  startChatWithOrganizer
);

// 🔹 Payments & Escrow
router.post(
  "/payment/deposit",
  verifyToken,
  authorizeRoles("host"),
  depositToEscrow
);
router.get(
  "/payment/status/:eventId",
  verifyToken,
  authorizeRoles("host"),
  getEscrowStatus
);
router.post(
  "/verify-attendance/:eventId",
  verifyToken,
  authorizeRoles("host"),
  verifyAttendance
);
router.get(
  "/wallet/balance",
  verifyToken,
  authorizeRoles("host"),
  getWalletBalance
);

// 🔹 Dashboard & Reputation
router.get("/dashboard", verifyToken, authorizeRoles("host"), getHostDashboard);
router.get("/leaderboard", verifyToken, authorizeRoles("host"), getLeaderboard);
router.get(
  "/reviews/:eventId",
  verifyToken,
  authorizeRoles("host"),
  getEventReviews
);
router.get("/profile", verifyToken, authorizeRoles("host"), getHostProfile);

export default router;
