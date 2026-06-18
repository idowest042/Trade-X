import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import api from "../../lib/api";

// ─── Plan meta ────────────────────────────────────────────────────────────────
const PLAN_META = {
  starter: { name: "Starter Plan", color: "blue",   roi: 3,  duration: 6  },
  growth:  { name: "Growth Plan",  color: "indigo",  roi: 4,  duration: 7  },
  elite:   { name: "Elite Plan",   color: "purple",  roi: 6,  duration: 14 },
};

const colorMap = {
  blue:   { badge: "bg-blue-100 text-blue-700",     accent: "text-blue-600",   bg: "bg-blue-50",   grad: "from-blue-500 to-blue-700",   border: "border-blue-200"   },
  indigo: { badge: "bg-indigo-100 text-indigo-700", accent: "text-indigo-600", bg: "bg-indigo-50", grad: "from-indigo-500 to-indigo-700", border: "border-indigo-200" },
  purple: { badge: "bg-purple-100 text-purple-700", accent: "text-purple-600", bg: "bg-purple-50", grad: "from-purple-500 to-purple-700", border: "border-purple-200" },
};

function StatusBadge({ status }) {
  return status === "active" ? (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <CheckCircle2 size={11} />
      Completed
    </span>
  );
}

function InvestmentCard({ inv }) {
  const meta   = PLAN_META[inv.planType] || { name: inv.planType, color: "blue" };
  const c      = colorMap[meta.color];
  const start  = new Date(inv.startDate);
  const end    = new Date(inv.endDate);
  const now    = new Date();
  const elapsed  = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.max(0, inv.duration - elapsed);
  const progress = Math.min(100, (elapsed / inv.duration) * 100);
  const earned   = Math.min(inv.dailyReturn * elapsed, inv.totalReturn);

  return (
    <div className={`bg-white rounded-2xl border-2 ${c.border} overflow-hidden`}>
      {/* Header strip */}
      <div className={`bg-gradient-to-r ${c.grad} px-5 py-3 flex items-center justify-between`}>
        <p className="text-white font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>
          {meta.name}
        </p>
        <StatusBadge status={inv.status} />
      </div>

      <div className="p-5 space-y-4">
        {/* Key stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Invested",     val: `$${Number(inv.amount).toLocaleString()}`,         icon: DollarSign  },
            { label: "Daily Return", val: `$${inv.dailyReturn.toFixed(2)}`,                   icon: TrendingUp  },
            { label: "Total Profit", val: `$${inv.totalReturn.toFixed(2)}`,                   icon: TrendingUp  },
            { label: inv.status === "active" ? "Days Left" : "Duration",
              val: inv.status === "active" ? `${daysLeft}d` : `${inv.duration} days`,         icon: Clock       },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className={`${c.bg} rounded-xl px-3 py-2.5`}>
              <div className="flex items-center gap-1 mb-0.5">
                <Icon size={10} className={c.accent} />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
              </div>
              <p className={`text-sm font-bold ${c.accent}`} style={{ fontFamily: "'Sora', sans-serif" }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Progress bar — only for active */}
        {inv.status === "active" && (
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span>Progress — Day {elapsed} of {inv.duration}</span>
              <span className={`font-semibold ${c.accent}`}>
                ${earned.toFixed(2)} earned
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${c.grad} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400"
          style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>Started: {start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
          <span className="text-slate-200">·</span>
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>{inv.status === "completed" ? "Ended" : "Ends"}:{" "}
              {end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {inv.status === "completed" && (
            <>
              <span className="text-slate-200">·</span>
              <span className="text-green-600 font-semibold">
                +${inv.totalReturn.toFixed(2)} returned
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyInvestments() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("all"); // all | active | completed

  useEffect(() => {
    api.get("/api/investments/my")
      .then(({ data }) => setInvestments(data.investments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = investments.filter(i => filter === "all" ? true : i.status === filter);
  const active    = investments.filter(i => i.status === "active").length;
  const completed = investments.filter(i => i.status === "completed").length;
  const totalInvested  = investments.reduce((s, i) => s + i.amount, 0);
  const totalProfitAll = investments.reduce((s, i) => s + i.totalReturn, 0);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            My Investments
          </h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Track all your active and completed investment plans.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && investments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Plans",     val: investments.length,                         color: "blue"   },
              { label: "Active",          val: active,                                      color: "green"  },
              { label: "Completed",       val: completed,                                   color: "slate"  },
              { label: "Total Invested",  val: `$${totalInvested.toLocaleString()}`,        color: "purple" },
            ].map(({ label, val, color }) => (
              <div key={label} className={`bg-white rounded-2xl border border-slate-100 p-4`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {label}
                </p>
                <p className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: "all",       label: `All (${investments.length})`  },
            { id: "active",    label: `Active (${active})`           },
            { id: "completed", label: `Completed (${completed})`     },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${filter === id ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-52 bg-white rounded-2xl border border-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} className="text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1" style={{ fontFamily: "'Sora', sans-serif" }}>
              {filter === "all" ? "No investment plans yet" : `No ${filter} investments`}
            </p>
            <p className="text-sm text-slate-400 mb-5 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {filter === "all"
                ? "You do not have an investment plan at the moment. Start growing your capital today."
                : `You have no ${filter} investments to display.`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/dashboard/plans")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <TrendingUp size={15} />
                Browse Plans
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(inv => <InvestmentCard key={inv._id} inv={inv} />)}
          </div>
        )}
      </div>
    </>
  );
}