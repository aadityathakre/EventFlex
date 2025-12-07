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
    }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Badge = mongoose.model("Badge", BadgeSchema);
export default Badge;