import mongoose from "mongoose";
import User from "./User.model.js"
import Event from "./Event.model.js";

const PoolSchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // NEW
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 300 },
    gigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // gig workers
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

// Optional: Index for fast pool lookup by organizer
PoolSchema.index({ organizer: 1, status: 1 });

export default mongoose.model("Pool", PoolSchema);
