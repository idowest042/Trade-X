import { Router } from "express";
import { login, register, getMe, updateProfile, updatePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login",    login);

// Protected routes
router.get("/me",           protect, getMe);
router.put("/profile",      protect, updateProfile);
router.put("/password",     protect, updatePassword);

export default router;