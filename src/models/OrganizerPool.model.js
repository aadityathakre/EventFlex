import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import Event from "./Event.model.js";

const OrganizerPoolSchema = new mongoose.Schema(
  {
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    pool_name: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    max_capacity: { type: Number, required: true, min: 1 },
    required_skills: { type: Schema.Types.Mixed },
    pay_range: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["open", "active", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);
OrganizerPoolSchema.index({ location: "2dsphere" });

const OrganizerPool = mongoose.model("OrganizerPool", OrganizerPoolSchema);
export default OrganizerPool;
