import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../stores/useauthstore";
import api from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordChecks = [
    { label: "At least 6 characters", pass: form.password.length >= 6 },
    { label: "Contains a number", pass: /\d/.test(form.password) },
    { label: "Contains a letter", pass: /[a-zA-Z]/.test(form.password) },
  ];
  const passwordStrength = passwordChecks.filter((c) => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][passwordStrength];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    const toastId = toast.loading("Creating your account…");

    try {
      const { data } = await api.post("/api/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      login(data.user, data.token);

      toast.success(`Account created! Welcome, ${data.user.name.split(" ")[0]}!`, {
        id: toastId,
        description: "Your TradeX account is ready. Redirecting…",
      });

      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toast.error("Registration failed", {
        id: toastId,
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 flex items-center justify-center px-4 py-12">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

          <div className="px-8 pt-8 pb-10">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span
                className="text-xl font-bold text-slate-900"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                TradeX
              </span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1
                className="text-2xl font-bold text-slate-900 mb-1.5"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Create your account
              </h1>
              <p className="text-sm text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Join thousands of traders on TradeX today.
              </p>
            </div>

            {/* Inline error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Strength meter */}
                {form.password.length > 0 && (
                  <div className="pt-1 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength ? strengthColor : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {passwordChecks.map((check) => (
                          <span
                            key={check.label}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              check.pass ? "text-green-600" : "text-slate-400"
                            }`}
                            style={{ fontFamily: "'DM Sans', sans-serif" }}
                          >
                            <CheckCircle2 size={11} />
                            {check.label}
                          </span>
                        ))}
                      </div>
                      {strengthLabel && (
                        <span
                          className={`text-xs font-semibold ${
                            passwordStrength === 3
                              ? "text-green-600"
                              : passwordStrength === 2
                              ? "text-yellow-600"
                              : "text-red-500"
                          }`}
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {strengthLabel}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-700"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition-all duration-200 ${
                      form.confirmPassword.length > 0
                        ? form.confirmPassword === form.password
                          ? "border-green-400 focus:ring-green-400"
                          : "border-red-300 focus:ring-red-400"
                        : "border-slate-200 focus:ring-blue-500"
                    }`}
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.confirmPassword.length > 0 && form.confirmPassword !== form.password && (
                  <p className="text-xs text-red-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Terms notice */}
              <p
                className="text-xs text-slate-400 leading-relaxed pt-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-blue-500 hover:underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p
              className="text-center text-sm text-slate-500 mt-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs text-slate-400 mt-5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Protected by 256-bit encryption &amp; two-factor authentication
        </p>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}