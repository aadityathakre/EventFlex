import { mongoose, Schema } from "mongoose";
import Event from "./Event.model.js";
import User from "./User.model.js";

const DisputeSchema = new Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    gig: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "resolved", "rejected"],
      default: "open",
    },
    resolution_notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Dispute = mongoose.model("Dispute", DisputeSchema);
export default Dispute;