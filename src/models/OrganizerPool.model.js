import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import Event from "./Event.model.js";

const OrganizerPoolSchema = new mongoose.Schema(
  {
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming organizer is a user with role = "organizer"
      required: true,
      index: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    pool_name: {
      type: String,
      required: true,
      trim: true,
    },
    max_capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    required_skills: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    pay_range: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    status: {
      type: String,
      enum: ["open", "active", "completed"],
      default: "open",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const OrganizerPool = mongoose.model("OrganizerPool", OrganizerPoolSchema);
export default OrganizerPool;