// =============================== ANALYTICS ROUTES
// src/routes/analytics.routes.ts

// ===============================
import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// ===============================
const router = Router();

// ===============================
router.get("/", authMiddleware, analyticsController);

export default router;