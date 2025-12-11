import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Pool from "../models/Pool.model.js";
import Event from "../models/Event.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
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
import UserProfile from "../models/UserProfile.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import PoolApplication from "../models/PoolApplication.model.js"
import Badge from "../models/Badge.model.js";
import UserBadge from "../models/UserBadge.model.js";
import EventApplication from "../models/EventApplications.js";

// 1 Organizer Profile
export const getOrganizerProfile = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // Fetch user core data
  const user = await User.findById(organizerId).lean();
  if (!user) throw new ApiError(404, "Organizer not found");

  // Try to fetch profile
  let profile = await UserProfile.findOne({ user: organizerId });

  // Auto-create blank profile if missing
  if (!profile) {
    profile = await UserProfile.create({
      user: organizerId,
      profile_image_url: user.avatar,
      bank_details: user.wallet
    });
  }

  // Merge and return
  const mergedProfile = {
    user: organizerId,
    name: user.fullName || `${user.first_name} ${user.last_name}`,
    email: user.email,
    phone: user.phone,
    role: user.role,
    bio: profile.bio || "",
    location: profile.location || {},
    availability: profile.availability || {},
    bank_details: profile.bank_details || {},
    profile_image_url: profile.profile_image_url || user.avatar,
    createdAt: profile.createdAt || user.createdAt,
    updatedAt: profile.updatedAt || user.updatedAt,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, mergedProfile, "Organizer profile fetched"));
});

// 2. Upload Organizer Documents
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

// 3. Submit E-Signature
export const submitESignature = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
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

// 4. Aadhaar Verification 
export const verifyAadhaarOrganizer = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { aadhaar_number, otp } = req.body;

  if (!aadhaar_number || aadhaar_number.length !== 12 || !otp) {
    throw new ApiError(400, "Invalid Aadhaar number or OTP required");
  }

  // Update or create KYCVerification record
  let verification = await KYCVerification.findOne({ user: organizerId });

  if (verification) {
    verification.aadhaar_number = aadhaar_number;
    verification.aadhaar_verified = true;
    verification.status = "approved";
    verification.verified_at = new Date();
    await verification.save();
  } else {
    verification = await KYCVerification.create({
      user: organizerId,
      aadhaar_number,
      aadhaar_verified: true,
      status: "approved",
      verified_at: new Date(),
    });
  }

  // Also update User model to reflect KYC approval
  await User.findByIdAndUpdate(
    organizerId,
    { isVerified: true }, // or add a dedicated field like kycStatus if you prefer
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, verification, "Organizer Aadhaar verified and user status updated"));
});

// 5. View Wallet
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

// 6. Withdraw Funds
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

// A. get all active events by host
export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().select("-__v");
  const activeEvents = events.filter(event => event.status !== "completed");
  return res.status(200).json(new ApiResponse(200, activeEvents, "Active events fetched"));
});

// B. get event organizising order
export const reqHostForEvent = asyncHandler(async (req, res) => {
   const hostId = req.params;
  const {eventId, cover_letter,  proposed_rate} = req.body;
  //create an event application for the organizer
  const EventApplication = await EventApplication.create({
    event: eventId ,
    applicant: orgId,
    application_status: "pending",
    cover_letter,
    proposed_rate
  });
  return res
    .status(201)
    .json(new ApiResponse(201, EventApplication, "Organizer requested to host for event management"));
});

// C. accept invitaion for event management
export const acceptInvitationFromHost = asyncHandler(async (req, res) => {
  const hostAppId = req.params.id;
  const eventApplication = await EventApplication.findById(hostAppId);
  if (!eventApplication) {
    throw new ApiError(404, "Event application not found");
  }
  if (eventApplication.application_status !== "pending") {
    throw new ApiError(400, "Event application is not pending");
  }
  eventApplication.application_status = "accepted";
  await eventApplication.save();

  eventApplication.event.organizer = eventApplication.applicant;
  await eventApplication.event.save();

  return res
    .status(200)
    .json(new ApiResponse(200, eventApplication, "Organizer accepted for event"));
});

// 7. Create Pool
export const createPool = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const { name,eventId, description } = req.body;

    const pool = await Pool.create({
    organizer: organizerId,
    event:eventId,
    name,
    description,
    status :"active"
  });

  

  return res
    .status(201)
    .json(new ApiResponse(201, pool, "Pool created successfully !"));
});

// 8 .check pool applications
export const getPoolApplications = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const applications = await PoolApplication.find({ pool: poolId, application_status: "pending" })
    .populate("gig", "first_name last_name avatar fullName")
    .select("-__v");
  return res.status(200).json(new ApiResponse(200, applications, "Pending applications fetched"));
});

