import { mongoose, Schema } from "mongoose";
import EscrowContract from "./EscrowContract.model.js";
import User from "./User.model.js";

const PaymentSchema = new mongoose.Schema(
  {
    escrow: {
      type: Schema.Types.ObjectId,
      ref: "EscrowContract",
      required: true,
      index: true,
    },
    payer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    payee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["upi", "crypto"],
      required: true,
    },
    status: {
      type: String,
      enum: ["completed"],
      default: "completed",
      required: true,
    },
    upi_transaction_id: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: "processed_at", updatedAt: false } }
);

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;