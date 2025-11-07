import { mongoose, Schema } from "mongoose";
import Pool from "./Pool.model.js";
import User from "./User.model.js"; 

const PoolApplicationSchema = new mongoose.Schema(
  {
    pool: {
      type: Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
      index: true,
    },
    gig: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "selected", "rejected"],
      default: "pending",
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    proposedRate: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    relevantExperience: {
      type: String,
      trim: true,
      maxlength: 500
    },
    skills: [{
      type: String,
      trim: true
    }],
    // Track when the organizer takes action
    organizerActionDate: {
      type: Date
    },
    // For storing organizer's feedback/reason for selection/rejection
    organizerFeedback: {
      type: String,
      trim: true,
      maxlength: 500
    },
    // Track if the gig has seen the decision
    isNotificationSeen: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    // Add compound index for efficient querying
    indexes: [
      { pool: 1, gig: 1, status: 1 }
    ]
  }
);

// Middleware to update Pool's gigs array when application status changes
PoolApplicationSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    const pool = await Pool.findById(this.pool);
    if (!pool) return next();

    // Update gig status in pool's gigs array
    const gigIndex = pool.gigs.findIndex(g => g.gig.toString() === this.gig.toString());
    if (gigIndex === -1) {
      pool.gigs.push({
        gig: this.gig,
        status: this.status,
        appliedAt: this.createdAt
      });
    } else {
      pool.gigs[gigIndex].status = this.status;
    }

    // Update filledPositions count
    if (this.status === 'selected') {
      pool.filledPositions = (pool.filledPositions || 0) + 1;
      if (pool.filledPositions >= pool.maxPositions) {
        pool.status = 'closed';
      }
    }

    await pool.save();
  }
  next();
});

const PoolApplication = mongoose.model("PoolApplication", PoolApplicationSchema);
export default PoolApplication;