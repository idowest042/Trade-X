import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Minimum deposit amount is $1"],
    },
    method: {
      type: String,
      enum: ["usdt_trc20", "usdt_erc20", "usdt_bep20", "btc", "eth", "sol"],
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    proofImage: {
      type: String,
      required: true,
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

depositSchema.index({ userId: 1, createdAt: -1 });

const Deposit = mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
export default Deposit;