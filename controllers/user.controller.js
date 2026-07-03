/* eslint-disable @typescript-eslint/no-unused-vars */
import { catchAsync, ApiError } from "../middleware/error.middleware.js";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { generateAccessToken } from "../utils/generateTokens.js";

export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password, role = "student" } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role,
  });
  await newUser.updateLastActive();
  generateAccessToken(res, newUser, "User account created successfully"); // since generateAccessToken sends the response, we don't need to send another response here
});

export const authenticateUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  await user.updateLastActive();
  generateAccessToken(res, user, "User authenticated successfully"); // since generateAccessToken sends the response, we don't need to send another response here
});

export const signOutUser = catchAsync(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User signed out successfully" });
});

export const getCurrentUserProfile = catchAsync(async (req, res) => {
  // we are setting req.id in the isAuthenticated middleware, so we can use it here to find the user
  const user = await User.findById(req.id).populate({
    path: "enrolledCourses.course",
    select: "title description",
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json({
    success: true,
    user,
  });
});
