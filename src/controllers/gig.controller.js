import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import EventAttendance from "../models/EventAttendance.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Pool from "../models/Pool.model.js"
import PoolApplication from "../models/PoolApplication.model.js";
import PoolMember from "../models/PoolMember.model.js";
import UserWallet from "../models/UserWallet.model.js";
import Payment from "../models/Payment.model.js";
import BehavioralAnalytics from "../models/BehavioralAnalytics.model.js";
import WellnessInteraction from "../models/WellnessInteraction.model.js";
import UserProfile from "../models/UserProfile.model.js";
import UserBadge from "../models/UserBadge.model.js";
import ReputationScore from "../models/ReputationScore.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import Dispute from "../models/Dispute.model.js";
import Notification from "../models/Notification.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import EscrowContract from "../models/EscrowContract.model.js";
import Feedback from "../models/Feedback.model.js";
import User from "../models/User.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import RecommendedEvent from "../models/RecommendedEvents.model.js";
import UserDocument from "../models/UserDocument.model.js";
import { ethers } from "ethers";
import axios from "axios";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// 1. View accepted events
const getMyEvents = asyncHandler(async (req, res) => {
  const gigObjectId = req.user._id; 

  console.log("Gig ObjectId:", gigObjectId);
  const events = await Event.find({ gigs: gigObjectId }).select("-__v");

  if (!events || events.length === 0) {
   return res
    .status(200)
    .json(new ApiResponse(200, [], "No accepted events found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Accepted events fetched"));
});

// 2. QR/GPS check-in
const checkIn = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  // Validate that gig is assigned to this event
  if (!event.gigs.includes(gigId)) {
   return res
    .status(403)
    .json(new ApiResponse(403, null, "Gig not assigned to this event"));
  }

  // Validate event status
  if (event.status !== "in_progress") {
    throw new ApiError(400, "Event is not in progress. Cannot check in.");
  }

  // Validate event date
  const now = new Date();
  if (now < event.start_date) {
    throw new ApiError(400, "Event has not started yet");
  }
  if (now > event.end_date) {
    throw new ApiError(400, "Event has already ended");
  }

  const alreadyCheckedIn = await EventAttendance.findOne({
    gig: gigId,
    event: eventId,
  });

  if (alreadyCheckedIn) {
    return res
    .status(200)
    .json(new ApiResponse(200, alreadyCheckedIn, "User Already checked in"));
  }

  const attendance = await EventAttendance.create({
    gig: gigId,
    event: eventId,
    check_in_time: new Date(),
    status: "checked_in",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, attendance, "Check-in successful"));
});

// 3. View attendance history
const getAttendanceHistory = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const history = await EventAttendance.find({ gig: gigId })
    .populate("event", "name date location")
    .select("-__v");

  if (!history || history.length === 0) {
    throw new ApiError(404, "No attendance history found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, history, "Attendance history fetched"));
});
 
// 4. View nearby events
const getNearbyEvents = asyncHandler(async (req, res) => {
  const { coordinates } = req.body; // [lng, lat]

  const events = await Event.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 10000, // 10km radius
      },
    },
    status: "published",
  })

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Nearby events fetched"));
});

