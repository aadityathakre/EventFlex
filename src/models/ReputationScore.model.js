import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const ReputationScoreSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    overall_rating: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    trust_level: {
      type: String,
      enum: ["bronze", "silver", "gold", "elite"],
      required: true,
      default: "bronze",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const ReputationScore = mongoose.model("ReputationScore", ReputationScoreSchema);
export default ReputationScore;