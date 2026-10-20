import Withdrawal from "../Models/Withdrawal.js";
import User from "../Models/User.js";
import Kyc from "../Models/Kyc.js";
import Transaction from "../Models/Transaction.js";

const MAX_WITHDRAWAL = 10000;
const MAX_REASON_LENGTH = 300;
const VALID_METHODS  = ["usdt_trc20", "usdt_erc20", "usdt_bep20", "btc", "eth", "sol"];

// Push a realtime event to the user's open sessions (room set up in chatHandler)
const notifyUser = (req, userId, event, payload) => {
  const io = req.app.get("io");
  if (io) io.to(`user:${userId}`).emit(event, payload);
};

// ─── POST /api/withdrawals/request ───────────────────────────────────────────
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, walletAddress } = req.body;
    const userId = req.user._id;

    // 1. Validate method
    if (!method || !VALID_METHODS.includes(method)) {
      return res.status(400).json({ message: "Invalid withdrawal method." });
    }

    // 2. Validate amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid withdrawal amount." });
    }
    if (parsedAmount > MAX_WITHDRAWAL) {
      return res.status(400).json({
        message: `Maximum withdrawal per request is $${MAX_WITHDRAWAL.toLocaleString()}.`,
      });
    }

    // 3. Validate wallet address
    if (!walletAddress || walletAddress.trim().length < 6) {
      return res.status(400).json({ message: "A valid wallet address is required." });
    }

    // 4. Check KYC approval
    const kyc = await Kyc.findOne({ userId });
    if (!kyc || kyc.status !== "approved") {
      return res.status(403).json({
        message:
          "Identity verification (KYC) must be approved before making withdrawals.",
      });
    }

    // 5. Check user balance (Option B — do NOT deduct yet, just validate)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.balance < parsedAmount) {
      return res.status(400).json({
        message: `Insufficient balance. Your current balance is $${user.balance.toLocaleString()}.`,
      });
    }

    // 6. Create withdrawal request — balance NOT deducted until admin approves
    const withdrawal = await Withdrawal.create({
      userId,
      amount:        parsedAmount,
      method,
      walletAddress: walletAddress.trim(),
      status:        "pending",
    });

    // Log in central ledger
    await Transaction.create({
      userId,
      type:        "withdrawal",
      amount:      parsedAmount,
      status:      "pending",
      method,
      referenceId: withdrawal._id,
      description: `Withdrawal via ${method.toUpperCase()} → ${walletAddress.trim().slice(0, 12)}…`,
    });

    return res.status(201).json({
      message: "Withdrawal request submitted. Awaiting admin approval.",
      withdrawal,
    });
  } catch (err) {
    console.error("requestWithdrawal:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── GET /api/withdrawals/my ──────────────────────────────────────────────────
export const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("amount method walletAddress status createdAt rejectionReason reviewedAt");

    return res.status(200).json({ withdrawals });
  } catch (err) {
    console.error("getMyWithdrawals:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/withdrawals/:id/approve  (admin) ────────────────────────────────
export const approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Only pending withdrawals can be approved." });
    }

    // Re-check balance at time of approval (user might have used funds elsewhere)
    const user = await User.findById(withdrawal.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.balance < withdrawal.amount) {
      return res.status(400).json({
        message: `User has insufficient balance ($${user.balance}) to cover this withdrawal ($${withdrawal.amount}).`,
      });
    }

    // Deduct balance NOW at approval time (Option B)
    const updatedUser = await User.findByIdAndUpdate(
      withdrawal.userId,
      { $inc: { balance: -withdrawal.amount } },
      { new: true }
    );

    withdrawal.status     = "approved";
    withdrawal.reviewedBy = req.user._id;
    withdrawal.reviewedAt = new Date();
    await withdrawal.save();

    // Keep the central ledger in sync (it stayed "pending" before)
    await Transaction.findOneAndUpdate(
      { referenceId: withdrawal._id, type: "withdrawal" },
      {
        status: "approved",
        description: `Withdrawal approved — $${withdrawal.amount} sent via ${withdrawal.method.toUpperCase()}`,
      }
    );

    // Live updates for the user's open pages
    if (updatedUser) notifyUser(req, withdrawal.userId, "balance:update", updatedUser.balance);
    notifyUser(req, withdrawal.userId, "withdrawal:update", {
      _id: withdrawal._id,
      status: "approved",
    });

    return res.status(200).json({
      message: `Withdrawal of $${withdrawal.amount} approved. User balance deducted.`,
      withdrawal,
    });
  } catch (err) {
    console.error("approveWithdrawal:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/withdrawals/:id/reject  (admin) ─────────────────────────────────
export const rejectWithdrawal = async (req, res) => {
  try {
    const { reason } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found." });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Only pending withdrawals can be rejected." });
    }

    const cleanReason =
      typeof reason === "string" ? reason.trim().slice(0, MAX_REASON_LENGTH) : "";

    // No balance was deducted, so nothing to reverse
    withdrawal.status          = "rejected";
    withdrawal.rejectionReason = cleanReason || "No reason provided.";
    withdrawal.reviewedBy      = req.user._id;
    withdrawal.reviewedAt      = new Date();
    await withdrawal.save();

    // Keep the central ledger in sync
    await Transaction.findOneAndUpdate(
      { referenceId: withdrawal._id, type: "withdrawal" },
      {
        status: "rejected",
        description: `Withdrawal rejected — ${withdrawal.rejectionReason}`,
      }
    );

    // Tell the client right away (popup appears if they're online;
    // otherwise it appears the next time they open the dashboard)
    notifyUser(req, withdrawal.userId, "withdrawal:update", {
      _id: withdrawal._id,
      status: "rejected",
    });

    return res.status(200).json({ message: "Withdrawal rejected.", withdrawal });
  } catch (err) {
    console.error("rejectWithdrawal:", err);
    return res.status(500).json({ message: "Server error." });
  }
};