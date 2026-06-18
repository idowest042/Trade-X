import Transaction from "../models/Transaction.js";

// ─── GET /api/transactions/my ─────────────────────────────────────────────────
export const getMyTransactions = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: ?type=deposit

    const query = { userId: req.user._id };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .select("type amount status method description referenceId createdAt");

    return res.status(200).json({ transactions });
  } catch (err) {
    console.error("getMyTransactions:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/transactions/all  (admin — wired in admin panel phase) ──────────
export const getAllTransactions = async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const query = {};
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    return res.status(200).json({ transactions, total, page: Number(page) });
  } catch (err) {
    console.error("getAllTransactions:", err);
    return res.status(500).json({ message: "Server error." });
  }
};