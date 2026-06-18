import User from "../models/User.js";

// ─── GET /api/referral/my ─────────────────────────────────────────────────────
export const getMyReferral = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("referralCode referredBy name email");
    if (!user) return res.status(404).json({ message: "User not found." });

    // Count how many users this person has referred
    const referralCount = await User.countDocuments({ referredBy: req.user._id });

    // Get list of referred users (basic info only)
    const referrals = await User.find({ referredBy: req.user._id })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      referralCode:  user.referralCode,
      referralCount,
      referrals,
    });
  } catch (err) {
    console.error("getMyReferral:", err);
    return res.status(500).json({ message: "Server error." });
  }
};