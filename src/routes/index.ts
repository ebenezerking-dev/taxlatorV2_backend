// ===================================== ROUTES INDEX 
// src/routes/index.ts
// =====================================
import { Router } from "express";

import authRoutes from "./auth.routes.js";
import refreshRoutes from "./refresh.routes.js";
import userRoutes from "./user.routes.js";
import taxRoutes from "./tax.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import adminRoutes from "./admin.routes.js";
import healthRoutes from "./health.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

// ===================================== AUTH
router.use("/auth", authRoutes);

// ===================================== REFRESH (COOKIE ROTATION)
router.use("/auth", refreshRoutes);

// ===================================== USER
router.use("/user", userRoutes);

// ===================================== TAX
router.use("/tax", taxRoutes);

// ===================================== DASHBOARD
router.use("/dashboard", dashboardRoutes);

// ===================================== ANALYTICS
router.use("/analytics", analyticsRoutes);

// ===================================== ADMIN
router.use("/admin", adminRoutes);

// ===================================== HEALTH
router.use("/health", healthRoutes);

export default router;
