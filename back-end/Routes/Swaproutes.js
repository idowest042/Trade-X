import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getRates, createSwap, getMySwaps } from "../Controllers/Swapcontroller.js";

const router = Router();
router.use(protect);
router.get("/rates", getRates);
router.post("/",     createSwap);
router.get("/my",    getMySwaps);
export default router;