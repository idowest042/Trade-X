// One-off seed script — populates a handful of starter Farm pools so the
// Market/Farm UI has real data to display. Safe to re-run: it skips any
// pairLabel that already exists instead of creating duplicates.
//
// Usage (from your backend project root, wherever your other scripts run):
//   node Scripts/seedFarmPools.js
//
// Requires the same environment variables your server already uses to
// connect to Mongo (e.g. MONGO_URI) — adjust the connect() call below if
// your Config/db.js exports something different than a plain mongoose URI.

import mongoose from "mongoose";
import dotenv from "dotenv";
import FarmPool from "../Models/FarmPool.js";

dotenv.config();

const POOLS = [
  { pairLabel: "BTC-USDC",  provider: "TradeX Farm", apr: 12.5,  minStake: 10, category: "all" },
  { pairLabel: "ETH-USDC",  provider: "TradeX Farm", apr: 15.8,  minStake: 10, category: "all" },
  { pairLabel: "SOL-USDC",  provider: "TradeX Farm", apr: 22.3,  minStake: 10, category: "all" },
  { pairLabel: "BNB-USDC",  provider: "TradeX Farm", apr: 18.4,  minStake: 10, category: "all" },
  { pairLabel: "XAU-USDC",  provider: "TradeX Gold",  apr: 8.2,   minStake: 25, category: "gold" },
  { pairLabel: "SPX-USDC",  provider: "TradeX Stocks", apr: 9.6,  minStake: 25, category: "stocks" },
];

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ No MONGO_URI / MONGODB_URI found in your environment. Set it and re-run.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  for (const pool of POOLS) {
    const existing = await FarmPool.findOne({ pairLabel: pool.pairLabel });
    if (existing) {
      console.log(`↷ Skipping "${pool.pairLabel}" — already exists`);
      continue;
    }
    await FarmPool.create(pool);
    console.log(`✅ Created pool: ${pool.pairLabel} (${pool.apr}% APR, ${pool.category})`);
  }

  console.log("🌱 Farm pool seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});