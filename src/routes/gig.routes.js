import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  // Auth & KYC
  verifyAadhaar,
  uploadDocuments,
  uploadKycVideo,
  getKYCStatus,

  // Dashboard & Debug
  getGigDashboard,
  debugGigData,

  // Events & Attendance
  getMyEvents,
  checkIn,
  getAttendanceHistory,
  getNearbyEvents,
  showPools,
  getPoolModelDetails,
  getOrganizerPools,
  getOrganizerPoolDetails,
  joinPoolModel,
  joinPool,
  getRecommendedEvents,
  getAcceptedPools,

  // Wallet & Payments
  getWallet,
  withdraw,
  getPaymentHistory,
  createWallet,
  simulatePayout,

  // Wellness & Reminders
  getWellnessScore,
  getReminders,

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
router.post("/check-in/:eventId", verifyToken, authorizeRoles("gig"), checkIn);
router.get(
  "/attendance-history",
  verifyToken,
  authorizeRoles("gig"),
  getAttendanceHistory
);
router.get(
  "/nearby-events",
  verifyToken,
  authorizeRoles("gig"),
  getNearbyEvents
); 
router.get(
  "/organizer-pools",
  verifyToken,
  authorizeRoles("gig"),
  getOrganizerPools
);
router.get(
  "/accepted-pools",
  verifyToken,
  authorizeRoles("gig"),
  getAcceptedPools
);
// New route to return pools created via the Pool model (organizer-created pools)
router.get(
  "/pools",
  verifyToken,
  authorizeRoles("gig"),
  showPools
);
// Join a Pool (Pool model)
router.post(
  "/pools/join/:poolId",
  verifyToken,
  authorizeRoles("gig"),
  joinPoolModel
);
// Get details for a single Pool (Pool model)
router.get(
  "/pools/:poolId",
  verifyToken,
  authorizeRoles("gig"),
  getPoolModelDetails
);
router.get(
  "/organizer-pools/:poolId",
  verifyToken,
  authorizeRoles("gig"),
  getOrganizerPoolDetails
);
// Get Pool-model pool details
router.get(
  "/pools/:poolId",
  verifyToken,
  authorizeRoles("gig"),
  getPoolModelDetails
);
router.post("/join-pool/:poolId", verifyToken, authorizeRoles("gig"), joinPool);

router.get(
  "/recommended-events",
  verifyToken,
  authorizeRoles("gig"),
  getRecommendedEvents
);

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

//
// 🧠 Wellness & Reminders
//
router.get(
  "/wellness-score",
  verifyToken,
  authorizeRoles("gig"),
  getWellnessScore
);
router.get("/reminders", verifyToken, authorizeRoles("gig"), getReminders);

//
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
