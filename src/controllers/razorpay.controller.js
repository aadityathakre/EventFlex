import instance from "../utils/razorpay.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";

// create Razorpay order
export const createPayment = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // smallest currency unit (paise)
    currency: currency || "INR",
    receipt: `receipt_${Math.random().toString(36).substring(7)}`,
  };

  const order = await instance.orders.create(options);

  return res.json(new ApiResponse(true, "Payment created successfully", order));
});

// Verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    return res.json(new ApiResponse(true, "Payment verified successfully"));
  }

  return res
    .status(400)
    .json(new ApiResponse(false, "Invalid signature, payment verification failed"));
});