import { useState, useEffect } from "react";
import { Copy, CheckCheck, Users, Link2, Gift, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "../../lib/api";

export default function ReferralPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  const BASE_URL = import.meta.env.VITE_FRONTEND_URL || "https://tradex.com";

  useEffect(() => {
    api.get("/api/referral/my")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const referralLink = data?.referralCode
    ? `${BASE_URL}/register?ref=${data.referralCode}`
    : "";

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="h-36 bg-white rounded-2xl border border-slate-100" />
      <div className="h-52 bg-white rounded-2xl border border-slate-100" />
    </div>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>Referral Program</h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Invite friends to TradeX and earn rewards when they join.</p>
        </div>

        {/* Hero card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-500/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-800/30 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Gift size={18} className="text-blue-200" />
              <p className="text-blue-200 text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your referral code</p>
            </div>
            <p className="text-white text-3xl font-extrabold tracking-widest mb-4" style={{ fontFamily: "'Sora', sans-serif" }}>
              {data?.referralCode || "—"}
            </p>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5">
              <p className="text-white text-xs flex-1 truncate font-mono">{referralLink}</p>
              <button onClick={() => handleCopy(referralLink)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${copied ? "bg-green-400 text-white" : "bg-white text-blue-700 hover:bg-blue-50"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              {data?.referralCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>People Referred</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Gift size={18} className="text-green-600" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              $0
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>Referral Earnings</p>
          </div>
        </div>

        {/* Share options */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
          <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Share Your Link</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Copy Referral Link", action: () => handleCopy(referralLink), icon: Link2, color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100" },
              { label: "Copy Code Only",     action: () => handleCopy(data?.referralCode || ""), icon: Copy, color: "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200" },
            ].map(({ label, action, icon: Icon, color }) => (
              <button key={label} onClick={action}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${color}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Icon size={15} className="flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Referred users list */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <UserPlus size={15} className="text-blue-600" />
            <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>Referred Users</p>
            <span className="ml-auto text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {data?.referralCount || 0}
            </span>
          </div>
          <div className="px-5">
            {!data?.referrals?.length ? (
              <div className="py-10 text-center">
                <Users size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>No referrals yet</p>
                <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Share your link and start earning when friends join.
                </p>
              </div>
            ) : data.referrals.map(r => (
              <div key={r._id} className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-700 text-xs font-bold">{r.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>{r.name}</p>
                    <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>{r.email}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-slate-700" style={{ fontFamily: "'Sora', sans-serif" }}>How It Works</p>
          {[
            ["1", "Share your unique referral link or code with friends"],
            ["2", "They register using your link and create their account"],
            ["3", "Their account gets linked to you as the referrer"],
            ["4", "Earn rewards when the referral bonus system goes live"],
          ].map(([n, txt]) => (
            <div key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
              <p className="text-sm text-slate-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>{txt}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}