import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import { getMyTransactions, getAllTransactions } from "../controllers/transactionController.js";

const router = Router();

router.use(protect);

router.get("/my",  getMyTransactions);
router.get("/all", requireRole("admin"), getAllTransactions);

export default router;