import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyReferral } from "../Controllers/Referralcontroller.js";

const router = Router();
router.use(protect);
router.get("/my", getMyReferral);
export default router;