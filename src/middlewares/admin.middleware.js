import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import Admin from "../models/Admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🔐 Verify Admin Token
const verifyAdminToken = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request: token missing");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const admin = await Admin.findById(decodedToken?._id).select("-password -refreshToken");

    if (!admin || !admin.is_active) {
      throw new ApiError(401, "Invalid or inactive admin token");
    }

    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export { verifyAdminToken };