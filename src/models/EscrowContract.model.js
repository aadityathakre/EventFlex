import { mongoose, Schema } from "mongoose";
import Event from "./Event.model.js";
import Admin from "./Admin.model.js";
import User from "./User.model.js"; // used for both host and organizer

const EscrowContractSchema = new mongoose.Schema(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    total_amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    organizer_percentage: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    gigs_percentage: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    resolved_by_admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    admin_resolution_notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["funded", "in_progress", "released"],
      default: "funded",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EscrowContract = mongoose.model("EscrowContract", EscrowContractSchema);
export default EscrowContract;
