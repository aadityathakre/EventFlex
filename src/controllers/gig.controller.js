import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import EventAttendance from "../models/EventAttendance.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
import Pool from "../models/Pool.model.js";
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


// 1. View profile //
const getProfile = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  // Fetch user core data
  const user = await User.findById(gigId).lean();
  if (!user) throw new ApiError(404, "User not found");

  // Try to fetch profile
  let profile = await UserProfile.findOne({ user: gigId });

  // Auto-create blank profile if missing
  if (!profile) {
    profile = await UserProfile.create({
      user: gigId,
      profile_image_url: user.avatar,
      bank_details: user.wallet
    });
  }

  // Merge and return
  const mergedProfile = {
    user: gigId,
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

  return res.status(200).json(new ApiResponse(200, mergedProfile, "Profile fetched"));
});

// 2. Update profile //
const updateProfile = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const updates = req.body;

  // Separate updates for User vs UserProfile
  const userUpdates = {};
  const profileUpdates = {};

  if (updates.first_name) userUpdates.first_name = updates.first_name;
  if (updates.last_name) userUpdates.last_name = updates.last_name;
  if (updates.email) userUpdates.email = updates.email;
  if (updates.phone) userUpdates.phone = updates.phone;

  if (updates.bio) profileUpdates.bio = updates.bio;
  if (updates.location) profileUpdates.location = updates.location;
  if (updates.availability) profileUpdates.availability = updates.availability;
  if (updates.bank_details) profileUpdates.bank_details = updates.bank_details;

  // Update User schema fields
  if (Object.keys(userUpdates).length > 0) {
    await User.findByIdAndUpdate(gigId, { $set: userUpdates }, { new: true, runValidators: true });
  }

  // Update UserProfile schema fields
  let profile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { $set: profileUpdates },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json(new ApiResponse(200, { userUpdates, profile }, "Profile updated"));
});

// 3. Update profile image //
const updateProfileImage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const avatarLocalPath = req.files?.avatar?.[0]?.path; // or req.file.path if using single upload

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // Update both User and UserProfile for consistency
  await User.findByIdAndUpdate(gigId, { avatar: avatarUpload.url });

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { profile_image_url: avatarUpload.url },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image updated"));
});

// 4. Delete profile image //
const deleteProfileImage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  // Reset avatar in User model
  await User.findByIdAndUpdate(
    gigId,
    { avatar: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" },
    { new: true }
  );

  // Reset profile_image_url in UserProfile model
  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { profile_image_url: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" },
    { new: true }
  );

  if (!updatedProfile) {
    throw new ApiError(404, "Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Profile image removed"));
});

// 5. create wallet //
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

// 6. gig wallet //
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

// 7. UPI withdrawal request //
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

// 8. View payment history //
const getPaymentHistory = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const payments = await Payment.find({ payee: gigId })
    .populate("escrow", "event total_amount status");

  if (!payments || payments.length === 0) {
    throw new ApiError(404, "No payments found");
  }

  const formattedPayments = payments.map((p) => ({
    ...p.toObject(),
    amount: parseFloat(p.amount?.toString() || "0.00"),
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, formattedPayments, "Payment history fetched"));
});

// 9. upload documents  //
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



//  View accepted events
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

//  QR/GPS check-in
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

//  View attendance history
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

//  View nearby events
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

//  View nearby organizer pools
const getOrganizerPools = asyncHandler(async (req, res) => {
  const { coordinates } = req.body;

  const pools = await OrganizerPool.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates,
        },
        $maxDistance: 10000,
      },
    },
    status: "open", // ✅ match schema
  }).select("-organizer");

  return res
    .status(200)
    .json(new ApiResponse(200, pools, "Nearby pools fetched"));
});

//  Join a specific pool
const joinPool = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { poolId } = req.params;
  const { proposed_rate, cover_message } = req.body;

  const pool = await OrganizerPool.findById(poolId);
  if (!pool) {
    throw new ApiError(404, "Pool not found");
  }

  const existingApplication = await PoolApplication.findOne({
    gig: gigId,
    pool: poolId,
  });
  if (existingApplication) {
    return res
    .status(200)
    .json(new ApiResponse(201, existingApplication, "GiG  already in this pool"));
  }

  const application = await PoolApplication.create({
    gig: gigId,
    pool: poolId,
    proposed_rate: mongoose.Types.Decimal128.fromString(
      proposed_rate.toString()
    ),
    cover_message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Pool application submitted"));
});

//  View AI-predicted no-show risk
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

//  Get rest/hydration reminders
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

//  Send message in chat
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


// Raise dispute for an event
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

//  Get notifications
const getNotifications = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const notifications = await Notification.find({ user: gigId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications fetched"));
});


//  View earned badges
const getBadges = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const badges = await UserBadge.find({ user: gigId })
    .populate("badge", "name description icon_url")
    .select("awarded_at");

  return res.status(200).json(new ApiResponse(200, badges, "Badges fetched"));
});

//  Simulate payout from escrow (for testing)
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

//  Submit event feedback
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

//  View leaderboard position
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

//  get kyc status
const getKYCStatus = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const kyc = await KYCVerification.findOne({ user: gigId });

  if (!kyc) {
    throw new ApiError(404, "KYC record not found");
  }

  return res.status(200).json(new ApiResponse(200, kyc, "KYC status fetched"));
});

//  Debugging endpoint to fetch gig data
const debugGigData = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  const attendance = await EventAttendance.find({ gig: id });
  const wallet = await UserWallet.findOne({ user: id });

  return res
    .status(200)
    .json(new ApiResponse(200, { user, attendance, wallet }, "Gig debug data"));
});

//  get recommended events
const getRecommendedEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const recommendations = await RecommendedEvent.find({ gig: gigId })
    .populate("event")
    .sort({ score: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, recommendations, "Recommended events fetched"));
});

//  get gig dashboard
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

//  List chat threads
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

// Aadhaar verification  (not currently in feature)
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
};
