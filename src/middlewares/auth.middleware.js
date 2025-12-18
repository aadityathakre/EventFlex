import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const verifyToken = asyncHandler(async (req, _ , next) => {
 try {
     const token =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
   
     if (!token) {
       throw new ApiError(401, "unauthorized request");
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
   
     const user = await User.findById(decodedToken?._id).select(
       "-password -refreshToken"
     );
   
     if (!user) {

       throw new ApiError(401, "Invalid Access Token !!");
     }
   
     req.user=user;
     next();
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
 }
});

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Access denied: insufficient permissions");
    }
    next();
  };
};


export { verifyToken, authorizeRoles };