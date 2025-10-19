import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { registerUser } from "./user.controller.js";
import { loginUser } from "./loginUser.controller.js";
import UserDocument from "../models/UserDocument.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import Event from "../models/Event.model.js";

// 1. Register Host
export const registerHost = asyncHandler(async (req, res, next) => {
  req.body.role = "host";
  return registerUser(req, res, next);
});

// 2. Login Host
export const loginHost = asyncHandler(async (req, res, next) => {
  req.body.expectedRole = "host";
  return loginUser(req, res, next);
});

// 3. Upload KYC Documents
export const uploadHostDocs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { documents } = req.body;

  if (!Array.isArray(documents) || documents.length === 0) {
    throw new ApiError(400, "Documents array is required");
  }

  const allowedTypes = ["aadhaar", "pan", "selfie"];
  const uploadedDocs = [];

  for (const doc of documents) {
    const { type, fileUrl } = doc;

    if (!allowedTypes.includes(type) || !fileUrl) {
      throw new ApiError(400, `Invalid document type or missing fileUrl`);
    }

    const newDoc = await UserDocument.create({
      user: userId,
      type,
      fileUrl,
    });

    uploadedDocs.push(newDoc);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, uploadedDocs, "Documents uploaded successfully"));
});

// 4. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { fileUrl } = req.body;

  if (!fileUrl) {
    throw new ApiError(400, "Signature file URL is required");
  }

  const existing = await UserDocument.findOne({ user: userId, type: "signature" });

  let signatureDoc;

  if (existing) {
    existing.fileUrl = fileUrl;
    existing.status = "pending";
    existing.uploadedAt = new Date();
    signatureDoc = await existing.save();
  } else {
    signatureDoc = await UserDocument.create({
      user: userId,
      type: "signature",
      fileUrl,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 5. Aadhaar Sandbox Verification
export const verifyAadhaarSandbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { aadhaar_number } = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12) {
    throw new ApiError(400, "Invalid Aadhaar number");
  }

  const existing = await KYCVerification.findOne({ user: userId });

  let verification;

  if (existing) {
    existing.aadhaar_number = aadhaar_number;
    existing.aadhaar_verified = true;
    existing.status = "approved";
    existing.verified_at = new Date();
    verification = await existing.save();
  } else {
    verification = await KYCVerification.create({
      user: userId,
      aadhaar_number,
      aadhaar_verified: true,
      status: "approved",
      verified_at: new Date(),
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Aadhaar verified (sandbox)"));
});

// 6. Create Event
export const createEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    title,
    description,
    event_type,
    start_date,
    end_date,
    location,
    budget,
  } = req.body;

  if (!title || !event_type || !start_date || !end_date || !location?.coordinates || !budget) {
    throw new ApiError(400, "Missing required event fields");
  }

  const event = await Event.create({
    host: hostId,
    title,
    description,
    event_type,
    start_date,
    end_date,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    budget,
  });

  return res.status(201).json(new ApiResponse(201, event, "Event created successfully"));
});

// 7. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  Object.assign(event, req.body);
  await event.save();

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

// 8. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const event = await Event.findById(eventId).populate("host organizer gigs");

  if (!event) throw new ApiError(404, "Event not found");

  return res.status(200).json(new ApiResponse(200, event, "Event details fetched"));
});

// 9. View All Host Events
export const getHostEvents = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, events, "Host events fetched"));
});

// 10. Mark Event as Completed
export const completeEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  event.status = "completed";
  await event.save();

  return res.status(200).json(new ApiResponse(200, event, "Event marked as completed"));
});