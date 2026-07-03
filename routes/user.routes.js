/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import {
  createUserAccount,
  getCurrentUserProfile,
  signOutUser,
  authenticateUser,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { ValidateSignup } from "../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", ValidateSignup, createUserAccount);
router.post("/signin", authenticateUser);
router.post("/signout", signOutUser);

router.get("/profile", isAuthenticated, getCurrentUserProfile);
router.delete("/signout", signOutUser);

export default router;
