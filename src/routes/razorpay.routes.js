import {verifyPayment, createPayment} from "../controllers/razorpay.controller.js";
import express from 'express';
const router = express.Router();
router.post('/create', createPayment);
router.post('/verify', verifyPayment);
export default router;