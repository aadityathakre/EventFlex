import { mongoose, Schema } from "mongoose";
import OrganizerPool from "./OrganizerPool.model.js";
import User from "./User.model.js"; // assuming gig is a user with role = "gig"

const PoolMemberSchema = new mongoose.Schema(
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
    agreed_rate: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      required: true,
    },
  },
  { timestamps: { createdAt: "joined_at", updatedAt: false } }
);

const PoolMember = mongoose.model("PoolMember", PoolMemberSchema);
export default PoolMember;