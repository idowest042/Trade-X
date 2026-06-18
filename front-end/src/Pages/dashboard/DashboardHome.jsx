import { useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  TrendingUp,
  Wallet,
  ShieldCheck,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  AlertCircle,
} from "lucide-react";
// ✅ Correct import path
import useAuthStore from "../../stores/useauthstore";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const firstName = user?.name?.split(" ")[0] || "Trader";
  const balance = user?.balance ?? 0;
  const isKycVerified = user?.isKycVerified ?? false;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* KYC banner */}
      {!isKycVerified && (
        <div className="flex items-start sm:items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p
                className="text-sm font-semibold text-amber-800"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Identity verification required
              </p>
              <p
                className="text-xs text-amber-600 mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Complete KYC to unlock withdrawals and full platform access.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/kyc")}
            className="flex-shrink-0 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Greeting */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-900"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Good day, {firstName} 👋
        </h1>
        <p
          className="text-sm text-slate-500 mt-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Here's an overview of your account.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Balance"
          value={`$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          sub="Available funds"
          accent="blue"
          icon={Wallet}
        />
        <StatCard
          label="Active Investments"
          value="$0.00"
          sub="0 active plans"
          accent="green"
          icon={TrendingUp}
        />
        <StatCard
          label="KYC Status"
          value={isKycVerified ? "Verified" : "Pending"}
          sub={isKycVerified ? "Full access enabled" : "Verification required"}
          accent={isKycVerified ? "green" : "amber"}
          icon={ShieldCheck}
        />
      </div>

      {/* Quick actions */}
      <div>
        <p
          className="text-sm font-semibold text-slate-700 mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            icon={ArrowDownToLine}
            label="Deposit"
            description="Add funds"
            color="blue"
            onClick={() => navigate("/dashboard/deposit")}
          />
          <QuickAction
            icon={TrendingUp}
            label="Invest"
            description="View plans"
            color="green"
            onClick={() => navigate("/dashboard/plans")}
          />
          <QuickAction
            icon={ArrowUpFromLine}
            label="Withdraw"
            description="Cash out"
            color="purple"
            onClick={() => navigate("/dashboard/withdraw")}
          />
          <QuickAction
            icon={ArrowLeftRight}
            label="Swap"
            description="Exchange crypto"
            color="orange"
            onClick={() => navigate("/dashboard/swap")}
          />
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <p
            className="text-sm font-semibold text-slate-800"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Recent Transactions
          </p>
          <button
            onClick={() => navigate("/dashboard/transactions")}
            className="text-xs text-blue-600 font-medium hover:underline"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            View all
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
            <FileText size={22} className="text-slate-400" />
          </div>
          <p
            className="text-sm font-medium text-slate-600 mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No transactions yet
          </p>
          <p
            className="text-xs text-slate-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Your transaction history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const accentMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    value: "text-blue-700",
  },
  green: {
    bg: "bg-green-50",
    icon: "bg-green-100 text-green-600",
    value: "text-green-700",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    value: "text-amber-700",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-100 text-purple-600",
    value: "text-purple-700",
  },
};

function StatCard({ label, value, sub, accent, icon: Icon }) {
  const colors = accentMap[accent] || accentMap.blue;
  return (
    <div className={`${colors.bg} rounded-2xl p-5 border border-white`}>
      <div className="flex items-start justify-between mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {label}
        </p>
        <div className={`w-8 h-8 rounded-xl ${colors.icon} flex items-center justify-center`}>
          <Icon size={16} />
        </div>
      </div>
      <p
        className={`text-2xl font-bold ${colors.value}`}
        style={{ fontFamily: "'Sora', sans-serif" }}
      >
        {value}
      </p>
      <p
        className="text-xs text-slate-400 mt-1"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {sub}
      </p>
    </div>
  );
}

const quickColorMap = {
  blue: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
  green: "bg-green-600 hover:bg-green-700 shadow-green-200",
  purple: "bg-purple-600 hover:bg-purple-700 shadow-purple-200",
  orange: "bg-orange-500 hover:bg-orange-600 shadow-orange-200",
};

function QuickAction({ icon: Icon, label, description, color, onClick }) {
  const colorClass = quickColorMap[color] || quickColorMap.blue;
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-3 p-4 rounded-2xl ${colorClass} text-white shadow-lg transition-all duration-200 active:scale-[0.97] text-left`}
    >
      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <p
          className="text-sm font-semibold leading-tight"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-xs text-white/70 mt-0.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {description}
        </p>
      </div>
    </button>
  );
}