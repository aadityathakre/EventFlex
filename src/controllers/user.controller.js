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
  const requiredFields = [
    email,
    phone,
    password,
    role,
    first_name,
    last_name,
    wallet_address,
    universal_role_id,
  ];

  if (requiredFields.some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // 3. Validate phone number (Indian format)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiError(400, "Invalid phone number format");
  }

  // 4. Validate password strength
  if (password.length < 5) {
    throw new ApiError(400, "Password must be at least 5 characters long");
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
  }



  // 5. Validate role
  const validRoles = ["gig", "organizer", "host"];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, "Invalid role provided");
  }

  // 6. Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { universal_role_id }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with provided email or role ID already exists");
  }

  // 7. Handle avatar upload
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  let avatarUrl = null;

  if (avatarLocalPath) {
    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUpload?.url) {
      throw new ApiError(500, "Avatar upload failed");
    }
    avatarUrl = avatarUpload.url;
  }

  // 8. Create user
  const user = await User.create({
    email,
    phone,
    password,
    role,
    first_name,
    last_name,
    wallet_address,
    avatar: avatarUrl,
    universal_role_id,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "User registration failed");
  }
  
  // 9. Respond
  return res
  .status(201)
  .json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

// Soft delete user (admin only)
const softDeleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  await user.softDelete();
  
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User soft deleted successfully"));
});

// Restore user (admin only)
const restoreUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  await user.restore();
  
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User restored successfully"));
});

export { registerUser, softDeleteUser, restoreUser };