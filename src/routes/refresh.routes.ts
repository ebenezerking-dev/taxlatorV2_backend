// =============================== REFRESH ROUTES
// src/routes/refresh.routes.ts
// ===============================
import express from "express";

import { refreshController } from "../controllers/refresh.controller.js";

// ===============================
const router = express.Router();

// =============================== REFRESH
router.post("/refresh", refreshController);

export default router;
