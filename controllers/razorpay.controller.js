/* eslint-disable @typescript-eslint/no-unused-vars */
import Razorpay from "razorpay";
import { catchAsync, ApiError } from "../middleware/error.middleware.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = catchAsync(async (req, res) => {
  const userId = req.id; // Assuming you have user authentication and the user ID is available in req.id
  const { courseId } = req.body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const newPurchase = new CoursePurchase({
    user: userId,
    course: courseId,
    amount: course.price,
    status: "pending",
  });

  const options = {
    amount: course.price * 100, // Amount in paise (1 INR = 100 paise)
    currency: "INR",
    receipt: newPurchase._id.toString(),
  };

  const order = await razorpay.orders.create(options);
  newPurchase.paymentId = order.id;
  await newPurchase.save();

  res.status(201).json({
    success: true,
    order,
    purchase: newPurchase,
  });
});

export const verifyRazorpayPayment = catchAsync(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;

  if (!orderId || !paymentId || !signature) {
    throw new ApiError(400, "Order ID, Payment ID, and Signature are required");
  }

  // Verify signature with Razorpay
  const crypto = await import("crypto");
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    throw new ApiError(400, "Invalid signature. Payment verification failed.");
  }

  const purchase = await CoursePurchase.findOne({ paymentId: orderId });
  if (!purchase) {
    throw new ApiError(404, "Purchase not found");
  }

  // Update purchase status to completed
  purchase.status = "completed";
  purchase.paymentId = paymentId;
  await purchase.save();

  // Add course to user's enrolled courses
  const user = await User.findByIdAndUpdate(
    purchase.user,
    {
      $push: { enrolledCourses: { course: purchase.course } },
    },
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    purchase,
    user,
  });
});
