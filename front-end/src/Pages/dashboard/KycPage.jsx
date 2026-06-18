import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  User,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

// ─── Status Banner ────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
  const config = {
    pending: {
      icon: Clock,
      bg: "bg-amber-50 border-amber-200",
      iconColor: "text-amber-500",
      title: "Application Under Review",
      message:
        "Your KYC application has been submitted and is currently being reviewed by our compliance team. This typically takes 1–3 business days.",
      badge: "bg-amber-100 text-amber-700",
      badgeText: "Pending Review",
    },
    approved: {
      icon: ShieldCheck,
      bg: "bg-green-50 border-green-200",
      iconColor: "text-green-500",
      title: "Identity Verified",
      message:
        "Your identity has been successfully verified. You now have full access to all TradeX platform features including withdrawals.",
      badge: "bg-green-100 text-green-700",
      badgeText: "Verified",
    },
    rejected: {
      icon: ShieldAlert,
      bg: "bg-red-50 border-red-200",
      iconColor: "text-red-500",
      title: "Verification Rejected",
      message:
        "Your KYC submission was rejected. Please review your documents and resubmit. Ensure all images are clear, valid, and match your personal details.",
      badge: "bg-red-100 text-red-700",
      badgeText: "Rejected",
    },
  };

  const c = config[status];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-5 ${c.bg}`}>
      <div className={`mt-0.5 flex-shrink-0 ${c.iconColor}`}>
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p
            className="text-sm font-semibold text-slate-800"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {c.title}
          </p>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {c.badgeText}
          </span>
        </div>
        <p
          className="text-sm text-slate-600 leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {c.message}
        </p>
      </div>
    </div>
  );
}

// ─── File Upload Box ──────────────────────────────────────────────────────────
function FileUpload({ label, name, file, onChange, disabled }) {
  const ref = useRef(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium text-slate-700"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label} <span className="text-red-400">*</span>
      </label>
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
          ${disabled ? "cursor-not-allowed opacity-60 bg-slate-50 border-slate-200" : "cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 border-slate-300 bg-slate-50"}
          ${file ? "border-blue-400 bg-blue-50/30" : ""}
        `}
        style={{ minHeight: "130px" }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover absolute inset-0"
              style={{ maxHeight: "130px", objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-white text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Change image
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { name, files: [null] } });
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center">
              <ImageIcon size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Click to upload
              </p>
              <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                JPG, PNG or PDF — max 5MB
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        name={name}
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-5">
      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-blue-600" />
      </div>
      <div>
        <p
          className="text-sm font-semibold text-slate-800"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {title}
        </p>
        <p
          className="text-xs text-slate-400 mt-0.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-sm font-medium text-slate-700"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KycPage() {
  const [kycStatus, setKycStatus] = useState(null); // null | "pending" | "approved" | "rejected"
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    nationality: "",
    socialLink: "",
    addressLine: "",
    city: "",
    state: "",
    country: "",
    documentType: "national_id",
  });
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  // ── Load existing KYC on mount
  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/api/kyc/me");
        if (data.kyc) setKycStatus(data.kyc.status);
      } catch (err) {
        // 404 = no submission yet, that's fine
        if (err.response?.status !== 404) {
          console.error("Failed to fetch KYC status", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const isDisabled =
    submitting || kycStatus === "pending" || kycStatus === "approved";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    if (name === "frontImage") setFrontImage(file);
    if (name === "backImage") setBackImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const required = [
      "firstName", "lastName", "dob", "nationality",
      "addressLine", "city", "state", "country",
    ];
    for (const key of required) {
      if (!form[key].trim()) {
        toast.error("Missing fields", { description: "Please fill in all required fields." });
        return;
      }
    }
    if (!frontImage) {
      toast.error("Missing document", { description: "Please upload the front image of your document." });
      return;
    }
    if (!backImage) {
      toast.error("Missing document", { description: "Please upload the back image of your document." });
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading("Submitting your KYC application…");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("frontImage", frontImage);
      formData.append("backImage", backImage);

      await api.post("/api/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setKycStatus("pending");
      toast.success("Application submitted!", {
        id: toastId,
        description: "Our compliance team will review your documents within 1–3 business days.",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      toast.error("Submission failed", { id: toastId, description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-xl" />
        <div className="h-4 w-96 bg-slate-100 rounded-xl" />
        <div className="h-48 bg-white rounded-2xl border border-slate-100" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold text-slate-900"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            KYC Verification
          </h1>
          <p
            className="text-sm text-slate-500 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Verify your identity to unlock withdrawals and full platform access.
          </p>
        </div>

        {/* Status banner — shown if submission exists */}
        {kycStatus && <StatusBanner status={kycStatus} />}

        {/* Rejected — allow resubmission */}
        {kycStatus === "rejected" && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              You may resubmit your documents below.
            </p>
          </div>
        )}

        {/* Hide form entirely if pending or approved */}
        {kycStatus !== "pending" && kycStatus !== "approved" && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Personal Information ────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <SectionHead
                icon={User}
                title="Personal Information"
                subtitle="Enter your legal name and personal details exactly as they appear on your ID."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <Field label="Date of Birth" required>
                  <input
                    type="date"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <Field label="Nationality" required>
                  <input
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    placeholder="e.g. American"
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <Field label="Social Link" required={false}>
                  <input
                    name="socialLink"
                    value={form.socialLink}
                    onChange={handleChange}
                    placeholder="Twitter or Facebook URL (optional)"
                    disabled={isDisabled}
                    className={`${inputCls} sm:col-span-2`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
              </div>
            </div>

            {/* ── Address ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <SectionHead
                icon={MapPin}
                title="Residential Address"
                subtitle="Provide your current residential address."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Address Line" required>
                    <input
                      name="addressLine"
                      value={form.addressLine}
                      onChange={handleChange}
                      placeholder="123 Example Street"
                      disabled={isDisabled}
                      className={inputCls}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </Field>
                </div>
                <Field label="City" required>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="New York"
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <Field label="State / Province" required>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="New York"
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Country" required>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      placeholder="United States"
                      disabled={isDisabled}
                      className={inputCls}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Document Upload ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <SectionHead
                icon={FileText}
                title="Identity Document"
                subtitle="Upload clear, legible images of your government-issued ID."
              />

              {/* Document type */}
              <div className="mb-5">
                <Field label="Document Type" required>
                  <select
                    name="documentType"
                    value={form.documentType}
                    onChange={handleChange}
                    disabled={isDisabled}
                    className={inputCls}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                  </select>
                </Field>
              </div>

              {/* Upload boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FileUpload
                  label="Front of Document"
                  name="frontImage"
                  file={frontImage}
                  onChange={handleFileChange}
                  disabled={isDisabled}
                />
                <FileUpload
                  label="Back of Document"
                  name="backImage"
                  file={backImage}
                  onChange={handleFileChange}
                  disabled={isDisabled}
                />
              </div>

              {/* Guidelines */}
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1">
                {[
                  "Ensure the document is not expired.",
                  "All four corners of the document must be visible.",
                  "Images must be clear and free of glare or blur.",
                  "File size must not exceed 5MB per image.",
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-200"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Submit KYC Application
                </>
              )}
            </button>

            <p
              className="text-xs text-center text-slate-400 pb-2"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Your personal information is encrypted and handled in accordance with our{" "}
              <a href="/kyc" className="text-blue-500 hover:underline">
                KYC &amp; AML Policy
              </a>
              .
            </p>
          </form>
        )}
      </div>
    </>
  );
}

