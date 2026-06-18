import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Eye, EyeOff, Lock } from "lucide-react";
import useAdminStore from "../Store/useAdminStore";
import api from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminStore();
  const [form, setForm]           = useState({ email: "", password: "" });
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("All fields required."); return; }
    setLoading(true);
    setError("");
    const tid = toast.loading("Authenticating…");
    try {
      const { data } = await api.post("/api/auth/login", {
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (data.user?.role !== "admin") {
        toast.error("Access denied", { id: tid, description: "This account does not have admin privileges." });
        setError("Access denied. Admin credentials required.");
        return;
      }
      login(data.user, data.token);
      toast.success("Welcome, Admin", { id: tid });
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      setError(msg);
      toast.error("Login failed", { id: tid, description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg">TradeX</span>
            <span className="ml-2 text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase tracking-wider">Admin</span>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="px-6 py-7">
            <div className="flex items-center gap-2 mb-6">
              <Lock size={16} className="text-blue-400" />
              <h1 className="text-white font-bold text-lg">Admin Login</h1>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</label>
                <input type="email" value={form.email}
                  onChange={e => { setError(""); setForm(p => ({ ...p, email: e.target.value })); }}
                  placeholder="admin@tradex.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => { setError(""); setForm(p => ({ ...p, password: e.target.value })); }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-700 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm py-3 rounded-xl transition-all active:scale-[0.98] mt-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : <Lock size={15} />}
                {loading ? "Authenticating…" : "Login to Admin"}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-slate-600 mt-4">Restricted access — TradeX administrators only</p>
      </div>
    </div>
  );
}