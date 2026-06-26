import Kyc from "../Models/Kyc.js";
import User from "../Models/User.js";
import cloudinary from "../Config/cloudinary.js"; // ⚠️ confirm folder casing matches your actual file tree

// Helper: upload a buffer (from multer memoryStorage) to Cloudinary
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// ─── @route  POST /api/kyc/submit ─────────────────────────────────────────────
export const submitKyc = async (req, res) => {
  try {
    const userId = req.user._id;

    const existing = await Kyc.findOne({ userId });
    if (existing) {
      if (existing.status === "rejected") {
        const {
          firstName, lastName, dob, nationality, socialLink,
          addressLine, city, state, country, documentType,
        } = req.body;

        const files = req.files;
        if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
          return res.status(400).json({ message: "Both front and back document images are required." });
        }

        // Upload both buffers to Cloudinary in parallel
        const [frontUrl, backUrl] = await Promise.all([
          uploadBufferToCloudinary(files.frontImage[0].buffer, "kyc"),
          uploadBufferToCloudinary(files.backImage[0].buffer, "kyc"),
        ]);

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
        existing.frontImage  = frontUrl;
        existing.backImage   = backUrl;
        existing.status      = "pending";
        existing.rejectionReason = "";
        existing.reviewedAt  = null;

        await existing.save();

        return res.status(200).json({
          message: "KYC application resubmitted successfully.",
          kyc: existing,
        });
      }

      return res.status(409).json({
        message:
          existing.status === "approved"
            ? "Your identity is already verified."
            : "Your previous application is under review. Please wait for the result.",
      });
    }

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

    const files = req.files;
    if (!files?.frontImage?.[0] || !files?.backImage?.[0]) {
      return res.status(400).json({ message: "Both front and back document images are required." });
    }

    // Upload both buffers to Cloudinary in parallel
    const [frontUrl, backUrl] = await Promise.all([
      uploadBufferToCloudinary(files.frontImage[0].buffer, "kyc"),
      uploadBufferToCloudinary(files.backImage[0].buffer, "kyc"),
    ]);

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
      frontImage:  frontUrl,
      backImage:   backUrl,
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