//9. review and approve gigs
export const reviewApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { action, orgPoolId } = req.body; // "approve" or "reject"

  const application = await PoolApplication.findById(applicationId);
  if (!application) throw new ApiError(404, "Application not found");

  const pool = await Pool.findById(application.pool);
  const orgPool = await OrganizerPool.findById(orgPoolId);

  if (action === "approve") {
    // Check capacity
    if (pool.gigs.length >= orgPool.max_capacity) {
      pool.status = "archived";
      await pool.save();
      throw new ApiError(400, "Pool capacity reached, cannot add more gigs");
    }

    application.application_status = "accepted";
    await application.save();

    // Add gig to pool
    pool.gigs.push(application.gig);
    await pool.save();

    return res.status(200).json(new ApiResponse(200, application, "Gig approved and added to pool"));
  }

  if (action === "reject") {
    application.status = "rejected";
    await application.save();
    return res.status(200).json(new ApiResponse(200, application, "Gig application rejected"));
  }

  throw new ApiError(400, "Invalid action");
});
  
// 10. View Pool Details
export const getPoolDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pool = await Pool.findById(id)
  .populate("gigs", "first_name last_name avatar badges")
  .select("-__v");

  if (!pool) throw new ApiError(404, "Pool not found");

  return res
    .status(200)
    .json(new ApiResponse(200, pool, "Pool details fetched"));
});

// 11. Chat with Gig (Stub)
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

// 11. View Event Details
export const getEventDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("organizer", "name email")
    .select("-__v");

  if (!event) throw new ApiError(404, "Event not found");

  return res
    .status(200)
    .json(new ApiResponse(200, event, "Event details fetched"));
});

// 12. Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const payments = await Escrow.find({ organizer: organizerId }).select("-__v");

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history fetched"));
});

// 13. Simulate Payout
export const simulatePayout = asyncHandler(async (req, res) => {
  const { escrowId } = req.params;
  const escrow = await Escrow.findById(escrowId);

  if (!escrow || escrow.status !== "released") {
    throw new ApiError(400, "Escrow not ready for payout");
  }

  return res.status(200).json(new ApiResponse(200, escrow, "Payout simulated"));
});

// 14. Predict No-show Risk for Gig
export const getNoShowRisk = asyncHandler(async (req, res) => {
  const { gigId } = req.params;
  const gig = await User.findById(gigId);

  if (!gig) throw new ApiError(404, "Gig user not found");

  return res.status(200).json(new ApiResponse(200, {
    gigId,
    noShowRisk: gig.noShowRisk || 0,
  }, "No-show risk fetched"));
});


// 15. Get Organizer Wellness Score
export const getWellnessScore = asyncHandler(async (req, res) => {
  const organizer = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, {
    wellnessScore: organizer.wellnessScore || 100,
  }, "Wellness score fetched"));
});

// 16. Raise Dispute
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

// 17. View Disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  const disputes = await Dispute.find({}).populate("event", "title date").populate("gig", "name");

  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});


// 18. Live Event Tracking
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

// 19. Badges
export const getOrganizerBadges = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;

  // 1) Count how many events this organizer has completed
  const completedEventsCount = await Event.countDocuments({
    organizer: organizerId,
    status: "completed",
  });

  // 2) Find all eligible badges (threshold <= completed events)
  const eligibleBadges = await Badge.find({
    min_events: { $lte: completedEventsCount },
  });

  // 3) Award badges if not already owned
  for (const badge of eligibleBadges) {
    const alreadyHasBadge = await UserBadge.findOne({
      user: organizerId,
      badge: badge._id,
    });
    if (!alreadyHasBadge) {
      await UserBadge.create({
        user: organizerId,
        badge: badge._id,
      });
    }
  }

  // 4) Fetch all badges the organizer currently has
  const badges = await UserBadge.find({ user: organizerId })
    .populate("badge", "badge_name min_events")
    .select("createdAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      { badges, completedEventsCount },
      "Organizer badges fetched successfully"
    )
  );
});

// 20. Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const topOrganizers = await Rating.aggregate([
    { $match: { review_type: "host_to_organizer" } },
    { $group: { _id: req.user._id, avgRating: { $avg: "$rating" } } },
    { $sort: { avgRating: -1 } },
    { $limit: 10 },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, topOrganizers, "Leaderboard fetched"));
});



//  Get Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const organizerId = req.user._id;
  const notifications = await Notification.find({ user: organizerId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

//  Mark Notification as Read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });

  if(!updated) {
    return res.status(404).json(new ApiResponse(404, null, "Notification not found"));
  }
  return res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});



