import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const BehavioralAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    no_show_risk_score: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const BehavioralAnalytics = mongoose.model("BehavioralAnalytics", BehavioralAnalyticsSchema);
export default BehavioralAnalytics;