// 5. View nearby organizer pools
// Accepts optional query params `lng` and `lat`. If provided, runs a $near query.
// If not provided, returns all open pools. Populates basic organizer info so
// frontend can show organizer name and profile image (DP).
const getOrganizerPools = asyncHandler(async (req, res) => {
  // Support coordinates sent either as query params (preferred for GET)
  // or in the request body (fallback).
  const lngQ = req.query.lng ?? req.body?.lng ?? req.body?.coordinates?.[0];
  const latQ = req.query.lat ?? req.body?.lat ?? req.body?.coordinates?.[1];

  const lng = typeof lngQ === 'string' ? parseFloat(lngQ) : lngQ;
  const lat = typeof latQ === 'string' ? parseFloat(latQ) : latQ;

  let query = { status: 'open' };

  if (!isNaN(lng) && !isNaN(lat)) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: 10000,
      },
    };
  }

  // Populate organizer basic info (name, profile image) for frontend
  const pools = await OrganizerPool.find(query)
    .populate('organizer', 'name profile_image_url avatar')
    .lean();

  // Map to a stable shape the frontend expects
  const gigId = req.user._id;

  // Get the application status for each pool
  const poolIds = pools.map(p => p._id);
  const applications = await PoolApplication.find({
    gig: gigId,
    pool: { $in: poolIds }
  });

  const applicationMap = applications.reduce((acc, app) => {
    acc[app.pool.toString()] = app.status;
    return acc;
  }, {});

  const mapped = await Promise.all(pools.map(async (p) => ({
    _id: p._id,
    pool_name: p.pool_name,
    name: p.pool_name,
    description: p.description || '',
    events: p.event ? 1 : 0,
    max_capacity: p.max_capacity,
    pay_range: p.pay_range,
    organizer: p.organizer ? {
      _id: p.organizer._id,
      name: p.organizer.name,
      profile_image_url: p.organizer.profile_image_url || p.organizer.avatar
    } : null,
    location: p.location,
    status: applicationMap[p._id.toString()] || 'not_applied'
  })));

  return res.status(200).json(new ApiResponse(200, mapped, 'Nearby pools fetched'));
});

// NEW: showPools - return pools created using the Pool model (organizer-created pools)
// Supports optional query params: city and date (YYYY-MM-DD). Filters by organizer's
// profile.city and by organizer events starting on the specified date.
const showPools = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { city, date } = req.query;

  // Build aggregation pipeline to filter pools and enrich organizer info
  const pipeline = [];

  // // Only active pools
  // pipeline.push({ $match: { status: 'active' } });

  // Lookup organizer data
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'organizer',
      foreignField: '_id',
      as: 'organizer'
    }
  });
  pipeline.push({ $unwind: { path: '$organizer', preserveNullAndEmptyArrays: true } });

  // If city filter present, lookup UserProfile and match profile.location.city
  if (city) {
    pipeline.push({
      $lookup: {
        from: 'userprofiles',
        localField: 'organizer._id',
        foreignField: 'user',
        as: 'profile'
      }
    });
    pipeline.push({ $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } });
    pipeline.push({
      $match: {
        $or: [
          { 'profile.location.city': { $regex: city, $options: 'i' } },
          { 'profile.location.town': { $regex: city, $options: 'i' } },
          { 'profile.location.state': { $regex: city, $options: 'i' } }
        ]
      }
    });
  }

  // If date filter present, lookup events for organizer that start on that date
  if (date) {
    // Parse date into a start and end for the day
    const dateObj = new Date(date);
    const dayStart = new Date(dateObj.setHours(0, 0, 0, 0));
    const dayEnd = new Date(dateObj.setHours(24, 0, 0, 0));

    pipeline.push({
      $lookup: {
        from: 'events',
        let: { orgId: '$organizer._id' },
        pipeline: [
          { $match: { $expr: { $and: [ { $eq: ['$organizer', '$$orgId'] }, { $gte: ['$start_date', dayStart] }, { $lt: ['$start_date', dayEnd] } ] } } },
          { $project: { _id: 1, name: 1, start_date: 1 } }
        ],
        as: 'eventsOnDate'
      }
    });

    // Only include pools whose organizer has an event on that date
    pipeline.push({ $match: { 'eventsOnDate.0': { $exists: true } } });
  }

  // Project fields that frontend expects
  pipeline.push({
    $project: {
      _id: 1,
      name: 1,
      description: 1,
      organizer: {
        _id: '$organizer._id',
        name: '$organizer.name',
        profile_image_url: '$organizer.profile_image_url'
      },
      gigs: 1,
      createdAt: 1
    }
  });

  const pools = await Pool.aggregate(pipeline);

  // Get any existing applications by this gig for these pools
  const poolIds = pools.map(p => p._id);
  const applications = await PoolApplication.find({
    gig: gigId,
    pool: { $in: poolIds }
  });

  const applicationMap = applications.reduce((acc, app) => {
    acc[app.pool.toString()] = app.status;
    return acc;
  }, {});

  const mapped = pools.map((p) => ({
    _id: p._id,
    name: p.name,
    description: p.description || '',
    organizer: p.organizer || null,
    member_count: Array.isArray(p.gigs) ? p.gigs.length : 0,
    status: applicationMap[p._id.toString()] || (Array.isArray(p.gigs) && p.gigs.some(id => id?.toString() === gigId.toString()) ? 'joined' : 'not_joined'),
    createdAt: p.createdAt
  }));

  return res.status(200).json(new ApiResponse(200, mapped, 'Pools fetched'));
});

