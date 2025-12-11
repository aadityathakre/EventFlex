import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {

  //profile
  getHostProfile,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,

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
  getAllOrganizers,
  inviteOrganizer,
  approveOrganizer,
  createOrganizerPoolForEvent,
  getAssignedOrganizer,
  startChatWithOrganizer,

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
  
} from "../controllers/host.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

//profile
router.get("/profile", verifyToken, authorizeRoles("host"), getHostProfile);
router.put("/profile", verifyToken, authorizeRoles("host"), updateProfile);
router.post("/profile/image", verifyToken, authorizeRoles("host"), upload.single("image"), updateProfileImage);
router.delete("/profile/image", verifyToken, authorizeRoles("host"), deleteProfileImage);


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
router.get("/organizers/all", verifyToken, authorizeRoles("host"), getAllOrganizers);
router.post("/invite-organizer", verifyToken, authorizeRoles("host"), inviteOrganizer);
router.post("/approve-organizer/:id", verifyToken, authorizeRoles("host"), approveOrganizer);
router.post("/pools/create", verifyToken, authorizeRoles("host"), createOrganizerPoolForEvent);
router.get("/organizer", verifyToken, authorizeRoles("host"), getAssignedOrganizer);
router.post("/chat", verifyToken, authorizeRoles("host"), startChatWithOrganizer);

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


export default router;