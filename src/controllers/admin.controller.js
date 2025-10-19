import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js";
import User from "../models/User.model.js";
import KYCVerification from "../models/KYCVerification.model.js";
import UserDocument from "../models/UserDocument.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. 🔐 Admin Login (uses Admin schema)
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid admin credentials");
  }

  const token = jwt.sign({ _id: admin._id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return res.status(200).json(new ApiResponse(200, { token }, "Admin login successful"));
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

// 8. ✍️ Verify E-Signature
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