// ─── Admin Seeder ─────────────────────────────────────────────────────────────
// Run ONCE with: node seedAdmin.js
// This creates or updates the admin account in your MongoDB database.
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import dotenv   from "dotenv";

dotenv.config();

// ── Configure your admin credentials here ─────────────────────────────────────
const ADMIN_NAME     = "TradeX Admin";
const ADMIN_EMAIL    = "admin@tradex.com";   // ← change this
const ADMIN_PASSWORD = "042express";          // ← change this (min 8 chars)
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:          String,
  email:         { type: String, unique: true, lowercase: true },
  password:      String,
  role:          { type: String, default: "user" },
  isKycVerified: { type: Boolean, default: false },
  balance:       { type: Number, default: 0 },
  referralCode:  String,
  referredBy:    { type: mongoose.Schema.Types.ObjectId, default: null },
  cryptoBalances: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    USDT:{ type: Number, default: 0 },
    SOL: { type: Number, default: 0 },
    BNB: { type: Number, default: 0 },
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // Update existing user to admin role
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      existing.role     = "admin";
      existing.password = hashed;
      existing.name     = ADMIN_NAME;
      await existing.save();
      console.log(`✅ Existing user updated to admin: ${ADMIN_EMAIL}`);
    } else {
      // Create fresh admin user
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({
        name:         ADMIN_NAME,
        email:        ADMIN_EMAIL,
        password:     hashed,
        role:         "admin",
        isKycVerified: true,
        referralCode: "ADMIN000",
      });
      console.log(`✅ Admin account created: ${ADMIN_EMAIL}`);
    }

    console.log("\n─────────────────────────────────────");
    console.log("  Admin Login Credentials");
    console.log("─────────────────────────────────────");
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
    console.log(`  Role     : admin`);
    console.log("─────────────────────────────────────");
    console.log("\n🚀 You can now login at http://localhost:5174/login");

  } catch (err) {
    console.error("❌ Seeder failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();