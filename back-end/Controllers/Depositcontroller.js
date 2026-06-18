import Deposit from "../models/Deposit.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

const WALLET_ADDRESSES = {
  usdt_trc20: "TY1towm5Sd3SrX1Um6VPs8HRfkm7NprHnK",
  usdt_erc20: "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
  usdt_bep20: "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
  btc:        "bc1qw2je5r882n3cgnmm4ekgp6ml25p3n69e924p0e",
  eth:        "0xEaC3a0A245938b4D8C7d6A774A2D33A655dddAF0",
  sol:        "4fSYs25hBDTPStmN4TJvfE9N8BcpDEmHyUTNNd37JHqs",
};

const VALID_METHODS = Object.keys(WALLET_ADDRESSES);

// ─── POST /api/deposits/create ────────────────────────────────────────────────
export const createDeposit = async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!method || !VALID_METHODS.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid deposit amount." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Payment proof image is required." });
    }

    const deposit = await Deposit.create({
      userId:        req.user._id,
      amount:        parsedAmount,
      method,
      walletAddress: WALLET_ADDRESSES[method],
      proofImage:    req.file.path,
      status:        "pending",
    });

    // Log transaction in central ledger
    await Transaction.create({
      userId:      req.user._id,
      type:        "deposit",
      amount:      parsedAmount,
      status:      "pending",
      method,
      referenceId: deposit._id,
      description: `Deposit via ${method.toUpperCase()} — awaiting confirmation`,
    });

    return res.status(201).json({
      message: "Deposit submitted. Awaiting admin confirmation.",
      deposit,
    });
  } catch (err) {
    console.error("createDeposit:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── GET /api/deposits/my ─────────────────────────────────────────────────────
export const getMyDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("amount method walletAddress status createdAt rejectionReason reviewedAt");

    return res.status(200).json({ deposits });
  } catch (err) {
    console.error("getMyDeposits:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/deposits/:id/approve  (admin — used in admin panel phase) ───────
export const approveDeposit = async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found." });
    if (deposit.status !== "pending") {
      return res.status(400).json({ message: "Only pending deposits can be approved." });
    }

    deposit.status     = "approved";
    deposit.reviewedBy = req.user._id;
    deposit.reviewedAt = new Date();
    await deposit.save();

    // Credit balance
    await User.findByIdAndUpdate(deposit.userId, {
      $inc: { balance: deposit.amount },
    });

    // Update transaction status to approved
    await Transaction.findOneAndUpdate(
      { referenceId: deposit._id, type: "deposit" },
      { status: "approved", description: `Deposit approved — $${deposit.amount} credited` }
    );

    return res.status(200).json({
      message: `Deposit approved. $${deposit.amount} credited to user.`,
      deposit,
    });
  } catch (err) {
    console.error("approveDeposit:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/deposits/:id/reject  (admin — used in admin panel phase) ────────
export const rejectDeposit = async (req, res) => {
  try {
    const { reason } = req.body;
    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found." });
    if (deposit.status !== "pending") {
      return res.status(400).json({ message: "Only pending deposits can be rejected." });
    }

    deposit.status          = "rejected";
    deposit.rejectionReason = reason || "No reason provided.";
    deposit.reviewedBy      = req.user._id;
    deposit.reviewedAt      = new Date();
    await deposit.save();

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { referenceId: deposit._id, type: "deposit" },
      { status: "rejected", description: `Deposit rejected — ${reason || "No reason provided"}` }
    );

    return res.status(200).json({ message: "Deposit rejected.", deposit });
  } catch (err) {
    console.error("rejectDeposit:", err);
    return res.status(500).json({ message: "Server error." });
  }
};