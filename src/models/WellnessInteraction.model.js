import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const WellnessInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ai_response: {
      type: String,
      trim: true,
    },
    wellness_score: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const WellnessInteraction = mongoose.model("WellnessInteraction", WellnessInteractionSchema);
export default WellnessInteraction;