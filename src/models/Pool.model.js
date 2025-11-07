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
    // Roles required for this pool (e.g. anchoring, sound, stagehand)
    roles: [
      {
        title: { type: String, required: true },
        requiredCount: { type: Number, default: 1 },
        filledCount: { type: Number, default: 0 },
      }
    ],
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
      skill: {
        type: String,
        trim: true,
        required: true
      },
      requiredCount: {
        type: Number,
        default: 1,
        min: 1
      },
      filledCount: {
        type: Number,
        default: 0
      }
    }],
    date: {
      type: Date,
    },
    // City for quick search by gigs
    city: {
      type: String,
      trim: true,
      index: true,
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

// Compute maxPositions automatically from roles and skills if provided
PoolSchema.pre('save', function (next) {
  try {
    let totalPositions = 0;
    
    // Sum up required positions from roles
    if (this.roles && this.roles.length > 0) {
      totalPositions += this.roles.reduce((acc, r) => acc + (r.requiredCount || 0), 0);
    }
    
    // Sum up required positions from skills
    if (this.skillsRequired && this.skillsRequired.length > 0) {
      totalPositions += this.skillsRequired.reduce((acc, s) => acc + (s.requiredCount || 0), 0);
    }
    
    // Update maxPositions only if we have either roles or skills
    if (totalPositions > 0) {
      this.maxPositions = totalPositions;
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Pool", PoolSchema);