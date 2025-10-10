import express from "express";
import { uploadDocuments } from "../controllers/gig.controller.js";
import { upload } from "../middlewares/fileUpload.middleware.js";
import { uploadKycVideo } from "../controllers/gig.controller.js";
import { getGigDashboard } from "../controllers/gig.controller.js";
import { verifyAadhaar } from "../controllers/gig.controller.js";

//import for my-events, check-in and attendence-history
import { getMyEvents, checkIn, getAttendanceHistory} from "../controllers/gig.controller.js";

//import for nearby-events, organizer-pools and join-pool
import { getNearbyEvents, getOrganizerPools, joinPool } from "../controllers/gig.controller.js";

//import for payment, withdraw and wallet
import { getWallet, withdraw, getPaymentHistory} from "../controllers/gig.controller.js";

//import for wellness-score and reminders
import {getWellnessScore,getReminders} from "../controllers/gig.controller.js";

// import for additional user profile routes for gig users
import {getProfile,updateProfile,getBadges, getLeaderboard } from "../controllers/gig.controller.js";

// import for messaging system
import { getConversations, sendMessage } from "../controllers/gig.controller.js"; 


// import for additional routes for gig users
import { raiseDispute, getNotifications, updateProfileImage, simulatePayout } from "../controllers/gig.controller.js";

//import for feedback submission
import { submitFeedback, deleteProfileImage, getKYCStatus, debugGigData } from "../controllers/gig.controller.js";

// import for wallet creation
import { createWallet } from "../controllers/gig.controller.js";


// import for authentication and authorization
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

//routes for my-events, check-in and attendence-history
router.get("/my-events", verifyToken, authorizeRoles("gig"), getMyEvents);
router.post("/check-in/:eventId", verifyToken, authorizeRoles("gig"), checkIn);
router.get("/attendance-history", verifyToken, authorizeRoles("gig"), getAttendanceHistory);


//routes for nearby-events, organizer-pools and join-pool
router.get("/nearby-events", verifyToken, authorizeRoles("gig"), getNearbyEvents);
router.get("/organizer-pools", verifyToken, authorizeRoles("gig"), getOrganizerPools);
router.post("/join-pool/:poolId", verifyToken, authorizeRoles("gig"), joinPool);


//routes for payment, withdraw and wallet
router.get("/wallet", verifyToken, authorizeRoles("gig"), getWallet);
router.post("/withdraw", verifyToken, authorizeRoles("gig"), withdraw);
router.get("/payment-history", verifyToken, authorizeRoles("gig"), getPaymentHistory);


//routes for wellness-score and reminders
router.get("/wellness-score", verifyToken, authorizeRoles("gig"), getWellnessScore);
router.get("/reminders", verifyToken, authorizeRoles("gig"), getReminders);


// Additional user profile, update, bagde, leaderboard routes for gig users
router.get("/profile", verifyToken, authorizeRoles("gig"), getProfile);
router.put("/profile", verifyToken, authorizeRoles("gig"), updateProfile);
router.get("/badges", verifyToken, authorizeRoles("gig"), getBadges);
router.get("/leaderboard", verifyToken, authorizeRoles("gig"), getLeaderboard);


// Routes for messaging system  
router.get("/conversations", verifyToken, authorizeRoles("gig"), getConversations);
router.post("/message/:conversationId", verifyToken, authorizeRoles("gig"), sendMessage);

// Additional routes for gig users
router.post("/raise-dispute/:eventId", verifyToken, authorizeRoles("gig"), raiseDispute);
router.get("/notifications", verifyToken, authorizeRoles("gig"), getNotifications);
router.put("/profile-image", verifyToken, authorizeRoles("gig"), updateProfileImage);
router.post("/simulate-payout/:escrowId", verifyToken, authorizeRoles("gig"), simulatePayout);


// Feedback submission
router.post("/feedback/:eventId", verifyToken, authorizeRoles("gig"), submitFeedback);

// Profile image deletion
router.delete("/profile-image", verifyToken, authorizeRoles("gig"), deleteProfileImage);

// KYC status check
router.get("/kyc-status", verifyToken, authorizeRoles("gig"), getKYCStatus);

// Debug route for internal QA
router.get("/debug/gig/:id", verifyToken, authorizeRoles("admin"), debugGigData);

// dashboard for gig
router.get("/dashboard", verifyToken, authorizeRoles("gig"), getGigDashboard);

// upload documents route
router.post(
  "/upload-documents",
  verifyToken,
  authorizeRoles("gig"),
  upload.single("document"),
  uploadDocuments
);


// upload kyc video route   
router.post(
  "/kyc/video",
  verifyToken,
  authorizeRoles("gig"),
  upload.single("video"),
  uploadKycVideo
);

// simulate payout route for testing
router.post(
  "/wallet/create",
  verifyToken,
  authorizeRoles("gig"),
  createWallet
);

// Aadhaar verification route
router.post("/aadhaar/verify", verifyToken, authorizeRoles("gig"), verifyAadhaar);

export default router;