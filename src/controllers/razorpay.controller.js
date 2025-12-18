import instance from "../utils/razorpay.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";

// create Razorpay order
export const createPayment = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  const options = {
    amount: Math.round(amount), // smallest currency unit (paise) - ensure integer
    currency: currency || "INR",
    receipt: `receipt_${Math.random().toString(36).substring(7)}`,
  };

  try {
    const order = await instance.orders.create(options);
    return res.status(200).json(new ApiResponse(200, order, "Payment created successfully"));
  } catch (error) {
    console.error("Razorpay Order Creation Failed:", error);
    throw new ApiError(500, error.message || "Razorpay order creation failed");
  }
});

// Verify Razorpay payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    return res.status(200).json(new ApiResponse(200, { verified: true }, "Payment verified successfully"));
  }

  return res
    .status(400)
    .json(new ApiResponse(400, null, "Invalid signature, payment verification failed"));
});