/// <reference path="./types/express.d.ts" />
// src/app.ts
import express from "express";
import cors from "cors";
import { initDB } from "./db";
import authRoutes from "./modules/auth/auth.routes";
import issuesRoutes from "./modules/issues/issues.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

// Initialize database tables on startup
initDB().catch((err) => {
  console.error(" Failed to initialize database:", err);
  process.exit(1);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "DevPulse API is running" });
});

app.use(errorHandler);

export default app;
