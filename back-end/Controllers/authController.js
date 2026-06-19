import jwt from "jsonwebtoken";
import User from "../Models/User.js";

// ─── Helper: generate JWT ─────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── @route  POST /api/auth/login ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // 2. Find user (explicitly select password which is excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 3. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4. Generate token
    const token = generateToken(user._id);

    // 5. Return token + sanitized user object
    return res.status(200).json({
      success: true,
      token,
      user: user.toJSON(), // password stripped by toJSON()
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, ref } = req.body;

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    // 2. Check for existing user
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    // 3. Generate unique referral code
    const namePart = name.trim().split(" ")[0].toUpperCase().slice(0, 6);
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referralCode = `${namePart}${randPart}`;

    // 4. Handle referral tracking
    let referredBy = null;
    if (ref) {
      const referrer = await User.findOne({ referralCode: ref.trim().toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }

    // 5. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      referralCode,
      referredBy,
    });

    // 6. Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: `Server error. Please try again.${error.message}` });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({ 
      success: true, 
      user: user.toJSON() 
    });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── @route  PUT /api/auth/profile ───────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Profile updated.", 
      user: user.toJSON() 
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

// ─── @route  PUT /api/auth/password ──────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Both current and new password are required." 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters." 
      });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    user.password = newPassword; // pre-save hook re-hashes
    await user.save();

    return res.status(200).json({ 
      success: true,
      message: "Password changed successfully." 
    });
  } catch (error) {
    console.error("updatePassword error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};