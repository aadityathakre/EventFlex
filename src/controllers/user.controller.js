import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import path from "path";

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullname, password } = req.body;
  console.log(email);

  //advanced   (check if they are empty)
  if (
    [email, username, fullname, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  //check user exist or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  //check if  avatar is null
 const avatarLocalPath = req.files?.avatar?.[0]?.path;
if (!avatarLocalPath) {
 console.log("DEBUG: req.body =", req.body);
console.log("DEBUG: req.files =", req.files);

  throw new ApiError(400, "avatar file is required");
}
//check if coverImage is null
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
  coverImageLocalPath= req.files.coverImage[0].path
}

  // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar upload failed");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //create entry on DB
  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering ");
  }

  if (!req.files || !req.files.avatar) {
    console.log("DEBUG: req.files =", req.files);
    throw new ApiError(400, "avatar file is required");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
