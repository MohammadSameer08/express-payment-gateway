/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "./database/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());
// Enable CORS for all routes
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  }),
);

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Set security HTTP headers
app.use(helmet());

// Global rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// HTTP request logger middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// API routes
import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";
app.use("/api/health", healthRoutes);
app.use("/api/v1/user", userRoutes);

// it should be the last middleware in the stack, after all other routes and middleware have been defined. It will catch any requests that don't match any of the defined routes and return a 404 error response.
// 404 error handler middleware
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Connect to the database and start the server
dbConnect()
  .then(() => {
    console.log("Connected to the database");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
