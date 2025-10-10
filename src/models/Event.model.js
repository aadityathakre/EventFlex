import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const EventSchema = new mongoose.Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming Host is a User with role = "host"
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    event_type: {
      type: String,
      enum: ["function", "corporate", "festival"],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    location: {
      type: Schema.Types.Mixed, // Accepts JSON object
    },
    budget: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "in_progress", "completed"],
      default: "published",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

const Event = mongoose.model("Event", EventSchema);
export default Event;