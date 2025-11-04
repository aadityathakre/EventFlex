import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const KYCVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    aadhaar_number: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaar_verified: {
      type: Boolean,
      default: false,
    },
    video_kyc_url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
    verified_at: {
      type: Date,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const KYCVerification = mongoose.model("KYCVerification", KYCVerificationSchema);
export default KYCVerification;