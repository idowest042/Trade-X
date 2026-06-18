import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  requestWithdrawal,
  getMyWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../controllers/Withdrawalcontroller.js";

const router = Router();

// All withdrawal routes require authentication
router.use(protect);

// User routes
router.post("/request", requestWithdrawal);
router.get("/my",       getMyWithdrawals);

// Admin routes — wired up fully in admin panel phase
router.put("/:id/approve", requireRole("admin"), approveWithdrawal);
router.put("/:id/reject",  requireRole("admin"), rejectWithdrawal);

export default router;