import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js";
import User from "../models/User.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import UserDocument from "../models/UserDocument.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Badge from "../models/Badge.model.js";
import UserBadge from "../models/UserBadge.model.js";
import Dispute from "../models/Dispute.model.js";
import EscrowContract from "../models/EscrowContract.model.js";
import Notification from "../models/Notification.model.js";
import Payment from "../models/Payment.model.js";
import Event from "../models/Event.model.js";
import WellnessInteraction from "../models/WellnessInteraction.model.js";

// 🔐 Admin Registration
export const adminRegister = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(409, "Admin already exists with this email");
  }

  const newAdmin = await Admin.create({ email, password });

  const accessToken = newAdmin.generateAccessToken();
  const refreshToken = newAdmin.generateRefreshToken();

  newAdmin.refreshToken = refreshToken;
  newAdmin.last_action_type = "register";
  newAdmin.last_action_at = new Date();
  await newAdmin.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  const registeredAdmin = await Admin.findById(newAdmin._id).select("-password -refreshToken");

  return res
    .status(201)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        201,
        { admin: registeredAdmin, accessToken, refreshToken },
        "Admin registered successfully"
      )
    );
});

// 1. 🔐 Admin Login (uses Admin schema)
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  admin.refreshToken = refreshToken;
  admin.last_action_type = "login";
  admin.last_action_at = new Date();
  await admin.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { admin: loggedInAdmin, accessToken, refreshToken },
        "Admin login successful"
      )
    );
});

// 2. 🔐 View All Roles
export const getAllRoles = asyncHandler(async (req, res) => {
  const users = await User.find().select("first_name last_name email role isBanned createdAt");
  return res.status(200).json(new ApiResponse(200, users, "User roles fetched"));
});

// 3. 🔐 Ban User
export const banUser = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const user = await User.findById(userid);
  if (!user) throw new ApiError(404, "User not found");

  user.isBanned = true;
  await user.save();

  return res.status(200).json(new ApiResponse(200, user, "User access restricted"));
});

// 4. ✅ View Pending KYC
export const getPendingKYC = asyncHandler(async (req, res) => {
  const pending = await KYCVerification.find({ status: "pending" }).populate("user");
  return res.status(200).json(new ApiResponse(200, pending, "Pending KYC submissions fetched"));
});

// 5. ✅ Approve KYC
export const approveKYC = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const kyc = await KYCVerification.findOne({ user: userid });
  if (!kyc) throw new ApiError(404, "KYC record not found");

  kyc.status = "approved";
  await kyc.save();

  return res.status(200).json(new ApiResponse(200, kyc, "KYC approved"));
});

// 6. ✅ Reject KYC
export const rejectKYC = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const kyc = await KYCVerification.findOne({ user: userid });
  if (!kyc) throw new ApiError(404, "KYC record not found");

  kyc.status = "rejected";
  await kyc.save();

  return res.status(200).json(new ApiResponse(200, kyc, "KYC rejected"));
});

// 7. 📄 View Uploaded Documents
export const getUserDocuments = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const docs = await UserDocument.find({ user: userid });
  return res.status(200).json(new ApiResponse(200, docs, "User documents fetched"));
});

// 8. ✍️ Verify E-Signature  (upcoming feature)
export const verifyESignature = asyncHandler(async (req, res) => {
  const { userid } = req.params;

  const user = await User.findById(userid);
  if (!user || !user.digital_signature) {
    throw new ApiError(404, "Digital signature not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { signature: user.digital_signature }, "E-signature verified")
  );
});


// 9.🏅 Create Badge
export const createBadge = asyncHandler(async (req, res) => {
  const { badge_name, min_events, kyc_required } = req.body;
  if (!badge_name || min_events === undefined) {
    throw new ApiError(400, "Badge name and min_events are required");
  }
  const badge = await Badge.create({ badge_name, min_events, kyc_required });
  return res.status(201).json(new ApiResponse(201, badge, "Badge created"));
});

// 10.⚖️ View Disputes
export const getDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find().populate("event gig").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched"));
});

// 11. ⚖️ Resolve Dispute
export const resolveDispute = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { resolution_notes } = req.body;
  const dispute = await Dispute.findById(id);
  if (!dispute) throw new ApiError(404, "Dispute not found");
  dispute.status = "resolved";
  dispute.resolution_notes = resolution_notes || "";
  await dispute.save();
  return res.status(200).json(new ApiResponse(200, dispute, "Dispute resolved"));
});

// 12.📜 View Audit Logs
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await EscrowContract.find({ resolved_by_admin: { $exists: true } })
    .populate("event host organizer resolved_by_admin")
    .sort({ updatedAt: -1 });
  return res.status(200).json(new ApiResponse(200, logs, "Audit logs fetched"));
});

// 13.📢 Broadcast Message
export const broadcastMessage = asyncHandler(async (req, res) => {
  const { message, type = "system" } = req.body;
  if (!message) throw new ApiError(400, "Message content required");
  const users = await User.find().select("_id");
  const notifications = users.map((user) => ({
    user: user._id,
    type,
    message,
  }));
  await Notification.insertMany(notifications);
  return res.status(200).json(new ApiResponse(200, null, "Broadcast sent to all users"));
});

// 14.📩 Notify Specific User
export const notifyUser = asyncHandler(async (req, res) => {
  const { userid } = req.params;
  const { message, type = "system" } = req.body;
  if (!message) throw new ApiError(400, "Message content required");
  const user = await User.findById(userid);
  if (!user) throw new ApiError(404, "User not found");
  const notification = await Notification.create({ user: userid, type, message });
  return res.status(200).json(new ApiResponse(200, notification, "Notification sent"));
});

// 15.📜 View Sent Notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().populate("user").sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, notifications, "Notification history fetched"));
});

// 16.📊 Analytics: Users
export const getUserAnalytics = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const roles = await User.aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);
  return res.status(200).json(new ApiResponse(200, { totalUsers, roles }, "User analytics"));
});

// 17.📊 Analytics: Events
export const getEventAnalytics = asyncHandler(async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const recentEvents = await Event.find().sort({ createdAt: -1 }).limit(10);
  return res.status(200).json(new ApiResponse(200, { totalEvents, recentEvents }, "Event analytics"));
});

// 18.📊 Analytics: Payments
export const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const totalPayments = await Payment.countDocuments();
  const totalAmount = await Payment.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return res.status(200).json(new ApiResponse(200, {
    totalPayments,
    totalAmount: totalAmount[0]?.total?.toString() || "0",
  }, "Payment analytics"));
});

// 19.🏆 Leaderboard
export const getLeaderboard = asyncHandler(async (req, res) => {
  const badges = await UserBadge.find().populate("user badge");
  const leaderboard = await Promise.all(
    badges.map(async (entry) => {
      const wellness = await WellnessInteraction.findOne({ user: entry.user._id })
        .sort({ createdAt: -1 });
      return {
        userId: entry.user._id,
        name: `${entry.user.first_name} ${entry.user.last_name}`,
        role: entry.user.role,
        badge: entry.badge.badge_name,
        min_events: entry.badge.min_events,
        kyc_required: entry.badge.kyc_required,
        wellness_score: wellness?.wellness_score?.toString() || "N/A",
      };
    })
  );
  return res.status(200).json(new ApiResponse(200, leaderboard, "Leaderboard with wellness fetched"));
});