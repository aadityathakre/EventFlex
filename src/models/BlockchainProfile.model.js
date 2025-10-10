import { mongoose, Schema } from "mongoose";
import User from "./User.model.js";

const BlockchainProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    wallet_address: {
      type: String,
      required: true,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    tx_hash: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const BlockchainProfile = mongoose.model("BlockchainProfile", BlockchainProfileSchema);
export default BlockchainProfile;