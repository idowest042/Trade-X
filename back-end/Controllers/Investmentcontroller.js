import Investment from "../Models/Investment.js";
import User from "../Models/User.js";
import Transaction from "../Models/Transaction.js";

// ─── Plan config (single source of truth on the backend) ─────────────────────
const PLAN_CONFIG = {
  starter: { roi: 3, duration: 6,  min: 100,  max: 1999  },
  growth:  { roi: 4, duration: 7,  min: 2000, max: 4999  },
  elite:   { roi: 6, duration: 14, min: 5000, max: 19999 },
};

// ─── POST /api/investments/create ─────────────────────────────────────────────
export const createInvestment = async (req, res) => {
  try {
    const { planType, amount } = req.body;
    const userId = req.user._id;

    // 1. Validate plan
    const plan = PLAN_CONFIG[planType];
    if (!plan) {
      return res.status(400).json({ message: "Invalid investment plan selected." });
    }

    // 2. Validate amount
    const parsedAmount = parseFloat(amount);
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

    // 3. Check user balance
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.balance < parsedAmount) {
      return res.status(400).json({
        message: "Insufficient balance. Please deposit funds to continue.",
      });
    }

    // 4. Calculate returns
    const dailyReturn = parseFloat((parsedAmount * plan.roi / 100).toFixed(2));
    const totalReturn = parseFloat((dailyReturn * plan.duration).toFixed(2));

    const startDate = new Date();
    const endDate   = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    // 5. Deduct balance immediately on investment
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -parsedAmount },
    });

    // 6. Create investment record
    const investment = await Investment.create({
      userId,
      planType,
      amount:      parsedAmount,
      roi:         plan.roi,
      duration:    plan.duration,
      dailyReturn,
      totalReturn,
      startDate,
      endDate,
      status: "active",
    });

    // Log investment purchase in central ledger
    await Transaction.create({
      userId,
      type:        "investment",
      amount:      parsedAmount,
      status:      "active",
      referenceId: investment._id,
      description: `Invested in ${planType} plan — ${plan.roi}% daily for ${plan.duration} days`,
    });

    return res.status(201).json({
      message: `Investment activated! You will earn $${dailyReturn.toFixed(2)} daily for ${plan.duration} days.`,
      investment,
    });
  } catch (err) {
    console.error("createInvestment:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── GET /api/investments/my ──────────────────────────────────────────────────
export const getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    // Auto-mark completed investments (endDate has passed)
    const now = new Date();
    const updates = [];

    for (const inv of investments) {
      if (inv.status === "active" && new Date(inv.endDate) <= now) {
        inv.status = "completed";
        updates.push(inv.save());

        // Credit principal + profit back to user
        updates.push(
          User.findByIdAndUpdate(inv.userId, {
            $inc: { balance: inv.amount + inv.totalReturn },
          })
        );

        // Log profit transaction
        updates.push(
          Transaction.create({
            userId:      inv.userId,
            type:        "profit",
            amount:      inv.totalReturn,
            status:      "completed",
            referenceId: inv._id,
            description: `Profit from ${inv.planType} plan — $${inv.dailyReturn.toFixed(2)}/day × ${inv.duration} days`,
          })
        );

        // Mark the original investment transaction as completed
        updates.push(
          Transaction.findOneAndUpdate(
            { referenceId: inv._id, type: "investment" },
            { status: "completed" }
          )
        );
      }
    }

    if (updates.length > 0) await Promise.all(updates);

    return res.status(200).json({ investments });
  } catch (err) {
    console.error("getMyInvestments:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/investments/all  (admin — wired in admin panel phase) ────────────
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