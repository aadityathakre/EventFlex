import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Organizer from "../models/User.model.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import EventAttendance from "../models/EventAttendance.model.js";
import UserWallet from "../models/UserWallet.model.js";
import Escrow from "../models/Escrow.model.js";
import Rating from "../models/Rating.model.js";
import Notification from "../models/Notification.model.js";
import Dispute from "../models/Dispute.model.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

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

  const pool = await Pool.findByIdAndUpdate(id, { gigs }, { new: true });

  if (!pool) throw new ApiError(404, "Pool not found");

  return res.status(200).json(new ApiResponse(200, pool, "Pool updated"));
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

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
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


// 15. View Wallet
export const getWallet = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const wallet = await UserWallet.findOne({ user: organizerId });

  if (!wallet) throw new ApiError(404, "Wallet not found");

  return res.status(200).json(
    new ApiResponse(200, {
      balance: wallet.balance_inr.toString(),
      upi_id: wallet.upi_id,
    }, "Wallet fetched")
  );
});

// 16. Withdraw Funds
export const withdrawFunds = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { amount, upi_id } = req.body;

  const wallet = await UserWallet.findOne({ user: organizerId });
  if (!wallet || parseFloat(wallet.balance_inr.toString()) < amount) {
    throw new ApiError(400, "Insufficient balance");
  }

  wallet.balance_inr = parseFloat(wallet.balance_inr.toString()) - amount;
  wallet.upi_id = upi_id || wallet.upi_id;
  await wallet.save();

  return res.status(200).json(new ApiResponse(200, wallet, "Withdrawal successful"));
});


// 17. Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const payments = await Escrow.find({ organizer: organizerId }).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history fetched"));
});

// 18. Simulate Payout
export const simulatePayout = asyncHandler(async (req, res) => {
  const { escrowId } = req.params;
  const escrow = await Escrow.findById(escrowId);

  if (!escrow || escrow.status !== "ready") {
    throw new ApiError(400, "Escrow not ready for payout");
  }

  escrow.status = "released";
  await escrow.save();

  return res.status(200).json(new ApiResponse(200, escrow, "Payout simulated"));
});

// 19. Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const topOrganizers = await Rating.aggregate([
    { $match: { role: "organizer" } },
    { $group: { _id: "$user", avgRating: { $avg: "$rating" } } },
    { $sort: { avgRating: -1 } },
    { $limit: 10 },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, topOrganizers, "Leaderboard fetched"));
});

// 20. Badges
export const getBadges = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const eventsCount = await Event.countDocuments({ organizer: organizerId });

  let badge = "None";
  if (eventsCount >= 50) badge = "Elite";
  else if (eventsCount >= 20) badge = "Pro";
  else if (eventsCount >= 5) badge = "Rising Star";

  return res
    .status(200)
    .json(new ApiResponse(200, { badge }, "Badge status fetched"));
});

// 21. Organizer Profile
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizer = await Organizer.findById(req.user._id).select(
    "-password -__v"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Profile fetched"));
});

// 22. Certificates
export const getCertificates = asyncHandler(async (req, res) => {
  // Placeholder for blockchain certificate logic
  return res.status(200).json(new ApiResponse(200, [], "Certificates fetched"));
});

// 23. Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const notifications = await Notification.find({ user: organizerId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

// 24. Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});


// 25. Raise Dispute
export const raiseDispute = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { eventId } = req.params;
  const { gigId, reason } = req.body;

  const dispute = await Dispute.create({
    event: eventId,
    gig: gigId,
    reason,
  });

  return res.status(201).json(new ApiResponse(201, dispute, "Dispute raised"));
});

// 26. View Disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const disputes = await Dispute.find({}).populate("event", "title date").populate("gig", "name");

  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});


// 27. Get Organizer Wellness Score
export const getWellnessScore = asyncHandler(async (req, res) => {
  const organizer = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, {
    wellnessScore: organizer.wellnessScore || 100,
  }, "Wellness score fetched"));
});

// 28. Predict No-show Risk for Gig
export const getNoShowRisk = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  const gig = await User.findById(gigId);

  if (!gig) throw new ApiError(404, "Gig user not found");

  return res.status(200).json(new ApiResponse(200, {
    gigId,
    noShowRisk: gig.noShowRisk || 0,
  }, "No-show risk fetched"));
});