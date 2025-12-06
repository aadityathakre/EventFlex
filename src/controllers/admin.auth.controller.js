import Admin from "../models/Admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Generate Access and Refresh Tokens for Admin
 const generateAccessAndRefreshTokensForAdmin = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating admin tokens");
  }
};

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

// 🚪 Admin Login
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

// 🔁 Refresh Admin Access Token
export const refreshAdminAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id);

    if (!admin) {
      throw new ApiError(401, "Admin not found");
    }

    if ( incomingRefreshToken !== admin?.refreshToken) {
      throw new ApiError(401, "Invalid or .... expired refresh token");
    }

    const options = { httpOnly: true, secure: true };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokensForAdmin(admin._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Admin access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// 🚪 Logout Admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const options = { httpOnly: true, secure: true };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},  "Admin logged out successfully!!"));
});