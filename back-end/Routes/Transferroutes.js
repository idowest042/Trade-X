import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createTransfer, getMyTransfers } from "../Controllers/transferController.js";

const router = Router();
router.use(protect);
router.post("/",  createTransfer);
router.get("/my", getMyTransfers);
export default router;