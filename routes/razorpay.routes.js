import { Router } from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

// Create Razorpay order (requires authentication)
router.post("/create-order", isAuthenticated, createRazorpayOrder);

// Verify Razorpay payment (requires authentication)
router.post("/verify-payment", isAuthenticated, verifyRazorpayPayment);

export default router;
