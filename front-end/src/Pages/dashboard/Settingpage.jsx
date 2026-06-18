import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useAuthStore";
import api from "../../lib/api";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</p>
          <p className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export default function SettingsPage() {
  const { user, login, token } = useAuthStore();

  // ── Profile form
  const [profile, setProfile]       = useState({ name: "", email: "" });
  const [savingProfile, setSaving]  = useState(false);

  // ── Password form
  const [pwForm, setPwForm]         = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw]         = useState({ current: false, newPw: false, confirm: false });
  const [savingPw, setSavingPw]     = useState(false);

  useEffect(() => {
    if (user) setProfile({ name: user.name || "", email: user.email || "" });
  }, [user]);

  // Password strength
  const pwChecks = [
    { label: "At least 8 characters", pass: pwForm.newPw.length >= 8 },
    { label: "Contains a number",     pass: /\d/.test(pwForm.newPw) },
    { label: "Contains a letter",     pass: /[a-zA-Z]/.test(pwForm.newPw) },
  ];
  const pwStrength    = pwChecks.filter(c => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][pwStrength];

  // ── Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    const tid = toast.loading("Saving profile…");
    try {
      const { data } = await api.put("/api/auth/profile", { name: profile.name.trim() });
      login(data.user, token);
      toast.success("Profile updated!", { id: tid });
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message || "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // ── Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.current)             { toast.error("Enter your current password."); return; }
    if (pwForm.newPw.length < 8)     { toast.error("New password must be at least 8 characters."); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Passwords do not match."); return; }
    setSavingPw(true);
    const tid = toast.loading("Changing password…");
    try {
      await api.put("/api/auth/password", {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      toast.success("Password changed!", { id: tid, description: "Use your new password next time you log in." });
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message || "Please try again." });
    } finally {
      setSavingPw(false);
    }
  };

  const togglePw = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Settings</h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Manage your account details and security.</p>
        </div>

        {/* ── Account info banner */}
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-base" style={{ fontFamily: "'Sora', sans-serif" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>{user?.name}</p>
            <p className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              {user?.isKycVerified
                ? <span className="flex items-center gap-1 text-xs text-green-700 font-semibold"><CheckCircle2 size={11} /> KYC Verified</span>
                : <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold"><AlertCircle size={11} /> KYC Pending</span>
              }
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400 capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>{user?.role} account</span>
            </div>
          </div>
        </div>

        {/* ── Profile Section */}
        <Section icon={User} title="Profile Information" subtitle="Update your display name.">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Field label="Full Name" required>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                placeholder="John Doe" className={inp} style={{ fontFamily: "'DM Sans', sans-serif" }} />
            </Field>
            <Field label="Email Address">
              <input value={profile.email} disabled className={inp} style={{ fontFamily: "'DM Sans', sans-serif" }} />
              <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Email cannot be changed. Contact support if needed.
              </p>
            </Field>
            <button type="submit" disabled={savingProfile || !profile.name.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {savingProfile ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
              : <Save size={15} />}
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Section>

        {/* ── Password Section */}
        <Section icon={Lock} title="Change Password" subtitle="Use a strong password you don't use elsewhere.">
          <form onSubmit={handleChangePassword} className="space-y-4">

            <Field label="Current Password" required>
              <div className="relative">
                <input type={showPw.current ? "text" : "password"} value={pwForm.current}
                  onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
                  placeholder="Enter current password"
                  className={`${inp} pr-11`} style={{ fontFamily: "'DM Sans', sans-serif" }} />
                <button type="button" onClick={() => togglePw("current")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="New Password" required>
              <div className="relative">
                <input type={showPw.newPw ? "text" : "password"} value={pwForm.newPw}
                  onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
                  placeholder="Create a new password"
                  className={`${inp} pr-11`} style={{ fontFamily: "'DM Sans', sans-serif" }} />
                <button type="button" onClick={() => togglePw("newPw")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw.newPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength meter */}
              {pwForm.newPw.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? strengthColor : "bg-slate-200"}`} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {pwChecks.map(c => (
                      <span key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? "text-green-600" : "text-slate-400"}`}
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        <CheckCircle2 size={10} />{c.label}
                      </span>
                    ))}
                    {strengthLabel && (
                      <span className={`ml-auto text-xs font-semibold ${pwStrength===3?"text-green-600":pwStrength===2?"text-yellow-600":"text-red-500"}`}>
                        {strengthLabel}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Field>

            <Field label="Confirm New Password" required>
              <div className="relative">
                <input type={showPw.confirm ? "text" : "password"} value={pwForm.confirm}
                  onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Re-enter new password"
                  className={`${inp} pr-11 ${pwForm.confirm && pwForm.confirm !== pwForm.newPw ? "border-red-300 focus:ring-red-400" : pwForm.confirm && pwForm.confirm === pwForm.newPw ? "border-green-400 focus:ring-green-400" : ""}`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }} />
                <button type="button" onClick={() => togglePw("confirm")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwForm.confirm && pwForm.confirm !== pwForm.newPw && (
                <p className="text-xs text-red-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Passwords do not match.</p>
              )}
            </Field>

            <button type="submit" disabled={savingPw}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-[0.98]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {savingPw ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                : <Lock size={15} />}
              {savingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </Section>

        {/* ── Danger zone */}
        <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-5">
          <p className="text-sm font-semibold text-red-700 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>Account Information</p>
          <p className="text-xs text-red-500 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            To close or delete your account, contact support at{" "}
            <a href="mailto:support@tradex.com" className="font-semibold underline">support@tradex.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}