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
     ,
     // Soft-hide an application so it's not shown to organizers
     hidden: {
       type: Boolean,
       default: false,
       index: true,
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
  // Ensure pool.gigs stays in sync when a new application is created or when status/hidden changes
  if (this.isNew || this.isModified('status') || this.isModified('hidden')) {
    try {
      const pool = await Pool.findById(this.pool);
      if (!pool) return next();

      // Update gig status in pool's gigs array
      const gigIndex = pool.gigs.findIndex(g => String(g.gig) === String(this.gig));
      if (gigIndex === -1) {
        pool.gigs.push({
          gig: this.gig,
          status: this.status,
          appliedAt: this.createdAt,
          application: this._id
        });
      } else {
        pool.gigs[gigIndex].status = this.status;
        // ensure application id is present on the pool entry
        pool.gigs[gigIndex].application = pool.gigs[gigIndex].application || this._id;
          // If this application is hidden, remove it from the pool.gigs listing
          if (this.hidden) {
            pool.gigs.splice(gigIndex, 1);
          }
      }

      // Update filledPositions count when selected
      if (this.status === 'selected') {
        pool.filledPositions = (pool.filledPositions || 0) + 1;
        if (pool.filledPositions >= (pool.maxPositions || 0)) {
          pool.status = 'closed';
        }
      }

      await pool.save();
    } catch (err) {
      console.warn('PoolApplication pre-save sync failed:', err.message);
    }
  }
  next();
});

const PoolApplication = mongoose.model("PoolApplication", PoolApplicationSchema);
export default PoolApplication;