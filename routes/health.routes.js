import { Router } from "express";
import { checkHealth } from "../controllers/health.controller.js";

const router = Router();

// Health check route
router.get("/", checkHealth);

export default router;
