import User        from "../models/User.js";
import Transfer    from "../models/Transfer.js";
import Transaction from "../models/Transaction.js";

// ─── POST /api/transfer ───────────────────────────────────────────────────────
export const createTransfer = async (req, res) => {
  try {
    const { recipientEmail, amount, note } = req.body;
    const senderId = req.user._id;

    // 1. Validate amount
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid transfer amount." });
    }

    // 2. Find recipient
    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required." });
    }
    const receiver = await User.findOne({ email: recipientEmail.trim().toLowerCase() });
    if (!receiver) {
      return res.status(404).json({ message: "No account found with that email address." });
    }
    if (receiver._id.toString() === senderId.toString()) {
      return res.status(400).json({ message: "You cannot transfer funds to yourself." });
    }

    // 3. Check sender balance
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ message: "Sender not found." });
    if (sender.balance < parsedAmount) {
      return res.status(400).json({
        message: `Insufficient balance. You have $${sender.balance.toFixed(2)}.`,
      });
    }

    // 4. Execute transfer (no fee)
    await User.findByIdAndUpdate(senderId,       { $inc: { balance: -parsedAmount } });
    await User.findByIdAndUpdate(receiver._id,   { $inc: { balance:  parsedAmount } });

    // 5. Save transfer record
    const transfer = await Transfer.create({
      senderId,
      receiverId: receiver._id,
      amount:     parsedAmount,
      note:       note?.trim() || "",
    });

    // 6. Log transactions for both parties
    await Transaction.insertMany([
      {
        userId:      senderId,
        type:        "transfer_out",
        amount:      parsedAmount,
        status:      "approved",
        description: `Transfer to ${receiver.name} (${receiver.email})${note ? ` — ${note.trim()}` : ""}`,
        referenceId: transfer._id,
      },
      {
        userId:      receiver._id,
        type:        "transfer_in",
        amount:      parsedAmount,
        status:      "approved",
        description: `Transfer from ${sender.name} (${sender.email})${note ? ` — ${note.trim()}` : ""}`,
        referenceId: transfer._id,
      },
    ]);

    return res.status(201).json({
      message: `$${parsedAmount.toLocaleString()} transferred to ${receiver.name} successfully.`,
      transfer,
    });
  } catch (err) {
    console.error("createTransfer:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── GET /api/transfer/my ─────────────────────────────────────────────────────
export const getMyTransfers = async (req, res) => {
  try {
    const userId = req.user._id;
    const transfers = await Transfer.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId",   "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ transfers });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};