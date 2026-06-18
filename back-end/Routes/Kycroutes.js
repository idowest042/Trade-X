import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { submitKyc, getMyKyc } from "../controllers/kycController.js";
import { protect } from "../middleware/authMiddleware.js";

// ─── Multer storage config ────────────────────────────────────────────────────
const uploadDir = "uploads/kyc";

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // e.g. frontImage-1714000000000.jpg
    const unique = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are accepted."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Upload both images in a single request
const uploadKycDocs = upload.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 },
]);

// ─── Routes ───────────────────────────────────────────────────────────────────
const router = Router();

// All KYC routes require authentication
router.use(protect);

router.post("/submit", uploadKycDocs, submitKyc);
router.get("/me", getMyKyc);

export default router;