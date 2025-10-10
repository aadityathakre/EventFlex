import express from "express";
import {
  registerOrganizer,
  loginOrganizer,
  uploadOrganizerDocs,
  submitESignature,
  verifyAadhaar,
  createPool,
  managePool,
  getPoolDetails,
  chatWithGig,
} from "../controllers/organizer.controller.js";

import {
  createEvent,
  editEvent,
  getEventDetails,
  getLiveEventTracking,
  markEventComplete,
} from "../controllers/organizer.controller.js";

import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/fileUpload.middleware.js";

const router = express.Router();

// 🔐 Auth & Verification
router.post("/register", registerOrganizer);
router.post("/login", loginOrganizer);
router.post(
  "/upload-docs",
  verifyToken,
  authorizeRoles("organizer"),
  upload.single("document"),
  uploadOrganizerDocs
);
router.post(
  "/e-signature",
  verifyToken,
  authorizeRoles("organizer"),
  upload.single("signature"),
  submitESignature
);
router.post(
  "/aadhaar/verify",
  verifyToken,
  authorizeRoles("organizer"),
  verifyAadhaar
);

// 👥 Pool & Team Management
router.post(
  "/pools/create",
  verifyToken,
  authorizeRoles("organizer"),
  createPool
);
router.put(
  "/pools/:id/manage",
  verifyToken,
  authorizeRoles("organizer"),
  managePool
);
router.get(
  "/pools/:id",
  verifyToken,
  authorizeRoles("organizer"),
  getPoolDetails
);
router.post(
  "/pools/chat/:gigId",
  verifyToken,
  authorizeRoles("organizer"),
  chatWithGig
);


// 📅 Event Management
router.post(
  "/events/create",
  verifyToken,
  authorizeRoles("organizer"),
  createEvent
);
router.put(
  "/events/:id/edit",
  verifyToken,
  authorizeRoles("organizer"),
  editEvent
);
router.get(
  "/events/:id",
  verifyToken,
  authorizeRoles("organizer"),
  getEventDetails
);
router.get(
  "/events/live/:id",
  verifyToken,
  authorizeRoles("organizer"),
  getLiveEventTracking
);
router.post(
  "/events/complete/:id",
  verifyToken,
  authorizeRoles("organizer"),
  markEventComplete
);

export default router;