// Join a Pool created via the Pool model (organizer-created pools)
const joinPoolModel = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { poolId } = req.params;

  const pool = await Pool.findById(poolId);
  if (!pool) {
    throw new ApiError(404, 'Pool not found');
  }

  // If already a member
  if (Array.isArray(pool.gigs) && pool.gigs.some(id => id?.toString() === gigId.toString())) {
    return res.status(200).json(new ApiResponse(200, { status: 'joined' }, 'Already a member'));
  }

  // Add gig to pool members
  pool.gigs = pool.gigs || [];
  pool.gigs.push(gigId);
  await pool.save();

  // Notify organizer (optional)
  try {
    await Notification.create({
      user: pool.organizer,
      type: 'pool_membership',
      title: 'New Pool Member',
      message: `A gig worker has joined your pool "${pool.name}"`,
      data: { poolId: pool._id, gigId }
    });
  } catch (e) {
    // ignore notification failures
    console.warn('Failed to create pool join notification', e?.message || e);
  }

  return res.status(201).json(new ApiResponse(201, { status: 'joined', poolId: pool._id }, 'Joined pool'));
});

// 6. Join a specific pool
const joinPool = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { poolId } = req.params;
  const { proposed_rate, cover_message } = req.body;

  // Validate pool exists
  const pool = await OrganizerPool.findById(poolId);
  if (!pool) {
    throw new ApiError(404, "Pool not found");
  }

  // Check if already applied
  const existingApplication = await PoolApplication.findOne({
    gig: gigId,
    pool: poolId,
  });

  if (existingApplication) {
    if (existingApplication.status === 'pending') {
      return res
        .status(200)
        .json(new ApiResponse(200, { status: 'pending' }, "Application already pending"));
    }
    if (existingApplication.status === 'accepted') {
      return res
        .status(200)
        .json(new ApiResponse(200, { status: 'accepted' }, "Already a member of this pool"));
    }
  }

  // Create new application
  const application = await PoolApplication.create({
    gig: gigId,
    pool: poolId,
    status: 'pending',
    proposed_rate: proposed_rate ? mongoose.Types.Decimal128.fromString(proposed_rate.toString()) : undefined,
    cover_message: cover_message || 'Interested in joining the pool',
  });

  // Create notification for organizer
  await Notification.create({
    user: pool.organizer,
    type: 'pool_application',
    title: 'New Pool Application',
    message: `A gig worker has applied to join your pool "${pool.pool_name}"`,
    data: {
      poolId: pool._id,
      gigId: gigId,
      applicationId: application._id
    }
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { status: 'pending', application }, "Pool application submitted successfully"));
});

//gig wallet
const getWallet = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  let wallet = await UserWallet.findOne({ user: gigId });

  // If wallet doesn't exist, create one with default balance
  if (!wallet) {
    wallet = await UserWallet.create({
      user: gigId,
      upi_id: "aditya3676",
      balance_inr: mongoose.Types.Decimal128.fromString("2000.00"),
    });

    // Create an initial test payment
    await Payment.create({
      escrow: null,
      payer: gigId,  // self-credit for testing
      payee: gigId,
      amount: mongoose.Types.Decimal128.fromString("2000.00"),
      payment_method: "upi",
      status: "completed",
      upi_transaction_id: "INIT" + Date.now()
    });
  }

  // Defensive check: ensure balance_inr is valid
  const balanceRaw = wallet.balance_inr?.toString();
  const balanceFloat = isNaN(balanceRaw) ? 0.0 : parseFloat(balanceRaw);

  const formattedWallet = {
    ...wallet.toObject(),
    balance_inr: balanceFloat,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, formattedWallet, "Wallet fetched"));
});

