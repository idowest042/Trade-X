import { useState, useEffect, useRef } from "react";
import { createChart, CandlestickSeries, LineSeries } from "lightweight-charts";
import {
  Activity, DollarSign, AlertCircle, X, TrendingUp, TrendingDown,
  BarChart3, LineChart as LineChartIcon, BookOpen, History, Star,
} from "lucide-react";
import {
  TRADEABLE_SYMBOLS, formatPrice, toggleFavorite, getFavorites,
} from "./tradeUtils";

const ASSET_COLOR = { BTC: "#f7931a", ETH: "#627eea", SOL: "#14f195", BNB: "#f3ba2f" };

const TIMEFRAMES = [
  { label: "Live", seconds: 2 },
  { label: "1m",   seconds: 60 },
  { label: "5m",   seconds: 300 },
  { label: "15m",  seconds: 900 },
];

function aggregateCandles(raw, bucketSeconds) {
  if (!raw.length) return [];
  if (bucketSeconds <= 2) return raw;
  const map = new Map();
  for (const c of raw) {
    const bt = Math.floor(c.time / bucketSeconds) * bucketSeconds;
    const existing = map.get(bt);
    if (!existing) {
      map.set(bt, { time: bt, open: c.open, high: c.high, low: c.low, close: c.close });
    } else {
      existing.high  = Math.max(existing.high, c.high);
      existing.low   = Math.min(existing.low, c.low);
      existing.close = c.close;
    }
  }
  return Array.from(map.values()).sort((a, b) => a.time - b.time);
}

