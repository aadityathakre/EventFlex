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


// 1. View accepted events
const getMyEvents = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const events = await Event.find({ gigs: gigId }).select("-__v");
  if (!events || events.length === 0) {
    throw new ApiError(404, "No accepted events found");
  }

  return res.status(200).json(new ApiResponse(200, events, "Accepted events fetched"));
});

// 2. QR/GPS check-in
const checkIn = asyncHandler(async (req, res) => {
  const gigId = req.user._id;
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const alreadyCheckedIn = await EventAttendance.findOne({ gig: gigId, event: eventId });
  if (alreadyCheckedIn) {
    throw new ApiError(409, "Already checked in");
  }

  const attendance = await EventAttendance.create({
    gig: gigId,
    event: eventId,
    check_in_time: new Date(),
    status: "checked_in",
  });

  return res.status(201).json(new ApiResponse(201, attendance, "Check-in successful"));
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

  return res.status(200).json(new ApiResponse(200, history, "Attendance history fetched"));
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

  return res.status(200).json(new ApiResponse(200, events, "Nearby events fetched"));
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

  return res.status(200).json(new ApiResponse(200, pools, "Nearby pools fetched"));
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

  const existingApplication = await PoolApplication.findOne({ gig: gigId, pool: poolId });
  if (existingApplication) {
    throw new ApiError(409, "Already applied to this pool");
  }

  const application = await PoolApplication.create({
    gig: gigId,
    pool: poolId,
    proposed_rate,
    cover_message,
  });

  return res.status(201).json(new ApiResponse(201, application, "Pool application submitted"));
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

  return res.status(200).json(
    new ApiResponse(200, { new_balance: wallet.balance_inr }, "Withdrawal processed")
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

  return res.status(200).json(new ApiResponse(200, payments, "Payment history fetched"));
});



// 10. View AI-predicted no-show risk
const getWellnessScore = asyncHandler(async (req, res) => {
  const gigId = req.user._id;

  const score = await BehavioralAnalytics.findOne({ user: gigId }).select("no_show_risk_score last_calculated");
  if (!score) {
    throw new ApiError(404, "No behavioral analytics found");
  }

  return res.status(200).json(new ApiResponse(200, score, "Wellness score fetched"));
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

  return res.status(200).json(new ApiResponse(200, reminders, "Wellness reminders fetched"));
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
};
