import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const {
    email,
    phone,
    password,
    role,
    first_name,
    last_name,
    wallet_address,
    universal_role_id,
  } = req.body;

  // 1. Validate required fields
  if (
    [
      email,
      phone,
      password,
      role,
      first_name,
      last_name,
      universal_role_id,
      wallet_address,
      
    ].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Validate role
  const validRoles = ["gig", "organizer", "host"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Invalid role provided");
  }

  // 3. Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, {password},{ universal_role_id }],
  });
  if (existingUser) {
    throw new ApiError(
      409,
      "User with provided email, phone, or role ID already exists"
    );
  }

  // 4. Check avatar file
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // 5. Upload avatar to Cloudinary
  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // 6. Create user
  const user = await User.create({
    email,
    phone,
    password,
    role,
    first_name,
    last_name,
    wallet_address,
    avatar: avatarUpload.url,
    universal_role_id,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }

  // 7. Respond
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
