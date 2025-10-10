import { mongoose, Schema } from "mongoose";
import Event from "./Event.model.js";
import Admin from "./Admin.model.js";
import User from "./User.model.js"; // gig is a user with role = "gig"

const EventAttendanceSchema = new mongoose.Schema(
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
    check_in_time: {
      type: Date,
    },
    check_out_time: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["checked_in", "no_show"],
      required: true,
      default: "checked_in",
    },
    hours_worked: {
      type: mongoose.Types.Decimal128,
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

const EventAttendance = mongoose.model(
  "EventAttendance",
  EventAttendanceSchema
);
export default EventAttendance;
