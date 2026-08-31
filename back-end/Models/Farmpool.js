import mongoose from "mongoose";

// A "pool" is a staking product a user can put simulated USD into.
// pairLabel/provider are cosmetic (mirrors the SOL-USDC / Orca style labels
// in the reference screenshots) — the actual balance movement is plain USD,
// same as Trade.
const farmPoolSchema = new mongoose.Schema(
  {
    pairLabel: { type: String, required: true, trim: true },     // e.g. "SOL-USDC"
    provider:  { type: String, default: "TradeX Farm", trim: true }, // cosmetic label
    apr: {
      type: Number,
      required: true,
      min: [0, "APR cannot be negative"],
    },
    minStake: {
      type: Number,
      default: 10,
      min: [1, "Minimum stake must be at least $1"],
    },
    category: {
      type: String,
      enum: ["all", "gold", "stocks", "new"],
      default: "all",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

farmPoolSchema.index({ isActive: 1, category: 1 });

export default mongoose.models.FarmPool || mongoose.model("FarmPool", farmPoolSchema);