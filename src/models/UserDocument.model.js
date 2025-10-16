import mongoose from "mongoose";

const userDocumentSchema = new mongoose.Schema({
  user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
    },

  type: { 
    type: String, 
    enum: ["aadhaar", "pan", "selfie"], 
    required: true 
  },
  
    fileUrl: {
       type: String, 
       required: true 
      },

    status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserDocument", userDocumentSchema);
