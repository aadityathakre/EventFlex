import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, fullname , password } = req.body;
  console.log(email);

  //begginer step
  //  if(fullname===""){
  //   throw new  ApiError(400, "fullname is required")
  //  }

  //advanced   (check if they are empty)
  if ([email, username,fullname , password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All field are required");
  }

  //check user exist or not
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }


  //check if coverImage and avatar is null 
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if(!avatarLocalPath){
    throw new ApiError(400, "avatar file is required")
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if(!avatar){
    throw new ApiError(400, "avatar file is required")
  }


    //create entry on DB
  const user = await  User.create({
      username: username.toLowerCase(),
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "" ,
      email,
      password,
    })

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

    if(!createdUser){
      throw new ApiError(500, "Something went wrong while registering ")
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    )
});

export { registerUser };
