import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Organizer from "../models/User.model.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";
import EventAttendance from "../models/EventAttendance.model.js";
import UserWallet from "../models/UserWallet.model.js";
import Escrow from "../models/EscrowContract.model.js";
import Rating from "../models/RatingReview.model.js";
import Notification from "../models/Notification.model.js";
import Dispute from "../models/Dispute.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import UserDocument from "../models/UserDocument.model.js";
import mongoose from "mongoose";

// 1. Upload Organizer Documents
export const uploadOrganizerDocs = asyncHandler(async (req, res) => {
  const { type } = req.body;
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
    type:type,
    fileUrl: cloudinaryRes.url,
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

// 2. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { type } = req.body;
  const localFilePath = req.files?.fileUrl?.[0]?.path;

  if (!localFilePath) throw new ApiError(400, "No signature uploaded");


  const cloudinaryRes = await uploadOnCloudinary(localFilePath);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Cloudinary upload failed");
  }

const existing = await UserDocument.findOne({ user: organizerId, type: "signature" });

  let signatureDoc;

  if (existing) {
    existing.fileUrl = cloudinaryRes.url;
    existing.status = "pending";
    existing.uploadedAt = new Date();
    signatureDoc = await existing.save();
  } else {
    signatureDoc = await UserDocument.create({
      user: organizerId,
      type: "signature",
      fileUrl:cloudinaryRes.url
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, signatureDoc, "E-signature submitted"));
});

// 3. Aadhaar Verification (Sandbox)  (this feature will come soon)
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

// 4. Create Pool
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
    .json(new ApiResponse(201, pool, "Pool created successfully !"));
});

// 5. Manage Pool (Add/Remove Gigs)
export const managePool = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { gigs } = req.body;

  const pool = await Pool.findByIdAndUpdate(id, { gigs }, { new: true });

  if (!pool) throw new ApiError(404, "Pool not found");

  return res.status(200).json(new ApiResponse(200, pool, "Pool updated"));
});

// 6. View Pool Details
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

// 7. Chat with Gig (Stub)
export const chatWithGig = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { gigId } = req.params;
  const { eventId, poolId, message_text } = req.body;

  if (!eventId || !poolId || !message_text) {
    throw new ApiError(400, "Missing required chat fields");
  }

  let conversation = await Conversation.findOne({
    event: eventId,
    pool: poolId,
    participants: { $all: [organizerId, gigId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [organizerId, gigId],
      event: eventId,
      pool: poolId,
    });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: organizerId,
    message_text,
  });

  return res.status(201).json(
    new ApiResponse(201, { conversation, message }, "Message sent to gig")
  );
});

// 8. Create Event
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

// 9. Edit Event
export const editEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const event = await Event.findByIdAndUpdate(id, updates, { new: true });
  if (!event) throw new ApiError(404, "Event not found");

  return res.status(200).json(new ApiResponse(200, event, "Event updated"));
});

// 10. View Event Details
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

// 11. Live Event Tracking
export const getLiveEventTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await EventAttendance.find({ event: id })
    .populate("gig", "name avatar")
    .select("-__v");

  if (!attendance || attendance.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No attendance records found for this event")
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Live attendance data"));
});

// 12. Mark Event Complete
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


// 13. View Wallet
export const getWallet = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  let wallet = await UserWallet.findOne({ user: organizerId });

  // 🔧 Auto-create wallet if not found
  if (!wallet) {
    wallet = await UserWallet.create({
      user: organizerId,
      upi_id: "aditya233", // or generate dynamically
      balance_inr: mongoose.Types.Decimal128.fromString("25000.00"),
    });
  }
  

  return res.status(200).json(
    new ApiResponse(200, {
      balance: wallet.balance_inr.toString(),
      upi_id: wallet.upi_id,
    }, "Wallet fetched")
  );
});

// 14. Withdraw Funds
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


// 15. Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const payments = await Escrow.find({ organizer: organizerId }).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history fetched"));
});

// 16. Simulate Payout
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

// 17. Leaderboard
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

// 18. Badges
export const getBadges = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const eventsCount = await Event.countDocuments({ organizer: organizerId });

  let badge = "None";
  if (eventsCount >= 50) badge = "Elite";
  else if (eventsCount >= 20) badge = "Pro";
  else if (eventsCount >= 5) badge = "Rising Star";
  else badge = "Beginner";

  return res
    .status(200)
    .json(new ApiResponse(200, { badge }, "Badge status fetched"));
});

// 19. Organizer Profile
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizer = await Organizer.findById(req.user._id).select(
    "-password -__v"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, organizer, "Profile fetched"));
});

// 20. Certificates (this feature will come soon)
export const getCertificates = asyncHandler(async (req, res) => {
  // Placeholder for blockchain certificate logic
  return res.status(200).json(new ApiResponse(200, [], "Certificates fetched"));
});

// 21. Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const notifications = await Notification.find({ user: organizerId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

// 22. Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

  if(!updated) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }
  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});


// 23. Raise Dispute
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

// 24. View Disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const disputes = await Dispute.find({}).populate("event", "title date").populate("gig", "name");

  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});


// 25. Get Organizer Wellness Score
export const getWellnessScore = asyncHandler(async (req, res) => {
  const organizer = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, {
    wellnessScore: organizer.wellnessScore || 100,
  }, "Wellness score fetched"));
});

// 26. Predict No-show Risk for Gig
export const getNoShowRisk = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  const gig = await User.findById(gigId);

  if (!gig) throw new ApiError(404, "Gig user not found");

  return res.status(200).json(new ApiResponse(200, {
    gigId,
    noShowRisk: gig.noShowRisk || 0,
  }, "No-show risk fetched"));
});