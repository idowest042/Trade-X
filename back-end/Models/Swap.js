import mongoose from "mongoose";

const swapSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromCurrency:    { type: String, required: true },
    toCurrency:      { type: String, required: true },
    amount:          { type: Number, required: true },
    fee:             { type: Number, required: true },
    convertedAmount: { type: Number, required: true },
    rate:            { type: Number, required: true },
  },
  { timestamps: true }
);

swapSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model("Swap", swapSchema);