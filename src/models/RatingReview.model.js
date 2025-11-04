import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";
import Event from "./Event.model.js";
import Admin from "./Admin.model.js";  

const RatingReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    rating: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    review_text: {
      type: String,
      trim: true,
    },
    review_type: {
      type: String,
      enum: ["gig_to_organizer", "organizer_to_gig", "host_to_organizer"],
      required: true,
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

const RatingReview = mongoose.model("RatingReview", RatingReviewSchema);
export default RatingReview;
