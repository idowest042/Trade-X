import Trade        from "../Models/Trade.js";
import User         from "../Models/User.js";
import Transaction  from "../Models/Transaction.js";
import { getCurrentPrice } from "../marketEngine.js";

let _io = null;
export function setTradeSocket(io) { _io = io; }

// ─── POST /api/trades/open ────────────────────────────────────────────────────
export const openTrade = async (req, res) => {
  try {
    const { asset, type, amount } = req.body;
    const userId = req.user._id;

    const ASSETS = ["BTC", "ETH", "SOL", "BNB"];
    if (!ASSETS.includes(asset)) return res.status(400).json({ message: "Invalid asset." });
    if (!["buy", "sell"].includes(type)) return res.status(400).json({ message: "Type must be buy or sell." });

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 1) return res.status(400).json({ message: "Minimum trade amount is $1." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.balance < parsedAmount) {
      return res.status(400).json({ message: `Insufficient balance. You have $${user.balance.toFixed(2)}.` });
    }

    const entryPrice = getCurrentPrice(asset);

    // Deduct amount from balance
    await User.findByIdAndUpdate(userId, { $inc: { balance: -parsedAmount } });

    const trade = await Trade.create({
      userId,
      asset,
      type,
      amount:       parsedAmount,
      entryPrice,
      currentPrice: entryPrice,
      profitLoss:   0,
      status:       "open",
    });

    await Transaction.create({
      userId,
      type:        "trade_open",
      amount:      parsedAmount,
      status:      "active",
      description: `Opened ${type.toUpperCase()} trade on ${asset} @ $${entryPrice.toLocaleString()}`,
      referenceId: trade._id,
    });

    return res.status(201).json({ message: "Trade opened.", trade });
  } catch (err) {
    console.error("openTrade:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── POST /api/trades/close ───────────────────────────────────────────────────
export const closeTrade = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const userId = req.user._id;

    const trade = await Trade.findOne({ _id: tradeId, userId });
    if (!trade) return res.status(404).json({ message: "Trade not found." });
    if (trade.status === "closed") return res.status(400).json({ message: "Trade is already closed." });

    const exitPrice = getCurrentPrice(trade.asset);
    const priceDelta = exitPrice - trade.entryPrice;

    // For sell trades, profit is inverse of price movement
    const pnl = trade.type === "buy"
      ? (priceDelta / trade.entryPrice) * trade.amount
      : -(priceDelta / trade.entryPrice) * trade.amount;

    const finalPnL = parseFloat((trade.profitLoss + pnl).toFixed(2));
    const returnAmount = parseFloat((trade.amount + finalPnL).toFixed(2));

    trade.status       = "closed";
    trade.currentPrice = exitPrice;
    trade.profitLoss   = finalPnL;
    trade.closedAt     = new Date();
    await trade.save();

    // Return amount + PnL to user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: Math.max(0, returnAmount) } },
      { new: true }
    );

    await Transaction.create({
      userId,
      type:        finalPnL >= 0 ? "trade_profit" : "trade_loss",
      amount:      Math.abs(finalPnL),
      status:      "completed",
      description: `Closed ${trade.type.toUpperCase()} ${trade.asset} @ $${exitPrice.toLocaleString()} | PnL: $${finalPnL >= 0 ? "+" : ""}${finalPnL.toFixed(2)}`,
      referenceId: trade._id,
    });

    // Emit real-time balance update
    _io?.to(userId.toString()).emit("balance:update", updatedUser.balance);
    _io?.to(userId.toString()).emit("trade:update", { ...trade.toObject(), closed: true });

    return res.status(200).json({ message: "Trade closed.", trade, newBalance: updatedUser.balance });
  } catch (err) {
    console.error("closeTrade:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/trades/my ───────────────────────────────────────────────────────
export const getMyTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ trades });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/trades/open ─────────────────────────────────────────────────────
export const getOpenTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id, status: "open" })
      .sort({ createdAt: -1 });
    return res.json({ trades });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── PUT /api/admin/trades/:id/adjust  (admin) ────────────────────────────────
export const adminAdjustTrade = async (req, res) => {
  try {
    const { type, amount } = req.body; // type: "profit" | "loss"
    const val = parseFloat(amount);
    if (!["profit", "loss"].includes(type) || !val || val <= 0) {
      return res.status(400).json({ message: "Invalid adjustment. type must be profit or loss." });
    }

    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Trade not found." });
    if (trade.status === "closed") return res.status(400).json({ message: "Cannot adjust a closed trade." });

    const delta = type === "profit" ? val : -val;
    trade.profitLoss = parseFloat((trade.profitLoss + delta).toFixed(2));
    trade.adminAdjustments.push({ type, amount: val, adjustedBy: req.user._id });
    await trade.save();

    // Update user balance immediately
    const updatedUser = await User.findByIdAndUpdate(
      trade.userId,
      { $inc: { balance: delta } },
      { new: true }
    );

    // Emit real-time updates to the user's socket room
    _io?.to(trade.userId.toString()).emit("trade:update", trade.toObject());
    _io?.to(trade.userId.toString()).emit("balance:update", updatedUser.balance);

    return res.json({
      message: `Trade ${type} adjusted by $${val}.`,
      trade,
      newUserBalance: updatedUser.balance,
    });
  } catch (err) {
    console.error("adminAdjustTrade:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/admin/trades  (admin — all open trades) ─────────────────────────
export const adminGetAllTrades = async (req, res) => {
  try {
    const { status = "open" } = req.query;
    const trades = await Trade.find(status !== "all" ? { status } : {})
      .populate("userId", "name email balance")
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ trades });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};