// 8. UPI withdrawal request
const withdraw = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { amount } = req.body;

  // Validate input
  const requestedAmount = parseFloat(amount);
  if (isNaN(requestedAmount) || requestedAmount <= 0) {
    throw new ApiError(400, "Invalid withdrawal amount");
  }

  // Fetch wallet
  const wallet = await UserWallet.findOne({ user: gigId });
  if (!wallet || !wallet.balance_inr) {
    throw new ApiError(404, "Wallet not found or balance missing");
  }

  // Convert Decimal128 to float safely
  const balanceRaw = wallet.balance_inr.toString?.() || "0.00";
  const currentBalance = parseFloat(balanceRaw);

  if (isNaN(currentBalance)) {
    throw new ApiError(500, "Corrupted wallet balance");
  }

  // Check balance
  if (requestedAmount > currentBalance) {
    throw new ApiError(400, "Insufficient balance");
  }

  // Calculate new balance and cast back to Decimal128
  const newBalance = (currentBalance - requestedAmount).toFixed(2);
  wallet.balance_inr = mongoose.Types.Decimal128.fromString(newBalance);

  await wallet.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        new_balance: parseFloat(wallet.balance_inr.toString()),
      },
      "Withdrawal processed"
    )
  );
});

// 9. View payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const payments = await Payment.find({ payee: gigId })
    .populate("escrow", "event total_amount status")
    .sort({ createdAt: -1 }); // Sort by most recent first

  const formattedPayments = (payments || []).map((p) => ({
    ...p.toObject(),
    amount: parseFloat(p.amount?.toString() || "0.00"),
    description: p.escrow?.event?.name || "Event payment",
    type: "credit",  // All payments to gigs are credits
    createdAt: p.createdAt,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, formattedPayments, "Payment history fetched"));
});

// 10. View AI-predicted no-show risk
const getWellnessScore = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const score = await BehavioralAnalytics.findOne({ user: gigId });
  if (!score) {
    throw new ApiError(404, "No behavioral analytics found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, score, "Wellness score fetched"));
});

// 11. Get rest/hydration reminders
const getReminders = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const reminders = await WellnessInteraction.find({ user: gigId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("ai_response wellness_score createdAt");

  if (!reminders || reminders.length === 0) {
    throw new ApiError(404, "No wellness reminders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, reminders, "Wellness reminders fetched"));
});

// 12. View profile
const getProfile = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  // Fetch user core data
  const user = await User.findById(gigId).lean();
  if (!user) throw new ApiError(404, "User not found");

  // Try to fetch profile
  let profile = await UserProfile.findOne({ user: gigId});

  // Auto-create blank profile if missing
  if (!profile) {
    profile = await UserProfile.create({ user: gigId, profile_image_url: gigId.avatar, bank_details:gigId.wallet });
  }

  // Merge and return
  const mergedProfile = {
    user: gigId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    bio: profile.bio || "",
    location: profile.location || {},
    availability: profile.availability || {},
    bank_details: profile.bank_details || {},
    profile_image_url: profile.profile_image_url || "",
    createdAt: profile.createdAt || user.createdAt,
    updatedAt: profile.updatedAt || user.updatedAt,
  };

  return res.status(200).json(new ApiResponse(200, mergedProfile, "Profile fetched"));
});

// 13. Update profile
const updateProfile = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const updates = req.body;

  const profile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json(new ApiResponse(200, profile, "Profile updated"));
});

// 14. View earned badges
const getBadges = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const badges = await UserBadge.find({ user: gigId })
    .populate("badge", "name description icon_url")
    .select("awarded_at");

  return res.status(200).json(new ApiResponse(200, badges, "Badges fetched"));
});

// 15. View leaderboard position
const getLeaderboard = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const score = await ReputationScore.findOne({ user: gigId }).select(
    "last_updated"
  );
  if (!score) {
    throw new ApiError(404, "Reputation score not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, score, "Leaderboard data fetched"));
});

// 16. List chat threads
const getConversations = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

const conversations = await Conversation.find({
  $or: [
    { "participants.gig": gigId },
    { "participants.organizer": gigId }
  ]
})
    .populate("event", "name date location")
    .populate("pool", "name")
    .sort({ createdAt: -1 });

    console.log(conversations)
  return res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched"));
});


