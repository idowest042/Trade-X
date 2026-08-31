import mongoose from "mongoose";

// A user's stake in a FarmPool. aprAtStake is locked in at stake time so a
// later APR change on the pool never retroactively changes an existing
// staker's rate — same fairness principle Trade.entryPrice follows for
// price. Rewards are computed live from elapsed time, not incrementally
// cranked by a background job (same as Trade's live PnL).
const farmPositionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FarmPool",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Minimum stake is $1"],
    },
    aprAtStake: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "unstaked"],
      default: "active",
    },
    stakedAt:    { type: Date, default: Date.now },
    unstakedAt:  { type: Date, default: null },
    finalReward: { type: Number, default: 0 }, // set once, at unstake time
  },
  { timestamps: true }
);

farmPositionSchema.index({ userId: 1, status: 1 });

export default mongoose.models.FarmPosition || mongoose.model("FarmPosition", farmPositionSchema);