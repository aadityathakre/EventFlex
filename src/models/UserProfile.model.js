import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    availability: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    bank_details: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    profile_image_url: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);


const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
export default UserProfile;