import mongoose from "mongoose";
import Investment from "../Models/Investment.js";
import User from "../Models/User.js";
import Transaction from "../Models/Transaction.js";

const PLAN_CONFIG = {
  starter: { roi: 3, duration: 6,  min: 100,  max: 1999  },
  growth:  { roi: 4, duration: 7,  min: 2000, max: 4999  },
  elite:   { roi: 6, duration: 14, min: 5000, max: 19999 },
};

const TOPUP_MIN = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const r2 = (n) => Math.round(n * 100) / 100;

const pushBalance = (req, userId, balance) => {
  const io = req.app.get("io");
  if (io) io.to(`user:${userId}`).emit("balance:update", balance);
};

// ─── POST /api/investments/create ─────────────────────────────────────────────
export const createInvestment = async (req, res) => {
  try {
    const { planType, amount } = req.body;
    const userId = req.user._id;

    const plan = PLAN_CONFIG[planType];
    if (!plan) {
      return res.status(400).json({ message: "Invalid investment plan selected." });
    }

    const parsedAmount = r2(parseFloat(amount));
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid investment amount." });
    }
    if (parsedAmount < plan.min) {
      return res.status(400).json({
        message: `Minimum investment for this plan is $${plan.min.toLocaleString()}.`,
      });
    }
    if (parsedAmount > plan.max) {
      return res.status(400).json({
        message: `Maximum investment for this plan is $${plan.max.toLocaleString()}.`,
      });
    }

    // Atomic: check balance and deduct in one operation (no double-spend)
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: parsedAmount } },
      { $inc: { balance: -parsedAmount } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({
        message: "Insufficient balance. Please deposit funds to continue.",
      });
    }

    const dailyReturn = r2(parsedAmount * plan.roi / 100);
    const totalReturn = r2(dailyReturn * plan.duration);

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    let investment;
    try {
      investment = await Investment.create({
        userId,
        planType,
        amount: parsedAmount,
        roi: plan.roi,
        duration: plan.duration,
        dailyReturn,
        totalReturn,
        contributions: [{ amount: parsedAmount, date: startDate, days: plan.duration }],
        startDate,
        endDate,
        status: "active",
      });
    } catch (e) {
      await User.findByIdAndUpdate(userId, { $inc: { balance: parsedAmount } }); // refund
      throw e;
    }

    await Transaction.create({
      userId,
      type: "investment",
      amount: parsedAmount,
      status: "active",
      referenceId: investment._id,
      description: `Invested in ${planType} plan — ${plan.roi}% daily for ${plan.duration} days`,
    });

    pushBalance(req, userId, updatedUser.balance);

    return res.status(201).json({
      message: `Investment activated! You will earn $${dailyReturn.toFixed(2)} daily for ${plan.duration} days.`,
      investment,
      balance: updatedUser.balance,
    });
  } catch (err) {
    console.error("createInvestment:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── POST /api/investments/:id/topup ──────────────────────────────────────────
export const topUpInvestment = async (req, res) => {
  const userId = req.user._id;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid investment." });
    }

    const parsed = r2(parseFloat(req.body.amount));
    if (!parsed || parsed <= 0) {
      return res.status(400).json({ message: "Enter a valid amount." });
    }
    if (parsed < TOPUP_MIN) {
      return res.status(400).json({ message: `Minimum top-up is $${TOPUP_MIN}.` });
    }

    const inv = await Investment.findOne({ _id: req.params.id, userId });
    if (!inv) return res.status(404).json({ message: "Investment not found." });

    const now = new Date();
    if (inv.status !== "active" || inv.endDate <= now) {
      return res.status(400).json({ message: "This investment is no longer active." });
    }

    const plan = PLAN_CONFIG[inv.planType];
    const remainingDays = Math.floor((inv.endDate - now) / DAY_MS);
    if (remainingDays < 1) {
      return res.status(400).json({
        message: "Less than 1 day remains on this plan, so it can't be topped up.",
      });
    }

    const room = r2(plan.max - inv.amount);
    if (parsed > room) {
      return res.status(400).json({
        message: room >= TOPUP_MIN
          ? `You can add up to $${room.toLocaleString()} more to this plan.`
          : "This plan has reached its maximum investment.",
      });
    }

    // Legacy investments (created before top-ups existed): seed contributions once
    if (!inv.contributions || inv.contributions.length === 0) {
      await Investment.updateOne(
        { _id: inv._id, "contributions.0": { $exists: false } },
        {
          $set: {
            contributions: [{ amount: inv.amount, date: inv.startDate, days: inv.duration }],
          },
        }
      );
    }

    // 1. Atomic balance deduction
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, balance: { $gte: parsed } },
      { $inc: { balance: -parsed } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(400).json({ message: "Insufficient balance. Please deposit funds." });
    }

    // 2. Atomic investment update. Conditions are re-checked inside the query,
    //    so a concurrent completion or a second top-up can't overshoot the plan max.
    const extraDaily = r2(parsed * inv.roi / 100);
    const extraTotal = r2(extraDaily * remainingDays);

    let updated;
    try {
      updated = await Investment.findOneAndUpdate(
        {
          _id: inv._id,
          userId,
          status: "active",
          endDate: { $gt: now },
          amount: { $lte: plan.max - parsed },
        },
        {
          $inc: { amount: parsed, dailyReturn: extraDaily, totalReturn: extraTotal },
          $push: { contributions: { amount: parsed, date: now, days: remainingDays } },
        },
        { new: true }
      );
    } catch (e) {
      await User.findByIdAndUpdate(userId, { $inc: { balance: parsed } }); // refund
      throw e;
    }

    if (!updated) {
      const refunded = await User.findByIdAndUpdate(
        userId,
        { $inc: { balance: parsed } },
        { new: true }
      );
      pushBalance(req, userId, refunded.balance);
      return res.status(409).json({
        message: "This investment changed while you were topping up. Please try again.",
      });
    }

    // 3. Ledger entry (money has already moved; never fail the request over this)
    try {
      await Transaction.create({
        userId,
        type: "investment",
        amount: parsed,
        status: "active",
        referenceId: inv._id,
        description: `Top-up to ${inv.planType} plan — +$${extraDaily.toFixed(2)}/day for ${remainingDays} days`,
      });
    } catch (e) {
      console.error("topUpInvestment ledger:", e);
    }

    pushBalance(req, userId, updatedUser.balance);

    return res.status(200).json({
      message: `$${parsed.toLocaleString()} added. You'll earn $${extraTotal.toFixed(2)} extra over the remaining ${remainingDays} days.`,
      investment: updated,
      balance: updatedUser.balance,
    });
  } catch (err) {
    console.error("topUpInvestment:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── GET /api/investments/my ──────────────────────────────────────────────────
export const getMyInvestments = async (req, res) => {
  try {
    const userId = req.user._id;
    let investments = await Investment.find({ userId }).sort({ createdAt: -1 });

    const now = new Date();
    let completedAny = false;
    let latestBalance = null;

    for (const inv of investments) {
      if (inv.status !== "active" || new Date(inv.endDate) > now) continue;

      // Atomic claim: only ONE request can flip active -> completed, so
      // simultaneous page loads can't credit the same payout twice.
      const claimed = await Investment.findOneAndUpdate(
        { _id: inv._id, status: "active" },
        { status: "completed" },
        { new: true } // fresh amount/totalReturn, including any top-ups
      );
      if (!claimed) continue;

      completedAny = true;

      const credited = await User.findByIdAndUpdate(
        claimed.userId,
        { $inc: { balance: r2(claimed.amount + claimed.totalReturn) } },
        { new: true }
      );
      latestBalance = credited?.balance ?? latestBalance;

      await Transaction.create({
        userId:      claimed.userId,
        type:        "profit",
        amount:      claimed.totalReturn,
        status:      "completed",
        referenceId: claimed._id,
        description: `Profit from ${claimed.planType} plan — $${claimed.totalReturn.toFixed(2)} total over ${claimed.duration} days`,
      });

      // updateMany: the investment AND every top-up share this referenceId
      await Transaction.updateMany(
        { referenceId: claimed._id, type: "investment" },
        { status: "completed" }
      );
    }

    if (completedAny) {
      investments = await Investment.find({ userId }).sort({ createdAt: -1 });
      if (latestBalance !== null) pushBalance(req, userId, latestBalance);
    }

    return res.status(200).json({ investments });
  } catch (err) {
    console.error("getMyInvestments:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/investments/all  (admin) ────────────────────────────────────────
export const getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate("userId", "name email balance")
      .sort({ createdAt: -1 });

    return res.status(200).json({ investments });
  } catch (err) {
    console.error("getAllInvestments:", err);
    return res.status(500).json({ message: "Server error." });
  }
};