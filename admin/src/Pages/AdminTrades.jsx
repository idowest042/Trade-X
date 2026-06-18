import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, RefreshCw,
  ChevronUp, ChevronDown, DollarSign,
} from "lucide-react";
import { PageHeader, StatCard, Table, ActionBtn, fmt } from "../Components/AdminUI";
import api from "../lib/api";

const ASSET_COLORS = {
  BTC: "bg-orange-500",
  ETH: "bg-indigo-500",
  SOL: "bg-purple-500",
  BNB: "bg-yellow-500",
};

// ─── Adjust Modal ─────────────────────────────────────────────────────────────
function AdjustModal({ trade, onClose, onUpdate }) {
  const [type,    setType]    = useState("profit");
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) { toast.error("Enter a valid amount."); return; }

    setLoading(true);
    const tid = toast.loading(`Applying ${type} adjustment…`);
    try {
      const { data } = await api.put(`/api/trades/admin/${trade._id}/adjust`, {
        type,
        amount: val,
      });
      toast.success("Trade adjusted!", {
        id: tid,
        description: `$${val} ${type} applied. User balance updated in real time.`,
      });
      onUpdate(trade._id, data.trade);
      onClose();
    } catch (err) {
      toast.error("Failed", { id: tid, description: err.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  const user = trade.userId;
  const previewAmt = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-slate-900 px-5 py-4">
          <p className="font-bold text-white text-sm">Adjust Trade</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {trade.asset} &nbsp;·&nbsp; {trade.type?.toUpperCase()} &nbsp;·&nbsp;
            ${Number(trade.amount).toLocaleString()}
          </p>
        </div>

        <div className="p-5 space-y-4">

          {/* Trade + user info */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
            {[
              ["User",            user?.name    || "—"                                            ],
              ["Email",           user?.email   || "—"                                            ],
              ["Current Balance", `$${Number(user?.balance || 0).toLocaleString()}`,  "text-blue-600" ],
              ["Entry Price",     `$${Number(trade.entryPrice || 0).toLocaleString()}`             ],
              ["Current PnL",     `${(trade.profitLoss || 0) >= 0 ? "+" : ""}$${Number(trade.profitLoss || 0).toFixed(2)}`,
                                  (trade.profitLoss || 0) >= 0 ? "text-green-600" : "text-red-500"],
            ].map(([k, v, cls]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-500">{k}</span>
                <span className={`font-semibold text-slate-800 ${cls || ""}`}>{v}</span>
              </div>
            ))}
          </div>

          {/* Profit / Loss toggle */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: "profit", icon: ChevronUp,   label: "Add Profit", active: "border-green-500 bg-green-50 text-green-700" },
              { val: "loss",   icon: ChevronDown, label: "Apply Loss",  active: "border-red-500   bg-red-50   text-red-600"   },
            ].map(({ val, icon: Icon, label, active }) => (
              <button
                key={val}
                onClick={() => setType(val)}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                  ${type === val ? active : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Preview box */}
          {previewAmt > 0 && (
            <div className={`rounded-xl px-4 py-3 text-xs space-y-1 border
              ${type === "profit"
                ? "bg-green-50 border-green-100"
                : "bg-red-50 border-red-100"}`}>
              <p className={`font-bold ${type === "profit" ? "text-green-700" : "text-red-600"}`}>
                Preview
              </p>
              <div className="flex justify-between">
                <span className="text-slate-500">PnL change</span>
                <span className={`font-bold ${type === "profit" ? "text-green-700" : "text-red-600"}`}>
                  {type === "profit" ? "+" : "-"}${previewAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User balance</span>
                <span className={`font-bold ${type === "profit" ? "text-green-700" : "text-red-600"}`}>
                  {type === "profit" ? "+" : "-"}${previewAmt.toFixed(2)} instantly
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">New PnL (approx)</span>
                <span className="font-bold text-slate-700">
                  {type === "profit"
                    ? `$${((trade.profitLoss || 0) + previewAmt).toFixed(2)}`
                    : `$${((trade.profitLoss || 0) - previewAmt).toFixed(2)}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 flex gap-2 justify-end border-t border-slate-100 pt-4">
          <ActionBtn label="Cancel" color="slate" onClick={onClose} />
          <ActionBtn
            label={loading
              ? "Applying…"
              : type === "profit" ? "Apply Profit" : "Apply Loss"}
            color={type === "profit" ? "green" : "red"}
            onClick={handleSubmit}
            disabled={loading || previewAmt <= 0}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminTrades() {
  const [trades,     setTrades]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("open");
  const [selected,   setSelected]   = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrades = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const { data } = await api.get(
        `/api/trades/admin/all?status=${filter === "all" ? "all" : filter}`
      );
      setTrades(data.trades || []);
    } catch {
      toast.error("Failed to load trades.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleUpdate = (id, updatedTrade) => {
    setTrades(prev => prev.map(t => t._id === id ? { ...t, ...updatedTrade } : t));
  };

  // Stats
  const open     = trades.filter(t => t.status === "open").length;
  const closed   = trades.filter(t => t.status === "closed").length;
  const totalVol = trades.reduce((s, t) => s + (t.amount || 0), 0);
  const totalPnl = trades.reduce((s, t) => s + (t.profitLoss || 0), 0);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Trade Management"
          subtitle="Monitor all trades and apply profit / loss adjustments in real time."
        />
        <button
          onClick={() => fetchTrades(false)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open Trades"   value={open}                                        color="blue"   />
        <StatCard label="Closed Trades" value={closed}                                      color="slate"  />
        <StatCard label="Total Volume"  value={`$${totalVol.toLocaleString()}`}             color="purple" />
        <StatCard
          label="Total PnL"
          value={`${totalPnl >= 0 ? "+" : ""}$${Math.abs(totalPnl).toFixed(2)}`}
          color={totalPnl >= 0 ? "green" : "red"}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {["open", "closed", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
              ${filter === f
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trades table */}
      <Table
        headers={["User", "Asset", "Type", "Amount", "Entry", "Current", "PnL", "Status", "Opened", "Action"]}
        loading={loading}
        emptyMsg="No trades found."
      >
        {trades.map(t => {
          const pnl    = t.profitLoss || 0;
          const pnlPos = pnl >= 0;

          return (
            <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">

              {/* User */}
              <td className="px-4 py-3.5">
                <p className="font-semibold text-slate-800 text-sm">{t.userId?.name || "—"}</p>
                <p className="text-xs text-slate-400">{t.userId?.email}</p>
              </td>

              {/* Asset */}
              <td className="px-4 py-3.5">
                <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${ASSET_COLORS[t.asset] || "bg-slate-400"}`} />
                  {t.asset}
                </span>
              </td>

              {/* Direction */}
              <td className="px-4 py-3.5">
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full uppercase
                  ${t.type === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {t.type === "buy" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {t.type}
                </span>
              </td>

              {/* Amount */}
              <td className="px-4 py-3.5 font-semibold text-slate-700 text-sm">
                ${Number(t.amount).toLocaleString()}
              </td>

              {/* Entry */}
              <td className="px-4 py-3.5 text-slate-500 text-sm">
                ${Number(t.entryPrice || 0).toLocaleString()}
              </td>

              {/* Current */}
              <td className="px-4 py-3.5 font-semibold text-slate-800 text-sm">
                ${Number(t.currentPrice || t.entryPrice || 0).toLocaleString()}
              </td>

              {/* PnL */}
              <td className="px-4 py-3.5">
                <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                  ${pnlPos ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  <DollarSign size={10} />
                  {pnlPos ? "+" : ""}{pnl.toFixed(2)}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${t.status === "open"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600"}`}>
                  {t.status === "open" ? "● Open" : "✓ Closed"}
                </span>
              </td>

              {/* Date */}
              <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                {fmt(t.createdAt)}
              </td>

              {/* Action */}
              <td className="px-4 py-3.5">
                {t.status === "open" ? (
                  <ActionBtn
                    label="Adjust"
                    color="blue"
                    onClick={() => setSelected(t)}
                  />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          );
        })}
      </Table>

      {/* Modal */}
      {selected && (
        <AdjustModal
          trade={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}