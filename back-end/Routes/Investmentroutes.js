import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  createInvestment,
  getMyInvestments,
  getAllInvestments,
} from "../Controllers/investmentController.js";

const router = Router();

router.use(protect);

// User routes
router.post("/create", createInvestment);
router.get("/my",      getMyInvestments);

// Admin route — wired in admin panel phase
router.get("/all", requireRole("admin"), getAllInvestments);

export default router;