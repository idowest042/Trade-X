import { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Sparkles,
  FileText,
  ChevronDown,
} from "lucide-react";
import api from "../../lib/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const METHOD_LABELS = {
  usdt_trc20: "USDT (TRC20)",
  usdt_erc20: "USDT (ERC20)",
  usdt_bep20: "USDT (BEP20)",
  btc:        "Bitcoin (BTC)",
  eth:        "Ethereum (ETH)",
  sol:        "Solana (SOL)",
};

const PLAN_LABELS = {
  starter: "Starter Plan",
  growth:  "Growth Plan",
  elite:   "Elite Plan",
};

function StatusBadge({ status }) {
  const map = {
    pending:   { cls: "bg-amber-100 text-amber-700",  label: "Pending"   },
    approved:  { cls: "bg-green-100 text-green-700",  label: "Approved"  },
    rejected:  { cls: "bg-red-100   text-red-600",    label: "Rejected"  },
    active:    { cls: "bg-blue-100  text-blue-700",   label: "Active"    },
    completed: { cls: "bg-slate-100 text-slate-600",  label: "Completed" },
  };
  const s = map[status] || { cls: "bg-slate-100 text-slate-500", label: status };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {s.label}
    </span>
  );
}

function TypeIcon({ type }) {
  const cfg = {
    deposit:    { icon: ArrowDownToLine, bg: "bg-green-100",  color: "text-green-600"  },
    withdrawal: { icon: ArrowUpFromLine, bg: "bg-red-100",    color: "text-red-500"    },
    investment: { icon: TrendingUp,      bg: "bg-blue-100",   color: "text-blue-600"   },
    profit:     { icon: Sparkles,        bg: "bg-purple-100", color: "text-purple-600" },
  };
  const c = cfg[type] || { icon: FileText, bg: "bg-slate-100", color: "text-slate-500" };
  const Icon = c.icon;
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
      <Icon size={15} className={c.color} />
    </div>
  );
}

function fmt(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fmtTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Table for deposits ───────────────────────────────────────────────────────
function DepositTable({ items, loading }) {
  if (loading) return <TableSkeleton />;
  if (!items.length) return <EmptyState label="No deposits found" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Method", "Amount", "Status", "Date"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <TypeIcon type="deposit" />
                  <span className="font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {METHOD_LABELS[t.method] || t.method || "—"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-bold text-green-600" style={{ fontFamily: "'Sora', sans-serif" }}>
                  +${Number(t.amount).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3.5 text-slate-400 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span>{fmt(t.createdAt)}</span>
                <span className="block text-slate-300">{fmtTime(t.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Table for withdrawals ────────────────────────────────────────────────────
function WithdrawalTable({ items, loading }) {
  if (loading) return <TableSkeleton />;
  if (!items.length) return <EmptyState label="No withdrawals found" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Method", "Amount", "Wallet", "Status", "Date"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <TypeIcon type="withdrawal" />
                  <span className="font-medium text-slate-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {METHOD_LABELS[t.method] || t.method || "—"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-bold text-red-500" style={{ fontFamily: "'Sora', sans-serif" }}>
                  -${Number(t.amount).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span className="font-mono text-xs text-slate-400">
                  {t.description?.includes("→") ? t.description.split("→")[1]?.trim()?.slice(0, 14) + "…" : "—"}
                </span>
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3.5 text-slate-400 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span>{fmt(t.createdAt)}</span>
                <span className="block text-slate-300">{fmtTime(t.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Table for others (investment + profit) ────────────────────────────────────
function OthersTable({ items, loading }) {
  if (loading) return <TableSkeleton />;
  if (!items.length) return <EmptyState label="No other transactions found" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {["Type", "Description", "Amount", "Status", "Date"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(t => (
            <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <TypeIcon type={t.type} />
                  <span className="font-semibold text-slate-700 capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {t.type}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="text-slate-500 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {t.description || "—"}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <span
                  className={`font-bold ${t.type === "profit" ? "text-purple-600" : "text-blue-600"}`}
                  style={{ fontFamily: "'Sora', sans-serif" }}>
                  {t.type === "investment" ? "-" : "+"}${Number(t.amount).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3.5 text-slate-400 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span>{fmt(t.createdAt)}</span>
                <span className="block text-slate-300">{fmtTime(t.createdAt)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Shared empty + skeleton ──────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
        <FileText size={18} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
      <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Your records will appear here once activity begins.
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse p-4 space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-8 h-8 bg-slate-100 rounded-xl flex-shrink-0" />
          <div className="flex-1 h-3 bg-slate-100 rounded" />
          <div className="w-16 h-3 bg-slate-100 rounded" />
          <div className="w-16 h-3 bg-slate-100 rounded" />
          <div className="w-20 h-3 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "deposits",    label: "Deposits",    icon: ArrowDownToLine },
  { id: "withdrawals", label: "Withdrawals", icon: ArrowUpFromLine  },
  { id: "others",      label: "Others",      icon: Sparkles        },
];

export default function TransactionsPage() {
  const [tab, setTab]             = useState("deposits");
  const [transactions, setTxns]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/api/transactions/my")
      .then(({ data }) => setTxns(data.transactions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deposits    = transactions.filter(t => t.type === "deposit");
  const withdrawals = transactions.filter(t => t.type === "withdrawal");
  const others      = transactions.filter(t => t.type === "investment" || t.type === "profit");

  const countMap = { deposits: deposits.length, withdrawals: withdrawals.length, others: others.length };

  // Summary totals
  const totalDeposited  = deposits.filter(t => t.status === "approved").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn  = withdrawals.filter(t => t.status === "approved").reduce((s, t) => s + t.amount, 0);
  const totalProfit     = others.filter(t => t.type === "profit").reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
            Transaction History
          </h1>
          <p className="text-sm text-slate-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            A complete ledger of all your account activity.
          </p>
        </div>

        {/* Summary row */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Deposited",  val: `$${totalDeposited.toLocaleString()}`,  color: "text-green-600",  bg: "bg-green-50",  border: "border-green-100"  },
              { label: "Total Withdrawn",  val: `$${totalWithdrawn.toLocaleString()}`,  color: "text-red-500",    bg: "bg-red-50",    border: "border-red-100"    },
              { label: "Total Profit",     val: `$${totalProfit.toLocaleString()}`,     color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
            ].map(({ label, val, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-2xl px-5 py-4`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
                <p className={`text-xl font-bold ${color}`} style={{ fontFamily: "'Sora', sans-serif" }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all
                  ${tab === id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <Icon size={15} />
                {label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                  ${tab === id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                  {countMap[id]}
                </span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[300px]">
            {tab === "deposits"    && <DepositTable    items={deposits}    loading={loading} />}
            {tab === "withdrawals" && <WithdrawalTable items={withdrawals} loading={loading} />}
            {tab === "others"      && <OthersTable     items={others}      loading={loading} />}
          </div>

          {/* Pagination placeholder */}
          {!loading && transactions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Showing {countMap[tab]} {tab} records
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}