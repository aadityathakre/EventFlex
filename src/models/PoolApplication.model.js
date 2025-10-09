import { mongoose, Schema } from "mongoose";
import OrganizerPool from "./OrganizerPool.model.js";
import User from "./User.model.js"; 
// assuming gig is a user with role = "gig"

const PoolApplicationSchema = new mongoose.Schema(
  {
    pool: {
      type: Schema.Types.ObjectId,
      ref: "OrganizerPool",
      required: true,
      index: true,
    },
    gig: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    application_status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    cover_message: {
      type: String,
      trim: true,
    },
    proposed_rate: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  { timestamps: { createdAt: "applied_at", updatedAt: false } }
);

const PoolApplication = mongoose.model("PoolApplication", PoolApplicationSchema);
export default PoolApplication;