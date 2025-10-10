import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Organizer from "../models/User.model.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import EventAttendance from "../models/EventAttendance.model.js";

// 1. Register Organizer
export const registerOrganizer = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await Organizer.findOne({ email });
  if (existing) throw new ApiError(409, "Organizer already exists");

  const organizer = await Organizer.create({
    name,
    email,
    password,
    role: "organizer",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, organizer, "Organizer registered"));
});

// 2. Login Organizer
export const loginOrganizer = asyncHandler(async (req, res) => {
  // Use shared login controller logic or replicate here
  throw new ApiError(501, "Use shared login controller");
});

// 3. Upload Organizer Documents
export const uploadOrganizerDocs = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const filePath = req.file?.path;

  if (!filePath) throw new ApiError(400, "No document uploaded");

  const organizer = await Organizer.findByIdAndUpdate(
    organizerId,
    { $push: { organizerDocs: filePath } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Document uploaded"));
});

// 4. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const signaturePath = req.file?.path;

  if (!signaturePath) throw new ApiError(400, "No signature uploaded");

  const organizer = await Organizer.findByIdAndUpdate(
    organizerId,
    { eSignature: signaturePath },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "E-signature submitted"));
});

// 5. Aadhaar Verification (Sandbox)
export const verifyAadhaar = asyncHandler(async (req, res) => {
  const { aadhaarNumber, otp } = req.body;
  const organizerId = req.user._id;

  if (!aadhaarNumber || !otp) {
    throw new ApiError(400, "Aadhaar number and OTP required");
  }

  // Simulated sandbox response
  const verified = true;

  if (!verified) throw new ApiError(403, "Aadhaar verification failed");

  const organizer = await Organizer.findByIdAndUpdate(
    organizerId,
    { aadhaarVerified: true },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Aadhaar verified"));
});

// 6. Create Pool
export const createPool = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { name, description } = req.body;

  const pool = await Pool.create({
    organizer: organizerId,
    name,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Pool created successfully"));
});

// 7. Manage Pool (Add/Remove Gigs)
export const managePool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { gigs } = req.body;

  const pool = await Pool.findByIdAndUpdate(
    id,
    { gigs },
    { new: true }
  );

  if (!pool) throw new ApiError(404, "Pool not found");

  return res
    .status(200)
    .json(new ApiResponse(200, pool, "Pool updated"));
});

// 8. View Pool Details
export const getPoolDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pool = await Pool.findById(id)
    .populate("gigs", "name avatar badges")
    .select("-__v");

  if (!pool) throw new ApiError(404, "Pool not found");

  return res
    .status(200)
    .json(new ApiResponse(200, pool, "Pool details fetched"));
});

// 9. Chat with Gig (Stub)
export const chatWithGig = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  // Placeholder for messaging logic
  return res
    .status(200)
    .json(new ApiResponse(200, { gigId }, "Chat initiated"));
});

// 10. Create Event
export const createEvent = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { title, date, location, description, budget } = req.body;

  const event = await Event.create({
    title,
    date,
    location,
    description,
    budget,
    organizer: organizerId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
});

// 11. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const event = await Event.findByIdAndUpdate(id, updates, { new: true });
  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event updated"));
});

// 12. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("organizer", "name email")
    .populate("gigs", "name avatar")
    .select("-__v");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 13. Live Event Tracking
export const getLiveEventTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await EventAttendance.find({ event: id })
    .populate("gig", "name avatar")
    .select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Live attendance data"));
});

// 14. Mark Event Complete
export const markEventComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByIdAndUpdate(
    id,
    { status: "completed" },
    { new: true }
  );

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event marked as complete"));
});