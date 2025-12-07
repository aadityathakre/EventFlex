import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getOrganizerProfile,
  uploadOrganizerDocs,
  submitESignature,
  verifyAadhaarOrganizer,

  // 👥 Pool & Team Management
  createPool,
  getPoolDetails,
  chatWithGig,
  getPoolApplications,
  reviewApplication,

  // 📅 Event Management
  getEventDetails,
  getLiveEventTracking,

  // 💰 Wallet & Escrow
  getWallet,
  withdrawFunds,
  getPaymentHistory,
  simulatePayout,

  // 🏆 Reputation & Gamification
  getLeaderboard,
  getOrganizerBadges,
  

  // 🔔 Notifications
  getNotifications,
  markNotificationRead,

  // 🚨 Dispute Management
  raiseDispute,
  getDisputes,

  // 🧠 Wellness & Analytics
  getWellnessScore,
  getNoShowRisk,
} from "../controllers/organizer.controller.js";

const router = express.Router();
//profile
router.get("/profile", verifyToken, authorizeRoles("organizer"), getOrganizerProfile);

// 📄 Document & E-Signature Management
router.post("/upload-docs", verifyToken, authorizeRoles("organizer"),upload.fields([{ name: "fileUrl", maxCount: 1 }]), uploadOrganizerDocs);
router.post("/e-signature", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), submitESignature);
router.post("/aadhaar/verify", verifyToken, authorizeRoles("organizer"), verifyAadhaarOrganizer);

//
// 👥 Pool & Team Management
//
router.post("/pools/create", verifyToken, authorizeRoles("organizer"), createPool);
router.get("/pools/:id", verifyToken, authorizeRoles("organizer"), getPoolDetails);
router.post("/pools/chat/:gigId", verifyToken, authorizeRoles("organizer"), chatWithGig);
router.get("/pools/:poolId/applications", verifyToken, authorizeRoles("organizer"), getPoolApplications);
router.post("/applications/:applicationId/review", verifyToken, authorizeRoles("organizer"), reviewApplication);

//
// 🧠 Wellness & Analytics
//
router.get("/wellness-score", verifyToken, authorizeRoles("organizer"), getWellnessScore);
router.get("/no-show-risk/:gigId", verifyToken, authorizeRoles("organizer"), getNoShowRisk);


//
// 📅 Event Management
//
router.get("/events/:id", verifyToken, authorizeRoles("organizer"), getEventDetails);
router.get("/events/live/:id", verifyToken, authorizeRoles("organizer"), getLiveEventTracking);


//
// 💰 Wallet & Escrow
//
router.get("/wallet", verifyToken, authorizeRoles("organizer"), getWallet);
router.post("/withdraw", verifyToken, authorizeRoles("organizer"), withdrawFunds);
router.get("/payment-history", verifyToken, authorizeRoles("organizer"), getPaymentHistory);
router.post("/simulate-payout/:escrowId", verifyToken, authorizeRoles("organizer"), simulatePayout);

//
// 🏆 Reputation & Gamification
//
router.get("/leaderboard", verifyToken, authorizeRoles("organizer"), getLeaderboard);
router.get("/badges", verifyToken, authorizeRoles("organizer"), getOrganizerBadges);

//
// 🔔 Notifications
//
router.get("/notifications", verifyToken, authorizeRoles("organizer"), getNotifications);
router.put("/notifications/:id/read", verifyToken, authorizeRoles("organizer"), markNotificationRead);

//
// 🚨 Dispute Management
//
router.post("/disputes/:eventId", verifyToken, authorizeRoles("organizer"), raiseDispute);
router.get("/disputes", verifyToken, authorizeRoles("organizer"), getDisputes);


export default router;