import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one KYC record per user
    },

    // Personal info
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    dob:         { type: String, required: true },
    nationality: { type: String, required: true, trim: true },
    socialLink:  { type: String, default: "", trim: true },

    // Address
    addressLine: { type: String, required: true, trim: true },
    city:        { type: String, required: true, trim: true },
    state:       { type: String, required: true, trim: true },
    country:     { type: String, required: true, trim: true },

    // Document
    documentType: {
      type: String,
      enum: ["national_id", "passport", "drivers_license"],
      required: true,
    },
    frontImage: { type: String, required: true }, // file path or URL
    backImage:  { type: String, required: true }, // file path or URL

    // Review
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

const Kyc = mongoose.models.Kyc || mongoose.model("Kyc", kycSchema);

export default Kyc;