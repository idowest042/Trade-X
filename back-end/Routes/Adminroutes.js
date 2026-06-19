import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import User       from "../Models/User.js";
import Kyc        from "../Models/Kyc.js";
import Deposit    from "../Models/Deposit.js";
import Withdrawal from "../Models/Withdrawal.js";

const router = Router();

// All admin routes require auth + admin role
router.use(protect, requireRole("admin"));

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── PUT /api/admin/users/:id/balance ────────────────────────────────────────
router.put("/users/:id/balance", async (req, res) => {
  try {
    const { amount, type } = req.body; // type: "add" | "deduct" | "set"
    const val = parseFloat(amount);
    if (!val || val < 0) return res.status(400).json({ message: "Invalid amount." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if      (type === "add")    user.balance += val;
    else if (type === "deduct") user.balance = Math.max(0, user.balance - val);
    else if (type === "set")    user.balance = val;
    else return res.status(400).json({ message: "Invalid type. Use add, deduct, or set." });

    await user.save();
    res.json({ message: "Balance updated.", user });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── GET /api/admin/kyc ───────────────────────────────────────────────────────
router.get("/kyc", async (req, res) => {
  try {
    const submissions = await Kyc.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ submissions });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── PUT /api/admin/kyc/:id/approve ──────────────────────────────────────────
router.put("/kyc/:id/approve", async (req, res) => {
  try {
    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: "KYC not found." });

    kyc.status     = "approved";
    kyc.reviewedAt = new Date();
    kyc.rejectionReason = "";
    await kyc.save();

    // Mark user as KYC verified
    await User.findByIdAndUpdate(kyc.userId, { isKycVerified: true });

    res.json({ message: "KYC approved.", kyc });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── PUT /api/admin/kyc/:id/reject ───────────────────────────────────────────
router.put("/kyc/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: "KYC not found." });

    kyc.status          = "rejected";
    kyc.rejectionReason = reason || "No reason provided.";
    kyc.reviewedAt      = new Date();
    await kyc.save();

    await User.findByIdAndUpdate(kyc.userId, { isKycVerified: false });

    res.json({ message: "KYC rejected.", kyc });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── GET /api/admin/deposits ──────────────────────────────────────────────────
router.get("/deposits", async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json({ deposits });
  } catch { res.status(500).json({ message: "Server error." }); }
});

// ─── GET /api/admin/withdrawals ───────────────────────────────────────────────
router.get("/withdrawals", async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("userId", "name email balance")
      .sort({ createdAt: -1 });
    res.json({ withdrawals });
  } catch { res.status(500).json({ message: "Server error." }); }
});

export default router;