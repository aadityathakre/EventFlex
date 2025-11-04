import { mongoose, Schema } from "mongoose";
import Event from "./Event.model.js";
import User from "./User.model.js";

const RecommendedEventSchema = new Schema(
  {
    gig: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    score: {
      type: Schema.Types.Decimal128,
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const RecommendedEvent = mongoose.model("RecommendedEvent", RecommendedEventSchema);
export default RecommendedEvent;