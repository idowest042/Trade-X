import { useState, useMemo } from "react";
import { Wallet, TrendingUp, TrendingDown, X, Activity, History } from "lucide-react";
import { formatPrice } from "./tradeUtils";
import { Pnl } from "./TradingTerminal";

const ASSET_COLOR = { BTC: "#f7931a", ETH: "#627eea", SOL: "#14f195", BNB: "#f3ba2f" };

export default function HoldingsView({ balance, trades, closing, onCloseTrade, onSelectAsset }) {
  const [tab, setTab] = useState("open"); // "open" | "history"

  const openTrades   = useMemo(() => trades.filter((t) => t.status === "open"), [trades]);
  const closedTrades = useMemo(() => trades.filter((t) => t.status === "closed"), [trades]);

  const unrealizedPnl = useMemo(() => openTrades.reduce((sum, t) => sum + (t.livePnL ?? 0), 0), [openTrades]);
  const realizedPnl   = useMemo(() => closedTrades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0), [closedTrades]);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5"><Wallet size={13} />Available Balance</div>
          <p className="text-xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
            {unrealizedPnl >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}Unrealized PnL
          </div>
          <p className={`text-xl font-extrabold ${unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "'Sora', sans-serif" }}>
            {unrealizedPnl >= 0 ? "+" : ""}${unrealizedPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5">
            {realizedPnl >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}Realized PnL
          </div>
          <p className={`text-xl font-extrabold ${realizedPnl >= 0 ? "text-green-400" : "text-red-400"}`} style={{ fontFamily: "'Sora', sans-serif" }}>
            {realizedPnl >= 0 ? "+" : ""}${realizedPnl.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1.5"><Activity size={13} />Open Positions</div>
          <p className="text-xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{openTrades.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800">
          <button onClick={() => setTab("open")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all ${tab === "open" ? "text-white bg-slate-800/60" : "text-slate-500 hover:text-slate-300"}`}>
            <Activity size={14} /> Open Positions ({openTrades.length})
          </button>
          <button onClick={() => setTab("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all ${tab === "history" ? "text-white bg-slate-800/60" : "text-slate-500 hover:text-slate-300"}`}>
            <History size={14} /> Trade History ({closedTrades.length})
          </button>
        </div>

        {tab === "open" ? (
          openTrades.length === 0 ? (
            <div className="py-14 text-center">
              <Activity size={24} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No open positions. Head to the Market tab to place a trade.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/40 border-b border-slate-800">
                    {["Asset", "Type", "Amount", "Entry Price", "Current Price", "Live PnL", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openTrades.map((t) => (
                    <tr key={t._id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <button onClick={() => onSelectAsset(t.asset)} className="font-bold text-slate-100 flex items-center gap-1.5 hover:text-blue-400 transition-colors" style={{ fontFamily: "'Sora', sans-serif" }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_COLOR[t.asset] }} />{t.asset}
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${t.type === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                          {t.type === "buy" ? "▲" : "▼"} {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-300">${t.amount.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-slate-400">${formatPrice(t.entryPrice)}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-200">${formatPrice(t.currentPrice || t.entryPrice)}</td>
                      <td className="px-4 py-3.5"><Pnl value={t.livePnL ?? 0} /></td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => onCloseTrade(t._id)} disabled={closing === t._id}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                          <X size={12} />{closing === t._id ? "Closing…" : "Close"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : closedTrades.length === 0 ? (
          <div className="py-14 text-center">
            <History size={24} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No closed trades yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/40 border-b border-slate-800">
                  {["Asset", "Type", "Amount", "Entry Price", "Exit Price", "Final PnL", "Closed"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {closedTrades.map((t) => (
                  <tr key={t._id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ASSET_COLOR[t.asset] }} />{t.asset}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${t.type === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {t.type === "buy" ? "▲" : "▼"} {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-300">${t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-400">${formatPrice(t.entryPrice)}</td>
                    <td className="px-4 py-3.5 text-slate-400">${formatPrice(t.currentPrice)}</td>
                    <td className="px-4 py-3.5"><Pnl value={t.profitLoss ?? 0} /></td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {t.closedAt ? new Date(t.closedAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}