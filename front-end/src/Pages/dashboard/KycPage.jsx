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
      border: "border-amber-400",
      bg: "bg-amber-50/60",
      iconColor: "text-amber-500",
      title: "Application under review",
      message:
        "Your KYC application has been submitted and is currently being reviewed by our compliance team. This typically takes 1–3 business days.",
      badge: "text-amber-700 bg-amber-50 border-amber-200",
      badgeText: "Pending review",
    },
    approved: {
      icon: ShieldCheck,
      border: "border-emerald-500",
      bg: "bg-emerald-50/60",
      iconColor: "text-emerald-600",
      title: "Identity verified",
      message:
        "Your identity has been successfully verified. You now have full access to all TradeX platform features including withdrawals.",
      badge: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badgeText: "Verified",
    },
    rejected: {
      icon: ShieldAlert,
      border: "border-rose-500",
      bg: "bg-rose-50/60",
      iconColor: "text-rose-600",
      title: "Verification rejected",
      message:
        "Your KYC submission was rejected. Please review your documents and resubmit. Ensure all images are clear, valid, and match your personal details.",
      badge: "text-rose-700 bg-rose-50 border-rose-200",
      badgeText: "Rejected",
    },
  };

  const c = config[status];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className={`flex items-start gap-4 rounded-lg border-l-2 ${c.border} ${c.bg} p-5`}>
      <div className={`mt-0.5 flex-shrink-0 ${c.iconColor}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-slate-800">{c.title}</p>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${c.badge}`}>
            {c.badgeText}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{c.message}</p>
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
      <label className="block text-sm font-medium text-slate-700">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors overflow-hidden
          ${disabled ? "cursor-not-allowed opacity-60 bg-slate-50 border-slate-200" : "cursor-pointer hover:border-slate-400 hover:bg-slate-50 border-slate-200 bg-slate-50"}
          ${file ? "border-slate-400 bg-slate-50" : ""}
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
              <p className="text-white text-xs font-medium">Change image</p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ target: { name, files: [null] } });
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-slate-900/80 rounded-full flex items-center justify-center text-white z-10"
              >
                <X size={12} />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 px-4 text-center">
            <div className="w-10 h-10 rounded-md border border-slate-200 flex items-center justify-center">
              <ImageIcon size={18} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Click to upload</p>
              <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or PDF — max 5MB</p>
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
      <div className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

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

  useEffect(() => {
    const fetchKyc = async () => {
      try {
        const { data } = await api.get("/api/kyc/me");
        if (data.kyc) setKycStatus(data.kyc.status);
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Failed to fetch KYC status", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchKyc();
  }, []);

  const isDisabled = submitting || kycStatus === "pending" || kycStatus === "approved";

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-7 w-56 bg-slate-100 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        <div className="h-48 bg-white rounded-lg border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">

      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">KYC verification</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Verify your identity to unlock withdrawals and full platform access.
        </p>
      </div>

      {kycStatus && <StatusBanner status={kycStatus} />}

      {kycStatus === "rejected" && (
        <div className="flex items-center gap-2 border-l-2 border-rose-500 bg-rose-50/60 rounded px-4 py-3">
          <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
          <p className="text-sm text-rose-700">You may resubmit your documents below.</p>
        </div>
      )}

      {kycStatus !== "pending" && kycStatus !== "approved" && (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Personal Information ────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
            <SectionHead
              icon={User}
              title="Personal information"
              subtitle="Enter your legal name and personal details exactly as they appear on your ID."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First name" required>
                <input name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="John" disabled={isDisabled} className={inputCls} />
              </Field>
              <Field label="Last name" required>
                <input name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Doe" disabled={isDisabled} className={inputCls} />
              </Field>
              <Field label="Date of birth" required>
                <input type="date" name="dob" value={form.dob} onChange={handleChange}
                  disabled={isDisabled} className={inputCls} />
              </Field>
              <Field label="Nationality" required>
                <input name="nationality" value={form.nationality} onChange={handleChange}
                  placeholder="e.g. American" disabled={isDisabled} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Social link" required={false}>
                  <input name="socialLink" value={form.socialLink} onChange={handleChange}
                    placeholder="Twitter or Facebook URL (optional)" disabled={isDisabled} className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Address ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
            <SectionHead
              icon={MapPin}
              title="Residential address"
              subtitle="Provide your current residential address."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Address line" required>
                  <input name="addressLine" value={form.addressLine} onChange={handleChange}
                    placeholder="123 Example Street" disabled={isDisabled} className={inputCls} />
                </Field>
              </div>
              <Field label="City" required>
                <input name="city" value={form.city} onChange={handleChange}
                  placeholder="New York" disabled={isDisabled} className={inputCls} />
              </Field>
              <Field label="State / Province" required>
                <input name="state" value={form.state} onChange={handleChange}
                  placeholder="New York" disabled={isDisabled} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Country" required>
                  <input name="country" value={form.country} onChange={handleChange}
                    placeholder="United States" disabled={isDisabled} className={inputCls} />
                </Field>
              </div>
            </div>
          </div>

          {/* ── Document Upload ──────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6">
            <SectionHead
              icon={FileText}
              title="Identity document"
              subtitle="Upload clear, legible images of your government-issued ID."
            />

            <div className="mb-5">
              <Field label="Document type" required>
                <select name="documentType" value={form.documentType} onChange={handleChange}
                  disabled={isDisabled} className={inputCls}>
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver's license</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileUpload label="Front of document" name="frontImage" file={frontImage}
                onChange={handleFileChange} disabled={isDisabled} />
              <FileUpload label="Back of document" name="backImage" file={backImage}
                onChange={handleFileChange} disabled={isDisabled} />
            </div>

            {/* Guidelines */}
            <div className="mt-4 border border-slate-200 rounded-lg px-4 py-3 space-y-1.5">
              {[
                "Ensure the document is not expired.",
                "All four corners of the document must be visible.",
                "Images must be clear and free of glare or blur.",
                "File size must not exceed 5MB per image.",
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-slate-400 flex-shrink-0" />
                  <p className="text-xs text-slate-600">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-sm py-3.5 rounded-lg transition-colors"
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
                <Upload size={15} />
                Submit KYC application
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400 pb-2">
            Your personal information is encrypted and handled in accordance with our{" "}
            <a href="/kyc" className="text-slate-600 hover:text-slate-900 underline">
              KYC &amp; AML Policy
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}