import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  // 🔐 Auth & Verification
  uploadHostDocs,
  submitESignature,
  verifyAadhaarSandbox,

  // 📅 Events
  createEvent,
  editEvent,
  getEventDetails,
  getHostEvents,
  completeEvent,

  // 🧑‍🤝‍🧑 Organizer Management
  inviteOrganizer,
  approveOrganizer,
  applyToPool,
  getAssignedOrganizers,
  getAllOrganizers,
  getAllPools,
  startChatWithOrganizer,
  getConversations,
  getConversationById,
  sendMessage,

  // 💰 Payments & Escrow
  depositToEscrow,
  getEscrowStatus,
  verifyAttendance,
  getWalletBalance,

  // 📊 Dashboard & Reputation
  getHostDashboard,
  getLeaderboard,
  createRatingReview,
  createFeedback,
  getHostProfile,
} from "../controllers/host.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

// documentation routes
router.post("/upload-docs", verifyToken, authorizeRoles("host"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), uploadHostDocs);
router.post("/e-signature", verifyToken, authorizeRoles("host"), upload.fields([{ name: "fileUrl", maxCount: 1 }]),submitESignature);
router.post("/aadhaar/verify", verifyToken, authorizeRoles("host"), verifyAadhaarSandbox);

//
// 📅 Events
router.post("/events/create", verifyToken, authorizeRoles("host"), createEvent);
router.put("/events/edit/:id", verifyToken, authorizeRoles("host"), editEvent);
router.get("/events/:id", verifyToken, authorizeRoles("host"), getEventDetails);
router.get("/events", verifyToken, authorizeRoles("host"), getHostEvents);
router.put("/events/complete/:id", verifyToken, authorizeRoles("host"), completeEvent);

//
// 🧑‍🤝‍🧑 Organizer Management
router.post("/invite-organizer", verifyToken, authorizeRoles("host"), inviteOrganizer);
router.post("/approve-organizer/:id", verifyToken, authorizeRoles("host"), approveOrganizer);
// organizer can apply to an open pool (organizer role required)
router.post('/pools/apply/:id', verifyToken, authorizeRoles('organizer'), applyToPool);
router.get("/organizers", verifyToken, authorizeRoles("host"), getAssignedOrganizers);
// fetch all users with role 'organizer' (for host to browse)
router.get("/organizers/all", verifyToken, authorizeRoles("host"), getAllOrganizers);
// fetch all organizer pools (visible to hosts)
router.get("/pools", verifyToken, authorizeRoles("host"), getAllPools);
router.post("/chat", verifyToken, authorizeRoles("host"), startChatWithOrganizer);
// Host messaging endpoints
router.get("/conversations", verifyToken, authorizeRoles("host"), getConversations);
router.get("/conversations/:conversationId", verifyToken, authorizeRoles("host"), getConversationById);
router.post("/message/:conversationId", verifyToken, authorizeRoles("host"), sendMessage);

//
// 💰 Payments & Escrow
router.post("/payment/deposit", verifyToken, authorizeRoles("host"), depositToEscrow);
router.get("/payment/status/:eventId", verifyToken, authorizeRoles("host"), getEscrowStatus);
router.post("/verify-attendance/:eventId", verifyToken, authorizeRoles("host"), verifyAttendance);
router.get("/wallet/balance", verifyToken, authorizeRoles("host"), getWalletBalance);

//
// 📊 Dashboard & Reputation
//
router.get("/dashboard", verifyToken, authorizeRoles("host"), getHostDashboard);
router.get("/leaderboard", verifyToken, authorizeRoles("host"), getLeaderboard);
router.post("/reviews/rating", verifyToken, authorizeRoles("host"), createRatingReview); // Host
router.post("/reviews/feedback", verifyToken, authorizeRoles("host"), createFeedback);   // Gig
router.get("/profile", verifyToken, authorizeRoles("host"), getHostProfile);

export default router;