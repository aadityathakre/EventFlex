import express from "express";
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

export default router;