// ─── PnL chip ─────────────────────────────────────────────────────────────────
export function Pnl({ value }) {
  const pos = value >= 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
      ${pos ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
      {pos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {pos ? "+" : ""}${Math.abs(value).toFixed(2)}
    </span>
  );
}

// ─── Order Book (cosmetic depth ladder — no real order-book endpoint exists) ──
function OrderBookPanel({ price }) {
  const [rows, setRows] = useState({ asks: [], bids: [] });
  useEffect(() => {
    if (!price) return;
    const step = price * 0.00035;
    const asks = Array.from({ length: 9 }, (_, i) => ({
      price: price + step * (i + 1) * (1 + Math.random() * 0.3),
      size:  +(Math.random() * 2.5 + 0.02).toFixed(4),
    })).sort((a, b) => b.price - a.price);
    const bids = Array.from({ length: 9 }, (_, i) => ({
      price: price - step * (i + 1) * (1 + Math.random() * 0.3),
      size:  +(Math.random() * 2.5 + 0.02).toFixed(4),
    })).sort((a, b) => b.price - a.price);
    setRows({ asks, bids });
  }, [price]);

  const maxSize = Math.max(1, ...rows.asks.map((r) => r.size), ...rows.bids.map((r) => r.size));

  return (
    <div className="flex flex-col h-full text-[11px]">
      <div className="grid grid-cols-2 px-3 py-1.5 uppercase tracking-wide text-slate-500 border-b border-slate-800">
        <span>Price (USD)</span><span className="text-right">Size</span>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {rows.asks.map((r, i) => (
          <div key={`a${i}`} className="relative grid grid-cols-2 px-2 py-[3px]">
            <div className="absolute inset-y-0 right-0 bg-red-500/10" style={{ width: `${(r.size / maxSize) * 100}%` }} />
            <span className="relative text-red-400 font-medium">{formatPrice(r.price)}</span>
            <span className="relative text-right text-slate-300">{r.size}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 text-center text-sm font-bold text-white border-y border-slate-800 bg-slate-800/40">
        {price ? formatPrice(price) : "—"}
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {rows.bids.map((r, i) => (
          <div key={`b${i}`} className="relative grid grid-cols-2 px-2 py-[3px]">
            <div className="absolute inset-y-0 right-0 bg-green-500/10" style={{ width: `${(r.size / maxSize) * 100}%` }} />
            <span className="relative text-green-400 font-medium">{formatPrice(r.price)}</span>
            <span className="relative text-right text-slate-300">{r.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Recent Trades (side derived from real tick direction) ───────────────────
function RecentTradesPanel({ price, asset }) {
  const [trades, setTrades] = useState([]);
  const prevRef = useRef(price);

  useEffect(() => { setTrades([]); prevRef.current = price; }, [asset]); // eslint-disable-line

  useEffect(() => {
    if (price == null) return;
    const side = price >= prevRef.current ? "buy" : "sell";
    prevRef.current = price;
    setTrades((prev) => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, price, side, size: +(Math.random() * 1.4 + 0.01).toFixed(4), time: new Date() },
      ...prev,
    ].slice(0, 24));
  }, [price]); // eslint-disable-line

  return (
    <div className="flex flex-col h-full text-[11px]">
      <div className="grid grid-cols-3 px-3 py-1.5 uppercase tracking-wide text-slate-500 border-b border-slate-800">
        <span>Price</span><span className="text-right">Size</span><span className="text-right">Time</span>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {trades.length === 0 ? (
          <p className="text-center text-slate-500 py-6">Waiting for trades…</p>
        ) : trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 px-2 py-[3px]">
            <span className={t.side === "buy" ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
              {formatPrice(t.price)}
            </span>
            <span className="text-right text-slate-300">{t.size}</span>
            <span className="text-right text-slate-500">
              {t.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Candlestick Chart ────────────────────────────────────────────────────────
// chartUpdateRef is a stable ref object the parent (TradeHub) owns and feeds
// from the single shared socket connection — same contract as before.
function CandleChart({ asset, basePrice, chartUpdateRef, chartType, timeframeSeconds }) {
  const divRef          = useRef(null);
  const candleSeriesRef = useRef(null);
  const lineSeriesRef   = useRef(null);
  const rawRef          = useRef([]);
  const lastRawTimeRef  = useRef(0);
  const aggBucketsRef   = useRef(new Map());
  const timeframeRef    = useRef(timeframeSeconds);

  const rebuildAggregation = () => {
    if (!candleSeriesRef.current) return;
    const buckets = aggregateCandles(rawRef.current, timeframeRef.current);
    aggBucketsRef.current = new Map(buckets.map((b) => [b.time, b]));
    candleSeriesRef.current.setData(buckets);
    lineSeriesRef.current.setData(buckets.map((b) => ({ time: b.time, value: b.close })));
  };

  useEffect(() => {
    timeframeRef.current = timeframeSeconds;
    rebuildAggregation();
  }, [timeframeSeconds]); // eslint-disable-line

  useEffect(() => {
    candleSeriesRef.current?.applyOptions?.({ visible: chartType === "candles" });
    lineSeriesRef.current?.applyOptions?.({ visible: chartType === "line" });
  }, [chartType]);

  useEffect(() => {
    if (!divRef.current) return;

    const chart = createChart(divRef.current, {
      width:  divRef.current.clientWidth,
      height: 420,
      layout: { background: { color: "transparent" }, textColor: "#94a3b8" },
      grid: { vertLines: { color: "#1e293b" }, horzLines: { color: "#1e293b" } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: "#1e293b" },
      timeScale:       { borderColor: "#1e293b", timeVisible: true, secondsVisible: false },
      handleScroll:    { mouseWheel: true, pressedMouseMove: true },
      handleScale:     { mouseWheel: true, pinch: true },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e", downColor: "#ef4444",
      borderUpColor: "#22c55e", borderDownColor: "#ef4444",
      wickUpColor: "#22c55e", wickDownColor: "#ef4444",
      visible: chartType === "candles",
    });
    const lineSeries = chart.addSeries(LineSeries, { color: "#3b82f6", lineWidth: 2, visible: chartType === "line" });

    candleSeriesRef.current = candleSeries;
    lineSeriesRef.current   = lineSeries;

    const nowSec  = Math.floor(Date.now() / 1000);
    const seedEnd = nowSec - 2;
    let   prev    = basePrice;
    const seed = Array.from({ length: 150 }, (_, i) => {
      const t = seedEnd - (150 - i) * 2;
      const o = prev;
      const c = parseFloat((o + (Math.random() - 0.5) * o * 0.014).toFixed(2));
      const h = parseFloat((Math.max(o, c) * (1 + Math.random() * 0.005)).toFixed(2));
      const l = parseFloat((Math.min(o, c) * (1 - Math.random() * 0.005)).toFixed(2));
      prev = c;
      return { time: t, open: o, high: h, low: l, close: c };
    });
    rawRef.current = seed;
    lastRawTimeRef.current = seed[seed.length - 1].time;
    rebuildAggregation();

    chartUpdateRef.current = (candle) => {
      if (candle.time < lastRawTimeRef.current) return;
      if (candle.time === lastRawTimeRef.current) {
        rawRef.current[rawRef.current.length - 1] = candle;
      } else {
        rawRef.current.push(candle);
        if (rawRef.current.length > 6000) rawRef.current.shift();
        lastRawTimeRef.current = candle.time;
      }
      const bucketSize = timeframeRef.current;
      const bucketTime = bucketSize <= 2 ? candle.time : Math.floor(candle.time / bucketSize) * bucketSize;
      const existing   = aggBucketsRef.current.get(bucketTime);
      const bucket = existing
        ? { time: bucketTime, open: existing.open, high: Math.max(existing.high, candle.high), low: Math.min(existing.low, candle.low), close: candle.close }
        : { time: bucketTime, open: candle.open, high: candle.high, low: candle.low, close: candle.close };
      aggBucketsRef.current.set(bucketTime, bucket);
      candleSeries.update(bucket);
      lineSeries.update({ time: bucket.time, value: bucket.close });
    };

    const resize = () => { if (divRef.current) chart.applyOptions({ width: divRef.current.clientWidth }); };
    window.addEventListener("resize", resize);

    return () => {
      chartUpdateRef.current = null;
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [asset]); // eslint-disable-line

  return <div ref={divRef} className="w-full h-full rounded-b-xl overflow-hidden" />;
}

// ─── Main Trading Terminal ─────────────────────────────────────────────────────
// Single-pair focused trading view. All backend interaction is handled by
// the parent (TradeHub) — this component only calls the callbacks it's given.
export default function TradingTerminal({
  asset, coinMeta, prices, sessionStats, chartRef,
  balance, myOpenTradesForAsset,
  submitting, closing, live,
  onSelectAsset, onOpenTrade, onCloseTrade,
}) {
  const [tradeType,  setTradeType]  = useState("buy");
  const [amount,     setAmount]     = useState("");
  const [orderType,  setOrderType]  = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [chartType,  setChartType]  = useState("candles");
  const [timeframe,  setTimeframe]  = useState(2);
  const [rightTab,   setRightTab]   = useState("book");
  const [favorites,  setFavorites]  = useState(getFavorites());

  const price = prices[asset] || 0;
  const parsedAmt = parseFloat(amount) || 0;
  const canTrade  = parsedAmt >= 1 && parsedAmt <= balance && !submitting;
  const stats = sessionStats[asset];
  const chg = stats && stats.open ? ((price - stats.open) / stats.open) * 100 : 0;

  const applyPercent = (pct) => {
    if (!balance) return;
    const val = (balance * pct) / 100;
    setAmount(val > 0 ? val.toFixed(2) : "");
  };

  const handleFavorite = () => setFavorites(toggleFavorite(asset));

  const submit = () => {
    if (orderType === "limit") return; // guarded by disabled state too
    onOpenTrade({ asset, type: tradeType, amount: parsedAmt });
    setAmount("");
  };

  return (
    <div className="space-y-4">
      {/* Pair header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={handleFavorite} className="text-slate-500 hover:text-amber-400 transition-colors">
            <Star size={18} fill={favorites.includes(asset) ? "#fbbf24" : "none"} className={favorites.includes(asset) ? "text-amber-400" : ""} />
          </button>
          {coinMeta?.image ? (
            <img src={coinMeta.image} alt={asset} className="w-7 h-7 rounded-full" />
          ) : (
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: ASSET_COLOR[asset] }}>
              {asset[0]}
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{asset}/USD</span>
            <span className="text-xs text-slate-500">{coinMeta?.name || asset}</span>
          </div>
          <span className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            ${formatPrice(price)}
          </span>
          <span className={`text-sm font-bold px-2 py-1 rounded-lg ${chg >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {chg >= 0 ? "+" : ""}{chg.toFixed(2)}%
          </span>
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
            {coinMeta?.high24h != null && (
              <span title="Real market data from CoinGecko">
                24h High <span className="text-slate-200 font-semibold">${formatPrice(coinMeta.high24h)}</span>
              </span>
            )}
            {coinMeta?.low24h != null && (
              <span title="Real market data from CoinGecko">
                24h Low <span className="text-slate-200 font-semibold">${formatPrice(coinMeta.low24h)}</span>
              </span>
            )}
            <span title="This platform's simulated trading engine, since you opened this page">
              Session High <span className="text-slate-200 font-semibold">${formatPrice(stats?.high || price)}</span>
            </span>
            <span title="This platform's simulated trading engine, since you opened this page">
              Session Low <span className="text-slate-200 font-semibold">${formatPrice(stats?.low || price)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick pair switch — only the 4 tradeable assets */}
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
            {TRADEABLE_SYMBOLS.map((s) => (
              <button key={s} onClick={() => onSelectAsset(s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${asset === s ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
            {TIMEFRAMES.map((tf) => (
              <button key={tf.label} onClick={() => setTimeframe(tf.seconds)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${timeframe === tf.seconds ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {tf.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-lg p-1">
            <button onClick={() => setChartType("candles")} className={`p-1.5 rounded-md transition-all ${chartType === "candles" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              <BarChart3 size={15} />
            </button>
            <button onClick={() => setChartType("line")} className={`p-1.5 rounded-md transition-all ${chartType === "line" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              <LineChartIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Chart + Order Book/Trades + Order Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity size={13} className="text-blue-400" /> {asset}/USD Chart
            </span>
            <span className={`text-[10px] px-2 py-1 rounded-lg font-semibold border
              ${live ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"}`}>
              ● {live ? "Auto-updating" : "Connecting…"}
            </span>
          </div>
          <div className="p-2 flex-1">
            <CandleChart key={asset} asset={asset} basePrice={price} chartUpdateRef={chartRef} chartType={chartType} timeframeSeconds={timeframe} />
          </div>
        </div>

        <div className="xl:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[380px] xl:h-auto">
          <div className="flex border-b border-slate-800">
            <button onClick={() => setRightTab("book")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${rightTab === "book" ? "text-white bg-slate-800/60" : "text-slate-500 hover:text-slate-300"}`}>
              <BookOpen size={13} /> Order Book
            </button>
            <button onClick={() => setRightTab("trades")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${rightTab === "trades" ? "text-white bg-slate-800/60" : "text-slate-500 hover:text-slate-300"}`}>
              <History size={13} /> Trades
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {rightTab === "book" ? <OrderBookPanel price={price} /> : <RecentTradesPanel price={price} asset={asset} />}
          </div>
        </div>

        <div className="xl:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3.5">
          <p className="text-sm font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Place Order</p>

          <div className="grid grid-cols-2 gap-2 bg-slate-800/60 rounded-xl p-1">
            <button onClick={() => setOrderType("market")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === "market" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              Market
            </button>
            <button onClick={() => setOrderType("limit")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${orderType === "limit" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              Limit <span className="ml-1 text-[9px] text-amber-400 align-top">SOON</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[["buy", "▲ Buy"], ["sell", "▼ Sell"]].map(([v, l]) => (
              <button key={v} onClick={() => setTradeType(v)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all
                  ${tradeType === v
                    ? v === "buy" ? "bg-green-600 text-white shadow-lg shadow-green-950/50" : "bg-red-500 text-white shadow-lg shadow-red-950/50"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Amount (USD)</label>
              <span className="text-[10px] text-slate-500">Bal: <span className="text-slate-300 font-semibold">${balance.toFixed(2)}</span></span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button key={pct} onClick={() => applyPercent(pct)} className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-all">
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {orderType === "limit" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Limit Price (USD)</label>
              <input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder={formatPrice(price)}
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p className="text-[10px] text-amber-400">Limit execution isn't live yet — switch to Market to trade now.</p>
            </div>
          )}

          <div className="bg-slate-800/40 rounded-xl px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-slate-500">Entry Price</span>
            <span className="text-sm font-bold text-slate-100" style={{ fontFamily: "'Sora', sans-serif" }}>${formatPrice(price)}</span>
          </div>

          {balance < 1 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-400">Deposit funds to start trading.</p>
            </div>
          )}

          <button onClick={submit} disabled={orderType === "limit" || !canTrade}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg
              disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none
              ${tradeType === "buy" ? "bg-green-600 hover:bg-green-700 shadow-green-950/50" : "bg-red-500 hover:bg-red-600 shadow-red-950/50"}`}>
            {submitting ? "Opening…" : orderType === "limit" ? "Switch to Market to trade" : `${tradeType === "buy" ? "▲ Buy" : "▼ Sell"} ${asset}`}
          </button>
        </div>
      </div>

      {/* Open positions for THIS asset — full portfolio lives in Holdings */}
      {myOpenTradesForAsset.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800 flex items-center gap-2">
            <Activity size={14} className="text-blue-400" />
            <p className="text-sm font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Your {asset} Positions</p>
            <span className="ml-auto text-xs font-bold bg-blue-500/15 text-blue-300 px-2.5 py-0.5 rounded-full">{myOpenTradesForAsset.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/40 border-b border-slate-800">
                  {["Type", "Amount", "Entry Price", "Current Price", "Live PnL", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myOpenTradesForAsset.map((t) => (
                  <tr key={t._id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${t.type === "buy" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                        {t.type === "buy" ? "▲" : "▼"} {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-300">${t.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400">${formatPrice(t.entryPrice)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-200">${formatPrice(t.currentPrice || price)}</td>
                    <td className="px-4 py-3"><Pnl value={t.livePnL ?? 0} /></td>
                    <td className="px-4 py-3">
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
        </div>
      )}
    </div>
  );
}