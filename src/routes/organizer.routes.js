import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  uploadOrganizerDocs,
  submitESignature,
  verifyAadhaar,

  // 👥 Pool & Team Management
  createPool,
  getMyPools,
  managePool,
  getPoolDetails,
  getPoolApplicants,
  acceptApplication,
  rejectApplication,
  chatWithGig,

  // 📅 Event Management
  createEvent,
  editEvent,
  getEventDetails,
  getLiveEventTracking,
  markEventComplete,

  // 💰 Wallet & Escrow
  getWallet,
  withdrawFunds,
  getPaymentHistory,
  simulatePayout,

  // 🏆 Reputation & Gamification
  getLeaderboard,
  getBadges,
  getOrganizerProfile,
  getCertificates,

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

// 📄 Document & E-Signature Management
router.post("/upload-docs", verifyToken, authorizeRoles("organizer"),upload.fields([{ name: "fileUrl", maxCount: 1 }]), uploadOrganizerDocs);
router.post("/e-signature", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), submitESignature);
router.post("/aadhaar/verify", verifyToken, authorizeRoles("organizer"), verifyAadhaar);

//
// 👥 Pool & Team Management
//
router.post("/pools/create", verifyToken, authorizeRoles("organizer"), createPool);
router.get("/pools", verifyToken, authorizeRoles("organizer"), getMyPools);
router.put("/pools/manage/:id", verifyToken, authorizeRoles("organizer"), managePool);
router.get("/pools/:id", verifyToken, authorizeRoles("organizer"), getPoolDetails);
router.get("/pools/:id/applicants", verifyToken, authorizeRoles("organizer"), getPoolApplicants);
router.post("/pools/:poolId/applications/:gigId/accept", verifyToken, authorizeRoles("organizer"), acceptApplication);
router.post("/pools/:poolId/applications/:gigId/reject", verifyToken, authorizeRoles("organizer"), rejectApplication);
router.post("/pools/chat/:gigId", verifyToken, authorizeRoles("organizer"), chatWithGig);

//
// 📅 Event Management
//
router.post("/events/create", verifyToken, authorizeRoles("organizer"), createEvent);
router.put("/events/:id/edit", verifyToken, authorizeRoles("organizer"), editEvent);
router.get("/events/:id", verifyToken, authorizeRoles("organizer"), getEventDetails);
router.get("/events/live/:id", verifyToken, authorizeRoles("organizer"), getLiveEventTracking);
router.post("/events/complete/:id", verifyToken, authorizeRoles("organizer"), markEventComplete);

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
router.get("/badges", verifyToken, authorizeRoles("organizer"), getBadges);
router.get("/profile", verifyToken, authorizeRoles("organizer"), getOrganizerProfile);
router.get("/certificates", verifyToken, authorizeRoles("organizer"), getCertificates);

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

//
// 🧠 Wellness & Analytics
//
router.get("/wellness-score", verifyToken, authorizeRoles("organizer"), getWellnessScore);
router.get("/no-show-risk/:gigId", verifyToken, authorizeRoles("organizer"), getNoShowRisk);

export default router;