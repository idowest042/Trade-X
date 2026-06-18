import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  createDeposit,
  getMyDeposits,
  approveDeposit,
  rejectDeposit,
} from "../Controllers/Depositcontroller.js";
import { requireRole } from "../middleware/authMiddleware.js";

// ─── Multer config ────────────────────────────────────────────────────────────
const uploadDir = "uploads/deposits";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    cb(null, `proof-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only JPG and PNG files are accepted."), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── Router ───────────────────────────────────────────────────────────────────
const router = Router();

router.use(protect); // all deposit routes require auth

// User routes
router.post("/create", upload.single("proofImage"), createDeposit);
router.get("/my", getMyDeposits);

// Admin routes (protected by role — admin panel phase)
router.put("/:id/approve", requireRole("admin"), approveDeposit);
router.put("/:id/reject",  requireRole("admin"), rejectDeposit);

export default router;