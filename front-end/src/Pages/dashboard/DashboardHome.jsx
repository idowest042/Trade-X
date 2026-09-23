import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import {
  ArrowDownToLine, ArrowUpFromLine, TrendingUp,
  ArrowLeftRight, Wallet, ShieldCheck, FileText,
  AlertCircle, Activity, ArrowRight,
} from "lucide-react";
import useAuthStore  from "../../stores/useauthstore";
import api           from "../../lib/api";
import { getSocket } from "../../stores/socket";

const QUICK_ACTIONS = [
  { icon: ArrowDownToLine, label: "Deposit",      path: "/dashboard/deposit"      },
  { icon: TrendingUp,      label: "Invest",       path: "/dashboard/plans"        },
  { icon: ArrowUpFromLine, label: "Withdraw",     path: "/dashboard/withdraw"     },
  { icon: ArrowLeftRight,  label: "Swap",         path: "/dashboard/swap"         },
  { icon: ArrowDownToLine, label: "Transfer",     path: "/dashboard/transfer"     },
  { icon: FileText,        label: "Transactions", path: "/dashboard/transactions" },
  { icon: ShieldCheck,     label: "KYC",          path: "/dashboard/kyc"          },
];

const TYPE_META = {
  deposit:      { icon: ArrowDownToLine, positive: true  },
  withdrawal:   { icon: ArrowUpFromLine, positive: false },
  investment:   { icon: TrendingUp,      positive: false },
  profit:       { icon: TrendingUp,      positive: true  },
  swap:         { icon: ArrowLeftRight,  positive: null  },
  transfer_in:  { icon: ArrowDownToLine, positive: true  },
  transfer_out: { icon: ArrowUpFromLine, positive: false },
  trade_open:   { icon: Activity,        positive: null  },
  trade_profit: { icon: TrendingUp,      positive: true  },
  trade_loss:   { icon: ArrowUpFromLine, positive: false },
};

const money = (n) =>
  Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function DashboardHome() {
  const navigate        = useNavigate();
  const { user, token } = useAuthStore();

  const [balance,    setBalance]    = useState(user?.balance ?? 0);
  const [kycStatus,  setKycStatus]  = useState(user?.isKycVerified ? "approved" : null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading,    setLoading]    = useState(true);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Account overview and recent activity
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Markets live
        </div>
      </div>

      {/* KYC notice — a status line, not a colored card */}
      {!kycApproved && !loading && (
        <div className={`flex items-start sm:items-center justify-between gap-4 border-l-2 pl-4 pr-4 py-3
          ${kycPending ? "border-amber-400 bg-amber-50/60" : "border-blue-500 bg-blue-50/60"}`}>
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle size={16} className={`flex-shrink-0 mt-0.5 sm:mt-0 ${kycPending ? "text-amber-500" : "text-blue-500"}`} />
            <div>
              <p className="text-sm font-medium text-slate-800">
                {kycPending ? "KYC verification pending" : "Identity verification required"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {kycPending
                  ? "Your documents are under review. Withdrawals will be enabled once approved."
                  : "Complete identity verification to unlock withdrawals and full platform access."}
              </p>
            </div>
          </div>
          {!kycPending && (
            <button
              onClick={() => navigate("/dashboard/kyc")}
              className="flex-shrink-0 text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Verify now <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}

      {/* Account summary — one ledger-style panel instead of three colored tiles */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="px-6 py-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <Wallet size={13} /> Total balance
            </div>
            <p className="text-2xl font-semibold text-slate-900 mt-2 tabular-nums">
              {loading ? "—" : `$${money(balance)}`}
            </p>
            <p className="text-xs text-slate-400 mt-1">Available funds</p>
          </div>

          <div className="px-6 py-5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <ShieldCheck size={13} /> KYC status
            </div>
            <p className={`text-2xl font-semibold mt-2 ${
              kycApproved ? "text-emerald-600" : kycPending ? "text-amber-600" : "text-slate-400"
            }`}>
              {kycApproved ? "Verified" : kycPending ? "Pending" : "Unverified"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {kycApproved ? "Full access enabled" : "Required for withdrawals"}
            </p>
          </div>

          <div className="px-6 py-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <TrendingUp size={13} /> Investments
            </div>
            <button
              onClick={() => navigate("/dashboard/investments")}
              className="text-2xl font-semibold text-slate-900 mt-2 hover:text-blue-600 transition-colors flex items-center gap-1.5"
            >
              View plans <ArrowRight size={16} />
            </button>
            <p className="text-xs text-slate-400 mt-1">Track active returns</p>
          </div>
        </div>
      </div>

      {/* Quick actions — one consistent style, not eight colors */}
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {QUICK_ACTIONS.map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 transition-colors"
            >
              <Icon size={18} className="text-slate-700" strokeWidth={1.75} />
              <span className="text-[11px] font-medium text-slate-600 leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity — a ledger, not a card feed */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-medium text-slate-800">Recent activity</p>
          <button
            onClick={() => navigate("/dashboard/transactions")}
            className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-slate-100 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                </div>
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : recentTxns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center mb-3">
              <FileText size={17} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No activity yet</p>
            <p className="text-xs text-slate-400">Your transaction history will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100">
                <th className="px-5 py-2 font-medium">Type</th>
                <th className="px-5 py-2 font-medium hidden sm:table-cell">Description</th>
                <th className="px-5 py-2 font-medium text-right">Amount</th>
                <th className="px-5 py-2 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTxns.map((t) => {
                const meta = TYPE_META[t.type] || { icon: FileText, positive: null };
                const Icon = meta.icon;
                const isPositive = meta.positive === true;
                const isNegative = meta.positive === false;
                return (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className="text-slate-400 flex-shrink-0" strokeWidth={1.75} />
                        <span className="font-medium text-slate-800 capitalize">
                          {t.type.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 hidden sm:table-cell truncate max-w-[240px]">
                      {t.description || "—"}
                    </td>
                    <td className={`px-5 py-3 text-right font-semibold tabular-nums ${
                      isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-slate-700"
                    }`}>
                      {isPositive ? "+" : isNegative ? "-" : ""}${money(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 text-xs whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}