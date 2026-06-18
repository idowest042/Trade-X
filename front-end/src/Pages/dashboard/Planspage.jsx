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
  Star,
} from "lucide-react";
import { toast } from "sonner";
import useAuthStore from "../../stores/useAuthStore";
import api from "../../lib/api";

// ─── Plan config (mirrors backend) ───────────────────────────────────────────
const PLANS = [
  {
    id:       "starter",
    name:     "Starter Plan",
    roi:      3,
    duration: 6,
    min:      100,
    max:      1999,
    color:    "blue",
    badge:    null,
    perks:    ["3% daily returns", "6-day duration", "Instant activation", "24/7 support"],
  },
  {
    id:       "growth",
    name:     "Growth Plan",
    roi:      4,
    duration: 7,
    min:      2000,
    max:      4999,
    color:    "indigo",
    badge:    "Popular",
    perks:    ["4% daily returns", "7-day duration", "Priority processing", "Dedicated support"],
  },
  {
    id:       "elite",
    name:     "Elite Plan",
    roi:      6,
    duration: 14,
    min:      5000,
    max:      19999,
    color:    "purple",
    badge:    "Best Returns",
    perks:    ["6% daily returns", "14-day duration", "VIP processing", "Account manager"],
  },
];

const colorMap = {
  blue:   { grad: "from-blue-500 to-blue-700",     ring: "ring-blue-500",   btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",   badge: "bg-blue-100 text-blue-700",   accent: "text-blue-600",  bg: "bg-blue-50"   },
  indigo: { grad: "from-indigo-500 to-indigo-700", ring: "ring-indigo-500", btn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200", badge: "bg-indigo-100 text-indigo-700", accent: "text-indigo-600", bg: "bg-indigo-50" },
  purple: { grad: "from-purple-500 to-purple-700", ring: "ring-purple-500", btn: "bg-purple-600 hover:bg-purple-700 shadow-purple-200", badge: "bg-purple-100 text-purple-700", accent: "text-purple-600", bg: "bg-purple-50" },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────
function PlanCard({ plan, balance, onPurchase, loading }) {
  const [amount, setAmount] = useState("");
  const c = colorMap[plan.color];

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
    <div className={`relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col transition-all duration-200
      ${plan.badge ? `ring-2 ${c.ring} border-transparent` : "border-slate-100 hover:border-slate-200"}`}>

      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Star size={10} fill="currentColor" />
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header gradient */}
      <div className={`bg-gradient-to-br ${c.grad} px-6 pt-6 pb-8`}>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {plan.name}
        </p>
        <div className="flex items-end gap-1">
          <span className="text-5xl font-extrabold text-white leading-none"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            {plan.roi}%
          </span>
          <span className="text-white/70 text-sm mb-1 font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            / day
          </span>
        </div>
      </div>

      {/* Divider wave */}
      <div className={`h-3 bg-gradient-to-br ${c.grad}`}>
        <div className="h-3 bg-white rounded-t-2xl" />
      </div>

      <div className="px-6 pb-6 flex flex-col flex-1 gap-4">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Clock,       label: "Duration",  val: `${plan.duration} days`              },
            { icon: DollarSign,  label: "Min Entry", val: `$${plan.min.toLocaleString()}`      },
            { icon: TrendingUp,  label: "Max Entry", val: `$${plan.max.toLocaleString()}`      },
            { icon: Zap,         label: "Total ROI", val: `${plan.roi * plan.duration}%`       },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className={`${c.bg} rounded-xl px-3 py-2.5`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon size={11} className={c.accent} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {label}
                </p>
              </div>
              <p className={`text-sm font-bold ${c.accent}`}
                style={{ fontFamily: "'Sora', sans-serif" }}>
                {val}
              </p>
            </div>
          ))}
        </div>

        {/* Perks */}
        <ul className="space-y-1.5">
          {plan.perks.map(perk => (
            <li key={perk} className="flex items-center gap-2">
              <CheckCircle2 size={13} className={`flex-shrink-0 ${c.accent}`} />
              <span className="text-xs text-slate-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {perk}
              </span>
            </li>
          ))}
        </ul>

        {/* Amount input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
            <input
              type="number"
              min={plan.min}
              max={plan.max}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`${plan.min.toLocaleString()} – ${plan.max.toLocaleString()}`}
              className={`w-full pl-7 pr-3 py-2.5 rounded-xl border text-slate-900 text-sm bg-slate-50
                focus:outline-none focus:ring-2 focus:bg-white transition-all
                ${amountError ? "border-red-300 focus:ring-red-400" : "border-slate-200 focus:ring-blue-500 focus:border-transparent"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
          {amountError && (
            <p className="flex items-center gap-1.5 text-xs text-red-500"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <AlertCircle size={11} />
              {amountError}
            </p>
          )}
        </div>

        {/* Return preview */}
        {parsed >= plan.min && !amountError && (
          <div className={`${c.bg} rounded-xl px-4 py-3 space-y-1.5 border border-white`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Projected Returns
            </p>
            {[
              ["Daily Return",  `$${dailyReturn.toFixed(2)}`],
              ["Total Profit",  `$${totalReturn.toFixed(2)}`],
              ["Total Payout",  `$${totalPayout.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="text-slate-500">{k}</span>
                <span className={`font-bold ${c.accent}`}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onPurchase(plan, amount)}
          disabled={!canBuy || loading}
          className={`mt-auto w-full flex items-center justify-center gap-2 text-white font-semibold text-sm py-3.5 rounded-xl
            transition-all duration-200 active:scale-[0.98] shadow-lg
            disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
            ${canBuy ? `${c.btn}` : ""}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
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
            <><Zap size={15} /> Join Now</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Active Investment Card ───────────────────────────────────────────────────
function ActiveCard({ inv }) {
  const plan = PLANS.find(p => p.id === inv.planType);
  const c    = colorMap[plan?.color || "blue"];

  const start    = new Date(inv.startDate);
  const end      = new Date(inv.endDate);
  const now      = new Date();
  const elapsed  = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, inv.duration - elapsed);
  const progress = Math.min(100, (elapsed / inv.duration) * 100);
  const earned   = Math.min(inv.dailyReturn * elapsed, inv.totalReturn);

  return (
    <div className={`bg-white rounded-2xl border-2 ${c.ring.replace("ring-", "border-")} p-5 space-y-4`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Active
            </span>
          </div>
          <p className="text-base font-bold text-slate-900 mt-1"
            style={{ fontFamily: "'Sora', sans-serif" }}>
            {plan?.name || inv.planType}
          </p>
        </div>
        <p className="text-xl font-extrabold text-slate-900"
          style={{ fontFamily: "'Sora', sans-serif" }}>
          ${Number(inv.amount).toLocaleString()}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1.5"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <span>Progress</span>
          <span>{elapsed} / {inv.duration} days</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${c.grad} rounded-full transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Daily Return", val: `$${inv.dailyReturn.toFixed(2)}`  },
          { label: "Earned So Far", val: `$${earned.toFixed(2)}`          },
          { label: "Total Profit",  val: `$${inv.totalReturn.toFixed(2)}` },
          { label: "Days Left",     val: daysLeft > 0 ? `${daysLeft}d`  : "Complete" },
        ].map(({ label, val }) => (
          <div key={label} className={`${c.bg} rounded-xl px-3 py-2.5`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {label}
            </p>
            <p className={`text-sm font-bold ${c.accent}`}
              style={{ fontFamily: "'Sora', sans-serif" }}>
              {val}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span>Started: {start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        <span>Ends: {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PlansPage() {
  const navigate          = useNavigate();
  const { user }          = useAuthStore();
  const balance           = user?.balance ?? 0;

  const [investments, setInvestments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [buying,      setBuying]      = useState(false);
  const [activeTab,   setActiveTab]   = useState("plans"); // "plans" | "active"

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
        description: `$${amount.toLocaleString()} invested in ${plan.name}. Returns start accruing today.`,
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900"
              style={{ fontFamily: "'Sora', sans-serif" }}>
              Investment Plans
            </h1>
            <p className="text-sm text-slate-500 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Choose a plan and start earning daily returns on your capital.
            </p>
          </div>

          {/* Balance pill */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 self-start">
            <DollarSign size={14} className="text-blue-500" />
            <div>
              <p className="text-xs text-blue-500 font-medium leading-none"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Available
              </p>
              <p className="text-base font-bold text-blue-700 leading-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}>
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Insufficient balance notice */}
        {balance < 100 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Your balance is too low to invest
              </p>
              <p className="text-xs text-amber-600 mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                You need at least $100 to activate the Starter Plan.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/deposit")}
              className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <ArrowDownToLine size={12} />
              Deposit
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "plans",  label: "Available Plans", icon: TrendingUp },
            { id: "active", label: `My Investments${activeInvestments.length ? ` (${activeInvestments.length})` : ""}`, icon: Briefcase },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${activeTab === id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Plans tab ─────────────────────────────────────────────── */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : activeInvestments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Briefcase size={24} className="text-slate-400" />
                </div>
                <p className="text-base font-semibold text-slate-700 mb-1"
                  style={{ fontFamily: "'Sora', sans-serif" }}>
                  No active investments
                </p>
                <p className="text-sm text-slate-400 mb-5 max-w-xs"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  You do not have an investment plan at the moment. Browse plans and start earning.
                </p>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  <TrendingUp size={15} />
                  Browse Plans
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
    </>
  );
}