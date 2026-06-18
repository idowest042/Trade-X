import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount:     { type: Number, required: true, min: [1, "Minimum transfer is $1"] },
    note:       { type: String, default: "" },
  },
  { timestamps: true }
);

transferSchema.index({ senderId: 1, createdAt: -1 });
transferSchema.index({ receiverId: 1, createdAt: -1 });
export default mongoose.model("Transfer", transferSchema);