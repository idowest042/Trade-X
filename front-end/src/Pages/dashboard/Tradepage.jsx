import { useState, useEffect, useRef, useCallback } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { io }        from "socket.io-client";
import { Activity, DollarSign, AlertCircle, X, TrendingUp, TrendingDown } from "lucide-react";
import { toast }     from "sonner";
import useAuthStore  from "../../stores/useAuthStore";
import api           from "../../lib/api";

const ASSETS      = ["BTC", "ETH", "SOL", "BNB"];
const API_URL     = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ASSET_COLOR = { BTC: "#f97316", ETH: "#6366f1", SOL: "#a855f7", BNB: "#eab308" };

// ─── PnL chip ─────────────────────────────────────────────────────────────────
function Pnl({ value }) {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all duration-300
      ${pos ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {pos ? "+" : ""}${Math.abs(value).toFixed(2)}
    </span>
  );
}

// ─── Candlestick Chart ────────────────────────────────────────────────────────
// Key fix: chartUpdateRef is passed as a stable ref object so the parent
// can call chartUpdateRef.current.update(candle) without stale closures.
function CandleChart({ asset, basePrice, chartUpdateRef }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;

    const chart = createChart(divRef.current, {
      width:  divRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: "#ffffff" },
        textColor:  "#94a3b8",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: "#e2e8f0" },
      timeScale:       { borderColor: "#e2e8f0", timeVisible: true, secondsVisible: false },
      handleScroll:    { mouseWheel: true, pressedMouseMove: true },
      handleScale:     { mouseWheel: true, pinch: true },
    });

    // v4+ API
    const series = chart.addSeries(CandlestickSeries, {
      upColor:        "#22c55e",
      downColor:      "#ef4444",
      borderUpColor:  "#22c55e",
      borderDownColor:"#ef4444",
      wickUpColor:    "#22c55e",
      wickDownColor:  "#ef4444",
    });

    // Seed 80 historical candles so the chart looks populated immediately
    const now  = Math.floor(Date.now() / 1000);
    let   prev = basePrice;
    const seed = Array.from({ length: 80 }, (_, i) => {
      const t = now - (80 - i) * 2;
      const o = prev;
      const c = parseFloat((o + (Math.random() - 0.5) * o * 0.014).toFixed(2));
      const h = parseFloat((Math.max(o, c) * (1 + Math.random() * 0.005)).toFixed(2));
      const l = parseFloat((Math.min(o, c) * (1 - Math.random() * 0.005)).toFixed(2));
      prev = c;
      return { time: t, open: o, high: h, low: l, close: c };
    });
    series.setData(seed);

    // Store update fn in the stable ref passed from parent
    // This never becomes stale because it points to a ref object, not a closure value
    chartUpdateRef.current = (candle) => {
      try { series.update(candle); } catch { /* ignore if chart already removed */ }
    };

    const resize = () => {
      if (divRef.current) chart.applyOptions({ width: divRef.current.clientWidth });
    };
    window.addEventListener("resize", resize);

    return () => {
      chartUpdateRef.current = null; // clear so stale updates don't fire
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  // Only re-run when the asset changes (which remounts via key anyway)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset]);

  return <div ref={divRef} className="w-full rounded-b-xl overflow-hidden" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TradePage() {
  const { user, login, token } = useAuthStore();

  // One stable ref per asset for chart update functions
  // These never become stale — we write directly into ref.current
  const chartRefs = useRef({
    BTC: { current: null },
    ETH: { current: null },
    SOL: { current: null },
    BNB: { current: null },
  });

  // Keep open trades in a ref too so socket handlers always see latest state
  // without needing to be re-registered
  const openTradesRef = useRef([]);

  const [prices,     setPrices]     = useState({ BTC: 67000, ETH: 3500, SOL: 170, BNB: 600 });
  const [asset,      setAsset]      = useState("BTC");
  const [tradeType,  setTradeType]  = useState("buy");
  const [amount,     setAmount]     = useState("");
  const [balance,    setBalance]    = useState(user?.balance ?? 0);
  const [openTrades, setOpenTrades] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [closing,    setClosing]    = useState(null);
  const [live,       setLive]       = useState(false);

  // Keep ref in sync with state so socket handler doesn't go stale
  useEffect(() => { openTradesRef.current = openTrades; }, [openTrades]);

  // ── Socket.IO — registered ONCE, reads from refs ────────────────────────────
  useEffect(() => {
    const sock = io(API_URL, { auth: { token }, transports: ["websocket"] });

    sock.on("connect",    () => setLive(true));
    sock.on("disconnect", () => setLive(false));

    sock.on("market:update", ({ asset: a, candle }) => {
      // 1. Update displayed price ticker
      setPrices(p => ({ ...p, [a]: candle.close }));

      // 2. Push candle to the correct chart via stable ref — no stale closure
      chartRefs.current[a]?.current?.(candle);

      // 3. Recalculate live PnL for every open trade on this asset
      //    Preserve adminOffset so admin adjustments aren't wiped each tick
      setOpenTrades(prev => prev.map(t => {
        if (t.asset !== a || t.status !== "open") return t;

        const priceDelta = candle.close - t.entryPrice;
        const marketPnL  = t.type === "buy"
          ? (priceDelta / t.entryPrice) * t.amount
          : -(priceDelta / t.entryPrice) * t.amount;

        // adminOffset is accumulated from admin adjust events and preserved here
        const total = parseFloat((marketPnL + (t.adminOffset || 0)).toFixed(2));

        return { ...t, currentPrice: candle.close, livePnL: total };
      }));
    });

    // Admin pushed a trade adjustment
    sock.on("trade:update", (updatedTrade) => {
      if (updatedTrade.status === "closed") {
        setOpenTrades(p => p.filter(t => t._id !== updatedTrade._id));
        return;
      }
      // Merge the admin's profitLoss into adminOffset so market ticks
      // continue to move ON TOP of the admin's adjustment
      setOpenTrades(p => p.map(t => {
        if (t._id !== updatedTrade._id) return t;
        return {
          ...t,
          profitLoss:  updatedTrade.profitLoss,
          adminOffset: updatedTrade.profitLoss, // lock admin value as base offset
          livePnL:     updatedTrade.profitLoss,
        };
      }));
      toast.info("📊 Trade updated by admin", {
        description: `New PnL base: ${updatedTrade.profitLoss >= 0 ? "+" : ""}$${updatedTrade.profitLoss?.toFixed(2)}`,
      });
    });

    sock.on("balance:update", (bal) => {
      setBalance(bal);
      if (user) login({ ...user, balance: bal }, token);
    });

    return () => sock.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Load open trades + balance on mount ─────────────────────────────────────
  useEffect(() => {
    api.get("/api/trades/open")
      .then(({ data }) => {
        // Seed adminOffset = profitLoss for any existing open trades
        const seeded = (data.trades || []).map(t => ({
          ...t,
          adminOffset: t.profitLoss || 0,
          livePnL:     t.profitLoss || 0,
        }));
        setOpenTrades(seeded);
      })
      .catch(() => {});

    api.get("/api/auth/me")
      .then(({ data }) => setBalance(data.user?.balance ?? 0))
      .catch(() => {});
  }, []);

  const parsedAmt = parseFloat(amount) || 0;
  const canTrade  = parsedAmt >= 1 && parsedAmt <= balance && !submitting;

  // ── Open trade ───────────────────────────────────────────────────────────────
  const handleOpen = async () => {
    if (!canTrade) return;
    setSubmitting(true);
    const tid = toast.loading("Opening trade…");
    try {
      const { data } = await api.post("/api/trades/open", {
        asset, type: tradeType, amount: parsedAmt,
      });
      toast.success("Trade opened!", {
        id: tid,
        description: `${tradeType.toUpperCase()} ${asset} @ $${prices[asset]?.toLocaleString()}`,
      });
      // Seed adminOffset = 0 for brand new trade
      setOpenTrades(p => [{
        ...data.trade,
        adminOffset: 0,
        livePnL:     0,
      }, ...p]);
      setBalance(b => parseFloat((b - parsedAmt).toFixed(2)));
      setAmount("");
    } catch (err) {
      toast.error("Failed to open", { id: tid, description: err.response?.data?.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close trade ──────────────────────────────────────────────────────────────
  const handleClose = async (id) => {
    setClosing(id);
    const tid = toast.loading("Closing trade…");
    try {
      const { data } = await api.post("/api/trades/close", { tradeId: id });
      const pnl = data.trade.profitLoss;
      toast.success("Trade closed!", {
        id: tid,
        description: `Final PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`,
      });
      setOpenTrades(p => p.filter(t => t._id !== id));
      setBalance(data.newBalance);
    } catch (err) {
      toast.error("Failed to close", { id: tid, description: err.response?.data?.message });
    } finally {
      setClosing(null);
    }
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
              Live Trading
            </h1>
            <p className="text-sm text-slate-500 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Simulated market · candles update every 2 seconds automatically.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
              ${live
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-slate-50 border-slate-200 text-slate-400"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
              {live ? "Live" : "Connecting…"}
            </span>
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2">
              <DollarSign size={13} className="text-blue-500" />
              <span className="text-sm font-bold text-blue-700" style={{ fontFamily: "'Sora', sans-serif" }}>
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* ── Asset selector ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {ASSETS.map(a => (
            <button key={a} onClick={() => setAsset(a)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all
                ${asset === a
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ASSET_COLOR[a] }} />
              {a}
              <span className={`text-xs ${asset === a ? "text-slate-400" : "text-slate-500"}`}>
                ${(prices[a] || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* ── Chart + Trade panel ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Activity size={15} className="text-blue-600" />
                <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {asset}/USD
                </span>
                <span className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  ${(prices[asset] || 0).toLocaleString()}
                </span>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                ● Auto-updating
              </span>
            </div>
            <div className="p-2">
              {/*
                key={asset} remounts component when asset changes.
                chartRefs.current[asset] is the stable ref object we pass in.
                The chart writes its update fn into chartRefs.current[asset].current
                so socket handlers can call it without stale closures.
              */}
              <CandleChart
                key={asset}
                asset={asset}
                basePrice={prices[asset]}
                chartUpdateRef={chartRefs.current[asset]}
              />
            </div>
          </div>

          {/* Trade Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4">
            <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              Place Trade
            </p>

            {/* Asset dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Asset
              </label>
              <select value={asset} onChange={e => setAsset(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {ASSETS.map(a => (
                  <option key={a} value={a}>{a} — ${(prices[a] || 0).toLocaleString()}</option>
                ))}
              </select>
            </div>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-2">
              {[["buy", "▲ Buy"], ["sell", "▼ Sell"]].map(([v, l]) => (
                <button key={v} onClick={() => setTradeType(v)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all
                    ${tradeType === v
                      ? v === "buy"
                        ? "bg-green-600 text-white shadow-lg shadow-green-200"
                        : "bg-red-500 text-white shadow-lg shadow-red-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number" min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
              <p className="text-xs text-slate-400 text-right" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Balance: <span className="font-semibold text-slate-600">${balance.toFixed(2)}</span>
              </p>
            </div>

            {/* Entry price preview */}
            <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
              <span className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Entry Price
              </span>
              <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
                ${(prices[asset] || 0).toLocaleString()}
              </span>
            </div>

            {balance < 1 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                <p className="text-xs text-amber-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Deposit funds to start trading.
                </p>
              </div>
            )}

            <button onClick={handleOpen} disabled={!canTrade}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg
                disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none
                ${tradeType === "buy"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                  : "bg-red-500 hover:bg-red-600 shadow-red-200"}`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {submitting
                ? "Opening…"
                : `${tradeType === "buy" ? "▲ Buy" : "▼ Sell"} ${asset}`}
            </button>
          </div>
        </div>

        {/* ── Open Trades Table ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Activity size={15} className="text-blue-600" />
            <p className="text-sm font-bold text-slate-800" style={{ fontFamily: "'Sora', sans-serif" }}>
              Open Trades
            </p>
            {openTrades.length > 0 && (
              <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                {openTrades.length}
              </span>
            )}
          </div>

          {openTrades.length === 0 ? (
            <div className="py-14 text-center">
              <Activity size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No open trades. Place a trade above to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Asset", "Type", "Amount", "Entry Price", "Current Price", "Live PnL", "Action"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {openTrades.map(t => {
                    // livePnL = market movement + adminOffset combined
                    const pnl = t.livePnL ?? 0;
                    return (
                      <tr key={t._id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5"
                            style={{ fontFamily: "'Sora', sans-serif" }}>
                            <span className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ASSET_COLOR[t.asset] }} />
                            {t.asset}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase
                            ${t.type === "buy"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"}`}>
                            {t.type === "buy" ? "▲" : "▼"} {t.type}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          ${t.amount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-slate-500">
                          ${(t.entryPrice || 0).toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          ${(t.currentPrice || prices[t.asset] || t.entryPrice || 0).toLocaleString()}
                        </td>

                        {/* Live PnL — updates every 2s from market ticks */}
                        <td className="px-4 py-3.5">
                          <Pnl value={pnl} />
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleClose(t._id)}
                            disabled={closing === t._id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            <X size={12} />
                            {closing === t._id ? "Closing…" : "Close"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}