import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Clock,
  DollarSign,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowDownToLine,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useauthstore";
import api from "../../lib/api";

// ─── Plan config (mirrors backend) ───────────────────────────────────────────
const PLANS = [
  {
    id:       "starter",
    name:     "Starter",
    roi:      3,
    duration: 6,
    min:      100,
    max:      1999,
    accent:   "border-t-slate-400",
    badge:    null,
    perks:    ["3% daily returns", "6-day duration", "Instant activation", "24/7 support"],
  },
  {
    id:       "growth",
    name:     "Growth",
    roi:      4,
    duration: 7,
    min:      2000,
    max:      4999,
    accent:   "border-t-blue-600",
    badge:    "Most chosen",
    perks:    ["4% daily returns", "7-day duration", "Priority processing", "Dedicated support"],
  },
  {
    id:       "elite",
    name:     "Elite",
    roi:      6,
    duration: 14,
    min:      5000,
    max:      19999,
    accent:   "border-t-slate-900",
    badge:    "Highest yield",
    perks:    ["6% daily returns", "14-day duration", "VIP processing", "Account manager"],
  },
];

const money = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, balance, onPurchase, loading }) {
  const [amount, setAmount] = useState("");

  const parsed      = parseFloat(amount) || 0;
  const dailyReturn = parsed * plan.roi / 100;
  const totalReturn = dailyReturn * plan.duration;
  const totalPayout = parsed + totalReturn;

  const amountError = (() => {
    if (!amount) return null;
    if (parsed < plan.min) return `Minimum investment is $${plan.min.toLocaleString()}.`;
    if (parsed > plan.max) return `Maximum investment is $${plan.max.toLocaleString()}.`;
    if (parsed > balance)  return "Insufficient balance.";
    return null;
  })();

  const canBuy = parsed >= plan.min && parsed <= plan.max && parsed <= balance && !loading;

  return (
    <div className={`bg-white rounded-lg border border-slate-200 border-t-2 ${plan.accent} flex flex-col`}>

      <div className="px-6 pt-5 pb-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-500">{plan.name} Plan</p>
          {plan.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
              {plan.badge}
            </span>
          )}
        </div>
        <div className="flex items-end gap-1.5">
          <span className="text-4xl font-semibold text-slate-900 leading-none tabular-nums">
            {plan.roi}%
          </span>
          <span className="text-slate-400 text-sm mb-0.5">/ day</span>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col flex-1 gap-5">

        {/* Stats row — ledger cells, not colored tiles */}
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 border border-slate-100 rounded-md overflow-hidden">
          {[
            { icon: Clock,      label: "Duration",  val: `${plan.duration} days`         },
            { icon: DollarSign, label: "Min entry",  val: `$${plan.min.toLocaleString()}` },
            { icon: TrendingUp, label: "Max entry",  val: `$${plan.max.toLocaleString()}` },
            { icon: Zap,        label: "Total ROI",  val: `${plan.roi * plan.duration}%`  },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={11} className="text-slate-400" />
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
              </div>
              <p className="text-sm font-semibold text-slate-800 tabular-nums">{val}</p>
            </div>
          ))}
        </div>

        {/* Perks */}
        <ul className="space-y-1.5">
          {plan.perks.map(perk => (
            <li key={perk} className="flex items-center gap-2">
              <CheckCircle2 size={13} className="flex-shrink-0 text-slate-400" />
              <span className="text-xs text-slate-600">{perk}</span>
            </li>
          ))}
        </ul>

        {/* Amount input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide">
            Investment amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              min={plan.min}
              max={plan.max}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`${plan.min.toLocaleString()} – ${plan.max.toLocaleString()}`}
              className={`w-full pl-7 pr-3 py-2.5 rounded-md border text-slate-900 text-sm bg-white tabular-nums
                focus:outline-none focus:ring-1 transition-colors
                ${amountError ? "border-rose-300 focus:ring-rose-400" : "border-slate-200 focus:ring-slate-400 focus:border-slate-400"}`}
            />
          </div>
          {amountError && (
            <p className="flex items-center gap-1.5 text-xs text-rose-600">
              <AlertCircle size={11} />
              {amountError}
            </p>
          )}
        </div>

        {/* Return preview */}
        {parsed >= plan.min && !amountError && (
          <div className="border border-slate-200 rounded-md px-4 py-3 space-y-1.5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Projected returns
            </p>
            {[
              ["Daily return", `$${dailyReturn.toFixed(2)}`],
              ["Total profit", `$${totalReturn.toFixed(2)}`],
              ["Total payout", `$${totalPayout.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-800 tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA — one consistent accent across all tiers */}
        <button
          onClick={() => onPurchase(plan, amount)}
          disabled={!canBuy || loading}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 rounded-md transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing…
            </>
          ) : (
            <>Activate plan</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Active Investment Card ───────────────────────────────────────────────────
function ActiveCard({ inv }) {
  const plan = PLANS.find(p => p.id === inv.planType);

  const start    = new Date(inv.startDate);
  const end      = new Date(inv.endDate);
  const now      = new Date();
  const elapsed  = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, inv.duration - elapsed);
  const progress = Math.min(100, (elapsed / inv.duration) * 100);
  const earned   = Math.min(inv.dailyReturn * elapsed, inv.totalReturn);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
            Active
          </span>
          <p className="text-base font-semibold text-slate-900 mt-1.5">
            {plan?.name || inv.planType} Plan
          </p>
        </div>
        <p className="text-xl font-semibold text-slate-900 tabular-nums">
          ${Number(inv.amount).toLocaleString()}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="tabular-nums">{elapsed} / {inv.duration} days</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 border border-slate-100 rounded-md overflow-hidden">
        {[
          { label: "Daily return",  val: `$${inv.dailyReturn.toFixed(2)}` },
          { label: "Earned so far", val: `$${earned.toFixed(2)}`, positive: true },
          { label: "Total profit",  val: `$${inv.totalReturn.toFixed(2)}` },
          { label: "Days left",     val: daysLeft > 0 ? `${daysLeft}d` : "Complete" },
        ].map(({ label, val, positive }) => (
          <div key={label} className="px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
            <p className={`text-sm font-semibold tabular-nums ${positive ? "text-emerald-600" : "text-slate-800"}`}>
              {val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Started {start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        <span>Ends {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const balance   = user?.balance ?? 0;

  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [buying,      setBuying]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("plans");

  useEffect(() => {
    api.get("/api/investments/my")
      .then(({ data }) => setInvestments(data.investments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeInvestments = investments.filter(i => i.status === "active");

  const handlePurchase = async (plan, amountStr) => {
    const amount = parseFloat(amountStr);

    if (!amount || amount < plan.min || amount > plan.max) {
      toast.error("Invalid amount", {
        description: `Enter an amount between $${plan.min.toLocaleString()} and $${plan.max.toLocaleString()}.`,
      });
      return;
    }

    if (amount > balance) {
      toast.error("Insufficient balance", {
        description: "Your account balance is insufficient to purchase this plan. Please make a deposit.",
      });
      setTimeout(() => navigate("/dashboard/deposit"), 1800);
      return;
    }

    setBuying(true);
    const toastId = toast.loading("Activating your investment plan…");

    try {
      const { data } = await api.post("/api/investments/create", {
        planType: plan.id,
        amount,
      });

      toast.success("Investment activated!", {
        id: toastId,
        description: `$${amount.toLocaleString()} invested in ${plan.name} Plan. Returns start accruing today.`,
      });

      setInvestments(prev => [data.investment, ...prev]);
      setActiveTab("active");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to activate plan. Please try again.";
      toast.error("Activation failed", { id: toastId, description: msg });
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Investment plans</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Choose a plan and start earning daily returns on your capital.
          </p>
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2.5 self-start">
          <DollarSign size={14} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-400 font-medium leading-none">Available</p>
            <p className="text-base font-semibold text-slate-900 leading-tight tabular-nums">
              ${money(balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Insufficient balance notice */}
      {balance < 100 && (
        <div className="flex items-start gap-3 border-l-2 border-amber-400 bg-amber-50/60 rounded p-4">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Your balance is too low to invest</p>
            <p className="text-xs text-amber-700 mt-0.5">
              You need at least $100 to activate the Starter Plan.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/deposit")}
            className="flex-shrink-0 flex items-center gap-1.5 border border-amber-300 text-amber-800 hover:bg-amber-100 text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            <ArrowDownToLine size={12} />
            Deposit
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 w-fit">
        {[
          { id: "plans",  label: "Available plans" },
          { id: "active", label: `My investments${activeInvestments.length ? ` (${activeInvestments.length})` : ""}` },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Plans tab ─────────────────────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              balance={balance}
              onPurchase={handlePurchase}
              loading={buying}
            />
          ))}
        </div>
      )}

      {/* ── Active tab ────────────────────────────────────────────── */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-44 bg-white rounded-lg border border-slate-200" />
              ))}
            </div>
          ) : activeInvestments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-slate-200">
              <div className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center mb-4">
                <Briefcase size={20} className="text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-1">No active investments</p>
              <p className="text-sm text-slate-400 mb-5 max-w-xs">
                You do not have an investment plan at the moment. Browse plans and start earning.
              </p>
              <button
                onClick={() => setActiveTab("plans")}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              >
                <TrendingUp size={15} />
                Browse plans
              </button>
            </div>
          ) : (
            activeInvestments.map(inv => (
              <ActiveCard key={inv._id} inv={inv} />
            ))
          )}
        </div>
      )}
    </div>
  );
}