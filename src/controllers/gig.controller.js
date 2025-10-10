import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import EventAttendance from "../models/EventAttendance.model.js";
import Event from "../models/Event.model.js";
import OrganizerPool from "../models/OrganizerPool.model.js";
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
import UserProfile from "../models/UserProfile.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import RecommendedEvent from "../models/RecommendedEvent.model.js";



// 1. View accepted events
const getMyEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const events = await Event.find({ gigs: gigId }).select("-__v");
  if (!events || events.length === 0) {
    throw new ApiError(404, "No accepted events found");
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

  const alreadyCheckedIn = await EventAttendance.findOne({
    gig: gigId,
    event: eventId,
  });
  if (alreadyCheckedIn) {
    throw new ApiError(409, "Already checked in");
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
  }).select("title start_date end_date location budget");

  return res
    .status(200)
    .json(new ApiResponse(200, events, "Nearby events fetched"));
});

// 5. View nearby organizer pools
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
    isActive: true,
  }).select("organizer skills_needed pool_size location");

  return res
    .status(200)
    .json(new ApiResponse(200, pools, "Nearby pools fetched"));
});

// 6. Join a specific pool
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
    throw new ApiError(409, "Already applied to this pool");
  }

  const application = await PoolApplication.create({
    gig: gigId,
    pool: poolId,
    proposed_rate,
    cover_message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, application, "Pool application submitted"));
});

// 7. View wallet balance
const getWallet = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const wallet = await UserWallet.findOne({ user: gigId });
  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

  return res.status(200).json(new ApiResponse(200, wallet, "Wallet fetched"));
});

// 8. UPI withdrawal request
const withdraw = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { amount } = req.body;

  const wallet = await UserWallet.findOne({ user: gigId });
  if (!wallet) {
    throw new ApiError(404, "Wallet not found");
  }

  const currentBalance = parseFloat(wallet.balance_inr.toString());
  const requestedAmount = parseFloat(amount);

  if (requestedAmount > currentBalance) {
    throw new ApiError(400, "Insufficient balance");
  }

  // Simulate withdrawal logic
  wallet.balance_inr = currentBalance - requestedAmount;
  await wallet.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { new_balance: wallet.balance_inr },
        "Withdrawal processed"
      )
    );
});

// 9. View payment history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const payments = await Payment.find({ payee: gigId })
    .populate("escrow", "event total_amount status")
    .select("amount payment_method processed_at upi_transaction_id");

  if (!payments || payments.length === 0) {
    throw new ApiError(404, "No payments found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, payments, "Payment history fetched"));
});

// 10. View AI-predicted no-show risk
const getWellnessScore = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const score = await BehavioralAnalytics.findOne({ user: gigId }).select(
    "no_show_risk_score last_calculated"
  );
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

  const profile = await UserProfile.findOne({ user: gigId }).select("-__v");
  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  return res.status(200).json(new ApiResponse(200, profile, "Profile fetched"));
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
    "overall_rating trust_level last_updated"
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
    participants: { $in: [gigId] },
  })
    .populate("event", "name date location")
    .populate("pool", "name")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, conversations, "Conversations fetched"));
});

// 17. Send message in chat
const sendMessage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { conversationId } = req.params;
  const { message_text } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation || !conversation.participants.includes(gigId)) {
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

  const notifications = await Notification.find({ user: gigId }).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
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

  return res.status(200).json(new ApiResponse(200, updatedProfile, "Profile image updated"));
});

// 21. Simulate payout from escrow (for testing)
const simulatePayout = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { escrowId } = req.params;

  const escrow = await EscrowContract.findOne({
    _id: escrowId,
    gig: gigId,
    status: "locked",
  });

  if (!escrow) {
    throw new ApiError(404, "Escrow not found or already released");
  }

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

  return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});


// 23. Delete profile image
const deleteProfileImage = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const updatedProfile = await UserProfile.findOneAndUpdate(
    { user: gigId },
    { profile_image_url: "" },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedProfile, "Profile image removed"));
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

  return res.status(200).json(
    new ApiResponse(200, { user, attendance, wallet }, "Gig debug data")
  );
});

// 26. get recommended events
 const getRecommendedEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const recommendations = await RecommendedEvent.find({ gig: gigId })
    .populate("event")
    .sort({ score: -1 });

  return res.status(200).json(new ApiResponse(200, recommendations, "Recommended events fetched"));
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
    new ApiResponse(200, {
      totalEvents,
      totalEarnings,
      averageRating,
      badges,
    }, "Gig dashboard fetched")
  );
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
  getGigDashboard
};
