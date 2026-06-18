import mongoose from "mongoose";

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
    amount: {
      type: Number,
      required: true,
    },
    roi: {
      type: Number, // daily ROI percentage e.g. 3, 4, 6
      required: true,
    },
    duration: {
      type: Number, // in days
      required: true,
    },
    dailyReturn: {
      type: Number, // amount * roi / 100
      required: true,
    },
    totalReturn: {
      type: Number, // dailyReturn * duration
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
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