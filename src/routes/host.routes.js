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
  updateHostDocs,
  submitESignature,
  verifyAadhaarSandbox,

  // 📅 Events
  createEvent,
  editEvent,
  getEventDetails,
  getHostEvents,
  completeEvent,
  deleteEvent,

  // 🧑‍🤝‍🧑 Organizer Management
  getAllOrganizers,
  inviteOrganizer,
  approveOrganizer,
  rejectOrganizer,
  createOrganizerPoolForEvent,
  getAssignedOrganizer,
  startChatWithOrganizer,
  getHostConversations,
  getConversationMessages,
  sendHostMessage,
  deleteHostConversation,
  deleteOrganizerPool,

  // 💰 Payments & Escrow
  depositToEscrow,
  getEscrowStatus,
  verifyAttendance,
  getWalletBalance,
  withdrawFunds,
  addMoneyToWallet,

  // 📊 Dashboard & Reputation
  getHostDashboard,
  getInvitedOrganizerStatus,
  getLeaderboard,
  createRatingReview,
  getMyGivenRatings,
  createFeedback,
  deleteHostApplication,
  getHostNotifications,
  markHostNotificationRead,
  deleteHostNotification,
  getOrganizerPublicProfile,
  
} from "../controllers/host.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = express.Router();

//profile
router.get("/profile", verifyToken, authorizeRoles("host"), getHostProfile);
router.put("/profile", verifyToken, authorizeRoles("host"), updateProfile);
router.put("/profile/image", verifyToken, authorizeRoles("host"), upload.fields([{ name: "avatar", maxCount: 1 }]), updateProfileImage);
router.delete("/profile/image", verifyToken, authorizeRoles("host"), deleteProfileImage);


// documentation routes
router.post("/upload-docs", verifyToken, authorizeRoles("host"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), uploadHostDocs);
router.put("/update-docs", verifyToken, authorizeRoles("host"), upload.fields([{ name: "fileUrl", maxCount: 1 }]), updateHostDocs);
router.post("/e-signature", verifyToken, authorizeRoles("host"), upload.fields([{ name: "fileUrl", maxCount: 1 }]),submitESignature);
router.post("/aadhaar/verify", verifyToken, authorizeRoles("host"), verifyAadhaarSandbox);

//
// 📅 Events
router.post("/events/create", verifyToken, authorizeRoles("host"), createEvent);
router.put("/events/edit/:id", verifyToken, authorizeRoles("host"), editEvent);
router.get("/events/:id", verifyToken, authorizeRoles("host"), getEventDetails);
router.get("/events", verifyToken, authorizeRoles("host"), getHostEvents);
router.put("/events/complete/:id", verifyToken, authorizeRoles("host"), completeEvent);
router.delete("/events/:id", verifyToken, authorizeRoles("host"), deleteEvent);

//
// 🧑‍🤝‍🧑 Organizer Management
router.get("/organizers/all", verifyToken, authorizeRoles("host"), getAllOrganizers);
router.post("/invite-organizer/:id", verifyToken, authorizeRoles("host"), inviteOrganizer);
router.post("/approve-organizer/:id", verifyToken, authorizeRoles("host"), approveOrganizer);
router.post("/reject-organizer/:id", verifyToken, authorizeRoles("host"), rejectOrganizer);
router.get("/organizers/invites", verifyToken, authorizeRoles("host"), getInvitedOrganizerStatus);
router.delete("/organizers/applications/:id", verifyToken, authorizeRoles("host"), deleteHostApplication);
router.post("/pools/create", verifyToken, authorizeRoles("host"), createOrganizerPoolForEvent);
router.get("/organizer", verifyToken, authorizeRoles("host"), getAssignedOrganizer);
router.delete("/pools/:id", verifyToken, authorizeRoles("host"), deleteOrganizerPool);
router.get("/organizers/:id/profile", verifyToken, authorizeRoles("host"), getOrganizerPublicProfile);
router.post("/chat", verifyToken, authorizeRoles("host"), startChatWithOrganizer);
router.get("/conversations", verifyToken, authorizeRoles("host"), getHostConversations);
router.get("/messages/:conversationId", verifyToken, authorizeRoles("host"), getConversationMessages);
router.post("/message/:conversationId", verifyToken, authorizeRoles("host"), sendHostMessage);
router.delete("/conversations/:id", verifyToken, authorizeRoles("host"), deleteHostConversation);

//
// 💰 Payments & Escrow
router.post("/payment/deposit", verifyToken, authorizeRoles("host"), depositToEscrow);
router.get("/payment/status/:eventId", verifyToken, authorizeRoles("host"), getEscrowStatus);
router.post("/verify-attendance/:eventId", verifyToken, authorizeRoles("host"), verifyAttendance);
router.get("/wallet/balance", verifyToken, authorizeRoles("host"), getWalletBalance);
router.post("/wallet/withdraw", verifyToken, authorizeRoles("host"), withdrawFunds);
router.post("/wallet/add", verifyToken, authorizeRoles("host"), addMoneyToWallet);

//
// 📊 Dashboard & Reputation
//
router.get("/dashboard", verifyToken, authorizeRoles("host"), getHostDashboard);
router.get("/leaderboard", verifyToken, authorizeRoles("host"), getLeaderboard);
router.post("/reviews/rating", verifyToken, authorizeRoles("host"), createRatingReview); // Host
router.get("/reviews/given", verifyToken, authorizeRoles("host"), getMyGivenRatings);
router.post("/reviews/feedback", verifyToken, authorizeRoles("host"), createFeedback);   // Gig
router.get("/notifications", verifyToken, authorizeRoles("host"), getHostNotifications);
router.put("/notifications/:id/read", verifyToken, authorizeRoles("host"), markHostNotificationRead);
router.delete("/notifications/:id", verifyToken, authorizeRoles("host"), deleteHostNotification);


export default router;
