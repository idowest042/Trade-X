import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  ArrowLeftRight, Wallet, ShieldCheck, FileText,
  AlertCircle, Activity,
} from "lucide-react";
import useAuthStore  from "../../stores/useauthstore";
import api           from "../../lib/api";
import { getSocket } from "../../stores/socket";

export default function DashboardHome() {
  const navigate        = useNavigate();
  const { user, token } = useAuthStore();

  const [balance,      setBalance]    = useState(user?.balance ?? 0);
  const [kycStatus,    setKycStatus]  = useState(user?.isKycVerified ? "approved" : null);
  const [recentTxns,   setRecentTxns] = useState([]);
  const [loading,      setLoading]    = useState(true);

  // ── Fetch live data on mount (no login() call — avoids cross-component re-render storms)
  useEffect(() => {
    Promise.all([
      api.get("/api/auth/me"),
      api.get("/api/kyc/me").catch(() => ({ data: { kyc: null } })),
      api.get("/api/transactions/my").catch(() => ({ data: { transactions: [] } })),
    ]).then(([meRes, kycRes, txRes]) => {
      const u = meRes.data.user;
      setBalance(u.balance ?? 0);
      setKycStatus(kycRes.data.kyc?.status || null);
      setRecentTxns((txRes.data.transactions || []).slice(0, 5));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Socket for real-time balance updates (shared connection)
  useEffect(() => {
    const sock = getSocket(token);
    const onBalance = (bal) => setBalance(bal);
    sock.on("balance:update", onBalance);
    return () => sock.off("balance:update", onBalance);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const firstName   = user?.name?.split(" ")[0] || "Trader";
  const kycApproved = kycStatus === "approved";
  const kycPending  = kycStatus === "pending";

  const TYPE_ICON = {
    deposit:      { icon: ArrowDownToLine, color: "text-green-600",  bg: "bg-green-100"  },
    withdrawal:   { icon: ArrowUpFromLine, color: "text-red-500",    bg: "bg-red-100"    },
    investment:   { icon: TrendingUp,      color: "text-blue-600",   bg: "bg-blue-100"   },
    profit:       { icon: TrendingUp,      color: "text-purple-600", bg: "bg-purple-100" },
    swap:         { icon: ArrowLeftRight,  color: "text-teal-600",   bg: "bg-teal-100"   },
    transfer_in:  { icon: ArrowDownToLine, color: "text-green-600",  bg: "bg-green-100"  },
    transfer_out: { icon: ArrowUpFromLine, color: "text-red-500",    bg: "bg-red-100"    },
    trade_open:   { icon: Activity,        color: "text-blue-600",   bg: "bg-blue-100"   },
    trade_profit: { icon: TrendingUp,      color: "text-green-600",  bg: "bg-green-100"  },
    trade_loss:   { icon: ArrowUpFromLine, color: "text-red-500",    bg: "bg-red-100"    },
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* KYC banner */}
        {!kycApproved && !loading && (
          <div className={`flex items-start sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5
            ${kycPending ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle size={18} className={`flex-shrink-0 mt-0.5 sm:mt-0 ${kycPending ? "text-amber-500" : "text-blue-500"}`} />
              <div>
                <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {kycPending ? "KYC verification pending" : "Identity verification required"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {kycPending
                    ? "Your documents are under review. Withdrawals will be enabled once approved."
                    : "Complete identity verification to unlock withdrawals and full platform access."}
                </p>
              </div>
            </div>
            {!kycPending && (
              <button onClick={() => navigate("/dashboard/kyc")}
                className="flex-shrink-0 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Verify Now
              </button>
            )}
          </div>
        )}

        {/* Greeting */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Good day, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Here's an overview of your TradeX account.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Balance */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/30 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Wallet size={15} className="text-blue-200" />
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Total Balance
                </p>
              </div>
              <p className="text-3xl font-extrabold" style={{ fontFamily: "'Sora', sans-serif" }}>
                ${loading ? "—" : balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-200 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Available funds</p>
            </div>
          </div>

          {/* KYC Status */}
          <div className={`rounded-2xl p-5 border ${kycApproved ? "bg-green-50 border-green-100" : kycPending ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className={kycApproved ? "text-green-600" : kycPending ? "text-amber-500" : "text-slate-400"} />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                KYC Status
              </p>
            </div>
            <p className={`text-2xl font-bold ${kycApproved ? "text-green-700" : kycPending ? "text-amber-700" : "text-slate-500"}`}
              style={{ fontFamily: "'Sora', sans-serif" }}>
              {kycApproved ? "Verified" : kycPending ? "Pending" : "Unverified"}
            </p>
            <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {kycApproved ? "Full access enabled" : "Complete to unlock withdrawals"}
            </p>
          </div>

          {/* Active investments */}
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-purple-600" />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Investments
              </p>
            </div>
            <p className="text-2xl font-bold text-purple-700" style={{ fontFamily: "'Sora', sans-serif" }}>
              <button onClick={() => navigate("/dashboard/investments")} className="hover:underline">
                View Plans →
              </button>
            </p>
            <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>Track active returns</p>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Quick Actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ArrowDownToLine, label: "Deposit",      desc: "Add funds",      path: "/dashboard/deposit",   color: "bg-blue-600   shadow-blue-200"   },
              { icon: TrendingUp,      label: "Invest",       desc: "View plans",     path: "/dashboard/plans",     color: "bg-green-600  shadow-green-200"  },
              { icon: ArrowUpFromLine, label: "Withdraw",     desc: "Cash out",       path: "/dashboard/withdraw",  color: "bg-purple-600 shadow-purple-200" },
              { icon: Activity,        label: "Trade",        desc: "Live market",    path: "/dashboard/trade",     color: "bg-orange-500 shadow-orange-200" },
              { icon: ArrowLeftRight,  label: "Swap",         desc: "Exchange crypto",path: "/dashboard/swap",      color: "bg-teal-600   shadow-teal-200"   },
              { icon: ArrowDownToLine, label: "Transfer",     desc: "Send funds",     path: "/dashboard/transfer",  color: "bg-indigo-600 shadow-indigo-200" },
              { icon: FileText,        label: "Transactions", desc: "View history",   path: "/dashboard/transactions", color: "bg-slate-700 shadow-slate-200"  },
              { icon: ShieldCheck,     label: "KYC",          desc: "Verify identity",path: "/dashboard/kyc",       color: "bg-rose-500   shadow-rose-200"   },
            ].map(({ icon: Icon, label, desc, path, color }) => (
              <button key={label} onClick={() => navigate(path)}
                className={`flex flex-col items-start gap-3 p-4 rounded-2xl text-white shadow-lg transition-all duration-200 active:scale-[0.97] text-left ${color}`}>
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon size={17} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>{label}</p>
                  <p className="text-xs text-white/70 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              Recent Activity
            </p>
            <button onClick={() => navigate("/dashboard/transactions")}
              className="text-xs text-blue-600 font-semibold hover:underline" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              View all
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : recentTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                <FileText size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No activity yet
              </p>
              <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your transaction history will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTxns.map(t => {
                const meta = TYPE_ICON[t.type] || { icon: FileText, color: "text-slate-500", bg: "bg-slate-100" };
                const Icon = meta.icon;
                const isPositive = ["deposit", "profit", "transfer_in", "trade_profit"].includes(t.type);
                return (
                  <div key={t._id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon size={15} className={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 capitalize truncate"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {t.type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-slate-400 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {t.description || "—"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}
                        style={{ fontFamily: "'Sora', sans-serif" }}>
                        {isPositive ? "+" : "-"}${Number(t.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}