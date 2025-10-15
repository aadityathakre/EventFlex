import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const EventSchema = new mongoose.Schema(
  {
    // 1. Host reference (existing)
    host: {
      type: Schema.Types.ObjectId,
      ref: "User", // role = "host"
      required: false, // now optional
      index: true,
    },

    // 2. Organizer reference (new)
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User", // role = "organizer"
      required: false, // optional to support dual creation
      index: true,
    },

    // 3. Event metadata
    title: {
      type: String,
      required: true,
      default: "Reception",
      trim: true,
    },
    description: {
      type: String,
      default: "wedding reception",
      trim: true,
    },
    event_type: {
      type: String,
      enum: ["function", "corporate", "festival"],
      required: true,
      default: "function",
    },
    start_date: {
      type: Date,
      required: true,
      default: Date,
    },
    end_date: {
      type: Date,
      required: true,
      default: Date,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // 4. Budget
    budget: {
      type: mongoose.Types.Decimal128,
      required: true,
      default: 10000,
    },

    // 5. Status
    status: {
      type: String,
      enum: ["published", "in_progress", "completed"],
      default: "published",
      required: true,
      default: "published",
    },

    // 6. Gigs assigned (new)
    gigs: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // role = "gig"
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);
EventSchema.index({ location: "2dsphere" });
const Event = mongoose.model("Event", EventSchema);

export default Event;
