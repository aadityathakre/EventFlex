import express from "express";
import {
  registerHost,
  loginHost,
  uploadHostDocs,
  submitESignature,
  verifyAadhaarSandbox,
} from "../controllers/host.auth.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";

import {
  createEvent,
  editEvent,
  getEventDetails,
  getHostEvents,
  completeEvent,
} from "../controllers/host.event.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";


const router = express.Router();

// Auth & Verification Routes
router.post("/register", registerHost);
router.post("/login", loginHost);
router.post(
  "/upload-docs",
  verifyToken,
  authorizeRoles("host"),
  uploadHostDocs
);
router.post(
  "/e-signature",
  verifyToken,
  authorizeRoles("host"),
  submitESignature
);
router.post(
  "/aadhaar/verify",
  verifyToken,
  authorizeRoles("host"),
  verifyAadhaarSandbox
);

//create events edit get details completed events routes 
router.post("/events/create", verifyToken, authorizeRoles("host"), createEvent);
router.put("/events/:id/edit", verifyToken, authorizeRoles("host"), editEvent);
router.get("/events/:id", verifyToken, authorizeRoles("host"), getEventDetails);
router.get("/hosts/events", verifyToken, authorizeRoles("host"), getHostEvents);
router.post(
  "/events/complete/:id",
  verifyToken,
  authorizeRoles("host"),
  completeEvent
);

export default router;