import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  // Auth & KYC
  verifyAadhaar,
  uploadDocuments,
  uploadKycVideo,
  getKYCStatus,

  // Dashboard 
  getGigDashboard,

  // Events & Attendance
  getMyEvents,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getNearbyEvents,
  getOrganizerPool,
  joinPool,

  // Wallet & Payments
  getWallet,
  withdraw,
  getPaymentHistory,
  createWallet,
  simulatePayout,


  // Profile & Badges
  getProfile,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  getBadges,
  getLeaderboard,

  // Messaging
  getConversations,
  sendMessage,

  // Notifications & Disputes
  getNotifications,
  raiseDispute,

  // Feedback
  submitFeedback,
} from "../controllers/gig.controller.js";

const router = express.Router();


// 📅 Events & Attendance
//
router.get("/my-events", verifyToken, authorizeRoles("gig"), getMyEvents);

// Gig check-in for an event
router.post(
  "/check-in/:eventId",
  verifyToken,
  authorizeRoles("gig"),
  checkIn
);

// Gig check-out for an event
router.post(
  "/check-out/:eventId",
  verifyToken,
  authorizeRoles("gig"),
  checkOut
);

router.get(
  "/attendance-history",
  verifyToken,
  authorizeRoles("gig"),
  getAttendanceHistory
);
router.post(
  "/nearby-events",
  verifyToken,
  authorizeRoles("gig"),
  getNearbyEvents
);
router.get(
  "/organizer-pool/:poolId",
  verifyToken,
  authorizeRoles("gig"),
  getOrganizerPool
);
router.post("/join-pool/:poolId", verifyToken, authorizeRoles("gig"), joinPool);

//
// 💰 Wallet & Payments
//
router.get("/wallet", verifyToken, authorizeRoles("gig"), getWallet);
router.post("/withdraw", verifyToken, authorizeRoles("gig"), withdraw);
router.get(
  "/payment-history",
  verifyToken,
  authorizeRoles("gig"),
  getPaymentHistory
);
router.post("/wallet/create", verifyToken, authorizeRoles("gig"), createWallet);
router.post(
  "/simulate-payout/:escrowId",
  verifyToken,
  authorizeRoles("gig"),
  simulatePayout
);

// 👤 Profile & Badges
//
router.get("/profile", verifyToken, authorizeRoles("gig"), getProfile);
router.put("/profile", verifyToken, authorizeRoles("gig"), updateProfile);
router.put(
  "/profile-image",
  verifyToken,
  authorizeRoles("gig"),
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateProfileImage
);
router.delete(
  "/profile-image",
  verifyToken,
  authorizeRoles("gig"),
  deleteProfileImage
);

router.get("/badges", verifyToken, authorizeRoles("gig"), getBadges);
router.get("/leaderboard", verifyToken, authorizeRoles("gig"), getLeaderboard);

//
// 💬 Messaging
//
router.get(
  "/conversations",
  verifyToken,
  authorizeRoles("gig"),
  getConversations
);
router.post(
  "/message/:conversationId",
  verifyToken,
  authorizeRoles("gig"),
  sendMessage
);

//
// 🔔 Notifications & Disputes
//
router.get(
  "/notifications",
  verifyToken,
  authorizeRoles("gig"),
  getNotifications
);
router.post(
  "/raise-dispute/:eventId",
  verifyToken,
  authorizeRoles("gig"),
  raiseDispute
);

// 📝 Feedback
router.post(
  "/feedback/:eventId",
  verifyToken,
  authorizeRoles("gig"),
  submitFeedback
);


// 🔐 Authentication & KYC

router.post(
  "/aadhaar/verify",
  verifyToken,
  authorizeRoles("gig"),
  verifyAadhaar
);
router.post(
  "/upload-documents",
  verifyToken,
  authorizeRoles("gig"),
  upload.fields([{ name: "fileUrl", maxCount: 1 }]),
  uploadDocuments
);
router.post(
  "/kyc/video",
  verifyToken,
  authorizeRoles("gig"),
  upload.fields([{ name: "videoUrl", maxCount: 1 }]),
  uploadKycVideo
);
router.get("/kyc-status", verifyToken, authorizeRoles("gig"), getKYCStatus);

//
// 📊 Dashboard & Debug
//
router.get("/dashboard", verifyToken, authorizeRoles("gig"), getGigDashboard);


export default router;
