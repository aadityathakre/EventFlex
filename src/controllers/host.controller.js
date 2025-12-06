import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserDocument from "../models/UserDocument.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import EscrowContract from "../models/EscrowContract.model.js";
import Payment from "../models/Payment.model.js";
import UserWallet from "../models/UserWallet.model.js";
import RatingReview from "../models/RatingReview.model.js";
import Feedback from "../models/Feedback.model.js";
import UserBadge from "../models/UserBadge.model.js";
import Badge from "../models/Badge.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

// 1. Host Profile
export const getHostProfile = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const user = await User.findById(hostId).select("-password");
  const documents = await UserDocument.find({ user: hostId });
  const kyc = await KYCVerification.findOne({ user: hostId });
  
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user, documents, kyc }, "Host profile fetched")
    );
});

// 2. Upload KYC Documents
export const uploadHostDocs = asyncHandler(async (req, res) => {
  const  {type}  = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;
  const userId = req.user._id;

  if (!type || !localFilePath) {
    throw new ApiError(400, "Document type and file is required");
  }

  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const doc = await UserDocument.create({
    user: userId,
    type,
    fileUrl: cloudinaryRes.url,
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

// 3. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;

  if (!localFilePath) {
    throw new ApiError(400, "Signature file is required");
  }

  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

  const existing = await UserDocument.findOne({
    user: userId,
    type: "signature",
  });

  let signatureDoc;

  if (existing) {
    existing.fileUrl = cloudinaryRes.url;
    existing.status = "pending";
    existing.uploadedAt = new Date();
    signatureDoc = await existing.save();
  } else {
    signatureDoc = await UserDocument.create({
      user: userId,
      type: "signature",
      fileUrl: cloudinaryRes.url,
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 4. Aadhaar Sandbox Verification   (this feature will come soon)
export const verifyAadhaarSandbox = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { aadhaar_number , otp} = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12 || !otp) {
    throw new ApiError(400, "Invalid Aadhaar number or not found");
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

  // Also update User model to reflect KYC approval
  await User.findByIdAndUpdate(
    userId,
    { isVerified: true }, // or add a dedicated field like kycStatus if you prefer
    { new: true }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Aadhaar verified (sandbox)"));
});

// 5. Wallet Balance
export const getWalletBalance = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  let wallet = await UserWallet.findOne({ user: hostId });

  if (!wallet) {
    wallet = await UserWallet.create({
      user: hostId,
      balance_inr: mongoose.Types.Decimal128.fromString("200000.00"),
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wallet, "Wallet balance fetched"));
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

  if (
    !title ||
    !event_type ||
    !start_date ||
    !end_date ||
    !location?.coordinates ||
    !budget
  ) {
    throw new ApiError(400, "Missing required event fields");
  }

  // Validate dates
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const now = new Date();

  if (startDate <= now) {
    throw new ApiError(400, "Event start date must be in the future");
  }

  if (endDate <= startDate) {
    throw new ApiError(400, "Event end date must be after start date");
  }

  // Validate budget
  const budgetAmount = parseFloat(budget);
  if (isNaN(budgetAmount) || budgetAmount <= 0) {
    throw new ApiError(400, "Budget must be a positive number");
  }

  // Validate coordinates
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    throw new ApiError(400, "Location coordinates must be [longitude, latitude]");
  }
  
  const [longitude, latitude] = location.coordinates;
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new ApiError(400, "Coordinates must be numbers");
  }
  
  if (longitude < -180 || longitude > 180) {
    throw new ApiError(400, "Longitude must be between -180 and 180");
  }
  
  if (latitude < -90 || latitude > 90) {
    throw new ApiError(400, "Latitude must be between -90 and 90");
  }

  const event = await Event.create({
    host: hostId,
    title,
    description,
    event_type,
    start_date: startDate,
    end_date: endDate,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    budget: mongoose.Types.Decimal128.fromString(budgetAmount.toString()),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, event, "Event created successfully"));
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

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 9. View All Host Events
export const getHostEvents = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Host events fetched"));
});

// 10. Mark Event as Completed
export const completeEvent = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const eventId = req.params.id;

  const event = await Event.findOne({ _id: eventId, host: hostId });
  if (!event) throw new ApiError(404, "Event not found or unauthorized");

  event.status = "completed";
  await event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event marked as completed"));
});

// 11. Invite Organizer to Event
export const inviteOrganizer = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    organizerId,
    eventId,
    pool_name,
    location,
    max_capacity,
    required_skills,
    pay_range,
  } = req.body;

  if (
    !organizerId ||
    !eventId ||
    !pool_name ||
    !location?.coordinates ||
    !max_capacity
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const pool = await OrganizerPool.create({
    organizer: organizerId,
    event: eventId,
    location: {
      type: "Point",
      coordinates: location.coordinates,
    },
    pool_name,
    max_capacity,
    required_skills,
    pay_range,
    status: "open",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Organizer invited to event"));
});

// 12. Approve Organizer for Event
export const approveOrganizer = asyncHandler(async (req, res) => {
  const orgPoolId = req.params.id;

  const pool = await OrganizerPool.findById(orgPoolId);
  if (!pool) throw new ApiError(404, "Organizer pool not found");

  pool.status = "active";
  await pool.save();

  return res.status(200).json(new ApiResponse(200, pool, "Organizer approved"));
});

// 13. View Assigned Organizers
export const getAssignedOrganizers = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const pools = await OrganizerPool.find()
    .populate("organizer event")
    .sort({ createdAt: -1 });

  const filtered = pools.filter(
    (pool) => pool.event?.host?.toString() === hostId.toString()
  );

  return res
    .status(200)
    .json(new ApiResponse(200, filtered, "Assigned organizers fetched"));
});