// 17. Send message in chat
const sendMessage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { conversationId } = req.params;
  const { message_text } = req.body;

  const conversation = await Conversation.findById(conversationId);
 if (
  !conversation ||
  !conversation.participants.some(
    (p) => p.userId?.toString() === gigId.toString()
  )
) {
  throw new ApiError(403, "Access denied to this conversation");
}


  const message = await Message.create({
    conversation: conversationId,
    sender: gigId,
    message_text,
  });

  return res.status(201).json(new ApiResponse(201, message, "Message sent"));
});


//18. Raise dispute for an event
const raiseDispute = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim() === "") {
    throw new ApiError(400, "Dispute reason is required");
  }

  const dispute = await Dispute.create({
    event: eventId,
    gig: gigId,
    reason,
  });

  return res.status(201).json(new ApiResponse(201, dispute, "Dispute raised"));
});

// 19. Get notifications
const getNotifications = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const notifications = await Notification.find({ user: gigId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched"));
});

// 20. Update profile image
const updateProfileImage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { profile_image_url: avatarUpload.url },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image updated"));
});

// 21. Simulate payout from escrow (for testing)
const simulatePayout = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { escrowId } = req.params;
  console.log(typeof gigId, typeof escrowId);
  const escrow = await EscrowContract.findOne({
    _id: "68f07d7c2620923b5bf1f50b",
    gig: gigId,
    status: "funded",
  });

  console.log(typeof escrowId, typeof gigId);
  if (!escrow) {
    throw new ApiError(404, "Escrow not found or already released");
  }

  // Update escrow status
  escrow.status = "released";
  escrow.released_at = new Date();
  await escrow.save();

  return res.status(200).json(new ApiResponse(200, escrow, "Payout simulated"));
});

// 22. Submit event feedback
const submitFeedback = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const feedback = await Feedback.create({
    event: eventId,
    gig: gigId,
    rating,
    comment,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Feedback submitted"));
});

// 23. Delete profile image
const deleteProfileImage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { profile_image_url: "" },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image removed"));
});

// 24. get kyc status
const getKYCStatus = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const kyc = await KYCVerification.findOne({ user: gigId });

  if (!kyc) {
    throw new ApiError(404, "KYC record not found");
  }

  return res.status(200).json(new ApiResponse(200, kyc, "KYC status fetched"));
});

// 25. Debugging endpoint to fetch gig data
const debugGigData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  const attendance = await EventAttendance.find({ gig: id });
  const wallet = await UserWallet.findOne({ user: id });

  return res
    .status(200)
    .json(new ApiResponse(200, { user, attendance, wallet }, "Gig debug data"));
});

// 26. get recommended events
const getRecommendedEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const recommendations = await RecommendedEvent.find({ gig: gigId })
    .populate("event")
    .sort({ score: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, recommendations, "Recommended events fetched"));
});

// 27. get gig dashboard
const getGigDashboard = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const [attendance, wallet, feedbacks, badges] = await Promise.all([
    EventAttendance.find({ gig: gigId }),
    UserWallet.findOne({ user: gigId }),
    Feedback.find({ gig: gigId }),
    UserBadge.find({ user: gigId }),
  ]);

  const totalEvents = attendance.length;
  const totalEarnings = wallet?.balance || 0;
  const averageRating =
    feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalEvents,
        totalEarnings,
        averageRating,
        badges,
      },
      "Gig dashboard fetched"
    )
  );
});

// 28. upload documents
const uploadDocuments = asyncHandler(async (req, res) => {
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
    type,
    fileUrl: cloudinaryRes.secure_url,
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

const uploadKycVideo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const videoUrl = req.files?.videoUrl?.[0]?.path;

  if (!videoUrl) {
    throw new ApiError(400, "Video file is required");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.kycVideo = {
    url: videoUrl,
    status: "pending",
    uploadedAt: new Date(),
  };

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videoUrl },
        "KYC video uploaded and pending verification"
      )
    );
});

// 29. create wallet
const createWallet = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (user.wallet?.address) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { address: user.wallet.address },
          "Wallet already exists"
        )
      );
  }

  const wallet = ethers.Wallet.createRandom();

  user.wallet = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    createdAt: new Date(),
  };

  await user.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { address: wallet.address },
        "Wallet created successfully"
      )
    );
});

