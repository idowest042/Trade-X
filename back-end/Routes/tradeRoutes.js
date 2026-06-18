import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  openTrade,
  closeTrade,
  getMyTrades,
  getOpenTrades,
  adminAdjustTrade,
  adminGetAllTrades,
} from "../Controllers/tradeController.js";

const router = Router();
router.use(protect);

// User routes
router.post("/open",     openTrade);
router.post("/close",    closeTrade);
router.get("/my",        getMyTrades);
router.get("/open",      getOpenTrades);

// Admin routes
router.get("/admin/all",             requireRole("admin"), adminGetAllTrades);
router.put("/admin/:id/adjust",      requireRole("admin"), adminAdjustTrade);

export default router;