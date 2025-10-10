import { mongoose, Schema } from "mongoose";

const BlockchainTxSchema = new Schema(
  {
    escrow: {
      type: Schema.Types.ObjectId,
      ref: "EscrowContract",
      required: true,
    },
    tx_hash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
    confirmed_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

const BlockchainTx = mongoose.model("BlockchainTx", BlockchainTxSchema);
export default BlockchainTx;