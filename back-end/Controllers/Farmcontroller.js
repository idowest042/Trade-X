import FarmPool     from "../Models/FarmPool.js";
import FarmPosition from "../Models/FarmPosition.js";
import User         from "../Models/User.js";
import Transaction  from "../Models/Transaction.js";

let _io = null;
export function setFarmSocket(io) { _io = io; }

const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

// Simple-interest accrual: amount * (apr/100) * (elapsed / 1 year).
// Derived on read, exactly like Trade's live PnL — no cron job needed.
function calcAccruedReward(position) {
  if (position.status !== "active") return position.finalReward || 0;
  const elapsedMs = Date.now() - new Date(position.stakedAt).getTime();
  const reward = (position.amount * (position.aprAtStake / 100) * elapsedMs) / MS_PER_YEAR;
  return parseFloat(Math.max(0, reward).toFixed(2));
}

// ─── GET /api/farm/pools ───────────────────────────────────────────────────────
export const getPools = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category && category !== "all") filter.category = category;

    const pools = await FarmPool.find(filter).sort({ apr: -1 });
    return res.json({ pools });
  } catch (err) {
    console.error("getPools:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── POST /api/farm/stake  { poolId, amount } ─────────────────────────────────
export const stake = async (req, res) => {
  try {
    const { poolId, amount } = req.body;
    const userId = req.user._id;

    const pool = await FarmPool.findById(poolId);
    if (!pool || !pool.isActive) {
      return res.status(404).json({ message: "Farm pool not found or inactive." });
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < pool.minStake) {
      return res.status(400).json({ message: `Minimum stake for this pool is $${pool.minStake}.` });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.balance < parsedAmount) {
      return res.status(400).json({ message: `Insufficient balance. You have $${user.balance.toFixed(2)}.` });
    }

    await User.findByIdAndUpdate(userId, { $inc: { balance: -parsedAmount } });

    const position = await FarmPosition.create({
      userId,
      poolId,
      amount:     parsedAmount,
      aprAtStake: pool.apr,
      status:     "active",
    });

    await Transaction.create({
      userId,
      type:        "farm_stake",
      amount:      parsedAmount,
      status:      "active",
      description: `Staked $${parsedAmount.toFixed(2)} in ${pool.pairLabel} (${pool.apr}% APR)`,
      referenceId: position._id,
    });

    const updatedUser = await User.findById(userId);
    _io?.to(userId.toString()).emit("balance:update", updatedUser.balance);

    return res.status(201).json({ message: "Staked successfully.", position });
  } catch (err) {
    console.error("stake:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── POST /api/farm/unstake  { positionId } ───────────────────────────────────
export const unstake = async (req, res) => {
  try {
    const { positionId } = req.body;
    const userId = req.user._id;

    const position = await FarmPosition.findOne({ _id: positionId, userId });
    if (!position) return res.status(404).json({ message: "Farm position not found." });
    if (position.status === "unstaked") {
      return res.status(400).json({ message: "This position is already unstaked." });
    }

    const reward       = calcAccruedReward(position);
    const returnAmount = parseFloat((position.amount + reward).toFixed(2));

    position.status     = "unstaked";
    position.unstakedAt = new Date();
    position.finalReward = reward;
    await position.save();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: returnAmount } },
      { new: true }
    );

    await Transaction.create({
      userId,
      type:        "farm_unstake",
      amount:      returnAmount,
      status:      "completed",
      description: `Unstaked $${position.amount.toFixed(2)} + $${reward.toFixed(2)} reward`,
      referenceId: position._id,
    });

    _io?.to(userId.toString()).emit("balance:update", updatedUser.balance);
    _io?.to(userId.toString()).emit("farm:update", position.toObject());

    return res.json({ message: "Unstaked successfully.", position, newBalance: updatedUser.balance });
  } catch (err) {
    console.error("unstake:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/farm/my-positions ────────────────────────────────────────────────
export const getMyPositions = async (req, res) => {
  try {
    const positions = await FarmPosition.find({ userId: req.user._id })
      .populate("poolId", "pairLabel provider apr category")
      .sort({ createdAt: -1 });

    const withRewards = positions.map((p) => ({
      ...p.toObject(),
      accruedReward: calcAccruedReward(p),
    }));

    return res.json({ positions: withRewards });
  } catch (err) {
    console.error("getMyPositions:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── Admin ─────────────────────────────────────────────────────────────────────

// POST /api/farm/admin/pools
export const adminCreatePool = async (req, res) => {
  try {
    const { pairLabel, provider, apr, minStake, category } = req.body;
    if (!pairLabel || apr == null) {
      return res.status(400).json({ message: "pairLabel and apr are required." });
    }
    const pool = await FarmPool.create({ pairLabel, provider, apr, minStake, category });
    return res.status(201).json({ message: "Pool created.", pool });
  } catch (err) {
    console.error("adminCreatePool:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// PUT /api/farm/admin/pools/:id
export const adminUpdatePool = async (req, res) => {
  try {
    const pool = await FarmPool.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pool) return res.status(404).json({ message: "Pool not found." });
    return res.json({ message: "Pool updated.", pool });
  } catch (err) {
    console.error("adminUpdatePool:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// GET /api/farm/admin/positions?status=active|unstaked|all
export const adminGetAllPositions = async (req, res) => {
  try {
    const { status = "active" } = req.query;
    const positions = await FarmPosition.find(status !== "all" ? { status } : {})
      .populate("userId", "name email balance")
      .populate("poolId", "pairLabel apr")
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ positions });
  } catch (err) {
    console.error("adminGetAllPositions:", err);
    return res.status(500).json({ message: "Server error." });
  }
};