// 30. Aadhaar verification  (not currently in feature)
const verifyAadhaar = asyncHandler(async (req, res) => {
  const { aadhaarNumber, otp } = req.body;
  const userId = req.user._id;

  if (!aadhaarNumber || !otp) {
    throw new ApiError(400, "Aadhaar number and OTP are required");
  }

  const response = await axios.post(
    "https://sandbox.aadhaarkyc.io/v1/verify",
    {
      aadhaar_number: aadhaarNumber,
      otp,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AADHAAR_SANDBOX_TOKEN}`,
      },
    }
  );

  if (!response.data.success) {
    throw new ApiError(403, "Aadhaar verification failed");
  }

  const user = await User.findById(userId);
  user.verificationStatus = "verified";
  user.aadhaarDetails = response.data.details;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, response.data.details, "Aadhaar verified"));
});

export {
  getNearbyEvents,
  getOrganizerPools,
  showPools,
  joinPoolModel,
  joinPool,
  getMyEvents,
  checkIn,
  getAttendanceHistory,
  getWallet,
  withdraw,
  getPaymentHistory,
  getWellnessScore,
  getReminders,
  getProfile,
  updateProfile,
  getBadges,
  getLeaderboard,
  getConversations,
  sendMessage,
  raiseDispute,
  getNotifications,
  updateProfileImage,
  simulatePayout,
  submitFeedback,
  deleteProfileImage,
  getKYCStatus,
  debugGigData,
  getRecommendedEvents,
  getGigDashboard,
  uploadDocuments,
  uploadKycVideo,
  createWallet,
  verifyAadhaar,
  getOrganizerPoolDetails,
  getPoolModelDetails,
};

// Get details of a specific organizer pool
const getOrganizerPoolDetails = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const gigId = req.user._id;

  const pool = await OrganizerPool.findById(poolId)
    .populate('organizer', 'name profile_image_url avatar');

  if (!pool) {
    throw new ApiError(404, "Pool not found");
  }

  // Check if the gig worker has already applied to this pool
  const application = await PoolApplication.findOne({
    gig: gigId,
    pool: poolId,
  });

  const response = {
    _id: pool._id,
    name: pool.pool_name,
    pool_name: pool.pool_name,
    description: pool.description,
    organizer: pool.organizer,
    max_capacity: pool.max_capacity,
    pay_range: pool.pay_range,
    events: pool.events,
    location: pool.location,
    status: application ? application.status : 'not_applied',
    createdAt: pool.createdAt,
    updatedAt: pool.updatedAt
  };

  return res.status(200).json(new ApiResponse(200, response, "Pool details fetched"));
});

// Get details of a specific Pool (Pool model)
const getPoolModelDetails = asyncHandler(async (req, res) => {
  const { poolId } = req.params;
  const gigId = req.user._1 || req.user._id || req.user?.id || req.user;

  // Normalize gigId to ObjectId-ish string when possible
  const gigObjectId = req.user._id;

  const pool = await Pool.findById(poolId)
    .populate('organizer', 'name profile_image_url avatar')
    .lean();

  if (!pool) {
    throw new ApiError(404, "Pool not found");
  }

  // Check if the gig worker has an existing application for this pool
  const application = await PoolApplication.findOne({ gig: gigObjectId, pool: poolId });

  const response = {
    _id: pool._id,
    name: pool.name,
    description: pool.description || '',
    organizer: pool.organizer || null,
    gigs: pool.gigs || [],
    member_count: Array.isArray(pool.gigs) ? pool.gigs.length : 0,
    hasJoined: Array.isArray(pool.gigs) && pool.gigs.some(id => id?.toString() === gigObjectId.toString()),
    status: application ? application.status : (Array.isArray(pool.gigs) && pool.gigs.some(id => id?.toString() === gigObjectId.toString()) ? 'joined' : 'not_joined'),
    createdAt: pool.createdAt,
    updatedAt: pool.updatedAt
  };

  return res.status(200).json(new ApiResponse(200, response, "Pool details fetched"));
});
