import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import { softDelete } from "../middlewares/softDelete.middleware.js";

const EventSchema = new mongoose.Schema(
  {
    host: {
      type: Schema.Types.ObjectId,
      ref: "User", // role = "host"
      required: true,
      index: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User", // role = "organizer"
      required: false, // assigned later
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    event_type: {
      type: String,
      enum: [
        "Wedding",
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
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    budget: { type: mongoose.Types.Decimal128, required: true },
    status: {
      type: String,
      enum: ["published", "in_progress", "completed"],
      default: "published",
    },
  },
  { timestamps: true }
);
EventSchema.index({ location: "2dsphere" });

// Normalize Decimal128 budget in JSON responses
EventSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    try {
      if (ret.budget != null) {
        if (typeof ret.budget === "object" && ret.budget.$numberDecimal) {
          ret.budget = parseFloat(ret.budget.$numberDecimal);
        } else if (ret.budget?.toString) {
          ret.budget = parseFloat(ret.budget.toString());
        }
      }
    } catch (e) {
      // swallow
    }
    return ret;
  },
});
EventSchema.set("toObject", {
  virtuals: true,
  transform: (doc, ret) => {
    try {
      if (ret.budget != null) {
        if (typeof ret.budget === "object" && ret.budget.$numberDecimal) {
          ret.budget = parseFloat(ret.budget.$numberDecimal);
        } else if (ret.budget?.toString) {
          ret.budget = parseFloat(ret.budget.toString());
        }
      }
    } catch (e) {
      // swallow
    }
    return ret;
  },
});

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
EventSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.status) {
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!docToUpdate) return next(new Error("Event not found"));

    const validTransitions = {
      published: ["in_progress", "completed"],
      in_progress: ["completed"],
      completed: []
    };

    const currentStatus = docToUpdate.status;
    if (!validTransitions[currentStatus]?.includes(update.status)) {
      return next(new Error(`Invalid status transition from ${currentStatus} to ${update.status}`));
    }
  }
  next();
});

// Apply soft delete middleware
softDelete(EventSchema);

const Event = mongoose.model("Event", EventSchema);

export default Event;