// 14. Start In-App Chat with Organizer
export const startChatWithOrganizer = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { organizerId, eventId, poolId} = req.body;

  if (!organizerId || !eventId || !poolId) {
    throw new ApiError(400, "Missing required fields: organizerId, eventId, poolId");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [hostId, organizerId] },
    event: eventId,
    pool: poolId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [hostId, organizerId],
      event: eventId,
      pool: poolId,
    });
  }

  let msg = `Welcome to the event coordination chat`
  const welcome = await Message.create({
    conversation: conversation._id,
    sender: hostId,
    message_text: msg,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { conversation, welcome }, "Chat started"));
});

// 15.  Host Dashboard
export const getHostDashboard = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const events = await Event.find({ host: hostId }).sort({ createdAt: -1 });
  const escrows = await EscrowContract.find({ host: hostId }).populate(
    "event organizer"
  );
  const payments = await Payment.find({ payer: hostId }).populate(
    "escrow payee"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { events, escrows, payments },
        "Host dashboard data fetched"
      )
    );
});

// 16. Deposit to Escrow
export const depositToEscrow = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const {
    eventId,
    organizerId,
    total_amount,
    organizer_percentage,
    gigs_percentage,
    payment_method,
    upi_transaction_id,
  } = req.body;

  if (
    !eventId ||
    !organizerId ||
    !total_amount ||
    !organizer_percentage ||
    !gigs_percentage ||
    !payment_method
  ) {
    throw new ApiError(400, "Missing required deposit fields");
  }

  const escrow = await EscrowContract.create({
    event: eventId,
    host: hostId,
    organizer: organizerId,
    total_amount,
    organizer_percentage,
    gigs_percentage,
    status: "funded",
  });

  const payment = await Payment.create({
    escrow: escrow._id,
    payer: hostId,
    payee: organizerId,
    amount: total_amount,
    payment_method,
    upi_transaction_id,
    status: "completed",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { escrow, payment },
        "Escrow funded and payment logged"
      )
    );
});

// 17.  View Escrow Status
export const getEscrowStatus = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({
    event: eventId,
    host: hostId,
  }).populate("organizer");

  if (!escrow)
    throw new ApiError(404, "No escrow contract found for this event");

  return res
    .status(200)
    .json(new ApiResponse(200, escrow, "Escrow status fetched"));
});

// 18. Verify Attendance
export const verifyAttendance = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId } = req.params;

  const escrow = await EscrowContract.findOne({ event: eventId, host: hostId });

  if (!escrow) throw new ApiError(404, "Escrow contract not found");
  if (escrow.status === "released")
    throw new ApiError(400, "Escrow already released");

  escrow.status = "released";
  await escrow.save();

  return res
    .status(200)
    .json(new ApiResponse(200, escrow, "Attendance verified, escrow released"));
});

// 19. Create Feedback
export const createFeedback = asyncHandler(async (req, res) => {
  const hostId = req.user._id; // logged-in host
  const { eventId, gigId, feedback_text, rating } = req.body;

  if (!eventId || !gigId || !feedback_text) {
    throw new ApiError(400, "Missing required feedback fields");
  }

  const feedback = await Feedback.create({
    event: eventId,
    gig: gigId,
    host: hostId,
    comment: feedback_text,
    rating,
  });

  return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});

// 20.  Event Reviews
export const createRatingReview = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { eventId, organizerId, rating, review_text } = req.body;

  if (!eventId || !organizerId || !rating) {
    throw new ApiError(400, "Missing required rating fields");
  }

  const review = await RatingReview.create({
    event: eventId,
    reviewer: hostId,
    reviewee: organizerId,
    rating,
    review_text,
    review_type: "host_to_organizer",
  });

  return res.status(201).json(new ApiResponse(201, review, "Rating review submitted"));
});

//  21. Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const topBadges = await UserBadge.find()
    .populate("user badge")
    .sort({ createdAt: -1 });

  const leaderboard = topBadges
    .filter((entry) => ["organizer", "gig"].includes(entry.user.role))
    .map((entry) => ({
      userId: entry.user._id,
      name: entry.user.name,
      role: entry.user.role,
      badge: entry.badge.badge_name,
      min_events: entry.badge.min_events,
      kyc_required: entry.badge.kyc_required,
    }));

  return res
    .status(200)
    .json(new ApiResponse(200, leaderboard, "Leaderboard fetched"));
});




