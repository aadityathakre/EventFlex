import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import Badge from "./Badge.model.js";

const UserBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badge: {
      type: Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: "awarded_at", updatedAt: false } }
);

const UserBadge = mongoose.model("UserBadge", UserBadgeSchema);
export default UserBadge;