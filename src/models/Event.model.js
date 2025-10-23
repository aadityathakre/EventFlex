import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import { softDelete } from "../middlewares/softDelete.middleware.js";

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
      enum: [
        "function",
        "corporate",
        "festival",
        "exhibition",
        "hackathon",
        "workshop",
        "webinar",
        "networking",
        "fundraiser",
        "retreat",
      ],
      required: true,
      default: "function",
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
      type: {
        type: String,
        enum: ["Point"],
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
    },

    // 5. Status
    status: {
      type: String,
      enum: ["published", "in_progress", "completed"],
      default: "published",
      required: true,
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

// Add pre-save middleware for status transitions
EventSchema.pre("save", function (next) {
  const now = new Date();

  // Auto-transition to in_progress when event starts
  if (
    this.status === "published" &&
    this.start_date <= now &&
    this.end_date > now
  ) {
    this.status = "in_progress";
  }

  // Auto-transition to completed when event ends
  if (this.status === "in_progress" && this.end_date <= now) {
    this.status = "completed";
  }

  next();
});

// Add validation for status transitions
EventSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.status) {
    const validTransitions = {
      published: ["in_progress"],
      in_progress: ["completed"],
      completed: [], // No transitions from completed
    };

    const currentStatus = this.getQuery().status || "published";
    if (!validTransitions[currentStatus]?.includes(update.status)) {
      return next(
        new Error(
          `Invalid status transition from ${currentStatus} to ${update.status}`
        )
      );
    }
  }

  next();
});

// Apply soft delete middleware
softDelete(EventSchema);

const Event = mongoose.model("Event", EventSchema);

export default Event;
