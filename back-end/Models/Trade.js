import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    asset: {
      type: String,
      enum: ["BTC", "ETH", "SOL", "BNB"],
      required: true,
    },
    type: {
      type: String,
      enum: ["buy", "sell"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Minimum trade amount is $1"],
    },
    entryPrice:   { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    profitLoss:   { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    closedAt: { type: Date, default: null },
    adminAdjustments: [
      {
        type:       { type: String, enum: ["profit", "loss"] },
        amount:     Number,
        adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at:         { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

tradeSchema.index({ userId: 1, status: 1 });
export default mongoose.model("Trade", tradeSchema);