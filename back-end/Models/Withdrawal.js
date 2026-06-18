import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Minimum withdrawal is $1"],
      max: [10000, "Maximum withdrawal per request is $10,000"],
    },
    method: {
      type: String,
      enum: ["usdt_trc20", "usdt_erc20", "usdt_bep20", "btc", "eth", "sol"],
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast user lookup
withdrawalSchema.index({ userId: 1, createdAt: -1 });

const Withdrawal = mongoose.models.Withdrawal || mongoose.model("Withdrawal", withdrawalSchema);
export default Withdrawal;