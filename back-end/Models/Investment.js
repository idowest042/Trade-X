import mongoose from "mongoose";

// Every deposit into an investment (the initial one + each top-up)
const contributionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date:   { type: Date, default: Date.now },
    days:   { type: Number, required: true }, // days this money earns for
  },
  { _id: false }
);

const investmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planType: {
      type: String,
      enum: ["starter", "growth", "elite"],
      required: true,
    },
    amount:      { type: Number, required: true }, // total invested (grows with top-ups)
    roi:         { type: Number, required: true }, // daily ROI %
    duration:    { type: Number, required: true }, // days
    dailyReturn: { type: Number, required: true }, // sum of contribution daily returns
    totalReturn: { type: Number, required: true }, // sum of contribution total profit
    contributions: { type: [contributionSchema], default: [] },
    startDate: { type: Date, default: Date.now },
    endDate:   { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

investmentSchema.index({ userId: 1, status: 1 });

const Investment = mongoose.model("Investment", investmentSchema);
export default Investment;