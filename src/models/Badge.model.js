import { mongoose, Schema } from "mongoose";

const BadgeSchema = new mongoose.Schema(
  {
    badge_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    min_events: {
      type: Number,
      required: true,
      min: 0,
    },
    kyc_required: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Badge = mongoose.model("Badge", BadgeSchema);
export default Badge;