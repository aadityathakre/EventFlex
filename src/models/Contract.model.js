import { mongoose, Schema } from "mongoose";
import Event from "./Event.model.js";
import Admin from "./Admin.model.js";
import User from "./User.model.js"; // used for both host and organizer

const ContractSchema = new mongoose.Schema(
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
    contract_url: {
      type: String,
      required: true,
      trim: true,
    },
    digital_signatures: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    status: {
      type: String,
      enum: ["signed", "executed"],
      required: true,
      default: "signed",
    },
    resolved_by_admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    admin_resolution_notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Contract = mongoose.model("Contract", ContractSchema);
export default Contract;
