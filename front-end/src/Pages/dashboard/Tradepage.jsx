import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DollarSign, LayoutGrid, Sprout, Wallet, Search } from "lucide-react";
import { toast }     from "sonner";
import useAuthStore  from "../../stores/useauthstore";
import api           from "../../lib/api";
import { getSocket } from "../../stores/socket";
import { TRADEABLE_SYMBOLS } from "./tradeUtils";

import useMarketData    from "./useMarketData.js";
import MarketView       from "./MarketView";
import CoinDetailView   from "./CoinDetailView";
import HoldingsView     from "./HoldingsView";
import FarmView         from "./FarmView";

const NAV_TABS = [
  { id: "market",   label: "Market",   icon: LayoutGrid },
  { id: "farm",     label: "Farm",     icon: Sprout },
  { id: "holdings", label: "Holdings", icon: Wallet }, 
];

export default function TradeHub() {
  const { user, token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("view") || "market";
  const coin = searchParams.get("coin") || "";

  const setView = (v) => setSearchParams((p) => { const n = new URLSearchParams(p); n.set("view", v); n.delete("coin"); return n; });
  const selectCoin = (symbol) => setSearchParams((p) => { const n = new URLSearchParams(p); n.set("view", "market"); n.set("coin", symbol); return n; });
  const backToMarket = () => setSearchParams((p) => { const n = new URLSearchParams(p); n.delete("coin"); return n; });

  // One stable ref per tradeable asset for chart update functions.
  const chartRefs = useRef(Object.fromEntries(TRADEABLE_SYMBOLS.map((s) => [s, { current: null }])));
  const tradesRef = useRef([]);

  const [prices, setPrices]     = useState({ BTC: 67000, ETH: 3500, SOL: 170, BNB: 600 });
  const [sessionStats, setSessionStats] = useState({});
  const [balance, setBalance]   = useState(user?.balance ?? 0);
  const [trades, setTrades]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing]   = useState(null);
  const [live, setLive]         = useState(false);

  const { coins, loading: marketLoading, error: marketError, isFallback, isStale } = useMarketData();

  useEffect(() => { tradesRef.current = trades; }, [trades]);

  // ── Socket.IO — one shared connection for the whole Trade Hub ──────────────
  useEffect(() => {
    const sock = getSocket(token);

    const onMarketUpdate = ({ asset: a, candle }) => {
      setPrices((p) => ({ ...p, [a]: candle.close }));
      chartRefs.current[a]?.current?.(candle);

      setSessionStats((prev) => {
        const s = prev[a];
        if (!s) return { ...prev, [a]: { open: candle.close, high: candle.close, low: candle.close } };
        return { ...prev, [a]: { open: s.open, high: Math.max(s.high, candle.close), low: Math.min(s.low, candle.close) } };
      });

      setTrades((prev) => prev.map((t) => {
        if (t.asset !== a || t.status !== "open") return t;
        const priceDelta = candle.close - t.entryPrice;
        const marketPnL  = t.type === "buy" ? (priceDelta / t.entryPrice) * t.amount : -(priceDelta / t.entryPrice) * t.amount;
        const total = parseFloat((marketPnL + (t.adminOffset || 0)).toFixed(2));
        return { ...t, currentPrice: candle.close, livePnL: total };
      }));
    };

    const onTradeUpdate = (updatedTrade) => {
      setTrades((prev) => prev.map((t) => {
        if (t._id !== updatedTrade._id) return t;
        if (updatedTrade.status === "closed" || updatedTrade.closed) {
          return { ...t, ...updatedTrade, status: "closed" };
        }
        return { ...t, profitLoss: updatedTrade.profitLoss, adminOffset: updatedTrade.profitLoss, livePnL: updatedTrade.profitLoss };
      }));
      toast.info("📊 Trade updated by admin", {
        description: `New PnL base: ${updatedTrade.profitLoss >= 0 ? "+" : ""}$${updatedTrade.profitLoss?.toFixed(2)}`,
      });
    };

    const onBalanceUpdate = (bal) => setBalance(bal);
    const onConnect    = () => setLive(true);
    const onDisconnect = () => setLive(false);
    const onReconnect  = () => setLive(true);

    sock.on("connect",        onConnect);
    sock.on("disconnect",     onDisconnect);
    sock.on("reconnect",      onReconnect);
    sock.on("market:update",  onMarketUpdate);
    sock.on("trade:update",   onTradeUpdate);
    sock.on("balance:update", onBalanceUpdate);
    setLive(sock.connected);

    return () => {
      sock.off("connect",        onConnect);
      sock.off("disconnect",     onDisconnect);
      sock.off("reconnect",      onReconnect);
      sock.off("market:update",  onMarketUpdate);
      sock.off("trade:update",   onTradeUpdate);
      sock.off("balance:update", onBalanceUpdate);
    };
  }, [token]);

  // ── Load trades (open + closed, up to 100) + balance on mount ──────────────
  useEffect(() => {
    api.get("/api/trades/my")
      .then(({ data }) => {
        const seeded = (data.trades || []).map((t) => ({
          ...t,
          adminOffset: t.profitLoss || 0,
          livePnL:     t.profitLoss || 0,
        }));
        setTrades(seeded);
      })
      .catch(() => {});

    api.get("/api/auth/me")
      .then(({ data }) => setBalance(data.user?.balance ?? 0))
      .catch(() => {});
  }, []);

  // ── Open trade — unchanged backend contract ─────────────────────────────────
  const handleOpenTrade = async ({ asset, type, amount }) => {
    const parsedAmt = parseFloat(amount) || 0;
    if (parsedAmt < 1 || parsedAmt > balance) return;
    setSubmitting(true);
    const tid = toast.loading("Opening trade…");
    try {
      const { data } = await api.post("/api/trades/open", { asset, type, amount: parsedAmt });
      toast.success("Trade opened!", { id: tid, description: `${type.toUpperCase()} ${asset} @ $${prices[asset]?.toLocaleString()}` });
      setTrades((p) => [{ ...data.trade, adminOffset: 0, livePnL: 0 }, ...p]);
      setBalance((b) => parseFloat((b - parsedAmt).toFixed(2)));
    } catch (err) {
      toast.error("Failed to open", { id: tid, description: err.response?.data?.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Close trade — unchanged backend contract ────────────────────────────────
  const handleCloseTrade = async (id) => {
    setClosing(id);
    const tid = toast.loading("Closing trade…");
    try {
      const { data } = await api.post("/api/trades/close", { tradeId: id });
      const pnl = data.trade.profitLoss;
      toast.success("Trade closed!", { id: tid, description: `Final PnL: ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}` });
      setTrades((p) => p.map((t) => (t._id === id ? { ...t, ...data.trade, status: "closed" } : t)));
      setBalance(data.newBalance);
    } catch (err) {
      toast.error("Failed to close", { id: tid, description: err.response?.data?.message });
    } finally {
      setClosing(null);
    }
  };

  const marketCoinFor = (symbol) => coins.find((c) => c.symbol === symbol);
  const openTradesForAsset = (symbol) => trades.filter((t) => t.asset === symbol && t.status === "open");

  return (
    <>
      {/*
        Font loading moved OUT of this component entirely — see the
        <link> tags added to index.html. An inline <style>@import</style>
        injected by React on mount loses the network race almost every
        time, silently falling back to the system font. That's why the
        headings looked "fake" — they mostly weren't rendering Sora at all.
      */}
      <div className="max-w-[1600px] mx-auto bg-slate-950 text-slate-100 rounded-2xl p-3 sm:p-5 space-y-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Trade</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Live market · candles update every 2 seconds automatically.</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border
              ${live ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-slate-800/60 border-slate-700 text-slate-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-slate-500"}`} />
              {live ? "Live" : "Connecting…"}
            </span>
            <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2">
              <DollarSign size={13} className="text-blue-400" />
              <span className="text-sm font-bold text-blue-300" style={{ fontFamily: "'Sora', sans-serif" }}>
                ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Top nav */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 w-fit">
            {NAV_TABS.map((t) => {
              const Icon = t.icon;
              const active = view === t.id;
              return (
                <button key={t.id} onClick={() => setView(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    ${active ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                  <Icon size={15} />{t.label}
                </button>
              );
            })}
          </div>
          {view !== "market" && (
            <button onClick={() => setView("market")}
              title="Search coins"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all">
              <Search size={16} />
            </button>
          )}
        </div>

        {/* Views */}
        {view === "market" && (
          coin ? (
            <CoinDetailView
              symbol={coin}
              marketCoin={marketCoinFor(coin)}
              prices={prices}
              sessionStats={sessionStats}
              chartRef={chartRefs.current[coin]}
              balance={balance}
              myOpenTradesForAsset={openTradesForAsset(coin)}
              submitting={submitting}
              closing={closing}
              live={live}
              onBack={backToMarket}
              onSelectAsset={selectCoin}
              onOpenTrade={handleOpenTrade}
              onCloseTrade={handleCloseTrade}
            />
          ) : (
            <MarketView
              coins={coins}
              loading={marketLoading}
              error={marketError}
              isFallback={isFallback}
              isStale={isStale}
              onSelectCoin={selectCoin}
            />
          )
        )}

        {view === "farm" && (
          <FarmView balance={balance} onBalanceChange={setBalance} />
        )}

        {view === "holdings" && (
          <HoldingsView
            balance={balance}
            trades={trades}
            closing={closing}
            onCloseTrade={handleCloseTrade}
            onSelectAsset={selectCoin}
          />
        )}
      </div>
    </>
  );
}