import mongoose from "mongoose";

const PoolSchema = new mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    gigs: [{
      gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      status: {
        type: String,
        enum: ["pending", "selected", "rejected"],
        default: "pending"
      },
      appliedAt: {
        type: Date,
        default: Date.now
      }
    }],
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    requirements: {
      type: String,
      trim: true,
      maxlength: 500
    },
    skillsRequired: [{
      type: String,
      trim: true
    }],
    date: {
      type: Date,
    },
    venue: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    status: {
      type: String,
      enum: ["open", "closed", "archived"],
      default: "open",
    },
    maxPositions: {
      type: Number,
      default: 1
    },
    filledPositions: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

// Index for fast pool lookup by organizer and status
PoolSchema.index({ organizer: 1, status: 1 });
// Index for searching open pools
PoolSchema.index({ status: 1, applicationDeadline: 1 });

export default mongoose.model("Pool", PoolSchema);