import Kyc from "../Models/Kyc.js";
import User from "../Models/User.js";

// ─── @route  POST /api/kyc/submit ─────────────────────────────────────────────
export const submitKyc = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Check for existing submission
    const existing = await Kyc.findOne({ userId });
    if (existing) {
      // Allow resubmission only if previously rejected
      if (existing.status === "rejected") {
        // Update the existing record instead of creating a new one
        const {
          firstName, lastName, dob, nationality, socialLink,
          addressLine, city, state, country, documentType,
        } = req.body;

        const files = req.files;
        if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
          return res.status(400).json({ message: "Both front and back document images are required." });
        }

        existing.firstName   = firstName?.trim();
        existing.lastName    = lastName?.trim();
        existing.dob         = dob;
        existing.nationality = nationality?.trim();
        existing.socialLink  = socialLink?.trim() || "";
        existing.addressLine = addressLine?.trim();
        existing.city        = city?.trim();
        existing.state       = state?.trim();
        existing.country     = country?.trim();
        existing.documentType = documentType;
        existing.frontImage  = files.frontImage[0].path;
        existing.backImage   = files.backImage[0].path;
        existing.status      = "pending";
        existing.rejectionReason = "";
        existing.reviewedAt  = null;

        await existing.save();

        return res.status(200).json({
          message: "KYC application resubmitted successfully.",
          kyc: existing,
        });
      }

      // Pending or approved — block resubmission
      return res.status(409).json({
        message:
          existing.status === "approved"
            ? "Your identity is already verified."
            : "Your previous application is under review. Please wait for the result.",
      });
    }

    // 2. Validate required fields
    const {
      firstName, lastName, dob, nationality, socialLink,
      addressLine, city, state, country, documentType,
    } = req.body;

    if (
      !firstName || !lastName || !dob || !nationality ||
      !addressLine || !city || !state || !country || !documentType
    ) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // 3. Validate uploaded files
    const files = req.files;
    if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
      return res.status(400).json({ message: "Both front and back document images are required." });
    }

    // 4. Create KYC record
    const kyc = await Kyc.create({
      userId,
      firstName:   firstName.trim(),
      lastName:    lastName.trim(),
      dob,
      nationality: nationality.trim(),
      socialLink:  socialLink?.trim() || "",
      addressLine: addressLine.trim(),
      city:        city.trim(),
      state:       state.trim(),
      country:     country.trim(),
      documentType,
      frontImage:  files.frontImage[0].path,
      backImage:   files.backImage[0].path,
      status:      "pending",
    });

    return res.status(201).json({
      message: "KYC application submitted successfully. Our team will review it within 1–3 business days.",
      kyc,
    });
  } catch (error) {
    console.error("KYC submit error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── @route  GET /api/kyc/me ──────────────────────────────────────────────────
export const getMyKyc = async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ userId: req.user._id }).select(
      "status documentType createdAt rejectionReason reviewedAt firstName lastName"
    );

    if (!kyc) {
      return res.status(404).json({ message: "No KYC submission found.", kyc: null });
    }

    return res.status(200).json({ kyc });
  } catch (error) {
    console.error("Get KYC error:", error);
    return res.status(500).json({ message: "Server error." });
  }
};