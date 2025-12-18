import mongoose from "mongoose";

const userDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["aadhaar", "pan", "selfie", "signature"], 
    required: true,
  },

  fileUrl: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  uploadedAt: { type: Date, default: Date.now },
});

// Ensure only one document per user
userDocumentSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("UserDocument", userDocumentSchema);
