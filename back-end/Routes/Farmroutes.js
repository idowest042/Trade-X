import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getPools,
  stake,
  unstake,
  getMyPositions,
  adminCreatePool,
  adminUpdatePool,
  adminGetAllPositions,
} from "../Controllers/farmController.js";

const router = Router();
router.use(protect);

// User routes
router.get("/pools",        getPools);
router.post("/stake",       stake);
router.post("/unstake",     unstake);
router.get("/my-positions", getMyPositions);

// Admin routes
router.post("/admin/pools",    requireRole("admin"), adminCreatePool);
router.put("/admin/pools/:id", requireRole("admin"), adminUpdatePool);
router.get("/admin/positions", requireRole("admin"), adminGetAllPositions);

export default router;