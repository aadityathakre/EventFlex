import express from "express";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  //profile
  getOrganizerProfile,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  uploadOrganizerDocs,
  updateOrganizerDocs,
  submitESignature,
  verifyAadhaarOrganizer,

  // 👥 Pool & Team Management
  getAllEvents,
  reqHostForEvent,
  acceptInvitationFromHost,
  rejectInvitationFromHost,
  createPool,
  getMyPools,
  updatePoolDetails,
  getPoolDetails,
  getOrganizerPoolByEvent,
  chatWithGig,
  getPoolApplications,
  reviewApplication,
  deletePool,
  getOrganizerConversations,
  getOrganizerConversationMessages,
  sendOrganizerMessage,

  // 📅 Event Management
  getEventDetails,
  getOrganizerApplications,
  getOrganizerApplicationSummary,
  getLiveEventTracking,

  // 💰 Wallet & Escrow
  getWallet,
  withdrawFunds,
  getPaymentHistory,
  simulatePayout,

  // 🏆 Reputation & Gamification
  getLeaderboard,
  getOrganizerBadges,
  getGigPublicProfile,
  createOrganizerRating,
  getMyFeedbacks,
  

  // 🔔 Notifications
  getNotifications,
  markNotificationRead,
  deleteNotification,

  // 🚨 Dispute Management
  raiseDispute,
  getDisputes,

  // 🧠 Wellness & Analytics
  getWellnessScore,
  getNoShowRisk,
  deleteOrganizerApplication,
} from "../controllers/organizer.controller.js";

const router = express.Router();

//profile
router.get("/profile", verifyToken, authorizeRoles("organizer"), getOrganizerProfile);
router.put("/profile", verifyToken, authorizeRoles("organizer"), updateProfile);
router.put("/profile/image", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "avatar", maxCount: 1 }]), updateProfileImage);
router.delete("/profile/image", verifyToken, authorizeRoles("organizer"), deleteProfileImage);

// 📄 Document & E-Signature Management
router.post("/upload-docs", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), uploadOrganizerDocs);
router.put("/update-docs", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), updateOrganizerDocs);
router.post("/e-signature", verifyToken, authorizeRoles("organizer"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), submitESignature);
router.post("/aadhaar/verify", verifyToken, authorizeRoles("organizer"), verifyAadhaarOrganizer);

//
// 👥 Pool & Team Management
//
router.post("/events/request-host/:id", verifyToken, authorizeRoles("organizer"), reqHostForEvent);
router.post("/events/accept-invitation/:id", verifyToken, authorizeRoles("organizer"), acceptInvitationFromHost);
router.post("/events/reject-invitation/:id", verifyToken, authorizeRoles("organizer"), rejectInvitationFromHost);

router.get("/events/all", verifyToken, authorizeRoles("organizer"), getAllEvents);
router.post("/pools/create", verifyToken, authorizeRoles("organizer"), createPool);
router.get("/pools", verifyToken, authorizeRoles("organizer"), getMyPools);
router.put("/pools/:id", verifyToken, authorizeRoles("organizer"), updatePoolDetails);
router.get("/pools/:id", verifyToken, authorizeRoles("organizer"), getPoolDetails);
router.delete("/pools/:id", verifyToken, authorizeRoles("organizer"), deletePool);
router.post("/pools/chat/:gigId", verifyToken, authorizeRoles("organizer"), chatWithGig);
router.get("/pools/:poolId/applications", verifyToken, authorizeRoles("organizer"), getPoolApplications);
router.post("/applications/:applicationId/review", verifyToken, authorizeRoles("organizer"), reviewApplication);
router.get("/org-pools/by-event/:eventId", verifyToken, authorizeRoles("organizer"), getOrganizerPoolByEvent);
router.get("/gigs/:id/profile", verifyToken, authorizeRoles("organizer"), getGigPublicProfile);

// 💬 Chat
router.get("/conversations", verifyToken, authorizeRoles("organizer"), getOrganizerConversations);
router.get("/messages/:conversationId", verifyToken, authorizeRoles("organizer"), getOrganizerConversationMessages);
router.post("/message/:conversationId", verifyToken, authorizeRoles("organizer"), sendOrganizerMessage);

//
// 🧠 Wellness & Analytics
//
router.get("/wellness-score", verifyToken, authorizeRoles("organizer"), getWellnessScore);
router.get("/no-show-risk/:gigId", verifyToken, authorizeRoles("organizer"), getNoShowRisk);


//
// 📅 Event Management
//
router.get("/events/:id", verifyToken, authorizeRoles("organizer"), getEventDetails);
router.get("/applications", verifyToken, authorizeRoles("organizer"), getOrganizerApplications);
router.get("/applications/summary", verifyToken, authorizeRoles("organizer"), getOrganizerApplicationSummary);
router.delete("/applications/:id", verifyToken, authorizeRoles("organizer"), deleteOrganizerApplication);
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
router.post("/reviews/rating", verifyToken, authorizeRoles("organizer"), createOrganizerRating);
router.get("/reviews/my-feedbacks", verifyToken, authorizeRoles("organizer"), getMyFeedbacks);

//
// 🔔 Notifications
//
router.get("/notifications", verifyToken, authorizeRoles("organizer"), getNotifications);
router.put("/notifications/:id/read", verifyToken, authorizeRoles("organizer"), markNotificationRead);
router.delete("/notifications/:id", verifyToken, authorizeRoles("organizer"), deleteNotification);

//
// 🚨 Dispute Management
//
router.post("/disputes/:eventId", verifyToken, authorizeRoles("organizer"), raiseDispute);
router.get("/disputes", verifyToken, authorizeRoles("organizer"), getDisputes);


export default router;
