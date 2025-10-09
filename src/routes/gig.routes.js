import express from "express";
//import for my-events, check-in and attendence-history
import { getMyEvents, checkIn, getAttendanceHistory} from "../controllers/gig.controller.js";

//import for nearby-events, organizer-pools and join-pool
import { getNearbyEvents, getOrganizerPools, joinPool } from "../controllers/gig.controller.js";

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


export default router;