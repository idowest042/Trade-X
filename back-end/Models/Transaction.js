import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
     type: {
  type: String,
  enum: [
    "deposit", "withdrawal", "investment", "profit",
    "trade_open", "trade_close", "trade_profit", "trade_loss",
    "farm_stake", "farm_unstake",
  ],
  required: true,
},
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "completed"],
      default: "pending",
    },
    method: {
      type: String, // crypto method for deposits/withdrawals
      default: null,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // links to Deposit, Withdrawal, or Investment doc
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, type: 1, createdAt: -1 });

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);
export default Transaction;