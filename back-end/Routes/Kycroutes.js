import { Router } from "express";
import multer from "multer";
import { submitKyc, getMyKyc } from "../Controllers/Kyccontroller.js";
import { protect } from "../middleware/authMiddleware.js";

const storage = multer.memoryStorage();

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
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadKycDocs = upload.fields([
  { name: "frontImage", maxCount: 1 },
  { name: "backImage", maxCount: 1 },
]);

const router = Router();
router.use(protect);

router.post("/submit", uploadKycDocs, submitKyc);
router.get("/me", getMyKyc);

export default router;